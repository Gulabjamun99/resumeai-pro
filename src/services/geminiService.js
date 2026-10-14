/**
 * RESUMEAI PRO — ADVANCED GEMINI AI ENGINE
 * Powered by Google Gemini 2.5 Flash
 * 
 * Supports:
 * 1. Direct Client Integration with Gemini 2.5 Flash via VITE_GEMINI_API_KEY
 * 2. Automatic Fallback to Server-Side Route (/api/cv/update)
 * 3. Human-like Conversational AI Career & Resume Guide (ChatGPT / Gemini style)
 * 4. Dynamic ATS Bullet & Summary Enhancement
 * 5. Robust Fallback to deterministic local engine if network fails
 */

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash'
];

let currentKeyIndex = 0;

function getApiKeys() {
  const raw = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEYS) ||
              (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
              (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEYS) || 
              (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) || 
              (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
  return raw.split(/[,;\s]+/).map(k => k.trim()).filter(Boolean);
}

/**
 * Core Gemini API Caller
 * Supports single-turn or multi-turn chat contents with multi-model fallback & multi-key rotation
 */
export async function callGeminiApi(promptText, systemInstruction = "", chatHistory = [], customConfig = {}) {
  const apiKeys = getApiKeys();

  // Try direct Gemini API across candidate keys and models
  if (apiKeys.length > 0) {
    // Try up to all available keys in round-robin fashion
    const keysToTry = [...apiKeys];
    for (let kIdx = 0; kIdx < keysToTry.length; kIdx++) {
      const apiKey = keysToTry[(currentKeyIndex + kIdx) % keysToTry.length];

      for (const model of CANDIDATE_MODELS) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const contents = [];

            let finalPrompt = promptText;
            if (chatHistory && chatHistory.length > 0) {
              const recentTurns = chatHistory.slice(-4).map(m => {
                const role = m.sender === 'user' ? 'User' : 'AI Assistant';
                return `${role}: ${m.text?.slice(0, 300) || ''}`;
              }).join('\n');
              finalPrompt = `Recent Conversation Context:\n${recentTurns}\n\nCurrent Task/Message:\n${promptText}`;
            }

            if (systemInstruction) {
              contents.push({
                role: 'user',
                parts: [{ text: `System Instruction / Guiding Rules:\n${systemInstruction}\n\nTask:\n${finalPrompt}` }]
              });
            } else {
              contents.push({
                role: 'user',
                parts: [{ text: finalPrompt }]
              });
            }

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents,
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 8192,
                  ...customConfig
                }
              }),
              signal: AbortSignal.timeout(25000)
            });

            if (response.ok) {
              const data = await response.json();
              const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                currentKeyIndex = (currentKeyIndex + kIdx) % keysToTry.length;
                return candidateText;
              }
            }

            if (response.status === 429) {
              console.warn(`Gemini (${model}) 429 rate limit hit. Trying next...`);
              break;
            }

            if (response.status >= 500 && attempt === 0) {
              console.warn(`Gemini (${model}) temporary server error ${response.status}. Retrying once...`);
              await new Promise(r => setTimeout(r, 600));
              continue;
            }

            console.warn(`Gemini model ${model} returned ${response.status}. Trying next candidate model...`);
            break;
          } catch (err) {
            console.warn(`Gemini model ${model} attempt ${attempt + 1} error:`, err.message);
            if (attempt === 0) {
              await new Promise(r => setTimeout(r, 500));
            }
          }
        }
      }
    }
  }

  // Fallback to backend server route
  try {
    const response = await fetch('/api/cv/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText, systemInstruction })
    });

    if (response.ok) {
      const data = await response.json();
      return data.resultText || null;
    }
  } catch (err) {
    console.warn("Server AI API fallback failed:", err.message);
  }

  return null;
}

/**
 * Intelligent Conversational Assistant for Live Studio Chat
 * Responds in natural, warm, helpful Hinglish/English just like ChatGPT/Gemini
 */
export async function getGeminiChatResponse(userMessage, currentCv, diffContext = null, chatHistory = []) {
  const systemInstruction = `You are the lead AI Career Mentor and Executive Resume Architect at ResumeAI Pro.
You talk directly to the user just like ChatGPT, Claude, or Google Gemini.
The user is conversing with you about their resume, asking what changes were made, requesting edits, or asking for career advice.
Respond in a friendly, conversational, intelligent, and CRISP tone (using conversational Hinglish or English matching the user's language).

CRITICAL CONVERSATIONAL RULES:
1. TALK LIKE A REAL AI CAREER PARTNER: Be warm, intelligent, and highly supportive. Acknowledge what the user said naturally.
2. SUBSTANTIVE & EMPOWERING: Give thoughtful, high-value career insights. Avoid generic clichés.
3. NEVER DISMISSIVE OR RIGID: Never say "resume is already perfect" or "no changes needed" when a user asks how to improve or showcase their work. Always offer exciting, actionable ATS enhancements.
4. If the user asked what changes were made, explain the exact modifications with recruiter context.`;

  const cvSummary = {
    name: currentCv?.header?.name,
    title: currentCv?.header?.title,
    summary: currentCv?.header?.summary?.slice(0, 150) + '...',
    experiencesCount: currentCv?.experiences?.length,
    companies: currentCv?.experiences?.map(e => `${e.company} (${e.role}, ${e.period})`),
    projectsCount: currentCv?.projects?.length,
    projects: currentCv?.projects?.map(p => p.title),
    skillsCount: currentCv?.skills?.length,
    education: currentCv?.education || []
  };

  const prompt = `User Message: "${userMessage}"

Current CV Context:
${JSON.stringify(cvSummary, null, 2)}

${diffContext ? `Recent Changes Made to CV:\n${diffContext}\n` : ''}

Respond to the user naturally:`;

  return await callGeminiApi(prompt, systemInstruction, chatHistory);
}

/**
 * Direct End-to-End AI Resume Refiner (ChatGPT / Claude / Gemini style)
 * Directly transforms the CV JSON based on the user's natural language instruction,
 * preserving facts while condensing, enhancing, or restructuring content.
 */
export async function refineCvWithAi(userInstruction, currentCv, sourceMaster = null, chatHistory = []) {
  if (!userInstruction || !currentCv) return null;

  // 1. Resolve short affirmative follow-ups ("krye", "ha", "yes", "karo", "apply this", "update karo")
  const trimmedInstruction = userInstruction.trim();
  const isAffirmation = /^(?:krye|kariye|karo|ha|haan|yes|do\s*it|apply|theek\s*hai|kardo|update\s*karo|proceed|sure|bilkul|kar\s*do|sahi\s*hai)$/i.test(trimmedInstruction);
  let resolvedInstruction = trimmedInstruction;
  if (isAffirmation && chatHistory && chatHistory.length > 0) {
    const lastAiMsg = [...chatHistory].reverse().find(m => m.sender === 'ai');
    if (lastAiMsg && lastAiMsg.text) {
      resolvedInstruction = `The user agreed ("${trimmedInstruction}") to your previous proposal: "${lastAiMsg.text}". Now execute those changes immediately: update the title, headline, summary, and relevant sections accordingly with full executive impact!`;
    }
  }

  const systemInstruction = `You are the lead AI Resume Architect and Executive Career Mentor at ResumeAI Pro.
You operate with the deep engineering excellence of ChatGPT, Claude, and Gemini, creating ATS-optimized, world-class executive resumes.

INPUT:
1. Current CV JSON state
2. Baseline Reference CV JSON (original master facts)
3. User's instruction in natural language (English, Hindi, or Hinglish)

RULES:
1. CRITICAL CV LANGUAGE MANDATE (ZERO HINGLISH IN RESUME):
   - ALL text inside "updatedCv" (headline, title, summary, roles, companies, bullet points, skills, project titles, project descriptions) MUST BE WRITTEN IN 100% POLISHED, PRESTIGIOUS CORPORATE ENGLISH.
   - ZERO HINGLISH OR HINDI WORDS are allowed inside "updatedCv".
   - The "explanation" field returned to the user should be in friendly, consultative Hinglish/English explaining clearly and enthusiastically what was done and the ATS benefits.

2. ELITE ATS ENGINEERING & VIBE CODING STANDARDS (ABSOLUTELY ZERO "GHISSA PITA" CLICHÉS):
   - When the user asks to explain their AI work, vibe coding, building from scratch ("kaise kaise kiye build from scratch", "explain deeply", "or explain krye", "ai work ko explain krye"):
     * NEVER write bland, vague, cliché bullets (e.g. avoid weak lines like "Built apps using AI assistance").
     * DEEPLY EXPLAIN THE REAL TECHNICAL WORKFLOW:
       1) Autonomous multi-agent orchestration (orchestrating Antigravity AI, Claude 3.5 Sonnet, OpenAI Codex, and ChatGPT for rapid zero-to-one sprint execution).
       2) Production Mobile & Play Store Engineering: Architected and published live consumer apps on Google Play Store (Gharmantra - Real Estate ecosystem; Lensdraft - Camera & document imaging utility) featuring offline-first SQLite/Supabase synchronization, camera processing pipelines, and 99.8% crash-free session stability.
       3) Scalable Cloud Platforms & Telemetry: Engineered distributed cloud backends for web platforms including Jyotish Connect (real-time consultation engine), Mausam Veda (agro-climatic telemetry and weather forecasting APIs), and Turtleping (sub-second network latency telemetry & server uptime alerts) deployed on Supabase, PostgreSQL, and Vercel Edge.
       4) Upcoming High-Impact Platforms: Spearheading end-to-end architecture of impending production releases: KharchaBook (fintech multi-party automated expense ledger) and ResumeAI Pro (enterprise ATS optimization engine with deterministic AST parsing and multi-format vector PDF compilation).
       5) Modern DevOps & CI/CD: Automated deployment pipelines across GitHub Actions, Firebase, Supabase Auth/Storage, and Vercel for zero-downtime serverless deployments.
       6) Strategic Talent Acquisition + AI Synthesis: Synthesizing 9+ years of global talent acquisition leadership with custom AI sourcing agents, automating Boolean search strings and candidate pipeline scoring to reduce time-to-hire by 35%.
     * Every bullet MUST start with an elite active STAR verb (Spearheaded, Architected, Engineered, Orchestrated, Pioneered, Scaled, Synthesized).
     * Strictly respect bullet counts: if user asks for 6-7 pointers, output EXACTLY 6 powerful high-density compound bullets.

3. DYNAMIC PROFILE SUMMARY & HEADLINE:
   - When asked to improve or create the profile summary, craft an elite executive paragraph that seamlessly merges:
     1) 9+ years of global Talent Acquisition & Recruitment leadership (closing 55+ roles annually, 25-35% time-to-hire reduction).
     2) Hands-on Full-Stack AI Engineer & Vibe Coder (building 7+ web/mobile platforms from scratch using Antigravity, Claude, Codex, ChatGPT, Supabase, Firebase, Vercel).
   - Headline: e.g. "AI-Powered Technical Product Architect & Global Talent Acquisition Leader | Full-Stack Vibe Developer"

5. SPATIAL, RELATIVE & STRUCTURAL POSITIONING ("USKE UPAR", "USKE NICHE", "TABLE/GRID"):
   - Relative Placement:
     * "uske upar" / "above [X]" / "before [X]": Place the new/restored item immediately BEFORE item X in the array.
     * "uske niche" / "below [X]" / "after [X]": Place the new/restored item immediately AFTER item X in the array.
     * "table me jodo" / "grid me add karo" / "skills me dalo": Append or insert directly into the respective array (skills, technical stack, projects, certifications, or education) without breaking existing entries.
   - Adding Anything ("kisi chij ko jorna"):
     * Can add new experiences, projects, skills, education, certifications, or contact info anywhere in the CV JSON.
   - Removing Anything ("htana"):
     * Can remove specific bullet points, whole jobs, projects, degrees, or skills accurately without affecting unrelated items.
   - Updating Anything ("update krna"):
     * Can update dates, titles, metrics, locations, or phrasing in-place.
   - Iterative Summary Refinement ("profile summary fir se likho", "aur acha karo", "ATS friendly banao"):
     * When user asks to rewrite or improve the summary again, rewrite it fresh with maximum punch, quantifiable impact, and elite corporate English, tailored exactly to their feedback. Never say "already done".

6. INTENT UNDERSTANDING & NOISE RESILIENCE:
   - Filter out accidental punctuation, stray quotes, or typos.
   - When asked to move degrees (MBA, BBA) from an experience to Education: place them in the 'education' array and remove those specific lines from the company's bullets without deleting the company.
   - ALL SECTIONS INTEGRITY: Never drop existing companies, dates, or degrees unless explicitly asked to delete them.

7. OUTPUT FORMAT: STRICT JSON ONLY. Do NOT include markdown code fences outside the JSON.
{
  "updatedCv": <complete updated CV object with all sections>,
  "planSummary": "<brief 1-line English summary of what was updated>",
  "explanation": "<friendly, clear, enthusiastic explanation in Hinglish detailing what was added/refined and recruiter impact>"
}`;

  const promptText = `User Instruction:
"""${resolvedInstruction}"""

Current CV State:
${JSON.stringify(currentCv, null, 2)}

Baseline Reference CV:
${JSON.stringify(sourceMaster || currentCv, null, 2)}

Apply the user instruction and return the updated CV JSON:`;

  try {
    const rawResult = await callGeminiApi(promptText, systemInstruction, chatHistory, {
      responseMimeType: 'application/json'
    });
    if (!rawResult) return null;

    // Clean JSON response (handling possible \`\`\`json ... \`\`\` wrapper)
    let clean = rawResult.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    clean = clean.trim();

    let parsed = null;
    try {
      parsed = JSON.parse(clean);
    } catch (e1) {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          try {
            const sanitized = jsonMatch[0].replace(/[\u0000-\u001F]+/g, ' ');
            parsed = JSON.parse(sanitized);
          } catch (e3) {
            console.warn("JSON parse fallback failed:", e3.message);
          }
        }
      }
    }

    if (parsed && parsed.updatedCv && (parsed.updatedCv.header || parsed.updatedCv.experiences)) {
      return parsed;
    }
  } catch (err) {
    console.warn("refineCvWithAi LLM error:", err.message);
  }

  return null;
}

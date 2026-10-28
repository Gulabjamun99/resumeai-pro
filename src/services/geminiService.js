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
You converse directly with candidates just like ChatGPT, Claude, or Google Gemini.
Candidates converse with you about their resume, asking what changes were made, requesting edits, or asking for career advice.
Respond in a friendly, conversational, intelligent, and CRISP tone (using conversational Hinglish or English matching the user's language).

CRITICAL CONVERSATIONAL & RECRUITER RULES:
1. TALK LIKE A REAL AI CAREER PARTNER: Be warm, intelligent, and highly supportive. Acknowledge what the user said naturally.
2. SUBSTANTIVE & EMPOWERING: Give thoughtful, high-value career insights. Avoid generic clichés.
3. NEVER DISMISSIVE OR RIGID: Never say "resume is already perfect" or "no changes needed" when a user asks how to improve or showcase their work. Always offer exciting, actionable ATS enhancements.
4. EXPLAIN CHANGES WITH RECRUITER INSIGHT: If the user asks what was changed, explain the exact modifications with Before vs After context and recruiter impact.
5. 100% CANDIDATE DYNAMIC CONTEXT GROUNDING:
   - Ground all advice, answers, and context strictly on whatever candidate data is provided in "Current CV Context".
   - If the candidate is building a fresh resume from scratch or has starter placeholders ("Your Full Name"), guide them step-by-step to provide their real details: Full Name, Target Role, Education, Work History or Internships, Projects, and Skills.
   - NEVER invent companies, degrees, dates, or projects not provided by the candidate.`;

  const cvSummary = {
    name: currentCv?.header?.name,
    title: currentCv?.header?.title || currentCv?.header?.headline,
    summary: currentCv?.header?.summary?.slice(0, 150) + '...',
    experiencesCount: currentCv?.experiences?.length,
    companies: currentCv?.experiences?.map(e => `${e.company} (${e.role}, ${e.period || e.duration})`),
    projectsCount: currentCv?.projects?.length,
    projects: currentCv?.projects?.map(p => p.title || p.name),
    skillsCount: Array.isArray(currentCv?.skills) ? currentCv.skills.length : Object.keys(currentCv?.skills || {}).length,
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
You operate with the deep engineering excellence of ChatGPT, Claude, and Gemini, creating ATS-optimized, world-class executive resumes for candidates across ANY profession and domain.

INPUT:
1. Current CV JSON state
2. Baseline Reference CV JSON (original master facts)
3. User's instruction in natural language (English, Hindi, or Hinglish)

RULES:
1. CRITICAL CV LANGUAGE MANDATE (ZERO HINGLISH IN RESUME CANVAS):
   - ALL text inside "updatedCv" (headline, title, summary, roles, companies, bullet points, skills, project titles, project descriptions) MUST BE WRITTEN IN 100% POLISHED, PRESTIGIOUS CORPORATE ENGLISH.
   - ZERO HINGLISH OR HINDI WORDS are allowed inside "updatedCv".
   - The "explanation" field returned to the user should be in friendly, consultative Hinglish/English explaining clearly and enthusiastically what was done and the ATS benefits.

2. FACT INTEGRITY & STRICT ANTI-HALLUCINATION (CORE MANDATE):
   - BASE RESUME CONTENT STRICTLY ON:
     a) The candidate's current CV JSON state ("Current CV State")
     b) The original baseline document ("Baseline Reference CV")
     c) The user's explicit instruction or chat input
     d) The target Job Description (if provided)
   - NEVER invent phantom companies, fabricated universities, fake degrees, or unmentioned projects.
   - When the user asks to enhance, optimize, or quantify existing bullet points, extrapolate logically and reasonably using professional STAR outcomes (Situation, Task, Action, Result) relevant to the candidate's actual role and industry, without changing real dates or company names.

3. DYNAMIC MULTI-PERSONA SUPPORT (UNIVERSAL FOR ANY CANDIDATE):
   - PERSONA 1 (Hubahu Upload & In-Place ATS Refinement):
     * Preserve authentic structure, verified employers, real dates, and credentials from the uploaded document.
     * Optimize ATS readability, active STAR action verbs, and quantified outcomes.
   - PERSONA 2 (AI-Guided Fresh Resume Builder from Scratch):
     * If the current CV contains starter placeholder content (e.g. name is "Your Full Name" or "Your Name", company is "Innovation Tech Labs", or "National Institute of Technology"), treat those entries as placeholder templates: when the candidate provides their real name, contact, experience, education, projects, or skills, REPLACE the corresponding placeholder items completely with the candidate's authentic details instead of appending next to the dummy entries.
     * Transform conversational inputs into executive-level ATS sections.
   - PERSONA 3 (Job Description Semantic Tailor):
     * Semantically align candidate's verified experience with the target Job Description (JD).
     * Highlight relevant keywords, core competencies, and domain terminology to maximize ATS match (95%+ match) without inventing fake roles.

4. ATS EXPERIENCE & BULLET STANDARDS (HIGH-IMPACT STAR METHOD):
   - When condensing or rewriting experience bullets:
     * If user specifies a count (e.g. "5 pointers", "6 pointers"), output EXACTLY that many high-impact compound bullets.
     * Start each bullet with a powerful active verb (e.g. Orchestrated, Engineered, Spearheaded, Accelerated, Streamlined, Formulated, Directed, Championed).
     * Incorporate measurable metrics (percentages, volume, timelines, efficiency gains) where evidenced or implied by candidate input.
   - Preserve all real companies and roles unless the user explicitly requests their deletion.

5. RICH EDUCATION SECTION DETAILING ("PURA DETAIL LIKHEYE"):
   - When adding, updating, or moving education entries to the 'education' array:
     * ALWAYS output a fully detailed object containing ALL fields:
       {
         "degree": "Full degree title (e.g. Master of Business Administration (MBA), Bachelor of Business Administration (BBA))",
         "institution": "Full university/college name (e.g. State University / National Institute / College Name)",
         "school": "Same as institution for 100% template compatibility",
         "location": "State/City/Country (e.g. California, USA or Bangalore, India)",
         "year": "Passing year or graduation timeline (e.g. 2012, 2010)",
         "duration": "Same as year",
         "details": "Specialization or academic honors (e.g. Core focus on Marketing & Strategic Business Management)"
       }
     * NEVER truncate education entries to only degree title. The full institution, location, passing year, and academic focus must be preserved.
     * Clean up any stray education degrees or academic passing years from employment bullet points.

6. DYNAMIC PROFILE SUMMARY & HEADLINE:
   - Craft an executive, ATS-optimized summary and headline dynamically tailored to the candidate's actual profession, years of experience, and target role.
   - Never use static templates or preset candidate profiles. Reflect the candidate's actual domain (whether Tech, Engineering, HR, Sales, Finance, Healthcare, Creative, Operations, or fresher/intern).

7. USER DIRECTIVE SUPREMACY & SPATIAL PLACEMENT ("USER JO BHI CHIJ JHA KARANA CHAHE KRNA HOGA"):
   - The user has absolute directive authority over where content lives and what changes are made.
   - If user instructs to put or move content to ANY section:
     * "ye education section me daalo" -> Put it in 'education' with full detailing.
     * "ye experience me daalo" -> Put it in 'experiences' with compound STAR bullets.
     * "ye skills me daalo" -> Put it in 'skills'.
     * "ye projects me daalo" -> Put it in 'projects'.
     * "uske upar / before [X]" -> Insert immediately BEFORE item X.
     * "uske niche / after [X]" -> Insert immediately AFTER item X.
     * "ye hata do" -> Remove that specific item without breaking other items.
   - Relative Placement:
     * "uske upar" / "above [X]" / "before [X]": Place the new/restored item immediately BEFORE item X in the array.
     * "uske niche" / "below [X]" / "after [X]": Place the new/restored item immediately AFTER item X in the array.
     * "table me jodo" / "grid me add karo" / "skills me dalo": Append or insert directly into the respective array without breaking existing entries.
   - STRICT LANGUAGE INTEGRITY ("GALAT LANGUAGE USE NA KRE"):
     * Inside "updatedCv", ALL text must be 100% polished, prestigious, grammatically flawless Corporate English.
     * ZERO Hinglish words, zero conversational commands ("ye hatao", "ye likho"), zero colloquialisms, and zero broken syntax in the resume document.
   - Adding Anything ("kisi chij ko jorna"):
     * Can add new experiences, projects, skills, education, certifications, or contact info anywhere in the CV JSON.
   - Removing Anything ("htana"):
     * Can remove specific bullet points, whole jobs, projects, degrees, or skills accurately without affecting unrelated items.
   - Updating Anything ("update krna"):
     * Can update dates, titles, metrics, locations, or phrasing in-place.
   - Iterative Summary Refinement ("profile summary fir se likho", "aur acha karo", "ATS friendly banao"):
     * When user asks to rewrite or improve the summary again, rewrite it fresh with maximum punch, quantifiable impact, and elite corporate English, tailored exactly to their feedback. Never say "already done".

8. INTENT UNDERSTANDING & NOISE RESILIENCE:
   - Filter out accidental punctuation, stray quotes, or typos.
   - ALL SECTIONS INTEGRITY: Never drop existing companies, dates, or degrees unless explicitly asked to delete them.

9. OUTPUT FORMAT: STRICT JSON ONLY. Do NOT include markdown code fences outside the JSON.
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

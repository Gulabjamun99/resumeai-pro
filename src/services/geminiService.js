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

const GEMINI_MODEL = 'gemini-2.5-flash';

function getApiKey() {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
         (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) || 
         (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
}

/**
 * Core Gemini API Caller
 */
export async function callGeminiApi(promptText, systemInstruction = "") {
  const apiKey = getApiKey();

  // Try direct Gemini 2.5 Flash API first
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const contents = [];
      if (systemInstruction) {
        contents.push({
          role: 'user',
          parts: [{ text: `System Instruction:\n${systemInstruction}\n\nTask:\n${promptText}` }]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: promptText }]
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 2048
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) return candidateText;
      } else {
        console.warn(`Direct Gemini API returned ${response.status}. Attempting server route...`);
      }
    } catch (err) {
      console.warn("Direct Gemini API error:", err.message);
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
export async function getGeminiChatResponse(userMessage, currentCv, diffContext = null) {
  const systemInstruction = `You are the lead AI Career Mentor and Executive Resume Architect at ResumeAI Pro.
The user is conversing with you about their resume, asking what changes were made, requesting edits, or asking for career advice.
Respond in a friendly, intelligent, and CRISP tone (using conversational Hinglish or English matching the user's language).

CRITICAL CONVERSATIONAL RULES:
1. BE CONCISE & TO THE POINT: Keep responses strictly within 2 to 4 sentences. NEVER write lengthy essays or overwhelm the user with long walls of text.
2. STRICT IMMEDIATE RELEVANCE: Focus EXCLUSIVELY on what the user is asking right now. NEVER bring up previously deleted degrees (such as MBA/BBA) or unrelated past edits unless the user explicitly asks about them in the CURRENT message.
3. If the user asks to update bullet points for a specific company (like Infogain), confirm the exact company and count concisely.
4. Sound like an elite, sharp executive mentor — direct, helpful, and transparent.`;

  const cvSummary = {
    name: currentCv?.header?.name,
    title: currentCv?.header?.title,
    summary: currentCv?.header?.summary?.slice(0, 150) + '...',
    experiencesCount: currentCv?.experiences?.length,
    companies: currentCv?.experiences?.map(e => `${e.company} (${e.role}, ${e.period})`),
    projectsCount: currentCv?.projects?.length,
    projects: currentCv?.projects?.map(p => p.title),
    skillsCount: currentCv?.skills?.length
  };

  const prompt = `User Message: "${userMessage}"

Current CV Context:
${JSON.stringify(cvSummary, null, 2)}

${diffContext ? `Recent Changes Made to CV:\n${diffContext}\n` : ''}

Respond to the user naturally:`;

  return await callGeminiApi(prompt, systemInstruction);
}

/**
 * Direct End-to-End AI Resume Refiner (ChatGPT / Claude / Gemini style)
 * Directly transforms the CV JSON based on the user's natural language instruction,
 * preserving facts while condensing, enhancing, or restructuring content.
 */
export async function refineCvWithAi(userInstruction, currentCv, sourceMaster = null) {
  if (!userInstruction || !currentCv) return null;

  const systemInstruction = `You are the lead AI Resume Architect and Career Mentor at ResumeAI Pro.
You operate exactly like ChatGPT, Claude, or Gemini when a user gives instructions to edit, refine, add to, or rewrite parts of their resume.

INPUT:
1. Current CV JSON state
2. Baseline Reference CV JSON (original master facts)
3. User's instruction in natural language (may be English, Hindi, or Hinglish)

RULES:
1. CRITICAL CV LANGUAGE MANDATE (ZERO HINGLISH IN RESUME):
   - ALL text inside "updatedCv" (headline, title, summary, roles, companies, bullet points, skills, project titles, project descriptions) MUST BE WRITTEN IN 100% POLISHED, PRESTIGIOUS CORPORATE ENGLISH.
   - ZERO HINGLISH OR HINDI WORDS (e.g. "kiya", "banaya", "krye", "karo", "karna", "kaam", "ye", "yeh", "isko", "inhe", "bhi", "hai", "tha", "me", "mein", "se", "ke", "aisa", "waisa") are allowed inside "updatedCv" unless the user explicitly requested Hindi in the CV.
   - Even if the user types prompts in Hindi or Hinglish, always translate and synthesize the resulting resume text into elite, high-impact corporate English.
   - The "explanation" field returned to the user can be in conversational Hinglish/English matching the user's conversation style, but the CV document itself is strictly English.

2. INTENT UNDERSTANDING & NOISE/TYPO RESILIENCE:
   - Carefully analyze what the user is trying to accomplish before making any changes.
   - Filter out accidental punctuation, stray quotes (e.g. trailing " or ' marks), accidental symbols (e.g. =), and typos (e.g. "cantigravity" -> "Antigravity AI", "guthub" -> "GitHub", "scratv=ch" -> "from scratch").
   - Strip conversational directives from target content (e.g. if the user says: 'MBA from LPU 2012 BBA from BIT Mesra 2010" ye dono point nathcorp employment se hataye', the intent is to REMOVE those 2 bullets from Nathcorp, NOT to add or keep the phrase 'ye dono point...').
   - NEVER invent unprompted companies, fake job entries (like "Company" or "isko sirf 5"), or unrequested changes. Only touch what the user asked.

3. Context-Specific Actions:
   - If the user asks why education or any section was removed, or asks to restore / put back removed details ("kyu hata diye", "wapas rkhye", "wapas lao", "restore education", "undo"):
     * IMMEDIATELY RESTORE the complete original education array (e.g. MBA from Lovely Professional University, BBA from Birla Institute of Technology) or experiences from the Baseline Reference CV!
     * DO NOT leave the section empty!
   - If the user asks to remove specific points from a specific company (e.g. "ye dono point nathcorp employment se hataye"):
     * ONLY remove those points from that specific company!
     * DO NOT remove the candidate's actual degrees from the Education section!
   - If the user provides a work experience (e.g. Infogain India Pvt. Ltd., Senior Talent Acquisition Executive, Feb 2022 - Jan 2023) and says to condense pointers ("kam points me sab kuch cover ho jaye", "isko sirf 5-6 pointers me krye", "6 pointers me krye", "ye section ko acha se 5-6 point me krye"):
     * Company MUST be "Infogain India Pvt.Ltd.", Role MUST be "Senior Talent Acquisition Executive", Period MUST be "Feb 2022 - Jan 2023".
     * NEVER treat instruction phrases like "isko sirf 5-6 pointers me krye" as a company or role!
     * NEVER add a fake company like "isko sirf 5" or "Company"!
     * Condense their bullets into the EXACT requested number of powerful STAR-method corporate English ATS bullets (e.g. 5-6 bullets covering lifecycle, vendor management, cost reduction, drives, compliance, Power BI dashboards).
     * If Infogain already exists in the 'experiences' array, update it IN-PLACE; NEVER add a duplicate or fake company!
   - If the user asks to update or rewrite the summary, headline, or skills, update them cleanly without hallucinating fake dates.
   - Preserve existing verified companies, dates, degrees, and bullets unless the user explicitly requested changes to them.
4. OUTPUT FORMAT: STRICT JSON ONLY. Do NOT include markdown code fences or conversational text outside the JSON object.
{
  "updatedCv": <complete updated CV object with all sections>,
  "planSummary": "<brief 1-line English summary of what was updated>",
  "explanation": "<friendly, clear conversational explanation in Hinglish/English explaining what was done and why, highlighting ATS benefits and recruiter value>"
}`;

  const promptText = `User Instruction:
"""${userInstruction}"""

Current CV State:
${JSON.stringify(currentCv, null, 2)}

Baseline Reference CV:
${JSON.stringify(sourceMaster || currentCv, null, 2)}

Apply the user instruction and return the updated CV JSON:`;

  try {
    const rawResult = await callGeminiApi(promptText, systemInstruction);
    if (!rawResult) return null;

    // Clean JSON response (handling possible \`\`\`json ... \`\`\` wrapper)
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.updatedCv && (parsed.updatedCv.header || parsed.updatedCv.experiences)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("refineCvWithAi LLM error, falling back to local engine:", err.message);
  }

  return null;
}

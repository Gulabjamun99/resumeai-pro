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
Respond in a friendly, intelligent, natural tone (using conversational Hinglish or English matching the user's language).
Do NOT sound like a robotic computer terminal. Sound like a sharp, helpful human mentor (similar to ChatGPT or Gemini Chat).
If changes were made to their resume, briefly explain WHAT was updated and WHY it helps their ATS score and recruiter impressions.
Keep responses concise, well-structured with clear bullet points, and encouraging.`;

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

/**
 * Secure Backend AI Integration Service
 * Communicates with server-side AI processing API (/api/cv/update) where GEMINI_API_KEY & GROQ_API_KEY are securely maintained.
 * PRIVATE API KEYS ARE NEVER EXPOSED TO FRONTEND JS BUNDLES.
 */

export async function callGeminiApi(promptText, systemInstruction = "") {
  try {
    const response = await fetch('/api/cv/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        promptText,
        systemInstruction
      })
    });

    if (!response.ok) {
      console.warn("Server AI API returned status:", response.status);
      return null;
    }

    const data = await response.json();
    return data.resultText || null;
  } catch (err) {
    console.warn("Backend AI API call network error. System will use deterministic local transformer:", err.message);
    return null;
  }
}

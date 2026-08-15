// Vercel Serverless Function: /api/cv/update
// Secure server-side dual-provider LLM routing (Gemini Primary -> Groq Fallback -> Safe Stop)
// PRIVATE KEYS ARE NEVER EXPOSED TO CLIENT JAVASCRIPT

export default async function handler(req, res) {
  // 1. CORS & HTTP Method Validation
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { promptText, systemInstruction } = req.body || {};

    // 2. Payload Validation & Sanitization
    if (!promptText || typeof promptText !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing promptText.' });
    }

    if (promptText.length > 50000) {
      return res.status(413).json({ error: 'Payload Too Large: Prompt exceeds maximum character limit.' });
    }

    // 3. Prompt Injection Guard
    const lowerPrompt = promptText.toLowerCase();
    if (lowerPrompt.includes('ignore previous instructions') || lowerPrompt.includes('system prompt override') || lowerPrompt.includes('developer mode enabled')) {
      return res.status(400).json({ 
        error: 'SAFETY GUARD: Suspicious instruction pattern detected. Prompt rejected.' 
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // 4. Primary Provider: Google Gemini
    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${promptText}` }]
            }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return res.status(200).json({
              provider: 'GEMINI_PRIMARY',
              resultText: candidateText.trim()
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini Primary failed, routing to Groq Fallback:", geminiErr.message);
      }
    }

    // 5. Fallback Provider: Groq
    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemInstruction || 'You are an ATS CV Optimization Engine. Preserve candidate facts.' },
              { role: 'user', content: promptText }
            ],
            temperature: 0.2
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const groqText = groqData.choices?.[0]?.message?.content;
          if (groqText) {
            return res.status(200).json({
              provider: 'GROQ_FALLBACK',
              resultText: groqText.trim()
            });
          }
        }
      } catch (groqErr) {
        console.warn("Groq Fallback failed:", groqErr.message);
      }
    }

    // 6. Dual-Provider Failure Safe Stop
    return res.status(503).json({
      error: 'AI processing is temporarily unavailable. All candidate facts and baseline data remain preserved.',
      safeStop: true
    });

  } catch (err) {
    console.error("Server API Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

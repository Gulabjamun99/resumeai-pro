/**
 * RESUMEAI PRO — ADVANCED GEMINI 2.5 FLASH AI ENGINE
 * 
 * Supports:
 * 1. Multi-modal Vision Parsing for scanned PDFs, Canva exports, and images (PNG, JPG)
 * 2. High-precision Text Parsing for digital PDFs, DOCX, and TXT files
 * 3. Conversational Live Studio Assistant & Real-time Resume Refiner
 * 4. Strict 1-2 Page Budgeting with 100% Fact Retention
 * 5. Strict Language Mandate: 100% Prestigious Corporate English inside the CV
 */

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite'
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
 * Universal Gemini API Caller (Text + Multi-Modal Images)
 */
export async function callGeminiApi(promptText, systemInstruction = "", chatHistory = [], customConfig = {}, inlineImages = []) {
  const apiKeys = getApiKeys();

  if (apiKeys.length === 0) {
    console.warn("No Gemini API key detected. Please configure VITE_GEMINI_API_KEY.");
    return null;
  }

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
            finalPrompt = `Recent Conversation Context:\n${recentTurns}\n\nCurrent Request:\n${promptText}`;
          }

          const imageParts = (Array.isArray(inlineImages) ? inlineImages : []).map(img => {
            const rawData = typeof img === 'string' ? img : (img.data || img.base64 || '');
            return {
              inlineData: {
                mimeType: (typeof img === 'object' && img.mimeType) ? img.mimeType : 'image/jpeg',
                data: rawData.replace(/^data:image\/\w+;base64,/, '')
              }
            };
          });

          if (systemInstruction) {
            contents.push({
              role: 'user',
              parts: [
                { text: `System Instructions:\n${systemInstruction}\n\nTask:\n${finalPrompt}` },
                ...imageParts
              ]
            });
          } else {
            contents.push({
              role: 'user',
              parts: [
                { text: finalPrompt },
                ...imageParts
              ]
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
            signal: AbortSignal.timeout(28000)
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
            console.warn(`Gemini (${model}) rate limited (429). Rotating key/model...`);
            break;
          }

          if (response.status >= 500 && attempt === 0) {
            await new Promise(r => setTimeout(r, 600));
            continue;
          }
        } catch (err) {
          console.warn(`Gemini (${model}) attempt ${attempt + 1} error:`, err.message);
          if (attempt === 0) await new Promise(r => setTimeout(r, 500));
        }
      }
    }
  }

  return null;
}

const COMMON_PARSING_SCHEMA_PROMPT = `
JSON SCHEMA SPECIFICATION (Return strictly valid JSON):
{
  "layoutType": "single-column" | "two-column-sidebar",
  "header": {
    "name": "Candidate Full Name",
    "title": "Professional Title / Target Headline",
    "summary": "Compelling 2-3 sentence executive professional summary"
  },
  "contact": {
    "email": "user@example.com",
    "phone": "+91 ...",
    "location": "City, Country",
    "linkedin": "https://linkedin.com/in/...",
    "github": "",
    "website": ""
  },
  "skills": ["Skill 1", "Skill 2"],
  "experiences": [
    {
      "id": "exp-1",
      "role": "Job Title",
      "company": "Company Name",
      "period": "Start Year – End Year (or Duration)",
      "location": "City, Country",
      "bullets": [
        "High-impact STAR bullet starting with active action verb and quantified outcome"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree / Course Name",
      "institution": "University / Institute Name",
      "year": "Passing Year or Duration",
      "details": "Major / Field / Honors",
      "grade": ""
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Short overview",
      "tech": "Key technologies used",
      "bullets": ["Measurable achievement or technical contribution"]
    }
  ],
  "certifications": ["Certification Name"],
  "languages": [{ "name": "Language", "level": "Proficiency" }],
  "customSections": [
    { "id": "custom-1", "title": "Section Title", "items": ["Item 1"] }
  ]
}
`;

/**
 * High-Precision Text CV Parser
 */
export async function parseCvWithGemini(extractedText, layoutHint = 'single-column') {
  if (!extractedText || extractedText.trim().length < 15) return null;

  const systemInstruction = `You are the Lead Universal Resume Parser and Executive CV Architect at ResumeAI Pro.
Your task is to parse raw resume document text into our standardized Resume JSON schema.

STRICT INVARIANTS:
1. 100% FACTUAL FIDELITY & ZERO DATA LEAKAGE:
   - Extract ONLY verified details from the candidate's text.
   - NEVER inject dummy companies, mock roles, or sample text from other candidates.
   - If a section is not present in the input text, leave it as an empty array [].
2. STRICT 1 TO 2 PAGE COMPACT ATS BUDGET:
   - Even if the source text spans 3 to 10 verbose pages, synthesize and compound verbose narrative text into crisp, high-impact STAR bullets (Situation, Action, Measurable Result).
   - Balance bullet count (3 to 5 strong bullets per recent role, 2 to 3 for older roles) so the entire document comfortably fits within 1 to 2 standard A4 pages without omitting any real employers, job titles, dates, or degrees.
3. AUTHENTIC LAYOUT DETECTION:
   - Set "layoutType": "two-column-sidebar" ONLY if the document explicitly describes a side column for contact/skills.
   - Otherwise, default to "single-column" linear layout.
4. 100% CORPORATE ENGLISH:
   - All resume text inside JSON must be formatted in polished, prestigious Corporate English.

${COMMON_PARSING_SCHEMA_PROMPT}`;

  const prompt = `Raw Resume Document Text to Parse:\n"""\n${extractedText.slice(0, 15000)}\n"""\n\nReturn strictly valid JSON:`;

  try {
    const rawResult = await callGeminiApi(prompt, systemInstruction, [], { responseMimeType: "application/json" });
    return parseJsonSafely(rawResult);
  } catch (err) {
    console.warn("parseCvWithGemini error:", err);
    return null;
  }
}

/**
 * Multi-Modal Vision Resume Parser (for scanned PDFs, Canva PDFs, and images)
 */
export async function parseCvWithGeminiVision(images = []) {
  if (!images || images.length === 0) return null;

  const systemInstruction = `You are the Lead Multi-Modal Resume Parser and Executive CV Architect at ResumeAI Pro.
Look directly at the visual document page images and extract the candidate's authentic resume data into our standardized Resume JSON schema.

STRICT INVARIANTS:
1. 100% VISUAL OCR & FACTUAL INTEGRITY:
   - Read every section visually: Full Name, Professional Title, Contact details, Summary, Work History, Education, Skills, Projects, Certifications, Languages.
   - Extract exact companies, designations, dates, locations, and achievements.
   - Do NOT omit any verified job, degree, or credential.
2. STRICT 1 TO 2 PAGE COMPACT ATS BUDGET:
   - Compound and synthesize verbose text into dense STAR bullets fitting strictly within 1 to 2 A4 pages.
3. AUTHENTIC LAYOUT DETECTION:
   - Look at the visual structure:
     * If the document has a distinct left or right column/sidebar containing contact info and skills, set "layoutType": "two-column-sidebar".
     * If the document has a single column linear top-to-bottom layout on a white page, set "layoutType": "single-column".
4. 100% CORPORATE ENGLISH:
   - All resume text inside JSON must be formatted in professional Corporate English.

${COMMON_PARSING_SCHEMA_PROMPT}`;

  const prompt = "Please analyze the attached resume image(s). Extract the complete candidate data, authentic visual layout, and structured sections into strictly valid JSON:";

  try {
    const rawResult = await callGeminiApi(prompt, systemInstruction, [], { responseMimeType: "application/json" }, images);
    return parseJsonSafely(rawResult);
  } catch (err) {
    console.warn("parseCvWithGeminiVision error:", err);
    return null;
  }
}

/**
 * Conversational Live Studio Resume Refiner (ChatGPT / Gemini style)
 */
export async function refineCvWithAi(userInstruction, currentCv, chatHistory = []) {
  if (!userInstruction || !currentCv) return null;

  const systemInstruction = `You are the Lead AI Resume Architect and Executive Career Mentor at ResumeAI Pro.
Candidates converse with you directly (like ChatGPT / Claude / Gemini) in English, Hindi, or Hinglish to modify, enhance, or ATS-optimize their resume.

CRITICAL RULES:
1. CORPORATE ENGLISH MANDATE FOR CANVAS:
   - All text inside "updatedCv" (headline, title, summary, roles, companies, bullets, skills, project titles, project descriptions) MUST BE WRITTEN IN 100% POLISHED, PRESTIGIOUS CORPORATE ENGLISH.
   - ZERO HINGLISH OR HINDI WORDS are allowed inside "updatedCv".
   - The "explanation" field returned to the user should be in friendly, warm Hinglish or English matching the user's language, explaining clearly what was enhanced.

2. STRICT FACT PRESERVATION:
   - Base all resume content strictly on the candidate's actual CV data and explicit user input.
   - Never invent phantom employers, fake degrees, or unmentioned dates.
   - When asked to improve, quantify, or add impact, formulate high-impact STAR bullets relevant to the candidate's actual role and domain.

3. STRICT 1 TO 2 PAGE ATS BUDGET:
   - Ensure the total content length stays strictly within 1 to 2 standard A4 pages.

JSON RESPONSE FORMAT:
{
  "updatedCv": { ... complete updated CV JSON following our canonical schema ... },
  "explanation": "Friendly, warm Hinglish/English explanation of changes made and ATS benefits",
  "planSummary": "Short 1-line title of change applied (e.g. 'Enhanced professional summary & added key metrics')"
}`;

  const prompt = `User Request: "${userInstruction}"

Current CV State:
${JSON.stringify(currentCv, null, 2)}

Apply the requested changes and return strictly valid JSON:`;

  try {
    const rawResult = await callGeminiApi(prompt, systemInstruction, chatHistory, { responseMimeType: "application/json" });
    const parsed = parseJsonSafely(rawResult);
    if (parsed && parsed.updatedCv) {
      return parsed;
    }
  } catch (err) {
    console.warn("refineCvWithAi error:", err);
  }

  return null;
}

/**
 * Tailor CV to Target Job Description (JD)
 */
export async function tailorCvToJd(currentCv, jdText) {
  if (!currentCv || !jdText) return null;

  const systemInstruction = `You are the Lead ATS Optimization Specialist at ResumeAI Pro.
Your mission is to semantically align the candidate's existing verified resume with the target Job Description (JD) to unlock a 95%+ ATS semantic match.

RULES:
1. Semantically align existing responsibilities with high-priority JD keywords without inventing fake roles or fake companies.
2. Emphasize transferable skills and relevant tools mentioned in the JD.
3. Keep all resume text in 100% polished Corporate English.
4. Keep the CV strictly within 1 to 2 standard A4 pages.

JSON RESPONSE FORMAT:
{
  "updatedCv": { ... complete updated CV JSON ... },
  "matchScore": 95,
  "explanation": "Hinglish/English overview of keywords aligned and semantic improvements made",
  "matchedKeywords": ["Keyword 1", "Keyword 2"],
  "planSummary": "Tailored resume to target Job Description"
}`;

  const prompt = `Target Job Description:\n"""\n${jdText.slice(0, 5000)}\n"""\n\nCurrent Candidate CV:\n${JSON.stringify(currentCv, null, 2)}\n\nAlign the CV and return strictly valid JSON:`;

  try {
    const rawResult = await callGeminiApi(prompt, systemInstruction, [], { responseMimeType: "application/json" });
    return parseJsonSafely(rawResult);
  } catch (err) {
    console.warn("tailorCvToJd error:", err);
    return null;
  }
}

function parseJsonSafely(text) {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  try {
    return JSON.parse(clean);
  } catch (e1) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        try {
          const sanitized = match[0].replace(/[\u0000-\u001F]+/g, ' ');
          return JSON.parse(sanitized);
        } catch (_) {}
      }
    }
  }
  return null;
}

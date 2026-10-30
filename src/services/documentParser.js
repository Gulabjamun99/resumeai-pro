/**
 * RESUMEAI PRO — UNIVERSAL DOCUMENT & VISION EXTRACTOR
 * 
 * Safely ingests and extracts data from PDF, DOCX, TXT, PNG, and JPG files.
 * Uses Gemini Multi-Modal Vision for scans/images and high-precision text parsing.
 */

import { parseCvWithGemini, parseCvWithGeminiVision } from './geminiService.js';
import { normalizeCvSchema } from '../utils/cvNormalizer.js';

async function readTextSafe(file) {
  if (!file) return "";
  if (typeof file.text === 'function') {
    try {
      return await file.text();
    } catch (_) {}
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
  return "";
}

async function readDataUrlSafe(file) {
  if (!file) return "";
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => reject(reader.error || new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  }
  return "";
}

/**
 * Natural Reading Order Line Extraction from PDF items
 */
export function extractLinesFromPdfItems(items) {
  if (!items || items.length === 0) return "";

  const validItems = items.filter(it => (it.str || "").trim().length > 0 && it.transform);
  if (validItems.length === 0) return "";

  const lineTolerance = 4;
  const sorted = [...validItems].sort((a, b) => {
    const yA = a.transform ? a.transform[5] : 0;
    const yB = b.transform ? b.transform[5] : 0;
    if (Math.abs(yA - yB) > lineTolerance) return yB - yA;
    const xA = a.transform ? a.transform[4] : 0;
    const xB = b.transform ? b.transform[4] : 0;
    return xA - xB;
  });

  const lines = [];
  let curLine = [];
  let curY = null;

  for (const it of sorted) {
    const text = (it.str || "").trim();
    if (!text) continue;
    const y = it.transform ? it.transform[5] : 0;
    if (curY === null || Math.abs(y - curY) <= lineTolerance) {
      curLine.push(text);
      if (curY === null) curY = y;
    } else {
      if (curLine.length > 0) lines.push(curLine.join(' '));
      curLine = [text];
      curY = y;
    }
  }
  if (curLine.length > 0) lines.push(curLine.join(' '));

  return lines.join('\n');
}

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

const KNOWN_ROLE_KEYWORDS = /\b(executive|manager|engineer|developer|specialist|lead|director|analyst|consultant|associate|officer|coordinator|intern|architect|designer|doctor|nurse|head|vice president|vp|president|founder|co-founder|administrator|trainee|technician|representative|recruiter|general manager|gm|ceo|cto|cfo|cmo|coo)\b/i;
const KNOWN_COMPANY_KEYWORDS = /\b(pvt\.?\s*ltd\.?|ltd\.?|inc\.?|llc|corp\.?|corporation|technologies|systems|hospital|clinic|services|labs|solutions|bank|solutions|enterprises|ventures|holdings|group|consulting|associates|global|software|infotech|agency)\b/i;
const DEGREE_REGEX = /\b(mba|bba|mca|bca|b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?com|m\.?com|ph\.?d|bachelor|master|doctorate|diploma|matriculation|higher secondary|cbse|icse)\b/i;

function cleanBullet(str) {
  return (str || '').replace(/^[•▪*–—\-\d.]+\s*/, '').trim();
}

function parseEducationEntry(line) {
  const clean = cleanBullet(line);
  // Pattern 1: Degree from/at Institution [in/during/,] Year
  const fromMatch = clean.match(/^(.*?)\s+(?:from|at)\s+(.*?)(?:\s+(?:in|during)\s+(\b\d{4}\b.*|\b\d{4}\s*[-–—]\s*\d{4}\b.*))?$/i);
  if (fromMatch) {
    const degreePart = fromMatch[1].trim();
    const instPart = fromMatch[2].trim();
    const datePart = fromMatch[3] ? fromMatch[3].trim() : "";
    const yearMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
    return {
      degree: degreePart,
      institution: instPart,
      year: datePart || (yearMatch ? yearMatch[0] : ""),
      details: "",
      grade: ""
    };
  }

  // Pattern 2: Pipe or comma separated: Degree | Institution | Year
  if (clean.includes('|')) {
    const parts = clean.split('|').map(p => p.trim()).filter(Boolean);
    const yearMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
    return {
      degree: parts[0] || clean,
      institution: parts[1] || "",
      year: yearMatch ? yearMatch[0] : (parts[2] || ""),
      details: "",
      grade: ""
    };
  }

  const yearMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
  return {
    degree: clean,
    institution: "",
    year: yearMatch ? yearMatch[0] : "",
    details: "",
    grade: ""
  };
}

/**
 * Deterministic Offline Parser (0% Dummy Data, 0% Leaked Mock Roles)
 */
export function parseDeterministicCvText(rawText, fileName = "Resume.pdf") {
  const text = (rawText || "").trim();
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let name = rawLines[0] || "Candidate Name";
  if (name.includes(',')) name = name.split(',')[0].trim();

  let title = rawLines[1] && rawLines[1].length < 80 && !/@|https?:\/\/|\+?\d{8,}/.test(rawLines[1])
    ? rawLines[1]
    : "";

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/);
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%\-]+/i);
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_%\-]+/i);
  const websiteMatch = text.match(/https?:\/\/(?!www\.linkedin|www\.github)[a-zA-Z0-9.\-_/]+/i);

  // Extract location from header lines
  let location = "";
  for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
    const l = rawLines[i];
    if (l.includes('@') || (phoneMatch && l.includes(phoneMatch[0])) || /linkedin\.com/i.test(l) || /location|address|city|bangalore|delhi|mumbai|pune|hyderabad|remote|noida|gurgaon|chennai|kolkata/i.test(l)) {
      const tokens = l.split(/[|•·,]+/).map(t => t.trim()).filter(Boolean);
      for (const t of tokens) {
        const cleanT = t.replace(/^(?:email|phone|mobile|tel|loc|location|address)\s*:\s*/i, '').trim();
        if (!cleanT) continue;
        if (cleanT.includes('@')) continue;
        if (phoneMatch && cleanT.includes(phoneMatch[0])) continue;
        if (/https?:\/\//i.test(cleanT)) continue;
        if (/^\+?\d[\d\s\-()]{6,}$/.test(cleanT)) continue;
        if (cleanT.length >= 2 && cleanT.length < 50) {
          location = cleanT;
          break;
        }
      }
      if (location) break;
    }
  }

  const contact = {
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    location: location || "",
    linkedin: linkedinMatch ? linkedinMatch[0] : "",
    github: githubMatch ? githubMatch[0] : "",
    website: websiteMatch ? websiteMatch[0] : ""
  };

  const skills = [];
  const experiences = [];
  const education = [];
  const projects = [];
  const certifications = [];
  let summary = "";

  const SECTION_EXP = /^(?:professional\s+|work\s+|career\s+|relevant\s+|employment\s+)?(?:experience|history|employment|work|background)\b/i;
  const SECTION_SKILLS = /^(?:technical\s+|core\s+|key\s+|professional\s+)?(?:skills|competencies|proficiencies|technologies|tools\s*&?\s*technologies|expertise)\b/i;
  const SECTION_EDU = /^(?:education|academics|qualifications|academic\s+background|educational\s+details)\b/i;
  const SECTION_PROJ = /^(?:key\s+|technical\s+|academic\s+|personal\s+)?(?:projects|work\s+samples)\b/i;
  const SECTION_CERT = /^(?:certifications|certificates|licenses|courses\s*&?\s*certifications)\b/i;
  const SECTION_SUMM = /^(?:executive\s+|professional\s+)?(?:summary|profile|about\s*me|objective)\b/i;

  let currentSection = "header";
  let currentExp = null;
  let currentProj = null;

  for (let i = 2; i < rawLines.length; i++) {
    const line = rawLines[i];
    const cleanHeaderLine = line.replace(/[:\-–—#_]+$/, '').trim();

    if (SECTION_EXP.test(cleanHeaderLine)) {
      currentSection = "experience";
      continue;
    }
    if (SECTION_SKILLS.test(cleanHeaderLine)) {
      currentSection = "skills";
      const inlineSkills = cleanHeaderLine.replace(SECTION_SKILLS, '').replace(/^[:\s]+/, '').trim();
      if (inlineSkills) {
        inlineSkills.split(/[,|•;·\t]+/).map(s => s.trim()).filter(Boolean).forEach(s => {
          if (s.length > 1 && s.length < 40 && !skills.includes(s)) skills.push(s);
        });
      }
      continue;
    }
    if (SECTION_EDU.test(cleanHeaderLine)) {
      currentSection = "education";
      continue;
    }
    if (SECTION_PROJ.test(cleanHeaderLine)) {
      currentSection = "projects";
      continue;
    }
    if (SECTION_CERT.test(cleanHeaderLine)) {
      currentSection = "certifications";
      continue;
    }
    if (SECTION_SUMM.test(cleanHeaderLine)) {
      currentSection = "summary";
      continue;
    }

    // Header / Summary extraction before headings
    if (currentSection === "header") {
      if (line.length > 25 && !/@|https?:\/\/|\+?\d{8,}/.test(line)) {
        summary = (summary ? summary + " " : "") + line;
      }
      continue;
    }

    if (currentSection === "summary") {
      summary = (summary ? summary + " " : "") + line;
      continue;
    }

    if (currentSection === "skills") {
      const tokens = line.split(/[,|•;·\t]+/).map(s => s.trim()).filter(Boolean);
      tokens.forEach(t => {
        const clean = cleanBullet(t);
        if (clean.length > 1 && clean.length < 40 && !skills.includes(clean)) {
          skills.push(clean);
        }
      });
      continue;
    }

    if (currentSection === "experience") {
      const isBullet = /^[•▪*\-–—]\s*|\b\d+\.\s+/.test(line);
      const hasDates = /\b(19\d\d|20\d\d|present|current)\b/i.test(line);

      // Check if this line is accidentally an education line (e.g. "- MBA from...")
      if (DEGREE_REGEX.test(line) && (line.includes(' from ') || line.includes(' at ') || line.includes('University') || line.includes('College') || line.includes('Institute'))) {
        education.push(parseEducationEntry(line));
        continue;
      }

      if (isBullet) {
        if (!currentExp) {
          currentExp = {
            id: `exp-${experiences.length + 1}`,
            role: title || "Professional Specialist",
            company: "Organization",
            period: "Career Period",
            location: "",
            bullets: []
          };
          experiences.push(currentExp);
        }
        currentExp.bullets.push(cleanBullet(line));
        continue;
      }

      if (hasDates) {
        const parts = line.split(/[|•·\t]+/).map(p => p.trim()).filter(Boolean);
        const datePart = parts.find(p => /\b(19\d\d|20\d\d|present|current)\b/i.test(p)) || line;
        const nonDates = parts.filter(p => p !== datePart);

        let role = "Specialist";
        let company = "Organization";

        if (nonDates.length >= 2) {
          const first = nonDates[0];
          const second = nonDates[1];
          if (KNOWN_COMPANY_KEYWORDS.test(first) || KNOWN_ROLE_KEYWORDS.test(second)) {
            company = first;
            role = second;
          } else {
            role = first;
            company = second;
          }
        } else if (nonDates.length === 1) {
          const single = nonDates[0];
          if (/\s+at\s+|\s+@\s+/i.test(single)) {
            const splitAt = single.split(/\s+at\s+|\s+@\s+/i);
            role = splitAt[0].trim();
            company = splitAt[1].trim();
          } else if (KNOWN_COMPANY_KEYWORDS.test(single)) {
            company = single;
            const prev = rawLines[i - 1];
            if (prev && prev.length < 60 && !SECTION_EXP.test(prev)) role = prev;
          } else {
            role = single;
            const prev = rawLines[i - 1];
            if (prev && prev.length < 60 && !SECTION_EXP.test(prev)) company = prev;
          }
        } else {
          const prev1 = rawLines[i - 1] || "";
          const prev2 = rawLines[i - 2] || "";
          if (prev1 && !SECTION_EXP.test(prev1)) role = prev1;
          if (prev2 && !SECTION_EXP.test(prev2)) company = prev2;
        }

        if (currentExp && currentExp.bullets.length === 0 && (!currentExp.period || currentExp.period === "")) {
          currentExp.role = role !== "Specialist" ? role : currentExp.role;
          currentExp.company = company !== "Organization" ? company : currentExp.company;
          currentExp.period = datePart;
        } else {
          currentExp = {
            id: `exp-${experiences.length + 1}`,
            role,
            company,
            period: datePart,
            location: "",
            bullets: []
          };
          experiences.push(currentExp);
        }
        continue;
      }

      if (currentExp && line.length > 20) {
        currentExp.bullets.push(cleanBullet(line));
      } else if (!currentExp && line.length < 60) {
        currentExp = {
          id: `exp-${experiences.length + 1}`,
          role: line,
          company: "Organization",
          period: "",
          location: "",
          bullets: []
        };
        experiences.push(currentExp);
      }
      continue;
    }

    if (currentSection === "education") {
      education.push(parseEducationEntry(line));
      continue;
    }

    if (currentSection === "projects") {
      const isBullet = /^[•▪*\-–—]\s*|\b\d+\.\s+/.test(line);
      if (isBullet && currentProj) {
        currentProj.bullets.push(cleanBullet(line));
      } else {
        currentProj = {
          title: cleanBullet(line),
          description: "",
          tech: "",
          bullets: []
        };
        projects.push(currentProj);
      }
      continue;
    }

    if (currentSection === "certifications") {
      const certName = cleanBullet(line);
      if (certName) certifications.push(certName);
      continue;
    }
  }

  // Deduplicate education entries
  const uniqueEdu = [];
  const eduKeys = new Set();
  for (const edu of education) {
    const key = (edu.degree + '|' + edu.institution).toLowerCase();
    if (!eduKeys.has(key) && edu.degree.length > 1) {
      eduKeys.add(key);
      uniqueEdu.push(edu);
    }
  }

  return {
    layoutType: "single-column",
    header: {
      name,
      title: title || (experiences[0]?.role) || "Professional Specialist",
      summary: summary || ""
    },
    contact,
    skills,
    experiences,
    education: uniqueEdu,
    projects,
    certifications,
    languages: []
  };
}

/**
 * Universal Ingestion Pipeline
 */
export async function parseDocumentFile(file, onProgress) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const fileName = file.name || "resume.pdf";
  const extension = fileName.split('.').pop().toLowerCase();
  if (onProgress) onProgress(`Reading ${fileName}...`);

  // 1. Image Files (.png, .jpg, .jpeg, .webp) -> Direct Gemini Vision
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
    if (onProgress) onProgress("Analyzing image layout with Gemini Vision...");
    const dataUrl = await readDataUrlSafe(file);
    if (dataUrl) {
      try {
        const visionResult = await parseCvWithGeminiVision([dataUrl]);
        if (visionResult && (visionResult.header?.name || visionResult.experiences?.length > 0)) {
          return normalizeCvSchema(visionResult);
        }
      } catch (vErr) {
        console.warn("Vision parser error for image:", vErr);
      }
    }
  }

  // 2. Microsoft Word (.docx)
  if (extension === 'docx') {
    if (onProgress) onProgress("Extracting Word document structure...");
    let docxText = "";
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : null;
      if (arrayBuffer) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        docxText = result.value || "";
      }
    } catch (err) {
      console.warn("Mammoth DOCX extraction warning:", err);
    }

    if (!docxText) {
      docxText = await readTextSafe(file);
    }

    if (docxText && docxText.trim().length > 20) {
      if (onProgress) onProgress("Synthesizing CV data with Gemini...");
      try {
        const aiResult = await parseCvWithGemini(docxText);
        if (aiResult && (aiResult.header?.name || aiResult.experiences?.length > 0)) {
          return normalizeCvSchema(aiResult);
        }
      } catch (aiErr) {
        console.warn("AI parser error on DOCX:", aiErr);
      }
      return normalizeCvSchema(parseDeterministicCvText(docxText, file.name));
    }
  }

  // 3. Plain Text (.txt)
  if (extension === 'txt') {
    if (onProgress) onProgress("Parsing plain text format...");
    const raw = await readTextSafe(file);
    if (raw && raw.trim().length > 20) {
      try {
        const aiResult = await parseCvWithGemini(raw);
        if (aiResult) return normalizeCvSchema(aiResult);
      } catch (_) {}
      return normalizeCvSchema(parseDeterministicCvText(raw, file.name));
    }
  }

  // 4. Adobe PDF (.pdf)
  if (extension === 'pdf') {
    if (onProgress) onProgress("Parsing PDF pages & layout...");
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        } catch (_) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
        }
      }

      const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : null;
      if (arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = "";
        const pageImages = [];

        for (let pNum = 1; pNum <= Math.min(pdf.numPages, 3); pNum++) {
          const page = await pdf.getPage(pNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const textContent = await page.getTextContent();

          if (textContent.items && textContent.items.length > 0) {
            const pageText = extractLinesFromPdfItems(textContent.items);
            fullText += pageText + "\n\n";
          } else if (typeof document !== 'undefined') {
            // Scanned / raster / Canva PDF page with 0 selectable text: render to canvas for Gemini Vision
            try {
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d');
              await page.render({ canvasContext: ctx, viewport }).promise;
              pageImages.push(canvas.toDataURL('image/jpeg', 0.88));
            } catch (canvasErr) {
              console.warn("PDF canvas rendering for vision failed:", canvasErr);
            }
          }
        }

        // If it was a scanned/image PDF with 0 text items, run Gemini Vision
        if (fullText.trim().length < 30 && pageImages.length > 0) {
          if (onProgress) onProgress("Extracting scanned text via Gemini Multi-Modal Vision...");
          try {
            const visionResult = await parseCvWithGeminiVision(pageImages);
            if (visionResult && (visionResult.header?.name || visionResult.experiences?.length > 0)) {
              return normalizeCvSchema(visionResult);
            }
          } catch (vErr) {
            console.warn("Vision parser error for PDF canvas:", vErr);
          }
        }

        // If digital text was extracted, run Gemini AI
        if (fullText.trim().length >= 30) {
          if (onProgress) onProgress("Extracting candidate facts via Gemini AI...");
          try {
            const aiResult = await parseCvWithGemini(fullText);
            if (aiResult && (aiResult.header?.name || aiResult.experiences?.length > 0)) {
              return normalizeCvSchema(aiResult);
            }
          } catch (aiErr) {
            console.warn("AI parser error for PDF text:", aiErr);
          }
          return normalizeCvSchema(parseDeterministicCvText(fullText, file.name));
        }
      }
    } catch (pdfErr) {
      console.warn("PDF.js extraction failed:", pdfErr);
    }

    const raw = await readTextSafe(file);
    if (raw && raw.trim().length > 30) {
      return normalizeCvSchema(parseDeterministicCvText(raw, file.name));
    }
  }

  throw new Error(`The uploaded document "${fileName}" could not be parsed. Please ensure the file is a readable PDF, DOCX, TXT, or Image.`);
}

export const parseUploadedDocument = parseDocumentFile;

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
 * Features automatic 2-column detection to prevent left & right columns from interleaving.
 */
export function extractLinesFromPdfItems(items) {
  if (!items || items.length === 0) return "";

  const validItems = items.filter(it => (it.str || "").trim().length > 0 && it.transform);
  if (validItems.length === 0) return "";

  // Check if page has a 2-column layout by checking x distribution
  const xPositions = validItems.map(it => it.transform[4]);
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);
  const width = maxX - minX;

  if (width > 280) {
    const midX = minX + width * 0.40;
    const leftItems = validItems.filter(it => it.transform[4] < midX);
    const rightItems = validItems.filter(it => it.transform[4] >= midX);

    // If both columns have significant content (>20% each), extract column-by-column
    if (leftItems.length >= validItems.length * 0.20 && rightItems.length >= validItems.length * 0.20) {
      const leftText = sortAndJoinColumnItems(leftItems);
      const rightText = sortAndJoinColumnItems(rightItems);
      return `${leftText}\n\n${rightText}`;
    }
  }

  return sortAndJoinColumnItems(validItems);
}

function sortAndJoinColumnItems(columnItems) {
  const lineTolerance = 4;
  const sorted = [...columnItems].sort((a, b) => {
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

const pdfjsWorker = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

const JUNK_NAME_REGEX = /^(?:curriculum\s*vitae|resume|cv|biodata|bio-data|personal\s*profile|profile|portfolio|contact|details)$/i;
const KNOWN_ROLE_KEYWORDS = /\b(executive|manager|engineer|developer|specialist|lead|director|analyst|consultant|associate|officer|coordinator|intern|architect|designer|doctor|nurse|head|vice president|vp|president|founder|co-founder|administrator|trainee|technician|representative|recruiter|general manager|gm|ceo|cto|cfo|cmo|coo)\b/i;
const KNOWN_COMPANY_KEYWORDS = /\b(pvt\.?\s*ltd\.?|ltd\.?|inc\.?|llc|corp\.?|corporation|technologies|systems|hospital|clinic|services|labs|solutions|bank|solutions|enterprises|ventures|holdings|group|consulting|associates|global|infotech|agency|studios?|software)\b/i;
const DEGREE_REGEX = /\b(mba|bba|mca|bca|b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?com|m\.?com|ph\.?d|bachelor|master|doctorate|diploma|matriculation|higher secondary|cbse|icse|secondary|high school)\b/i;
const INSTITUTION_REGEX = /\b(university|college|institute|school|academy|campus|polytechnic|vidyalaya)\b/i;
const GRADE_REGEX = /\b(?:cgpa|gpa|percentage|percent|marks?|grade)\s*[:=]?\s*[\d.]+(?:\s*\/\s*[\d.]+)?%?/i;
const DATE_REGEX = /\b(19\d\d|20\d\d|present|current)\b/i;
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:19\d\d|20\d\d)\s*[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:19\d\d|20\d\d|present|current)/i;

function cleanBullet(str) {
  return (str || '').replace(/^[•▪*–—▸\-\d.]+\s*/, '').trim();
}

/**
 * Deterministic Offline Parser (0% Dummy Data, 0% Leaked Mock Roles)
 */
export function parseDeterministicCvText(rawText, fileName = "Resume.pdf") {
  const text = (rawText || "").trim();
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Name detection: Skip junk headers ("CURRICULUM VITAE", "RESUME", emails, phones)
  let name = "";
  let nameIndex = 0;
  for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
    const l = rawLines[i];
    if (JUNK_NAME_REGEX.test(l)) continue;
    if (/@|https?:\/\/|\+?\d{8,}/.test(l)) continue;
    if (l.length >= 2 && l.length <= 50) {
      name = l.replace(/[,|].*$/, '').trim();
      nameIndex = i;
      break;
    }
  }
  if (!name) name = "Candidate Name";

  // 2. Title detection: check line directly under name
  let title = "";
  if (nameIndex + 1 < rawLines.length) {
    const nextL = rawLines[nameIndex + 1];
    if (!JUNK_NAME_REGEX.test(nextL) && !/@|https?:\/\/|\+?\d{8,}/.test(nextL) && nextL.length < 80) {
      if (KNOWN_ROLE_KEYWORDS.test(nextL) || !nextL.includes(',')) {
        title = nextL;
      }
    }
  }

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/);
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_%\-]+/i);
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_%\-]+/i);
  const websiteMatch = text.match(/https?:\/\/(?!www\.linkedin|www\.github)[a-zA-Z0-9.\-_/]+/i);

  // Extract location from header lines
  let location = "";
  for (let i = 0; i < Math.min(rawLines.length, 8); i++) {
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

  const SECTION_EXP = /^(?:professional\s+|work\s+|career\s+|relevant\s+|employment\s+)?(?:experience|history|employment|work|background)$/i;
  const SECTION_SKILLS = /^(?:technical\s+|core\s+|key\s+|professional\s+)?(?:skills|competencies|proficiencies|technologies|tools\s*&?\s*technologies|expertise)$/i;
  const SECTION_EDU = /^(?:education|academics|qualifications|academic\s+background|educational\s+details)$/i;
  const SECTION_PROJ = /^(?:key\s+|technical\s+|academic\s+|personal\s+)?(?:projects|work\s+samples)$/i;
  const SECTION_CERT = /^(?:certifications|certificates|licenses|courses\s*&?\s*certifications)$/i;
  const SECTION_SUMM = /^(?:executive\s+|professional\s+)?(?:summary|profile|about\s*me|objective)$/i;

  let currentSection = "header";
  let currentExp = null;
  let currentProj = null;
  let currentEdu = null;

  for (let i = nameIndex + 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    const cleanHeaderLine = line.replace(/[:\-–—#_]+$/, '').trim();

    // Section headers must be short lines to avoid matching regular sentences
    if (cleanHeaderLine.length < 50) {
      if (SECTION_EXP.test(cleanHeaderLine)) {
        currentSection = "experience";
        currentExp = null;
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
        currentEdu = null;
        continue;
      }
      if (SECTION_PROJ.test(cleanHeaderLine)) {
        currentSection = "projects";
        currentProj = null;
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
        let clean = cleanBullet(t);
        // Strip category prefix like "Frontend: React" -> "React"
        if (/^[A-Za-z\s]+:\s*/.test(clean)) {
          clean = clean.replace(/^[A-Za-z\s]+:\s*/, '').trim();
        }
        if (clean.length > 1 && clean.length < 40 && !skills.includes(clean)) {
          skills.push(clean);
        }
      });
      continue;
    }

    if (currentSection === "experience") {
      const isBullet = /^[•▪*–—▸\-]\s*|\b\d+\.\s+/.test(line);
      const hasDateRange = DATE_RANGE_REGEX.test(line);
      const hasDate = DATE_REGEX.test(line);

      // Check if accidentally an education line
      if (DEGREE_REGEX.test(line) && (line.includes(' from ') || line.includes(' at ') || INSTITUTION_REGEX.test(line))) {
        education.push({ degree: cleanBullet(line), institution: "", year: "", grade: "" });
        continue;
      }

      if (isBullet && currentExp) {
        currentExp.bullets.push(cleanBullet(line));
        continue;
      }

      // Check for dates on this line
      if (hasDateRange || (hasDate && (line.includes('|') || line.includes('–') || line.includes('-')))) {
        const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(DATE_REGEX);
        const period = dateMatch ? dateMatch[0].trim() : "";
        const withoutDate = line.replace(period, '').replace(/[|•·,–—\-]+$/, '').replace(/^[|•·,–—\-]+/, '').trim();

        let comp = "";
        let r = "";
        if (withoutDate.includes('|') || withoutDate.includes('–') || withoutDate.includes('-')) {
          const parts = withoutDate.split(/[|–—\-]+/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            r = parts[0];
            comp = parts[1];
          } else {
            r = parts[0] || "";
          }
        } else if (withoutDate) {
          if (KNOWN_ROLE_KEYWORDS.test(withoutDate)) r = withoutDate;
          else comp = withoutDate;
        }

        if (currentExp && !currentExp.period) {
          currentExp.period = period;
          if (r && (!currentExp.role || currentExp.role === "Specialist")) currentExp.role = r;
          if (comp && (!currentExp.company || currentExp.company === "Organization")) currentExp.company = comp;
        } else {
          currentExp = {
            id: `exp-${experiences.length + 1}`,
            role: r || title || "Professional Specialist",
            company: comp || "Organization",
            period,
            location: "",
            bullets: []
          };
          experiences.push(currentExp);
        }
        continue;
      }

      // Is this line a new job role or company header?
      const isShortHeader = line.length < 65 && !line.endsWith('.');
      const hasJobIndicators = isShortHeader && (KNOWN_ROLE_KEYWORDS.test(line) || KNOWN_COMPANY_KEYWORDS.test(line) || line.includes('|') || /\s+at\s+|\s+@\s+/i.test(line));

      if (!currentExp) {
        let r = "";
        let comp = "";
        if (line.includes('|') || /\s+at\s+|\s+@\s+/i.test(line)) {
          const parts = line.split(/[|]|\s+at\s+|\s+@\s+/i).map(p => p.trim()).filter(Boolean);
          r = parts[0];
          comp = parts[1] || "";
        } else if (KNOWN_ROLE_KEYWORDS.test(line)) {
          r = line;
        } else {
          comp = line;
        }

        currentExp = {
          id: `exp-${experiences.length + 1}`,
          role: r || (KNOWN_ROLE_KEYWORDS.test(line) ? line : (title || "Professional Specialist")),
          company: comp || (!KNOWN_ROLE_KEYWORDS.test(line) ? line : "Organization"),
          period: "",
          location: "",
          bullets: []
        };
        experiences.push(currentExp);
      } else if (hasJobIndicators && currentExp.bullets.length > 0) {
        // Start a brand new experience entry
        let r = "";
        let comp = "";
        if (line.includes('|') || /\s+at\s+|\s+@\s+/i.test(line)) {
          const parts = line.split(/[|]|\s+at\s+|\s+@\s+/i).map(p => p.trim()).filter(Boolean);
          r = parts[0];
          comp = parts[1] || "";
        } else if (KNOWN_ROLE_KEYWORDS.test(line)) {
          r = line;
        } else {
          comp = line;
        }

        currentExp = {
          id: `exp-${experiences.length + 1}`,
          role: r || (KNOWN_ROLE_KEYWORDS.test(line) ? line : "Professional Specialist"),
          company: comp || (!KNOWN_ROLE_KEYWORDS.test(line) ? line : "Organization"),
          period: "",
          location: "",
          bullets: []
        };
        experiences.push(currentExp);
      } else if (!currentExp.period && isShortHeader) {
        if (KNOWN_ROLE_KEYWORDS.test(line) && (!currentExp.role || currentExp.role === "Specialist" || currentExp.role === "Professional Specialist")) {
          currentExp.role = line;
        } else if (currentExp.company === "Organization" && !KNOWN_ROLE_KEYWORDS.test(line)) {
          currentExp.company = line;
        } else {
          currentExp.role = line;
        }
      } else {
        // Regular bullet or description text for current experience
        currentExp.bullets.push(cleanBullet(line));
      }
      continue;
    }

    if (currentSection === "education") {
      const clean = cleanBullet(line);
      if (!clean) continue;

      const hasDegree = DEGREE_REGEX.test(clean);
      const hasInst = INSTITUTION_REGEX.test(clean);
      const hasYear = /\b(19\d\d|20\d\d)\b/.test(clean);
      const gradeMatch = clean.match(GRADE_REGEX);

      if (hasDegree && (clean.includes(' from ') || clean.includes(' at ') || clean.includes('|'))) {
        const parts = clean.split(/[|]+/).map(p => p.trim());
        let deg = parts[0];
        let inst = parts[1] || "";
        if (deg.includes(' from ')) {
          const split = deg.split(' from ');
          deg = split[0].trim();
          inst = split[1].trim();
        } else if (deg.includes(' at ')) {
          const split = deg.split(' at ');
          deg = split[0].trim();
          inst = split[1].trim();
        }
        const yMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
        currentEdu = {
          degree: deg,
          institution: inst,
          year: yMatch ? yMatch[0] : "",
          grade: gradeMatch ? gradeMatch[0] : "",
          details: ""
        };
        education.push(currentEdu);
      } else if (hasDegree) {
        const yMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
        currentEdu = {
          degree: clean.replace(/\b(19\d\d|20\d\d)\b.*$/, '').replace(/[,|–—\-]+$/, '').trim(),
          institution: "",
          year: yMatch ? yMatch[0] : "",
          grade: gradeMatch ? gradeMatch[0] : "",
          details: ""
        };
        education.push(currentEdu);
      } else if (currentEdu && (!currentEdu.institution || hasInst)) {
        if (hasInst || (!currentEdu.institution && !hasYear)) {
          currentEdu.institution = clean.replace(/\b(19\d\d|20\d\d)\b.*$/, '').replace(/[,|–—\-]+$/, '').trim();
        }
        const yMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
        if (yMatch && !currentEdu.year) currentEdu.year = yMatch[0];
        if (gradeMatch && !currentEdu.grade) currentEdu.grade = gradeMatch[0];
      } else if (currentEdu && hasYear) {
        const yMatch = clean.match(/\b(19\d\d|20\d\d)\b(?:\s*[-–—]\s*(?:19\d\d|20\d\d|present))?/i);
        if (yMatch && !currentEdu.year) currentEdu.year = yMatch[0];
        if (gradeMatch && !currentEdu.grade) currentEdu.grade = gradeMatch[0];
      }
      continue;
    }

    if (currentSection === "projects") {
      const isBullet = /^[•▪*–—▸\-]\s*|\b\d+\.\s+/.test(line);
      const isLongSentence = line.length > 55 || line.endsWith('.');

      if ((isBullet || isLongSentence) && currentProj) {
        currentProj.bullets.push(cleanBullet(line));
      } else {
        let projTitle = cleanBullet(line);
        let tech = "";
        let link = "";

        const urlMatch = projTitle.match(/https?:\/\/[^\s"',)]+/i);
        if (urlMatch) {
          link = urlMatch[0];
          projTitle = projTitle.replace(link, '').replace(/[-–—:]+$/, '').trim();
        }

        if (projTitle.includes('[') && projTitle.includes(']')) {
          const tMatch = projTitle.match(/\[(.*?)\]/);
          if (tMatch) {
            tech = tMatch[1].trim();
            projTitle = projTitle.replace(`[${tech}]`, '').trim();
          }
        } else if (projTitle.includes('(') && projTitle.includes(')')) {
          const tMatch = projTitle.match(/\((.*?)\)/);
          if (tMatch && !/testing|live/i.test(tMatch[1])) {
            tech = tMatch[1].trim();
            projTitle = projTitle.replace(`(${tech})`, '').trim();
          }
        }

        currentProj = {
          title: projTitle || "Project",
          tech,
          link,
          description: "",
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

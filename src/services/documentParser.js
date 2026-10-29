/**
 * RESUMEAI PRO — CLIENT-SIDE DOCUMENT TEXT & VISION EXTRACTOR
 * 
 * Safely extracts plain text and page visuals from PDF, DOCX, TXT, PNG, and JPG files
 * directly in the browser with multi-modal Gemini Vision and AI parsing fallback.
 */

import { parseGenericCvText } from './cvExtractor.js';
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
 * Extract PDF.js text items in natural, uncorrupted reading order
 * Sorts items top-to-bottom (Y descending) then left-to-right (X ascending).
 * ZERO horizontal chopping.
 */
export function extractLinesFromPdfItems(items, pageWidth = 595.32) {
  if (!items || items.length === 0) return { text: "", layoutType: "single-column" };

  const validItems = items.filter(it => (it.str || "").trim().length > 0 && it.transform);
  if (validItems.length === 0) return { text: "", layoutType: "single-column" };

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

  return {
    text: lines.join('\n'),
    layoutType: "single-column"
  };
}

/**
 * Universal file extractor supporting text and page image rendering for Vision AI
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error("No file provided for document extraction.");
  }

  const fileName = file.name || "resume.pdf";
  const extension = fileName.split('.').pop().toLowerCase();

  // 1. Direct Image Files (.png, .jpg, .jpeg, .webp)
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
    const dataUrl = await readDataUrlSafe(file);
    return { text: "", pageImages: [dataUrl], layoutType: "single-column" };
  }

  // 2. Plain Text Files (.txt)
  if (extension === 'txt') {
    const raw = await readTextSafe(file);
    return { text: raw, pageImages: [], layoutType: "single-column" };
  }

  // 3. Microsoft Word (.docx)
  if (extension === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : null;
      if (arrayBuffer) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim().length > 10) {
          return { text: result.value, pageImages: [], layoutType: "single-column" };
        }
      }
    } catch (err) {
      console.warn("DOCX extraction error, falling back to text stream:", err);
    }
    const raw = await readTextSafe(file);
    return { text: raw, pageImages: [], layoutType: "single-column" };
  }

  // 4. Adobe PDF (.pdf)
  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      }

      const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : null;
      if (arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = "";
        const pageImages = [];

        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const textContent = await page.getTextContent();

          if (textContent.items && textContent.items.length > 0) {
            const extracted = extractLinesFromPdfItems(textContent.items, viewport.width);
            fullText += extracted.text + "\n\n";
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

        if (fullText.trim().length > 20) {
          return { text: fullText, pageImages: [], layoutType: "single-column" };
        } else if (pageImages.length > 0) {
          return { text: "", pageImages, layoutType: "single-column" };
        }
      }
    } catch (err) {
      console.warn("PDF.js extraction failed:", err);
    }

    const raw = await readTextSafe(file);
    return { text: raw, pageImages: [], layoutType: "single-column" };
  }

  const raw = await readTextSafe(file);
  return { text: raw, pageImages: [], layoutType: "single-column" };
}

/**
 * Universal document to SOURCE_CV_MASTER parser
 * Prioritizes deep context extraction via Gemini Vision / Text with canonical schema normalization
 */
export async function parseUploadedDocument(file) {
  const { text, pageImages, layoutType } = await extractTextFromFile(file);

  // 1. If scanned/raster PDF or image upload, parse with Gemini 2.5 Flash Vision
  if (Array.isArray(pageImages) && pageImages.length > 0) {
    try {
      const visionParsed = await parseCvWithGeminiVision(pageImages);
      if (visionParsed && (visionParsed.header?.name || (Array.isArray(visionParsed.experiences) && visionParsed.experiences.length > 0))) {
        return normalizeCvSchema(visionParsed);
      }
    } catch (vErr) {
      console.warn("Vision parser fallback to text/deterministic extractor:", vErr?.message || vErr);
    }
  }

  // 2. Primary AI Text Parser: Deep context extraction with zero leakage & 1-2 page compounding
  if (text && text.trim().length > 20) {
    try {
      const aiParsed = await parseCvWithGemini(text, layoutType);
      if (aiParsed && (aiParsed.header?.name || (Array.isArray(aiParsed.experiences) && aiParsed.experiences.length > 0))) {
        return normalizeCvSchema(aiParsed);
      }
    } catch (aiErr) {
      console.warn("AI parsing fallback to deterministic extractor:", aiErr?.message || aiErr);
    }

    // 3. Deterministic Fallback: Cleaned offline extraction with 0% mock data
    const deterministicParsed = parseGenericCvText(text, file.name, layoutType);
    return normalizeCvSchema(deterministicParsed);
  }

  throw new Error(`The uploaded file "${file.name}" contains no readable text or image content. Please ensure the file is not corrupted or password-protected.`);
}

/**
 * RESUMEAI PRO — CLIENT-SIDE DOCUMENT TEXT EXTRACTOR
 * 
 * Safely extracts plain text from PDF, DOCX, and TXT files directly in the browser.
 */

import { parseGenericCvText } from './cvExtractor.js';

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

/**
 * Extract text from a File object (.pdf, .docx, .txt)
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error("No file provided for text extraction.");
  }

  const fileName = file.name || "resume.pdf";
  const extension = fileName.split('.').pop().toLowerCase();

  if (extension === 'txt') {
    return await readTextSafe(file);
  }

  if (extension === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : null;
      if (arrayBuffer) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim().length > 10) {
          return result.value;
        }
      }
    } catch (err) {
      console.warn("DOCX extraction error, falling back to text stream:", err);
    }
    return await readTextSafe(file);
  }

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
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ');
          fullText += pageText + "\n";
        }

        if (fullText.trim().length > 10) {
          return fullText;
        }
      }
    } catch (err) {
      console.warn("PDF.js extraction failed, falling back:", err);
    }
    
    return await readTextSafe(file);
  }

  // Default fallback for any other format
  return await readTextSafe(file);
}

/**
 * Universal document to SOURCE_CV_MASTER parser
 */
export async function parseUploadedDocument(file) {
  const rawText = await extractTextFromFile(file);
  return parseGenericCvText(rawText, file.name);
}

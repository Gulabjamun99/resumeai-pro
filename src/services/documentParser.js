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
 * Group PDF.js text items into clean layout lines using Y coordinates
 */
/**
 * Group PDF.js text items into clean layout lines using spatial column decomposition
 */
export function extractLinesFromPdfItems(items) {
  if (!items || items.length === 0) return { text: "", layoutType: "single-column" };

  const validItems = items.filter(it => (it.str || "").trim().length > 0);
  if (validItems.length === 0) return { text: "", layoutType: "single-column" };

  // Analyze X-coordinates to detect column boundary
  let leftCount = 0;
  let rightCount = 0;
  validItems.forEach(it => {
    const x = it.transform ? it.transform[4] : 0;
    if (x < 210) leftCount++;
    else rightCount++;
  });

  const total = validItems.length;
  const isTwoColumn = leftCount >= 3 && rightCount >= 3 && (leftCount / total) >= 0.15 && (rightCount / total) >= 0.15;
  const splitX = 210;
  const lineTolerance = 4;

  const extractColumnLines = (colItems) => {
    const sorted = [...colItems].sort((a, b) => {
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
  };

  if (isTwoColumn) {
    const leftItems = validItems.filter(it => (it.transform ? it.transform[4] : 0) < splitX);
    const rightItems = validItems.filter(it => (it.transform ? it.transform[4] : 0) >= splitX);

    const sidebarLines = extractColumnLines(leftItems);
    const mainLines = extractColumnLines(rightItems);

    return {
      text: `${mainLines}\n\nCONTACT_SIDEBAR\n${sidebarLines}`,
      layoutType: "two-column-left-sidebar"
    };
  }

  return {
    text: extractColumnLines(validItems),
    layoutType: "single-column"
  };
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
    const raw = await readTextSafe(file);
    return { text: raw, layoutType: "single-column" };
  }

  if (extension === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : null;
      if (arrayBuffer) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim().length > 10) {
          return { text: result.value, layoutType: "single-column" };
        }
      }
    } catch (err) {
      console.warn("DOCX extraction error, falling back to text stream:", err);
    }
    const raw = await readTextSafe(file);
    return { text: raw, layoutType: "single-column" };
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
        let detectedLayout = "single-column";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const extracted = extractLinesFromPdfItems(textContent.items);
          if (extracted.layoutType === "two-column-left-sidebar") {
            detectedLayout = "two-column-left-sidebar";
          }
          fullText += extracted.text + "\n\n";
        }

        if (fullText.trim().length > 10) {
          return { text: fullText, layoutType: detectedLayout };
        }
      }
    } catch (err) {
      console.warn("PDF.js extraction failed, falling back:", err);
    }
    
    const raw = await readTextSafe(file);
    return { text: raw, layoutType: "single-column" };
  }

  const raw = await readTextSafe(file);
  return { text: raw, layoutType: "single-column" };
}

/**
 * Universal document to SOURCE_CV_MASTER parser
 */
export async function parseUploadedDocument(file) {
  const { text, layoutType } = await extractTextFromFile(file);
  return parseGenericCvText(text, file.name, layoutType);
}

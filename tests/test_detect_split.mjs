import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export function detectPdfColumnSplit(items, pageWidth = 595) {
  const validItems = items.filter(it => (it.str || "").trim().length > 0);
  if (validItems.length === 0) return { isTwoColumn: false, splitX: 0 };

  const xList = validItems.map(it => it.transform ? it.transform[4] : 0).sort((a, b) => a - b);
  
  // Look for the most significant horizontal gap in the range [0.10 * width, 0.40 * width]
  const minX = 0.10 * pageWidth; // ~60px
  const maxX = 0.40 * pageWidth; // ~238px

  let bestSplitX = 0;
  let maxGap = 0;

  for (let i = 0; i < xList.length - 1; i++) {
    const x1 = xList[i];
    const x2 = xList[i + 1];
    if (x1 >= minX - 10 && x2 <= maxX + 20) {
      const gap = x2 - x1;
      if (gap > maxGap && gap >= 20) { // Gap must be at least 20px wide
        maxGap = gap;
        bestSplitX = (x1 + x2) / 2;
      }
    }
  }

  // Also check density on both sides
  if (bestSplitX > 0) {
    const leftCount = validItems.filter(it => (it.transform ? it.transform[4] : 0) < bestSplitX).length;
    const rightCount = validItems.filter(it => (it.transform ? it.transform[4] : 0) >= bestSplitX).length;
    const total = validItems.length;

    if (leftCount >= 3 && rightCount >= 5 && (leftCount / total) >= 0.08 && (rightCount / total) >= 0.20) {
      return { isTwoColumn: true, splitX: bestSplitX, gap: maxGap, leftCount, rightCount };
    }
  }

  return { isTwoColumn: false, splitX: 0 };
}

async function runTest() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent();

  const splitResult = detectPdfColumnSplit(content.items, viewport.width);
  console.log("Column Split Result:", splitResult);

  if (splitResult.isTwoColumn) {
    const leftItems = content.items.filter(it => it.transform && it.transform[4] < splitResult.splitX && (it.str || "").trim());
    const rightItems = content.items.filter(it => it.transform && it.transform[4] >= splitResult.splitX && (it.str || "").trim());

    console.log(`\n--- LEFT SIDEBAR EXTRACT (${leftItems.length} items) ---`);
    console.log(leftItems.map(i => i.str).join(' | '));

    console.log(`\n--- RIGHT MAIN COLUMN EXTRACT (${rightItems.length} items) ---`);
    console.log(rightItems.slice(0, 30).map(i => i.str).join(' | '));
  }
}

runTest().catch(console.error);

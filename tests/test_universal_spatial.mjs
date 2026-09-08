import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

// Universal Spatial Column Splitter
export function extractLinesFromPdfItemsUniversal(items, pageWidth = 595.32) {
  const validItems = items.filter(it => (it.str || "").trim().length > 0);
  if (validItems.length === 0) return { text: "", layoutType: "single-column" };

  // Detect column boundary: Find gap in X between 0.12 * width and 0.45 * width
  const minSplit = 0.10 * pageWidth; // ~60
  const maxSplit = 0.45 * pageWidth; // ~267

  const xList = validItems.map(it => it.transform ? it.transform[4] : 0).sort((a, b) => a - b);
  
  let bestSplitX = 0;
  let maxGap = 0;

  for (let i = 0; i < xList.length - 1; i++) {
    const x1 = xList[i];
    const x2 = xList[i + 1];
    if (x1 >= minSplit && x2 <= maxSplit) {
      const gap = x2 - x1;
      if (gap > maxGap && gap >= 15) {
        maxGap = gap;
        bestSplitX = (x1 + x2) / 2;
      }
    }
  }

  const leftCount = bestSplitX > 0 ? validItems.filter(it => (it.transform ? it.transform[4] : 0) < bestSplitX).length : 0;
  const rightCount = bestSplitX > 0 ? validItems.filter(it => (it.transform ? it.transform[4] : 0) >= bestSplitX).length : 0;
  const isTwoColumn = bestSplitX > 0 && leftCount >= 3 && rightCount >= 5;

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
    return lines;
  };

  if (isTwoColumn) {
    const leftItems = validItems.filter(it => (it.transform ? it.transform[4] : 0) < bestSplitX);
    const rightItems = validItems.filter(it => (it.transform ? it.transform[4] : 0) >= bestSplitX);

    return {
      sidebarLines: extractColumnLines(leftItems),
      mainLines: extractColumnLines(rightItems),
      layoutType: "two-column-left-sidebar",
      splitX: bestSplitX
    };
  }

  return {
    sidebarLines: [],
    mainLines: extractColumnLines(validItems),
    layoutType: "single-column",
    splitX: 0
  };
}

async function testExtraction() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent();

  const res = extractLinesFromPdfItemsUniversal(content.items, viewport.width);
  console.log(`Detected Layout: ${res.layoutType}, SplitX: ${res.splitX}`);
  console.log(`Sidebar Lines (${res.sidebarLines.length}):`);
  res.sidebarLines.forEach(l => console.log(`  [SIDEBAR] ${l}`));
  console.log(`\nMain Lines (${res.mainLines.length}):`);
  res.mainLines.slice(0, 20).forEach(l => console.log(`  [MAIN] ${l}`));
}

testExtraction().catch(console.error);

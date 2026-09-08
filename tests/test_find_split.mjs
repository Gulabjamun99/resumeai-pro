import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export function findRobustColumnSplit(items, pageWidth = 595.32) {
  // Only consider items with at least 3 characters (ignore isolated punctuation like ':' or '•')
  const wordItems = items.filter(it => (it.str || "").trim().length >= 3 && it.transform);
  if (wordItems.length < 10) return { isTwoColumn: false, splitX: 0 };

  const xList = wordItems.map(it => it.transform[4]).sort((a, b) => a - b);

  // Search for the primary column gutter between 10% and 40% of page width
  const minGutter = 0.08 * pageWidth; // ~47px
  const maxGutter = 0.40 * pageWidth; // ~238px

  let bestSplitX = 0;
  let maxGap = 0;

  for (let i = 0; i < xList.length - 1; i++) {
    const x1 = xList[i];
    const x2 = xList[i + 1];
    if (x1 >= minGutter && x2 <= maxGutter) {
      const gap = x2 - x1;
      if (gap > maxGap && gap >= 25) {
        maxGap = gap;
        bestSplitX = (x1 + x2) / 2;
      }
    }
  }

  // If no gap found within [minGutter, maxGutter], check if items cluster below 135px vs above 135px
  if (bestSplitX === 0) {
    const leftCluster = wordItems.filter(it => it.transform[4] < 110).length;
    const rightCluster = wordItems.filter(it => it.transform[4] >= 110).length;
    if (leftCluster >= 5 && rightCluster >= 15) {
      bestSplitX = 110;
      maxGap = 50;
    }
  }

  const leftCount = wordItems.filter(it => it.transform[4] < bestSplitX).length;
  const rightCount = wordItems.filter(it => it.transform[4] >= bestSplitX).length;
  const isTwoColumn = bestSplitX > 0 && leftCount >= 4 && rightCount >= 10;

  return { isTwoColumn, splitX: bestSplitX, maxGap, leftCount, rightCount };
}

async function test() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent();

  const split = findRobustColumnSplit(content.items, viewport.width);
  console.log("Split Result:", split);
}

test().catch(console.error);

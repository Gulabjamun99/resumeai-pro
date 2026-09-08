import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function testDynamicSplit() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  const width = viewport.width || 595;
  console.log(`Page Width: ${width}`);

  // Find all X coordinates
  const xCoords = validItems.map(it => it.transform[4]).sort((a, b) => a - b);
  
  // Test gap detection between 0.18*width and 0.45*width (approx 100px to 250px)
  const minSplit = 0.18 * width; // ~107
  const maxSplit = 0.45 * width; // ~267

  // Histogram of X
  let bestSplitX = 135;
  let maxGap = 0;

  for (let i = 0; i < xCoords.length - 1; i++) {
    const x1 = xCoords[i];
    const x2 = xCoords[i + 1];
    if (x1 >= minSplit - 20 && x2 <= maxSplit + 20) {
      const gap = x2 - x1;
      if (gap > maxGap) {
        maxGap = gap;
        bestSplitX = (x1 + x2) / 2;
      }
    }
  }

  console.log(`Optimal dynamic splitX: ${bestSplitX.toFixed(1)} (Max Gap: ${maxGap.toFixed(1)}px)`);

  const leftItems = validItems.filter(it => it.transform[4] < bestSplitX);
  const rightItems = validItems.filter(it => it.transform[4] >= bestSplitX);

  console.log(`Left Sidebar Items (${leftItems.length}):`);
  leftItems.slice(0, 15).forEach(it => console.log(`  [LEFT] ${it.str}`));

  console.log(`\nRight Main Column Items (${rightItems.length}):`);
  rightItems.slice(0, 15).forEach(it => console.log(`  [RIGHT] ${it.str}`));
}

testDynamicSplit().catch(console.error);

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function testPdf() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log(`PDF Pages: ${doc.numPages}`);

  for (let pageNum = 1; pageNum <= Math.min(2, doc.numPages); pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    console.log(`\n=== PAGE ${pageNum} (Width: ${viewport.width}, Height: ${viewport.height}) ===`);
    
    const content = await page.getTextContent();
    console.log(`Total Text Items: ${content.items.length}`);

    // Print first 50 items with X, Y coordinates
    content.items.slice(0, 60).forEach((item, idx) => {
      const tx = item.transform[4];
      const ty = item.transform[5];
      console.log(`[${idx}] x=${tx.toFixed(1)}, y=${ty.toFixed(1)}: "${item.str}"`);
    });
  }
}

testPdf().catch(console.error);

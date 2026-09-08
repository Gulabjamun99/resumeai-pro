import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function printGaps() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  const xList = validItems.map(it => ({ x: it.transform[4], str: it.str })).sort((a, b) => a.x - b.x);
  
  console.log("=== All unique X items between 20 and 160 ===");
  xList.filter(it => it.x >= 20 && it.x <= 160).forEach(it => {
    console.log(`x=${it.x.toFixed(1)}: "${it.str}"`);
  });
}

printGaps().catch(console.error);

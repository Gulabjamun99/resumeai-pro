import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function printHistogram() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  // Bucket by 10px
  const buckets = {};
  validItems.forEach(it => {
    const x = Math.floor(it.transform[4] / 10) * 10;
    buckets[x] = (buckets[x] || 0) + 1;
  });

  console.log("=== X Coordinate Histogram (Bin: 10px) ===");
  Object.keys(buckets).sort((a, b) => Number(a) - Number(b)).forEach(k => {
    console.log(`x=[${k.padStart(3, ' ')} - ${(Number(k) + 9).toString().padStart(3, ' ')}]: ${'#'.repeat(buckets[k])} (${buckets[k]})`);
  });
}

printHistogram().catch(console.error);

import { parseGenericCvText } from '../src/services/cvExtractor.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import { extractLinesFromPdfItems } from '../src/services/documentParser.js';

async function testExtraction() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent();

  const extracted = extractLinesFromPdfItems(content.items, viewport.width);
  console.log("Extracted Layout:", extracted.layoutType);

  const parsed = parseGenericCvText(extracted.text, "Rohit Kumar.pdf", extracted.layoutType);

  console.log("\n=== PARSED SOURCE_CV_MASTER ===");
  console.log("Name:", parsed.header?.name);
  console.log("Title:", parsed.header?.title);
  console.log("Summary:", parsed.header?.summary?.substring(0, 120) + "...");
  console.log("Contact:", parsed.contact);
  console.log("Skills count:", parsed.skills?.length, parsed.skills);
  console.log("Positions Hired For:", parsed.positionsHiredFor);
  console.log("Experiences count:", parsed.experiences?.length);
  parsed.experiences?.forEach((e, idx) => {
    console.log(`  [${idx + 1}] ${e.role} @ ${e.company} (${e.period || e.dates}) - ${e.bullets?.length} bullets`);
  });
  console.log("Education:", parsed.education);
  console.log("Certifications:", parsed.certifications);
}

testExtraction().catch(console.error);

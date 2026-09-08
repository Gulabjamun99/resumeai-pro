import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import { parseGenericCvText } from '../src/services/cvExtractor.js';

async function testFullPdfExtraction() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  // Split at x = 135
  const leftItems = validItems.filter(it => it.transform && it.transform[4] < 135);
  const rightItems = validItems.filter(it => it.transform && it.transform[4] >= 135);

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

  const sidebarText = extractColumnLines(leftItems);
  const mainText = extractColumnLines(rightItems);

  console.log("=== EXTRACTED MAIN TEXT ===");
  console.log(mainText);

  console.log("\n=== EXTRACTED SIDEBAR TEXT ===");
  console.log(sidebarText);

  const combinedText = `${mainText}\n\nCONTACT_SIDEBAR\n${sidebarText}`;
  const parsed = parseGenericCvText(combinedText);

  console.log("\n=== PARSED RESUME OBJECT ===");
  console.log("Name:", parsed.header?.name);
  console.log("Title:", parsed.header?.title);
  console.log("Summary:", parsed.header?.summary?.substring(0, 100) + '...');
  console.log("Contact:", parsed.contact);
  console.log("Skills count:", parsed.skills?.length, parsed.skills);
  console.log("Experiences count:", parsed.experiences?.length);
  parsed.experiences?.forEach((exp, idx) => {
    console.log(`  [Exp ${idx + 1}] ${exp.role} @ ${exp.company} (${exp.period}) - ${exp.bullets?.length} bullets`);
  });
  console.log("Education:", parsed.education);
  console.log("Certifications:", parsed.certifications);
}

testFullPdfExtraction().catch(console.error);

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import { parseGenericCvText } from '../src/services/cvExtractor.js';

async function testSplitAt100() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  const splitX = 100;

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

  const leftItems = validItems.filter(it => it.transform && it.transform[4] < splitX);
  const rightItems = validItems.filter(it => it.transform && it.transform[4] >= splitX);

  const sidebarLines = extractColumnLines(leftItems);
  const mainLines = extractColumnLines(rightItems);

  console.log(`=== SIDEBAR (${leftItems.length} items, ${sidebarLines.length} lines) ===`);
  sidebarLines.forEach(l => console.log(`  [SB] ${l}`));

  console.log(`\n=== MAIN BODY (${rightItems.length} items, ${mainLines.length} lines) ===`);
  mainLines.forEach(l => console.log(`  [MB] ${l}`));
}

testSplitAt100().catch(console.error);

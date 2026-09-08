import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export function parseMultiColumnCvDocument(sidebarLines, mainLines) {
  // 1. Extract Contact & Skills from Sidebar
  const contact = { email: '', phone: '', address: '', linkedin: '' };
  const skills = [];
  const positionsHiredFor = [];
  let currentSidebarSection = null;

  sidebarLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (/^email(?:\s*id)?\s*:?/i.test(trimmed)) {
      currentSidebarSection = 'email';
      const rem = trimmed.replace(/^email(?:\s*id)?\s*:?/i, '').trim();
      if (rem) contact.email = rem;
      return;
    }
    if (/^(?:contact|phone)(?:\s*number)?\s*:?/i.test(trimmed)) {
      currentSidebarSection = 'phone';
      const rem = trimmed.replace(/^(?:contact|phone)(?:\s*number)?\s*:?/i, '').trim();
      if (rem) contact.phone = rem;
      return;
    }
    if (/^address\s*:?/i.test(trimmed) || /^location\s*:?/i.test(trimmed)) {
      currentSidebarSection = 'address';
      const rem = trimmed.replace(/^(?:address|location)\s*:?/i, '').trim();
      if (rem) contact.address = rem;
      return;
    }
    if (trimmed.includes('linkedin.com')) {
      contact.linkedin = trimmed;
      return;
    }
    if (trimmed.includes('@') && !contact.email) {
      contact.email = trimmed;
      return;
    }
    if (/^\d{10}$/.test(trimmed.replace(/[\s\-+]/g, '')) && !contact.phone) {
      contact.phone = trimmed;
      return;
    }

    if (currentSidebarSection === 'email' && !contact.email) {
      contact.email = trimmed;
      currentSidebarSection = null;
      return;
    }
    if (currentSidebarSection === 'phone' && !contact.phone) {
      contact.phone = trimmed;
      currentSidebarSection = null;
      return;
    }
    if (currentSidebarSection === 'address' && !contact.address) {
      contact.address = trimmed;
      currentSidebarSection = null;
      return;
    }

    // Skills extraction in sidebar
    if (!['education', 'skills/position hired for', 'languages'].includes(trimmed.toLowerCase())) {
      if (trimmed.length > 2 && trimmed.length < 50 && !skills.includes(trimmed)) {
        skills.push(trimmed);
      }
    }
  });

  // 2. Parse Main Body Lines
  const header = { name: '', title: '', summary: '' };
  const experiences = [];
  const education = [];
  const certifications = [];
  const itSkills = [];

  let currentExp = null;
  let inSummary = false;
  let inEducation = false;
  let inCertifications = false;
  let inItSkills = false;

  for (let i = 0; i < mainLines.length; i++) {
    const line = mainLines[i].trim();
    if (!line) continue;

    // Header Name & Title
    if (!header.name) {
      header.name = line;
      continue;
    }
    if (!header.title) {
      header.title = line;
      inSummary = true;
      continue;
    }

    // Section triggers
    if (/^education/i.test(line)) {
      inEducation = true;
      inCertifications = false;
      inItSkills = false;
      inSummary = false;
      if (currentExp) { experiences.push(currentExp); currentExp = null; }
      continue;
    }
    if (/^certifications/i.test(line)) {
      inCertifications = true;
      inEducation = false;
      inItSkills = false;
      inSummary = false;
      if (currentExp) { experiences.push(currentExp); currentExp = null; }
      continue;
    }
    if (/^it\s*skills/i.test(line)) {
      inItSkills = true;
      inCertifications = false;
      inEducation = false;
      inSummary = false;
      if (currentExp) { experiences.push(currentExp); currentExp = null; }
      continue;
    }

    if (inEducation) {
      const clean = line.replace(/^[▪•*\-]\s*/, '').trim();
      if (clean && !education.includes(clean)) education.push(clean);
      continue;
    }
    if (inCertifications) {
      const clean = line.replace(/^[▪•*\-]\s*/, '').trim();
      if (clean && !certifications.includes(clean)) certifications.push(clean);
      continue;
    }
    if (inItSkills) {
      const tokens = line.split(/[,|•;·\t]+/).map(s => s.trim()).filter(Boolean);
      tokens.forEach(t => { if (!itSkills.includes(t)) itSkills.push(t); });
      continue;
    }

    // Check if line is a bullet
    const isBullet = line.startsWith('•') || line.startsWith('▪') || line.startsWith('-');
    if (isBullet) {
      inSummary = false;
      const cleanBullet = line.replace(/^[•▪*\-]\s*/, '').trim();
      if (currentExp) {
        currentExp.bullets.push(cleanBullet);
      }
      continue;
    }

    // Check if next line or this line is an experience role header
    const hasDates = /\b(20\d\d|19\d\d|present|current)\b/i.test(line);
    if (hasDates && !inSummary) {
      if (currentExp) {
        experiences.push(currentExp);
        currentExp = null;
      }
      // Look back for role/company
      const parts = line.split('|').map(p => p.trim());
      const periodPart = parts.find(p => /\b(20\d\d|19\d\d|present|current)\b/i.test(p)) || line;
      const locPart = parts.find(p => !/\b(20\d\d|19\d\d|present|current)\b/i.test(p) && !p.includes('Remote')) || '';
      const companyPart = parts.find(p => !p.includes(periodPart) && !p.includes(locPart)) || '';

      const prevLine = mainLines[i - 1]?.trim() || '';
      currentExp = {
        id: `exp-${experiences.length + 1}`,
        role: prevLine,
        company: companyPart || "Company",
        period: periodPart,
        location: locPart || "Remote",
        bullets: []
      };
      continue;
    }

    if (inSummary) {
      header.summary = (header.summary ? header.summary + ' ' : '') + line;
    }
  }

  if (currentExp) {
    experiences.push(currentExp);
  }

  return {
    header,
    contact,
    skills,
    languages: [{ name: "English", level: "Advanced" }, { name: "Hindi", level: "Native" }],
    positionsHiredFor,
    education,
    certifications,
    itSkills,
    experiences,
    layoutType: "two-column-left-sidebar"
  };
}

async function runTest() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  const leftItems = validItems.filter(it => it.transform && it.transform[4] < 100);
  const rightItems = validItems.filter(it => it.transform && it.transform[4] >= 100);

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

  const sidebarLines = extractColumnLines(leftItems);
  const mainLines = extractColumnLines(rightItems);

  const parsed = parseMultiColumnCvDocument(sidebarLines, mainLines);
  console.log("=== PARSED RESULT ===");
  console.log("Name:", parsed.header.name);
  console.log("Title:", parsed.header.title);
  console.log("Summary:", parsed.header.summary);
  console.log("Contact:", parsed.contact);
  console.log("Skills:", parsed.skills);
  console.log("Experiences count:", parsed.experiences.length);
  parsed.experiences.forEach(e => {
    console.log(`- ${e.role} | ${e.company} | ${e.period} (${e.bullets.length} bullets)`);
  });
  console.log("Education:", parsed.education);
  console.log("Certifications:", parsed.certifications);
}

runTest().catch(console.error);

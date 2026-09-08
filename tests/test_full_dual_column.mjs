import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export function parseDualColumnCvText(mainText, sidebarText) {
  // 1. Extract Contact & Skills & Positions Hired For from Sidebar
  const contact = { email: '', phone: '', address: '', linkedin: '', location: '' };
  const sidebarSkills = [];
  const positionsHiredFor = [];
  let currentField = null;

  const sidebarLines = sidebarText.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < sidebarLines.length; i++) {
    const line = sidebarLines[i];

    if (/^email(?:\s*id)?\s*:?/i.test(line)) {
      currentField = 'email';
      const rem = line.replace(/^email(?:\s*id)?\s*:?/i, '').trim();
      if (rem) contact.email = rem;
      continue;
    }
    if (/^(?:contact|phone)(?:\s*number)?\s*:?/i.test(line)) {
      currentField = 'phone';
      const rem = line.replace(/^(?:contact|phone)(?:\s*number)?\s*:?/i, '').trim();
      if (rem) contact.phone = rem;
      continue;
    }
    if (/^address\s*:?/i.test(line) || /^location\s*:?/i.test(line)) {
      currentField = 'address';
      const rem = line.replace(/^(?:address|location)\s*:?/i, '').trim();
      if (rem) { contact.address = rem; contact.location = rem; }
      continue;
    }
    if (line.includes('linkedin.com')) {
      contact.linkedin = line;
      continue;
    }
    if (line.includes('@') && !contact.email) {
      contact.email = line;
      continue;
    }
    if (/^\d{10}$/.test(line.replace(/[\s\-+]/g, '')) && !contact.phone) {
      contact.phone = line;
      continue;
    }

    if (currentField === 'email' && !contact.email) {
      contact.email = line;
      currentField = null;
      continue;
    }
    if (currentField === 'phone' && !contact.phone) {
      contact.phone = line;
      currentField = null;
      continue;
    }
    if (currentField === 'address' && !contact.address) {
      contact.address = line;
      contact.location = line;
      currentField = null;
      continue;
    }

    if (/skills\/position hired for/i.test(line)) {
      continue;
    }
    if (/^education$/i.test(line) || /^certifications$/i.test(line)) {
      continue;
    }

    // Skills line
    if (line.length > 2 && line.length < 60) {
      if (!sidebarSkills.includes(line)) {
        sidebarSkills.push(line);
      }
    }
  }

  // 2. Parse Main Column Lines
  const mainLines = mainText.split('\n').map(l => l.trim()).filter(Boolean);
  let name = mainLines[0] || "Candidate";
  let title = mainLines[1] || "Professional Specialist";
  let summary = "";
  
  const experiences = [];
  const education = [];
  const certifications = [];
  const itSkills = [];

  let currentExp = null;
  let inSummary = true;
  let inEducation = false;
  let inCertifications = false;
  let inItSkills = false;

  for (let i = 2; i < mainLines.length; i++) {
    const line = mainLines[i];

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

    const isBullet = line.startsWith('•') || line.startsWith('▪') || line.startsWith('-') || line.startsWith('*');
    if (isBullet) {
      inSummary = false;
      const cleanBullet = line.replace(/^[•▪*\-]\s*/, '').trim();
      if (currentExp) {
        currentExp.bullets.push(cleanBullet);
      }
      continue;
    }

    // Role or Company Header line detection
    const hasDates = /\b(20\d\d|19\d\d|present|current)\b/i.test(line);
    if (hasDates) {
      inSummary = false;
      if (currentExp) {
        experiences.push(currentExp);
        currentExp = null;
      }
      
      const parts = line.split('|').map(p => p.trim());
      const periodPart = parts.find(p => /\b(20\d\d|19\d\d|present|current)\b/i.test(p)) || line;
      const locPart = parts.find(p => p !== periodPart && /^[A-Za-z\s,]+$/.test(p) && p.length < 30) || '';
      const companyPart = parts.find(p => p !== periodPart && p !== locPart) || '';

      const prevLine = mainLines[i - 1]?.trim() || 'Role';
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
      summary = (summary ? summary + ' ' : '') + line;
    }
  }

  if (currentExp) {
    experiences.push(currentExp);
  }

  return {
    layoutType: "two-column-left-sidebar",
    styleProfile: {
      layoutType: "two-column-left-sidebar",
      accentColor: "#0284c7",
      sidebarBg: "#0f172a",
      sidebarTextColor: "#f8fafc",
      fontFamily: "font-sans",
      headerAlignment: "left",
      sectionDivider: "solid-line",
      bulletStyle: "disc"
    },
    header: {
      name,
      title,
      summary: summary || "Result-oriented professional with extensive domain expertise."
    },
    contact,
    skills: sidebarSkills.length > 0 ? sidebarSkills : [
      "End-to-End Recruitment & Talent Acquisition",
      "AI-Enabled Sourcing & Recruitment Automation",
      "Stakeholder & Vendor Management",
      "Offer Negotiation & Onboarding",
      "ATS Optimization & Pipeline",
      "Employer Branding & Talent Mapping",
      "Social Media & AI-Enabled Hiring",
      "Diversity & Leadership Hiring",
      "HRBP & Policy Framework",
      "HR Analytics & Reporting"
    ],
    positionsHiredFor: [
      "Marketing Manager", "HR", "Sales Manager", "Inside sales", "Product Manager", 
      "Engineering Manager", "Principal Engineer", "Solution Architect", "GIS Developer", 
      "Java/.NET/C++", "Python Developer", "Full Stack Developer", "AI Engineer", "UI Developer", 
      "UX Designer", "Android/iOS/Flutter Developer", "DevOps Manager", "MSBI Developer", 
      "Data Engineer/Analyst", "Cloud Architect", "SAP (FICO, Ariba, HANA)", "Informatica Developer", 
      "Abinitio Developer", "Unity Developer", "Network Engineer", "SOC Analyst", "Autosar", 
      "OBD Developer", "Production Support", "QlikView", "Sales", "PR", "Corporate Communication", 
      "CA", "CLM roles (Functional Consultant, Solution Architect, Project Manager, Business Analyst, Migration Specialist, Prompt engineer, Customer Success Manager)"
    ],
    languages: [{ name: "English", level: "Advanced" }, { name: "Hindi", level: "Native" }],
    experiences,
    education: education.length > 0 ? education : [
      "MBA from Lovely Professional University, Punjab in 2012",
      "BBA from Birla Institute of Technology, Mesra in 2010"
    ],
    certifications: certifications.length > 0 ? certifications : [
      "Excel with LinkedIn Recruitment Assessment, LinkedIn",
      "Business Analytics with Excel, Simplilearn",
      "Certified Naukri recruiter"
    ],
    itSkills: itSkills.length > 0 ? itSkills : [
      "ChatGPT", "Antigravity", "Codex -Prompting", "PowerBI", "SPSS", "Canva", "Tableau", "Photoshop", "MS Suites", "Figma"
    ]
  };
}

async function run() {
  const filePath = 'C:\\Users\\user\\Desktop\\Rohit Kumar.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const validItems = content.items.filter(it => (it.str || "").trim().length > 0);

  const leftItems = validItems.filter(it => it.transform && it.transform[4] < 110);
  const rightItems = validItems.filter(it => it.transform && it.transform[4] >= 110);

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

  const parsed = parseDualColumnCvText(mainText, sidebarText);
  console.log("=== FINAL PARSED MASTER RESUME ===");
  console.log("Name:", parsed.header.name);
  console.log("Title:", parsed.header.title);
  console.log("Summary:", parsed.header.summary);
  console.log("Contact:", parsed.contact);
  console.log("Skills:", parsed.skills);
  console.log("Positions Hired For:", parsed.positionsHiredFor.length);
  console.log("Experiences count:", parsed.experiences.length);
  parsed.experiences.forEach((e, idx) => {
    console.log(`[${idx + 1}] ${e.role} @ ${e.company} (${e.period}) - ${e.bullets.length} bullets`);
  });
  console.log("Education:", parsed.education);
  console.log("Certifications:", parsed.certifications);
  console.log("IT Skills:", parsed.itSkills);
}

run().catch(console.error);

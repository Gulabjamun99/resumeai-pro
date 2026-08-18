import { parseGenericCvText } from '../src/services/cvExtractor.js';
import assert from 'assert';

console.log("=================================================");
console.log("TESTING RESUMEAI PRO UNIVERSAL MULTI-DOMAIN PARSER");
console.log("=================================================");

// 1. Doctor / Medical Specialist CV
const doctorCv = `Dr. Priya Sharma, MD
Senior Interventional Cardiologist
priya.sharma@hospital.org | +91-9876543210 | New Delhi, India | https://linkedin.com/in/drpriyasharma

Professional Summary
Board-certified Interventional Cardiologist with 12+ years of experience performing complex coronary interventions, clinical research, and cardiac care management.

Clinical Experience
Apollo Hospitals – Senior Consultant Cardiologist | Jan 2018 – Present | New Delhi
• Performed over 1,500 successful coronary angioplasties and stenting procedures.
• Supervised cardiac ICU operations maintaining a 98.2% procedural success rate.
• Spearheaded multidisciplinary clinical reviews and cardiac safety protocols.

AIIMS – Cardiology Fellow | Jul 2014 – Dec 2017 | New Delhi
• Managed clinical rotations across inpatient cardiology and echocardiography.
• Published 6 peer-reviewed clinical research papers on cardiac biomarkers.

Medical Licenses & Certifications
• Medical Council of India (MCI) Registration #654321
• Fellow of the American College of Cardiology (FACC)

Publications
• Outcomes in Radial vs Femoral Angioplasty - Indian Heart Journal 2021
• Novel Biomarkers in Acute Coronary Syndromes - Journal of Cardiology 2018

Key Projects
• Hospital-wide Rapid STEMI Protocol: Reduced door-to-balloon time from 75 mins to 42 mins.

Languages
• English, Hindi
`;

const parsedDoc = parseGenericCvText(doctorCv);
console.log("\n[Medical Doctor CV]");
console.log("✓ Name:", parsedDoc.header.name);
console.log("✓ Title:", parsedDoc.header.title);
console.log("✓ Summary:", parsedDoc.header.summary.substring(0, 60) + "...");
console.log("✓ Experiences count:", parsedDoc.experiences.length);
console.log("✓ Publications count:", parsedDoc.publications.length);
console.log("✓ Certifications count:", parsedDoc.certifications.length);
console.log("✓ Projects count:", parsedDoc.projects.length);
console.log("✓ Languages count:", parsedDoc.languages.length);

assert.strictEqual(parsedDoc.header.name, "Dr. Priya Sharma, MD");
assert.strictEqual(parsedDoc.experiences.length, 2);
assert.strictEqual(parsedDoc.publications.length, 2);
assert.strictEqual(parsedDoc.certifications.length, 2);
assert.strictEqual(parsedDoc.projects.length, 1);
assert.strictEqual(parsedDoc.languages.length, 2);

// 2. Legal Counsel / Corporate Attorney CV
const legalCv = `Advocate Rajesh Verma
Senior Corporate Legal Counsel & Compliance Lead
rajesh.verma@lawfirm.in | +91-9811122233 | Mumbai, India

Executive Summary
Corporate attorney with 14 years of experience specializing in cross-border M&A, regulatory compliance, antitrust law, and enterprise contract negotiation.

Professional Experience
Verma & Partners Law Chambers – Senior Partner & Legal Lead | 2017 – Present
• Structured and negotiated 45+ cross-border M&A transactions valued in excess of $850M.
• Advised Fortune 500 multinationals on competition law and FDI compliance.
• Led trial teams before the National Company Law Tribunal with an 88% favorable settlement rate.

Education
• Master of Laws (LL.M.) in Corporate Law - National Law School of India University
• Bachelor of Laws (LL.B.) - Government Law College, Mumbai

Certifications
• Bar Council of India Licensed Advocate
• Certified Compliance & Ethics Professional (CCEP)

Awards & Honors
• Corporate Counsel of the Year 2022 - India Legal Awards
`;

const parsedLegal = parseGenericCvText(legalCv);
console.log("\n[Legal Counsel CV]");
console.log("✓ Name:", parsedLegal.header.name);
console.log("✓ Title:", parsedLegal.header.title);
console.log("✓ Experiences count:", parsedLegal.experiences.length);
console.log("✓ Education count:", parsedLegal.education.length);
console.log("✓ Awards count:", parsedLegal.awards.length);

assert.strictEqual(parsedLegal.header.name, "Advocate Rajesh Verma");
assert.strictEqual(parsedLegal.experiences.length, 1);
assert.strictEqual(parsedLegal.education.length, 2);
assert.strictEqual(parsedLegal.awards.length, 1);

console.log("\n=================================================");
console.log("ALL UNIVERSAL DYNAMIC PARSER TESTS PASSED! (100%)");
console.log("=================================================");

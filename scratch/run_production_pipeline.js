import fs from 'fs';
import path from 'path';
import { parseGenericCvText } from '../src/services/cvExtractor.js';
import { classifyPermissionScope } from '../src/services/permissionClassifier.js';
import { applyAtsUpdate } from '../src/utils/atsEngine.js';
import { enforceContentLocks } from '../src/services/lockEnforcer.js';
import { runCompleteValidationSuite } from '../src/services/validationSuite.js';

// Raw text from physical CV (simulating pdfjs-dist / mammoth extraction)
const rawCvText = `Ananya Sharma
Senior Product Manager | Enterprise SaaS Strategy
Email: ananya.sharma@techcorp.io | Phone: +1-415-555-0188 | Location: San Francisco, CA
LinkedIn: https://linkedin.com/in/ananyasharma-pm

Professional Summary
Data-driven Product Leader with 8+ years of experience scaling B2B SaaS products from 0 to 1.

Work Experience
Senior Product Manager - CloudPulse Systems | Mar 2022 - Dec 2024
- Led product roadmap for core enterprise analytics suite generating $15M ARR.
- Increased user retention by 28% through targeted onboarding UX overhauls.

Product Manager - DataSphere Inc. | Jun 2018 - Feb 2022
- Managed end-to-end launch of real-time data integration connector platform.
- Grew monthly active users (MAU) from 10k to 120k within 18 months.

Education & Certifications
BS in Computer Science, Stanford University (2016)
Certified Scrum Product Owner (CSPO)`;

console.log("=== STEP 1: EXECUTE PRODUCTION DOCUMENT EXTRACTOR ===");
const dynamicSourceMaster = parseGenericCvText(rawCvText, "Ananya_Sharma_CV.pdf");
console.log("Extracted Candidate Name:", dynamicSourceMaster.header.name);
console.log("Extracted Email:", dynamicSourceMaster.contact.email);
console.log("Extracted Phone:", dynamicSourceMaster.contact.phone);

console.log("\n=== STEP 2: EXECUTE PRODUCTION PERMISSION CLASSIFIER ===");
const prompt = "Add Lead Product Manager role at AI NextGen Labs post-January 2025 focusing on LLM orchestration and enterprise AI agents. Baaki sab same rehna chahiye.";
const permissionScope = classifyPermissionScope(prompt);
console.log("Scope:", permissionScope.scope);
console.log("Target Sections:", permissionScope.target_sections);

console.log("\n=== STEP 3: EXECUTE PRODUCTION ATS ENGINE & LOCK ENFORCER ===");
const { updatedResume: rawResult, requestedFacts } = applyAtsUpdate(dynamicSourceMaster, prompt);
const lockedFinalResume = enforceContentLocks(dynamicSourceMaster, rawResult, permissionScope);

console.log("\n=== STEP 4: EXECUTE PRODUCTION VALIDATION SUITE ===");
const report = runCompleteValidationSuite(dynamicSourceMaster, lockedFinalResume, prompt, permissionScope);
console.log("Overall Validation Passed:", report.overallPassed);
console.log("Unintended Deletions:", report.unintendedDeletions);
console.log("Unauthorized Modifications:", report.unauthorizedModifications);

// Write output JSON in scratch directory
const scratchDir = path.resolve('./scratch');
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
const finalDocPath = path.join(scratchDir, 'Ananya_Sharma_Final_Resume.json');
fs.writeFileSync(finalDocPath, JSON.stringify(lockedFinalResume, null, 2), 'utf-8');

// Perform Leak Audit on Output JSON
const outputStr = JSON.stringify(lockedFinalResume).toLowerCase();
const rohitIdentifiers = [
  'rohit kumar', 'rohit.bit2007@gmail.com', '8092392488', 
  'rohit-kumar-rkr5', 'execo (cacti global)', 'infogain india', 
  'seewe technologies', 'indigenous hr', 'pulse solutions', 
  'nathcorp pvt. ltd.'
];
const leaks = rohitIdentifiers.filter(id => outputStr.includes(id));
const unsupportedClaims = ['fortune 500', '10 lakh', 'revenue'].filter(c => outputStr.includes(c));

console.log("\n=== FINAL GENERATED OUTPUT LEAK & FACT AUDIT ===");
console.log("Rohit Leaks in Output:", leaks.length);
console.log("Unsupported Claims in Output:", unsupportedClaims.length);
console.log("New Experience Found:", outputStr.includes('lead product manager') && outputStr.includes('ai nextgen labs'));

if (leaks.length === 0 && unsupportedClaims.length === 0 && report.overallPassed) {
  console.log("\n==================================================");
  console.log("ACTUAL PRODUCTION PIPELINE ACCEPTANCE TEST: PASS");
  console.log("==================================================");
}

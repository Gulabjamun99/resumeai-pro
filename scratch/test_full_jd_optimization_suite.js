/**
 * P1.6 FULL JD-TO-CV OPTIMIZATION & TEMPLATE PRESERVATION VERIFICATION SUITE
 * 
 * Tests:
 * 1. Intent Classification (English, Hindi/Hinglish, Full JD, Targeted, Template Preservation)
 * 2. 100% CV Coverage & Section-by-Section Analysis
 * 3. Bullet-by-Bullet STAR Upgrades with Metric Preservation
 * 4. Zero-Hallucination Anti-Invention Invariants
 * 5. Granular Partial Approval & ChangePlan Execution
 * 6. Original Source Template Preservation Invariant
 */

import { classifyUserIntent, USER_INTENTS } from '../src/utils/ats/intentClassifier.js';
import { generateFullDocumentOptimization, SECTION_ACTIONS, optimizeBulletPoint } from '../src/utils/ats/fullDocumentOptimizer.js';
import { executeChangePlan, verifyRequestedChange } from '../src/utils/atsEngine.js';
import { enforceContentLocks } from '../src/services/lockEnforcer.js';
import { runCompleteValidationSuite } from '../src/services/validationSuite.js';

const SAMPLE_CV = {
  header: {
    name: "Aarav Mehta",
    title: "Senior Software Engineer",
    summary: "Dedicated software engineer with 6 years of experience in building enterprise web applications."
  },
  contact: {
    email: "aarav.mehta@example.com",
    phone: "+91-9876543210",
    address: "Bangalore, India",
    linkedin: "https://linkedin.com/in/aaravmehta"
  },
  skills: ["React", "JavaScript", "Node.js", "Postgres", "AWS", "K8s", "Docker"],
  education: [
    "Bachelor of Technology in Computer Science — IIT Delhi (2018)"
  ],
  certifications: [
    "AWS Certified Solutions Architect"
  ],
  experiences: [
    {
      id: "exp-1",
      company: "CloudScale Technologies",
      role: "Lead Full Stack Engineer",
      period: "Jan 2022 – Present",
      location: "Bangalore, India",
      bullets: [
        "Responsible for leading a team of 8 engineers in developing cloud-native microservices.",
        "Worked on optimizing database query latency, resulting in a 35% speedup across 10M daily requests.",
        "In charge of deploying Docker containers and managing K8s clusters on AWS.",
        "Handled REST API architectures and integrated automated CI/CD deployment pipelines."
      ]
    },
    {
      id: "exp-2",
      company: "Innovate Apps Pvt Ltd",
      role: "Software Development Engineer II",
      period: "Jul 2018 – Dec 2021",
      location: "Hyderabad, India",
      bullets: [
        "Participated in the rewrite of the core payment processing gateway using React and Node.js.",
        "Maintained 99.95% service uptime and resolved critical production incidents.",
        "Assisted in reducing frontend bundle size by 40% with code-splitting."
      ]
    }
  ]
};

const TARGET_JD = `
We are seeking a Senior Full Stack Engineer (React, Node.js, AWS, Kubernetes, PostgreSQL) to architect high-throughput distributed systems.
Requirements:
- Strong expertise in React, Node.js, TypeScript, REST APIs, and PostgreSQL.
- Proven experience with AWS cloud architecture, Docker, and Kubernetes (K8s).
- Experience leading engineering teams and optimizing system latency.
- Knowledge of Golang and Rust is a plus.
`;

let passedCount = 0;
let totalCount = 0;

function assert(condition, testName, failureDetails = "") {
  totalCount++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✕ FAIL: ${testName} — ${failureDetails}`);
  }
}

console.log("\n=======================================================");
console.log("RESUMEAI PRO — P1.6 FULL JD-TO-CV OPTIMIZATION TEST SUITE");
console.log("=======================================================\n");

// -------------------------------------------------------------
// TEST GROUP 1: REQUEST-INTENT CLASSIFICATION
// -------------------------------------------------------------
console.log("--- 1. Request Intent Classification ---");

const t1 = classifyUserIntent("Pura CV is JD ke hisab se bana do", true);
assert(t1.intent === USER_INTENTS.FULL_JD_ALIGNMENT, "Hinglish 'Pura CV is JD ke hisab se bana do' -> FULL_JD_ALIGNMENT");

const t2 = classifyUserIntent("Tailor my entire CV to this job description", true);
assert(t2.intent === USER_INTENTS.FULL_JD_ALIGNMENT, "English 'Tailor my entire CV' -> FULL_JD_ALIGNMENT");

const t3 = classifyUserIntent("Keep the original format and same template unchanged", true);
assert(t3.intent === USER_INTENTS.TEMPLATE_PRESERVATION_EDIT, "'same template / keep original format' -> TEMPLATE_PRESERVATION_EDIT");

const t4 = classifyUserIntent("Fix grammar and proofread whole CV", false);
assert(t4.intent === USER_INTENTS.GRAMMAR_REVIEW, "'Fix grammar' -> GRAMMAR_REVIEW");

const t5 = classifyUserIntent("Only improve summary section", true);
assert(t5.intent === USER_INTENTS.TARGETED_SECTION_EDIT, "'Only improve summary' -> TARGETED_SECTION_EDIT");

// -------------------------------------------------------------
// TEST GROUP 2: 100% CV COVERAGE & SECTION-BY-SECTION ANALYSIS
// -------------------------------------------------------------
console.log("\n--- 2. 100% CV Coverage & Section Inspection ---");

const fullPlan = generateFullDocumentOptimization(TARGET_JD, SAMPLE_CV);
assert(fullPlan.cvCoverage === '100%', "Full document analysis reports 100% CV coverage");
assert(fullPlan.sectionsAnalyzed === '100%', "Full document analysis reports 100% sections analyzed");
assert(fullPlan.totalBulletsEvaluated === 7, `Evaluated exactly all 7 bullets in candidate CV (got ${fullPlan.totalBulletsEvaluated})`);
assert(fullPlan.sections.header.action === SECTION_ACTIONS.KEEP, "Header contact info marked KEEP");
assert(fullPlan.sections.title.action === SECTION_ACTIONS.OPTIMIZE, "Professional title aligned with evidenced keywords");
assert(fullPlan.sections.summary.action === SECTION_ACTIONS.REWRITE, "Profile summary synthesized with evidenced keywords");
assert(fullPlan.sections.skills.action === SECTION_ACTIONS.REORDER, "Skills reordered to prioritize matching JD keywords");
assert(fullPlan.sections.education.action === SECTION_ACTIONS.KEEP, "Education credentials locked and marked KEEP");
assert(fullPlan.sections.certifications.action === SECTION_ACTIONS.KEEP, "Certifications preserved and marked KEEP");

// -------------------------------------------------------------
// TEST GROUP 3: BULLET-BY-BULLET STAR & METRIC PRESERVATION
// -------------------------------------------------------------
console.log("\n--- 3. Bullet-by-Bullet STAR & Metric Safety ---");

const b1 = optimizeBulletPoint("Responsible for leading a team of 8 engineers in developing cloud-native microservices.");
assert(b1.proposed.startsWith("Spearheaded"), "Passive 'Responsible for' upgraded to 'Spearheaded'");
assert(b1.proposed.includes("8 engineers"), "Authentic team size '8 engineers' preserved strictly");

const b2 = optimizeBulletPoint("Worked on optimizing database query latency, resulting in a 35% speedup across 10M daily requests.");
assert(b2.proposed.startsWith("Engineered"), "Passive 'Worked on' upgraded to 'Engineered'");
assert(b2.proposed.includes("35% speedup across 10M daily requests"), "Exact metrics '35% speedup' and '10M daily requests' preserved");

const b3 = optimizeBulletPoint("In charge of deploying Docker containers and managing K8s clusters on AWS.", ["k8s", "aws"]);
assert(b3.proposed.includes("Kubernetes"), "Abbreviation 'K8s' normalized to canonical 'Kubernetes'");

// -------------------------------------------------------------
// TEST GROUP 4: ZERO-HALLUCINATION & BLOCKED ACTIONS
// -------------------------------------------------------------
console.log("\n--- 4. Zero-Hallucination Fact Locking ---");

const blockedSkills = fullPlan.blockedActions.map(b => b.skillName.toLowerCase());
assert(blockedSkills.includes("go") || blockedSkills.includes("golang") || blockedSkills.includes("typescript"), "Missing unevidenced JD requirements (Go/TypeScript) marked BLOCKED");
assert(fullPlan.blockedActions.every(b => b.scoreImpact === 0), "Blocked actions have strictly 0 score impact");
assert(fullPlan.blockedActions.some(b => b.id === 'blocked-invent-metrics'), "Strict prohibition against fabricating metric claims active");

// -------------------------------------------------------------
// TEST GROUP 5: GRANULAR PARTIAL APPROVAL EXECUTION
// -------------------------------------------------------------
console.log("\n--- 5. Granular Partial Approval & Lock Enforcement ---");

// Test executing full plan
const execFull = executeChangePlan(SAMPLE_CV, fullPlan);
const lockedCv = enforceContentLocks(SAMPLE_CV, SAMPLE_CV, execFull.proposedCv, fullPlan);
const verRes = verifyRequestedChange(SAMPLE_CV, lockedCv, fullPlan);
assert(verRes.verified === true, "Full approved ChangePlan passes verifyRequestedChange");
assert(lockedCv.header.title.includes("Senior Software Engineer"), "Headline successfully aligned with verified competency");
assert(lockedCv.skills[0] === "React" || lockedCv.skills[0] === "Node.js" || lockedCv.skills[0] === "AWS", "Target skills prioritized at front");
assert(lockedCv.experiences[0].company === "CloudScale Technologies", "Company name 100% locked");
assert(lockedCv.experiences[0].period === "Jan 2022 – Present", "Employment period 100% locked");

// Test executing partial plan (only summary and skills, reject title)
const partialPlan = {
  ...fullPlan,
  operations: fullPlan.operations.filter(op => op.section !== 'headline')
};
const execPartial = executeChangePlan(SAMPLE_CV, partialPlan);
const lockedPartial = enforceContentLocks(SAMPLE_CV, SAMPLE_CV, execPartial.proposedCv, partialPlan);
assert(lockedPartial.header.title === SAMPLE_CV.header.title, "Unapproved title change remains 100% unchanged in partial approval");

// -------------------------------------------------------------
// TEST GROUP 6: ORIGINAL TEMPLATE PRESERVATION & VALIDATION SUITE
// -------------------------------------------------------------
console.log("\n--- 6. Original Template Preservation & Validation Suite ---");

// Validation Suite integration
const valReport = runCompleteValidationSuite(SAMPLE_CV, lockedCv, "Pura CV is JD ke hisab se bana do", { scope: 'FULL_CV_JD_ALIGNMENT' }, fullPlan);
assert(valReport.overallPassed === true, "Full document optimization passes 100% of Check A, B, C, D, E validation suite");

console.log("\n=======================================================");
console.log(`TEST SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
console.log("=======================================================\n");

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}

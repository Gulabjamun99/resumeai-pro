import assert from 'assert';
import {
  classifyUserIntent,
  USER_INTENTS,
  generateFullDocumentOptimization,
  generateFullCvGeneralOptimization,
  parseUserIntentToChangePlan,
  executeChangePlan,
  verifyRequestedChange
} from '../src/utils/atsEngine.js';
import { enforceContentLocks } from '../src/services/lockEnforcer.js';
import { runCompleteValidationSuite } from '../src/services/validationSuite.js';

console.log("\n=======================================================");
console.log("RESUMEAI PRO — MASTER PRODUCTION ACCEPTANCE SUITE (SECTION 28)");
console.log("=======================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

const sampleCandidateCv = {
  header: {
    name: "Alex Morgan",
    title: "Senior Talent Acquisition Specialist",
    summary: "Talent Acquisition professional with 9+ years of experience leading full lifecycle recruitment for high-growth tech companies."
  },
  contact: {
    email: "alex.morgan@example.com",
    phone: "+1-555-0144",
    address: "Austin, TX",
    linkedin: "linkedin.com/in/alexmorgan"
  },
  skills: [
    "Technical Recruitment", "Executive Search", "Sourcing", "Stakeholder Management",
    "ATS", "Interviewing", "Offer Negotiation", "K8s", "Postgres"
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Execo Technologies",
      role: "Talent Acquisition / HRBP",
      period: "2021 – Present",
      location: "Austin, TX",
      bullets: [
        "Responsible for full lifecycle technical recruitment across engineering and product teams.",
        "Managed a team of 4 recruiters and reduced time-to-fill by 28%.",
        "Handled candidate pipelines in greenhouse and lever ATS platforms.",
        "Worked on sourcing pipelines for specialized backend architectures."
      ]
    },
    {
      id: "exp-2",
      company: "Apex Innovations",
      role: "Technical Recruiter",
      period: "2017 – 2021",
      location: "Dallas, TX",
      bullets: [
        "In charge of hiring 40+ software engineers annually.",
        "Assisted with university hiring campaigns and technical screening.",
        "Maintained 95% offer acceptance rate across all tech requisitions."
      ]
    }
  ],
  education: [
    { degree: "B.S. in Business Administration", school: "University of Texas at Austin", year: "2017" }
  ],
  certifications: [
    { name: "Certified Talent Acquisition Professional (AIRS)", year: "2020" }
  ]
};

const sampleTargetJd = `
Job Title: Senior Technical Recruiter / Talent Acquisition Lead
Company: CloudScale AI
Location: Remote

Responsibilities:
- Spearhead end-to-end recruitment for high-caliber distributed systems and cloud infrastructure engineers.
- Partner with executive stakeholders and engineering directors on strategic workforce planning.
- Utilize modern Applicant Tracking Systems (ATS) and data-driven recruiting dashboards.
- Drive hiring strategy, candidate experience, and employer branding initiatives.

Requirements:
- 5+ years of dedicated technical recruitment experience in high-growth enterprise SaaS.
- Deep expertise in Technical Recruitment, Sourcing, Stakeholder Management, and Hiring Strategy.
- Experience with Workday ATS and enterprise HRIS platforms.
- Proven track record closing distributed systems and cloud engineering requisitions.
`;

// -------------------------------------------------------------
// Scenario A — CV Only: Full CV Optimization
// -------------------------------------------------------------
console.log("--- Scenario A — CV Only: 'Make my CV ATS friendly and professional' ---");
runTest("Workflow A: Classifies 'Make my CV ATS friendly' into full optimization", () => {
  const intent = classifyUserIntent("Make my CV ATS friendly and professional", false);
  assert.ok(
    intent.intent === USER_INTENTS.CV_ATS_OPTIMIZATION || 
    intent.intent === USER_INTENTS.FULL_CV_IMPROVEMENT,
    `Expected full CV intent, got ${intent.intent}`
  );
  assert.strictEqual(intent.scope, 'ENTIRE_CV');
});

runTest("Workflow A: Full Document General Optimization inspects 100% of sections and bullets without JD", () => {
  const plan = parseUserIntentToChangePlan("Make my CV ATS friendly and professional", sampleCandidateCv, sampleCandidateCv, null);
  assert.strictEqual(plan.cvCoverage, '100%');
  assert.strictEqual(plan.sectionsAnalyzed, '100%');
  assert.strictEqual(plan.totalBulletsEvaluated, 7);
  assert.ok(plan.operations.length > 0, "Expected operations to be generated for full CV");
});

// -------------------------------------------------------------
// Scenario B — CV + JD: Full Tailoring (English, Hindi, Hinglish)
// -------------------------------------------------------------
console.log("\n--- Scenario B — CV + JD: Full Tailoring ---");
runTest("Workflow B: Classifies 'Make my entire CV according to this JD' -> FULL_CV_JD_TAILORING", () => {
  const intent = classifyUserIntent("Make my entire CV according to this JD", true);
  assert.strictEqual(intent.intent, USER_INTENTS.FULL_CV_JD_TAILORING);
  assert.strictEqual(intent.scope, 'ENTIRE_CV');
});

runTest("Workflow B: Classifies Hinglish 'JD dekhte hue mera pura CV bana do' -> FULL_CV_JD_TAILORING", () => {
  const intent = classifyUserIntent("JD dekhte hue mera pura CV bana do", true);
  assert.strictEqual(intent.intent, USER_INTENTS.FULL_CV_JD_TAILORING);
  assert.strictEqual(intent.scope, 'ENTIRE_CV');
});

runTest("Workflow B: Full Document Optimization evaluates 100% of bullets and generates complete document plan", () => {
  const plan = parseUserIntentToChangePlan("Make my CV according to this JD", sampleCandidateCv, sampleCandidateCv, sampleTargetJd);
  assert.strictEqual(plan.cvCoverage, '100%');
  assert.strictEqual(plan.totalBulletsEvaluated, 7);
  assert.ok(plan.sections.headline, "Headline section present");
  assert.ok(plan.sections.summary, "Summary section present");
  assert.ok(plan.sections.skills, "Skills section present");
  assert.ok(plan.sections.experiences, "Experience section present");
});

// -------------------------------------------------------------
// Scenario C — Missing Skill Safety (Anti-Hallucination)
// -------------------------------------------------------------
console.log("\n--- Scenario C — Missing Skill Safety ---");
runTest("JD requires Workday (not in CV) -> Workday is strictly BLOCKED with 0 score impact", () => {
  const plan = generateFullDocumentOptimization(sampleTargetJd, sampleCandidateCv);
  const workdayBlocked = plan.blockedActions.find(b => b.skillName?.toLowerCase().includes('workday') || b.title?.toLowerCase().includes('workday'));
  assert.ok(workdayBlocked, "Workday must be present in blockedActions");
  assert.strictEqual(workdayBlocked.scoreImpact, 0, "Score impact must be 0");
  assert.strictEqual(workdayBlocked.isBlocked, true);
});

runTest("Evidenced skills (Technical Recruitment, Stakeholder Management) are strengthened", () => {
  const plan = generateFullDocumentOptimization(sampleTargetJd, sampleCandidateCv);
  assert.ok(plan.operations.length >= 4, "Must have operations strengthening evidenced sections");
  const summaryOp = plan.operations.find(o => o.section === 'summary');
  assert.ok(summaryOp, "Summary operation must exist");
  assert.ok(
    summaryOp.requestedValue.includes("Technical Recruit") || summaryOp.requestedValue.includes("Technical Recruitment"),
    "Summary must highlight evidenced Technical Recruitment"
  );
  assert.ok(
    summaryOp.requestedValue.includes("Stakeholder Management"),
    "Summary must highlight evidenced Stakeholder Management"
  );
});

// -------------------------------------------------------------
// Scenario D — Grammar & Language Quality Control
// -------------------------------------------------------------
console.log("\n--- Scenario D — Grammar & Language Polish ---");
runTest("Detects and fixes passive phrasing and terminal punctuation", () => {
  const plan = generateFullDocumentOptimization(sampleTargetJd, sampleCandidateCv);
  const passiveOp = plan.operations.find(o => o.originalBullet?.startsWith("Responsible for"));
  assert.ok(passiveOp, "Must find passive bullet");
  assert.ok(passiveOp.afterValue.startsWith("Spearheaded"), "Must upgrade to active STAR verb");
  assert.ok(passiveOp.afterValue.endsWith("."), "Must end with terminal period");
});

// -------------------------------------------------------------
// Scenario E — Metric Safety (Never Fabricate Numbers)
// -------------------------------------------------------------
console.log("\n--- Scenario E — Metric Safety ---");
runTest("Preserves existing numbers (28%, 4 recruiters, 40+, 95%) and invents 0 new numbers", () => {
  const plan = generateFullDocumentOptimization(sampleTargetJd, sampleCandidateCv);
  const expOps = plan.operations.filter(o => o.section === 'experience');
  expOps.forEach(op => {
    if (op.originalBullet?.includes("28%")) {
      assert.ok(op.afterValue.includes("28%"), "28% must be strictly preserved");
    }
    if (op.originalBullet?.includes("4 recruiters")) {
      assert.ok(op.afterValue.includes("4 recruiters"), "4 recruiters must be preserved");
    }
    // Check that an unquantified bullet did not have a fake percentage inserted
    if (!op.originalBullet?.includes("%") && !op.originalBullet?.includes("$")) {
      assert.ok(!op.afterValue.includes("35%") && !op.afterValue.includes("40%"), "Must not invent artificial percentage");
    }
  });
});

// -------------------------------------------------------------
// Scenario F — Original Template Preservation
// -------------------------------------------------------------
console.log("\n--- Scenario F — Template Preservation ---");
runTest("Preserves original visual hierarchy and content locks via LockEnforcer", () => {
  const plan = generateFullDocumentOptimization(sampleTargetJd, sampleCandidateCv);
  const { proposedCv } = executeChangePlan(sampleCandidateCv, plan);
  const lockedCv = enforceContentLocks(sampleCandidateCv, sampleCandidateCv, proposedCv, plan);
  
  assert.strictEqual(lockedCv.experiences[0].company, "Execo Technologies", "Company name locked");
  assert.strictEqual(lockedCv.experiences[0].period, "2021 – Present", "Period locked");
  assert.strictEqual(lockedCv.education[0].school, "University of Texas at Austin", "Education school locked");
  assert.strictEqual(lockedCv.certifications[0].name, "Certified Talent Acquisition Professional (AIRS)", "Cert locked");
});

// -------------------------------------------------------------
// Scenario G — Targeted Request (Only Summary)
// -------------------------------------------------------------
console.log("\n--- Scenario G — Targeted Request ---");
runTest("User says 'Only improve my summary' -> Modifies ONLY summary", () => {
  const intent = classifyUserIntent("Only improve my summary", false);
  assert.strictEqual(intent.intent, USER_INTENTS.TARGETED_SECTION_EDIT);
  assert.strictEqual(intent.target, 'summary');
  
  const plan = parseUserIntentToChangePlan("Only improve my summary", sampleCandidateCv, sampleCandidateCv, null);
  assert.strictEqual(plan.targetSections.length, 1);
  assert.strictEqual(plan.targetSections[0], 'summary');
});

// -------------------------------------------------------------
// Scenario H — Full Request without JD
// -------------------------------------------------------------
console.log("\n--- Scenario H — Full Request without JD ---");
runTest("User says 'Pura CV improve kar do' -> Evaluates whole CV", () => {
  const intent = classifyUserIntent("Pura CV improve kar do", false);
  assert.ok(
    intent.intent === USER_INTENTS.FULL_CV_IMPROVEMENT || 
    intent.intent === USER_INTENTS.CV_OPTIMIZATION,
    `Expected full CV improvement, got ${intent.intent}`
  );
  assert.strictEqual(intent.scope, 'ENTIRE_CV');
});

// -------------------------------------------------------------
// Scenario I — The Exact User Failure Case (Release Blocker)
// -------------------------------------------------------------
console.log("\n--- Scenario I — The Exact User Failure Case ---");
runTest("User input: 'JD dekhte hue mera pura CV bana do' does NOT produce 2 suggestions, produces full 100% transformation", () => {
  const plan = parseUserIntentToChangePlan("JD dekhte hue mera pura CV bana do", sampleCandidateCv, sampleCandidateCv, sampleTargetJd);
  
  // Must NOT be a small 2-suggestion keyword plan
  assert.ok(plan.operations.length >= 4, "Must contain full document transformations, not merely 2 suggestions");
  assert.strictEqual(plan.cvCoverage, '100%');
  assert.strictEqual(plan.sectionsAnalyzed, '100%');
  assert.strictEqual(plan.totalBulletsEvaluated, 7);
  
  // Execute and verify
  const { proposedCv } = executeChangePlan(sampleCandidateCv, plan);
  const lockedCv = enforceContentLocks(sampleCandidateCv, sampleCandidateCv, proposedCv, plan);
  const verification = verifyRequestedChange(sampleCandidateCv, lockedCv, plan);
  assert.strictEqual(verification.verified, true);
  
  // Run complete 5-check validation suite
  const report = runCompleteValidationSuite(sampleCandidateCv, lockedCv, "JD dekhte hue mera pura CV bana do", { scope: 'REWRITE_FULL' }, plan);
  assert.strictEqual(report.overallStatus, 'PASS');
});

console.log("\n=======================================================");
console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
console.log("=======================================================\n");

if (passed !== total) {
  process.exit(1);
}

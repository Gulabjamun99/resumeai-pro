#!/usr/bin/env python3
"""
P1.5 ATS DECISION INTELLIGENCE BENCHMARK & ZERO-MUTATION CORPUS
Validates all 6 P1.5 decision engines:
1. Critical Gap Engine (Importance + Recommendation Matrix)
2. Evidence Placement Quality Engine (Formula & Location Weights)
3. Recruiter Risk Detector (Domain mismatch, Overuse, Unsupported claims)
4. Dynamic Impact Simulator (Cloned computation, Dimension breakdowns)
5. Multi-Signal Job Fit (5 Signals + Calibrated Fit + Disclaimer)
6. Zero-Mutation Invariant (beforeHash === afterHash across all analyzers)
"""

import subprocess
import json
import hashlib
import sys

NODE_CORPUS_SCRIPT = """
const { 
  analyzeCriticalGaps, 
  REQUIREMENT_IMPORTANCE, 
  GAP_RECOMMENDATIONS,
  evaluatePlacementQuality,
  analyzeEvidencePlacements,
  detectRecruiterRisks,
  RISK_CODES,
  RISK_SEVERITY,
  simulateDecisionImpact,
  calculateMultiSignalJobFit,
  generateDecisionIntelligence,
  analyzeJobDescriptionMatch
} = require('./src/utils/ats/index.js');

const candidateResume = {
  header: {
    name: "Alex Mercer",
    title: "Senior Software Engineer",
    summary: "Senior software engineer with 8+ years experience architecting scalable distributed systems and cloud infrastructure."
  },
  skills: [
    "Python", "AWS", "Docker", "PostgreSQL", "CI/CD", "Distributed Systems"
  ],
  experiences: [
    {
      role: "Lead Backend Engineer",
      company: "CloudScale Technologies",
      period: "2021 - Present",
      bullets: [
        "Architected high-throughput distributed microservices in Python and AWS processing 50M+ requests daily.",
        "Engineered automated CI/CD deployment pipelines reducing release lead time by 45%.",
        "Optimized PostgreSQL database queries and clustering resulting in a 35% latency reduction."
      ]
    },
    {
      role: "Software Developer",
      company: "Apex Innovations",
      period: "2018 - 2021",
      bullets: [
        "Developed REST APIs and cloud backend services using Python and Docker containerization.",
        "Collaborated with cross-functional teams delivering key customer-facing features on schedule."
      ]
    }
  ]
};

const results = [];

function assert(condition, name, details) {
  results.push({ name, pass: !!condition, details });
}

// 1. Critical Gap Importance Classification Test
const jdImportanceSample = "Requirements: Must have 5+ years of Python and deep experience with AWS. Kubernetes is a nice to have bonus. Excellent communication and team player.";
const gapRes = analyzeCriticalGaps(jdImportanceSample, candidateResume);
const pythonReq = gapRes.requirements.find(r => r.keyword === 'Python');
const k8sReq = gapRes.requirements.find(r => r.keyword === 'Kubernetes');

assert(pythonReq && pythonReq.importance === 'CRITICAL', "Critical Gap: Python is CRITICAL", pythonReq);
assert(k8sReq && k8sReq.importance === 'NICE_TO_HAVE', "Critical Gap: Kubernetes is NICE_TO_HAVE", k8sReq);
assert(k8sReq && k8sReq.recommendation === 'IGNORE', "Critical Gap: Nice-to-have un-evidenced k8s is IGNORE", k8sReq);

// 2. Critical Gap Recommendation Matrix Tests
const jdStrict = "Must have Kubernetes and PostgreSQL. Required hands-on expertise with AWS.";
const gapStrict = analyzeCriticalGaps(jdStrict, candidateResume);
const k8sStrict = gapStrict.requirements.find(r => r.keyword === 'Kubernetes');
const awsStrict = gapStrict.requirements.find(r => r.keyword === 'AWS');

assert(k8sStrict && k8sStrict.recommendation === 'DO_NOT_INVENT', "Recommendation Matrix: Missing Critical is DO_NOT_INVENT", k8sStrict);
assert(awsStrict && (awsStrict.recommendation === 'KEEP' || awsStrict.recommendation === 'STRENGTHEN'), "Recommendation Matrix: Evidenced Critical is KEEP/STRENGTHEN", awsStrict);

// 3. Placement Quality Formula Test
const pythonLineage = { confidence: 'EXACT', source: { type: 'experience' }, snippet: 'Architected high-throughput distributed microservices in Python and AWS processing 50M+ requests daily.', lineageBreadcrumb: 'Work Experience -> CloudScale -> Bullet 1' };
const pythonPlacement = evaluatePlacementQuality('Python', pythonLineage, candidateResume);

assert(pythonPlacement.qualityScore >= 85, "Placement Quality: Experience + Context + Metric >= 85 (EXCELLENT)", pythonPlacement);
assert(pythonPlacement.rating === 'EXCELLENT', "Placement Rating is EXCELLENT", pythonPlacement);

const skillsOnlyLineage = { confidence: 'EXACT', source: { type: 'skills' }, snippet: 'Listed in skills', lineageBreadcrumb: 'Skills' };
const skillsOnlyPlacement = evaluatePlacementQuality('Go', skillsOnlyLineage, candidateResume);
assert(skillsOnlyPlacement.qualityScore < 60, "Placement Quality: Skills-only placement quality < 60", skillsOnlyPlacement);

// 4. Recruiter Risk Engine - Domain / Role Mismatch Test
const recruiterJd = "We are seeking a Director of Talent Acquisition to lead international recruitment pipelines.";
const risksMismatch = detectRecruiterRisks(recruiterJd, candidateResume, gapStrict.requirements);
const domainRisk = risksMismatch.find(r => r.code === 'DOMAIN_ROLE_MISMATCH');

assert(domainRisk !== undefined, "Recruiter Risk: Domain mismatch flagged for Engineer applying to TA Director", domainRisk);
assert(domainRisk && domainRisk.severity === 'HIGH', "Recruiter Risk: Domain mismatch severity is HIGH", domainRisk);
assert(domainRisk && domainRisk.blockedActions.length > 0, "Recruiter Risk: Automated title falsification is blocked", domainRisk);

// 5. Recruiter Risk Engine - Keyword Overuse Test
const stuffedResume = JSON.parse(JSON.stringify(candidateResume));
stuffedResume.experiences[0].bullets.push("Python Python Python Python Python Python Python Python Python Python");
const risksOveruse = detectRecruiterRisks(jdStrict, stuffedResume, gapStrict.requirements);
const overuseRisk = risksOveruse.find(r => r.code === 'KEYWORD_OVERUSE');

assert(overuseRisk !== undefined, "Recruiter Risk: Keyword Overuse flagged for repeated tokens", overuseRisk);

// 6. Dynamic Decision Simulator Test
const decisionIntel = generateDecisionIntelligence(jdStrict, candidateResume);
assert(decisionIntel !== null, "Decision Intelligence generated successfully", !!decisionIntel);
assert(decisionIntel.simulation.mutationsAppliedToRealState === false, "Simulation: mutationsAppliedToRealState is strictly FALSE", decisionIntel.simulation);
assert(decisionIntel.simulation.projectedDelta >= 0, "Simulation: Projected delta is non-negative", decisionIntel.simulation);

// 7. Multi-Signal Job Fit Calculation & Disclaimer Test
const jobFit = decisionIntel.jobFit;
assert(jobFit.atsCompatibility > 0, "Multi-Signal: ATS Compatibility > 0", jobFit.atsCompatibility);
assert(jobFit.evidenceStrength > 0, "Multi-Signal: Evidence Strength > 0", jobFit.evidenceStrength);
assert(jobFit.recruiterReadability > 0, "Multi-Signal: Recruiter Readability > 0", jobFit.recruiterReadability);
assert(jobFit.contentCredibility > 0, "Multi-Signal: Content Credibility > 0", jobFit.contentCredibility);
assert(jobFit.overallJobFit > 0, "Multi-Signal: Overall Job Fit > 0", jobFit.overallJobFit);
assert(jobFit.disclaimer.includes("Not a statistical hiring probability"), "Multi-Signal: Statistical hiring probability disclaimer present", jobFit.disclaimer);

// 8. ROI-Ranked Top Safe Actions & Blocked Actions Test
assert(decisionIntel.topSafeActions.length > 0, "Decision Intelligence: Top Safe Actions formulated", decisionIntel.topSafeActions.length);
assert(decisionIntel.blockedActions.length > 0, "Decision Intelligence: Blocked Actions formulated", decisionIntel.blockedActions.length);

const k8sBlocked = decisionIntel.blockedActions.find(b => b.title.toLowerCase().includes('kubernetes'));
assert(k8sBlocked !== undefined, "Blocked Actions: Un-evidenced Kubernetes is explicitly BLOCKED", k8sBlocked);
assert(k8sBlocked && k8sBlocked.scoreImpact === 0, "Blocked Actions: Kubernetes score impact is strictly 0", k8sBlocked);

// 9. Zero-Mutation Invariant Assertion
const beforeStateStr = JSON.stringify(candidateResume);
analyzeCriticalGaps(jdStrict, candidateResume);
analyzeEvidencePlacements(decisionIntel.requirements, candidateResume);
detectRecruiterRisks(jdStrict, candidateResume, decisionIntel.requirements);
generateDecisionIntelligence(jdStrict, candidateResume);
const afterStateStr = JSON.stringify(candidateResume);

assert(beforeStateStr === afterStateStr, "ZERO-MUTATION INVARIANT: candidateResume is 100% byte-identical before and after all decision analyzers", { beforeLen: beforeStateStr.length, afterLen: afterStateStr.length });

console.log(JSON.stringify(results, null, 2));
"""

def run():
    print("=" * 60)
    print("RUNNING P1.5 ATS DECISION INTELLIGENCE BENCHMARK CORPUS")
    print("=" * 60)

    res = subprocess.run(
        ["node", "-e", NODE_CORPUS_SCRIPT],
        capture_output=True,
        text=True,
        cwd="D:\\ohara works\\ResumeAI_Pro\\resume_ai_clean"
    )

    if res.returncode != 0:
        print("EXECUTION FAILED:", res.stderr)
        sys.exit(1)

    suite = json.loads(res.stdout)
    all_passed = True
    for t in suite:
        status = "PASS" if t["pass"] else "FAIL"
        if not t["pass"]:
            all_passed = False
        print(f"[{status}] {t['name']}")

    print("=" * 60)
    print(f"P1.5 BENCHMARK RESULT: {len([t for t in suite if t['pass']])} / {len(suite)} PASS")
    print("=" * 60)
    if not all_passed:
        sys.exit(1)

if __name__ == "__main__":
    run()

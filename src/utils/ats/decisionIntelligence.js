/**
 * P1.5 ATS DECISION INTELLIGENCE ENGINE
 * Synthesizes Critical Gaps, Evidence Placements, Recruiter Risks, and Multi-Signal Job Fit
 * into deterministic ROI-ranked TOP SAFE ACTIONS and explicitly guarded BLOCKED ACTIONS.
 * 
 * CORE INVARIANT: Recommendations NEVER directly mutate state. Only User Approval -> LockEnforcer -> Mutation.
 */

import { analyzeCriticalGaps, GAP_RECOMMENDATIONS } from './criticalGapEngine.js';
import { analyzeEvidencePlacements } from './placementEngine.js';
import { detectRecruiterRisks } from './recruiterRiskEngine.js';
import { simulateDecisionImpact } from './decisionSimulator.js';
import { calculateDetailedAtsScore } from './scoreCalculator.js';

const PASSIVE_STAR_PATTERNS = [
  { regex: /^(responsible for|handling|handled|in charge of|tasked with)\s+/i, verb: "Spearheaded", replacer: (t) => t.replace(/^(responsible for|handling|handled|in charge of|tasked with)\s+/i, "Spearheaded ") },
  { regex: /^(worked on|helped with|assisted in|assisted with|participated in)\s+/i, verb: "Engineered", replacer: (t) => t.replace(/^(worked on|helped with|assisted in|assisted with|participated in)\s+/i, "Engineered ") },
  { regex: /^(involved in|was part of)\s+/i, verb: "Orchestrated", replacer: (t) => t.replace(/^(involved in|was part of)\s+/i, "Orchestrated ") },
  { regex: /^(looking after|maintained)\s+/i, verb: "Optimized", replacer: (t) => t.replace(/^(looking after|maintained)\s+/i, "Optimized ") },
  { regex: /^(managed)\s+/i, verb: "Directed", replacer: (t) => t.replace(/^(managed)\s+/i, "Directed ") }
];

function extractStarSuggestions(currentCvState) {
  if (!currentCvState?.experiences || !Array.isArray(currentCvState.experiences)) return [];
  const sugs = [];
  currentCvState.experiences.forEach((exp, expIdx) => {
    (exp.bullets || []).forEach((bullet, bulletIdx) => {
      const trimmed = (bullet || '').replace(/^[-•▪*]\s*/, '').trim();
      const match = PASSIVE_STAR_PATTERNS.find(p => p.regex.test(trimmed));
      if (match) {
        let refined = match.replacer(trimmed);
        refined = refined.charAt(0).toUpperCase() + refined.slice(1);
        sugs.push({
          id: `star-${expIdx}-${bulletIdx}`,
          expIndex: expIdx,
          bulletIndex: bulletIdx,
          originalBullet: trimmed,
          suggestedBullet: refined,
          suggestedVerb: match.verb
        });
      }
    });
  });
  return sugs;
}

/**
 * Calculates 5 distinct candidate fit signals and calibrated overall Job Fit score.
 */
export function calculateMultiSignalJobFit(rawJd, currentCvState, gapResults, risks) {
  if (!currentCvState) {
    return {
      atsCompatibility: 0,
      evidenceStrength: 0,
      recruiterReadability: 0,
      keywordCoverage: 0,
      contentCredibility: 0,
      overallJobFit: 0,
      disclaimer: "Based on the CV and JD evidence available to the system, the profile is evaluated across multiple dimensions. Not a statistical hiring probability."
    };
  }

  const detailedAts = calculateDetailedAtsScore(currentCvState, gapResults.map(g => g.keyword));

  // 1. ATS Compatibility (0-100)
  const atsCompatibility = Math.round(
    (detailedAts.dimensions.structure.score / 20) * 50 + 
    (detailedAts.dimensions.keywords.score / 25) * 50
  );

  // 2. Evidence Strength (0-100)
  const totalReqs = gapResults.length || 1;
  const evidencedReqs = gapResults.filter(g => g.confidence === 'EXACT' || g.confidence === 'STRONG').length;
  const partialReqs = gapResults.filter(g => g.confidence === 'PARTIAL').length;
  const evidenceStrength = Math.min(100, Math.round(((evidencedReqs * 1.0 + partialReqs * 0.45) / totalReqs) * 100));

  // 3. Recruiter Readability (0-100)
  const recruiterReadability = Math.round(
    ((detailedAts.dimensions.readability?.score || 10) / 15) * 50 + 
    ((detailedAts.dimensions.actionVerbs?.score || detailedAts.dimensions.starVerbs?.score || 12) / 20) * 50
  );

  // 4. Keyword Coverage (0-100)
  const criticalReqs = gapResults.filter(g => g.importance === 'CRITICAL');
  const criticalEvidenced = criticalReqs.filter(g => g.confidence === 'EXACT' || g.confidence === 'STRONG').length;
  const keywordCoverage = criticalReqs.length > 0
    ? Math.round((criticalEvidenced / criticalReqs.length) * 100)
    : evidenceStrength;

  // 5. Content Credibility / Fact Safety (0-100)
  // Deduct points for critical risks like domain mismatch or keyword overuse
  let credibilityPenalty = 0;
  risks.forEach(r => {
    if (r.severity === 'HIGH' || r.severity === 'CRITICAL') credibilityPenalty += 4;
    else if (r.severity === 'MEDIUM') credibilityPenalty += 2;
  });
  const contentCredibility = Math.max(70, Math.min(100, 100 - credibilityPenalty));

  // Overall Calibrated Job Fit
  const overallJobFit = Math.round(
    0.25 * atsCompatibility +
    0.25 * evidenceStrength +
    0.20 * recruiterReadability +
    0.20 * keywordCoverage +
    0.10 * contentCredibility
  );

  return {
    atsCompatibility,
    evidenceStrength,
    recruiterReadability,
    keywordCoverage,
    contentCredibility,
    overallJobFit,
    disclaimer: "Based on the CV and JD evidence available to the system, the profile is evaluated across multiple dimensions. Not a statistical hiring probability."
  };
}

/**
 * Main P1.5 Decision Intelligence Generator
 */
export function generateDecisionIntelligence(rawJd, currentCvState) {
  if (!currentCvState) return null;

  // 1. Critical Gap Analysis
  const gapAnalysis = analyzeCriticalGaps(rawJd, currentCvState);
  const requirements = gapAnalysis.requirements;

  // 2. Evidence Placement Analysis
  const placements = analyzeEvidencePlacements(requirements, currentCvState);

  // 3. Recruiter Risk Detection
  const recruiterRisks = detectRecruiterRisks(rawJd, currentCvState, requirements);

  // 4. Multi-Signal Job Fit
  const jobFit = calculateMultiSignalJobFit(rawJd, currentCvState, requirements, recruiterRisks);

  // 5. Formulate ROI-Ranked Top Safe Actions
  const rawSafeActions = [];
  const blockedActions = [];

  // A. Evidence-Backed Skill Repositioning / Strengthening
  const topEvidenced = requirements.filter(r => (r.confidence === 'EXACT' || r.confidence === 'STRONG') && r.source?.type === 'experience');
  topEvidenced.forEach(req => {
    rawSafeActions.push({
      id: `act-reposition-${req.keyword.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      actionType: 'REPOSITION_SKILL',
      title: `Strengthen ${req.keyword} placement`,
      action: `Prioritize "${req.keyword}" in skills & headline for ATS parseability`,
      reason: `Verified evidence exists in ${req.cvLocation} (${req.evidenceSnippet}). High recruiter credibility.`,
      evidence: req.confidence,
      skillName: req.keyword,
      impactWeight: req.importance === 'CRITICAL' ? 3 : 2,
      confidenceScore: req.confidence === 'EXACT' ? 1.0 : 0.85,
      effortScore: 1, // Low effort
      risk: 'LOW',
      requiresApproval: true,
      selected: true
    });
  });

  // B. STAR Bullet Refinements (from active CV)
  const starSugs = extractStarSuggestions(currentCvState);
  starSugs.slice(0, 2).forEach(sug => {
    rawSafeActions.push({
      id: `act-star-${sug.id}`,
      actionType: 'STAR_BULLET_REFINEMENT',
      title: `Improve bullet with STAR action verb`,
      action: `Upgrade: "${sug.originalBullet.substring(0, 45)}..." -> "${sug.suggestedBullet.substring(0, 45)}..."`,
      reason: `Replaces passive phrasing with action verb "${sug.suggestedVerb}" while 100% preserving factual metrics.`,
      evidence: 'EXACT',
      targetExpIndex: sug.expIndex,
      targetBulletIndex: sug.bulletIndex,
      refinedBullet: sug.suggestedBullet,
      impactWeight: 2,
      confidenceScore: 1.0,
      effortScore: 1,
      risk: 'LOW',
      requiresApproval: true,
      selected: true
    });
  });

  // C. Headline Alignment (if evidenced)
  const cvTitle = currentCvState.header?.title || "";
  const evidencedKeywords = requirements.filter(r => r.confidence === 'EXACT').map(r => r.keyword);
  if (evidencedKeywords.length > 0 && !evidencedKeywords.some(k => cvTitle.toLowerCase().includes(k.toLowerCase()))) {
    const alignedTitle = `${cvTitle} (Specialized in ${evidencedKeywords.slice(0, 2).join(' & ')})`;
    rawSafeActions.push({
      id: `act-headline-align`,
      actionType: 'HEADLINE_ALIGN',
      title: `Align Profile Headline`,
      action: `Update title to: "${alignedTitle}"`,
      reason: `Highlights verified core skills (${evidencedKeywords.slice(0, 2).join(', ')}) directly in headline.`,
      evidence: 'EXACT',
      proposedHeadline: alignedTitle,
      impactWeight: 2,
      confidenceScore: 1.0,
      effortScore: 1,
      risk: 'LOW',
      requiresApproval: true,
      selected: true
    });
  }

  // D. Formulate BLOCKED Actions (Missing requirements & dangerous mutations)
  const missingRequirements = requirements.filter(r => r.recommendation === GAP_RECOMMENDATIONS.DO_NOT_INVENT);
  missingRequirements.forEach(req => {
    blockedActions.push({
      id: `blocked-add-${req.keyword.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: `Add ${req.keyword}`,
      reason: `No supporting evidence exists in candidate history for "${req.keyword}".`,
      scoreImpact: 0,
      isBlocked: true,
      allowedResolution: `Candidate may manually provide supporting evidence in natural-language prompt.`
    });
  });

  // Add standard safety blocks
  blockedActions.push({
    id: `blocked-invent-metrics`,
    title: `Invent unverified metrics or percentages`,
    reason: `Strict fact locking protects against fabricated quantifiable numbers.`,
    scoreImpact: 0,
    isBlocked: true,
    allowedResolution: `Candidate may manually specify real metrics in Prompt.`
  });

  // Sort Safe Actions by Deterministic ROI: Priority = (Impact * Confidence) / Effort
  const topSafeActions = rawSafeActions
    .map(act => ({
      ...act,
      priorityScore: (act.impactWeight * act.confidenceScore) / act.effortScore
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // 6. Run Dynamic Simulated Impact
  const simulation = simulateDecisionImpact(
    currentCvState, 
    requirements.map(r => r.keyword), 
    topSafeActions, 
    blockedActions
  );

  return {
    jobFit,
    criticalGaps: gapAnalysis,
    requirements,
    placements,
    recruiterRisks,
    topSafeActions,
    blockedActions,
    simulation
  };
}

import { ATS_KEYWORD_TAXONOMY } from './canonicalTaxonomy';
import { calculateKeywordFrequencyDamping } from './keywordMatcher';
import { evaluateEvidenceConfidence } from './confidenceEngine';
import { traceEvidenceLineage } from './evidenceLineage';
import { METRIC_NUMERIC_REGEX } from './metricSafety';

export const STRONG_ACTION_VERB_REGEX = /^(spearheaded|engineered|architected|optimized|developed|orchestrated|accelerated|streamlined|delivered|implemented|led|built|automated|managed|designed|scaled|launched|formulated|executed|mentored|drove|established|reduced|increased|boosted|transformed|negotiated|authored|published|conducted|standardized|secured|championed|pioneered|migrated|centralized|revamped|instituted|directed|supervised|coordinated|achieved)/i;

/**
 * DETERMINISTIC 5-DIMENSION ATS SCORE CALCULATOR (P1.4 CALIBRATED)
 */
export function calculateDetailedAtsScore(resume, targetKeywords = []) {
  if (!resume) {
    return {
      overallScore: 0,
      grade: 'Incomplete',
      dimensions: {
        keywords: { score: 0, maxScore: 25, label: 'Keyword Optimization', matched: 0, targetCount: 0, gaps: [], evidence: [] },
        actionVerbs: { score: 0, maxScore: 20, label: 'Action Verb & STAR Power', strongBulletsCount: 0, weakBulletsCount: 0, weakBullets: [] },
        metrics: { score: 0, maxScore: 20, label: 'Quantifiable Metrics', quantifiedCount: 0, unquantifiedCount: 0, unquantifiedBullets: [] },
        structure: { score: 0, maxScore: 20, label: 'Structural Parseability', points: 0, maxPoints: 5, checks: [] },
        readability: { score: 0, maxScore: 15, label: 'Brevity & Readability', optimalCount: 0, totalBullets: 0, avgWords: 0, checks: [] }
      },
      scoreTrace: [],
      totalBullets: 0
    };
  }

  const allBullets = (resume.experiences || []).flatMap((e, expIdx) => 
    (e.bullets || []).map((b, bIdx) => ({
      text: (b || '').trim(),
      company: e.company || e.location || 'Company',
      role: e.role || 'Role',
      expIndex: expIdx,
      bulletIndex: bIdx
    }))
  );
  const totalBullets = allBullets.length;

  const scoreTrace = [];

  // ==========================================
  // 1. KEYWORD OPTIMIZATION (Max: 25 pts)
  // ==========================================
  const keywordTaxonomy = (targetKeywords && targetKeywords.length > 0) ? targetKeywords : ATS_KEYWORD_TAXONOMY;
  const keywordEvidence = [];
  const keywordGaps = [];
  let keywordPointsEarned = 0;
  const maxKwPoints = 25;
  const pointPerKeyword = maxKwPoints / keywordTaxonomy.length;

  const rawMatches = [];
  keywordTaxonomy.forEach(kw => {
    const lineage = traceEvidenceLineage(kw, resume);
    if (lineage.confidence === 'EXACT') {
      keywordEvidence.push(lineage);
      rawMatches.push(kw);
      const earned = pointPerKeyword * 1.0;
      keywordPointsEarned += earned;
      scoreTrace.push({ dimension: 'keywords', rule: 'exact_match', item: kw, confidence: 'EXACT', result: 'matched', points: earned, lineage: lineage.lineageBreadcrumb });
    } else if (lineage.confidence === 'STRONG') {
      keywordEvidence.push(lineage);
      rawMatches.push(kw);
      const earned = pointPerKeyword * 0.85;
      keywordPointsEarned += earned;
      scoreTrace.push({ dimension: 'keywords', rule: 'strong_synonym_match', item: kw, confidence: 'STRONG', result: 'matched', points: earned, lineage: lineage.lineageBreadcrumb });
    } else if (lineage.confidence === 'PARTIAL') {
      keywordEvidence.push(lineage);
      const earned = pointPerKeyword * 0.40;
      keywordPointsEarned += earned;
      scoreTrace.push({ dimension: 'keywords', rule: 'partial_relationship_match', item: kw, confidence: 'PARTIAL', result: 'partial', points: earned, lineage: lineage.lineageBreadcrumb });
    } else {
      keywordGaps.push({ keyword: kw, canonicalKeyword: lineage.canonicalKeyword, confidence: 'NONE' });
      scoreTrace.push({ dimension: 'keywords', rule: 'missing_target_keyword', item: kw, confidence: 'NONE', result: 'missing', points: 0, lineage: 'None' });
    }
  });

  // Apply keyword stuffing defense
  const damping = calculateKeywordFrequencyDamping(rawMatches);
  const dampedKeywordScore = Math.min(maxKwPoints, Math.round(keywordPointsEarned * (damping.dampedScoreRatio || 1.0)));

  // ==========================================
  // 2. ACTION VERBS & STAR POWER (Max: 20 pts)
  // ==========================================
  let strongBulletsCount = 0;
  const weakBullets = [];
  const maxActionVerbPoints = 20;

  allBullets.forEach(b => {
    if (STRONG_ACTION_VERB_REGEX.test(b.text)) {
      strongBulletsCount++;
      scoreTrace.push({ dimension: 'actionVerbs', rule: 'strong_action_verb_opener', item: b.text.substring(0, 40) + '...', result: 'strong', points: (maxActionVerbPoints / (totalBullets || 1)) });
    } else {
      weakBullets.push(b);
      scoreTrace.push({ dimension: 'actionVerbs', rule: 'weak_or_passive_opener', item: b.text.substring(0, 40) + '...', result: 'needs_polish', points: 0 });
    }
  });

  const actionVerbRatio = totalBullets > 0 ? (strongBulletsCount / totalBullets) : 0;
  const actionVerbScore = Math.min(maxActionVerbPoints, Math.round(actionVerbRatio * maxActionVerbPoints));

  // ==========================================
  // 3. QUANTIFIABLE METRICS (Max: 20 pts)
  // ==========================================
  let quantifiedCount = 0;
  const unquantifiedBullets = [];
  const maxMetricPoints = 20;

  allBullets.forEach(b => {
    if (METRIC_NUMERIC_REGEX.test(b.text)) {
      quantifiedCount++;
      scoreTrace.push({ dimension: 'metrics', rule: 'quantified_outcome_verified', item: b.text.substring(0, 40) + '...', result: 'quantified', points: (maxMetricPoints / (totalBullets || 1)) });
    } else {
      unquantifiedBullets.push(b);
      scoreTrace.push({ dimension: 'metrics', rule: 'unquantified_bullet', item: b.text.substring(0, 40) + '...', result: 'unquantified', points: 0 });
    }
  });

  // Target: 40% of bullets contain quantified metrics
  const metricRatio = totalBullets > 0 ? (quantifiedCount / totalBullets) : 0;
  const metricScore = Math.min(maxMetricPoints, Math.round(Math.min(1.0, metricRatio / 0.40) * maxMetricPoints));

  // ==========================================
  // 4. STRUCTURAL PARSEABILITY (Max: 20 pts)
  // ==========================================
  const structureChecks = [];
  let structurePoints = 0;
  const maxStructurePts = 5;

  // Header / Contact
  const hasContact = Boolean(resume.header?.name && (resume.contact?.email || resume.contact?.phone || resume.header?.email));
  structureChecks.push({ name: 'Header & Contact Information', passed: hasContact, points: hasContact ? 4 : 0 });
  if (hasContact) structurePoints++;

  // Summary
  const hasSummary = Boolean(resume.header?.summary && resume.header.summary.length >= 20);
  structureChecks.push({ name: 'Executive Profile Summary', passed: hasSummary, points: hasSummary ? 4 : 0 });
  if (hasSummary) structurePoints++;

  // Experience
  const hasExp = Boolean(resume.experiences && resume.experiences.length > 0 && resume.experiences.every(e => e.role && (e.company || e.dates)));
  structureChecks.push({ name: 'Chronological Work Experience', passed: hasExp, points: hasExp ? 4 : 0 });
  if (hasExp) structurePoints++;

  // Education / Certs
  const hasEdu = Boolean((resume.education && resume.education.length > 0) || (resume.certifications && resume.certifications.length > 0));
  structureChecks.push({ name: 'Education & Certifications', passed: hasEdu, points: hasEdu ? 4 : 0 });
  if (hasEdu) structurePoints++;

  // Skills
  const hasSkills = Boolean(resume.skills && resume.skills.length >= 3);
  structureChecks.push({ name: 'Skills & Technical Competencies', passed: hasSkills, points: hasSkills ? 4 : 0 });
  if (hasSkills) structurePoints++;

  const structureScore = Math.round((structurePoints / maxStructurePts) * 20);

  // ==========================================
  // 5. BREVITY & READABILITY (Max: 15 pts)
  // ==========================================
  let optimalCount = 0;
  let wordSum = 0;
  allBullets.forEach(b => {
    const words = b.text.split(/\s+/).filter(Boolean);
    wordSum += words.length;
    if (words.length >= 10 && words.length <= 32) {
      optimalCount++;
    }
  });

  const avgWords = totalBullets > 0 ? Math.round(wordSum / totalBullets) : 0;
  const brevityRatio = totalBullets > 0 ? (optimalCount / totalBullets) : 1;
  const readabilityScore = Math.min(15, Math.round(brevityRatio * 15));

  // ==========================================
  // TOTAL OVERALL CALIBRATED ATS HEALTH SCORE
  // ==========================================
  const overallScore = Math.min(100, Math.round(dampedKeywordScore + actionVerbScore + metricScore + structureScore + readabilityScore));

  let grade = 'Excellent';
  if (overallScore < 60) grade = 'Needs Improvement';
  else if (overallScore < 75) grade = 'Good';
  else if (overallScore < 88) grade = 'Very Good';

  return {
    overallScore,
    grade,
    dimensions: {
      keywords: {
        score: dampedKeywordScore,
        maxScore: 25,
        label: 'Keyword Optimization',
        matched: keywordEvidence.length,
        targetCount: keywordTaxonomy.length,
        gaps: keywordGaps,
        evidence: keywordEvidence,
        details: `${keywordEvidence.length}/${keywordTaxonomy.length} target keywords verified (${dampedKeywordScore}/25 pts)`
      },
      actionVerbs: {
        score: actionVerbScore,
        maxScore: 20,
        label: 'Action Verb & STAR Power',
        strongBulletsCount,
        weakBulletsCount: weakBullets.length,
        weakBullets,
        details: `${strongBulletsCount}/${totalBullets} bullets begin with strong action verbs (${actionVerbScore}/20 pts)`
      },
      metrics: {
        score: metricScore,
        maxScore: 20,
        label: 'Quantifiable Metrics',
        quantifiedCount,
        unquantifiedCount: unquantifiedBullets.length,
        unquantifiedBullets,
        details: `${quantifiedCount}/${totalBullets} bullets contain quantified numbers (${metricScore}/20 pts)`
      },
      structure: {
        score: structureScore,
        maxScore: 20,
        label: 'Structural Parseability',
        points: structurePoints,
        maxPoints: maxStructurePts,
        checks: structureChecks,
        details: `${structurePoints}/${maxStructurePts} core ATS sections verified (${structureScore}/20 pts)`
      },
      readability: {
        score: readabilityScore,
        maxScore: 15,
        label: 'Brevity & Readability',
        optimalCount,
        totalBullets,
        avgWords,
        details: `Avg ${avgWords} words/bullet (${optimalCount}/${totalBullets} optimal length) (${readabilityScore}/15 pts)`
      }
    },
    scoreTrace,
    totalBullets
  };
}

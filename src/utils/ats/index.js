import { CANONICAL_SYNONYMS, PARTIAL_RELATIONSHIPS, STANDALONE_SHORT_TOKENS, ATS_KEYWORD_TAXONOMY } from './canonicalTaxonomy.js';
import { tokenizeText, matchesTermInText, calculateKeywordFrequencyDamping } from './keywordMatcher.js';
import { evaluateEvidenceConfidence } from './confidenceEngine.js';
import { traceEvidenceLineage } from './evidenceLineage.js';
import { analyzeMetricOpportunities, OUTCOME_VERB_REGEX, METRIC_NUMERIC_REGEX } from './metricSafety.js';
import { calculateDetailedAtsScore, STRONG_ACTION_VERB_REGEX } from './scoreCalculator.js';
import { generateScoreExplanationTree } from './scoreExplainability.js';
import { simulateScoreImprovement } from './scoreSimulator.js';
import { analyzeCriticalGaps, GAP_RECOMMENDATIONS, REQUIREMENT_IMPORTANCE } from './criticalGapEngine.js';
import { evaluatePlacementQuality, analyzeEvidencePlacements } from './placementEngine.js';
import { detectRecruiterRisks, RISK_CODES, RISK_SEVERITY } from './recruiterRiskEngine.js';
import { simulateDecisionImpact } from './decisionSimulator.js';
import { calculateMultiSignalJobFit, generateDecisionIntelligence } from './decisionIntelligence.js';

import { classifyUserIntent, USER_INTENTS } from './intentClassifier.js';
import { generateFullDocumentOptimization, generateFullCvGeneralOptimization, optimizeBulletPoint, SECTION_ACTIONS } from './fullDocumentOptimizer.js';

export {
  CANONICAL_SYNONYMS,
  PARTIAL_RELATIONSHIPS,
  STANDALONE_SHORT_TOKENS,
  ATS_KEYWORD_TAXONOMY,
  tokenizeText,
  matchesTermInText,
  calculateKeywordFrequencyDamping,
  evaluateEvidenceConfidence,
  traceEvidenceLineage,
  analyzeMetricOpportunities,
  OUTCOME_VERB_REGEX,
  METRIC_NUMERIC_REGEX,
  calculateDetailedAtsScore,
  STRONG_ACTION_VERB_REGEX,
  generateScoreExplanationTree,
  simulateScoreImprovement,
  analyzeCriticalGaps,
  GAP_RECOMMENDATIONS,
  REQUIREMENT_IMPORTANCE,
  evaluatePlacementQuality,
  analyzeEvidencePlacements,
  detectRecruiterRisks,
  RISK_CODES,
  RISK_SEVERITY,
  simulateDecisionImpact,
  calculateMultiSignalJobFit,
  generateDecisionIntelligence,
  classifyUserIntent,
  USER_INTENTS,
  generateFullDocumentOptimization,
  generateFullCvGeneralOptimization,
  optimizeBulletPoint,
  SECTION_ACTIONS
};

/**
 * P1.5 CALIBRATED JOB DESCRIPTION MATCH & ATS DECISION INTELLIGENCE ANALYZER
 */
export function analyzeJobDescriptionMatch(rawJd, currentCvState) {
  if (!rawJd || typeof rawJd !== 'string' || !rawJd.trim()) {
    return {
      matchScore: 0,
      requirements: [],
      safeSuggestions: [],
      summary: { total: 0, evidencedCount: 0, partialCount: 0, gapCount: 0, exactCount: 0, strongCount: 0 },
      explanation: null,
      simulation: null,
      decisionIntelligence: null
    };
  }

  const decisionIntelligence = generateDecisionIntelligence(rawJd, currentCvState);
  const criticalGaps = decisionIntelligence?.criticalGaps?.requirements || [];

  const extractedRequirements = [];
  const safeSuggestions = [];

  let exactCount = 0;
  let strongCount = 0;
  let partialCount = 0;
  let gapCount = 0;

  criticalGaps.forEach(req => {
    let status = 'NOT_EVIDENCED';
    if (req.confidence === 'EXACT' || req.confidence === 'STRONG') {
      status = 'EVIDENCED';
      if (req.confidence === 'EXACT') exactCount++;
      else strongCount++;
    } else if (req.confidence === 'PARTIAL') {
      status = 'PARTIALLY_EVIDENCED';
      partialCount++;
    } else {
      gapCount++;
    }

    extractedRequirements.push({
      id: `req-${req.keyword.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: req.keyword,
      status,
      confidence: req.confidence,
      importance: req.importance,
      recommendation: req.recommendation,
      evidenceSnippet: req.evidenceSnippet,
      cvLocation: req.cvLocation,
      source: req.source,
      scoreContribution: req.scoreContribution
    });

    // Formulate safe suggestions for evidenced skills under experience
    if ((req.confidence === 'EXACT' || req.confidence === 'STRONG') && req.source?.type === 'experience') {
      safeSuggestions.push({
        id: `sug-${req.keyword.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        targetSection: 'Skills / Summary',
        suggestionType: 'EVIDENCE_BACKED_EMPHASIS',
        skillName: req.keyword,
        rationale: `Candidate has verified experience with "${req.keyword}" (${req.cvLocation}). Emphasize in Skills list for ATS parseability.`,
        isSafe: true,
        requiresCandidateApproval: true
      });
    }
  });

  const total = extractedRequirements.length;
  const matchScore = total > 0 
    ? Math.round(((exactCount * 1.0 + strongCount * 0.85 + partialCount * 0.40) / total) * 100)
    : 0;

  // Calculate detailed scorecard & explainability
  const detailedScore = calculateDetailedAtsScore(currentCvState, extractedRequirements.map(r => r.name));
  const explanation = generateScoreExplanationTree(detailedScore);

  // 3. Additional Safe Suggestions (Headline alignment)
  const cvTitle = currentCvState?.header?.title || "";
  const topEvidencedSkills = extractedRequirements.filter(r => r.status === 'EVIDENCED').map(r => r.name);
  if (topEvidencedSkills.length > 0 && !topEvidencedSkills.some(s => cvTitle.toLowerCase().includes(s.toLowerCase()))) {
    const suggestedHeadline = `${cvTitle} (Specialized in ${topEvidencedSkills.slice(0, 2).join(' & ')})`;
    safeSuggestions.push({
      id: 'sug-headline-align',
      requirement: 'Target Job Alignment',
      currentEvidence: `Current title: "${cvTitle}"`,
      suggestedChange: `Align Headline: "${suggestedHeadline}"`,
      reason: `Highlights evidenced core competencies (${topEvidencedSkills.slice(0, 2).join(', ')}) directly in the headline.`,
      field: 'header.title',
      originalValue: cvTitle,
      proposedValue: suggestedHeadline,
      selected: true
    });
  }

  // Suggestion B: Prioritize evidenced skills at the front of the Skills section
  if (topEvidencedSkills.length > 0 && currentCvState?.skills) {
    const reorderedSkills = [
      ...topEvidencedSkills.filter(s => currentCvState.skills.some(cs => cs.toLowerCase() === s.toLowerCase())),
      ...currentCvState.skills.filter(cs => !topEvidencedSkills.some(s => s.toLowerCase() === cs.toLowerCase()))
    ];

    if (JSON.stringify(reorderedSkills) !== JSON.stringify(currentCvState.skills)) {
      safeSuggestions.push({
        id: 'sug-skills-reorder',
        requirement: 'ATS Keyword Priority',
        currentEvidence: `Skills currently listed in default order`,
        suggestedChange: `Prioritize target skills: ${topEvidencedSkills.slice(0, 3).join(', ')} at front of Skills array`,
        reason: `Improves ATS parsing prominence for explicitly matching skills without fabricating new qualifications.`,
        field: 'skills',
        originalValue: currentCvState.skills,
        proposedValue: reorderedSkills,
        selected: true
      });
    }
  }

  // Simulation
  const simulation = simulateScoreImprovement(currentCvState, extractedRequirements.map(r => r.name), safeSuggestions);

  // Full Document 100% Section-by-Section Optimization Plan
  const fullOptimization = generateFullDocumentOptimization(rawJd, currentCvState);

  return {
    matchScore,
    requirements: extractedRequirements,
    safeSuggestions,
    fullOptimization,
    summary: {
      total,
      evidencedCount: exactCount + strongCount,
      exactCount,
      strongCount,
      partialCount,
      gapCount
    },
    detailedScore,
    explanation,
    simulation,
    decisionIntelligence
  };
}

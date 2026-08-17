/**
 * P1.5 EVIDENCE PLACEMENT ENGINE
 * Evaluates the structural quality of verified evidence across sections
 * Formula: Placement Quality = Existence (30) + Location (40) + Context (15) + Specificity (15)
 * 
 * CORE INVARIANT: High-quality placement proposals never mutate CV state without ChangePlan approval.
 */

import { matchesTermInText } from './keywordMatcher.js';
import { OUTCOME_VERB_REGEX, METRIC_NUMERIC_REGEX } from './metricSafety.js';

export function evaluatePlacementQuality(term, lineageResult, currentCvState) {
  if (!lineageResult || lineageResult.confidence === 'NONE' || !currentCvState) {
    return {
      qualityScore: 0,
      rating: 'NO_EVIDENCE',
      location: 'None',
      hasContext: false,
      hasMetrics: false,
      recommendation: 'Do not invent or add without candidate proof.'
    };
  }

  let existenceScore = 30; // Base points for verified candidate evidence
  let locationScore = 0;
  let contextScore = 0;
  let specificityScore = 0;

  const sourceType = lineageResult.source?.type;
  const snippet = lineageResult.snippet || "";

  // 1. Location Weight (Max 40 pts)
  if (sourceType === 'experience') {
    locationScore = 40; // Experience bullets are strongest proof
  } else if (sourceType === 'header') {
    locationScore = 25; // Summary/Headline has high visibility
  } else if (sourceType === 'skills') {
    locationScore = 12; // Isolated skill entry has low recruiter proof
  } else {
    locationScore = 10;
  }

  // 2. Context Weight (Max 15 pts) - Surrounding action verbs & domain context
  if (sourceType === 'experience' && OUTCOME_VERB_REGEX.test(snippet)) {
    contextScore = 15;
  } else if (snippet.length > 30) {
    contextScore = 8;
  }

  // 3. Specificity & Measurability Weight (Max 15 pts)
  if (METRIC_NUMERIC_REGEX.test(snippet)) {
    specificityScore = 15;
  } else if (snippet.includes('architected') || snippet.includes('optimized') || snippet.includes('spearheaded')) {
    specificityScore = 10;
  }

  const qualityScore = Math.min(100, existenceScore + locationScore + contextScore + specificityScore);

  let rating = 'POOR';
  let recommendation = '';

  if (qualityScore >= 85) {
    rating = 'EXCELLENT';
    recommendation = `High-confidence placement verified in active experience (${lineageResult.lineageBreadcrumb}).`;
  } else if (qualityScore >= 65) {
    rating = 'STRONG';
    recommendation = `Solid placement in ${lineageResult.lineageBreadcrumb}; maintain active wording.`;
  } else if (qualityScore >= 40) {
    rating = 'MODERATE';
    recommendation = `Evidence isolated in ${lineageResult.lineageBreadcrumb}. Recommend reinforcing into relevant experience evidence.`;
  } else {
    rating = 'WEAK';
    recommendation = `Weak placement in ${lineageResult.lineageBreadcrumb}. Strengthen with verified project/role context.`;
  }

  return {
    term,
    qualityScore,
    rating,
    location: lineageResult.lineageBreadcrumb,
    sourceType,
    hasContext: contextScore > 0,
    hasMetrics: specificityScore === 15,
    recommendation
  };
}

/**
 * Analyzes placement quality for a list of requirements.
 */
export function analyzeEvidencePlacements(requirements, currentCvState) {
  if (!requirements || !Array.isArray(requirements)) return [];

  return requirements.map(req => {
    const lineage = {
      confidence: req.confidence,
      source: req.source,
      snippet: req.evidenceSnippet,
      lineageBreadcrumb: req.cvLocation
    };
    return evaluatePlacementQuality(req.keyword, lineage, currentCvState);
  });
}

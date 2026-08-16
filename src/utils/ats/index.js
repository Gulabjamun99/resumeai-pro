import { CANONICAL_SYNONYMS, PARTIAL_RELATIONSHIPS, STANDALONE_SHORT_TOKENS, ATS_KEYWORD_TAXONOMY } from './canonicalTaxonomy';
import { tokenizeText, matchesTermInText, calculateKeywordFrequencyDamping } from './keywordMatcher';
import { evaluateEvidenceConfidence } from './confidenceEngine';
import { traceEvidenceLineage } from './evidenceLineage';
import { analyzeMetricOpportunities, OUTCOME_VERB_REGEX, METRIC_NUMERIC_REGEX } from './metricSafety';
import { calculateDetailedAtsScore, STRONG_ACTION_VERB_REGEX } from './scoreCalculator';
import { generateScoreExplanationTree } from './scoreExplainability';
import { simulateScoreImprovement } from './scoreSimulator';

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
  simulateScoreImprovement
};

/**
 * P1.4 CALIBRATED JOB DESCRIPTION MATCH & DEEP EVIDENCE LINEAGE ANALYZER
 */
export function analyzeJobDescriptionMatch(rawJd, currentCvState) {
  if (!rawJd || typeof rawJd !== 'string' || !rawJd.trim()) {
    return {
      matchScore: 0,
      requirements: [],
      safeSuggestions: [],
      summary: { total: 0, evidencedCount: 0, partialCount: 0, gapCount: 0, exactCount: 0, strongCount: 0 },
      explanation: null,
      simulation: null
    };
  }

  const COMMON_SKILL_VOCABULARY = [
    "React", "Node.js", "Python", "Java", "AWS", "SQL", "TypeScript", "JavaScript",
    "Kubernetes", "Docker", "Go", "Golang", "C++", "C#", ".NET", "GCP", "Azure",
    "GraphQL", "REST API", "Microservices", "CI/CD", "Git", "Agile", "Scrum",
    "Talent Acquisition", "Technical Recruiting", "Sourcing", "ATS Optimization",
    "Stakeholder Management", "Team Leadership", "Data Analytics", "System Architecture",
    "Product Management", "Performance Optimization", "Security & Compliance", "PostgreSQL",
    "Machine Learning", "NLP", "LLMs"
  ];

  const extractedRequirements = [];
  const safeSuggestions = [];

  let exactCount = 0;
  let strongCount = 0;
  let partialCount = 0;
  let gapCount = 0;

  COMMON_SKILL_VOCABULARY.forEach(term => {
    const canonicalEntry = CANONICAL_SYNONYMS[term.toLowerCase().trim()];
    const aliases = canonicalEntry ? canonicalEntry.aliases : [];
    const termInJd = matchesTermInText(term, rawJd) || aliases.some(a => matchesTermInText(a, rawJd));

    if (termInJd) {
      const lineage = traceEvidenceLineage(term, currentCvState);
      
      let status = 'NOT_EVIDENCED';
      if (lineage.confidence === 'EXACT' || lineage.confidence === 'STRONG') {
        status = 'EVIDENCED';
        if (lineage.confidence === 'EXACT') exactCount++;
        else strongCount++;
      } else if (lineage.confidence === 'PARTIAL') {
        status = 'PARTIALLY_EVIDENCED';
        partialCount++;
      } else {
        gapCount++;
      }

      extractedRequirements.push({
        id: `req-${term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: term,
        status,
        confidence: lineage.confidence,
        matchType: lineage.matchType,
        evidenceSnippet: lineage.snippet,
        cvLocation: lineage.lineageBreadcrumb,
        source: lineage.source,
        scoreContribution: lineage.scoreContribution
      });

      // Formulate safe suggestions for evidenced or partial skills not in header/summary
      if ((lineage.confidence === 'EXACT' || lineage.confidence === 'STRONG') && lineage.source.type === 'experience') {
        safeSuggestions.push({
          id: `sug-${term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          targetSection: 'Skills / Summary',
          suggestionType: 'EVIDENCE_BACKED_EMPHASIS',
          skillName: term,
          rationale: `Candidate has verified experience with "${term}" (${lineage.lineageBreadcrumb}). Emphasize in Skills list for ATS parseability.`,
          isSafe: true,
          requiresCandidateApproval: true
        });
      }
    }
  });

  const total = extractedRequirements.length;
  const matchScore = total > 0 
    ? Math.round(((exactCount * 1.0 + strongCount * 0.85 + partialCount * 0.40) / total) * 100)
    : 0;

  // Calculate detailed scorecard & explainability
  const detailedScore = calculateDetailedAtsScore(currentCvState, extractedRequirements.map(r => r.name));
  const explanation = generateScoreExplanationTree(detailedScore);

  // Compute non-mutating simulated score improvement
  const simulation = simulateScoreImprovement(currentCvState, extractedRequirements.map(r => r.name), safeSuggestions);

  return {
    matchScore,
    requirements: extractedRequirements,
    safeSuggestions,
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
    simulation
  };
}

/**
 * P1.5 CRITICAL GAP ENGINE
 * Evaluates target JD requirements by context and importance (CRITICAL, IMPORTANT, NICE_TO_HAVE, LOW)
 * and determines actionable, anti-hallucination recommendations.
 * 
 * CORE INVARIANT: Missing evidence != permission to add the skill.
 */

import { CANONICAL_SYNONYMS, ATS_KEYWORD_TAXONOMY } from './canonicalTaxonomy.js';
import { matchesTermInText } from './keywordMatcher.js';
import { evaluateEvidenceConfidence } from './confidenceEngine.js';
import { traceEvidenceLineage } from './evidenceLineage.js';

export const REQUIREMENT_IMPORTANCE = {
  CRITICAL: 'CRITICAL',
  IMPORTANT: 'IMPORTANT',
  NICE_TO_HAVE: 'NICE_TO_HAVE',
  LOW: 'LOW'
};

export const GAP_RECOMMENDATIONS = {
  KEEP: 'KEEP',
  STRENGTHEN: 'STRENGTHEN',
  STRENGTHEN_PLACEMENT: 'STRENGTHEN_PLACEMENT',
  DO_NOT_INVENT: 'DO_NOT_INVENT',
  IGNORE: 'IGNORE'
};

/**
 * Classifies the importance of a JD requirement based on context, qualifiers, and frequency.
 */
export function classifyJdRequirementImportance(term, rawJd) {
  if (!rawJd || typeof rawJd !== 'string' || !term) return REQUIREMENT_IMPORTANCE.LOW;

  const lowerJd = rawJd.toLowerCase();
  const lowerTerm = term.toLowerCase().trim();

  // 1. Check for generic soft skills / low priority terms
  const GENERIC_SOFT_SKILLS = [
    'communication', 'team player', 'motivated', 'passionate', 'fast learner',
    'interpersonal', 'multitasking', 'hardworking', 'enthusiastic'
  ];
  if (GENERIC_SOFT_SKILLS.some(soft => lowerTerm.includes(soft))) {
    return REQUIREMENT_IMPORTANCE.LOW;
  }

  // 2. Check for explicit "Nice to have" / "Preferred" / "Bonus" / "Plus" context around the term
  const sentences = rawJd.split(/[.\n;•▪*]+/);
  const containingSentences = sentences.filter(s => matchesTermInText(lowerTerm, s));

  for (const sentence of containingSentences) {
    const sLower = sentence.toLowerCase();
    if (
      sLower.includes('plus') || 
      sLower.includes('preferred') || 
      sLower.includes('nice to have') || 
      sLower.includes('bonus') ||
      sLower.includes('optional') ||
      sLower.includes('advantage')
    ) {
      return REQUIREMENT_IMPORTANCE.NICE_TO_HAVE;
    }
  }

  // 3. Check for explicit "Must have" / "Required" / "5+ years" / "Deep experience"
  for (const sentence of containingSentences) {
    const sLower = sentence.toLowerCase();
    if (
      sLower.includes('must have') || 
      sLower.includes('required') || 
      sLower.includes('essential') || 
      sLower.includes('minimum') ||
      sLower.includes('proven track record') ||
      sLower.includes('deep experience') ||
      sLower.includes('hands-on expertise') ||
      /\b\d+\+?\s*years\b/.test(sLower)
    ) {
      return REQUIREMENT_IMPORTANCE.CRITICAL;
    }
  }

  // 4. Default primary technical skills / role core competencies to IMPORTANT
  return REQUIREMENT_IMPORTANCE.IMPORTANT;
}

/**
 * Determines deterministic recommendation based on evidence location, confidence, and importance.
 */
export function determineRequirementRecommendation(confidence, importance, sourceType) {
  // 1. Generic soft skills / low importance
  if (importance === REQUIREMENT_IMPORTANCE.LOW) {
    return GAP_RECOMMENDATIONS.IGNORE;
  }

  // 2. Exact or Strong Evidence (Directly proven in CV)
  if (confidence === 'EXACT' || confidence === 'STRONG') {
    if (sourceType === 'experience') {
      return importance === REQUIREMENT_IMPORTANCE.CRITICAL 
        ? GAP_RECOMMENDATIONS.STRENGTHEN 
        : GAP_RECOMMENDATIONS.KEEP;
    }
    if (sourceType === 'skills') {
      return importance === REQUIREMENT_IMPORTANCE.CRITICAL
        ? GAP_RECOMMENDATIONS.STRENGTHEN_PLACEMENT
        : GAP_RECOMMENDATIONS.STRENGTHEN;
    }
    return GAP_RECOMMENDATIONS.KEEP;
  }

  // 3. Nice to have with Partial or No evidence -> IGNORE
  if (importance === REQUIREMENT_IMPORTANCE.NICE_TO_HAVE) {
    return GAP_RECOMMENDATIONS.IGNORE;
  }

  // 4. Critical or Important with Partial or No evidence -> DO_NOT_INVENT
  return GAP_RECOMMENDATIONS.DO_NOT_INVENT;
}

/**
 * Analyzes all JD requirements and builds structured critical gap objects.
 */
export function analyzeCriticalGaps(rawJd, currentCvState) {
  if (!rawJd || typeof rawJd !== 'string' || !rawJd.trim()) {
    return { requirements: [], criticalGapsCount: 0, totalEvidenced: 0 };
  }

  const vocabSet = new Set([
    ...ATS_KEYWORD_TAXONOMY,
    "React", "Node.js", "Python", "Java", "AWS", "SQL", "TypeScript", "JavaScript",
    "Kubernetes", "Docker", "Go", "Golang", "C++", "C#", ".NET", "GCP", "Azure",
    "GraphQL", "REST API", "REST APIs", "Microservices", "CI/CD", "Git", "Agile", "Scrum",
    "Talent Acquisition", "Technical Recruiting", "Sourcing", "ATS Optimization",
    "Stakeholder Management", "Team Leadership", "Data Analytics", "System Architecture",
    "Product Management", "Performance Optimization", "Security & Compliance", "PostgreSQL",
    "Machine Learning", "NLP", "LLMs", "Workday", "PHP", "Laravel", "Vue.js", "MySQL",
    "MongoDB", "Maya", "Photoshop", "Graphic Design", "3D Sculpting", "3D Modeling",
    "Veterinary Surgery", "Pharmacology"
  ]);
  const COMMON_SKILL_VOCABULARY = Array.from(vocabSet);

  const analyzedRequirements = [];
  let criticalGapsCount = 0;
  let totalEvidenced = 0;

  COMMON_SKILL_VOCABULARY.forEach(term => {
    const canonicalEntry = CANONICAL_SYNONYMS[term.toLowerCase().trim()];
    const aliases = canonicalEntry ? canonicalEntry.aliases : [];
    const termInJd = matchesTermInText(term, rawJd) || aliases.some(a => matchesTermInText(a, rawJd));

    if (termInJd) {
      const lineage = traceEvidenceLineage(term, currentCvState);
      const importance = classifyJdRequirementImportance(term, rawJd);
      const recommendation = determineRequirementRecommendation(
        lineage.confidence, 
        importance, 
        lineage.source?.type
      );

      if (lineage.confidence === 'EXACT' || lineage.confidence === 'STRONG') {
        totalEvidenced++;
      } else if (lineage.confidence === 'NONE' && importance === REQUIREMENT_IMPORTANCE.CRITICAL) {
        criticalGapsCount++;
      }

      analyzedRequirements.push({
        keyword: term,
        canonicalTerm: canonicalEntry ? canonicalEntry.canonical : term.toLowerCase(),
        importance,
        confidence: lineage.confidence,
        source: lineage.source,
        cvLocation: lineage.lineageBreadcrumb,
        evidenceSnippet: lineage.snippet,
        recommendation,
        scoreContribution: lineage.scoreContribution,
        isBlocked: recommendation === GAP_RECOMMENDATIONS.DO_NOT_INVENT
      });
    }
  });

  return {
    requirements: analyzedRequirements,
    criticalGapsCount,
    totalEvidenced
  };
}

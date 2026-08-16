import { CANONICAL_SYNONYMS, PARTIAL_RELATIONSHIPS } from './canonicalTaxonomy';
import { matchesTermInText } from './keywordMatcher';

/**
 * EVALUATES 4-TIER EVIDENCE CONFIDENCE FOR A TARGET REQUIREMENT
 * 
 * Confidence Levels:
 * - EXACT: Literal normalized term found directly in skills, experiences, or summary.
 * - STRONG: Controlled 1:1 synonym / alias match (e.g. K8s -> Kubernetes, GCP -> Google Cloud).
 * - PARTIAL: Related domain relationship (e.g. PostgreSQL -> SQL, Microservices -> Distributed Systems).
 * - NONE: Zero evidence in active CV.
 */
export function evaluateEvidenceConfidence(targetTerm, resume) {
  if (!targetTerm || !resume) {
    return {
      status: 'NOT_EVIDENCED',
      confidence: 'NONE',
      matchedTerm: null,
      canonicalTerm: (targetTerm || '').toLowerCase().trim(),
      reason: 'No candidate record or target term provided'
    };
  }

  const normTarget = targetTerm.trim().toLowerCase();
  const canonicalEntry = CANONICAL_SYNONYMS[normTarget];
  const canonicalName = canonicalEntry ? canonicalEntry.canonical : normTarget;

  // Extract CV sections
  const cvSkills = (resume.skills || []).map(s => (s || '').trim());
  const cvBullets = (resume.experiences || []).flatMap(e => (e.bullets || []).map(b => (b || '').trim()));
  const cvSummary = resume.header?.summary || "";
  const cvTitle = resume.header?.title || "";

  // 1. Check EXACT Match (Direct literal match in skills, summary, title, or bullets)
  const isExactInSkills = cvSkills.some(s => matchesTermInText(normTarget, s));
  const isExactInBullets = cvBullets.some(b => matchesTermInText(normTarget, b));
  const isExactInHeader = matchesTermInText(normTarget, cvSummary) || matchesTermInText(normTarget, cvTitle);

  if (isExactInSkills || isExactInBullets || isExactInHeader) {
    return {
      status: 'EVIDENCED',
      confidence: 'EXACT',
      matchedTerm: targetTerm,
      canonicalTerm: canonicalName,
      matchType: 'exact',
      reason: `Direct literal match for "${targetTerm}" verified in candidate history`
    };
  }

  // 2. Check STRONG Match (Controlled Synonym / Alias Match)
  if (canonicalEntry && canonicalEntry.aliases) {
    for (const alias of canonicalEntry.aliases) {
      const aliasInSkills = cvSkills.some(s => matchesTermInText(alias, s));
      const aliasInBullets = cvBullets.some(b => matchesTermInText(alias, b));
      const aliasInHeader = matchesTermInText(alias, cvSummary) || matchesTermInText(alias, cvTitle);

      if (aliasInSkills || aliasInBullets || aliasInHeader) {
        return {
          status: 'EVIDENCED',
          confidence: 'STRONG',
          matchedTerm: alias,
          canonicalTerm: canonicalName,
          matchType: 'controlled_synonym',
          reason: `Controlled synonym match: "${targetTerm}" is evidenced via canonical alias "${alias}"`
        };
      }
    }
  }

  // 3. Check PARTIAL Match (Domain relationship / Related competency)
  const partialRelations = PARTIAL_RELATIONSHIPS[normTarget] || [];
  for (const rel of partialRelations) {
    const relInSkills = cvSkills.some(s => matchesTermInText(rel, s));
    const relInBullets = cvBullets.some(b => matchesTermInText(rel, b));
    const relInHeader = matchesTermInText(rel, cvSummary) || matchesTermInText(rel, cvTitle);

    if (relInSkills || relInBullets || relInHeader) {
      return {
        status: 'PARTIALLY_EVIDENCED',
        confidence: 'PARTIAL',
        matchedTerm: rel,
        canonicalTerm: canonicalName,
        matchType: 'domain_relationship',
        reason: `Partial related competency: candidate demonstrates "${rel}" related to "${targetTerm}"`
      };
    }
  }

  // 4. Default: NONE
  return {
    status: 'NOT_EVIDENCED',
    confidence: 'NONE',
    matchedTerm: null,
    canonicalTerm: canonicalName,
    matchType: 'unsupported',
    reason: `No evidence for "${targetTerm}" or related competencies found in active candidate record`
  };
}

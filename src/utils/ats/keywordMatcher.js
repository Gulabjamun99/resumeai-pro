import { STANDALONE_SHORT_TOKENS } from './canonicalTaxonomy.js';

/**
 * TOKENIZES PLAIN TEXT INTO NORMALIZED WORD TOKENS
 * Strips punctuation while preserving hyphens and slashes in terms like CI/CD, Node.js, C++
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Replace punctuation except internal plus/sharp/slash/dots
  return text
    .toLowerCase()
    .replace(/[^\w\s\+\#\/\.\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * STRICT TERM MATCHING WITH BOUNDARY ENFORCEMENT
 * Prevents false positives (e.g. "AI" inside "email" or "training", "AWS" in "laws", "Go" in "good")
 */
export function matchesTermInText(term, text) {
  if (!term || !text || typeof text !== 'string') return false;
  
  const lowerTerm = term.trim().toLowerCase();
  const lowerText = text.toLowerCase();

  // If multi-word phrase (e.g. "talent acquisition", "machine learning")
  if (lowerTerm.includes(' ') || lowerTerm.includes('/') || lowerTerm.includes('.')) {
    const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const phraseRegex = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
    return phraseRegex.test(lowerText);
  }

  // If standalone short token (e.g. "ai", "go", "c", "r", "ml", "aws", "k8s")
  if (STANDALONE_SHORT_TOKENS.has(lowerTerm) || lowerTerm.length <= 3) {
    const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const shortTokenRegex = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
    return shortTokenRegex.test(lowerText);
  }

  // Standard word boundary
  const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(lowerText);
}

/**
 * KEYWORD STUFFING DEFENSE / DAMPING
 * Repetition of identical keywords yields diminishing marginal returns.
 * 1st match: 100% weight, 2nd match: 40% weight, 3rd match: 10% weight, >3 matches: 0%
 */
export function calculateKeywordFrequencyDamping(matchesArray) {
  const counts = {};
  let weightedUniqueMatches = 0;

  matchesArray.forEach(kw => {
    const norm = kw.toLowerCase();
    counts[norm] = (counts[norm] || 0) + 1;
    if (counts[norm] === 1) weightedUniqueMatches += 1.0;
    else if (counts[norm] === 2) weightedUniqueMatches += 0.4;
    else if (counts[norm] === 3) weightedUniqueMatches += 0.1;
  });

  return {
    rawMatchCount: matchesArray.length,
    uniqueCount: Object.keys(counts).length,
    dampedScoreRatio: Object.keys(counts).length > 0 ? (weightedUniqueMatches / Object.keys(counts).length) : 0
  };
}

/**
 * METRIC SAFETY & NON-FABRICATION ENFORCER (P1.4 DIRECTIVE)
 * 
 * Strict Rule:
 * - "This bullet lacks a metric" != "Add 25% efficiency improvement"
 * - The engine must NEVER automatically generate numbers, percentages, dollar amounts, or metrics.
 * - Metric opportunities are flagged as candidate-supplied placeholders only.
 */

export const OUTCOME_VERB_REGEX = /\b(increased|reduced|saved|accelerated|boosted|scaled|improved|expanded|maximized|minimized|decreased|generated|streamlined|delivered)\b/i;
export const METRIC_NUMERIC_REGEX = /(\b\d+([,.]\d+)?\s*(%|percent|k|m|b|x|users|clients|candidates|hires|engineers|teams|days|hours|minutes|seconds|ms|queries|requests|rps|tps|scale|revenue|budget|arr|gmv)\b|\$\s*\d+|\b\d{2,}\b)/i;

/**
 * DETECTS METRIC OPPORTUNITIES WITHOUT INVENTING NUMBERS
 */
export function analyzeMetricOpportunities(bullets = []) {
  const opportunities = [];

  bullets.forEach((bullet, index) => {
    const text = (bullet || '').trim();
    const hasOutcomeVerb = OUTCOME_VERB_REGEX.test(text);
    const hasMetric = METRIC_NUMERIC_REGEX.test(text);

    if (hasOutcomeVerb && !hasMetric) {
      opportunities.push({
        bulletIndex: index,
        originalBullet: text,
        hasMetric: false,
        isMetricOpportunity: true,
        requiresCandidateNumber: true,
        advisoryNote: "Metric opportunity detected: This bullet describes business impact but contains no verified numbers or percentages.",
        safeRecommendation: "If you have verified figures (e.g. '% time saved' or 'team size'), add them directly. AI will never fabricate numbers."
      });
    }
  });

  return opportunities;
}

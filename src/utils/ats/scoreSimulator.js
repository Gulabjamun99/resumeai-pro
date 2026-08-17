import { calculateDetailedAtsScore } from './scoreCalculator.js';

/**
 * PURE NON-MUTATING BEFORE/AFTER SCORE SIMULATOR (P1.4 DIRECTIVE)
 * 
 * Safety Invariant:
 * - Never modifies CURRENT_CV_STATE.
 * - Deep-clones input resume into an ephemeral sandbox.
 * - Applies ONLY evidence-safe approved suggestions.
 * - Calculates simulated projected score delta.
 */
export function simulateScoreImprovement(currentResume, targetKeywords = [], approvedSafeSuggestions = []) {
  if (!currentResume) {
    return {
      currentScore: 0,
      projectedScore: 0,
      delta: 0,
      appliedSuggestions: [],
      blockedSuggestions: [],
      mutationsAppliedToRealState: false
    };
  }

  // 1. Calculate baseline current score
  const baselineDetailed = calculateDetailedAtsScore(currentResume, targetKeywords);
  const currentScore = baselineDetailed.overallScore;

  if (!approvedSafeSuggestions || approvedSafeSuggestions.length === 0) {
    return {
      currentScore,
      projectedScore: currentScore,
      delta: 0,
      appliedSuggestions: [],
      blockedSuggestions: [],
      mutationsAppliedToRealState: false
    };
  }

  // 2. Deep-clone into simulated state (Strict zero-mutation boundary)
  const simulatedResume = JSON.parse(JSON.stringify(currentResume));
  const applied = [];
  const blocked = [];

  approvedSafeSuggestions.forEach(sug => {
    // Apply STAR bullet refinement
    if (sug.expIndex !== undefined && sug.bulletIndex !== undefined && sug.suggestedBullet) {
      if (simulatedResume.experiences && simulatedResume.experiences[sug.expIndex] && simulatedResume.experiences[sug.expIndex].bullets) {
        simulatedResume.experiences[sug.expIndex].bullets[sug.bulletIndex] = sug.suggestedBullet;
        applied.push({
          type: 'STAR_BULLET_REFINEMENT',
          target: `experiences[${sug.expIndex}].bullets[${sug.bulletIndex}]`,
          description: `Refined bullet with strong action verb "${sug.strongVerb || 'Optimized'}"`
        });
      }
    } else if (sug.type === 'ADD_SKILL' && sug.skillName) {
      // Add verified evidenced skill
      if (!simulatedResume.skills) simulatedResume.skills = [];
      if (!simulatedResume.skills.includes(sug.skillName)) {
        simulatedResume.skills.push(sug.skillName);
        applied.push({
          type: 'EVIDENCED_SKILL_INCLUSION',
          target: 'skills',
          description: `Included evidenced keyword "${sug.skillName}"`
        });
      }
    } else {
      blocked.push(sug);
    }
  });

  // 3. Calculate projected score on simulated clone
  const projectedDetailed = calculateDetailedAtsScore(simulatedResume, targetKeywords);
  const projectedScore = projectedDetailed.overallScore;
  const delta = Math.max(0, projectedScore - currentScore);

  return {
    currentScore,
    projectedScore,
    delta,
    appliedSuggestions: applied,
    blockedSuggestions: blocked,
    projectedDimensions: projectedDetailed.dimensions,
    mutationsAppliedToRealState: false
  };
}

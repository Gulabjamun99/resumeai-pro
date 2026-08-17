/**
 * P1.5 RECRUITER RISK ENGINE
 * Proactively flags 10 distinct recruiter risks (Domain mismatch, keyword overuse, unsupported claims, etc.)
 * Ensures safe advisory callouts without making unfounded candidate rejections.
 */

import { matchesTermInText } from './keywordMatcher.js';
import { METRIC_NUMERIC_REGEX, OUTCOME_VERB_REGEX } from './metricSafety.js';

export const RISK_CODES = {
  DOMAIN_ROLE_MISMATCH: 'DOMAIN_ROLE_MISMATCH',
  KEYWORD_OVERUSE: 'KEYWORD_OVERUSE',
  UNSUPPORTED_CLAIM: 'UNSUPPORTED_CLAIM',
  TITLE_MISMATCH: 'TITLE_MISMATCH',
  EXPERIENCE_GAP: 'EXPERIENCE_GAP',
  DATE_INCONSISTENCY: 'DATE_INCONSISTENCY',
  SKILL_CONTEXT_GAP: 'SKILL_CONTEXT_GAP',
  GENERIC_BULLET_PATTERN: 'GENERIC_BULLET_PATTERN',
  EXCESSIVE_REPETITION: 'EXCESSIVE_REPETITION',
  CREDIBILITY_RISK: 'CREDIBILITY_RISK'
};

export const RISK_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

/**
 * Analyzes complete recruiter risks between JD requirements and current CV state.
 */
export function detectRecruiterRisks(rawJd, currentCvState, gapAnalysisResults = []) {
  const risks = [];
  if (!currentCvState) return risks;

  const cvTitle = (currentCvState.header?.title || "").toLowerCase();
  const cvSummary = (currentCvState.header?.summary || "").toLowerCase();
  const allBullets = (currentCvState.experiences || []).flatMap(e => (e.bullets || []));
  const bulletText = allBullets.join(' ').toLowerCase();
  const cvSkills = currentCvState.skills || [];

  // 1. DOMAIN_ROLE_MISMATCH & TITLE_MISMATCH
  if (rawJd && typeof rawJd === 'string') {
    const lowerJd = rawJd.toLowerCase();
    const isEngineeringJd = lowerJd.includes('software engineer') || lowerJd.includes('infrastructure engineer') || lowerJd.includes('cloud engineer') || lowerJd.includes('engineering manager') || lowerJd.includes('full-stack');
    const isRecruitingCv = cvTitle.includes('recruiter') || cvTitle.includes('talent acquisition') || cvTitle.includes('sourcing');
    const isRecruitingJd = lowerJd.includes('recruiter') || lowerJd.includes('talent acquisition') || lowerJd.includes('recruitment');
    const isEngineeringCv = cvTitle.includes('engineer') || cvTitle.includes('developer') || cvTitle.includes('architect');

    if (isEngineeringJd && isRecruitingCv) {
      risks.push({
        code: RISK_CODES.DOMAIN_ROLE_MISMATCH,
        severity: RISK_SEVERITY.HIGH,
        title: 'Role Alignment & Domain Mismatch Risk',
        description: `Target JD seeks technical engineering leadership, while demonstrated CV title is "${currentCvState.header?.title}".`,
        recommendation: 'Primary job-family alignment is weak. No automatic title modification permitted to prevent misrepresentation.',
        blockedActions: ['Automatic title falsification to Engineering Manager']
      });
    } else if (isRecruitingJd && isEngineeringCv) {
      risks.push({
        code: RISK_CODES.DOMAIN_ROLE_MISMATCH,
        severity: RISK_SEVERITY.HIGH,
        title: 'Role Alignment Risk',
        description: `Target JD seeks Talent Acquisition / Recruiting, while active CV is "${currentCvState.header?.title}".`,
        recommendation: 'Highlight transferable stakeholder engagement and hiring process experience; do not invent recruiting history.',
        blockedActions: ['Automatic title replacement']
      });
    }
  }

  // 2. KEYWORD_OVERUSE & EXCESSIVE_REPETITION
  const tokenCounts = {};
  cvSkills.forEach(skill => {
    const norm = skill.toLowerCase().trim();
    if (norm.length > 2) {
      const regex = new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = (bulletText.match(regex) || []).length;
      if (matches >= 6) {
        tokenCounts[skill] = matches;
      }
    }
  });

  Object.entries(tokenCounts).forEach(([skill, count]) => {
    risks.push({
      code: RISK_CODES.KEYWORD_OVERUSE,
      severity: count >= 10 ? RISK_SEVERITY.HIGH : RISK_SEVERITY.MEDIUM,
      title: `Keyword Overuse Detected: "${skill}"`,
      description: `"${skill}" appears ${count} times throughout candidate experience descriptions.`,
      recommendation: `Diminishing ATS returns and negative recruiter readability. Suggest diversifying vocabulary and reducing repetition rather than adding more occurrences.`,
      blockedActions: [`Adding more instances of "${skill}"`]
    });
  });

  // 3. UNSUPPORTED_CLAIM & CREDIBILITY_RISK
  if (gapAnalysisResults && Array.isArray(gapAnalysisResults)) {
    const unevidencedCritical = gapAnalysisResults.filter(g => g.confidence === 'NONE' && (g.importance === 'CRITICAL' || g.importance === 'IMPORTANT'));
    if (unevidencedCritical.length > 0) {
      risks.push({
        code: RISK_CODES.UNSUPPORTED_CLAIM,
        severity: RISK_SEVERITY.HIGH,
        title: `Unsupported Core Requirement Risk (${unevidencedCritical.length} Missing)`,
        description: `Target JD requires: ${unevidencedCritical.slice(0, 3).map(g => g.keyword).join(', ')}, but no supporting evidence exists in candidate history.`,
        recommendation: `AI generation of unverified skills is strictly BLOCKED. Candidate must provide authentic proof before adding to CV.`,
        blockedActions: unevidencedCritical.map(g => `Add unsupported "${g.keyword}"`)
      });
    }
  }

  // 4. SKILL_CONTEXT_GAP
  const skillsWithoutExperience = cvSkills.filter(skill => {
    const norm = skill.toLowerCase().trim();
    return !matchesTermInText(norm, bulletText) && !matchesTermInText(norm, cvSummary);
  });
  if (skillsWithoutExperience.length >= 4) {
    risks.push({
      code: RISK_CODES.SKILL_CONTEXT_GAP,
      severity: RISK_SEVERITY.LOW,
      title: 'Skill Context Gap',
      description: `${skillsWithoutExperience.length} skills (${skillsWithoutExperience.slice(0, 3).join(', ')}...) appear only in Skills list with no corresponding project/experience context.`,
      recommendation: 'Recruiters favor experience-backed evidence over isolated skill inventories. Consider adding authentic project references.',
      blockedActions: []
    });
  }

  // 5. GENERIC_BULLET_PATTERN
  const weakBullets = allBullets.filter(b => !OUTCOME_VERB_REGEX.test(b) && !METRIC_NUMERIC_REGEX.test(b));
  if (allBullets.length > 0 && weakBullets.length / allBullets.length >= 0.5) {
    risks.push({
      code: RISK_CODES.GENERIC_BULLET_PATTERN,
      severity: RISK_SEVERITY.MEDIUM,
      title: 'High Passive Bullet Ratio',
      description: `${weakBullets.length} of ${allBullets.length} bullets lack quantifiable metrics or strong outcome verbs.`,
      recommendation: 'Strengthen existing bullets with STAR action verbs and verified outcomes without fabricating metrics.',
      blockedActions: []
    });
  }

  return risks;
}

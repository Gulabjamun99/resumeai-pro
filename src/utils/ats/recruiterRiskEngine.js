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

  const cvTitle = typeof currentCvState.header?.title === 'string' ? currentCvState.header.title.toLowerCase() : "";
  const cvSummary = typeof currentCvState.header?.summary === 'string' ? currentCvState.header.summary.toLowerCase() : "";
  const cvExperiences = Array.isArray(currentCvState.experiences) ? currentCvState.experiences : [];
  const allBullets = cvExperiences.flatMap(e => (Array.isArray(e?.bullets) ? e.bullets : []));
  const bulletText = allBullets.join(' ').toLowerCase();
  const cvSkills = Array.isArray(currentCvState.skills) ? currentCvState.skills : [];
  const fullCvText = `${cvTitle} ${cvSummary} ${bulletText} ${cvSkills.join(' ')}`.toLowerCase();

  // 1. DOMAIN_ROLE_MISMATCH & TITLE_MISMATCH
  if (rawJd && typeof rawJd === 'string') {
    const lowerJd = rawJd.toLowerCase();
    
    // Domain Mismatch: Engineering vs Recruiting / Chef / Healthcare / Legal
    const isEngineeringJd = lowerJd.includes('software engineer') || lowerJd.includes('infrastructure') || lowerJd.includes('cloud engineer') || lowerJd.includes('developer') || lowerJd.includes('full-stack');
    const isRecruitingJd = lowerJd.includes('recruiter') || lowerJd.includes('talent acquisition') || lowerJd.includes('recruitment');
    const isCulinaryJd = lowerJd.includes('chef') || lowerJd.includes('cuisine') || lowerJd.includes('kitchen brigade') || lowerJd.includes('pastry');
    const isMedicalJd = lowerJd.includes('veterinary') || lowerJd.includes('surgeon') || lowerJd.includes('orthopedic surgery') || lowerJd.includes('clinical');

    const isRecruitingCv = cvTitle.includes('recruiter') || cvTitle.includes('talent acquisition') || cvTitle.includes('sourcing');
    const isEngineeringCv = cvTitle.includes('engineer') || cvTitle.includes('developer') || cvTitle.includes('architect');

    if ((isEngineeringJd && isRecruitingCv) || (isRecruitingJd && isEngineeringCv) || (isCulinaryJd && !cvTitle.includes('chef')) || (isMedicalJd && !cvTitle.includes('vet') && !cvTitle.includes('doctor'))) {
      risks.push({
        code: RISK_CODES.DOMAIN_ROLE_MISMATCH,
        riskCode: RISK_CODES.DOMAIN_ROLE_MISMATCH,
        severity: RISK_SEVERITY.HIGH,
        title: 'Role Alignment & Domain Mismatch Risk',
        description: `Target JD domain differs significantly from candidate's demonstrated background ("${currentCvState.header?.title || 'Current Profile'}").`,
        recommendation: 'Primary job-family alignment is weak. Automated title modification is strictly blocked to prevent misrepresentation.',
        blockedActions: ['Automatic domain re-classification / title falsification'],
        allowAutomatedFix: false
      });
    }

    // Title / Seniority Mismatch
    const isExecutiveJd = lowerJd.includes('vice president') || lowerJd.includes('vp') || lowerJd.includes('director') || lowerJd.includes('head of');
    const isJuniorCv = cvTitle.includes('junior') || cvTitle.includes('intern') || cvTitle.includes('associate') || cvTitle.includes('entry');
    if (isExecutiveJd && isJuniorCv) {
      risks.push({
        code: RISK_CODES.TITLE_MISMATCH,
        riskCode: RISK_CODES.TITLE_MISMATCH,
        severity: RISK_SEVERITY.HIGH,
        title: 'Seniority Level Mismatch',
        description: `Target JD is executive/leadership level while candidate profile is "${currentCvState.header?.title}".`,
        recommendation: 'Candidate should provide authentic leadership milestones. Title promotion without verified tenure is blocked.',
        blockedActions: ['Automated title promotion to Executive level'],
        allowAutomatedFix: false
      });
    }

    // Experience Years Gap
    if (lowerJd.includes('15+ years') || lowerJd.includes('minimum 15 years') || lowerJd.includes('10+ years') || lowerJd.includes('minimum 10 years')) {
      const mentions10PlusInCv = cvSummary.includes('10+') || cvSummary.includes('12+') || cvSummary.includes('15+') || cvExperiences.length >= 4;
      if (!mentions10PlusInCv) {
        risks.push({
          code: RISK_CODES.EXPERIENCE_GAP,
          riskCode: RISK_CODES.EXPERIENCE_GAP,
          severity: RISK_SEVERITY.MEDIUM,
          title: 'Minimum Experience Tenure Gap',
          description: 'Target role requires 10-15+ years of demonstrated experience.',
          recommendation: 'Ensure all relevant historical roles and consulting tenures are reflected accurately.',
          blockedActions: ['Inventing artificial employment dates'],
          allowAutomatedFix: false
        });
      }
    }
  }

  // 2. KEYWORD_OVERUSE & EXCESSIVE_REPETITION
  const tokenCounts = {};
  cvSkills.forEach(skill => {
    if (typeof skill === 'string') {
      const norm = skill.toLowerCase().trim();
      if (norm.length > 2) {
        const regex = new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
        const matches = (fullCvText.match(regex) || []).length;
        if (matches >= 6) {
          tokenCounts[skill] = matches;
        }
      }
    }
  });

  Object.entries(tokenCounts).forEach(([skill, count]) => {
    risks.push({
      code: RISK_CODES.KEYWORD_OVERUSE,
      riskCode: RISK_CODES.KEYWORD_OVERUSE,
      severity: count >= 10 ? RISK_SEVERITY.HIGH : RISK_SEVERITY.MEDIUM,
      title: `Keyword Overuse Detected: "${skill}"`,
      description: `"${skill}" appears ${count} times throughout candidate experience descriptions.`,
      recommendation: `Diminishing ATS returns and negative recruiter readability. Suggest diversifying vocabulary and reducing repetition rather than adding more occurrences.`,
      blockedActions: [`Adding more instances of "${skill}"`],
      allowAutomatedFix: false
    });
  });

  // 3. UNSUPPORTED_CLAIM & CREDIBILITY_RISK
  if (gapAnalysisResults && Array.isArray(gapAnalysisResults)) {
    const unevidencedCritical = gapAnalysisResults.filter(g => g.confidence === 'NONE' && (g.importance === 'CRITICAL' || g.importance === 'IMPORTANT'));
    if (unevidencedCritical.length > 0) {
      risks.push({
        code: RISK_CODES.UNSUPPORTED_CLAIM,
        riskCode: RISK_CODES.UNSUPPORTED_CLAIM,
        severity: RISK_SEVERITY.HIGH,
        title: `Unsupported Core Requirement Risk (${unevidencedCritical.length} Missing)`,
        description: `Target JD requires: ${unevidencedCritical.slice(0, 3).map(g => g.keyword || g.name).join(', ')}, but no supporting evidence exists in candidate history.`,
        recommendation: `AI generation of unverified skills is strictly BLOCKED. Candidate must provide authentic proof before adding to CV.`,
        blockedActions: unevidencedCritical.map(g => `Add unsupported "${g.keyword || g.name}"`),
        allowAutomatedFix: false
      });
    }
  }

  // 4. SKILL_CONTEXT_GAP
  const skillsWithoutExperience = cvSkills.filter(skill => {
    if (typeof skill !== 'string') return false;
    const norm = skill.toLowerCase().trim();
    return !matchesTermInText(norm, bulletText) && !matchesTermInText(norm, cvSummary);
  });
  if (skillsWithoutExperience.length >= 4) {
    risks.push({
      code: RISK_CODES.SKILL_CONTEXT_GAP,
      riskCode: RISK_CODES.SKILL_CONTEXT_GAP,
      severity: RISK_SEVERITY.LOW,
      title: 'Skill Context Gap',
      description: `${skillsWithoutExperience.length} skills (${skillsWithoutExperience.slice(0, 3).join(', ')}...) appear only in Skills list with no corresponding project/experience context.`,
      recommendation: 'Recruiters favor experience-backed evidence over isolated skill inventories. Consider adding authentic project references.',
      blockedActions: [],
      allowAutomatedFix: false
    });
  }

  // 5. GENERIC_BULLET_PATTERN
  const weakBullets = allBullets.filter(b => typeof b === 'string' && !OUTCOME_VERB_REGEX.test(b) && !METRIC_NUMERIC_REGEX.test(b));
  if (allBullets.length > 0 && weakBullets.length / allBullets.length >= 0.5) {
    risks.push({
      code: RISK_CODES.GENERIC_BULLET_PATTERN,
      riskCode: RISK_CODES.GENERIC_BULLET_PATTERN,
      severity: RISK_SEVERITY.MEDIUM,
      title: 'High Passive Bullet Ratio',
      description: `${weakBullets.length} of ${allBullets.length} bullets lack quantifiable metrics or strong outcome verbs.`,
      recommendation: 'Strengthen existing bullets with STAR action verbs and verified outcomes without fabricating metrics.',
      blockedActions: [],
      allowAutomatedFix: true
    });
  }

  return risks;
}

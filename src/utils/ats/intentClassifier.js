/**
 * P1.6 DETERMINISTIC REQUEST-INTENT CLASSIFIER
 * 
 * Classifies user instructions into distinct operational intents:
 * 1. FULL_JD_ALIGNMENT (Default when JD is present and user asks for full tailoring/optimization)
 * 2. TARGETED_SECTION_EDIT (Specific single section: summary, skills, education)
 * 3. BULLET_REFINEMENT (STAR active verbs and bullet improvements)
 * 4. KEYWORD_ALIGNMENT (ATS keyword optimization)
 * 5. GRAMMAR_REVIEW (Proofreading, tone, and grammar polish)
 * 6. TEMPLATE_PRESERVATION_EDIT (Content update with locked original template)
 */

export const USER_INTENTS = {
  FULL_JD_ALIGNMENT: 'FULL_JD_ALIGNMENT',
  TARGETED_SECTION_EDIT: 'TARGETED_SECTION_EDIT',
  BULLET_REFINEMENT: 'BULLET_REFINEMENT',
  KEYWORD_ALIGNMENT: 'KEYWORD_ALIGNMENT',
  GRAMMAR_REVIEW: 'GRAMMAR_REVIEW',
  TEMPLATE_PRESERVATION_EDIT: 'TEMPLATE_PRESERVATION_EDIT'
};

export function classifyUserIntent(promptText, hasJd = false) {
  const raw = (promptText || '').trim();
  const lower = raw.toLowerCase();

  // 1. Template Preservation Intent
  if (
    lower.includes('same template') ||
    lower.includes('same design') ||
    lower.includes('hubahu template') ||
    lower.includes('keep the original format') ||
    lower.includes('keep original format') ||
    lower.includes("don't change the template") ||
    lower.includes("dont change the template") ||
    lower.includes('edit in the same cv') ||
    lower.includes('preserve design') ||
    lower.includes('preserve template')
  ) {
    return {
      intent: USER_INTENTS.TEMPLATE_PRESERVATION_EDIT,
      scope: 'CONTENT_ONLY',
      presentation: 'LOCKED_TO_SOURCE_TEMPLATE',
      label: 'Template Preservation Edit',
      description: 'Preserves the authentic original CV design and visual layout while updating content.'
    };
  }

  // 2. Full CV JD Alignment Intent (English + Hindi / Hinglish)
  const fullCvPatterns = [
    /pura\s+cv.*(?:jd|hisab|according|optimize|banao|bana\s*do)/i,
    /tailor\s+(?:my\s+)?(?:entire|whole|complete|all)?\s*cv(?:\s+for\s+(?:this\s+)?(?:job|jd|role))?/i,
    /tailor\s+(?:my\s+)?(?:whole|complete)\s+(?:cv|resume)/i,
    /optimize\s+(?:my\s+)?(?:entire|whole|complete|all)?\s*(?:cv|resume)(?:\s+according\s+to\s+(?:this\s+)?(?:job|jd))?/i,
    /make\s+(?:my\s+)?(?:resume|cv|it)\s+according\s+to\s+(?:this\s+)?(?:job|jd)/i,
    /make\s+(?:my\s+)?(?:resume|cv|it)\s+ats\s+compliant/i,
    /make\s+(?:my\s+)?(?:resume|cv)\s+suitable\s+for\s+(?:this\s+)?(?:job|jd|role)/i,
    /use\s+this\s+jd\s+and\s+make\s+(?:my\s+)?cv/i,
    /update\s+(?:my\s+)?(?:complete\s+)?(?:cv|resume)\s+for\s+this\s+role/i,
    /update\s+the\s+complete\s+cv\s+according\s+to\s+this\s+jd/i,
    /change\s+(?:my\s+)?(?:whole|complete|entire)?\s*(?:cv|resume)\s+according\s+to\s+(?:the\s+)?jd/i,
    /align\s+(?:my\s+)?entire\s+cv/i,
    /full\s+cv\s+optimization/i,
    /full\s+cv\s+tailoring/i,
    /match\s+(?:my\s+)?entire\s+cv\s+to\s+this\s+jd/i,
    /optimize\s+for\s+this\s+jd/i
  ];

  if (fullCvPatterns.some(p => p.test(raw)) || (hasJd && (lower.includes('pura cv') || lower.includes('full cv') || lower.includes('entire cv') || lower.includes('all sections') || lower.includes('tailor') || lower.includes('according to this jd')))) {
    return {
      intent: USER_INTENTS.FULL_JD_ALIGNMENT,
      scope: 'ENTIRE_CV',
      target: 'CURRENT_JD',
      label: 'FULL CV TAILORING',
      description: 'Complete 100% document analysis and optimization tailored to target job requirements.'
    };
  }

  // 3. Grammar & Proofreading Intent
  if (
    lower.includes('fix grammar') ||
    lower.includes('grammar check') ||
    lower.includes('proofread') ||
    lower.includes('spelling') ||
    lower.includes('grammar only') ||
    lower.includes('correct grammar') ||
    lower.includes('grammar fix')
  ) {
    return {
      intent: USER_INTENTS.GRAMMAR_REVIEW,
      scope: 'ENTIRE_CV',
      target: 'GRAMMAR_ONLY',
      label: 'Grammar & Professional Polish',
      description: 'Refines language, active voice, and syntax while keeping all facts immutable.'
    };
  }

  // 4. Bullet Refinement Intent
  if (
    lower.includes('improve bullets') ||
    lower.includes('bullet points') ||
    lower.includes('star format') ||
    lower.includes('action verbs') ||
    lower.includes('experience bullets') ||
    lower.includes('rewrite bullets')
  ) {
    return {
      intent: USER_INTENTS.BULLET_REFINEMENT,
      scope: 'EXPERIENCE_BULLETS',
      target: 'ACTION_VERBS',
      label: 'STAR Bullet Refinement',
      description: 'Upgrades passive bullet phrasings with powerful action verbs and preserved metrics.'
    };
  }

  // 5. Keyword Alignment Intent
  if (
    lower.includes('optimize keywords') ||
    lower.includes('ats keywords') ||
    lower.includes('keyword alignment') ||
    lower.includes('keyword density')
  ) {
    return {
      intent: USER_INTENTS.KEYWORD_ALIGNMENT,
      scope: 'KEYWORDS_ONLY',
      target: 'ATS_SCANABILITY',
      label: 'ATS Keyword Alignment',
      description: 'Prioritizes verified target keywords for optimal ATS parser discovery.'
    };
  }

  // 6. Targeted Section Intent (Summary, Skills, Experience, Contact)
  if (
    lower.includes('only summary') ||
    lower.includes('summary only') ||
    lower.includes('improve summary') ||
    lower.includes('fix summary') ||
    lower.includes('skills section') ||
    lower.includes('only skills') ||
    lower.includes('contact info') ||
    lower.includes('headline only')
  ) {
    let targetSection = 'summary';
    if (lower.includes('skill')) targetSection = 'skills';
    else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email')) targetSection = 'contact';
    else if (lower.includes('headline') || lower.includes('title')) targetSection = 'headline';

    return {
      intent: USER_INTENTS.TARGETED_SECTION_EDIT,
      scope: 'SECTION_ONLY',
      target: targetSection,
      label: `Targeted ${targetSection.toUpperCase()} Edit`,
      description: `Modifies only the ${targetSection} section; all other sections remain locked.`
    };
  }

  // Default: If a JD is present, default to FULL_JD_ALIGNMENT
  if (hasJd) {
    return {
      intent: USER_INTENTS.FULL_JD_ALIGNMENT,
      scope: 'ENTIRE_CV',
      target: 'CURRENT_JD',
      label: 'Full CV JD Alignment',
      description: 'Complete 100% document analysis and optimization tailored to target job requirements.'
    };
  }

  // Standard generic update
  return {
    intent: USER_INTENTS.TARGETED_SECTION_EDIT,
    scope: 'EDIT_SECTION',
    target: 'GENERAL',
    label: 'Standard Change Request',
    description: 'Applies targeted natural-language instructions to matching CV sections.'
  };
}

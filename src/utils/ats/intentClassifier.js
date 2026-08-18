/**
 * MASTER DETERMINISTIC REQUEST-INTENT CLASSIFIER (Workflow A & Workflow B)
 * 
 * Accurately classifies user requests in English, Hindi, and Hinglish:
 * 
 * WORKFLOW A (CV Only + Instruction):
 * - CV_ATS_OPTIMIZATION: "Make my CV ATS friendly"
 * - CV_PROFESSIONAL_REWRITE: "Make it more professional", "Mera CV professional bana do"
 * - CV_GRAMMAR_CORRECTION: "Fix all grammar mistakes"
 * - TARGET_ROLE_OPTIMIZATION: "Rewrite my CV for Talent Acquisition Manager"
 * - FULL_CV_IMPROVEMENT: "Improve my CV", "Pura CV improve kar do", "Make the entire CV stronger"
 * - TARGETED_SECTION_EDIT: "Only improve summary", "Add AWS to skills"
 * 
 * WORKFLOW B (CV + JD + Instruction):
 * - FULL_CV_JD_TAILORING: "Make my complete CV according to this JD", "JD dekhte hue pura CV bana do"
 */

export const USER_INTENTS = {
  // Workflow B (CV + JD)
  FULL_CV_JD_TAILORING: 'FULL_CV_JD_TAILORING',
  FULL_JD_ALIGNMENT: 'FULL_CV_JD_TAILORING', // Alias for backwards compatibility

  // Workflow A (CV Only)
  FULL_CV_IMPROVEMENT: 'FULL_CV_IMPROVEMENT',
  CV_OPTIMIZATION: 'CV_OPTIMIZATION',
  CV_ATS_OPTIMIZATION: 'CV_ATS_OPTIMIZATION',
  CV_PROFESSIONAL_REWRITE: 'CV_PROFESSIONAL_REWRITE',
  CV_GRAMMAR_CORRECTION: 'CV_GRAMMAR_CORRECTION',
  TARGET_ROLE_OPTIMIZATION: 'TARGET_ROLE_OPTIMIZATION',

  // Targeted & Specialized
  TARGETED_SECTION_EDIT: 'TARGETED_SECTION_EDIT',
  BULLET_REFINEMENT: 'BULLET_REFINEMENT',
  KEYWORD_ALIGNMENT: 'KEYWORD_ALIGNMENT',
  GRAMMAR_REVIEW: 'CV_GRAMMAR_CORRECTION',
  TEMPLATE_PRESERVATION_EDIT: 'TEMPLATE_PRESERVATION_EDIT'
};

export function classifyUserIntent(promptText, hasJd = false) {
  const raw = (promptText || '').trim();
  const lower = raw.toLowerCase();

  // -------------------------------------------------------------
  // 1. TEMPLATE PRESERVATION INTENT
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 2. WORKFLOW B: FULL CV JD TAILORING (English, Hindi, Hinglish)
  // -------------------------------------------------------------
  const fullCvJdPatterns = [
    // Hinglish & Hindi
    /pura\s+cv.*(?:jd|job|hisab|according|optimize|banao|bana\s*do)/i,
    /jd\s+dekhte\s+hue.*(?:pura|complete|all)?\s*cv/i,
    /is\s+jd\s+ke\s+hisab\s+se/i,
    /jd\s+ke\s+hisab\s+se\s+cv/i,
    /sabhi\s+jaruri\s+changes\s+kar\s+do/i,
    /इस\s+जॉब\s+डिस्क्रिप्शन\s+के\s+हिसाब\s+से/i,
    /इस\s+जेडी\s+के\s+अनुसार/i,
    /पूरा\s+सीवी/i,

    // English
    /tailor\s+(?:my\s+)?(?:entire|whole|complete|all)?\s*cv(?:\s+(?:for|according\s+to)\s+(?:this\s+)?(?:job|jd|role))?/i,
    /tailor\s+(?:my\s+)?(?:whole|complete)\s+(?:cv|resume)/i,
    /optimize\s+(?:my\s+)?(?:entire|whole|complete|all)?\s*(?:cv|resume)(?:\s+according\s+to\s+(?:this\s+)?(?:job|jd))?/i,
    /make\s+(?:my\s+)?(?:resume|cv|it)\s+according\s+to\s+(?:this\s+)?(?:job|jd)/i,
    /make\s+(?:all\s+)?(?:necessary\s+)?(?:updates|changes)\s+(?:to\s+my\s+cv\s+)?according\s+to\s+(?:this\s+)?(?:job|jd)/i,
    /make\s+(?:my\s+)?(?:resume|cv)\s+suitable\s+for\s+(?:this\s+)?(?:job|jd|role)/i,
    /use\s+this\s+jd\s+and\s+make\s+(?:my\s+)?cv/i,
    /update\s+(?:my\s+)?(?:complete\s+)?(?:cv|resume)\s+for\s+this\s+role/i,
    /update\s+the\s+complete\s+cv\s+according\s+to\s+this\s+jd/i,
    /change\s+(?:my\s+)?(?:whole|complete|entire)?\s*(?:cv|resume)\s+according\s+to\s+(?:the\s+)?jd/i,
    /align\s+(?:my\s+)?entire\s+cv\s+to\s+(?:this\s+)?jd/i,
    /full\s+cv\s+jd\s+tailoring/i,
    /full\s+cv\s+tailoring/i,
    /match\s+(?:my\s+)?entire\s+cv\s+to\s+this\s+jd/i,
    /optimize\s+for\s+this\s+jd/i
  ];

  if (hasJd && (fullCvJdPatterns.some(p => p.test(raw)) || lower.includes('pura cv') || lower.includes('full cv') || lower.includes('entire cv') || lower.includes('all sections') || lower.includes('tailor') || lower.includes('according to this jd') || !raw)) {
    return {
      intent: USER_INTENTS.FULL_CV_JD_TAILORING,
      scope: 'ENTIRE_CV',
      target: 'CURRENT_JD',
      label: 'FULL CV JD TAILORING',
      description: 'Deep 100% document analysis and optimization tailored to target job requirements.'
    };
  }

  // -------------------------------------------------------------
  // 3. TARGETED SINGLE-SECTION INTENTS (Summary, Skills, Contact, Headline)
  // -------------------------------------------------------------
  const isTargetedSummary = (
    lower.includes('summary') || lower.includes('profile')
  ) && (
    lower.includes('only') || lower.includes('sirf') || lower.includes('improve') || 
    lower.includes('fix') || lower.includes('rewrite') || lower.includes('short') || 
    lower.includes('concise')
  ) && !lower.includes('entire cv') && !lower.includes('pura cv') && !lower.includes('full cv');

  const isTargetedSkills = (
    lower.includes('skill') || lower.includes('skills')
  ) && (
    lower.includes('only') || lower.includes('sirf') || lower.includes('section') || 
    lower.includes('add') || lower.includes('remove')
  ) && !lower.includes('entire cv') && !lower.includes('pura cv') && !lower.includes('full cv');

  const isTargetedContact = (
    lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('number')
  ) && !lower.includes('entire cv') && !lower.includes('pura cv') && !lower.includes('full cv');

  const isTargetedHeadline = (
    lower.includes('headline') || lower.includes('designation')
  ) && !lower.includes('entire cv') && !lower.includes('pura cv') && !lower.includes('full cv');

  if (isTargetedSummary || isTargetedSkills || isTargetedContact || isTargetedHeadline) {
    let targetSection = 'summary';
    if (isTargetedSkills) targetSection = 'skills';
    else if (isTargetedContact) targetSection = 'contact';
    else if (isTargetedHeadline) targetSection = 'headline';

    return {
      intent: USER_INTENTS.TARGETED_SECTION_EDIT,
      scope: 'SECTION_ONLY',
      target: targetSection,
      label: `Targeted ${targetSection.toUpperCase()} Edit`,
      description: `Modifies only the ${targetSection} section; all other sections remain locked.`
    };
  }

  // -------------------------------------------------------------
  // 4. TARGET ROLE OPTIMIZATION (e.g. "Rewrite my CV for Talent Acquisition Manager")
  // -------------------------------------------------------------
  const roleMatch = raw.match(/(?:for|as|into|role\s+of)\s+([a-zA-Z\s]{4,35}?)(?:\s+role|\s+position|\s+profile|$)/i);
  if ((lower.includes('rewrite for') || lower.includes('tailor for') || lower.includes('for role') || lower.includes('target role')) && roleMatch && roleMatch[1]) {
    const targetRole = roleMatch[1].trim();
    return {
      intent: USER_INTENTS.TARGET_ROLE_OPTIMIZATION,
      scope: 'ENTIRE_CV',
      targetRole: targetRole,
      label: `Target Role Optimization: ${targetRole}`,
      description: `Optimizes entire CV hierarchy and bullet emphasis for ${targetRole}.`
    };
  }

  // -------------------------------------------------------------
  // 5. WORKFLOW A: FULL CV IMPROVEMENT / OPTIMIZATION (No JD required)
  // -------------------------------------------------------------
  const fullCvGeneralPatterns = [
    /^(?:make|improve|optimize|upgrade)\s+(?:my\s+)?(?:entire|whole|complete|all\s+of\s+my\s+)?(?:cv|resume)/i,
    /^(?:pura|mera|poora)\s+cv\s+(?:improve|optimize|bana\s*do|sahi\s*kar\s*do)/i,
    /make\s+(?:my\s+)?cv\s+ats\s+friendly/i,
    /make\s+(?:my\s+)?cv\s+more\s+professional/i,
    /make\s+(?:my\s+)?cv\s+professional/i,
    /mera\s+cv\s+professional\s+bana\s*do/i,
    /make\s+(?:the\s+)?entire\s+cv\s+stronger/i,
    /make\s+(?:my\s+)?cv\s+recruiter\s+friendly/i,
    /optimize\s+(?:my\s+)?cv/i,
    /improve\s+(?:my\s+)?cv/i,
    /enhance\s+(?:my\s+)?cv/i,
    /professional\s+rewrite/i
  ];

  if (fullCvGeneralPatterns.some(p => p.test(raw)) || lower === 'improve my cv' || lower === 'optimize my cv' || lower === 'make my cv professional' || lower === 'make my cv ats friendly') {
    let specificLabel = 'Full CV Optimization';
    let intentType = USER_INTENTS.FULL_CV_IMPROVEMENT;

    if (lower.includes('ats')) {
      specificLabel = 'Full CV ATS Optimization';
      intentType = USER_INTENTS.CV_ATS_OPTIMIZATION;
    } else if (lower.includes('professional')) {
      specificLabel = 'Full CV Professional Rewrite';
      intentType = USER_INTENTS.CV_PROFESSIONAL_REWRITE;
    }

    return {
      intent: intentType,
      scope: 'ENTIRE_CV',
      target: 'GENERAL_BEST_PRACTICE',
      label: specificLabel,
      description: 'Comprehensive 100% document review: STAR active verbs, grammar polish, and ATS readability.'
    };
  }

  // -------------------------------------------------------------
  // 6. GRAMMAR & PROOFREADING INTENT
  // -------------------------------------------------------------
  if (
    lower.includes('fix grammar') ||
    lower.includes('grammar check') ||
    lower.includes('proofread') ||
    lower.includes('spelling') ||
    lower.includes('grammar only') ||
    lower.includes('correct grammar') ||
    lower.includes('grammar fix') ||
    lower.includes('fix all grammar')
  ) {
    return {
      intent: USER_INTENTS.CV_GRAMMAR_CORRECTION,
      scope: 'ENTIRE_CV',
      target: 'GRAMMAR_ONLY',
      label: 'Grammar & Professional Language Polish',
      description: 'Refines language, active voice, verb tenses, and punctuation across all sections.'
    };
  }

  // -------------------------------------------------------------
  // 7. BULLET REFINEMENT INTENT
  // -------------------------------------------------------------
  if (
    lower.includes('improve bullets') ||
    lower.includes('bullet points') ||
    lower.includes('star format') ||
    lower.includes('action verbs') ||
    lower.includes('experience bullets') ||
    lower.includes('rewrite bullets') ||
    lower.includes('improve my experience section')
  ) {
    return {
      intent: USER_INTENTS.BULLET_REFINEMENT,
      scope: 'EXPERIENCE_BULLETS',
      target: 'ACTION_VERBS',
      label: 'STAR Bullet Refinement',
      description: 'Upgrades passive bullet phrasings with powerful action verbs and preserved metrics.'
    };
  }

  // -------------------------------------------------------------
  // 8. KEYWORD ALIGNMENT INTENT
  // -------------------------------------------------------------
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

  // Default: If a JD is present, default to FULL_CV_JD_TAILORING
  if (hasJd) {
    return {
      intent: USER_INTENTS.FULL_CV_JD_TAILORING,
      scope: 'ENTIRE_CV',
      target: 'CURRENT_JD',
      label: 'FULL CV JD TAILORING',
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


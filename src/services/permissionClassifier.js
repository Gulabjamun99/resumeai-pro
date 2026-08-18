/**
 * Dynamic Change-Permission Classifier (Rule #6 & Multi-Turn Scope Engine)
 * Evaluates natural language user prompts and returns a deterministic PermissionScope object.
 */

export function classifyPermissionScope(promptText) {
  const text = (promptText || '').toLowerCase().trim();

  // 1. Ambiguous Request Detection (Rule #6) - Only genuinely underspecified 1-2 word prompts
  const ambiguousPatterns = [
    'thoda theek kar do', 'cv thoda change karo', 'kuch badlo', 'thoda improve'
  ];
  if (ambiguousPatterns.some(p => text === p || (text.startsWith(p) && text.length < 25))) {
    return {
      scope: 'AMBIGUOUS',
      label: 'Ambiguous Instruction',
      description: 'The request is ambiguous. Execution paused until user selects explicit modification scope.',
      requires_clarification: true,
      allowed_actions: [],
      locked_sections: ['ALL'],
      allow_rephrasing: false,
      allow_fabrication: false
    };
  }

  // 2. Full CV Overhaul & Optimization (Workflow A & Workflow B)
  if (
    text.includes('poora cv') || text.includes('pura cv') || text.includes('complete cv') || 
    text.includes('entire cv') || text.includes('whole cv') || text.includes('all sections') ||
    text.includes('ats friendly') || text.includes('professional') || text.includes('improve my cv') ||
    text.includes('optimize my cv') || text.includes('make my cv') || text.includes('tailor my cv') ||
    text.includes('is jd ke hisab') || text.includes('jd dekhte hue') || text.includes('grammar')
  ) {
    return {
      scope: 'REWRITE_FULL',
      label: 'Full CV ATS Overhaul',
      description: 'Stylistic rephrasing across all sections authorized. Factual integrity, employment dates, company names, and contact details remain 100% IMMUTABLE.',
      requires_clarification: false,
      allowed_actions: ['REWRITE_ALL_SECTIONS'],
      target_sections: ['summary', 'experience', 'skills', 'education', 'headline'],
      locked_sections: ['contact', 'employment_dates', 'company_names', 'institutions'],
      allow_rephrasing: true,
      allow_fabrication: false
    };
  }

  // 3. Formatting Only
  if (text.includes('formatting only') || text.includes('sirf formatting') || text.includes('content same') || text.includes('layout only')) {
    return {
      scope: 'FORMATTING_ONLY',
      label: 'Formatting & Layout Only',
      description: 'Visual layout micro-adjustments only. 100% of text and factual content locked.',
      requires_clarification: false,
      allowed_actions: ['FORMAT_LAYOUT'],
      locked_sections: ['summary', 'experience', 'education', 'certifications', 'skills', 'contact'],
      allow_rephrasing: false,
      allow_fabrication: false
    };
  }

  // 3. Edit Section: Headline / Title
  if (text.includes('headline') || text.includes('designation') || (text.includes('title') && !text.includes('job'))) {
    return {
      scope: 'EDIT_SECTION',
      label: 'Edit Professional Headline',
      description: 'Updates professional headline/title. All other sections and factual history remain locked.',
      requires_clarification: false,
      allowed_actions: ['REPLACE_HEADLINE'],
      target_sections: ['headline'],
      locked_sections: ['experience', 'education', 'certifications', 'skills', 'contact'],
      allow_rephrasing: false,
      allow_fabrication: false
    };
  }

  // 4. Edit Section: Phone / Contact
  if (text.includes('phone') || text.includes('mobile') || text.includes('number') || text.includes('email') || text.includes('contact')) {
    return {
      scope: 'EDIT_SECTION',
      label: 'Update Contact Details',
      description: 'User-authorized contact information update. Work history and credentials remain locked.',
      requires_clarification: false,
      allowed_actions: ['UPDATE_CONTACT'],
      target_sections: ['contact'],
      locked_sections: ['experience', 'education', 'certifications', 'skills'],
      allow_rephrasing: false,
      allow_fabrication: false
    };
  }

  // 5. Edit Section: Summary
  if ((text.includes('summary') || text.includes('profile')) && (text.includes('improve') || text.includes('edit') || text.includes('short') || text.includes('concise') || text.includes('sirf') || text.includes('rewrite'))) {
    return {
      scope: 'EDIT_SECTION',
      label: 'Edit Professional Summary',
      description: 'Modifies professional summary statement. Experience, Education, Skills, and Contact remain LOCKED.',
      requires_clarification: false,
      allowed_actions: ['EDIT_SUMMARY'],
      target_sections: ['summary'],
      locked_sections: ['experience', 'education', 'certifications', 'skills', 'contact'],
      allow_rephrasing: true,
      allow_fabrication: false
    };
  }

  // 6. Edit Section: Skills
  if (text.includes('skill') || text.includes('aws') || text.includes('java') || text.includes('python')) {
    return {
      scope: 'EDIT_SECTION',
      label: 'Modify Technical Skills',
      description: 'Adds, removes, or updates specific technical skills. Experience, Education, and Contact remain LOCKED.',
      requires_clarification: false,
      allowed_actions: ['MODIFY_SKILLS'],
      target_sections: ['skills'],
      locked_sections: ['experience', 'education', 'certifications', 'summary', 'contact'],
      allow_rephrasing: false,
      allow_fabrication: false
    };
  }

  // 7. Rewrite Full CV
  if (text.includes('poora cv') || text.includes('complete cv') || text.includes('rewrite entire cv') || text.includes('full cv')) {
    return {
      scope: 'REWRITE_FULL',
      label: 'Full CV ATS Overhaul',
      description: 'Stylistic rephrasing across all sections authorized. Factual integrity, employment dates, company names, and contact details remain 100% IMMUTABLE.',
      requires_clarification: false,
      allowed_actions: ['REWRITE_ALL_SECTIONS'],
      target_sections: ['summary', 'experience', 'skills', 'education'],
      locked_sections: ['contact', 'employment_dates', 'company_names', 'institutions'],
      allow_rephrasing: true,
      allow_fabrication: false
    };
  }

  // 8. Default: Add New Experience Only
  return {
    scope: 'ADD_ONLY',
    label: 'Add Career Experience',
    description: 'Appends new career experience chronologically. 100% of existing bullets, summary, education, skills, and contact remain LOCKED.',
    requires_clarification: false,
    allowed_actions: ['ADD_EXPERIENCE'],
    target_sections: ['experience'],
    locked_sections: ['existing_experience_bullets', 'summary', 'education', 'certifications', 'skills', 'contact'],
    allow_rephrasing: false,
    allow_fabrication: false
  };
}

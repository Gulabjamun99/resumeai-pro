/**
 * Dynamic Change-Permission Classifier
 * Evaluates natural language user prompts and returns a deterministic PermissionScope object.
 */

export function classifyPermissionScope(promptText) {
  const text = (promptText || '').toLowerCase().trim();

  // Test E: Ambiguous Request Detection
  const ambiguousPatterns = [
    'cv thoda improve kar do', 'make my cv better', 'improve my cv', 
    'make it nice', 'update cv', 'make it better', 'cv achha kar do'
  ];
  if (ambiguousPatterns.some(p => text === p || text.startsWith(p))) {
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

  // Test C: Formatting Only
  if (text.includes('formatting only') || text.includes('sirf formatting') || text.includes('content same')) {
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

  // Test A: Edit Specific Section (Summary)
  if (text.includes('summary') && (text.includes('improve') || text.includes('edit') || text.includes('sirf'))) {
    return {
      scope: 'EDIT_SECTION',
      label: 'Edit Summary Only',
      description: 'Modifies professional summary only. Experience, Education, Skills, and Contact remain 100% LOCKED.',
      requires_clarification: false,
      allowed_actions: ['EDIT_SUMMARY'],
      target_sections: ['summary'],
      locked_sections: ['experience', 'education', 'certifications', 'skills', 'contact'],
      allow_rephrasing: true,
      allow_fabrication: false
    };
  }

  // Test B: Rewrite Experience Section for ATS
  if (text.includes('experience') && (text.includes('rewrite') || text.includes('ats ke liye') || text.includes('ats'))) {
    return {
      scope: 'REWRITE_SECTION',
      label: 'Rewrite Experience Section for ATS',
      description: 'Rephrases work experience bullets for ATS keyword density. Summary, Education, Certifications, and Contact remain 100% LOCKED.',
      requires_clarification: false,
      allowed_actions: ['REWRITE_EXPERIENCE'],
      target_sections: ['experience'],
      locked_sections: ['summary', 'education', 'certifications', 'skills', 'contact'],
      allow_rephrasing: true,
      allow_fabrication: false
    };
  }

  // Test D: Rewrite Full CV for ATS
  if (text.includes('poora cv') || text.includes('complete cv') || text.includes('rewrite entire cv')) {
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

  // Default / Standard Add Only Scope (ISSUE 2 FIX: Target ONLY experience section)
  return {
    scope: 'ADD_ONLY',
    label: 'Add New Experience Only',
    description: 'Appends new career experience chronologically. 100% of existing bullets, summary, education, skills, and contact remain LOCKED.',
    requires_clarification: false,
    allowed_actions: ['ADD_EXPERIENCE'],
    target_sections: ['experience'],
    locked_sections: ['existing_experience_bullets', 'summary', 'education', 'certifications', 'skills', 'contact'],
    allow_rephrasing: false,
    allow_fabrication: false
  };
}

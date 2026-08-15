/**
 * LockEnforcer Middleware (Security Rule #9)
 * Guarantees that locked content elements from SOURCE_CV_MASTER bypass LLM output processing
 * and are re-injected verbatim into the target document layout prior to compilation.
 */

export function enforceContentLocks(sourceMaster, generatedCandidate, permissionScope) {
  // Deep clone candidate output
  const output = JSON.parse(JSON.stringify(generatedCandidate));

  // If ADD_ONLY scope: 100% of existing bullets & metadata are locked and re-injected
  if (permissionScope.scope === 'ADD_ONLY') {
    // Restore exact contact info
    output.contact = { ...sourceMaster.contact };

    // Restore exact summary
    output.header.summary = sourceMaster.header.summary;

    // Restore exact education & certifications
    output.education = [...sourceMaster.education];
    output.certifications = [...sourceMaster.certifications];

    // Ensure all original experience bullets are present line-by-line
    sourceMaster.experiences.forEach(sourceExp => {
      const targetExp = output.experiences.find(e => e.id === sourceExp.id);
      if (targetExp) {
        // Enforce exact company, dates, and original bullets
        targetExp.company = sourceExp.company;
        targetExp.period = sourceExp.period;
        targetExp.location = sourceExp.location;

        sourceExp.bullets.forEach((sourceBullet, idx) => {
          if (!targetExp.bullets.includes(sourceBullet)) {
            // Re-inject missing source bullet at exact index
            targetExp.bullets.splice(idx, 0, sourceBullet);
          }
        });
      }
    });
  }

  // If EDIT_SECTION (Summary only): Restore all non-summary sections
  if (permissionScope.scope === 'EDIT_SECTION') {
    output.contact = { ...sourceMaster.contact };
    output.experiences = JSON.parse(JSON.stringify(sourceMaster.experiences));
    output.education = [...sourceMaster.education];
    output.certifications = [...sourceMaster.certifications];
    output.skills = [...sourceMaster.skills];
  }

  // If FORMATTING_ONLY: Restore 100% text content verbatim
  if (permissionScope.scope === 'FORMATTING_ONLY') {
    return JSON.parse(JSON.stringify(sourceMaster));
  }

  // Universal Immutable Fields Lock (Contact details & dates are ALWAYS locked)
  output.contact = { ...sourceMaster.contact };

  return output;
}

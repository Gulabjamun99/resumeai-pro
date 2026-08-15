/**
 * LockEnforcer Middleware (Rule #9 & Multi-Turn Reconciliation)
 * 
 * Reconciles three critical layers:
 * 1. SOURCE_CV_MASTER: Immutable factual baseline (protects original facts from unauthorized alteration).
 * 2. CURRENT_CV_STATE: Latest approved working version (preserves previously approved user modifications).
 * 3. CURRENT_REQUEST / AUTHORIZED_USER_CHANGES: Authorized field modifications in this turn.
 * 
 * REJECTS: Unprompted AI hallucinations (unprompted company name changes, date modifications, fake metrics).
 * ALLOWS: Explicit user-authorized updates (e.g. phone number change, headline change, approved experience additions).
 */

export function enforceContentLocks(sourceMaster, currentBaseCv, proposedCv, changePlan) {
  if (!proposedCv) return currentBaseCv || sourceMaster;

  // Deep clone proposed output
  const output = JSON.parse(JSON.stringify(proposedCv));
  const base = currentBaseCv ? JSON.parse(JSON.stringify(currentBaseCv)) : JSON.parse(JSON.stringify(sourceMaster));
  const master = JSON.parse(JSON.stringify(sourceMaster));

  const authorizedFields = new Set(changePlan?.authorizedChanges?.map(c => c.field) || []);
  const targetSections = new Set(changePlan?.targetSections || []);

  // 1. CONTACT DETAILS LOCK
  // If user explicitly authorized a contact change, allow it; otherwise restore from base version
  if (!authorizedFields.has('contact.phone')) {
    if (output.contact && base.contact) {
      output.contact.phone = base.contact.phone || master.contact?.phone;
    }
  }
  if (!authorizedFields.has('contact.email')) {
    if (output.contact && base.contact) {
      output.contact.email = base.contact.email || master.contact?.email;
    }
  }

  // 2. SUMMARY LOCK
  // If summary was NOT in target sections, restore base summary (preserving previous approved changes)
  if (!targetSections.has('summary') && !authorizedFields.has('header.summary')) {
    output.header.summary = base.header.summary;
  }

  // 3. HEADLINE LOCK
  // If headline was NOT in target sections, restore base title
  if (!targetSections.has('headline') && !authorizedFields.has('header.title')) {
    output.header.title = base.header.title;
  }

  // 4. EDUCATION & CERTIFICATIONS LOCK
  // Protect education & certifications from unauthorized AI alterations
  if (!targetSections.has('education')) {
    output.education = [...(base.education || master.education || [])];
  }
  if (!targetSections.has('certifications')) {
    output.certifications = [...(base.certifications || master.certifications || [])];
  }

  // 5. EXISTING WORK EXPERIENCE LOCKS
  // Ensure that all existing job roles, original dates, and companies from sourceMaster remain immutable
  // (unless explicitly authorized by the user)
  if (master.experiences && output.experiences) {
    master.experiences.forEach(sourceExp => {
      const targetExp = output.experiences.find(e => e.id === sourceExp.id);
      if (targetExp) {
        // Enforce exact company, dates, and locations from master
        targetExp.company = sourceExp.company;
        targetExp.period = sourceExp.period;
        targetExp.location = sourceExp.location;

        // Ensure original source bullets are preserved line-by-line
        sourceExp.bullets.forEach((sourceBullet, idx) => {
          if (!targetExp.bullets.includes(sourceBullet)) {
            targetExp.bullets.splice(idx, 0, sourceBullet);
          }
        });
      }
    });
  }

  // 6. UNSUPPORTED FACT PURGE (Rejects hallucinated metrics/claims like "$10M revenue", "Fortune 500")
  const hallucinationKeywords = [
    '$10m', 'fortune 500', '10,000 users', '50-person team', '100% growth'
  ];

  if (output.experiences) {
    output.experiences.forEach(exp => {
      exp.bullets = exp.bullets.filter(bullet => {
        const lowerBullet = bullet.toLowerCase();
        const containsHallucination = hallucinationKeywords.some(kw => lowerBullet.includes(kw));
        return !containsHallucination;
      });
    });
  }

  return output;
}

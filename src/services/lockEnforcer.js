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

  // 0. CANDIDATE NAME LOCK
  // Allow user explicit name updates; otherwise preserve from base
  if (!authorizedFields.has('header.name')) {
    if (output.header && base.header) {
      output.header.name = base.header.name || master.header?.name;
    }
  }

  // 1. CONTACT DETAILS & LOCATION LOCK
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
  if (!authorizedFields.has('contact.location') && !authorizedFields.has('contact.address')) {
    if (output.contact && base.contact) {
      output.contact.location = base.contact.location || master.contact?.location;
      output.contact.address = base.contact.address || master.contact?.address;
    }
  }
  if (!authorizedFields.has('contact.linkedin')) {
    if (output.contact && base.contact) {
      output.contact.linkedin = base.contact.linkedin || master.contact?.linkedin;
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
  // Protect education & certifications from unauthorized AI alterations unless targeted
  if (!targetSections.has('education') && !authorizedFields.has('education')) {
    output.education = [...(base.education || master.education || [])];
  }
  if (!targetSections.has('certifications') && !authorizedFields.has('certifications')) {
    output.certifications = [...(base.certifications || master.certifications || [])];
  }

  // 4.1 SKILLS LOCK
  // Protect skills unless targeted or explicitly authorized
  if (!targetSections.has('skills') && !authorizedFields.has('skills')) {
    output.skills = [...(base.skills || master.skills || [])];
    if (base.itSkills) output.itSkills = [...(base.itSkills || master.itSkills || [])];
  }

  // 5. EXISTING WORK EXPERIENCE LOCKS
  // Ensure that all existing job roles, original dates, and companies from sourceMaster remain immutable
  // (unless explicitly authorized by the user or deleted)
  const deletedCompanies = (changePlan?.authorizedChanges || [])
    .filter(c => c.field === 'experiences.deleted')
    .map(c => (c.value || '').toLowerCase());

  if (Array.isArray(master.experiences) && Array.isArray(output.experiences)) {
    master.experiences.forEach((sourceExp, expIdx) => {
      const sourceCompLower = (sourceExp.company || '').toLowerCase();
      // Skip if this company was explicitly deleted by the user
      if (deletedCompanies.some(d => sourceCompLower.includes(d) || d.includes(sourceCompLower))) {
        return;
      }

      const targetExp = output.experiences.find(e => 
        (sourceExp.id && e.id === sourceExp.id) || 
        (e.role === sourceExp.role && e.company === sourceExp.company) ||
        (sourceExp.company && e.company === sourceExp.company)
      ) || (output.experiences.length === master.experiences.length ? output.experiences[expIdx] : null);
      if (targetExp) {
        // Enforce exact company, dates, and locations from master unless authorized
        if (!authorizedFields.has(`experiences[${expIdx}].company`)) {
          targetExp.company = sourceExp.company;
        }
        if (!authorizedFields.has(`experiences[${expIdx}].period`)) {
          targetExp.period = sourceExp.period;
        }
        if (!authorizedFields.has(`experiences[${expIdx}].location`)) {
          targetExp.location = sourceExp.location;
        }

        // Ensure original source bullets are preserved line-by-line (unless authorized for replacement)
        if (Array.isArray(sourceExp.bullets)) {
          sourceExp.bullets.forEach((sourceBullet, idx) => {
            const isAuthorizedReplacement = Array.from(authorizedFields).some(field => 
              field.startsWith('experiences[') && field.endsWith(`.bullets[${idx}]`)
            );
            if (Array.isArray(targetExp.bullets) && !targetExp.bullets.includes(sourceBullet) && !isAuthorizedReplacement) {
              targetExp.bullets.splice(idx, 0, sourceBullet);
            }
          });
        }
      }
    });
  }

  // 5.1 PROJECTS DELETION ENFORCEMENT
  const deletedProjects = (changePlan?.authorizedChanges || [])
    .filter(c => c.field === 'projects.deleted')
    .map(c => (c.value || '').toLowerCase());

  if (deletedProjects.length > 0 && Array.isArray(output.projects)) {
    output.projects = output.projects.filter(p => {
      const titleLower = (p.title || p.name || '').toLowerCase();
      return !deletedProjects.some(d => titleLower.includes(d) || d.includes(titleLower));
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

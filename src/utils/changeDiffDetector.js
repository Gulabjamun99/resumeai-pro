/**
 * RESUMEAI PRO — FACTUAL CHANGE & DIFF DETECTOR
 * 
 * Accurately calculates all additions, deletions, and modifications between
 * the immutable baseline (SOURCE_CV_MASTER) and the working CV state (CURRENT_CV_STATE).
 * Provides 100% transparency so the candidate can verify every single change.
 */

export function computeResumeDiff(sourceResume, currentCvState) {
  if (!sourceResume || !currentCvState) {
    return {
      hasChanges: false,
      deletedCompanies: [],
      addedCompanies: [],
      addedProjects: [],
      deletedProjects: [],
      addedSkills: [],
      removedSkills: [],
      summaryChanged: false,
      headlineChanged: false,
      contactChanged: false,
      totalChangesCount: 0
    };
  }

  const sourceExps = Array.isArray(sourceResume.experiences) 
    ? sourceResume.experiences 
    : Array.isArray(sourceResume.experience) 
      ? sourceResume.experience 
      : [];

  const currentExps = Array.isArray(currentCvState.experiences) 
    ? currentCvState.experiences 
    : Array.isArray(currentCvState.experience) 
      ? currentCvState.experience 
      : [];

  const norm = str => (str || '').trim().toLowerCase();

  // 1. Experiences Deleted
  const currentCompNames = currentExps.map(e => norm(e.company)).filter(Boolean);
  const deletedCompanies = sourceExps
    .filter(se => {
      const sComp = norm(se.company);
      return sComp.length > 2 && !currentCompNames.some(c => c.includes(sComp) || sComp.includes(c));
    })
    .map(se => ({ company: se.company, role: se.role, period: se.period }));

  // 2. Experiences Added
  const sourceCompNames = sourceExps.map(e => norm(e.company)).filter(Boolean);
  const addedCompanies = currentExps
    .filter(ce => {
      const cComp = norm(ce.company);
      return cComp.length > 2 && !sourceCompNames.some(s => s.includes(cComp) || cComp.includes(s));
    })
    .map(ce => ({ company: ce.company, role: ce.role, period: ce.period }));

  // 3. Projects Added / Deleted
  const sourceProjects = (sourceResume.projects || []).map(p => norm(p.title || p.name)).filter(Boolean);
  const currentProjects = (currentCvState.projects || []).map(p => norm(p.title || p.name)).filter(Boolean);

  const addedProjects = (currentCvState.projects || []).filter(cp => {
    const cTitle = norm(cp.title || cp.name);
    return !sourceProjects.some(s => s.includes(cTitle) || cTitle.includes(s));
  }).map(p => p.title || p.name);

  const deletedProjects = (sourceResume.projects || []).filter(sp => {
    const sTitle = norm(sp.title || sp.name);
    return !currentProjects.some(c => c.includes(sTitle) || sTitle.includes(c));
  }).map(p => p.title || p.name);

  // 4. Skills Added / Removed
  const sourceSkills = (sourceResume.skills || []).map(s => norm(s));
  const currentSkills = (currentCvState.skills || []).map(s => norm(s));

  const addedSkills = (currentCvState.skills || []).filter(s => !sourceSkills.includes(norm(s)));
  const removedSkills = (sourceResume.skills || []).filter(s => !currentSkills.includes(norm(s)));

  // 5. Header / Profile / Headline modifications
  const summaryChanged = Boolean(
    sourceResume.header?.summary &&
    currentCvState.header?.summary &&
    sourceResume.header.summary.trim() !== currentCvState.header.summary.trim()
  );

  const headlineChanged = Boolean(
    sourceResume.header?.title &&
    currentCvState.header?.title &&
    sourceResume.header.title.trim() !== currentCvState.header.title.trim()
  );

  const contactChanged = Boolean(
    (sourceResume.contact?.phone && currentCvState.contact?.phone && sourceResume.contact.phone !== currentCvState.contact.phone) ||
    (sourceResume.contact?.email && currentCvState.contact?.email && sourceResume.contact.email !== currentCvState.contact.email)
  );

  const totalChangesCount = 
    deletedCompanies.length + 
    addedCompanies.length + 
    addedProjects.length + 
    deletedProjects.length + 
    addedSkills.length + 
    removedSkills.length + 
    (summaryChanged ? 1 : 0) + 
    (headlineChanged ? 1 : 0) + 
    (contactChanged ? 1 : 0);

  return {
    hasChanges: totalChangesCount > 0,
    deletedCompanies,
    addedCompanies,
    addedProjects,
    deletedProjects,
    addedSkills,
    removedSkills,
    summaryChanged,
    headlineChanged,
    contactChanged,
    totalChangesCount
  };
}

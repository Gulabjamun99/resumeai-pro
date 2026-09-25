/**
 * RESUMEAI PRO — FACTUAL CHANGE & DIFF DETECTOR
 * 
 * Accurately calculates all additions, deletions, and modifications between
 * the baseline (SOURCE_CV_MASTER / previous version) and the working CV state (CURRENT_CV_STATE).
 * Provides 100% transparency so the candidate can inspect every single change (Before vs After).
 */

export function computeResumeDiff(sourceResume, currentCvState) {
  if (!sourceResume || !currentCvState) {
    return {
      hasChanges: false,
      deletedCompanies: [],
      addedCompanies: [],
      modifiedCompanies: [],
      addedProjects: [],
      deletedProjects: [],
      addedSkills: [],
      removedSkills: [],
      addedEducation: [],
      summaryChanged: false,
      summaryBefore: '',
      summaryAfter: '',
      headlineChanged: false,
      headlineBefore: '',
      headlineAfter: '',
      contactChanged: false,
      contactDiff: {},
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
    .map(ce => ({ 
      company: ce.company, 
      role: ce.role, 
      period: ce.period,
      location: ce.location,
      bulletsCount: ce.bullets?.length || 0,
      bullets: ce.bullets || []
    }));

  // 3. Experiences Modified (Existing in both, but details changed)
  const modifiedCompanies = [];
  currentExps.forEach(ce => {
    const cComp = norm(ce.company);
    if (cComp.length <= 2) return;
    const match = sourceExps.find(se => {
      const sComp = norm(se.company);
      return sComp.length > 2 && (sComp.includes(cComp) || cComp.includes(sComp));
    });

    if (match) {
      const roleChanged = norm(match.role) !== norm(ce.role);
      const periodChanged = norm(match.period) !== norm(ce.period);
      const sourceBullets = match.bullets || [];
      const currentBullets = ce.bullets || [];
      const bulletsCountDiff = currentBullets.length - sourceBullets.length;
      const bulletsModified = JSON.stringify(sourceBullets) !== JSON.stringify(currentBullets);

      if (roleChanged || periodChanged || bulletsModified) {
        const changes = [];
        if (roleChanged) changes.push(`Role changed from "${match.role}" to "${ce.role}"`);
        if (periodChanged) changes.push(`Duration updated from "${match.period}" to "${ce.period}"`);
        if (bulletsCountDiff > 0) changes.push(`${bulletsCountDiff} new bullet point(s) added`);
        else if (bulletsModified) changes.push('Responsibilities / bullet points updated');

        modifiedCompanies.push({
          company: ce.company,
          roleBefore: match.role,
          roleAfter: ce.role,
          periodBefore: match.period,
          periodAfter: ce.period,
          bulletsCountBefore: sourceBullets.length,
          bulletsCountAfter: currentBullets.length,
          newBullets: currentBullets.filter(cb => !sourceBullets.some(sb => norm(sb) === norm(cb))),
          changesSummary: changes.join('; ')
        });
      }
    }
  });

  // 4. Projects Added / Deleted
  const sourceProjects = (sourceResume.projects || []).map(p => norm(p.title || p.name)).filter(Boolean);
  const currentProjects = (currentCvState.projects || []).map(p => norm(p.title || p.name)).filter(Boolean);

  const addedProjects = (currentCvState.projects || []).filter(cp => {
    const cTitle = norm(cp.title || cp.name);
    return !sourceProjects.some(s => s.includes(cTitle) || cTitle.includes(s));
  }).map(p => ({
    title: p.title || p.name,
    techStack: p.techStack || '',
    bullets: p.bullets || []
  }));

  const deletedProjects = (sourceResume.projects || []).filter(sp => {
    const sTitle = norm(sp.title || sp.name);
    return !currentProjects.some(c => c.includes(sTitle) || sTitle.includes(c));
  }).map(p => p.title || p.name);

  // 5. Skills Added / Removed
  const sourceSkills = (sourceResume.skills || []).map(s => norm(s));
  const currentSkills = (currentCvState.skills || []).map(s => norm(s));

  const addedSkills = (currentCvState.skills || []).filter(s => !sourceSkills.includes(norm(s)));
  const removedSkills = (sourceResume.skills || []).filter(s => !currentSkills.includes(norm(s)));

  // 6. Header / Profile / Headline modifications
  const summaryBefore = (sourceResume.header?.summary || sourceResume.summary || '').trim();
  const summaryAfter = (currentCvState.header?.summary || currentCvState.summary || '').trim();
  const summaryChanged = Boolean(summaryBefore && summaryAfter && summaryBefore !== summaryAfter);

  const headlineBefore = (sourceResume.header?.title || '').trim();
  const headlineAfter = (currentCvState.header?.title || '').trim();
  const headlineChanged = Boolean(headlineBefore && headlineAfter && headlineBefore !== headlineAfter);

  // 7. Contact Info Modifications
  const contactDiff = {};
  let contactChanged = false;
  const sPhone = sourceResume.contact?.phone || '';
  const cPhone = currentCvState.contact?.phone || '';
  if (sPhone && cPhone && sPhone !== cPhone) {
    contactDiff.phone = { before: sPhone, after: cPhone };
    contactChanged = true;
  }

  const sEmail = sourceResume.contact?.email || '';
  const cEmail = currentCvState.contact?.email || '';
  if (sEmail && cEmail && sEmail !== cEmail) {
    contactDiff.email = { before: sEmail, after: cEmail };
    contactChanged = true;
  }

  const sLoc = sourceResume.contact?.location || '';
  const cLoc = currentCvState.contact?.location || '';
  if (sLoc && cLoc && sLoc !== cLoc) {
    contactDiff.location = { before: sLoc, after: cLoc };
    contactChanged = true;
  }

  // 8. Education Additions
  const sEdu = (sourceResume.education || []).map(e => typeof e === 'string' ? e : e.degree || '');
  const cEdu = (currentCvState.education || []).map(e => typeof e === 'string' ? e : e.degree || '');
  const addedEducation = cEdu.filter(e => !sEdu.some(se => norm(se) === norm(e)));

  const totalChangesCount = 
    deletedCompanies.length + 
    addedCompanies.length + 
    modifiedCompanies.length +
    addedProjects.length + 
    deletedProjects.length + 
    addedSkills.length + 
    removedSkills.length + 
    addedEducation.length +
    (summaryChanged ? 1 : 0) + 
    (headlineChanged ? 1 : 0) + 
    (contactChanged ? 1 : 0);

  return {
    hasChanges: totalChangesCount > 0,
    deletedCompanies,
    addedCompanies,
    modifiedCompanies,
    addedProjects,
    deletedProjects,
    addedSkills,
    removedSkills,
    addedEducation,
    summaryChanged,
    summaryBefore,
    summaryAfter,
    headlineChanged,
    headlineBefore,
    headlineAfter,
    contactChanged,
    contactDiff,
    totalChangesCount
  };
}

/**
 * Checks if the user's message is an inquiry asking what changes were made.
 */
export function isDiffInquiry(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase().trim();
  const patterns = [
    /kya\s*(?:kya)?\s*(?:kha\s*kha|kahan\s*kahan)?\s*change/i,
    /kya\s*(?:kya)?\s*badla/i,
    /kahan\s*kahan\s*change/i,
    /kha\s*kha\s*change/i,
    /kya\s*(?:kya)?\s*update/i,
    /what\s*(?:did\s*you\s*)?change/i,
    /what\s*(?:has\s*)?changed/i,
    /where\s*did\s*you\s*change/i,
    /what\s*are\s*the\s*changes/i,
    /show\s*(?:me\s*)?(?:the\s*)?diff/i,
    /show\s*(?:me\s*)?(?:the\s*)?changes/i,
    /\bdiff\b/i,
    /explain\s*(?:the\s*)?changes/i,
    /batao\s*kya/i,
    /list\s*(?:all\s*)?changes/i,
    /pehle\s*kya\s*tha/i,
    /kya\s*badlav/i,
    /changes\s*bata/i
  ];
  return patterns.some(p => p.test(t));
}

/**
 * Checks if the input is a Job Description tailoring request.
 */
export function isJdOptimizationRequest(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();
  if (lower.includes('job description') || lower.includes('ye jd hai') || lower.includes('this jd') || lower.includes('jd ke hisab')) {
    return true;
  }
  // Check if it contains structured JD markers and is reasonably detailed
  if (lower.length > 120 && (lower.includes('responsibilities:') || lower.includes('requirements:') || lower.includes('qualifications:') || lower.includes('skills required:'))) {
    return true;
  }
  return false;
}

/**
 * Formats a comprehensive Before vs After explanation for the user in conversational Hinglish/English.
 */
export function formatDiffAsExplanation(diffReport, currentVersion = 2) {
  if (!diffReport || !diffReport.hasChanges) {
    return `Abhi tak CV me koi changes nahi hue hain (Original Version 1 active hai).\n\nAap chat me koi bhi instruction de sakte hain, jaise:\n• "Summary ko Marketing / Store Sales role ke mutabiq optimize karo"\n• "Wipro me 2 saal ka experience add karo with sales metrics"\n• "Skills me Python, SQL aur Power BI jod do"\n• Ya seedha target Job Description (JD) paste kar dijiye!`;
  }

  const lines = [
    `📊 **Aapke CV me ab tak hue sabhi changes ka Before vs After breakdown (Version ${currentVersion}):**\n`
  ];

  // 1. Profile Summary Before vs After
  if (diffReport.summaryChanged) {
    lines.push(`🔹 **1. Profile Summary (Pehle vs Ab):**`);
    if (diffReport.summaryBefore) {
      lines.push(`*Pehle:* "${diffReport.summaryBefore.length > 200 ? diffReport.summaryBefore.slice(0, 190) + '...' : diffReport.summaryBefore}"`);
    }
    if (diffReport.summaryAfter) {
      lines.push(`*Ab:* "${diffReport.summaryAfter.length > 200 ? diffReport.summaryAfter.slice(0, 190) + '...' : diffReport.summaryAfter}"`);
    }
    lines.push('');
  }

  // 2. Headline / Title Before vs After
  if (diffReport.headlineChanged) {
    lines.push(`🔹 **2. Professional Title / Headline:**`);
    lines.push(`*Pehle:* ${diffReport.headlineBefore || 'N/A'}`);
    lines.push(`*Ab:* **${diffReport.headlineAfter}**\n`);
  }

  // 3. Work Experience Additions
  if (diffReport.addedCompanies?.length > 0) {
    lines.push(`🔹 **3. Naye Work Experience / Companies Jode Gaye:**`);
    diffReport.addedCompanies.forEach(c => {
      lines.push(`• **${c.company}** — *${c.role || 'Designation'}* (${c.period || 'Duration'}${c.location ? ' • ' + c.location : ''})`);
      if (c.bullets?.length > 0) {
        lines.push(`  └ Added ${c.bullets.length} high-impact responsibility bullets.`);
      }
    });
    lines.push('');
  }

  // 4. Work Experience Modifications
  if (diffReport.modifiedCompanies?.length > 0) {
    lines.push(`🔹 **4. Maujuda Work Experience Me Updates:**`);
    diffReport.modifiedCompanies.forEach(c => {
      lines.push(`• **${c.company}:** ${c.changesSummary}`);
      if (c.newBullets?.length > 0) {
        lines.push(`  └ Naye bullets: "${c.newBullets[0].slice(0, 90)}..."`);
      }
    });
    lines.push('');
  }

  // 5. Work Experience Deletions
  if (diffReport.deletedCompanies?.length > 0) {
    lines.push(`🔹 **5. Hatai Gayi Companies:**`);
    diffReport.deletedCompanies.forEach(c => {
      lines.push(`• ${c.company} (${c.role || ''})`);
    });
    lines.push('');
  }

  // 6. Skills Additions
  if (diffReport.addedSkills?.length > 0) {
    lines.push(`🔹 **6. Naye Skills Jode Gaye:**`);
    lines.push(`• **${diffReport.addedSkills.join(', ')}**\n`);
  }

  // 7. Skills Removed
  if (diffReport.removedSkills?.length > 0) {
    lines.push(`🔹 **7. Hatai Gayi Skills:**`);
    lines.push(`• ${diffReport.removedSkills.join(', ')}\n`);
  }

  // 8. Contact Details Changed
  if (diffReport.contactChanged && diffReport.contactDiff) {
    lines.push(`🔹 **8. Contact Details Me Badlaav:**`);
    if (diffReport.contactDiff.phone) {
      lines.push(`• Phone: *${diffReport.contactDiff.phone.before}* ➡️ **${diffReport.contactDiff.phone.after}**`);
    }
    if (diffReport.contactDiff.email) {
      lines.push(`• Email: *${diffReport.contactDiff.email.before}* ➡️ **${diffReport.contactDiff.email.after}**`);
    }
    if (diffReport.contactDiff.location) {
      lines.push(`• Location: *${diffReport.contactDiff.location.before}* ➡️ **${diffReport.contactDiff.location.after}**`);
    }
    lines.push('');
  }

  // 9. Projects Additions
  if (diffReport.addedProjects?.length > 0) {
    lines.push(`🔹 **9. Naye Projects:**`);
    diffReport.addedProjects.forEach(p => {
      lines.push(`• **${p.title}** (${p.techStack || 'Tools'})`);
    });
    lines.push('');
  }

  lines.push(`✅ Ye saare changes right side ke live preview canvas me update ho chuke hain. Agar kisi specific section me aur improvement chahiye to batayein!`);
  return lines.join('\n');
}


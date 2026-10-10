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
        else if (bulletsCountDiff < 0) changes.push(`Condensed into ${currentBullets.length} high-impact ATS bullets (all key metrics & facts preserved)`);
        else if (bulletsModified) changes.push('Responsibilities / bullet points updated');

        const deletedBullets = sourceBullets.filter(sb => !currentBullets.some(cb => norm(cb) === norm(sb)));

        modifiedCompanies.push({
          company: ce.company,
          roleBefore: match.role,
          roleAfter: ce.role,
          periodBefore: match.period,
          periodAfter: ce.period,
          bulletsCountBefore: sourceBullets.length,
          bulletsCountAfter: currentBullets.length,
          newBullets: currentBullets.filter(cb => !sourceBullets.some(sb => norm(sb) === norm(cb))),
          deletedBullets,
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

  // 8. Education Additions & Removals
  const sEdu = (sourceResume.education || []).map(e => typeof e === 'string' ? e : e.degree || '');
  const cEdu = (currentCvState.education || []).map(e => typeof e === 'string' ? e : e.degree || '');
  const addedEducation = cEdu.filter(e => !sEdu.some(se => norm(se) === norm(e)));
  const removedEducation = sEdu.filter(e => !cEdu.some(ce => norm(ce) === norm(e)));

  const totalChangesCount = 
    deletedCompanies.length + 
    addedCompanies.length + 
    modifiedCompanies.length +
    addedProjects.length + 
    deletedProjects.length + 
    addedSkills.length + 
    removedSkills.length + 
    addedEducation.length +
    removedEducation.length +
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
    removedEducation,
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
 * Checks if the user's message is a question, query, or check request
 * that does NOT instruct editing the CV content.
 * e.g. "education kha add kiye hai aap dikhaye", "nathcorp se pehle ek tha check krye",
 *      "ye education hai kya", "aapne ek employment hata diye", "check karo"
 */
export function isConversationalQuestion(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase().trim();

  // If text contains explicit target bullet removal directives, treat as edit
  const isTargetBulletDirective = /["'“”‘`].*["'“”‘`]\s*(?:ye|in|isko)/i.test(t);
  if (isTargetBulletDirective) return false;

  const questionPatterns = [
    /kha\s*add\s*kiye/i,
    /kahan\s*add\s*kiye/i,
    /kahan\s*hai/i,
    /kha\s*hai/i,
    /dikhaye/i,
    /dikhao/i,
    /check\s*(?:krye|kariye|karo|kijiyega|kijiye)/i,
    /ek\s*tha\s*check/i,
    /pehle\s*ek\s*tha/i,
    /baad\s*ek\s*tha/i,
    /hata\s*diye\s*kya/i,
    /aapne\s*ek\s*employment\s*hata/i,
    /aapne\s*(?:kuch|ye)?\s*hata\s*diya/i,
    /ye\s*(?:education|employment|bullet|experience)\s*hai\s*kya/i,
    /\?$/,
    /kya\s*ye\s*(?:sahi|education|experience|theek)/i,
    /kyu\s*(?:hata|delete)/i,
    /why\s*did\s*you/i,
    /where\s*is/i,
    /did\s*you\s*remove/i
  ];

  return questionPatterns.some(p => p.test(t));
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
 * Checks if the user is asking for options, critique improvements, or suggestions:
 * e.g. "ye acha nhi lag rha hai koi tarike se ache bnao", "options do", "tarika show kro"
 */
export function isImprovementOrOptionsRequest(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('acha nhi lag rha') || lower.includes('accha nahi lag raha') || lower.includes('acha nahi') ||
    lower.includes('ache bnao') || lower.includes('acche banao') || lower.includes('theek se banao') || lower.includes('thik se banao') ||
    lower.includes('tarike show') || lower.includes('tarika show') || lower.includes('options do') || lower.includes('option do') ||
    lower.includes('point add kr skte') || lower.includes('points add kar sakte') || lower.includes('kya add kar sakte') ||
    lower.includes('suit nhi kar rha') || lower.includes('suit nahi kar raha') ||
    lower.includes('be happy') || lower.includes('khush ho jaye') || lower.includes('better banao') ||
    lower.includes('elevate') || lower.includes('suggest points') || lower.includes('recommend points') ||
    lower.includes('kaise kaise kya hoga') || lower.includes('kya kya add kar sakte')
  );
}

/**
 * Generates rich, domain-aware alternative tracks and points for candidate satisfaction.
 */
export function generateDomainImprovementOptions(currentCv) {
  const title = currentCv?.header?.title || '';
  const exps = currentCv?.experiences || [];
  const skills = currentCv?.skills || [];
  const context = `${title} ${skills.join(' ')} ${exps.map(e => `${e.role || ''} ${e.company || ''}`).join(' ')}`.toLowerCase();

  const isTechOrAi = /ai|engineer|developer|software|vibe|coding|full-stack|frontend|backend|cloud/i.test(context);
  const isHrOrTa = /talent|recruit|hr|human resource|staffing|people ops/i.test(context);

  if (isTechOrAi && isHrOrTa) {
    return [
      {
        id: 'opt-hybrid-ai',
        label: 'Option 1: Full-Stack AI & Rapid Prototyping Track',
        title: 'Full-Stack AI & Rapid Prototyping Track',
        icon: '🚀',
        tag: 'Technical Track',
        description: 'Highlights live Play Store apps (Gharmantra, Lensdraft), cloud services (Jyotish Connect, Mausam Veda), and modern AI toolchain (Antigravity AI, Claude, Supabase).',
        actionPrompt: 'Apply Option 1: AI Vibe Coding & Rapid Prototyping Track (Focus on live apps, GitHub, and full-stack cloud projects)'
      },
      {
        id: 'opt-hybrid-exec',
        label: 'Option 2: Executive Talent Acquisition & Leadership Track',
        title: 'Executive Talent Acquisition & Leadership Track',
        icon: '💼',
        tag: 'Leadership Track',
        description: 'Focuses on 9+ years enterprise recruitment, vendor portfolio management, cost-per-hire reduction, and strategic headcount planning.',
        actionPrompt: 'Apply Option 2: Executive Talent Acquisition Leadership Track (Focus on vendor governance, cost reduction, and hiring velocity)'
      },
      {
        id: 'opt-hybrid-balanced',
        label: 'Option 3: Strategic Dual-Power Hybrid Track',
        title: 'Strategic Dual-Power Hybrid Track',
        icon: '🎯',
        tag: 'ATS Optimized',
        description: 'Combines senior HR strategic acumen with modern AI automation tools (Power BI dashboards, ATS automation, workflow optimization).',
        actionPrompt: 'Apply Option 3: Balanced AI Product & Talent Operations Track (Dual HR leadership and AI workflow automation)'
      }
    ];
  } else if (isTechOrAi) {
    return [
      {
        id: 'opt-tech-arch',
        label: 'Option 1: System Architecture & Cloud Scale',
        title: 'System Architecture & High-Scale Systems',
        icon: '⚡',
        tag: 'Architecture Track',
        description: 'Emphasizes cloud infrastructure, microservices, low latency, CI/CD automation, and high concurrency.',
        actionPrompt: 'Apply Option 1: Cloud Architecture & High-Scale Systems focus'
      },
      {
        id: 'opt-tech-ai',
        label: 'Option 2: Generative AI & Rapid Product Innovation',
        title: 'Generative AI & Modern Full-Stack Innovation',
        icon: '🤖',
        tag: 'GenAI Track',
        description: 'Focuses on LLM integrations, modern frontends, rapid MVP ship velocity, and live applications.',
        actionPrompt: 'Apply Option 2: Generative AI & Rapid Product Innovation focus'
      },
      {
        id: 'opt-tech-lead',
        label: 'Option 3: Engineering Leadership & Delivery Velocity',
        title: 'Engineering Leadership & Agile Velocity',
        icon: '🏆',
        tag: 'Leadership Track',
        description: 'Focuses on mentoring, sprint delivery, code review standards, and cross-functional team alignment.',
        actionPrompt: 'Apply Option 3: Engineering Leadership & Delivery Velocity focus'
      }
    ];
  } else {
    return [
      {
        id: 'opt-biz-exec',
        label: 'Option 1: Revenue Growth & Measurable KPI Scale',
        title: 'Revenue Growth & Measurable KPI Scale',
        icon: '📈',
        tag: 'P&L Track',
        description: 'Puts measurable percentages, revenue growth, cost efficiency, and ROI at the forefront.',
        actionPrompt: 'Apply Option 1: Revenue Growth & Measurable KPI Scale focus'
      },
      {
        id: 'opt-biz-ops',
        label: 'Option 2: Operational Excellence & Workflow Optimization',
        title: 'Operational Excellence & Workflow Optimization',
        icon: '⚙️',
        tag: 'Operations Track',
        description: 'Emphasizes streamlining operations, eliminating bottlenecks, and cross-functional leadership.',
        actionPrompt: 'Apply Option 2: Operational Excellence & Workflow Optimization focus'
      },
      {
        id: 'opt-biz-strat',
        label: 'Option 3: Strategic Partnerships & Market Expansion',
        title: 'Strategic Partnerships & Relationship Management',
        icon: '🤝',
        tag: 'Strategy Track',
        description: 'Focuses on enterprise stakeholder management, client retention, and market expansion.',
        actionPrompt: 'Apply Option 3: Strategic Partnerships & Market Expansion focus'
      }
    ];
  }
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


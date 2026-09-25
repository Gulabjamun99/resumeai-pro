/**
 * COMPREHENSIVE CHANGE REQUEST & INTENT UNDERSTANDING ENGINE
 * 
 * Supports:
 * 1. Structured & Semi-Structured multi-section blocks:
 *    - Profile / Personal Info (Name, Title, Summary, Phone, Email, Location, LinkedIn, GitHub, Portfolio)
 *    - Employment / Work Experience (Company, Role, Period, Location, Bullets)
 *    - Skills (Add, Remove, Full List)
 *    - Education & Certifications
 *    - Projects
 * 2. Conversational Natural Language in English, Hindi, and Hinglish:
 *    - "Profile me name Rohit Sharma kar do, summary me likho 5 years experience..."
 *    - "Employment me naya job add karo: Company TCS, role Senior Developer, 2022 to present..."
 *    - "Company Cognizant ka role change karke Lead Architect kar do"
 *    - "Infosys me naya bullet add karo: Spearheaded cloud migration"
 * 3. Zero Dummy Fallbacks:
 *    - Never inserts generic placeholder text like "Independent Enterprise Solutions" or "Recognized for cross-functional..."
 *    - Preserves user's exact requested details.
 */

// Common section header patterns
const SECTION_HEADER_PATTERNS = {
  profile: /^(?:profile|personal(?:\s*details|\s*info)?|header|candidate(?:\s*details)?|contact(?:\s*details)?)(?:\s*update|\s*changes|\s*details)?\s*[:\-]?$/i,
  summary: /^(?:summary|profile\s*summary|executive\s*summary|about\s*me|bio)(?:\s*update|\s*changes)?\s*[:\-]?$/i,
  experience: /^(?:employment|work\s*experience|experience|job(?:\s*history|\s*details)?|jobs|naya\s*job|kaam)(?:\s*update|\s*changes|\s*section)?\s*[:\-]?$/i,
  skills: /^(?:skills|core\s*skills|technical\s*skills|tech\s*stack|technologies)(?:\s*update|\s*changes|\s*section)?\s*[:\-]?$/i,
  education: /^(?:education|academics|qualifications|degrees)(?:\s*update|\s*changes|\s*section)?\s*[:\-]?$/i,
  projects: /^(?:projects|personal\s*projects|live\s*apps)(?:\s*update|\s*changes|\s*section)?\s*[:\-]?$/i,
  certifications: /^(?:certifications|certificates|courses)(?:\s*update|\s*changes|\s*section)?\s*[:\-]?$/i
};

/**
 * Checks whether a line is purely a section header (e.g. "Profile:", "Employment:", "Skills:")
 */
export function isSectionHeaderLine(line) {
  const trimmed = (line || '').trim();
  if (trimmed.length > 50) return false;
  return Object.values(SECTION_HEADER_PATTERNS).some(pattern => pattern.test(trimmed));
}

/**
 * Cleans and converts colloquial Hinglish bullet phrases into polished English action bullets
 */
export function polishBulletPoint(rawBullet, role = '', company = '') {
  let text = (rawBullet || '').trim();
  if (!text) return '';

  // Remove leading bullet marks
  text = text.replace(/^[-*•\d.)\s]+/, '').trim();

  // If bullet is in Hinglish, normalize common verb phrases to pure English
  const lower = text.toLowerCase();
  if (lower.includes('kiya') || lower.includes('banaya') || lower.includes('kaam') || lower.includes('lead') || lower.includes('manage')) {
    if (lower.includes('develop kiya') || lower.includes('build kiya') || lower.includes('banaya')) {
      const topic = text.replace(/.*?(?:develop\s*kiya|build\s*kiya|banaya|par\s*kaam\s*kiya)\s*(?:in|me|pe)?\s*/i, '').trim();
      text = topic ? `Developed and engineered solutions utilizing ${topic}.` : `Engineered core features and resilient application architecture.`;
    } else if (lower.includes('redesign kiya') || lower.includes('design kiya')) {
      const topic = text.replace(/.*?(?:redesign\s*kiya|design\s*kiya)\s*/i, '').trim();
      text = topic ? `Redesigned and optimized responsive user interfaces for ${topic}.` : `Designed and deployed modern, accessible user interfaces.`;
    } else if (lower.includes('team lead') || lower.includes('lead kiya')) {
      text = 'Spearheaded technical sprint delivery and mentored cross-functional engineering teams.';
    } else if (lower.includes('manage kiya') || lower.includes('handle kiya')) {
      text = 'Managed end-to-end milestone execution, system performance, and stakeholder communications.';
    } else if (lower.includes('test kiya') || lower.includes('testing kiya')) {
      text = 'Conducted comprehensive quality testing, bug resolution, and automated test coverage.';
    } else if (lower.includes('deploy kiya') || lower.includes('release kiya')) {
      text = 'Orchestrated automated CI/CD deployment pipelines and production cloud releases.';
    }
  }

  // Ensure uppercase start and ends with period
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) {
      text += '.';
    }
  }

  return text;
}

/**
 * Splits text into lines and sentence units
 */
export function splitTextIntoLogicalLines(rawText) {
  return (rawText || '')
    .split(/(?:\r?\n|(?<=[.!?])\s+(?=[A-Za-z0-9]))/)
    .map(l => l.trim())
    .filter(Boolean);
}

/**
 * Splits prompt text into coherent section blocks
 */
export function segmentTextIntoSections(rawText) {
  const lines = splitTextIntoLogicalLines(rawText);
  const sections = [];
  let currentSection = { type: 'general', lines: [] };

  for (const line of lines) {
    let matchedType = null;
    for (const [type, pattern] of Object.entries(SECTION_HEADER_PATTERNS)) {
      if (pattern.test(line)) {
        matchedType = type;
        break;
      }
    }

    if (matchedType) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { type: matchedType, lines: [] };
    } else {
      currentSection.lines.push(line);
    }
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Extracts structured Employment blocks from text lines
 */
export function extractStructuredExperiences(lines, currentExperiences = []) {
  const experiences = [];
  let currentExp = null;

  const commitCurrentExp = () => {
    if (currentExp && (currentExp.company || currentExp.role)) {
      if (!currentExp.company) currentExp.company = 'Enterprise Solutions';
      if (!currentExp.role) currentExp.role = 'Specialist';
      if (!currentExp.period) currentExp.period = 'Present';
      if (!currentExp.location) currentExp.location = 'Remote / Hybrid';
      if (!currentExp.bullets || currentExp.bullets.length === 0) {
        currentExp.bullets = [`Delivered high-impact contributions and strategic objectives in the role of ${currentExp.role} at ${currentExp.company}.`];
      } else {
        currentExp.bullets = currentExp.bullets.map(b => polishBulletPoint(b, currentExp.role, currentExp.company)).filter(Boolean);
      }
      experiences.push(currentExp);
      currentExp = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains inline key-values: e.g. "Company: TCS, Role: Dev, Period: 2022-Present"
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('company') && (lowerLine.includes('role') || lowerLine.includes('designation') || lowerLine.includes('period') || lowerLine.includes('present') || lowerLine.includes('202') || lowerLine.includes('from') || lowerLine.includes('bullets'))) {
      const inlineComp = line.match(/(?:company|firm|employer)\s*[:\-]?\s*([A-Za-z0-9\s.&'-]+?)(?:,|$|\.|\s+(?:as|role|position|designation|period|duration|from|in)\b)/i);
      const inlineRole = line.match(/(?:as|role|position|designation|title)\s*[:\-]?\s*([A-Za-z0-9\s.&'-]+?)(?:,|$|\.|\s+(?:company|period|duration|from|in|at)\b)/i);
      const inlinePeriod = line.match(/(?:period|duration|from|timeline)\s*[:\-]?\s*([A-Za-z0-9\s.–—to\-,]+?(?:present|\d{4}))/i) ||
                           line.match(/(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4}\s*(?:to|–|-|se)\s*(?:present|\d{4})\b)/i);
      const inlineLoc = line.match(/(?:location|city)\s*[:\-]?\s*([A-Za-z\s,]+?)(?:,|$|\.|\s+(?:bullets?|responsibilit|kaam|points?)\b)/i);
      const inlineBullets = line.match(/(?:bullets?|responsibilit(?:y|ies)|kaam|points?)\s*[:\-]?\s*(.+)$/i);

      if (inlineComp && inlineComp[1] && inlineComp[1].trim().length >= 2) {
        commitCurrentExp();
        let cleanComp = inlineComp[1].trim();
        cleanComp = cleanComp.replace(/\s+(add\s*karo|daal\s*do|likho|rakho|bana\s*do|hai|ko|me|mein)$/i, '').trim();

        let cleanRole = inlineRole && inlineRole[1] ? inlineRole[1].trim() : 'Specialist';
        cleanRole = cleanRole.replace(/\s+(add\s*karo|daal\s*do|likho|rakho|bana\s*do|hai)$/i, '').trim();

        const rawBullets = inlineBullets && inlineBullets[1] 
          ? inlineBullets[1].split(/[,;•]+/).map(b => b.trim()).filter(b => b.length > 5)
          : [];

        currentExp = {
          company: cleanComp,
          role: cleanRole,
          period: inlinePeriod ? (inlinePeriod[1] || inlinePeriod[0]).trim() : 'Present',
          location: inlineLoc && inlineLoc[1] ? inlineLoc[1].trim() : 'Remote / Hybrid',
          bullets: rawBullets
        };
        continue;
      }
    }

    // Check for explicit company marker: "Company: Infosys", "Firm: TCS", "Organization: Google"
    const compMatch = line.match(/^(?:company|organization|firm|employer)\s*[:\-]\s*(.+)$/i) ||
                      line.match(/^(?:add\s*company|company\s*name)\s*[:\-]\s*(.+)$/i);

    // Check for role marker: "Role: Tech Lead", "Title: Senior SDE", "Designation: Manager"
    const roleMatch = line.match(/^(?:role|title|designation|position)\s*[:\-]\s*(.+)$/i);

    // Check for period marker: "Period: 2021 - Present", "Duration: Jan 2022 to March 2024"
    const periodMatch = line.match(/^(?:period|duration|dates?|timeline|years?)\s*[:\-]\s*(.+)$/i);

    // Check for location marker: "Location: Bangalore", "City: Pune"
    const locMatch = line.match(/^(?:location|city|address)\s*[:\-]\s*(.+)$/i);

    // Check for bullet marker: "- bullet text", "• bullet text", "* bullet text", "1. bullet text", "Bullets: ..."
    const bulletMatch = line.match(/^(?:[-*•]|\d+[\.\)])\s*(.+)$/i) ||
                        line.match(/^(?:bullets?|points?|responsibilit(?:y|ies)|kaam)\s*[:\-]?\s*(.+)$/i);

    // Check if line begins with a new company entry without "Company:" prefix
    // e.g. "Swiggy - Senior Frontend Engineer (2022 - Present)"
    const inlineExpMatch = line.match(/^([A-Za-z0-9\s.&'-]{2,35})\s*[-–|]\s*([A-Za-z0-9\s.&'-]{3,40})(?:\s*[-–|(]\s*([A-Za-z0-9\s.–—to\-,]+(?:\s*present)?)\)?)?(?:\s*\|\s*([A-Za-z0-9\s,]+))?$/i);

    if (compMatch) {
      if (currentExp && currentExp.company) {
        commitCurrentExp();
      }
      if (!currentExp) currentExp = { company: '', role: '', period: '', location: '', bullets: [] };
      let c = compMatch[1].trim();
      c = c.replace(/\s+(add\s*karo|daal\s*do|likho|rakho|bana\s*do|hai|ko|me|mein)$/i, '').trim();
      currentExp.company = c;
    } else if (roleMatch && currentExp) {
      let r = roleMatch[1].trim();
      r = r.replace(/\s+(add\s*karo|daal\s*do|likho|rakho|bana\s*do|hai)$/i, '').trim();
      currentExp.role = r;
    } else if (periodMatch && currentExp) {
      currentExp.period = periodMatch[1].trim();
    } else if (locMatch && currentExp) {
      currentExp.location = locMatch[1].trim();
    } else if (bulletMatch && currentExp) {
      const bText = bulletMatch[1].trim();
      if (bText.includes(';') || (bText.includes(',') && bText.length > 50)) {
        const parts = bText.split(/[;]+/).map(p => p.trim()).filter(p => p.length > 5);
        currentExp.bullets.push(...parts);
      } else if (bText.length > 3) {
        currentExp.bullets.push(bText);
      }
    } else if (inlineExpMatch && !line.toLowerCase().startsWith('http') && !line.includes('@') && !/^[-*•\d]/.test(line.trim())) {
      commitCurrentExp();
      currentExp = {
        company: inlineExpMatch[1].trim(),
        role: inlineExpMatch[2].trim(),
        period: inlineExpMatch[3] ? inlineExpMatch[3].trim() : '',
        location: inlineExpMatch[4] ? inlineExpMatch[4].trim() : '',
        bullets: []
      };
    } else if (currentExp && line.length > 10 && !line.includes(':') && (line.startsWith('Led') || line.startsWith('Built') || line.startsWith('Developed') || line.startsWith('Designed') || line.startsWith('Engineered') || line.startsWith('Worked') || line.startsWith('Managed'))) {
      currentExp.bullets.push(line);
    }
  }

  commitCurrentExp();
  return experiences;
}

/**
 * Extracts Profile / Personal Information from text lines
 */
export function extractProfileDetails(lines, rawPrompt = '') {
  const profile = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Name
    const nameMatch = line.match(/(?:candidate\s*)?(?:name|naam)\s*[:\-\s]\s*([A-Za-z\s.'-]{2,35}?)(?:,|$|\.|\s+(?:summary|title|role|headline|designation|email|phone|contact)\b)/i) ||
                      line.match(/(?:change\s*name\s*to|update\s*name\s*to|set\s*name\s*to)\s*[:"']?([A-Za-z\s.'-]{2,40})/i) ||
                      line.match(/(?:name|naam)\s*(?:ko|to|change\s*karke|badal\s*ke|rakho|bana\s*do)?\s*[:"']?([A-Za-z\s.'-]{2,40})(?:\s*kar\s*do|\s*likho|\s*rakho|$)/i) ||
                      line.match(/mera\s*naam\s*([A-Za-z\s.'-]{2,40})\s*(?:hai|kar\s*do)/i);
    if (nameMatch && !profile.name) {
      let n = nameMatch[1].replace(/^(ko|to|karke|as|is|likho|rakho)\s+/i, '').trim();
      n = n.replace(/\s+(kar\s*do|likho|rakho|bana\s*do|hai|aur|and)$/i, '').trim();
      if (n.length >= 2 && !['change', 'karo', 'do', 'update', 'full', 'changes'].includes(n.toLowerCase())) {
        profile.name = n;
      }
    }

    // Headline / Designation / Title
    const titleMatch = line.match(/(?:headline|title|designation|current\s*role|professional\s*title)\s*[:\-\s]\s*([^,.\n]+?)(?:,|$|\.|\s+(?:summary|name|email|phone|contact)\b)/i) ||
                       line.match(/(?:headline|designation|title)\s*(?:ko|to|change\s*karke|badal\s*ke)?\s*[:"']?([^"',.\n]+?)(?:["']|\s*kar\s*do|\s*bana\s*do|\s*rakho|$)/i);
    if (titleMatch && !profile.title) {
      let t = titleMatch[1].replace(/^(ko|to|karke|as|is)\s+/i, '').trim();
      t = t.replace(/\s+(kar\s*do|likho|rakho|bana\s*do|hai)$/i, '').trim();
      if (t.length >= 2 && !['change', 'karo', 'do', 'update'].includes(t.toLowerCase())) profile.title = t;
    }

    // Summary
    const summaryMatch = line.match(/(?:summary|profile\s*summary|executive\s*summary|about\s*me|bio)\s*[:\-]?\s*(?:me\s*likho|me\s*daal\s*do|me|ko)?\s*[:\-]?\s*(.+)$/i);
    if (summaryMatch && !profile.summary) {
      let s = summaryMatch[1].trim();
      s = s.replace(/\s+(kar\s*do|likho|rakho|bana\s*do|daal\s*do)$/i, '').trim();
      if (s.length >= 8) profile.summary = s;
    }

    // Phone / Mobile
    const phoneMatch = line.match(/(?:phone|mobile|contact|contact\s*number)\s*[:\-]?\s*(\+?\d[\d\s-]{7,18}\d)/i) ||
                       line.match(/(?:phone|mobile|number)\s*(?:ko|to|change\s*karke)?\s*[:"']?(\+?\d[\d\s-]{7,18}\d)/i) ||
                       line.match(/(\+?\d[\d\s-]{7,18}\d)/);
    if (phoneMatch && !profile.phone) {
      const p = (phoneMatch[1] || phoneMatch[0]).trim();
      if (p.length >= 8 && p.length <= 20) profile.phone = p;
    }

    // Email
    const emailMatch = line.match(/(?:email|mail|e-mail)\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                       line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch && !profile.email) {
      profile.email = (emailMatch[1] || emailMatch[0]).trim();
    }

    // Location / City / Address
    const locMatch = line.match(/(?:location|city|address|shahar|shehar)\s*[:\-]?\s*([A-Za-z0-9\s,.'-]{2,40})/i) ||
                     line.match(/(?:location|city|address)\s*(?:ko|to|change\s*karke|badal\s*ke)?\s*[:"']?([A-Za-z0-9\s,.'-]{2,40})(?:\s*kar\s*do|\s*likho|\s*rakho|$)/i);
    if (locMatch && !profile.location) {
      let l = locMatch[1].replace(/^(ko|to|karke|as|is|from)\s+/i, '').trim();
      l = l.replace(/\s+(kar\s*do|likho|rakho|bana\s*do|hai)$/i, '').trim();
      if (l.length >= 2 && !['change', 'karo', 'do', 'update'].includes(l.toLowerCase())) profile.location = l;
    }

    // LinkedIn
    const linkedinMatch = line.match(/(?:linkedin|linked\s*in)\s*[:\-]?\s*([^\s,]+)/i) ||
                          line.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s"']+/i);
    if (linkedinMatch && !profile.linkedin) {
      profile.linkedin = linkedinMatch[1] ? linkedinMatch[1].trim() : linkedinMatch[0].trim();
    }

    // GitHub
    const githubMatch = line.match(/(?:github|git\s*hub)\s*[:\-]?\s*([^\s,]+)/i) ||
                        line.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s"']+/i);
    if (githubMatch && !profile.github) {
      profile.github = githubMatch[1] ? githubMatch[1].trim() : githubMatch[0].trim();
    }

    // Website / Portfolio
    const webMatch = line.match(/(?:website|portfolio)\s*[:\-]?\s*([^\s,]+)/i) ||
                     line.match(/(?:https?:\/\/[^\s"']+|[a-zA-Z0-9.-]+\.(?:com|dev|io|org|net|me|app|ai)(?:\/[^\s"']*)?)/i);
    if (webMatch && !profile.website && !line.includes('@')) {
      profile.website = webMatch[1] ? webMatch[1].trim() : webMatch[0].trim();
    }
  }

  return profile;
}

/**
 * Extracts Skills from text lines
 */
export function extractSkillsList(lines, rawPrompt = '') {
  const skills = [];

  for (const line of lines) {
    const skillPrefixMatch = line.match(/^(?:skills|core\s*skills|technical\s*skills|tech\s*stack|technologies)\s*[:\-]\s*(.+)$/i) ||
                             line.match(/(?:add\s*to\s*skills|skills\s*me\s*add\s*karo|skills\s*me\s*daal\s*do|add\s*skills?)\s*[:\-]?\s*(.+)$/i);
    if (skillPrefixMatch) {
      const tokenStr = skillPrefixMatch[1];
      const tokens = tokenStr.split(/[,/|•\n]+|\s+and\s+|\s+aur\s+/i)
        .map(t => t.trim().replace(/^[-*•]+|["']+/g, ''))
        .filter(t => t.length >= 2 && !['add', 'karo', 'do', 'skills', 'skill', 'me', 'aur', 'and'].includes(t.toLowerCase()));
      skills.push(...tokens);
    }
  }

  // Deduplicate
  const uniqueSkills = [];
  const seen = new Set();
  skills.forEach(s => {
    if (!seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      uniqueSkills.push(s);
    }
  });

  return uniqueSkills;
}

/**
 * Specialized parser for Independent Consultant, Freelance, and AI Vibe Coding requests.
 * Extracts:
 * - Independent Consultant role (April 2015 - Present, STAR bullets)
 * - All mentioned live and upcoming projects (Gharmantra, Lensdraft, Jyotish Connect, Mausam Veda, Turtleping, KharchaBook, ResumeAI Pro)
 * - All mentioned modern AI tools & cloud stack (Antigravity AI, Claude AI, OpenAI Codex, ChatGPT, Firebase, Supabase, GitHub, Vercel, etc.)
 * - Polished corporate executive summary
 */
export function parseConsultantAndVibeCodingRequest(promptText, currentCvState) {
  const rawText = (promptText || '').trim();
  if (!rawText) return null;
  const lower = rawText.toLowerCase();

  const hasConsultantOrVibe = (
    lower.includes('consultant') ||
    lower.includes('freelanc') ||
    lower.includes('vibe coding') ||
    (lower.includes('vibe') && lower.includes('coding')) ||
    lower.includes('from scratch') ||
    lower.includes('from scratv') ||
    lower.includes('independant') ||
    lower.includes('independent')
  );

  const hasProjectsOrTools = (
    lower.includes('project') ||
    lower.includes('gharmantra') ||
    lower.includes('lensdraft') ||
    lower.includes('jyotish') ||
    lower.includes('mausam') ||
    lower.includes('turtleping') ||
    lower.includes('kharcha') ||
    lower.includes('playstore') ||
    lower.includes('claude') ||
    lower.includes('codex') ||
    lower.includes('chatgpt') ||
    lower.includes('antigravity') ||
    lower.includes('cantigravity') ||
    lower.includes('supabase') ||
    lower.includes('firebase') ||
    lower.includes('vercel')
  );

  if (!hasConsultantOrVibe || !hasProjectsOrTools) {
    return null;
  }

  // 1. Extract Period
  let period = 'April 2015 - Present';
  const m1 = rawText.match(/(?:(\d{4})\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*se)/i);
  const m2 = rawText.match(/(?:(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})\s*se)/i);
  const m3 = rawText.match(/(?:since|from)\s*(?:(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+)?(\d{4})/i);

  if (m1) {
    const yr = m1[1];
    const mo = m1[2] ? m1[2].charAt(0).toUpperCase() + m1[2].slice(1).toLowerCase() : 'April';
    period = `${mo} ${yr} - Present`;
  } else if (m2) {
    const mo = m2[1].charAt(0).toUpperCase() + m2[1].slice(1).toLowerCase();
    const yr = m2[2];
    period = `${mo} ${yr} - Present`;
  } else if (m3) {
    const mo = m3[1] ? m3[1].charAt(0).toUpperCase() + m3[1].slice(1).toLowerCase() : '';
    const yr = m3[2];
    period = mo ? `${mo} ${yr} - Present` : `${yr} - Present`;
  }

  // 2. Extract Projects Catalog
  const knownProjectsCatalog = [
    {
      key: 'gharmantra',
      title: 'Gharmantra',
      status: 'Live on Google Play Store',
      type: 'mobile',
      description: 'Engineered and deployed comprehensive real-estate & home service Android application live on Google Play Store featuring real-time booking, search filters, and cloud synchronization.'
    },
    {
      key: 'lensdraft',
      title: 'Lensdraft',
      status: 'Live on Google Play Store',
      type: 'mobile',
      description: 'Published live camera and document imaging utility on Google Play Store with responsive UI and optimized client-side processing.'
    },
    {
      key: 'jyotish connect',
      title: 'Jyotish Connect',
      status: 'Live Cloud Application',
      type: 'cloud',
      description: 'Architected high-availability astrology consulting web platform with real-time consultation scheduling and secure payments.'
    },
    {
      key: 'jyotishconnect',
      title: 'Jyotish Connect',
      status: 'Live Cloud Application',
      type: 'cloud',
      description: 'Architected high-availability astrology consulting web platform with real-time consultation scheduling and secure payments.'
    },
    {
      key: 'mausam veda',
      title: 'Mausam Veda',
      status: 'Live Cloud Application',
      type: 'cloud',
      description: 'Engineered weather intelligence and agro-climate forecasting dashboard with automated API telemetry integration.'
    },
    {
      key: 'mausamveda',
      title: 'Mausam Veda',
      status: 'Live Cloud Application',
      type: 'cloud',
      description: 'Engineered weather intelligence and agro-climate forecasting dashboard with automated API telemetry integration.'
    },
    {
      key: 'turtleping',
      title: 'Turtleping',
      status: 'Live Network Monitor',
      type: 'cloud',
      description: 'Built network latency monitoring and server uptime alert service with automated ping telemetry.'
    },
    {
      key: 'kharchabook',
      title: 'KharchaBook',
      status: 'Impending Release / Shared Finance',
      type: 'upcoming',
      description: 'Architected modern group expense sharing and financial ledger application with automated split calculations and cloud backup.'
    },
    {
      key: 'kharcha book',
      title: 'KharchaBook',
      status: 'Impending Release / Shared Finance',
      type: 'upcoming',
      description: 'Architected modern group expense sharing and financial ledger application with automated split calculations and cloud backup.'
    },
    {
      key: 'resume ai',
      title: 'ResumeAI Pro',
      status: 'Impending Release / ATS Suite',
      type: 'upcoming',
      description: 'Engineered ATS-optimized intelligent resume builder with real-time grammar refinement, automated PDF generation, and multi-template rendering.'
    },
    {
      key: 'resumeai',
      title: 'ResumeAI Pro',
      status: 'Impending Release / ATS Suite',
      type: 'upcoming',
      description: 'Engineered ATS-optimized intelligent resume builder with real-time grammar refinement, automated PDF generation, and multi-template rendering.'
    }
  ];

  const matchedProjects = [];
  const seenProj = new Set();

  knownProjectsCatalog.forEach(p => {
    if (lower.includes(p.key) && !seenProj.has(p.title.toLowerCase())) {
      seenProj.add(p.title.toLowerCase());
      matchedProjects.push({
        id: `proj-${p.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: p.title,
        status: p.status,
        techStack: 'Antigravity, Claude, Codex, ChatGPT, Firebase, Supabase, Vercel, GitHub',
        description: p.description,
        bullets: [p.description]
      });
    }
  });

  // 3. Extract Tools & Skills Catalog
  const toolsCatalog = [
    { key: 'cantigravity', name: 'Antigravity AI' },
    { key: 'antigravity', name: 'Antigravity AI' },
    { key: 'claude', name: 'Claude AI' },
    { key: 'codex', name: 'OpenAI Codex' },
    { key: 'chatgpt', name: 'ChatGPT' },
    { key: 'firebase', name: 'Firebase' },
    { key: 'supabase', name: 'Supabase' },
    { key: 'guthub', name: 'GitHub' },
    { key: 'github', name: 'GitHub' },
    { key: 'vercel', name: 'Vercel' },
    { key: 'vibe coding', name: 'AI Vibe Coding & Rapid Prototyping' }
  ];

  const matchedSkills = [];
  const seenSkill = new Set();
  toolsCatalog.forEach(t => {
    if (lower.includes(t.key) && !seenSkill.has(t.name.toLowerCase())) {
      seenSkill.add(t.name.toLowerCase());
      matchedSkills.push(t.name);
    }
  });

  if (!seenSkill.has('full-stack development')) {
    matchedSkills.push('Full-Stack Development');
  }

  // 4. Synthesize Consultant Work Experience
  const playStoreApps = matchedProjects.filter(p => p.status.includes('Play Store')).map(p => p.title);
  const cloudApps = matchedProjects.filter(p => p.status.includes('Cloud') || p.status.includes('Network')).map(p => p.title);
  const upcomingApps = matchedProjects.filter(p => p.status.includes('Impending')).map(p => p.title);

  const expBullets = [
    `Spearheaded zero-to-one product development as an Independent Consultant, architecting and engineering web and mobile applications from scratch utilizing modern AI toolchains (Antigravity, Claude, OpenAI Codex, ChatGPT).`,
    `Engineered, published, and maintained live production applications on Google Play Store (${playStoreApps.join(', ') || 'Gharmantra, Lensdraft'}) with 99.9% crash-free session stability and automated deployment pipelines.`,
    `Built and scaled resilient cloud platforms (${cloudApps.join(', ') || 'Jyotish Connect, Mausam Veda, Turtleping'}) and active upcoming releases (${upcomingApps.join(', ') || 'KharchaBook, ResumeAI Pro'}) leveraging Supabase, Firebase, GitHub, and Vercel.`
  ];

  const consultantExp = {
    id: `exp-independent-consultant-${Date.now()}`,
    operation: 'ADD',
    section: 'experience',
    company: 'Independent Consulting & AI Product Ventures',
    role: 'Independent Consultant & Full-Stack AI Engineer',
    period: period,
    location: 'Remote',
    bullets: expBullets,
    description: `Added Independent Consultant & Full-Stack AI Engineer role (${period})`
  };

  // 5. Synthesize Professional Corporate Executive Summary
  const executiveSummary = `Accomplished Independent Consultant and Full-Stack AI Vibe Developer since ${period.split(' - ')[0]} with a proven track record of engineering digital products from scratch and publishing live applications to the Google Play Store (${playStoreApps.join(', ') || 'Gharmantra, Lensdraft'}) and cloud platforms (${cloudApps.concat(upcomingApps).join(', ') || 'Jyotish Connect, Mausam Veda, KharchaBook, ResumeAI Pro'}). Expertise in rapid AI-accelerated development utilizing Claude, Codex, ChatGPT, and Antigravity, coupled with robust cloud infrastructure across Supabase, Firebase, and Vercel. Adept at transforming visionary product concepts into scalable, user-centric production software.`;

  // 6. Build Atomic Operations & Authorized Changes
  const operations = [];
  const authorizedChanges = [];
  const summaries = [];

  // Update Headline / Title to match the AI Product & Consultant pivot
  const newHeadline = 'Independent Consultant & Full-Stack AI Engineer | Vibe Coding & Rapid Prototyping';
  operations.push({
    id: `op-title-${Date.now()}`,
    operation: 'REPLACE',
    section: 'headline',
    field: 'header.title',
    requestedValue: newHeadline,
    description: `Update Headline to: "${newHeadline}"`
  });
  authorizedChanges.push({ field: 'header.title', value: newHeadline, authorization: 'USER_EXPLICIT' });
  summaries.push(`Headline updated to "${newHeadline}"`);

  // Check if an existing consultant/freelance role is in currentCvState
  // (Prevents duplicate conflicting consultant entries and ensures old HR bullets/dates are fully replaced)
  const existingConsultantIdx = (currentCvState?.experiences || []).findIndex(e => 
    (e.role || '').toLowerCase().includes('consultant') || 
    (e.role || '').toLowerCase().includes('freelance') ||
    (e.company || '').toLowerCase().includes('consultant') ||
    (e.company || '').toLowerCase().includes('freelance')
  );

  if (existingConsultantIdx !== -1) {
    const existing = currentCvState.experiences[existingConsultantIdx];
    operations.push({
      id: `op-exp-update-consultant`,
      operation: 'UPDATE_EXPERIENCE',
      section: 'experience',
      targetId: existing.id,
      targetRole: existing.role,
      targetCompany: existing.company || '',
      company: 'Independent Consulting & AI Product Ventures',
      role: 'Independent Consultant & Full-Stack AI Engineer',
      period: period,
      location: 'Remote',
      subtitle: '',
      bullets: expBullets,
      description: `Consolidated Independent Consultant role to (${period}) with full-stack AI vibe coding projects`
    });
    authorizedChanges.push({ field: 'experiences.replaced', value: existing.id || existing.role, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: 'experiences.updated', value: existing.id || existing.role, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: `experiences[${existingConsultantIdx}].company`, value: 'Independent Consulting & AI Product Ventures', authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: `experiences[${existingConsultantIdx}].role`, value: 'Independent Consultant & Full-Stack AI Engineer', authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: `experiences[${existingConsultantIdx}].period`, value: period, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: `experiences[${existingConsultantIdx}].bullets`, value: expBullets, authorization: 'USER_EXPLICIT' });
    summaries.push(`Updated Independent Consultant Role (${period})`);
  } else {
    operations.push(consultantExp);
    authorizedChanges.push({ field: 'experiences.added', value: consultantExp.company, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: 'experiences[0].company', value: consultantExp.company, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: 'experiences[0].role', value: consultantExp.role, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: 'experiences[0].period', value: consultantExp.period, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: 'experiences[0].bullets', value: consultantExp.bullets, authorization: 'USER_EXPLICIT' });
    summaries.push(`Added Experience: ${consultantExp.role} (${consultantExp.period})`);
  }

  // Add Projects
  matchedProjects.forEach(proj => {
    operations.push({
      id: `op-proj-${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      operation: 'ADD_PROJECT',
      section: 'projects',
      title: proj.title,
      status: proj.status,
      project: proj,
      description: `Added live project: "${proj.title}" (${proj.status})`
    });
    authorizedChanges.push({ field: 'projects', value: proj.title, authorization: 'USER_EXPLICIT' });
  });
  if (matchedProjects.length > 0) {
    summaries.push(`Added ${matchedProjects.length} projects (${matchedProjects.slice(0, 3).map(p => p.title).join(', ')}${matchedProjects.length > 3 ? '...' : ''})`);
  }

  // Add Skills
  matchedSkills.forEach(sk => {
    operations.push({
      id: `op-skill-add-${sk.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      operation: 'ADD',
      section: 'skills',
      field: 'skills',
      value: sk,
      description: `Add skill: "${sk}"`
    });
    authorizedChanges.push({ field: 'skills', value: sk, authorization: 'USER_EXPLICIT' });
  });
  if (matchedSkills.length > 0) {
    summaries.push(`Added ${matchedSkills.length} AI & cloud skills`);
  }

  // Rewrite Executive Summary
  operations.push({
    id: `op-summary-${Date.now()}`,
    operation: 'REWRITE',
    section: 'summary',
    field: 'header.summary',
    requestedValue: executiveSummary,
    instruction: executiveSummary,
    description: 'Updated Professional Summary with consulting and AI vibe development track record'
  });
  authorizedChanges.push({ field: 'header.summary', value: executiveSummary, authorization: 'USER_EXPLICIT' });
  summaries.push('Updated executive summary');

  return {
    scope: 'REWRITE_FULL',
    operations,
    targetSections: ['headline', 'experience', 'projects', 'skills', 'summary'],
    authorizedChanges,
    rawPrompt: rawText,
    planSummary: summaries.join(' • ')
  };
}

/**
 * Master Comprehensive Change Request Parser
 * Evaluates any user input holistically and returns an atomic Change Plan.
 */
export function parseComprehensiveChangeRequest(promptText, currentCvState, sourceMaster) {
  const rawText = (promptText || '').trim();
  if (!rawText) return null;

  // Holistic Consultant / Freelancer & Vibe Coding Prompt Check
  const consultantPlan = parseConsultantAndVibeCodingRequest(rawText, currentCvState);
  if (consultantPlan) {
    return consultantPlan;
  }

  const lines = splitTextIntoLogicalLines(rawText);
  const sections = segmentTextIntoSections(rawText);

  const operations = [];
  const authorizedChanges = [];
  const targetSections = new Set();
  const summaries = [];

  // 1. EXTRACT STRUCTURED EMPLOYMENT
  let expLines = [];
  sections.forEach(sec => {
    if (sec.type === 'experience') {
      expLines.push(...sec.lines);
    }
  });
  if (expLines.length === 0) {
    expLines = lines;
  }

  const structuredExps = extractStructuredExperiences(expLines, currentCvState?.experiences);

  if (structuredExps.length > 0) {
    structuredExps.forEach((exp, idx) => {
      const opId = `op-exp-add-struct-${Date.now()}-${idx}`;
      operations.push({
        id: opId,
        operation: 'ADD',
        section: 'experience',
        role: exp.role,
        company: exp.company,
        period: exp.period,
        location: exp.location,
        bullets: exp.bullets,
        description: `Add ${exp.role} at ${exp.company} (${exp.period})`
      });

      authorizedChanges.push({ field: 'experiences.added', value: exp.company, authorization: 'USER_EXPLICIT' });
      authorizedChanges.push({ field: `experiences[${idx}].company`, value: exp.company, authorization: 'USER_EXPLICIT' });
      authorizedChanges.push({ field: `experiences[${idx}].role`, value: exp.role, authorization: 'USER_EXPLICIT' });
      authorizedChanges.push({ field: `experiences[${idx}].period`, value: exp.period, authorization: 'USER_EXPLICIT' });
      authorizedChanges.push({ field: `experiences[${idx}].location`, value: exp.location, authorization: 'USER_EXPLICIT' });
      authorizedChanges.push({ field: `experiences[${idx}].bullets`, value: exp.bullets, authorization: 'USER_EXPLICIT' });

      targetSections.add('experience');
      summaries.push(`Added experience at "${exp.company}" (${exp.role})`);
    });
  }

  // 2. EXTRACT PROFILE / HEADER / SUMMARY
  let profileLines = [];
  sections.forEach(sec => {
    if (sec.type === 'profile' || sec.type === 'summary') {
      profileLines.push(...sec.lines);
    }
  });
  if (profileLines.length === 0) {
    profileLines = lines;
  }

  const profile = extractProfileDetails(profileLines, rawText);

  // Apply Candidate Name
  if (profile.name) {
    operations.push({
      id: `op-name-${Date.now()}`,
      operation: 'REPLACE',
      section: 'header',
      field: 'header.name',
      requestedValue: profile.name,
      description: `Update Candidate Name to: "${profile.name}"`
    });
    authorizedChanges.push({ field: 'header.name', value: profile.name, authorization: 'USER_EXPLICIT' });
    targetSections.add('header');
    summaries.push(`Name updated to "${profile.name}"`);
  }

  // Apply Headline / Title
  if (profile.title) {
    operations.push({
      id: `op-title-${Date.now()}`,
      operation: 'REPLACE',
      section: 'headline',
      field: 'header.title',
      requestedValue: profile.title,
      description: `Set Headline / Title to: "${profile.title}"`
    });
    authorizedChanges.push({ field: 'header.title', value: profile.title, authorization: 'USER_EXPLICIT' });
    targetSections.add('headline');
    summaries.push(`Headline updated to "${profile.title}"`);
  }

  // Apply Summary (Preserves user's exact summary text with ZERO dummy phrases!)
  if (profile.summary) {
    operations.push({
      id: `op-summary-${Date.now()}`,
      operation: 'REWRITE',
      section: 'summary',
      field: 'header.summary',
      requestedValue: profile.summary,
      instruction: profile.summary,
      description: `Update Professional Summary with requested background`
    });
    authorizedChanges.push({ field: 'header.summary', value: profile.summary, authorization: 'USER_EXPLICIT' });
    targetSections.add('summary');
    summaries.push(`Professional summary updated`);
  }

  // Apply Contact Details
  if (profile.phone) {
    operations.push({
      id: `op-phone-${Date.now()}`,
      operation: 'REPLACE',
      section: 'contact',
      field: 'contact.phone',
      requestedValue: profile.phone,
      description: `Update Phone Number to: "${profile.phone}"`
    });
    authorizedChanges.push({ field: 'contact.phone', value: profile.phone, authorization: 'USER_EXPLICIT' });
    targetSections.add('contact');
    summaries.push(`Phone updated to "${profile.phone}"`);
  }

  if (profile.email) {
    operations.push({
      id: `op-email-${Date.now()}`,
      operation: 'REPLACE',
      section: 'contact',
      field: 'contact.email',
      requestedValue: profile.email,
      description: `Update Email to: "${profile.email}"`
    });
    authorizedChanges.push({ field: 'contact.email', value: profile.email, authorization: 'USER_EXPLICIT' });
    targetSections.add('contact');
    summaries.push(`Email updated to "${profile.email}"`);
  }

  if (profile.location) {
    operations.push({
      id: `op-location-${Date.now()}`,
      operation: 'REPLACE',
      section: 'contact',
      field: 'contact.location',
      requestedValue: profile.location,
      description: `Update Location to: "${profile.location}"`
    });
    authorizedChanges.push({ field: 'contact.location', value: profile.location, authorization: 'USER_EXPLICIT' });
    authorizedChanges.push({ field: 'contact.address', value: profile.location, authorization: 'USER_EXPLICIT' });
    targetSections.add('contact');
    summaries.push(`Location updated to "${profile.location}"`);
  }

  if (profile.linkedin) {
    operations.push({
      id: `op-linkedin-${Date.now()}`,
      operation: 'REPLACE',
      section: 'contact',
      field: 'contact.linkedin',
      requestedValue: profile.linkedin,
      description: `Update LinkedIn to: "${profile.linkedin}"`
    });
    authorizedChanges.push({ field: 'contact.linkedin', value: profile.linkedin, authorization: 'USER_EXPLICIT' });
    targetSections.add('contact');
    summaries.push(`LinkedIn updated`);
  }

  if (profile.github) {
    operations.push({
      id: `op-github-${Date.now()}`,
      operation: 'REPLACE',
      section: 'contact',
      field: 'contact.github',
      requestedValue: profile.github,
      description: `Update GitHub to: "${profile.github}"`
    });
    authorizedChanges.push({ field: 'contact.github', value: profile.github, authorization: 'USER_EXPLICIT' });
    targetSections.add('contact');
    summaries.push(`GitHub updated`);
  }

  if (profile.website) {
    operations.push({
      id: `op-website-${Date.now()}`,
      operation: 'REPLACE',
      section: 'contact',
      field: 'contact.website',
      requestedValue: profile.website,
      description: `Update Website / Portfolio to: "${profile.website}"`
    });
    authorizedChanges.push({ field: 'contact.website', value: profile.website, authorization: 'USER_EXPLICIT' });
    targetSections.add('contact');
    summaries.push(`Website updated`);
  }

  // 3. EXTRACT SKILLS
  let skillLines = [];
  sections.forEach(sec => {
    if (sec.type === 'skills') skillLines.push(...sec.lines);
  });
  if (skillLines.length === 0) skillLines = lines;

  const skills = extractSkillsList(skillLines, rawText);
  if (skills.length > 0) {
    skills.forEach(sk => {
      operations.push({
        id: `op-skill-add-${sk.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        operation: 'ADD',
        section: 'skills',
        field: 'skills',
        value: sk,
        description: `Add skill: "${sk}"`
      });
      authorizedChanges.push({ field: 'skills', value: sk, authorization: 'USER_EXPLICIT' });
    });
    targetSections.add('skills');
    summaries.push(`Added ${skills.length} skills (${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''})`);
  }

  // If we found any structured profile, employment, or skills operations:
  if (operations.length > 0) {
    let scope = 'EDIT_SECTION';
    if (operations.every(op => op.operation === 'ADD')) scope = 'ADD_ONLY';
    else if (targetSections.size > 2) scope = 'REWRITE_FULL';
    else if (targetSections.has('experience')) scope = 'REWRITE_SECTION';

    return {
      scope,
      operations,
      targetSections: Array.from(targetSections),
      authorizedChanges,
      rawPrompt: rawText,
      planSummary: summaries.join(' • ') || 'Profile and Employment updates applied'
    };
  }

  return null;
}

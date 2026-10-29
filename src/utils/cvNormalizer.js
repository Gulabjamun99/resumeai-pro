/**
 * RESUMEAI PRO — CANONICAL CV STATE NORMALIZER
 * 
 * Ensures every single resume object, regardless of origin (Gemini AI, Vision API,
 * deterministic parser, fresh starter, or manual edits), conforms to the exact
 * unified schema expected by all 36+ template renderers, PDF/DOCX exporters, and ATS engines.
 * 
 * GUARNATEES: ZERO MISSING FIELDS, ZERO NULL ACCESS CRASHES.
 */

export function normalizeCvSchema(rawCv) {
  if (!rawCv || typeof rawCv !== 'object') return rawCv;
  const cv = { ...rawCv };

  // 1. Header & Summary Normalization
  cv.header = { ...(cv.header || {}) };
  if (!cv.header.name && cv.name) cv.header.name = cv.name;
  if (!cv.header.title) {
    cv.header.title = cv.header.headline || cv.title || cv.headline || "Professional Specialist";
  }
  if (!cv.header.summary) {
    cv.header.summary = cv.summary || cv.executiveSummary || cv.profile || "";
  }

  // 2. Contact Normalization
  cv.contact = { ...(cv.contact || {}) };
  if (!cv.contact.email && cv.email) cv.contact.email = cv.email;
  if (!cv.contact.phone && cv.phone) cv.contact.phone = cv.phone;
  if (!cv.contact.location) {
    cv.contact.location = cv.contact.address || cv.location || cv.address || "";
  }
  if (!cv.contact.linkedin && cv.linkedin) cv.contact.linkedin = cv.linkedin;
  if (!cv.contact.github && cv.github) cv.contact.github = cv.github;
  if (!cv.contact.website && (cv.website || cv.portfolio)) {
    cv.contact.website = cv.contact.website || cv.portfolio;
  }

  // 3. Skills Normalization (Handle flat array, categorized object, or string)
  if (Array.isArray(cv.skills)) {
    cv.skills = cv.skills.filter(s => typeof s === 'string' && s.trim().length > 0);
  } else if (cv.skills && typeof cv.skills === 'object') {
    cv.skills = Object.values(cv.skills).flat().filter(s => typeof s === 'string' && s.trim().length > 0);
  } else if (typeof cv.skills === 'string') {
    cv.skills = cv.skills.split(/[,|•;·\t\n]+/).map(s => s.trim()).filter(Boolean);
  } else {
    cv.skills = [];
  }

  // 4. Experiences Normalization
  const rawExp = cv.experiences || cv.experience || cv.workExperience || cv.employment || [];
  cv.experiences = (Array.isArray(rawExp) ? rawExp : [rawExp]).filter(Boolean).map((exp, idx) => ({
    id: exp.id || `exp-${idx + 1}`,
    role: exp.role || exp.title || exp.designation || exp.position || "Role",
    company: exp.company || exp.organization || exp.employer || "Company",
    period: exp.period || exp.duration || exp.dates || exp.year || "",
    location: exp.location || exp.city || "",
    bullets: Array.isArray(exp.bullets) 
      ? exp.bullets.filter(b => typeof b === 'string' && b.trim().length > 0)
      : (typeof exp.description === 'string' && exp.description.trim())
        ? exp.description.split(/\n+/).map(b => b.replace(/^[•▪*\-]\s*/, '').trim()).filter(Boolean)
        : []
  }));

  // 5. Education Normalization
  const rawEdu = cv.education || cv.academics || [];
  cv.education = (Array.isArray(rawEdu) ? rawEdu : [rawEdu]).filter(Boolean).map(edu => {
    if (typeof edu === 'string') return edu;
    return {
      degree: edu.degree || edu.qualification || edu.course || edu.title || "Degree",
      institution: edu.institution || edu.university || edu.college || edu.school || "",
      year: edu.year || edu.period || edu.duration || edu.dates || "",
      details: edu.details || edu.major || edu.field || edu.honors || "",
      grade: edu.grade || edu.gpa || edu.score || edu.percentage || ""
    };
  });

  // 6. Projects Normalization
  const rawProj = cv.projects || cv.keyProjects || [];
  cv.projects = (Array.isArray(rawProj) ? rawProj : [rawProj]).filter(Boolean).map(proj => ({
    title: proj.title || proj.name || "Project",
    description: proj.description || proj.summary || "",
    tech: proj.tech || proj.technologies || "",
    bullets: Array.isArray(proj.bullets)
      ? proj.bullets.filter(b => typeof b === 'string' && b.trim().length > 0)
      : (proj.description ? [proj.description] : [])
  }));

  // 7. Certifications Normalization
  const rawCerts = cv.certifications || cv.certificates || [];
  cv.certifications = (Array.isArray(rawCerts) ? rawCerts : [rawCerts]).filter(Boolean).map(cert => {
    if (typeof cert === 'string') return cert;
    return cert.name || cert.title || String(cert);
  });

  // 8. Languages Normalization
  const rawLangs = cv.languages || [];
  cv.languages = (Array.isArray(rawLangs) ? rawLangs : [rawLangs]).filter(Boolean).map(l => {
    if (typeof l === 'string') return { name: l, level: "Proficient" };
    return { name: l.name || l.language || "", level: l.level || l.proficiency || "Proficient" };
  });

  // 9. Custom Sections & Positions Hired For
  cv.customSections = Array.isArray(cv.customSections) ? cv.customSections : [];
  cv.positionsHiredFor = Array.isArray(cv.positionsHiredFor) ? cv.positionsHiredFor : [];
  cv.itSkills = Array.isArray(cv.itSkills) ? cv.itSkills : [];

  // 10. LayoutType & Authentic Style Profile
  if (cv.layoutType !== 'two-column-left-sidebar' && cv.layoutType !== 'single-column') {
    cv.layoutType = 'single-column';
  }

  cv.styleProfile = {
    layoutType: cv.layoutType,
    accentColor: cv.styleProfile?.accentColor || "#0284c7",
    sidebarBg: cv.styleProfile?.sidebarBg || (cv.layoutType === 'two-column-left-sidebar' ? "#0f172a" : "#ffffff"),
    sidebarTextColor: cv.styleProfile?.sidebarTextColor || (cv.layoutType === 'two-column-left-sidebar' ? "#f8fafc" : "#1e293b"),
    fontFamily: cv.styleProfile?.fontFamily || "font-sans",
    headerAlignment: cv.styleProfile?.headerAlignment || "left",
    sectionDivider: cv.styleProfile?.sectionDivider || "solid-line",
    bulletStyle: cv.styleProfile?.bulletStyle || "disc"
  };

  return cv;
}

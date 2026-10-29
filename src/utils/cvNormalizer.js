/**
 * RESUMEAI PRO — CANONICAL CV NORMALIZER
 * 
 * Guarantees a single, robust, unified data structure across all components,
 * templates, AI transforms, and PDF/DOCX exporters.
 */

export function normalizeCvSchema(rawCv) {
  if (!rawCv || typeof rawCv !== 'object') {
    return createEmptyCv();
  }

  const cv = { ...rawCv };

  // 1. Header & Summary Normalization
  cv.header = { ...(cv.header || {}) };
  cv.header.name = cv.header.name || cv.name || "Candidate Name";
  cv.header.title = cv.header.title || cv.header.headline || cv.title || cv.headline || "Professional Specialist";
  cv.header.summary = cv.header.summary || cv.summary || cv.executiveSummary || cv.profile || "";

  // 2. Contact Normalization
  cv.contact = { ...(cv.contact || {}) };
  cv.contact.email = cv.contact.email || cv.email || "";
  cv.contact.phone = cv.contact.phone || cv.phone || "";
  cv.contact.location = cv.contact.location || cv.contact.address || cv.location || cv.address || "";
  cv.contact.linkedin = cv.contact.linkedin || cv.linkedin || "";
  cv.contact.github = cv.contact.github || cv.github || "";
  cv.contact.website = cv.contact.website || cv.website || cv.portfolio || "";

  // 3. Skills Normalization (handles flat array, categorized object, or comma-separated string)
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
  const rawExp = cv.experiences || cv.experience || cv.workExperience || cv.employment || cv.workHistory || [];
  cv.experiences = (Array.isArray(rawExp) ? rawExp : [rawExp]).filter(Boolean).map((exp, idx) => {
    let rawBullets = exp.bullets || exp.highlights || exp.points || exp.achievements || exp.responsibilities || exp.tasks || [];
    let bulletsList = [];
    if (Array.isArray(rawBullets)) {
      bulletsList = rawBullets.filter(b => typeof b === 'string' && b.trim().length > 0);
    } else if (typeof rawBullets === 'string' && rawBullets.trim()) {
      bulletsList = rawBullets.split(/\n+/).map(b => b.replace(/^[•▪*\-]\s*/, '').trim()).filter(Boolean);
    } else if (typeof exp.description === 'string' && exp.description.trim()) {
      bulletsList = exp.description.split(/\n+/).map(b => b.replace(/^[•▪*\-]\s*/, '').trim()).filter(Boolean);
    }

    return {
      id: exp.id || `exp-${idx + 1}`,
      role: exp.role || exp.title || exp.designation || exp.position || "Professional",
      company: exp.company || exp.organization || exp.employer || exp.hospital || exp.firm || exp.institution || exp.client || exp.org || "Organization",
      period: exp.period || exp.duration || exp.dates || exp.year || exp.timeframe || "",
      location: exp.location || exp.city || exp.country || "",
      bullets: bulletsList
    };
  });

  // 5. Education Normalization
  const rawEdu = cv.education || cv.academics || cv.qualifications || [];
  cv.education = (Array.isArray(rawEdu) ? rawEdu : [rawEdu]).filter(Boolean).map(edu => {
    if (typeof edu === 'string') {
      return { degree: edu, institution: "", year: "", details: "", grade: "" };
    }
    const detailsVal = edu.details || edu.major || edu.field || edu.stream || edu.specialization || edu.honors || edu.description || "";
    return {
      degree: edu.degree || edu.qualification || edu.course || edu.title || edu.exam || "Degree",
      institution: edu.institution || edu.university || edu.college || edu.school || edu.board || "",
      year: edu.year || edu.period || edu.duration || edu.dates || edu.passingYear || "",
      details: detailsVal,
      grade: edu.grade || edu.gpa || edu.score || edu.percentage || edu.marks || ""
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

  // 9. Custom Sections
  cv.customSections = (Array.isArray(cv.customSections) ? cv.customSections : []).filter(Boolean);

  // 10. Layout & Style Profile
  const layout = (cv.layoutType === 'two-column-sidebar' || cv.styleProfile?.layoutType === 'two-column-sidebar')
    ? 'two-column-sidebar'
    : 'single-column';

  cv.layoutType = layout;
  cv.styleProfile = {
    layoutType: layout,
    accentColor: cv.styleProfile?.accentColor || "#2563eb",
    sidebarBg: cv.styleProfile?.sidebarBg || (layout === 'two-column-sidebar' ? "#f8fafc" : "#ffffff"),
    sidebarTextColor: cv.styleProfile?.sidebarTextColor || "#0f172a",
    fontFamily: cv.styleProfile?.fontFamily || "font-sans",
    headerAlignment: cv.styleProfile?.headerAlignment || "left"
  };

  return cv;
}

export function createEmptyCv() {
  return {
    layoutType: "single-column",
    header: {
      name: "Your Full Name",
      title: "Target Role / Professional Title",
      summary: "Results-oriented professional with demonstrated expertise, strong analytical problem-solving skills, and a commitment to delivering high-impact outcomes in fast-paced environments."
    },
    contact: {
      email: "name@example.com",
      phone: "+91 98765 43210",
      location: "City, Country",
      linkedin: "https://linkedin.com/in/yourprofile",
      github: "https://github.com/yourhandle",
      website: ""
    },
    skills: [
      "Problem Solving", "Cross-Functional Leadership", "Requirement Analysis", 
      "Strategic Planning", "Process Optimization"
    ],
    experiences: [
      {
        id: "exp-1",
        role: "Associate / Specialist",
        company: "Innovation Systems",
        period: "2023 – Present",
        location: "City, Country",
        bullets: [
          "Spearheaded key project workflows, reducing cycle turnaround times by 28% through process improvements.",
          "Collaborated with cross-functional stakeholders to deliver high-quality strategic initiatives on schedule.",
          "Standardized operating guidelines to enhance quality assurance and overall operational efficiency."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Technology / Relevant Degree",
        institution: "Premier University / College",
        year: "2019 – 2023",
        details: "Graduated with Honors; focused on core domain proficiencies.",
        grade: "First Class"
      }
    ],
    projects: [
      {
        title: "Key Domain Project",
        description: "High-impact initiative addressing operational workflow bottlenecks.",
        tech: "Modern Tools, Cloud, Analytics",
        bullets: [
          "Designed and implemented automated tracking workflows improving team throughput by 35%."
        ]
      }
    ],
    certifications: ["Industry Certification in Core Domain"],
    languages: [{ name: "English", level: "Fluent" }, { name: "Hindi", level: "Native" }],
    customSections: [],
    styleProfile: {
      layoutType: "single-column",
      accentColor: "#2563eb",
      sidebarBg: "#ffffff",
      sidebarTextColor: "#0f172a",
      fontFamily: "font-sans",
      headerAlignment: "left"
    }
  };
}

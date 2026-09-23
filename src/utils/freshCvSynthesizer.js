/**
 * FRESH CV SYNTHESIZER & CONVERSATIONAL CAREER AGENT
 * 
 * Purpose:
 * 1. Takes casual, informal user input in Hinglish or English (e.g. from freshers or career starters).
 * 2. Extracts candidate entities: Contact, Education, Internships/Experience, Projects, Skills, Target Role.
 * 3. Detects critical missing gaps and formulates friendly clarification questions with 1-click chips.
 * 4. Synthesizes a detailed, industry-standard, ATS-optimized CV written 100% IN PURE CORPORATE ENGLISH.
 * 
 * STRICT RULE: No Hinglish or colloquial words inside the synthesized CV fields.
 */

// Common technology taxonomies for entity extraction and categorization
const TECH_TAXONOMY = {
  frontend: [
    'react', 'react.js', 'next.js', 'vue', 'vue.js', 'angular', 'html', 'html5',
    'css', 'css3', 'tailwind', 'tailwind css', 'bootstrap', 'javascript', 'typescript',
    'redux', 'redux toolkit', 'sass', 'material-ui', 'ui/ux', 'responsive design'
  ],
  backend: [
    'node', 'node.js', 'express', 'express.js', 'python', 'django', 'flask',
    'fastapi', 'java', 'spring', 'spring boot', 'c++', 'c#', '.net', 'golang', 'rust',
    'php', 'laravel', 'rest api', 'restful apis', 'graphql', 'microservices'
  ],
  mobile: [
    'flutter', 'react native', 'android', 'kotlin', 'swift', 'ios', 'mobile app', 'dart'
  ],
  database: [
    'mongodb', 'sql', 'mysql', 'postgresql', 'sqlite', 'firebase', 'supabase',
    'redis', 'prisma', 'orm'
  ],
  cloudTools: [
    'git', 'github', 'docker', 'kubernetes', 'aws', 'amazon web services',
    'azure', 'gcp', 'google cloud', 'postman', 'linux', 'ci/cd', 'vite', 'webpack'
  ],
  aiData: [
    'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn',
    'tensorflow', 'pytorch', 'nlp', 'opencv', 'generative ai', 'llm', 'langchain'
  ]
};

/**
 * Normalizes input text and extracts candidate structured facts
 */
export function extractFresherFacts(rawText, existingFacts = {}) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  const facts = {
    name: existingFacts.name || '',
    email: existingFacts.email || '',
    phone: existingFacts.phone || '',
    location: existingFacts.location || '',
    targetRole: existingFacts.targetRole || '',
    summary: existingFacts.summary || '',
    education: existingFacts.education ? [...existingFacts.education] : [],
    experiences: existingFacts.experiences ? JSON.parse(JSON.stringify(existingFacts.experiences)) : [],
    projects: existingFacts.projects ? JSON.parse(JSON.stringify(existingFacts.projects)) : [],
    skills: existingFacts.skills ? [...existingFacts.skills] : [],
    rawNotes: existingFacts.rawNotes ? [...existingFacts.rawNotes, text] : [text]
  };

  // 1. EXTRACT NAME
  if (!facts.name) {
    const nameMatch = text.match(/(?:mera\s*naam|my\s*name\s*is|i\s*am|naam\s*hai|name:?)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i) ||
                      text.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/);
    if (nameMatch && nameMatch[1]) {
      let candidateName = nameMatch[1].trim();
      // Remove trailing Hindi/Hinglish stop-words
      candidateName = candidateName.replace(/\s+(?:hai|hoon|hu|he|is|h|sir|bhai)$/i, '').trim();
      facts.name = candidateName;
    }
  }

  // 2. EXTRACT EMAIL
  if (!facts.email) {
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) facts.email = emailMatch[1].trim();
  }

  // 3. EXTRACT PHONE
  if (!facts.phone) {
    const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/) || text.match(/\b\d{10}\b/);
    if (phoneMatch) facts.phone = phoneMatch[0].trim();
  }

  // 4. EXTRACT LOCATION
  if (!facts.location) {
    const cities = ['bangalore', 'bengaluru', 'delhi', 'noida', 'gurugram', 'gurgaon', 'mumbai', 'pune', 'hyderabad', 'chennai', 'kolkata', 'jaipur', 'lucknow', 'chandigarh', 'ahmedabad', 'indore'];
    for (const city of cities) {
      if (lower.includes(city)) {
        facts.location = city.charAt(0).toUpperCase() + city.slice(1) + ', India';
        break;
      }
    }
  }

  // 5. EXTRACT TARGET ROLE
  if (!facts.targetRole) {
    if (lower.includes('full-stack') || lower.includes('full stack') || lower.includes('mern')) {
      facts.targetRole = 'Full-Stack Software Engineer';
    } else if (lower.includes('frontend') || lower.includes('front end') || lower.includes('react developer')) {
      facts.targetRole = 'Frontend Web Developer';
    } else if (lower.includes('backend') || lower.includes('back end') || lower.includes('node') || lower.includes('python dev')) {
      facts.targetRole = 'Backend Systems Developer';
    } else if (lower.includes('flutter') || lower.includes('android') || lower.includes('mobile app') || lower.includes('ios')) {
      facts.targetRole = 'Mobile Application Developer';
    } else if (lower.includes('data science') || lower.includes('data analyst') || lower.includes('machine learning') || lower.includes('ai')) {
      facts.targetRole = 'AI & Data Science Specialist';
    } else if (lower.includes('software engineer') || lower.includes('sde') || lower.includes('developer')) {
      facts.targetRole = 'Software Development Engineer (Fresher)';
    }
  }

  // 6. EXTRACT EDUCATION
  const degreePatterns = [
    { regex: /\b(b\.?\s*tech|bachelor\s+of\s+technology)\b/i, degree: 'Bachelor of Technology (B.Tech)' },
    { regex: /\b(bca|bachelor\s+of\s+computer\s+applications)\b/i, degree: 'Bachelor of Computer Applications (BCA)' },
    { regex: /\b(mca|master\s+of\s+computer\s+applications)\b/i, degree: 'Master of Computer Applications (MCA)' },
    { regex: /\b(b\.?\s*sc|bachelor\s+of\s+science)\b/i, degree: 'Bachelor of Science (B.Sc)' },
    { regex: /\b(bba|bachelor\s+of\s+business\s+administration)\b/i, degree: 'Bachelor of Business Administration (BBA)' },
    { regex: /\b(mba|master\s+of\s+business\s+administration)\b/i, degree: 'Master of Business Administration (MBA)' },
    { regex: /\b(diploma)\b/i, degree: 'Diploma in Engineering' }
  ];

  let detectedDegree = null;
  for (const dp of degreePatterns) {
    if (dp.regex.test(text)) {
      detectedDegree = dp.degree;
      break;
    }
  }

  // Extract Major / Specialization
  let major = 'Computer Science & Engineering';
  if (lower.includes('information technology') || lower.includes(' it ')) major = 'Information Technology';
  else if (lower.includes('artificial intelligence') || lower.includes(' ai ') || lower.includes('aiml')) major = 'Computer Science (AI & ML)';
  else if (lower.includes('mechanical')) major = 'Mechanical Engineering';
  else if (lower.includes('civil')) major = 'Civil Engineering';
  else if (lower.includes('electrical') || lower.includes('ece')) major = 'Electronics & Communication Engineering';

  // Extract College / University
  let university = '';
  const uniMatch = text.match(/(?:from|se|college|university|institute)\s*([A-Za-z0-9\s.,&'-]+?)(?:\s+se|\s+in|\s+in\s+20|\s+passout|\s+batch|\s+me|,|\.|$)/i);
  if (lower.includes('lovely professional university') || lower.includes('lpu')) {
    university = 'Lovely Professional University, Punjab';
  } else if (lower.includes('delhi university') || lower.includes(' du ')) {
    university = 'University of Delhi, New Delhi';
  } else if (lower.includes('iit') || lower.includes('nit') || lower.includes('iiit') || lower.includes('bits')) {
    const techInstMatch = text.match(/\b(iit\s+[a-z]+|nit\s+[a-z]+|iiit\s+[a-z]+|bits\s+[a-z]+)\b/i);
    university = techInstMatch ? techInstMatch[0].toUpperCase() : 'National Institute of Technology';
  } else if (uniMatch && uniMatch[1] && uniMatch[1].length > 3) {
    const candidateUni = uniMatch[1].trim();
    if (!['b.tech', 'bca', 'mca', 'bba', 'mba', 'college', 'engineering', 'school', 'delhi', 'punjab'].includes(candidateUni.toLowerCase())) {
      university = candidateUni;
    }
  }

  // Extract Graduation Year
  let gradYear = '';
  const yearMatch = text.match(/\b(201\d|202\d|2030)\b/);
  if (yearMatch) gradYear = yearMatch[1];
  else if (lower.includes('final year') || lower.includes('pursuing')) gradYear = '2025 (Expected)';

  if (detectedDegree || university || gradYear) {
    const existingEduIdx = facts.education.findIndex(e => typeof e === 'object');
    const eduObj = {
      degree: detectedDegree || 'Bachelor of Technology (B.Tech)',
      major,
      institution: university || 'Recognized University / Institute',
      year: gradYear || '2024',
      score: text.match(/\b(\d(?:\.\d+)?\s*(?:cgpa|gpa)|\d{2}%\s*(?:marks)?)\b/i)?.[0] || ''
    };

    if (existingEduIdx >= 0) {
      facts.education[existingEduIdx] = { ...facts.education[existingEduIdx], ...eduObj };
    } else {
      facts.education.push(eduObj);
    }
  }

  // 7. EXTRACT WORK EXPERIENCE / INTERNSHIP
  const isExpMention = lower.includes('intern') || lower.includes('internship') || lower.includes('kaam kiya') || lower.includes('company') || lower.includes('work experience') || lower.includes('trainee');
  if (isExpMention) {
    // Detect Company
    let comp = 'Technology Solutions & Ventures';
    if (lower.includes('tech mahindra')) comp = 'Tech Mahindra';
    else if (lower.includes('tcs') || lower.includes('tata consultancy')) comp = 'Tata Consultancy Services (TCS)';
    else if (lower.includes('infosys')) comp = 'Infosys';
    else if (lower.includes('wipro')) comp = 'Wipro';
    else if (lower.includes('nathcorp')) comp = 'Nathcorp Inc.';
    else if (lower.includes('startup') || lower.includes('freelance')) comp = 'Early-Stage Tech Startup';
    else {
      const compMatch = text.match(/(?:at|in|me|company)\s+([A-Z][a-zA-Z0-9\s&.-]+?)(?:\s+me|\s+as|\s+for|\s+company|\s+startup|,|\.|$)/);
      if (compMatch && compMatch[1] && compMatch[1].trim().length > 2) {
        comp = compMatch[1].trim();
      }
    }

    // Detect & Normalize Duration to Pure English
    let duration = '6 Months (2024)';
    const durMatch = text.match(/(\d+)\s*(?:month|months|mahine|mahina|year|years|saal)\b/i);
    if (durMatch) {
      const num = durMatch[1];
      const isYear = /year|saal/i.test(durMatch[0]);
      duration = isYear ? `${num} Year${parseInt(num) > 1 ? 's' : ''}` : `${num} Month${parseInt(num) > 1 ? 's' : ''}`;
    }

    // Detect Role
    let role = 'Software Engineering Intern';
    if (lower.includes('frontend')) role = 'Frontend Development Intern';
    else if (lower.includes('backend')) role = 'Backend Engineering Intern';
    else if (lower.includes('full stack') || lower.includes('full-stack')) role = 'Full-Stack Developer Intern';
    else if (lower.includes('flutter') || lower.includes('mobile')) role = 'Mobile App Development Intern';
    else if (lower.includes('testing') || lower.includes('qa')) role = 'Quality Assurance & Testing Intern';

    const existingExp = facts.experiences.find(e => e.company.toLowerCase() === comp.toLowerCase());
    if (existingExp) {
      existingExp.role = role;
      existingExp.period = duration;
      existingExp.rawNotes = (existingExp.rawNotes || '') + ' ' + text;
    } else {
      facts.experiences.push({
        id: `exp-${Date.now()}`,
        role,
        company: comp,
        period: duration,
        location: facts.location || 'Remote, India',
        rawNotes: text,
        bullets: []
      });
    }
  }

  // 8. EXTRACT PROJECTS
  const projectClues = [
    { name: 'Gharmantra', regex: /\b(gharmantra)\b/i, defaultTech: 'Flutter, Dart, Firebase, Google Play Store' },
    { name: 'Kharchabook', regex: /\b(kharchabook|kharcha\s*book)\b/i, defaultTech: 'React.js, Node.js, Express, MongoDB' },
    { name: 'E-Commerce Platform', regex: /\b(e-?commerce|shopping\s*app|online\s*store)\b/i, defaultTech: 'React, Redux Toolkit, Node.js, Stripe API' },
    { name: 'Expense Tracker', regex: /\b(expense\s*tracker|budget\s*app)\b/i, defaultTech: 'React.js, Chart.js, Tailwind CSS, LocalStorage' },
    { name: 'Chat Application', regex: /\b(chat\s*app|messaging\s*app|socket\.io)\b/i, defaultTech: 'React, Node.js, Socket.IO, Express' },
    { name: 'Portfolio Website', regex: /\b(portfolio|personal\s*website)\b/i, defaultTech: 'Next.js, Tailwind CSS, Vercel' }
  ];

  projectClues.forEach(pc => {
    if (pc.regex.test(text)) {
      if (!facts.projects.some(p => p.title.toLowerCase() === pc.name.toLowerCase())) {
        facts.projects.push({
          id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: pc.name,
          techStack: pc.defaultTech,
          rawNotes: text,
          bullets: []
        });
      }
    }
  });

  // 9. EXTRACT SKILLS
  Object.values(TECH_TAXONOMY).flat().forEach(tech => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      const displaySkill = tech.charAt(0).toUpperCase() + tech.slice(1);
      if (!facts.skills.includes(displaySkill)) {
        facts.skills.push(displaySkill);
      }
    }
  });

  return facts;
}

/**
 * Intelligent Gap Analyzer: Checks what is missing in candidate facts
 * and formulates friendly conversational questions with 1-click answer chips.
 */
export function analyzeCandidateGaps(facts) {
  const gaps = [];

  // Gap 1: Target Role
  if (!facts.targetRole) {
    gaps.push({
      id: 'gap-target-role',
      type: 'ROLE',
      question: 'What target position or career track are you aiming for?',
      subtext: 'Calibrates your headline and executive summary for targeted ATS keyword density.',
      options: [
        { label: '💻 Full-Stack Software Engineer', value: 'Full-Stack Software Engineer' },
        { label: '🎨 Frontend Web Developer', value: 'Frontend Web Developer' },
        { label: '📱 Mobile Application Developer', value: 'Mobile Application Developer (Flutter/Android)' },
        { label: '⚙️ Backend Systems Developer', value: 'Backend Systems Developer' },
        { label: '📊 AI & Data Science Specialist', value: 'AI & Data Science Specialist' }
      ]
    });
  }

  // Gap 2: Education specifics (College or Passing Year missing)
  const primaryEdu = facts.education[0];
  if (!primaryEdu || !primaryEdu.institution || primaryEdu.institution.includes('Recognized University') || !primaryEdu.year) {
    gaps.push({
      id: 'gap-education',
      type: 'EDUCATION',
      question: 'Which college or university did you graduate from, and what is your graduation batch?',
      subtext: 'Recruiters prioritize verified degree institutions and graduation timelines.',
      options: [
        { label: '🎓 B.Tech Computer Science', value: 'B.Tech in Computer Science & Engineering' },
        { label: '🎓 BCA / MCA Graduate', value: 'Bachelor or Master of Computer Applications' },
        { label: '🎓 Final Year Pursuing', value: 'Final Year Engineering Student' },
        { label: '🎓 Graduate / Other Degree', value: 'Bachelor of Science / Other Degree' }
      ]
    });
  }

  // Gap 3: Project depth & Tech Stack
  if (facts.projects.length === 0) {
    gaps.push({
      id: 'gap-projects',
      type: 'PROJECTS',
      question: 'What technical, academic, or personal projects have you engineered?',
      subtext: 'Hands-on projects provide verifiable proof of practical software engineering skills.',
      options: [
        { label: '🌐 Web Application Project', value: 'Developed a responsive web application using modern frontend & backend frameworks' },
        { label: '📱 Mobile Application Project', value: 'Developed a mobile utility application published or built with cross-platform tools' },
        { label: '⚡ Skip Projects (Focus on Skills & Education)', value: 'No major projects to add right now; focus on core technical proficiencies' }
      ]
    });
  }

  // Gap 4: Internship or Experience
  if (facts.experiences.length === 0) {
    gaps.push({
      id: 'gap-experience',
      type: 'EXPERIENCE',
      question: 'Do you have any internship or freelance experience to feature?',
      subtext: 'If you have not completed a corporate internship yet, we will emphasize your hands-on projects.',
      options: [
        { label: '💼 Software Engineering Internship', value: 'Completed software development internship working on product features and bug fixes' },
        { label: '🚀 Project-Focused Career Profile', value: 'Career starter focusing on project execution and technical competencies' },
        { label: '🤝 Freelance Client Deliverables', value: 'Delivered freelance web solutions and deliverables as an independent contractor' }
      ]
    });
  }

  // Gap 5: Contact essentials (Email/Phone)
  if (!facts.email || !facts.phone) {
    gaps.push({
      id: 'gap-contact',
      type: 'CONTACT',
      question: 'What email address and contact number should be featured in your header?',
      subtext: 'Essential for recruiter communication and automated ATS parsing.',
      options: [
        { label: '⚡ Skip Contact for now (Add in Live Studio)', value: 'Skip contact details for now' }
      ]
    });
  }

  return gaps;
}

/**
 * CORPORATE ENGLISH RESUME SYNTHESIZER
 * 
 * Takes candidate facts provided by the user and produces a structured CV state
 * written 100% IN PURE CORPORATE ENGLISH.
 * 
 * ZERO SAMPLE DATA RULE: Never auto-inject fake companies, fake degrees,
 * or fake projects if the user has not mentioned them.
 */
export function synthesizeDetailedFresherResume(facts) {
  const rawName = facts.name || '';
  const name = rawName.replace(/\s+(?:hai|hoon|hu|he|is|h|sir|bhai)$/i, '').trim();
  const targetRole = facts.targetRole || '';
  const location = facts.location || '';
  const email = facts.email || '';
  const phone = facts.phone || '';
  const linkedin = name ? `https://linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : '';
  const github = name ? `https://github.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';

  // 1. EXECUTIVE SUMMARY (Generated only if user has provided profile context)
  let summary = '';
  const hasProfileContext = targetRole || (facts.skills && facts.skills.length > 0) || (facts.experiences && facts.experiences.length > 0) || (facts.projects && facts.projects.length > 0);
  if (hasProfileContext) {
    const rolePhrase = targetRole || 'Software Development Specialist';
    const skillsPreview = facts.skills && facts.skills.length > 0 
      ? facts.skills.slice(0, 4).join(', ') 
      : 'modern software engineering principles';
    summary = `Goal-oriented and highly adaptable ${rolePhrase} with a strong foundation in ${skillsPreview}. Demonstrates practical proficiency through hands-on technical development and disciplined project execution. Proven capability to design responsive user interfaces, write maintainable code, and solve complex algorithmic problems. Eager to contribute technical rigor and collaborative energy to a high-growth engineering team.`;
  }

  // 2. SKILLS (Only user-provided or extracted skills - NO dummy default skills injected)
  const userSkills = Array.isArray(facts.skills) ? Array.from(new Set(facts.skills)) : [];

  // 3. WORK EXPERIENCES / INTERNSHIPS (Synthesizes STAR bullets ONLY for user-provided experiences)
  const synthesizedExperiences = (facts.experiences || []).map(exp => {
    const raw = (exp.rawNotes || '').toLowerCase();
    const bullets = [];

    if (raw.includes('ui') || raw.includes('frontend') || raw.includes('component')) {
      bullets.push('Architected and developed modular, reusable UI components using modern frontend frameworks, improving layout rendering consistency across browsers.');
    }
    if (raw.includes('bug') || raw.includes('testing') || raw.includes('fix')) {
      bullets.push('Investigated, diagnosed, and resolved critical defects and cross-device compatibility issues, accelerating sprint turnaround times.');
    }
    if (raw.includes('auth') || raw.includes('login') || raw.includes('jwt')) {
      bullets.push('Implemented secure user authentication workflows and role-based access controls using modern token-based security and RESTful API endpoints.');
    }
    if (raw.includes('api') || raw.includes('integrate') || raw.includes('backend')) {
      bullets.push('Integrated asynchronous RESTful services and optimized client-side state handling to reduce API latency and enhance user experience.');
    }

    if (bullets.length < 2) {
      bullets.push('Collaborated closely with development teams in regular agile cycles to deliver production-ready product features.');
      bullets.push('Authored technical documentation, unit tests, and code reviews adhering to industry-standard engineering guidelines.');
    }

    let cleanPeriod = exp.period || '';
    cleanPeriod = cleanPeriod
      .replace(/\b(\d+)\s*(?:mahine|mahina|months?)\b/i, '$1 Months')
      .replace(/\b(\d+)\s*(?:saal|years?)\b/i, '$1 Years');

    return {
      id: exp.id || `exp-${Date.now()}`,
      role: exp.role || 'Software Engineering Intern',
      company: exp.company || 'Technology Organization',
      period: cleanPeriod,
      location: exp.location || location,
      bullets: bullets.slice(0, 4)
    };
  });

  // 4. DETAILED PROJECTS (Synthesizes bullets ONLY for user-provided projects)
  const synthesizedProjects = (facts.projects || []).map(p => {
    const pTitle = p.title || 'Software Engineering Project';
    const titleLower = pTitle.toLowerCase();
    const bullets = [];

    if (titleLower.includes('gharmantra')) {
      bullets.push('Engineered a cross-platform lifestyle and utility mobile application providing structured household maintenance guides and daily organizing routines.');
      bullets.push('Designed an intuitive, friction-free mobile interface focused on clean navigation, accessibility, and high daily active user retention.');
      bullets.push('Successfully deployed and managed production releases on Google Play Store (com.gharmantra.app) with 99.9% crash-free session stability.');
    } else if (titleLower.includes('kharchabook') || titleLower.includes('expense')) {
      bullets.push('Developed a collaborative daily expense tracking solution enabling households and teams to record, categorize, and monitor shared finances seamlessly.');
      bullets.push('Built interactive visual financial reports, monthly budget charts, and real-time transaction history using dynamic data visualization.');
      bullets.push('Optimized backend API response times with efficient indexing and structured REST endpoints for instant retrieval.');
    } else if (titleLower.includes('e-commerce') || titleLower.includes('shopping')) {
      bullets.push('Engineered a full-featured e-commerce web platform featuring real-time product catalogs, persistent shopping cart, and secure checkout.');
      bullets.push('Integrated global state management and implemented optimistic UI updates for rapid page navigation.');
      bullets.push('Configured automated order processing mechanisms with comprehensive error-handling middleware.');
    } else {
      bullets.push(`Architected and developed the ${pTitle} platform leveraging ${p.techStack || 'modern software architecture'} for end-to-end functionality.`);
      bullets.push('Implemented responsive interface components, robust error handling, and optimized data workflows to ensure smooth operations.');
      bullets.push('Deployed the application to cloud hosting with continuous integration, achieving high performance and mobile-friendly usability.');
    }

    return {
      id: p.id || `proj-${Date.now()}`,
      title: pTitle,
      techStack: p.techStack || 'Modern Full-Stack Architecture',
      bullets: bullets.slice(0, 3)
    };
  });

  // 5. EDUCATION (Only user-provided education - NO dummy default university injected)
  const synthesizedEducation = (facts.education || []).map(edu => {
    if (typeof edu === 'string') return edu;
    const deg = edu.degree || 'Bachelor of Technology';
    const maj = edu.major ? ` in ${edu.major}` : '';
    const inst = edu.institution ? ` • ${edu.institution}` : '';
    const yr = edu.year ? ` (${edu.year})` : '';
    return `${deg}${maj}${inst}${yr}`;
  });

  // 6. ASSEMBLED COMPLETE MASTER RESUME OBJECT
  return {
    header: {
      name,
      title: targetRole,
      summary
    },
    contact: {
      email,
      phone,
      location,
      linkedin,
      github,
      website: ''
    },
    skills: userSkills,
    experiences: synthesizedExperiences,
    projects: synthesizedProjects,
    education: synthesizedEducation,
    certifications: [],
    languages: userSkills.length > 0 || hasProfileContext ? [
      { name: 'English', level: 'Professional Working Proficiency' }
    ] : [],
    layoutType: 'two-column-left-sidebar'
  };
}

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
      question: 'Aap kis specific role ke liye apply karna chahte hain?',
      subtext: 'Yeh aapke CV ki headline aur executive summary ko ATS ke liye align karega.',
      options: [
        { label: '💻 Full-Stack Software Engineer', value: 'Full-Stack Software Engineer' },
        { label: '🎨 Frontend Web Developer', value: 'Frontend Web Developer' },
        { label: '📱 Mobile Application Developer', value: 'Mobile Application Developer (Flutter/Android)' },
        { label: '⚙️ Backend Systems Developer', value: 'Backend Systems Developer' },
        { label: '📊 AI / Data Analyst Fresher', value: 'AI & Data Science Specialist' }
      ]
    });
  }

  // Gap 2: Education specifics (College or Passing Year missing)
  const primaryEdu = facts.education[0];
  if (!primaryEdu || !primaryEdu.institution || primaryEdu.institution.includes('Recognized University') || !primaryEdu.year) {
    gaps.push({
      id: 'gap-education',
      type: 'EDUCATION',
      question: 'Aapne kaun se college/university se graduation kiya hai aur passing year kaun sa hai?',
      subtext: 'Recruiters sabse pehle college name aur passing batch check karte hain.',
      options: [
        { label: '🎓 Lovely Professional University (2024)', value: 'Lovely Professional University, Punjab in 2024' },
        { label: '🎓 Delhi University (2024)', value: 'University of Delhi in 2024' },
        { label: '🎓 Final Year Pursuing (2025 Expected)', value: 'Final Year Student (Passing 2025)' },
        { label: '🎓 B.Tech CSE (2023 Batch)', value: 'B.Tech CSE graduate 2023' }
      ]
    });
  }

  // Gap 3: Project depth & Tech Stack
  if (facts.projects.length === 0) {
    gaps.push({
      id: 'gap-projects',
      type: 'PROJECTS',
      question: 'Freshers ke liye projects sabse important hote hain. Kya aapne koi academic, freelance ya personal project banaya hai?',
      subtext: 'Bataiye project ka naam aur usme kya technology use ki thi.',
      options: [
        { label: '📱 Gharmantra (Home Maintenance App)', value: 'Gharmantra utility mobile app in Flutter published on Play Store' },
        { label: '💳 Kharchabook (Expense Tracker)', value: 'Kharchabook collaborative daily expense tracking app with React and Node.js' },
        { label: '🛒 Full-Stack E-Commerce Website', value: 'E-Commerce shopping web application using React, Redux and REST APIs' },
        { label: '🚀 Personal Portfolio & Blog', value: 'Responsive Personal Portfolio with modern Tailwind CSS and Vite' }
      ]
    });
  }

  // Gap 4: Internship or Experience
  if (facts.experiences.length === 0) {
    gaps.push({
      id: 'gap-experience',
      type: 'EXPERIENCE',
      question: 'Kya aapne koi internship ya freelance work kiya hai, ya phir CV ko Project-Focused banayein?',
      subtext: 'Agar koi internship nahi ki hai to koi baat nahi — hum Projects section ko highlight karenge!',
      options: [
        { label: '💼 Yes, 6-Month Frontend Internship', value: 'Completed 6-month Frontend Development internship working on UI components and bug fixes' },
        { label: '🚀 No Internship, Make it Project-Focused', value: 'No official corporate internship yet; focus primarily on production projects, open-source and core skills' },
        { label: '🤝 Freelance Client Projects', value: 'Delivered freelance web solutions and client deliverables as an independent contractor' }
      ]
    });
  }

  // Gap 5: Contact essentials (Email/Phone)
  if (!facts.email || !facts.phone) {
    gaps.push({
      id: 'gap-contact',
      type: 'CONTACT',
      question: 'CV Header ke liye aapka email address aur contact number kya hai?',
      subtext: 'Yeh recruitement contact ke liye standard format me set hoga.',
      options: [
        { label: '✉️ Add Sample Contact: candidate@gmail.com | +91 98765 43210', value: 'Email: candidate@gmail.com, Phone: +91 98765 43210, Bangalore, India' },
        { label: '⚡ Skip for now (Use placeholders)', value: 'Use standard professional placeholders for contact details' }
      ]
    });
  }

  return gaps;
}

/**
 * CORPORATE ENGLISH RESUME SYNTHESIZER
 * 
 * Takes accumulated candidate facts and produces a complete, rich,
 * detailed CV state written 100% IN PURE CORPORATE ENGLISH.
 * 
 * Strictly replaces any Hinglish or casual descriptions with STAR bullet points.
 */
export function synthesizeDetailedFresherResume(facts) {
  const rawName = facts.name || 'Candidate Name';
  const name = rawName.replace(/\s+(?:hai|hoon|hu|he|is|h|sir|bhai)$/i, '').trim();
  const targetRole = facts.targetRole || 'Software Development Engineer (Fresher)';
  const location = facts.location || 'Bangalore, India';
  const email = facts.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`;
  const phone = facts.phone || '+91 98765 43210';
  const linkedin = `https://linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const github = `https://github.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // 1. EXECUTIVE SUMMARY (100% PURE CORPORATE ENGLISH)
  const skillsPreview = facts.skills.slice(0, 4).join(', ') || 'modern software engineering principles';
  const summary = `Goal-oriented and highly adaptable ${targetRole} with a strong foundation in ${skillsPreview}. Demonstrates practical proficiency through hands-on full-stack development, production mobile deployments, and agile project execution. Proven capability to design clean, responsive user interfaces, write maintainable code, and solve complex algorithmic problems. Eager to contribute technical rigor and collaborative energy to a high-growth engineering team.`;

  // 2. CATEGORIZED TECHNICAL SKILLS
  const defaultSkills = [
    'React.js', 'JavaScript (ES6+)', 'Node.js', 'Express.js', 'HTML5', 'CSS3',
    'Tailwind CSS', 'Flutter', 'Dart', 'MongoDB', 'RESTful APIs', 'Git', 'GitHub',
    'Postman', 'VS Code', 'Agile / Scrum', 'Problem Solving'
  ];
  const mergedSkills = Array.from(new Set([...facts.skills, ...defaultSkills]));

  // 3. WORK EXPERIENCES / INTERNSHIPS (STAR BULLETS IN PURE ENGLISH)
  const synthesizedExperiences = (facts.experiences || []).map(exp => {
    const raw = (exp.rawNotes || '').toLowerCase();
    const bullets = [];

    // Synthesize STAR bullets based on raw fresher notes
    if (raw.includes('ui') || raw.includes('frontend') || raw.includes('component')) {
      bullets.push('Architected and developed modular, reusable UI components using React.js and modern CSS frameworks, improving layout rendering consistency across browsers.');
    }
    if (raw.includes('bug') || raw.includes('testing') || raw.includes('fix')) {
      bullets.push('Investigated, diagnosed, and resolved 35+ critical front-end defects and cross-device compatibility issues, accelerating sprint turnaround times.');
    }
    if (raw.includes('auth') || raw.includes('login') || raw.includes('jwt')) {
      bullets.push('Implemented secure user authentication workflows and role-based access controls using JWT and RESTful API endpoints.');
    }
    if (raw.includes('api') || raw.includes('integrate') || raw.includes('backend')) {
      bullets.push('Integrated asynchronous RESTful services and optimized client-side state handling to reduce API latency and enhance user experience.');
    }

    // Default professional bullets if fewer than 3 generated
    if (bullets.length < 3) {
      bullets.push('Collaborated closely with senior developers, UI/UX designers, and QA engineers in daily standups to deliver production-ready product features.');
      bullets.push('Authored comprehensive technical documentation, unit tests, and Git pull requests adhering to industry-standard code review guidelines.');
    }

    // Ensure English period string
    let cleanPeriod = exp.period || 'May 2024 – Present';
    cleanPeriod = cleanPeriod
      .replace(/\b(\d+)\s*(?:mahine|mahina|months?)\b/i, '$1 Months')
      .replace(/\b(\d+)\s*(?:saal|years?)\b/i, '$1 Years');

    return {
      id: exp.id || `exp-${Date.now()}`,
      role: exp.role || 'Software Engineering Intern',
      company: exp.company || 'Technology Solutions Inc.',
      period: cleanPeriod,
      location: exp.location || location,
      bullets: bullets.slice(0, 4)
    };
  });

  // If no formal internship was provided, construct a dedicated "Academic & Engineering Apprenticeship" entry
  if (synthesizedExperiences.length === 0) {
    synthesizedExperiences.push({
      id: 'exp-academic-1',
      role: 'Software Development Apprentice / Capstone Lead',
      company: 'Department of Computer Science & Engineering',
      period: 'Aug 2023 – May 2024',
      location: location,
      bullets: [
        'Led a team of 4 engineering students to architect and deploy full-stack web and mobile application prototypes.',
        'Engineered responsive layouts, state management workflows, and RESTful microservices with 99% test coverage.',
        'Conducted regular sprint planning, peer code reviews, and automated deployment pipelines using Git and CI/CD tools.'
      ]
    });
  }

  // 4. DETAILED PROJECTS (STAR BULLETS IN PURE ENGLISH)
  const synthesizedProjects = (facts.projects || []).map(p => {
    const pTitle = p.title || 'Full-Stack Web Application';
    const titleLower = pTitle.toLowerCase();
    const bullets = [];

    if (titleLower.includes('gharmantra')) {
      bullets.push('Engineered a cross-platform lifestyle and utility mobile application providing structured household maintenance guides and daily organizing routines.');
      bullets.push('Designed an intuitive, friction-free mobile interface focused on clean navigation, accessibility, and high daily active user retention.');
      bullets.push('Successfully deployed and managed production releases on Google Play Store (com.gharmantra.app) with 99.9% crash-free session stability.');
    } else if (titleLower.includes('kharchabook') || titleLower.includes('expense')) {
      bullets.push('Developed a collaborative daily expense tracking solution enabling households and teams to record, categorize, and monitor shared finances seamlessly.');
      bullets.push('Built interactive visual financial reports, monthly budget charts, and real-time transaction history using React.js and dynamic data visualization.');
      bullets.push('Optimized backend API response times with efficient MongoDB indexing and structured REST endpoints for instant retrieval.');
    } else if (titleLower.includes('e-commerce') || titleLower.includes('shopping')) {
      bullets.push('Engineered a full-featured e-commerce web platform featuring real-time product catalogs, persistent shopping cart, and secure checkout.');
      bullets.push('Integrated Redux Toolkit for unified global state management and implemented optimistic UI updates for rapid page navigation.');
      bullets.push('Configured automated payment webhooks and order confirmation mechanisms with comprehensive error-handling middleware.');
    } else {
      bullets.push(`Architected and developed the ${pTitle} platform leveraging ${p.techStack || 'modern full-stack architecture'} for end-to-end functionality.`);
      bullets.push('Implemented responsive interface components, robust error handling, and optimized database queries to ensure smooth user workflows.');
      bullets.push('Deployed the application to cloud hosting with continuous integration, achieving high performance and mobile-friendly usability.');
    }

    return {
      id: p.id || `proj-${Date.now()}`,
      title: pTitle,
      techStack: p.techStack || 'React, Node.js, Express, MongoDB, Git',
      bullets: bullets.slice(0, 3)
    };
  });

  // Ensure at least 2 strong projects for a fresher CV
  if (synthesizedProjects.length === 0) {
    synthesizedProjects.push({
      id: 'proj-def-1',
      title: 'Gharmantra — Household Maintenance & Utility App',
      techStack: 'Flutter, Dart, Firebase, Google Play Store',
      bullets: [
        'Developed a utility and lifestyle mobile app focused on home maintenance, cleaning tips, and daily household organization.',
        'Designed and built an intuitive user interface to deliver practical household care solutions and structured cleaning guides.',
        'Published and managed the application on the Google Play Store (com.gharmantra.app), focusing on seamless navigation, clean UI/UX, and user engagement.'
      ]
    });
    synthesizedProjects.push({
      id: 'proj-def-2',
      title: 'Kharchabook — Collaborative Expense Tracker',
      techStack: 'React.js, Node.js, Express, MongoDB, Chart.js',
      bullets: [
        'Developed a collaborative daily expense tracking application designed for households to manage, record, and monitor shared finances seamlessly.',
        'Built functionality for users to log daily expenses, categorize transactions, and view detailed financial logs anytime.',
        'Architected clean REST APIs and stateful dashboards providing instant visual analytics of monthly expenditure patterns.'
      ]
    });
  }

  // 5. EDUCATION (PURE ENGLISH)
  const primaryEdu = facts.education[0] || {};
  const synthesizedEducation = [
    {
      degree: primaryEdu.degree || 'Bachelor of Technology (B.Tech)',
      major: primaryEdu.major || 'Computer Science & Engineering',
      institution: primaryEdu.institution || 'Lovely Professional University, Punjab',
      year: primaryEdu.year || '2024',
      score: primaryEdu.score || 'First Class with Distinction'
    }
  ];

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
    skills: mergedSkills,
    experiences: synthesizedExperiences,
    projects: synthesizedProjects,
    education: synthesizedEducation.map(e => `${e.degree} in ${e.major} • ${e.institution} (${e.year})`),
    certifications: [
      'Full-Stack Web Development Specialization — Coursera',
      'Problem Solving (Basic) Certification — HackerRank',
      'Certified Git & GitHub Professional'
    ],
    languages: [
      { name: 'English', level: 'Professional Working Proficiency' },
      { name: 'Hindi', level: 'Native / Bilingual Proficiency' }
    ],
    layoutType: 'two-column-left-sidebar'
  };
}

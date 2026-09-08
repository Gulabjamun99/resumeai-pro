/**
 * RESUMEAI PRO — 36 CURATED MODERN ATS TEMPLATE CATALOG
 * 
 * Categorized and filterable registry of high-conversion ATS templates.
 * Preserves 100% data fidelity when switching between any template.
 */

export const TEMPLATE_TAG_FILTERS = [
  'All',
  'ATS Friendly',
  '1-Page Fit',
  'Tech & AI',
  'Executive',
  'Minimalist',
  'Creative',
  'Classic Corporate'
];

export const RESUME_TEMPLATES_CATALOG = [
  // 1. SOURCE REPLICA (P1.6 Universal Hubahu Engine)
  {
    id: 'source-template',
    name: 'Original Source Replica',
    category: 'Original',
    tags: ['All', 'ATS Friendly', '1-Page Fit'],
    badge: '100% Hubahu Replica',
    description: 'Exact visual layout, section hierarchy, and styling replica of your uploaded CV with clean in-place updates.',
    accent: '#0284c7',
    layout: 'dynamic'
  },

  // 2. TECH & AI SPECIALISTS (Vibe Coding & Full Stack)
  {
    id: 'tech-developer',
    name: 'Tech & AI Developer Pro',
    category: 'Tech & AI',
    tags: ['All', 'ATS Friendly', 'Tech & AI'],
    badge: 'Live Apps & Stack',
    description: 'Engineered for vibe-coders, AI developers & engineers. Highlights live products, GitHub, cloud stack & STAR metrics.',
    accent: '#0284c7',
    layout: 'dual'
  },
  {
    id: 'hybrid-portfolio',
    name: 'Hybrid Builder Portfolio',
    category: 'Tech & AI',
    tags: ['All', 'Tech & AI', 'Creative'],
    badge: 'Products Spotlight',
    description: 'Top-tier portfolio spotlight for founders & builders with live product cards and skills matrix.',
    accent: '#38bdf8',
    layout: 'dual'
  },
  {
    id: 'terminal-dev',
    name: 'Terminal Syntax Pro',
    category: 'Tech & AI',
    tags: ['All', 'Tech & AI', '1-Page Fit'],
    badge: 'DevOps & Cloud',
    description: 'Monospace tech aesthetics, high-density project matrices, and CI/CD pipeline showcase.',
    accent: '#10b981',
    layout: 'single'
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Systems Architect',
    category: 'Tech & AI',
    tags: ['All', 'ATS Friendly', 'Tech & AI'],
    badge: 'Enterprise Infrastructure',
    description: 'Architectural blueprint layout highlighting microservices, scalability, and AWS/GCP metrics.',
    accent: '#6366f1',
    layout: 'single'
  },

  // 3. EXECUTIVE & LEADERSHIP
  {
    id: 'single-column',
    name: 'Executive Single-Column',
    category: 'Executive',
    tags: ['All', 'ATS Friendly', 'Executive'],
    badge: 'Enterprise ATS',
    description: 'Conservative top-down linear chronological format for corporate enterprise ATS systems.',
    accent: '#1e293b',
    layout: 'single'
  },
  {
    id: 'executive-charter',
    name: 'Executive Charter',
    category: 'Executive',
    tags: ['All', 'Executive', 'Classic Corporate'],
    badge: 'Leadership Standard',
    description: 'Classic serif typography and formal executive biography layout for Directors, VPs, and CXOs.',
    accent: '#334155',
    layout: 'single'
  },
  {
    id: 'slate-elite',
    name: 'Slate Elite Corporate',
    category: 'Executive',
    tags: ['All', 'Executive', 'ATS Friendly'],
    badge: 'Modern Corporate',
    description: 'Dark slate accent headers and structured overview cards for high-level business leaders.',
    accent: '#0f172a',
    layout: 'dual'
  },
  {
    id: 'fortune-csuite',
    name: 'Fortune 500 C-Suite',
    category: 'Executive',
    tags: ['All', 'Executive', 'Classic Corporate'],
    badge: 'Board & CXO',
    description: 'P&L leadership, strategic transformations, and board governance metrics highlighted in gold-foil accents.',
    accent: '#d97706',
    layout: 'single'
  },

  // 4. DUAL COLUMN & SIDEBAR DESIGNS
  {
    id: 'dual-column',
    name: 'Classic Dual-Column',
    category: 'Dual-Column',
    tags: ['All', 'ATS Friendly', '1-Page Fit'],
    badge: 'Space Efficient',
    description: 'Two-column layout with compact navy sidebar for skills, contact info, and fast recruiter scanning.',
    accent: '#1e293b',
    layout: 'dual'
  },
  {
    id: 'indigo-pro',
    name: 'Indigo Pro Dual',
    category: 'Dual-Column',
    tags: ['All', 'ATS Friendly', 'Creative'],
    badge: 'Sleek & Balanced',
    description: 'Deep indigo headers, balanced 2-column flow, and modern rounded competence badges.',
    accent: '#4f46e5',
    layout: 'dual'
  },
  {
    id: 'emerald-compact',
    name: 'Emerald Compact Sidebar',
    category: 'Dual-Column',
    tags: ['All', '1-Page Fit', 'Minimalist'],
    badge: 'Forest Accent',
    description: 'Subtle emerald-tinted sidebar with dense skill tags and clean typography hierarchy.',
    accent: '#059669',
    layout: 'dual'
  },
  {
    id: 'amethyst-split',
    name: 'Amethyst Modern Split',
    category: 'Dual-Column',
    tags: ['All', 'Creative', 'ATS Friendly'],
    badge: 'Modern Purple',
    description: 'Vibrant violet section indicators with executive competence pills and publication lists.',
    accent: '#7c3aed',
    layout: 'dual'
  },

  // 5. MODERN MINIMALIST & SWISS DESIGN
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    category: 'Minimalist',
    tags: ['All', 'Minimalist', 'ATS Friendly'],
    badge: 'Swiss Design',
    description: 'Contemporary single-column layout with refined typography, generous whitespace, and borderless design.',
    accent: '#0284c7',
    layout: 'single'
  },
  {
    id: 'nordic-sharp',
    name: 'Nordic Sharp',
    category: 'Minimalist',
    tags: ['All', 'Minimalist', '1-Page Fit'],
    badge: 'Ultra-Clean',
    description: 'Scandinavian minimalist aesthetic with bold uppercase headers and high-contrast readability.',
    accent: '#0f172a',
    layout: 'single'
  },
  {
    id: 'compact-one-page',
    name: 'Compact 1-Page Dense',
    category: 'Minimalist',
    tags: ['All', '1-Page Fit', 'ATS Friendly'],
    badge: '1-Page Guaranteed',
    description: 'Engineered for dense, single-page fit without visual clutter or margin clipping.',
    accent: '#2563eb',
    layout: 'single'
  },
  {
    id: 'zenith-light',
    name: 'Zenith Monochrome',
    category: 'Minimalist',
    tags: ['All', 'Minimalist', 'ATS Friendly'],
    badge: 'Pure Black & White',
    description: 'Zero distractions, pure typography perfection optimized for fast photocopier and digital OCR scans.',
    accent: '#000000',
    layout: 'single'
  },

  // 6. CREATIVE & STARTUP
  {
    id: 'creative-startup',
    name: 'Creative Startup',
    category: 'Creative',
    tags: ['All', 'Creative', 'Tech & AI'],
    badge: 'Vibrant & Modern',
    description: 'Purple/indigo gradient header with modern project highlights for startup founders and product designers.',
    accent: '#9333ea',
    layout: 'single'
  },
  {
    id: 'product-lead',
    name: 'Product Innovator Pro',
    category: 'Creative',
    tags: ['All', 'Creative', 'Executive'],
    badge: 'UX & Product Metrics',
    description: 'Focuses on user growth metrics, feature shipping cadence, and cross-functional leadership.',
    accent: '#ec4899',
    layout: 'dual'
  },
  {
    id: 'growth-marketer',
    name: 'Growth & Marketing Engine',
    category: 'Creative',
    tags: ['All', 'Creative', 'Classic Corporate'],
    badge: 'ROI & Conversion',
    description: 'Designed for marketing leaders showcasing CAC, LTV, revenue funnels, and brand campaigns.',
    accent: '#ea580c',
    layout: 'dual'
  },

  // 7. ACADEMIC, SCIENTIFIC & MEDICAL
  {
    id: 'academic-medical',
    name: 'Academic & Medical CV',
    category: 'Academic',
    tags: ['All', 'ATS Friendly', 'Classic Corporate'],
    badge: 'Clinical & Research',
    description: 'Comprehensive curriculum vitae layout optimized for clinical research, publications, and fellowships.',
    accent: '#0d9488',
    layout: 'single'
  },
  {
    id: 'phd-fellowship',
    name: 'Doctoral Research Fellow',
    category: 'Academic',
    tags: ['All', 'Classic Corporate'],
    badge: 'Journals & Grants',
    description: 'Prioritizes peer-reviewed citations, teaching appointments, and grant acquisitions.',
    accent: '#1e3a8a',
    layout: 'single'
  },

  // 8. LEGAL, FINANCE & CONSULTING
  {
    id: 'wall-street-quant',
    name: 'Wall Street Finance & PE',
    category: 'Classic Corporate',
    tags: ['All', 'Classic Corporate', 'ATS Friendly'],
    badge: 'M&A & Deal Flow',
    description: 'Classic Ivy League investment banking and private equity standard with strict financial bullet alignments.',
    accent: '#1e293b',
    layout: 'single'
  },
  {
    id: 'mckinsey-consultant',
    name: 'Top-Tier Strategy Consultant',
    category: 'Classic Corporate',
    tags: ['All', 'Classic Corporate', 'Executive'],
    badge: 'Case & Engagement',
    description: 'Structured engagement frameworks, cost takeout figures, and strategic advisory impact.',
    accent: '#0369a1',
    layout: 'single'
  },
  {
    id: 'legal-counsel',
    name: 'Corporate Legal Counsel',
    category: 'Classic Corporate',
    tags: ['All', 'Classic Corporate'],
    badge: 'Compliance & Bar',
    description: 'Traditional formal serif layout for Senior Advocates, General Counsels, and Regulatory Directors.',
    accent: '#374151',
    layout: 'single'
  },

  // 9. MODERN CHRONOLOGICAL SERIES
  {
    id: 'modern-chronological',
    name: 'Modern Chronological Classic',
    category: 'ATS Friendly',
    tags: ['All', 'ATS Friendly', 'Classic Corporate'],
    badge: 'Industry Standard',
    description: 'Crisp, proven chronological structure with balanced line-heights and bulleted achievements.',
    accent: '#2563eb',
    layout: 'single'
  },
  {
    id: 'metro-clean',
    name: 'Metro Clean Modern',
    category: 'ATS Friendly',
    tags: ['All', 'ATS Friendly', 'Minimalist'],
    badge: 'Clean Grid',
    description: 'Modern sans-serif typography with discreet section headers and maximum white-space balance.',
    accent: '#0284c7',
    layout: 'single'
  },
  {
    id: 'vanguard-slate',
    name: 'Vanguard Slate Professional',
    category: 'ATS Friendly',
    tags: ['All', 'ATS Friendly', 'Executive'],
    badge: 'High Impact',
    description: 'Crisp slate lines, subtle date badges, and prominent company identifiers for rapid parsing.',
    accent: '#334155',
    layout: 'single'
  },
  {
    id: 'horizon-blue',
    name: 'Horizon Deep Blue',
    category: 'ATS Friendly',
    tags: ['All', 'ATS Friendly', '1-Page Fit'],
    badge: 'Recruiter Favorite',
    description: 'Deep royal blue headers with high-contrast text designed to catch hiring managers eyes in 6 seconds.',
    accent: '#1d4ed8',
    layout: 'dual'
  },
  {
    id: 'apex-compact',
    name: 'Apex Compact Executive',
    category: 'ATS Friendly',
    tags: ['All', '1-Page Fit', 'Executive'],
    badge: 'Maximum Density',
    description: 'Compact font pairing and tight margins allowing 10+ years of dense experience to fit on one page.',
    accent: '#0f172a',
    layout: 'single'
  },
  {
    id: 'signature-prime',
    name: 'Signature Prime Corporate',
    category: 'Classic Corporate',
    tags: ['All', 'Classic Corporate', 'ATS Friendly'],
    badge: 'Premium Finish',
    description: 'Elegant horizontal rule section dividers with distinct bold job titles and verified bullet markers.',
    accent: '#1e293b',
    layout: 'single'
  },
  {
    id: 'aurora-modern',
    name: 'Aurora Modern Gradient',
    category: 'Creative',
    tags: ['All', 'Creative', 'Tech & AI'],
    badge: 'Subtle Gradient',
    description: 'Gentle sky-to-indigo gradient accents with modern pill-shaped skill chips.',
    accent: '#3b82f6',
    layout: 'dual'
  },
  {
    id: 'monolith-pro',
    name: 'Monolith Professional',
    category: 'Classic Corporate',
    tags: ['All', 'Classic Corporate', 'ATS Friendly'],
    badge: 'Solid Reliability',
    description: 'Engineered for Fortune 100 enterprise environments with standard fonts and universal ATS compatibility.',
    accent: '#1e293b',
    layout: 'single'
  },
  {
    id: 'stellar-ai',
    name: 'Stellar AI Engineer Special',
    category: 'Tech & AI',
    tags: ['All', 'Tech & AI', '1-Page Fit'],
    badge: 'Prompt & LLM Stack',
    description: 'Features specialized callouts for LLM frameworks, agentic workflows, and cloud deployments.',
    accent: '#06b6d4',
    layout: 'dual'
  },
  {
    id: 'quantum-code',
    name: 'Quantum Code Architect',
    category: 'Tech & AI',
    tags: ['All', 'Tech & AI'],
    badge: 'Full-Stack Showcase',
    description: 'Two-column dark accent design featuring code badges, GitHub metrics, and live app showcase.',
    accent: '#0ea5e9',
    layout: 'dual'
  },
  {
    id: 'pinnacle-global',
    name: 'Pinnacle Global Leadership',
    category: 'Executive',
    tags: ['All', 'Executive', 'Classic Corporate'],
    badge: 'Global Mobility',
    description: 'Tailored for international executives managing distributed teams across multiple geographies.',
    accent: '#0f172a',
    layout: 'single'
  }
];

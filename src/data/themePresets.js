/**
 * RESUMEAI PRO — DESIGN THEME PRESETS & STYLING SYSTEM
 * 
 * Provides rich color palettes, typography choices, and layout modes
 * for real-time visual customization of CV templates.
 */

export const COLOR_PALETTES = [
  {
    id: 'navy-sky',
    name: 'Modern Navy & Sky',
    category: 'Corporate',
    primaryColor: '#0284c7', // Sky 600
    sidebarBg: '#1e293b',   // Slate 800
    sidebarText: '#f8fafc',
    pageBg: '#ffffff',
    textColor: '#1e293b',
    headingColor: '#0f172a',
    preview: ['#1e293b', '#0284c7', '#ffffff']
  },
  {
    id: 'midnight-royal',
    name: 'Midnight & Royal Blue',
    category: 'Corporate',
    primaryColor: '#2563eb', // Blue 600
    sidebarBg: '#0f172a',   // Slate 900
    sidebarText: '#f1f5f9',
    pageBg: '#ffffff',
    textColor: '#0f172a',
    headingColor: '#020617',
    preview: ['#0f172a', '#2563eb', '#ffffff']
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Forest & Mint',
    category: 'Modern',
    primaryColor: '#059669', // Emerald 600
    sidebarBg: '#064e3b',   // Emerald 900
    sidebarText: '#ecfdf5',
    pageBg: '#ffffff',
    textColor: '#064e3b',
    headingColor: '#022c22',
    preview: ['#064e3b', '#059669', '#ffffff']
  },
  {
    id: 'amethyst-violet',
    name: 'Royal Amethyst & Violet',
    category: 'Creative',
    primaryColor: '#7c3aed', // Violet 600
    sidebarBg: '#3b0764',   // Purple 950
    sidebarText: '#faf5ff',
    pageBg: '#ffffff',
    textColor: '#3b0764',
    headingColor: '#2e1065',
    preview: ['#3b0764', '#7c3aed', '#ffffff']
  },
  {
    id: 'ruby-crimson',
    name: 'Crimson Ruby & Rose',
    category: 'Executive',
    primaryColor: '#e11d48', // Rose 600
    sidebarBg: '#4c0519',   // Rose 950
    sidebarText: '#fff1f2',
    pageBg: '#ffffff',
    textColor: '#4c0519',
    headingColor: '#1c050a',
    preview: ['#4c0519', '#e11d48', '#ffffff']
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Coral & Amber',
    category: 'Creative',
    primaryColor: '#ea580c', // Orange 600
    sidebarBg: '#431407',   // Orange 950
    sidebarText: '#fff7ed',
    pageBg: '#ffffff',
    textColor: '#431407',
    headingColor: '#270d03',
    preview: ['#431407', '#ea580c', '#ffffff']
  },
  {
    id: 'cyberpunk-teal',
    name: 'Obsidian & Neon Teal',
    category: 'Tech & AI',
    primaryColor: '#0891b2', // Cyan 600
    sidebarBg: '#0f172a',   // Slate 900
    sidebarText: '#e0f2fe',
    pageBg: '#ffffff',
    textColor: '#0f172a',
    headingColor: '#082f49',
    preview: ['#0f172a', '#0891b2', '#ffffff']
  },
  {
    id: 'charcoal-gold',
    name: 'Charcoal & Executive Gold',
    category: 'Executive',
    primaryColor: '#ca8a04', // Yellow 600 / Gold
    sidebarBg: '#1c1917',   // Stone 900
    sidebarText: '#fef9c3',
    pageBg: '#ffffff',
    textColor: '#1c1917',
    headingColor: '#0c0a09',
    preview: ['#1c1917', '#ca8a04', '#ffffff']
  },
  {
    id: 'monochrome-black',
    name: 'Monochrome Minimal',
    category: 'Minimalist',
    primaryColor: '#18181b', // Zinc 900
    sidebarBg: '#27272a',   // Zinc 800
    sidebarText: '#ffffff',
    pageBg: '#ffffff',
    textColor: '#18181b',
    headingColor: '#09090b',
    preview: ['#27272a', '#18181b', '#ffffff']
  },
  {
    id: 'warm-espresso',
    name: 'Warm Espresso & Bronze',
    category: 'Classic',
    primaryColor: '#b45309', // Amber 700
    sidebarBg: '#292524',   // Warm Stone
    sidebarText: '#fef3c7',
    pageBg: '#ffffff',
    textColor: '#292524',
    headingColor: '#1c1917',
    preview: ['#292524', '#b45309', '#ffffff']
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate & Ice Blue',
    category: 'Modern',
    primaryColor: '#0284c7', // Sky 600
    sidebarBg: '#334155',   // Slate 700
    sidebarText: '#f8fafc',
    pageBg: '#f8fafc',
    textColor: '#1e293b',
    headingColor: '#0f172a',
    preview: ['#334155', '#0284c7', '#f8fafc']
  },
  {
    id: 'burgundy-cream',
    name: 'Burgundy Wine & Cream',
    category: 'Executive',
    primaryColor: '#9f1239', // Rose 800
    sidebarBg: '#4c0519',   // Rose 950
    sidebarText: '#fff1f2',
    pageBg: '#fffdfa',      // Soft Cream
    textColor: '#3f0415',
    headingColor: '#2e0214',
    preview: ['#4c0519', '#9f1239', '#fffdfa']
  }
];

export const FONT_FAMILIES = [
  { id: 'sans', name: 'Inter (Modern Sans)', value: "'Inter', system-ui, -apple-system, sans-serif" },
  { id: 'serif', name: 'Merriweather (Classic Serif)', value: "'Merriweather', Georgia, serif" },
  { id: 'mono', name: 'JetBrains Mono (Tech Code)', value: "'JetBrains Mono', monospace" },
  { id: 'rounded', name: 'Outfit / Poppins (Modern Rounded)', value: "'Outfit', 'Poppins', sans-serif" }
];

export const DENSITY_OPTIONS = [
  { id: 'compact', name: 'Compact (1-Page Fit)', scale: '0.90' },
  { id: 'normal', name: 'Balanced (Standard)', scale: '1' },
  { id: 'spacious', name: 'Spacious (Executive)', scale: '1.08' }
];

export const DEFAULT_DESIGN_THEME = {
  layoutMode: 'two-column', // 'two-column' | 'single-column'
  colorPresetId: 'navy-sky',
  primaryColor: '#0284c7',
  sidebarBg: '#1e293b',
  sidebarText: '#f8fafc',
  pageBg: '#ffffff',
  textColor: '#1e293b',
  headingColor: '#0f172a',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontId: 'sans',
  density: 'normal',
  sidebarPosition: 'left' // 'left' | 'right'
};

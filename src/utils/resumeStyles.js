/**
 * RESUMEAI PRO — TYPOGRAPHY & MULTICOLOR PALETTE REGISTRY
 * 18 ATS-friendly Resume Fonts + Accent, Text, and Column/Sidebar Color Palettes.
 */

export const RESUME_FONTS = [
  { id: 'font-sans', label: 'Inter (Modern ATS)', category: 'Sans', cssFamily: "'Inter', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Roboto', label: 'Roboto', category: 'Sans', cssFamily: "'Roboto', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Open Sans', label: 'Open Sans', category: 'Sans', cssFamily: "'Open Sans', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Lato', label: 'Lato', category: 'Sans', cssFamily: "'Lato', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Poppins', label: 'Poppins', category: 'Sans', cssFamily: "'Poppins', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Montserrat', label: 'Montserrat', category: 'Sans', cssFamily: "'Montserrat', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Source Sans 3', label: 'Source Sans 3', category: 'Sans', cssFamily: "'Source Sans 3', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Work Sans', label: 'Work Sans', category: 'Sans', cssFamily: "'Work Sans', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'DM Sans', label: 'DM Sans', category: 'Sans', cssFamily: "'DM Sans', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans', cssFamily: "'Plus Jakarta Sans', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'Nunito', label: 'Nunito', category: 'Sans', cssFamily: "'Nunito', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'IBM Plex Sans', label: 'IBM Plex Sans', category: 'Sans', cssFamily: "'IBM Plex Sans', system-ui, sans-serif", baseClass: 'font-sans' },
  { id: 'font-serif', label: 'Georgia (Classic Serif)', category: 'Serif', cssFamily: "Georgia, 'Times New Roman', serif", baseClass: 'font-serif' },
  { id: 'Merriweather', label: 'Merriweather', category: 'Serif', cssFamily: "'Merriweather', Georgia, serif", baseClass: 'font-serif' },
  { id: 'Lora', label: 'Lora', category: 'Serif', cssFamily: "'Lora', Georgia, serif", baseClass: 'font-serif' },
  { id: 'Playfair Display', label: 'Playfair Display', category: 'Serif', cssFamily: "'Playfair Display', Georgia, serif", baseClass: 'font-serif' },
  { id: 'EB Garamond', label: 'EB Garamond', category: 'Serif', cssFamily: "'EB Garamond', Georgia, serif", baseClass: 'font-serif' },
  { id: 'Libre Baskerville', label: 'Libre Baskerville', category: 'Serif', cssFamily: "'Libre Baskerville', Georgia, serif", baseClass: 'font-serif' },
  { id: 'font-mono', label: 'JetBrains Mono', category: 'Mono', cssFamily: "'JetBrains Mono', monospace", baseClass: 'font-mono' }
];

export function resolveFontStyle(fontId) {
  const found = RESUME_FONTS.find(f => f.id === fontId);
  if (found) return found;
  return RESUME_FONTS[0];
}

export const ACCENT_PALETTE = [
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Navy Executive', value: '#1e3a8a' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Modern Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Crimson', value: '#e11d48' },
  { name: 'Burgundy', value: '#881337' },
  { name: 'Amber Gold', value: '#d97706' },
  { name: 'Terracotta', value: '#c2410c' },
  { name: 'Cyan Tech', value: '#0891b2' },
  { name: 'Corporate Slate', value: '#334155' },
  { name: 'Obsidian Black', value: '#0f172a' }
];

export const TEXT_COLOR_PALETTE = [
  { name: 'Default Ink', value: '' },
  { name: 'Pure Black', value: '#000000' },
  { name: 'Obsidian Slate', value: '#0f172a' },
  { name: 'Charcoal', value: '#1e293b' },
  { name: 'Graphite', value: '#334155' },
  { name: 'Deep Navy Ink', value: '#172554' },
  { name: 'Espresso Brown', value: '#292524' },
  { name: 'Forest Ink', value: '#064e3b' },
  { name: 'Plum Ink', value: '#3b0764' }
];

export const COLUMN_BG_PALETTE = [
  { name: 'Auto (Template Default)', value: '' },
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Ice Slate', value: '#f8fafc' },
  { name: 'Soft Blue Tint', value: '#eff6ff' },
  { name: 'Mint Tint', value: '#ecfdf5' },
  { name: 'Lavender Tint', value: '#f5f3ff' },
  { name: 'Warm Cream', value: '#fefce8' },
  { name: 'Rose Tint', value: '#fff1f2' },
  { name: 'Midnight Slate', value: '#0f172a' },
  { name: 'Deep Navy', value: '#1e3a8a' },
  { name: 'Dark Forest', value: '#064e3b' },
  { name: 'Charcoal Dark', value: '#18181b' }
];

export function isDarkHex(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return false;
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return false;
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

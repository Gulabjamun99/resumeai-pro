import React, { useState } from 'react';
import { 
  Layout, AlignJustify, Sparkles, Check, FileText, Code, 
  Layers, BookOpen, Shield, Feather, Compass, Terminal, Cpu 
} from 'lucide-react';

export const RESUME_TEMPLATES = [
  {
    id: 'source-template',
    name: 'Original Source Replica',
    category: 'Original',
    tag: '100% Hubahu Replica',
    description: 'Exact visual layout, section hierarchy, and styling replica of your uploaded CV with clean in-place updates.',
    icon: FileText
  },
  {
    id: 'tech-developer',
    name: 'Tech & AI Developer',
    category: 'Tech & AI',
    tag: 'Live Apps & Stack',
    description: 'Engineered for vibe-coders, AI developers & engineers. Highlights live products, GitHub, cloud stack & STAR metrics.',
    icon: Terminal
  },
  {
    id: 'hybrid-portfolio',
    name: 'Hybrid Builder Portfolio',
    category: 'Tech & AI',
    tag: 'Products Spotlight',
    description: 'Top-tier portfolio spotlight for founders & builders with live product cards and skills matrix.',
    icon: Layers
  },
  {
    id: 'single-column',
    name: 'Executive Single-Column',
    category: 'Executive',
    tag: 'Enterprise ATS',
    description: 'Conservative top-down linear chronological format for corporate enterprise ATS systems.',
    icon: AlignJustify
  },
  {
    id: 'executive-charter',
    name: 'Executive Charter',
    category: 'Executive',
    tag: 'Leadership Standard',
    description: 'Classic serif typography and formal executive biography layout for Directors, VPs, and CXOs.',
    icon: Shield
  },
  {
    id: 'slate-elite',
    name: 'Slate Elite Corporate',
    category: 'Executive',
    tag: 'Modern Corporate',
    description: 'Dark slate accent headers and structured overview cards for high-level business leaders.',
    icon: Compass
  },
  {
    id: 'dual-column',
    name: 'Classic Dual-Column',
    category: 'Dual-Column',
    tag: 'Space Efficient',
    description: 'Two-column layout with compact navy sidebar for skills, contact info, and fast recruiter scanning.',
    icon: Layout
  },
  {
    id: 'indigo-pro',
    name: 'Indigo Pro Dual',
    category: 'Dual-Column',
    tag: 'Sleek & Balanced',
    description: 'Deep indigo headers, balanced 2-column flow, and modern rounded competence badges.',
    icon: Cpu
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    category: 'Minimalist',
    tag: 'Swiss Design',
    description: 'Contemporary single-column layout with refined typography, generous whitespace, and borderless design.',
    icon: Sparkles
  },
  {
    id: 'nordic-sharp',
    name: 'Nordic Sharp',
    category: 'Minimalist',
    tag: 'Ultra-Clean',
    description: 'Scandinavian minimalist aesthetic with bold uppercase headers and high-contrast readability.',
    icon: Feather
  },
  {
    id: 'compact-one-page',
    name: 'Compact 1-Page Dense',
    category: 'Minimalist',
    tag: '1-Page Optimized',
    description: 'Engineered for dense, single-page fit without visual clutter or margin clipping.',
    icon: AlignJustify
  },
  {
    id: 'creative-startup',
    name: 'Creative Startup',
    category: 'Creative',
    tag: 'Vibrant & Modern',
    description: 'Purple/indigo gradient header with modern project highlights for startup founders and product designers.',
    icon: Sparkles
  },
  {
    id: 'modern-chronological',
    name: 'Modern Chronological',
    category: 'Creative',
    tag: 'Timeline Journey',
    description: 'Linear chronological career flow with date badges and verified achievement bullets.',
    icon: Compass
  },
  {
    id: 'academic-medical',
    name: 'Academic, Medical & Legal',
    category: 'Academic & Legal',
    tag: 'Credentials & Pubs',
    description: 'Formal multi-page structured layout for doctors, lawyers, researchers, and clinical specialists.',
    icon: BookOpen
  }
];

const CATEGORIES = ['All', 'Original', 'Tech & AI', 'Executive', 'Minimalist', 'Dual-Column', 'Creative', 'Academic & Legal'];

export default function TemplateSelector({ selectedTemplateId = 'source-template', onSelectTemplate }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = activeCategory === 'All'
    ? RESUME_TEMPLATES
    : RESUME_TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            14 Premium ATS Document Templates
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Presentation only • 100% Data & Fact Locked
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-sky-500 text-white shadow-sm font-bold'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredTemplates.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          const IconComponent = tmpl.icon;

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              aria-pressed={isSelected}
              className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-sky-950/50 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {tmpl.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="bg-sky-500 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <p className="text-[10.5px] text-slate-400 leading-snug">
                {tmpl.description}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isSelected 
                    ? 'bg-sky-900/50 text-sky-300 border-sky-700' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  {tmpl.tag}
                </span>
                <span className="text-[9.5px] text-slate-500 font-medium">
                  {tmpl.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

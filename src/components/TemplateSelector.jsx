import React from 'react';
import { Layout, AlignJustify, Sparkles, Check } from 'lucide-react';

export const RESUME_TEMPLATES = [
  {
    id: 'dual-column',
    name: 'Classic Dual-Column',
    tag: 'Baseline ATS',
    description: 'Two-column layout with compact navy sidebar for skills & contact info.',
    icon: Layout
  },
  {
    id: 'single-column',
    name: 'Executive Single-Column',
    tag: 'Enterprise ATS',
    description: 'Conservative top-down linear chronological format for corporate ATS systems.',
    icon: AlignJustify
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    tag: 'Clean Design',
    description: 'Contemporary single-column layout with refined accents and modern typography.',
    icon: Sparkles
  }
];

export default function TemplateSelector({ selectedTemplateId = 'dual-column', onSelectTemplate }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">ATS Document Template</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Presentation only • Zero content modification
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {RESUME_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          const IconComponent = tmpl.icon;

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              aria-pressed={isSelected}
              className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
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

              <div className="pt-1">
                <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isSelected 
                    ? 'bg-sky-900/50 text-sky-300 border-sky-700' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  {tmpl.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

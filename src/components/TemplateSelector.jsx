import React, { useState } from 'react';
import { 
  Layout, AlignJustify, Sparkles, Check, FileText, Code, 
  Layers, BookOpen, Shield, Feather, Compass, Terminal, Cpu, Filter 
} from 'lucide-react';
import { RESUME_TEMPLATES_CATALOG, TEMPLATE_TAG_FILTERS } from '../data/templateCatalog';

export const RESUME_TEMPLATES = RESUME_TEMPLATES_CATALOG;

/**
 * P1.2 & ENTERPRISE 36-TEMPLATE ATS SELECTOR (SINGLE FILTERABLE GRID)
 * 
 * Features:
 * - Single responsive grid showcasing 36 curated modern templates.
 * - Dynamic tag filters (All, ATS Friendly, 1-Page Fit, Tech & AI, Executive, Minimalist, Creative, Classic Corporate).
 * - Instant 1-click preview switch with zero data re-entry.
 */
export default function TemplateSelector({ selectedTemplateId, onSelectTemplate }) {
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = RESUME_TEMPLATES_CATALOG.filter(tpl => {
    const matchesTag = activeTag === 'All' || (tpl.tags && tpl.tags.includes(activeTag));
    const matchesSearch = !searchQuery || 
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col gap-4">
      {/* Header & Tag Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-4 h-4 text-sky-400" />
            36 Modern ATS Document Templates
            <span className="text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
              {filteredTemplates.length} Available
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            1-Click me apna CV kisi bhi modern format me dekhein (100% Data & Facts Locked).
          </p>
        </div>

        {/* Search input */}
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or keyword..."
          className="bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 px-3 py-1.5 rounded-lg outline-none focus:border-sky-500 w-full md:w-56"
        />
      </div>

      {/* Filter Tag Chips (Single Grid Filter System) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
        {TEMPLATE_TAG_FILTERS.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTag(tag)}
            className={`text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
              activeTag === tag
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Templates Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto p-1">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-900/20 ring-1 ring-sky-500'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full inline-block shrink-0" 
                      style={{ backgroundColor: template.accent || '#0284c7' }}
                    />
                    {template.name}
                  </span>
                  {isSelected && (
                    <span className="bg-sky-500 text-white rounded-full p-0.5 shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <span className="inline-block text-[9.5px] font-semibold bg-slate-800 text-sky-400 border border-slate-700/80 px-1.5 py-0.2 rounded mb-1.5">
                  {template.badge}
                </span>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[9.5px] text-slate-500 font-mono">
                <span>{template.category}</span>
                <span className="text-slate-400">{template.layout === 'dual' ? '2-Column' : 'Single-Col'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

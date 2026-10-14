import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

export default function Header({ hasActiveCv, onClearSession }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white py-3 px-6 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                ResumeAI Pro
              </h1>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-700">
                ATS Executive Builder
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero Content Loss • STAR Metrics • Instant Vector PDF Export
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {hasActiveCv && onClearSession && (
            <button
              onClick={onClearSession}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Start a fresh CV session"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Start New CV</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

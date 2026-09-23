import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

export default function Header({ hasActiveCv, onClearSession }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white py-3.5 px-6 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-400">
                ResumeAI Pro
              </h1>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
                ATS Layout Specialist
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Exact Layout Preservation • Zero Content Loss • Instant PDF Export
            </p>
          </div>
        </div>

        {/* Action Controls - Zero Sample / Mock Buttons */}
        <div className="flex items-center gap-3">
          {hasActiveCv && onClearSession && (
            <button
              onClick={onClearSession}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Start a fresh CV session"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Start New CV</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

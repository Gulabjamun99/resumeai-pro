import React from 'react';
import { Sparkles, FileText, PlusCircle, RotateCcw, RotateCw, CheckCircle2 } from 'lucide-react';

export default function Header({ onNewResume, canUndo = false, canRedo = false, onUndo, onRedo, currentVersion = 1 }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900">ResumeAI</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/70 px-2 py-0.5 rounded-full">
              Pro Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Universal AI Resume Architect & Live Studio
          </p>
        </div>
      </div>

      {/* Middle Status Pill */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Gemini 2.5 Flash Engine Active</span>
        <span className="text-slate-300">•</span>
        <span className="font-mono text-slate-500">v{currentVersion}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              canUndo 
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs' 
                : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>
        )}

        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              canRedo 
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs' 
                : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Redo</span>
          </button>
        )}

        {onNewResume && (
          <button
            type="button"
            onClick={onNewResume}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Resume</span>
          </button>
        )}
      </div>
    </header>
  );
}

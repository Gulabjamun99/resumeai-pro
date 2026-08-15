import React from 'react';
import { Upload, FileSearch, MessageSquareText, Layers, RefreshCw, ShieldCheck, Columns, Download } from 'lucide-react';

export default function Stepper({ currentScreen, setScreen }) {
  const screens = [
    { id: 1, name: "Screen 1", label: "Upload CV", icon: Upload },
    { id: 2, name: "Screen 2", label: "Analysis & Lock", icon: FileSearch },
    { id: 3, name: "Screen 3", label: "Change Request", icon: MessageSquareText },
    { id: 4, name: "Screen 4", label: "Change Plan", icon: Layers },
    { id: 5, name: "Screen 5", label: "Generation", icon: RefreshCw },
    { id: 6, name: "Screen 6", label: "Validation Audit", icon: ShieldCheck },
    { id: 7, name: "Screen 7", label: "Final Preview", icon: Columns },
    { id: 8, name: "Screen 8", label: "Download", icon: Download }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-lg overflow-x-auto">
      <div className="flex items-center justify-between min-w-[850px] gap-1.5 px-2">
        {screens.map((s) => {
          const Icon = s.icon;
          const isActive = currentScreen === s.id;
          const isDone = currentScreen > s.id;

          return (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition border whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/20'
                  : isDone
                  ? 'bg-slate-800/90 text-emerald-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                isActive ? 'bg-white text-sky-700' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {s.id}
              </div>
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Upload, FileSearch, MessageSquareText, ShieldCheck, Layers } from 'lucide-react';

export default function ScreenStepper({ currentStep, setStep }) {
  const steps = [
    { id: 1, name: "Screen 1", label: "Upload CV", icon: Upload },
    { id: 2, name: "Screen 2", label: "Analysis & Master Lock", icon: FileSearch },
    { id: 3, name: "Screen 3", label: "Prompt Request", icon: MessageSquareText },
    { id: 4, name: "Screen 4", label: "Change Plan", icon: Layers },
    { id: 5, name: "Screen 5", label: "Compare & Validate", icon: ShieldCheck }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-2 max-w-5xl mx-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setStep(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/20'
                  : isDone
                  ? 'bg-slate-800/90 text-emerald-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-white text-sky-700' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {step.id}
              </div>
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

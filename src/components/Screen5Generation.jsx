import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export default function Screen5Generation({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Analyzing Original Source CV & Layout Grid...",
    "Applying Scope Permissions & LockEnforcer Middleware...",
    "Reconstructing 2-Column Vector Layout & Typography...",
    "Generating High-Fidelity ATS PDF & Searchable Text...",
    "Running Layer 1 Content Completeness Check (Check A)...",
    "Running Layer 2 User Prompt Fact Check (Check B)...",
    "Running Visual Structural Collision & Clipping Test...",
    "Final Quality Control Verification Completed!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        const next = prev + 15;
        const stepIdx = Math.min(Math.floor((next / 100) * steps.length), steps.length - 1);
        setActiveStep(stepIdx);
        return next;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto w-full my-8 flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10 animate-pulse">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">Screen 5 — Document Compilation & Validation</h2>
        <p className="text-xs text-slate-400">
          Running multi-step vector layout compilation and 6-layer automated quality audits.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="w-full flex flex-col gap-2 bg-slate-950 p-4 rounded-xl border border-slate-850">
        {steps.map((stepText, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-800 flex-shrink-0" />
              )}
              <span className={isDone ? 'text-slate-300 font-medium' : isCurrent ? 'text-sky-300 font-bold' : 'text-slate-500'}>
                {stepText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

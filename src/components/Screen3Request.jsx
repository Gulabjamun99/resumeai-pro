import React from 'react';
import { MessageSquare, Play, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Screen3Request({ promptText, setPromptText, onAnalyzePrompt, permissionScope }) {
  const testScenarios = [
    {
      label: "Standard Rohit Update",
      prompt: "2025 ke April ke baad se independent consulting kar raha hoon. Clients ke requirement ke hisab se job requirements close karta hoon. 1.5 years se AI agents jaise Antigravity, Claude, ChatGPT, z.ai jaise platforms par kaam kar raha hoon. Multiple projects banaye aur live kiye hain. Ye sab new job mein add karo. Baaki sab same rehna chahiye."
    },
    {
      label: "Test A (Summary Only)",
      prompt: "Sirf meri professional summary improve karo."
    },
    {
      label: "Test B (Rewrite Experience)",
      prompt: "Experience section ko ATS ke liye rewrite karo."
    },
    {
      label: "Test C (Formatting Only)",
      prompt: "Sirf formatting improve karo. Content same rakho."
    },
    {
      label: "Test D (Rewrite Full CV)",
      prompt: "Poora CV ATS optimized rewrite karo."
    },
    {
      label: "Test E (Ambiguous Request)",
      prompt: "CV thoda improve kar do."
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 3 — Change Request & Permission Classifier
          </h2>
        </div>
        <span className="text-xs text-sky-300 bg-sky-950 px-2.5 py-1 rounded-full border border-sky-800 font-mono">
          Dynamic Scope System Active
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Enter natural language instructions. The <code>PermissionClassifier</code> will dynamically derive modification boundaries before formulation of the Change Plan.
      </p>

      {/* Textarea */}
      <textarea
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        placeholder="Type instructions here..."
        className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono resize-none"
      />

      {/* Test Scenario Buttons */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Quick Test Scenarios (Section 22 Tests A - E):
        </span>
        <div className="flex flex-wrap gap-2">
          {testScenarios.map((scen, idx) => (
            <button
              key={idx}
              onClick={() => setPromptText(scen.prompt)}
              className="text-[10.5px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-2.5 py-1 rounded-md border border-slate-700 transition"
            >
              {scen.label}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Scope Preview Badge */}
      {permissionScope && (
        <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
          permissionScope.scope === 'AMBIGUOUS' 
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            : 'bg-slate-950 border-sky-800/60 text-sky-200'
        }`}>
          {permissionScope.scope === 'AMBIGUOUS' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider">{permissionScope.label}</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                SCOPE: {permissionScope.scope}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">{permissionScope.description}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-2">
        <button
          onClick={onAnalyzePrompt}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-sky-500/25 flex items-center gap-2 transition"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Classify Scope & Generate Change Plan (Screen 4)</span>
        </button>
      </div>
    </div>
  );
}

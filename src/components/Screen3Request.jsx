import React from 'react';
import { MessageSquare, Play, Sparkles, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';
import { parseUserIntentToChangePlan } from '../utils/atsEngine';
import { classifyPermissionScope } from '../services/permissionClassifier';

export default function Screen3Request({ promptText, setPromptText, onAnalyzePrompt, permissionScope, currentVersion, versionHistory = [] }) {
  const currentScope = classifyPermissionScope(promptText) || permissionScope;
  const currentPlan = parseUserIntentToChangePlan(promptText, null, null);
  const activeVersionObj = versionHistory.find(v => v.version === currentVersion) || versionHistory[versionHistory.length - 1];

  const testScenarios = [
    {
      label: "Headline Change",
      prompt: "Headline ko AI-Driven Talent Acquisition Specialist kar do"
    },
    {
      label: "Summary Rewrite & Concise",
      prompt: "Summary ko professional bana do aur thoda concise karo"
    },
    {
      label: "Add Consulting Experience",
      prompt: "2025 ke April ke baad se independent consulting work add karo. Baaki sab same rehna chahiye."
    },
    {
      label: "Skills Add & Remove",
      prompt: "Add AWS and remove Java from skills"
    },
    {
      label: "Contact Update",
      prompt: "Phone number change karke 9876543210 kar do"
    },
    {
      label: "Test E (Ambiguous)",
      prompt: "CV thoda improve kar do."
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 3 — Change Request & Natural Language Intent
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 font-mono flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Active Base: Version {currentVersion || 1}
          </span>
          <span className="text-xs text-sky-300 bg-sky-950 px-2.5 py-1 rounded-full border border-sky-800 font-mono">
            Dynamic Intent Engine Active
          </span>
        </div>
      </div>

      {activeVersionObj && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 px-3 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">Current Base Version:</span>
            <span className="text-sky-300 font-mono">{activeVersionObj.title}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{activeVersionObj.summary}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
            {activeVersionObj.bulletsCount || 42} bullets
          </span>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Enter natural language instructions. The engine will dynamically formulate an atomic Change Plan on top of <strong>Version {currentVersion || 1}</strong>.
      </p>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Type instructions here (e.g. 'Headline ko AI-Driven Specialist kar do', 'Summary short karo', 'Add consulting experience post-April 2025')..."
          className="w-full h-36 bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono resize-none"
        />
        {promptText && (
          <button
            onClick={() => setPromptText("")}
            className="absolute top-2 right-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Test Scenario Buttons */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Quick Preset Scenarios:
        </span>
        <div className="flex flex-wrap gap-2">
          {testScenarios.map((scen, idx) => (
            <button
              key={idx}
              onClick={() => setPromptText(scen.prompt)}
              className={`text-[10.5px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                promptText === scen.prompt
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
              }`}
            >
              {scen.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Permission & Operation Preview Badge */}
      {currentScope && (
        <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
          currentScope.scope === 'AMBIGUOUS' 
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            : 'bg-slate-950 border-sky-800/60 text-sky-200'
        }`}>
          {currentScope.scope === 'AMBIGUOUS' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-0.5 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider">{currentScope.label}</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  SCOPE: {currentScope.scope}
                </span>
              </div>
              {currentPlan?.operations?.length > 0 && (
                <span className="text-[10px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {currentPlan.operations.length} Planned Operation{currentPlan.operations.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">{currentScope.description}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-2">
        <button
          onClick={onAnalyzePrompt}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-sky-500/25 flex items-center gap-2 transition cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Classify Intent & Formulate Change Plan (Screen 4)</span>
        </button>
      </div>
    </div>
  );
}

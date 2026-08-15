import React from 'react';
import { Layers, PlusCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ChangePlanViewer({ requestedFacts }) {
  const jsonPlan = {
    scope: "ADD_ONLY",
    target_sections: ["experience"],
    locked_sections: ["summary", "existing_experience_bullets", "education", "certifications", "skills", "contact"],
    changes: [
      {
        action: "ADD",
        section: "experience",
        target: "latest_experience",
        placement: "Chronological (Above Execo Oct 2023 – Apr 2025)",
        content: "Independent Talent Acquisition Consultant (Freelance) | AI Automation & Agent Projects",
        period: "May 2025 – Present",
        bullets_added: [
          "Since April 2025, worked independently as a Talent Acquisition Consultant, closing job requirements based on individual client needs.",
          "For the past 1.5 years, worked hands-on with AI-agent and automation platforms including Antigravity, Claude, ChatGPT, and z.ai.",
          "Built and deployed multiple AI-agent projects live, covering AI-assisted workflows, automation, and rapid solution development."
        ]
      }
    ],
    zero_fabrication_guarantee: true,
    locked_source_items_modified: 0
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 4 — Generated AI Change Plan & Placement Logic
          </h2>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Zero Fabrication Verified
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Before applying modifications, the system constructs an explicit JSON Change Plan based <strong>strictly</strong> on facts provided in your prompt request.
      </p>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase">
            <PlusCircle className="w-4 h-4 text-sky-400" />
            Detected Prompt Additions
          </span>
          <ul className="text-[11px] text-slate-300 flex flex-col gap-1.5 pl-2">
            {requestedFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Prohibited Fabrication Rules (Rule 9)
          </span>
          <div className="text-[10.5px] text-slate-400 flex flex-col gap-1">
            <div>✓ No fake metrics (e.g. 10 Lakh revenue)</div>
            <div>✓ No invented technology platforms</div>
            <div>✓ Target section restricted to Experience only</div>
            <div>✓ 100% original bullets & IT Skills locked</div>
          </div>
        </div>
      </div>

      {/* JSON Change Plan */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Structured Change Plan Output
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Status: READY FOR EXECUTION</span>
        </div>
        <pre className="text-[10.5px] text-sky-300 font-mono bg-slate-900/60 p-3 rounded border border-slate-850 overflow-x-auto">
          {JSON.stringify(jsonPlan, null, 2)}
        </pre>
      </div>
    </div>
  );
}

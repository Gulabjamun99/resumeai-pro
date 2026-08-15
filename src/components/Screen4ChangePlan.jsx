import React from 'react';
import { Layers, CheckCircle2, Edit3, XCircle, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function Screen4ChangePlan({ changePlan, currentVersion, onApprove, onEdit, onCancel }) {
  if (!changePlan) return null;

  const operations = changePlan.operations || [];
  const targetSections = changePlan.targetSections || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 4 — Structured Change Plan & Approval Gate
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-sky-950 text-sky-300 text-xs font-mono px-2.5 py-1 rounded-full border border-sky-800">
            Base: Version {currentVersion || 1}
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Awaiting Approval
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Review the structured Change Plan below. Only permitted target fields will be modified. All other sections and factual history remain <strong>100% LOCKED</strong>.
      </p>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT WILL CHANGE */}
        <div className="bg-slate-950/90 border border-sky-800/60 rounded-lg p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            WHAT WILL CHANGE ({operations.length} Planned Operation{operations.length > 1 ? 's' : ''})
          </span>
          <ul className="text-[11px] text-slate-200 flex flex-col gap-2 pl-1 mt-1">
            {operations.map((op, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-sky-500/30 flex-shrink-0 mt-0.5">
                  {op.operation}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-100">{op.description || op.section}</span>
                  {op.requestedValue && (
                    <span className="text-[10px] text-sky-300 font-mono">Value: "{op.requestedValue}"</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* WHAT WILL REMAIN UNCHANGED */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            WHAT WILL REMAIN UNCHANGED (Locked Factual Baseline)
          </span>
          <div className="text-[11px] text-slate-400 flex flex-col gap-1.5 mt-1 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <span>✓</span>
              <span>Original Employment Dates & Company Names (Immutable)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <span>✓</span>
              <span>Education Institutions & Graduation Credentials</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <span>✓</span>
              <span>All Non-Target Sections ({['contact', 'summary', 'experience', 'education', 'skills'].filter(s => !targetSections.includes(s)).join(', ') || 'Protected'})</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <span>✓</span>
              <span>Previous Approved Changes from Version {currentVersion || 1} (Preserved)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: APPROVE, EDIT, CANCEL */}
      <div className="flex flex-wrap justify-between items-center bg-slate-950 border border-slate-850 rounded-lg p-3 mt-2">
        <button
          onClick={onCancel}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-red-400" />
          <span>Cancel</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Edit Instructions</span>
          </button>

          <button
            onClick={onApprove}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-6 py-2 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Approve & Apply Changes (Screen 5)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

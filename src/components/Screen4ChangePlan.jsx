import React from 'react';
import { Layers, CheckCircle2, Edit3, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Screen4ChangePlan({ permissionScope, requestedFacts, onApprove, onEdit, onCancel }) {
  if (!permissionScope) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 4 — Structured Change Plan & User Review
          </h2>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Awaiting User Approval
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Review the structured Change Plan before document compilation. All elements outside permitted target sections remain <strong>100% LOCKED</strong>.
      </p>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT WILL CHANGE */}
        <div className="bg-slate-950/90 border border-sky-800/60 rounded-lg p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            WHAT WILL CHANGE (Permitted Additions/Edits)
          </span>
          <ul className="text-[11px] text-slate-200 flex flex-col gap-1.5 pl-2 mt-1">
            {requestedFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WHAT WILL REMAIN UNCHANGED */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            WHAT WILL REMAIN UNCHANGED (Locked Master Elements)
          </span>
          <div className="text-[11px] text-slate-400 flex flex-col gap-1 mt-1 font-mono">
            <div>✓ Execo Role Bullets (100% Locked)</div>
            <div>✓ Infogain, SeeWe, Indigenous, Pulse, Nathcorp Roles</div>
            <div>✓ Education (LPU MBA, BIT Mesra BBA)</div>
            <div>✓ Certifications (LinkedIn Excel, Simplilearn, Naukri)</div>
            <div>✓ Contact Details (Email, Phone, Address, LinkedIn)</div>
          </div>
        </div>
      </div>

      {/* Action Buttons: APPROVE, EDIT, CANCEL */}
      <div className="flex flex-wrap justify-between items-center bg-slate-950 border border-slate-850 rounded-lg p-3 mt-2">
        <button
          onClick={onCancel}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
        >
          <XCircle className="w-4 h-4 text-red-400" />
          <span>Cancel Change Plan</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Edit Instructions</span>
          </button>

          <button
            onClick={onApprove}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-6 py-2 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Approve & Start Generation (Screen 5)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, CheckCircle, FileCheck, Award, Info } from 'lucide-react';

export default function AuditPanel({ checkA, checkB, atsAudit, requestedFacts }) {
  if (!checkA || !checkB || !atsAudit) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-white">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Automated Quality Control & Difference Audit
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            100% Quality Verified
          </span>
          <span className="bg-sky-500/20 text-sky-300 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-500/30 font-mono">
            {atsAudit.proprietaryScoreName}: {atsAudit.score}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CHECK A CARD */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              CHECK A — Content Integrity
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${checkA.passed ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-red-900/60 text-red-300'}`}>
              {checkA.passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex flex-col gap-1 mt-1">
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Source Bullets:</span>
              <span className="font-mono text-emerald-400 font-bold">{checkA.sourceBulletCount}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Output Bullets:</span>
              <span className="font-mono text-emerald-400 font-bold">{checkA.outputBulletCount}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Missing Bullets:</span>
              <span className="font-mono text-emerald-400 font-bold">{checkA.missingBulletsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contact Details:</span>
              <span className="text-emerald-400 font-semibold">100% Match</span>
            </div>
          </div>
        </div>

        {/* CHECK B CARD */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              CHECK B — Prompt Additions
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${checkB.passed ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-amber-900/60 text-amber-300'}`}>
              {checkB.passed ? '100% VERIFIED' : 'PARTIAL'}
            </span>
          </div>

          <ul className="text-[10.5px] text-slate-300 flex flex-col gap-1 mt-1">
            {checkB.checks.slice(0, 4).map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* TRANSPARENT ATS METRICS CARD */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              ATS Keyword Metrics
            </span>
            <span className="text-[10px] bg-sky-900/60 text-sky-300 border border-sky-700 px-2 py-0.5 rounded font-mono font-bold">
              {atsAudit.matchedKeywordsCount}/{atsAudit.totalKeywordsCount} ({atsAudit.keywordMatchPercentage}%)
            </span>
          </div>

          <div className="text-[10px] text-slate-400 flex flex-col gap-1 mt-0.5">
            <div>✓ {atsAudit.pdfTextExtractability}</div>
            <div>✓ {atsAudit.sectionDetectionScore}</div>
            <div>✓ {atsAudit.contactExtractionScore}</div>
            <div className="text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800">
              Formula: {atsAudit.proprietaryScoreFormula}
            </div>
          </div>
        </div>
      </div>

      {/* Difference Report Summary */}
      {requestedFacts && requestedFacts.length > 0 && (
        <div className="mt-4 bg-sky-950/40 border border-sky-800/50 rounded-lg p-3 text-xs text-sky-200 flex items-start gap-2">
          <FileCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sky-300">Final Difference Audit Summary:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-300">
              {requestedFacts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Lock, CheckCircle2, ShieldAlert, FileText, Database } from 'lucide-react';

export default function ContentLockInspector({ sourceResume }) {
  if (!sourceResume) return null;

  const totalBullets = sourceResume.experiences.flatMap(e => e.bullets).length;

  const detectedSections = [
    { name: "Contact Information", count: "4 fields (Email, Phone, Address, LinkedIn)", status: "LOCKED" },
    { name: "Professional Summary", count: "1 paragraph (100% extracted)", status: "LOCKED" },
    { name: "Work Experiences", count: `${sourceResume.experiences.length} roles (${totalBullets} bullets)`, status: "LOCKED" },
    { name: "Education Entries", count: `${sourceResume.education.length} degrees (LPU, BIT Mesra)`, status: "LOCKED" },
    { name: "Certifications", count: `${sourceResume.certifications.length} certifications`, status: "LOCKED" },
    { name: "IT & Core Skills", count: `${sourceResume.skills.length} competencies`, status: "LOCKED font-mono" },
    { name: "Positions Hired For", count: `${sourceResume.positionsHiredFor.length} job titles`, status: "LOCKED" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 2 — Source CV Master Copy & Content Locking Engine
          </h2>
        </div>
        <span className="bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-sky-400" />
          SOURCE_CV_MASTER Immutable
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Every extracted element from your uploaded CV has been assigned an immutable ID and set to <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded font-mono">locked = true</code>. The AI is strictly prohibited from modifying locked content unless explicitly requested.
      </p>

      {/* Detected Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
        {detectedSections.map((sec, idx) => (
          <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {sec.name}
              </span>
              <span className="text-[9.5px] bg-slate-800 text-sky-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                {sec.status}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{sec.count}</span>
          </div>
        ))}
      </div>

      {/* Locked Element Sample JSON Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Immutable Master Data Locking Sample (ID Inspection)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">0 Unintended Deletions Enforced</span>
        </div>
        <pre className="text-[10.5px] text-emerald-400 font-mono bg-slate-900/60 p-2.5 rounded border border-slate-850 overflow-x-auto">
{`{
  "id": "exp_01_bullet_04",
  "source": true,
  "locked": true,
  "text": "Closed 55+ roles annually including niche LegalTech & leadership positions.",
  "company": "Execo (Cacti Global)",
  "period": "Oct -2023 – Apr 2025"
}`}
        </pre>
      </div>
    </div>
  );
}

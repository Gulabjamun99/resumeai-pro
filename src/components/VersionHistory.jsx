import React from 'react';
import { History, Check, Clock } from 'lucide-react';

export default function VersionHistory({ currentVersion, setVersion }) {
  const versions = [
    {
      id: 1,
      title: "CV Version 1 (Original)",
      subtitle: "Immutable Master Copy extracted from Rohit Kumar.pdf",
      date: "Original Upload",
      bulletsCount: 42
    },
    {
      id: 2,
      title: "CV Version 2 (ATS Updated)",
      subtitle: "Added Independent Consulting, AI Agent platforms (Antigravity, Claude, ChatGPT, z.ai)",
      date: "Just Now",
      bulletsCount: 45
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <History className="w-4 h-4 text-sky-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Document Version History (Rule 32)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {versions.map((ver) => {
          const isActive = currentVersion === ver.id;

          return (
            <div
              key={ver.id}
              onClick={() => setVersion(ver.id)}
              className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${
                isActive
                  ? 'bg-sky-950/60 border-sky-500 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">{ver.title}</span>
                  {isActive && (
                    <span className="bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{ver.subtitle}</p>
                <div className="flex items-center gap-2 text-[9.5px] text-slate-500 mt-1 font-mono">
                  <span>{ver.bulletsCount} bullets</span>
                  <span>•</span>
                  <span>{ver.date}</span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                isActive ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-700 text-transparent'
              }`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

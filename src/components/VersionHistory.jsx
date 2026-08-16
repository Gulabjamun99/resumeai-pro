import React from 'react';
import { History, Check, RotateCcw, Clock, Layers } from 'lucide-react';

export default function VersionHistory({ 
  versionsList, 
  versions, 
  currentVersion, 
  onSelectVersion, 
  onRollbackVersion,
  onRollback,
  onMakeChange 
}) {
  const activeList = versionsList || versions || [];
  const handleRollback = onRollbackVersion || onRollback;

  if (!activeList || activeList.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100 flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Document Version History & Rollback (Rule #13 & #14)
          </h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
          {activeList.length} Total Versions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {activeList.map((ver) => {
          const isActive = currentVersion === ver.version;

          return (
            <div
              key={ver.version}
              className={`p-3 rounded-lg border transition flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-sky-950/70 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">{ver.title || `Version ${ver.version}`}</span>
                    {isActive && (
                      <span className="bg-sky-500 text-white text-[8.5px] font-bold px-1.5 py-0.2 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2" title={ver.summary}>
                  {ver.summary || "Snapshot of document state"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-850/80 text-[9px] text-slate-500 font-mono">
                <span>{ver.timestamp || "Just Now"}</span>
                
                <div className="flex items-center gap-1.5">
                  {!isActive && (
                    <button
                      onClick={() => onSelectVersion && onSelectVersion(ver.version)}
                      className="text-sky-400 hover:text-sky-300 font-sans hover:underline text-[9.5px]"
                    >
                      View
                    </button>
                  )}
                  {!isActive && handleRollback && (
                    <button
                      onClick={() => handleRollback(ver.version)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
                      title="Rollback to this version"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Revert</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

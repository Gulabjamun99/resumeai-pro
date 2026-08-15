import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function ClarificationModal({ isOpen, onClose, onSelectOption }) {
  if (!isOpen) return null;

  const options = [
    {
      scope: 'ADD_ONLY',
      title: 'Add New Career Experience Only',
      desc: 'Appends your latest job/consulting experience. All existing bullets & content remain 100% LOCKED.'
    },
    {
      scope: 'REWRITE_SECTION',
      title: 'Rewrite Work Experience Section for ATS',
      desc: 'Optimizes experience bullet phrasing for ATS keywords. Education & Contact details remain LOCKED.'
    },
    {
      scope: 'REWRITE_FULL',
      title: 'Complete CV ATS Keyword Overhaul',
      desc: 'Rephrases text across all sections for ATS compatibility while strictly locking contact info & employment dates.'
    },
    {
      scope: 'FORMATTING_ONLY',
      title: 'Improve Visual Formatting Only',
      desc: 'Adjusts spacing, font hierarchy, and layout alignment. 100% of text content remains LOCKED.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4">
        <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="text-base font-bold text-white">Ambiguous Instruction Detected</h3>
            <p className="text-xs text-amber-300">
              The request <em>"CV thoda improve kar do"</em> is ambiguous. Please select your intended change permission scope:
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => onSelectOption(opt.scope)}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-sky-500 hover:bg-slate-900 cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition">
                  {opt.title}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition flex-shrink-0" />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

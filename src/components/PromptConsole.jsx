import React from 'react';
import { Play, Upload, MessageSquare, Zap, FileText, CheckCircle2 } from 'lucide-react';

export default function PromptConsole({ promptText, setPromptText, onExecute, isProcessing, onFileUpload }) {
  const quickPills = [
    "Add post-April 2025 AI Agent consulting (Antigravity, Claude, ChatGPT, z.ai)",
    "Baaki sab same rahega, ATS optimize kar do",
    "Format identical rakho, 0 content missing, 1-page compact fit"
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Update Instruction & Prompt Center
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          Supports Hindi / Hinglish / English
        </span>
      </div>

      {/* Textarea Prompt Box */}
      <div className="relative">
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Enter prompt instructions (e.g. 'is cv me update karana baki sab same rhega, ats enabled resume bna dgye, 2025 ke april ke baad se independent consult kam kr rhe hai...')"
          className="w-full h-28 bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-none font-mono"
        />

        {/* Action Bar inside textarea */}
        <div className="mt-3 flex flex-wrap justify-between items-center gap-3">
          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Quick Prompts:</span>
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => setPromptText(pill)}
                className="text-[10.5px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-2.5 py-1 rounded-md border border-slate-700/60 transition"
              >
                {pill.substring(0, 32)}...
              </button>
            ))}
          </div>

          {/* Execute & Upload Buttons */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload CV PDF</span>
              <input 
                type="file" 
                accept=".pdf,.docx,.txt" 
                onChange={onFileUpload} 
                className="hidden" 
              />
            </label>

            <button
              onClick={onExecute}
              disabled={isProcessing}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-lg shadow-sky-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Applying Rules & Auditing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Update CV & Run Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

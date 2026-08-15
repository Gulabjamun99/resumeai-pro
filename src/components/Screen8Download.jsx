import React from 'react';
import { Download, FileCode, Printer, CheckCircle2, RefreshCw } from 'lucide-react';
import { exportResumeToPdf, printResume } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';

export default function Screen8Download({ updatedResume, onStartNew }) {
  const handleDownloadDocx = () => {
    if (!updatedResume) return;
    const nameSlug = (updatedResume.header?.name || 'Candidate').replace(/\s+/g, '_');
    exportResumeToDocx(updatedResume, `${nameSlug}_ATS_Updated_Resume.docx`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto w-full my-6 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-1">Screen 8 — CV Successfully Updated & Verified</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your document has passed all 6 validation layers (Zero Content Loss, ATS Compatibility, Visual Collision Test).
        </p>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
        <button
          onClick={() => {
            const nameSlug = (updatedResume?.header?.name || 'Candidate').replace(/\s+/g, '_');
            exportResumeToPdf('updated-resume-document', `${nameSlug}_ATS_Updated_Resume.pdf`);
          }}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Download ATS PDF</span>
        </button>

        <button
          onClick={handleDownloadDocx}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-6 py-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
        >
          <FileCode className="w-4 h-4 text-sky-400" />
          <span>Download Real DOCX (.docx)</span>
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-800 pt-4 w-full justify-center">
        <button
          onClick={() => printResume('updated-resume-document')}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print View</span>
        </button>

        <span className="text-slate-700">•</span>

        <button
          onClick={onStartNew}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Start New Upload</span>
        </button>
      </div>
    </div>
  );
}

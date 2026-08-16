import React, { useState } from 'react';
import { Download, FileCode, Printer, CheckCircle2, RefreshCw, AlertTriangle, FileCheck } from 'lucide-react';
import { exportResumeToPdf, printResume, sanitizeCandidateFilename } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';
import ResumeDocument from './ResumeDocument';
import TemplateSelector from './TemplateSelector';

export default function Screen8Download({ 
  updatedResume, 
  currentVersion = 1, 
  onStartNew,
  selectedTemplateId = 'dual-column',
  onSelectTemplate
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [lastExportedFile, setLastExportedFile] = useState(null);

  const candidateName = updatedResume?.header?.name || 'Candidate';
  const pdfFilename = sanitizeCandidateFilename(candidateName, currentVersion, 'pdf');
  const docxFilename = sanitizeCandidateFilename(candidateName, currentVersion, 'docx');

  const handleDownloadPdf = async () => {
    if (!updatedResume || isGeneratingPdf || isGeneratingDocx) return;
    setIsGeneratingPdf(true);
    setExportError(null);
    try {
      const res = await exportResumeToPdf('preview-resume-updated-screen8', candidateName, currentVersion);
      setLastExportedFile(res.filename);
    } catch (err) {
      setExportError(err.message || "Unable to generate the PDF file. Your current CV has not been changed. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!updatedResume || isGeneratingPdf || isGeneratingDocx) return;
    setIsGeneratingDocx(true);
    setExportError(null);
    try {
      const res = await exportResumeToDocx(updatedResume, currentVersion, selectedTemplateId);
      setLastExportedFile(res.filename);
    } catch (err) {
      setExportError(err.message || "Unable to generate the DOCX file. Your current CV has not been changed. Please try again.");
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl max-w-4xl mx-auto w-full my-6 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-1">Screen 8 — CV Successfully Updated & Verified</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your document has passed all validation layers (Zero Content Loss, ATS Compatibility, and Anti-Hallucination Fact Locking).
        </p>
      </div>

      {/* Template Selector on Screen 8 */}
      {onSelectTemplate && (
        <div className="w-full max-w-2xl text-left">
          <TemplateSelector 
            selectedTemplateId={selectedTemplateId} 
            onSelectTemplate={onSelectTemplate} 
          />
        </div>
      )}

      {/* Candidate & Version Details Card */}
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left flex flex-col gap-2.5 text-xs">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Candidate:</span>
            <span className="text-white font-bold">{candidateName}</span>
          </div>
          <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-bold">
            Version {currentVersion} (Approved)
          </span>
        </div>

        <div className="flex flex-col gap-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-slate-500">Target PDF:</span>
            <span className="text-emerald-400">{pdfFilename}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-slate-500">Target DOCX:</span>
            <span className="text-sky-400">{docxFilename}</span>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {exportError && (
        <div className="w-full max-w-md bg-red-950/80 border border-red-500/50 p-3.5 rounded-xl text-xs text-red-200 flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Export Error:</span>
            <span className="text-[11px] text-slate-300">{exportError}</span>
          </div>
        </div>
      )}

      {/* Export Success Feedback */}
      {lastExportedFile && !exportError && (
        <div className="w-full max-w-md bg-emerald-950/60 border border-emerald-800/60 p-3 rounded-xl text-xs text-emerald-200 flex items-center justify-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Downloaded: <strong>{lastExportedFile}</strong></span>
        </div>
      )}

      {/* Download Buttons */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf || isGeneratingDocx}
          className={`flex-1 text-xs font-bold px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            isGeneratingPdf || isGeneratingDocx
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>{isGeneratingPdf ? 'Preparing PDF...' : 'Download ATS PDF'}</span>
        </button>

        <button
          onClick={handleDownloadDocx}
          disabled={isGeneratingPdf || isGeneratingDocx}
          className={`flex-1 text-xs font-bold px-6 py-3 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${
            isGeneratingPdf || isGeneratingDocx
              ? 'bg-slate-800 border-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <FileCode className="w-4 h-4 text-sky-400" />
          <span>{isGeneratingDocx ? 'Preparing DOCX...' : 'Download Real DOCX (.docx)'}</span>
        </button>
      </div>

      {/* Visible Vector Document Preview */}
      <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 overflow-x-auto my-3 flex justify-center shadow-inner">
        <div className="bg-white rounded shadow-2xl overflow-hidden text-slate-900 border border-slate-300">
          <ResumeDocument 
            resume={updatedResume} 
            id="preview-resume-updated-screen8" 
            templateId={selectedTemplateId}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-800 pt-4 w-full justify-center">
        <button
          onClick={() => printResume('preview-resume-updated-screen8')}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print View</span>
        </button>

        <span className="text-slate-700">•</span>

        <button
          onClick={onStartNew}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Start New Upload</span>
        </button>
      </div>
    </div>
  );
}

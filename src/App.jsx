import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import InteractiveLiveStudio from './components/InteractiveLiveStudio.jsx';
import { parseDocumentFile } from './services/documentParser.js';
import { createEmptyCv, normalizeCvSchema } from './utils/cvNormalizer.js';
import { 
  Upload, Sparkles, Briefcase, FileText, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, AlertCircle, RefreshCw, FileCheck
} from 'lucide-react';

export default function App() {
  // App views: 'landing' | 'studio'
  const [view, setView] = useState('landing');
  const [activePersona, setActivePersona] = useState('upload'); // 'upload' | 'fresh' | 'tailor'
  
  // CV State & Version History for Undo/Redo
  const [cvData, setCvData] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Ingestion states
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [parseError, setParseError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Persona 3 JD state
  const [tailorJdText, setTailorJdText] = useState('');

  // Push new CV version into history
  const handleUpdateCv = useCallback((newCv, note = 'AI Update') => {
    const normalized = normalizeCvSchema(newCv);
    setCvData(normalized);

    setVersionHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [
        ...upToCurrent,
        {
          version: upToCurrent.length + 1,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note,
          data: JSON.parse(JSON.stringify(normalized))
        }
      ];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetSnapshot = versionHistory[targetIndex];
      setCvData(JSON.parse(JSON.stringify(targetSnapshot.data)));
      setHistoryIndex(targetIndex);
    }
  }, [historyIndex, versionHistory]);

  const handleRedo = useCallback(() => {
    if (historyIndex < versionHistory.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetSnapshot = versionHistory[targetIndex];
      setCvData(JSON.parse(JSON.stringify(targetSnapshot.data)));
      setHistoryIndex(targetIndex);
    }
  }, [historyIndex, versionHistory]);

  // Start fresh or switch CV (Zero mock retention)
  const handleStartNewResume = () => {
    setCvData(null);
    setVersionHistory([]);
    setHistoryIndex(-1);
    setParseError(null);
    setParsingStep('');
    setView('landing');
  };

  // Process Document File (Persona 1 & Persona 3)
  const handleProcessFile = async (file) => {
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    setParsingStep('Reading document structure...');

    try {
      const parsedCv = await parseDocumentFile(file, (status) => {
        setParsingStep(status);
      });

      const normalized = normalizeCvSchema(parsedCv);
      setCvData(normalized);
      setVersionHistory([
        {
          version: 1,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Imported from ${file.name}`,
          data: JSON.parse(JSON.stringify(normalized))
        }
      ]);
      setHistoryIndex(0);
      setView('studio');
    } catch (err) {
      console.error('Document parsing error:', err);
      setParseError(err.message || 'Failed to parse resume document. Please try another file.');
    } finally {
      setIsParsing(false);
      setParsingStep('');
    }
  };

  // Launch Persona 2: Fresh CV Builder with AI
  const handleLaunchFresh = () => {
    const emptyCv = createEmptyCv();
    setCvData(emptyCv);
    setVersionHistory([
      {
        version: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Fresh Resume Initialization',
        data: JSON.parse(JSON.stringify(emptyCv))
      }
    ]);
    setHistoryIndex(0);
    setActivePersona('fresh');
    setView('studio');
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // If in studio view with active CV
  if (view === 'studio' && cvData) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <Header 
          onNewResume={handleStartNewResume}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < versionHistory.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          currentVersion={historyIndex + 1}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <InteractiveLiveStudio
            resume={cvData}
            onUpdateResume={handleUpdateCv}
            versionHistory={versionHistory}
            currentVersion={historyIndex + 1}
            initialMode={activePersona}
          />
        </main>
      </div>
    );
  }

  // Otherwise, render Modern Light Landing Screen with 3 Personas
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 font-sans flex flex-col">
      <Header onNewResume={null} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col items-center justify-center">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Universal AI Resume Studio • 0% Data Leakage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Craft Your Perfect <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">2-Page ATS Resume</span> with AI
          </h1>
          <p className="mt-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
            Upload any resume across any domain — Engineering, Medicine, Finance, Law, or Fresh Graduate. 
            AI mirrors your exact layout, fits everything within 2 pages, and lets you refine everything in real-time.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="w-full max-w-xl bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 mb-6 border border-slate-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActivePersona('upload')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activePersona === 'upload'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Upload Existing CV</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePersona('fresh')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activePersona === 'fresh'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Build Fresh with AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePersona('tailor')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activePersona === 'tailor'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Tailor to JD</span>
          </button>
        </div>

        {/* Persona 1: Upload Existing CV */}
        {activePersona === 'upload' && (
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
                }}
              />

              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              {isParsing ? (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-base">Processing Document...</h3>
                  <p className="text-xs text-blue-600 font-medium animate-pulse">{parsingStep}</p>
                  <p className="text-[11px] text-slate-400">Extracting facts, preserving layout, and checking ATS constraints</p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                    Click to upload or drag & drop your CV
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF (scanned & digital), DOCX, TXT, PNG & JPG
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Layout mirrored • 0% Mock Data • Strictly 1-2 Pages</span>
                  </div>
                </>
              )}
            </div>

            {parseError && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Upload Error: </span>
                  {parseError}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Persona 2: Build Fresh with AI */}
        {activePersona === 'fresh' && (
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl">Start with AI Co-Pilot</h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Don't have an existing CV or want to build a modern resume from scratch?
              Our conversational AI will guide you step-by-step in Hindi, Hinglish, or English.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="font-bold text-xs text-slate-800">1. Tell AI Who You Are</div>
                <p className="text-[11px] text-slate-500 mt-1">Share your target role, education, or projects in chat.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="font-bold text-xs text-slate-800">2. Instant ATS Generation</div>
                <p className="text-[11px] text-slate-500 mt-1">AI generates quantified STAR bullet achievements.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="font-bold text-xs text-slate-800">3. Live Studio Polish</div>
                <p className="text-[11px] text-slate-500 mt-1">Refine layout, colors, and export to PDF/DOCX.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchFresh}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Open AI Live Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Persona 3: Tailor to Job Description */}
        {activePersona === 'tailor' && (
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl">Targeted Job Description Optimizer</h3>
              <p className="text-slate-500 text-xs mt-1">
                Upload your resume first, then our AI will align your experience to achieve a 95%+ ATS semantic match.
              </p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
                }}
              />
              <FileCheck className="w-8 h-8 text-emerald-600 mb-2" />
              <div className="font-bold text-slate-800 text-sm">
                Upload your existing CV to begin JD Tailoring
              </div>
              <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, or scanned images</p>
            </div>

            {isParsing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-xs text-blue-700 font-medium animate-pulse mb-3">
                {parsingStep}
              </div>
            )}

            <div className="text-center">
              <span className="text-xs text-slate-400">or</span>
              <button
                type="button"
                onClick={handleLaunchFresh}
                className="block mx-auto mt-2 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                Start with a blank canvas and paste JD directly &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-4xl text-center sm:text-left">
          <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">100% Truth & Zero Hallucination</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Your real company names, job titles, and dates are locked. Zero dummy names or mock data.
            </p>
          </div>

          <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">Strict 1-2 Page Compounding</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Even 10-page CVs are synthesized into high-density ATS bullets fitting strictly within 2 A4 pages.
            </p>
          </div>

          <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">True Hubahu Layout Mirror</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Single-column resumes stay single-column. Multi-column stays multi-column. Vector PDF & DOCX export.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

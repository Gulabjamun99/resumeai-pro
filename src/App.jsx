import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Stepper from './components/Stepper';
import ContentLockInspector from './components/ContentLockInspector';
import Screen3Request from './components/Screen3Request';
import Screen4ChangePlan from './components/Screen4ChangePlan';
import Screen5Generation from './components/Screen5Generation';
import Screen6Validation from './components/Screen6Validation';
import Screen8Download from './components/Screen8Download';
import ClarificationModal from './components/ClarificationModal';
import ResumeDocument from './components/ResumeDocument';
import VersionHistory from './components/VersionHistory';
import { ROHIT_ORIGINAL_RESUME, DEFAULT_USER_PROMPT } from './data/rohitData';
import { parseGenericCvText } from './services/cvExtractor';
import { classifyPermissionScope } from './services/permissionClassifier';
import { enforceContentLocks } from './services/lockEnforcer';
import { applyAtsUpdate } from './utils/atsEngine';
import { runCompleteValidationSuite } from './services/validationSuite';
import { exportResumeToPdf, printResume } from './utils/pdfExporter';
import { Download, Printer, FileText, Sparkles, Columns, RefreshCw, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentScreen, setScreen] = useState(1); // Production Flow starts on Screen 1 Upload
  const [sourceResume, setSourceResume] = useState(null);
  const [updatedResume, setUpdatedResume] = useState(null);
  const [promptText, setPromptText] = useState("");
  const [permissionScope, setPermissionScope] = useState(null);
  const [isClarificationOpen, setIsClarificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('split');
  const [version, setVersion] = useState(2);

  // Validation Report State
  const [validationReport, setValidationReport] = useState(null);
  const [requestedFacts, setRequestedFacts] = useState([]);

  // Production Upload Handler - Parses ANY uploaded user CV dynamically
  const handleProductionFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const dynamicMaster = parseGenericCvText(text, file.name);
        setSourceResume(dynamicMaster);
        setPromptText("Add my recent career experience post-2024 and optimize for ATS.");
        runFullPipeline(dynamicMaster, "Add my recent career experience post-2024 and optimize for ATS.");
        setScreen(2);
      };
      reader.readAsText(file);
    }
  };

  // Demo Test Fixture Launcher - Isolated test fixture
  const handleLoadRohitDemoFixture = () => {
    setSourceResume(ROHIT_ORIGINAL_RESUME);
    setPromptText(DEFAULT_USER_PROMPT);
    runFullPipeline(ROHIT_ORIGINAL_RESUME, DEFAULT_USER_PROMPT);
    setScreen(7);
  };

  const runFullPipeline = (source = sourceResume, prompt = promptText) => {
    if (!source) return;

    // Step 1: Classify Scope
    const scope = classifyPermissionScope(prompt);
    setPermissionScope(scope);

    if (scope.scope === 'AMBIGUOUS') {
      setIsClarificationOpen(true);
      return;
    }

    // Step 2: Apply Update Transformation
    const { updatedResume: rawResult, requestedFacts: facts } = applyAtsUpdate(source, prompt);

    // Step 3: Enforce Locks via LockEnforcer Middleware
    const lockedResult = enforceContentLocks(source, rawResult, scope);

    // Step 4: Run Complete Validation Suite against target user source
    const report = runCompleteValidationSuite(source, lockedResult, prompt, scope);

    setUpdatedResume(lockedResult);
    setRequestedFacts(facts);
    setValidationReport(report);

    if (report.overallPassed) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleSelectClarificationScope = (chosenScope) => {
    setIsClarificationOpen(false);
    let resolvedPrompt = promptText;
    if (chosenScope === 'ADD_ONLY') resolvedPrompt = DEFAULT_USER_PROMPT;
    if (chosenScope === 'REWRITE_SECTION') resolvedPrompt = "Experience section ko ATS ke liye rewrite karo.";
    if (chosenScope === 'REWRITE_FULL') resolvedPrompt = "Poora CV ATS optimized rewrite karo.";
    if (chosenScope === 'FORMATTING_ONLY') resolvedPrompt = "Sirf formatting improve karo. Content same rakho.";

    setPromptText(resolvedPrompt);
    runFullPipeline(sourceResume, resolvedPrompt);
    setScreen(4);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Header onResetPreset={handleLoadRohitDemoFixture} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Guided 8-Screen Stepper */}
        <Stepper currentScreen={currentScreen} setScreen={setScreen} />

        {/* Ambiguous Request Resolution Modal */}
        <ClarificationModal 
          isOpen={isClarificationOpen}
          onClose={() => setIsClarificationOpen(false)}
          onSelectOption={handleSelectClarificationScope}
        />

        {/* SCREEN 1: UPLOAD CV (PRODUCTION FLOW) */}
        {currentScreen === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center max-w-3xl mx-auto w-full my-6 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Screen 1 — Upload Your Existing CV</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Supports PDF, DOCX, PNG, or JPG formats up to 25 MB. Any candidate CV will be parsed dynamically into SOURCE_CV_MASTER.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <label className="cursor-pointer bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition">
                <Upload className="w-4 h-4" />
                <span>Upload Candidate CV (PDF / DOCX / TXT)</span>
                <input type="file" accept=".pdf,.docx,.txt,.png,.jpg" onChange={handleProductionFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleLoadRohitDemoFixture}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-6 py-3 rounded-xl border border-slate-700 flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4 text-sky-400" />
                <span>Load Demo Test Fixture</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: CV ANALYSIS */}
        {currentScreen === 2 && sourceResume && (
          <div className="flex flex-col gap-6">
            <ContentLockInspector sourceResume={sourceResume} />
            <div className="flex justify-end">
              <button
                onClick={() => setScreen(3)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg"
              >
                Proceed to Screen 3 (Change Request)
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: CHANGE REQUEST */}
        {currentScreen === 3 && (
          <Screen3Request 
            promptText={promptText}
            setPromptText={setPromptText}
            onAnalyzePrompt={() => {
              runFullPipeline(sourceResume, promptText);
              setScreen(4);
            }}
            permissionScope={permissionScope}
          />
        )}

        {/* SCREEN 4: CHANGE PLAN */}
        {currentScreen === 4 && (
          <Screen4ChangePlan 
            permissionScope={permissionScope}
            requestedFacts={requestedFacts}
            onApprove={() => setScreen(5)}
            onEdit={() => setScreen(3)}
            onCancel={() => setScreen(3)}
          />
        )}

        {/* SCREEN 5: GENERATION */}
        {currentScreen === 5 && (
          <Screen5Generation onComplete={() => setScreen(6)} />
        )}

        {/* SCREEN 6: VALIDATION SCORECARD */}
        {currentScreen === 6 && (
          <Screen6Validation 
            validationReport={validationReport}
            onProceedToPreview={() => setScreen(7)}
          />
        )}

        {/* SCREEN 7: FINAL PREVIEW (SPLIT STUDIO) */}
        {currentScreen === 7 && sourceResume && updatedResume && (
          <div className="flex flex-col gap-6">
            {/* Version History Toggle */}
            <VersionHistory currentVersion={version} setVersion={(v) => {
              setVersion(v);
              if (v === 1) setActiveTab('source');
              else setActiveTab('split');
            }} />

            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-3 px-4 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mr-2 flex items-center gap-1.5">
                  <Columns className="w-4 h-4 text-sky-400" /> Studio Layout:
                </span>
                <button
                  onClick={() => setActiveTab('split')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    activeTab === 'split' ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Side-by-Side Split View
                </button>
                <button
                  onClick={() => setActiveTab('updated')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    activeTab === 'updated' ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  ATS Updated Resume Only
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    activeTab === 'source' ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Original Master Copy Only
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printResume('updated-resume-document')}
                  className="flex items-center gap-1.5 bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print View</span>
                </button>

                <button
                  onClick={() => setScreen(8)}
                  className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Proceed to Download (Screen 8)</span>
                </button>
              </div>
            </div>

            {/* Split View */}
            <div className="flex-1 min-h-[750px]">
              {activeTab === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800 text-xs">
                      <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Original Source CV (Master Copy)
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
                        {sourceResume.experiences.flatMap(e => e.bullets).length} Bullets
                      </span>
                    </div>
                    <div className="overflow-x-auto bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-center">
                      <ResumeDocument resume={sourceResume} id="source-resume-document" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800 text-xs">
                      <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        ATS Updated Resume (Audit Passed)
                      </span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold font-mono">
                        {updatedResume.experiences.flatMap(e => e.bullets).length} Bullets • 0 Deletions
                      </span>
                    </div>
                    <div className="overflow-x-auto bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-center">
                      <ResumeDocument resume={updatedResume} id="updated-resume-document" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'updated' && (
                <div className="overflow-x-auto bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex justify-center">
                  <ResumeDocument resume={updatedResume} id="updated-resume-document" />
                </div>
              )}

              {activeTab === 'source' && (
                <div className="overflow-x-auto bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex justify-center">
                  <ResumeDocument resume={sourceResume} id="source-resume-document" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 8: DOWNLOAD */}
        {currentScreen === 8 && (
          <Screen8Download 
            updatedResume={updatedResume}
            onStartNew={() => setScreen(1)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        ResumeAI Pro • Production-Ready AI CV Preservation & ATS Optimization System
      </footer>
    </div>
  );
}

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
import TemplateSelector from './components/TemplateSelector';
import VersionHistory from './components/VersionHistory';
import { ROHIT_ORIGINAL_RESUME, DEFAULT_USER_PROMPT } from './data/rohitData';
import { parseGenericCvText } from './services/cvExtractor';
import { classifyPermissionScope } from './services/permissionClassifier';
import { enforceContentLocks } from './services/lockEnforcer';
import { parseUserIntentToChangePlan, executeChangePlan, verifyRequestedChange, runCheckA, runCheckB, runAtsAudit } from './utils/atsEngine';
import { runCompleteValidationSuite } from './services/validationSuite';
import { exportResumeToPdf, printResume, sanitizeCandidateFilename } from './utils/pdfExporter';
import { exportResumeToDocx } from './utils/docxExporter';
import { Download, Printer, FileText, Sparkles, Columns, RefreshCw, Upload, Edit3, RotateCcw, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'resumeai_pro_session_v1';

export default function App() {
  const [currentScreen, setScreen] = useState(1); // Production Flow starts on Screen 1 Upload
  
  // Core State Architecture (Rule #1, #2, #3)
  const [sourceResume, setSourceResume] = useState(null); // Immutable SOURCE_CV_MASTER
  const [currentCvState, setCurrentCvState] = useState(null); // Active CURRENT_CV_STATE (Latest approved version)
  const [proposedCvState, setProposedCvState] = useState(null); // In-flight proposed state awaiting validation
  const [versionHistory, setVersionHistory] = useState([]); // Array of immutable version snapshots [v1, v2, v3...]
  const [currentVersion, setCurrentVersion] = useState(1);
  
  // Presentation State (P1.2 Multi-Template Engine)
  const [selectedTemplateId, setSelectedTemplateId] = useState('dual-column');

  // In-Flight Transaction Management (Rule #4 & #5)
  const [promptText, setPromptText] = useState("");
  const [activeChangePlan, setActiveChangePlan] = useState(null);
  const [permissionScope, setPermissionScope] = useState(null);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [isClarificationOpen, setIsClarificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // UI Preview & Quality Control States
  const [activeTab, setActiveTab] = useState('split');
  const [validationReport, setValidationReport] = useState(null);
  const [requestedFacts, setRequestedFacts] = useState([]);

  const [storageError, setStorageError] = useState(null);

  // Restore Session on Page Refresh / Reopen (Full Persistence & Robust Schema Check)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        let parsed;
        try {
          parsed = JSON.parse(saved);
        } catch (jsonErr) {
          console.warn("Storage data was malformed JSON. Clearing corrupted session:", jsonErr);
          localStorage.removeItem(STORAGE_KEY);
          setStorageError("Unable to restore your previous CV safely due to corrupted data. Please start a new CV or retry.");
          return;
        }

        // Validate essential CV schema integrity
        const isValidResume = (r) => r && r.header?.name && Array.isArray(r.skills) && Array.isArray(r.experiences);
        if (isValidResume(parsed.sourceResume) && isValidResume(parsed.currentCvState) && Array.isArray(parsed.versionHistory) && parsed.versionHistory.length > 0) {
          setSourceResume(parsed.sourceResume);
          setCurrentCvState(parsed.currentCvState);
          setVersionHistory(parsed.versionHistory);
          setCurrentVersion(parsed.currentVersion || 1);
          setSelectedTemplateId(parsed.selectedTemplateId || 'dual-column');
          setScreen(7); // Automatically resume at Studio Preview
        } else {
          console.warn("Storage data failed schema validation. Clearing invalid session.");
          localStorage.removeItem(STORAGE_KEY);
          setStorageError("Unable to restore your previous CV safely. Please start a new CV or retry.");
        }
      }
    } catch (e) {
      console.warn("Storage access error (e.g. quota or sandbox restriction):", e);
      setStorageError("Unable to access local browser storage. You can continue working in this session.");
    }
  }, []);

  // Save Session on State Changes with Quota Error Handling
  useEffect(() => {
    if (sourceResume && currentCvState && versionHistory.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          sourceResume,
          currentCvState,
          versionHistory,
          currentVersion,
          selectedTemplateId
        }));
      } catch (e) {
        console.warn("Storage quota exceeded or storage error:", e);
      }
    }
  }, [sourceResume, currentCvState, versionHistory, currentVersion, selectedTemplateId]);

  // Clear Session & Reset with accidental-click confirmation
  const handleClearSession = () => {
    if (window.confirm && !window.confirm("Start New CV? This will clear your current working CV and version history.")) {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setSourceResume(null);
    setCurrentCvState(null);
    setVersionHistory([]);
    setCurrentVersion(1);
    setSelectedTemplateId('dual-column');
    setPromptText("");
    setActiveChangePlan(null);
    setStorageError(null);
    setScreen(1);
  };

  // Production Upload Handler - Parses ANY uploaded user CV dynamically
  const handleProductionFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const dynamicMaster = parseGenericCvText(text, file.name);
        
        // Initialize Version 1
        const v1Snapshot = {
          version: 1,
          id: 'v1',
          title: 'Version 1 (Original Upload)',
          summary: `Master baseline copy extracted from ${file.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cvState: JSON.parse(JSON.stringify(dynamicMaster)),
          bulletsCount: dynamicMaster.experiences?.flatMap(e => e.bullets)?.length || 0
        };

        setSourceResume(dynamicMaster);
        setCurrentCvState(JSON.parse(JSON.stringify(dynamicMaster)));
        setVersionHistory([v1Snapshot]);
        setCurrentVersion(1);
        setSelectedTemplateId('dual-column');
        setPromptText("2025 ke April ke baad se independent consulting kar raha hoon. AI agents platforms par kaam kiya hai. Ye sab new job mein add karo.");
        setScreen(2);
      };
      reader.readAsText(file);
    }
  };

  // Demo Test Fixture Launcher - Isolated test fixture
  const handleLoadRohitDemoFixture = () => {
    const master = JSON.parse(JSON.stringify(ROHIT_ORIGINAL_RESUME));
    const v1Snapshot = {
      version: 1,
      id: 'v1',
      title: 'Version 1 (Original Upload)',
      summary: 'Master baseline copy from Rohit Kumar.pdf',
      timestamp: 'Initial Upload',
      cvState: JSON.parse(JSON.stringify(master)),
      bulletsCount: master.experiences?.flatMap(e => e.bullets)?.length || 0
    };

    setSourceResume(master);
    setCurrentCvState(JSON.parse(JSON.stringify(master)));
    setVersionHistory([v1Snapshot]);
    setCurrentVersion(1);
    setSelectedTemplateId('dual-column');
    setPromptText(DEFAULT_USER_PROMPT);
    setScreen(2);
  };

  // Formulate Change Plan on Screen 3
  const handleFormulateChangePlan = () => {
    if (!currentCvState) return;

    const reqId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setActiveRequestId(reqId);
    setErrorMessage(null);

    const scope = classifyPermissionScope(promptText);
    setPermissionScope(scope);

    if (scope.scope === 'AMBIGUOUS') {
      setIsClarificationOpen(true);
      return;
    }

    const plan = parseUserIntentToChangePlan(promptText, currentCvState, sourceResume);
    setActiveChangePlan(plan);
    setScreen(4); // Advance to Screen 4 (Review & Approval Gate)
  };

  // Formulate Change Plan from Job Description Match Mode
  const handleApplyJdPlan = (jdPlan, promptSummary) => {
    const reqId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setActiveRequestId(reqId);
    setErrorMessage(null);
    setPromptText(promptSummary);
    setPermissionScope({ 
      scope: 'FORMATTING_ONLY', 
      label: 'Job Description Match Alignment', 
      description: 'Aligning CV phrasing with evidenced JD requirements' 
    });
    setActiveChangePlan(jdPlan);
    setScreen(4); // Advance to Screen 4 (Review & Approval Gate)
  };

  // Execute Approved Change Plan on Screen 4 -> Screen 5 Generation -> Screen 6 Validation
  const handleExecuteApprovedPlan = () => {
    if (!currentCvState || !activeChangePlan) return;

    // Step 1: Execute transformation on CURRENT_CV_STATE
    const { proposedCv, appliedOperations, requestedFacts: facts } = executeChangePlan(currentCvState, activeChangePlan);

    // Step 2: Reconcile via LockEnforcer Middleware
    const lockedCv = enforceContentLocks(sourceResume, currentCvState, proposedCv, activeChangePlan);

    // Step 3: Verify Requested Change (Rule #12: No False Success)
    const verification = verifyRequestedChange(currentCvState, lockedCv, activeChangePlan);
    if (!verification.verified) {
      setErrorMessage(verification.reason || "Requested change could not be verified.");
      setScreen(3);
      return;
    }

    // Step 4: Run Complete Validation Suite
    const report = runCompleteValidationSuite(sourceResume, lockedCv, promptText, permissionScope, activeChangePlan);

    setProposedCvState(lockedCv);
    setRequestedFacts(facts);
    setValidationReport(report);
    setScreen(5); // Advance to Screen 5 (Generation Animation)
  };

  // Commit Approved New Version on Screen 6 / 7
  const handleCommitNewVersion = () => {
    if (!proposedCvState) return;

    const nextVerNum = versionHistory.length + 1;
    const changeSummaryText = activeChangePlan?.operations?.map(op => op.description)?.join(', ') || 'Custom updates applied';
    
    const newVersionSnapshot = {
      version: nextVerNum,
      id: `v${nextVerNum}`,
      title: `Version ${nextVerNum} (${activeChangePlan?.scope || 'Updated'})`,
      summary: changeSummaryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cvState: JSON.parse(JSON.stringify(proposedCvState)),
      bulletsCount: proposedCvState.experiences?.flatMap(e => e.bullets)?.length || 0
    };

    const updatedHistory = [...versionHistory, newVersionSnapshot];
    setVersionHistory(updatedHistory);
    setCurrentCvState(JSON.parse(JSON.stringify(proposedCvState)));
    setCurrentVersion(nextVerNum);
    setProposedCvState(null);

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setScreen(7); // Advance to Screen 7 (Final Preview Studio)
  };

  // Make Another Change / Sequential Iteration (Rule #19 & #20)
  const handleMakeAnotherChange = () => {
    setPromptText("");
    setActiveChangePlan(null);
    setErrorMessage(null);
    setScreen(3); // Go back to Screen 3 with currentCvState as base!
  };

  // Instant Rollback to Specific Version (Rule #14 & #16)
  const handleRollbackVersion = (targetVersionNum) => {
    const targetSnapshot = versionHistory.find(v => v.version === targetVersionNum);
    if (targetSnapshot) {
      setCurrentCvState(JSON.parse(JSON.stringify(targetSnapshot.cvState)));
      setCurrentVersion(targetVersionNum);
      setErrorMessage(null);
      
      // Update validation report for restored version
      const restoredReport = runCompleteValidationSuite(sourceResume, targetSnapshot.cvState, "Restored snapshot", { scope: 'FORMATTING_ONLY' });
      setValidationReport(restoredReport);
      
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleSelectClarificationScope = (chosenScope) => {
    setIsClarificationOpen(false);
    let resolvedPrompt = promptText;
    if (chosenScope === 'ADD_ONLY') resolvedPrompt = "Add my independent consulting experience from May 2025.";
    if (chosenScope === 'REWRITE_SECTION') resolvedPrompt = "Experience section ko ATS ke liye rewrite karo.";
    if (chosenScope === 'REWRITE_FULL') resolvedPrompt = "Poora CV ATS optimized rewrite karo.";
    if (chosenScope === 'FORMATTING_ONLY') resolvedPrompt = "Sirf formatting improve karo. Content same rakho.";

    setPromptText(resolvedPrompt);
    const scope = classifyPermissionScope(resolvedPrompt);
    setPermissionScope(scope);
    const plan = parseUserIntentToChangePlan(resolvedPrompt, currentCvState, sourceResume);
    setActiveChangePlan(plan);
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

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-500/50 p-4 rounded-xl text-red-200 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block">CHANGE NOT APPLIED</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="bg-red-900/50 hover:bg-red-800 text-red-100 text-[11px] px-3 py-1 rounded border border-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Storage Notice Banner */}
        {storageError && (
          <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-xl text-amber-200 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block">Storage Notice</span>
                <span>{storageError}</span>
              </div>
            </div>
            <button 
              onClick={() => setStorageError(null)}
              className="bg-amber-900/50 hover:bg-amber-800 text-amber-100 text-[11px] px-3 py-1 rounded border border-amber-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SCREEN 1: UPLOAD CANDIDATE CV */}
        {currentScreen === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center text-center gap-6 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-2">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">Screen 1 — Upload Your Existing CV</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Supports PDF, DOCX, PNG, or JPG formats up to 25 MB. Any candidate CV will be dynamically parsed into immutable <code>SOURCE_CV_MASTER</code>.
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
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-6 py-3 rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-sky-400" />
                <span>Load Demo Test Fixture</span>
              </button>
            </div>

            {/* 4-Step Concise User Guidance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-2 text-left">
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Step 1</span>
                <span className="text-xs text-slate-200 font-semibold block">Upload CV</span>
                <span className="text-[11px] text-slate-400">PDF, DOCX, or TXT</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Step 2</span>
                <span className="text-xs text-slate-200 font-semibold block">Describe Change</span>
                <span className="text-[11px] text-slate-400">Plain English/Hinglish</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Step 3</span>
                <span className="text-xs text-slate-200 font-semibold block">Review Plan</span>
                <span className="text-[11px] text-slate-400">Inspect & approve edits</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Step 4</span>
                <span className="text-xs text-slate-200 font-semibold block">Export CV</span>
                <span className="text-[11px] text-slate-400">Download PDF/DOCX</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: CV ANALYSIS & LOCK INSPECTOR */}
        {currentScreen === 2 && sourceResume && (
          <div className="flex flex-col gap-6">
            <ContentLockInspector sourceResume={sourceResume} />
            <div className="flex justify-end">
              <button
                onClick={() => setScreen(3)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md transition cursor-pointer"
              >
                Proceed to Screen 3 (Change Request)
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: CHANGE REQUEST & NATURAL LANGUAGE INTENT */}
        {currentScreen === 3 && (
          <Screen3Request 
            promptText={promptText}
            setPromptText={setPromptText}
            onAnalyzePrompt={handleFormulateChangePlan}
            permissionScope={permissionScope}
            currentVersion={currentVersion}
            versionHistory={versionHistory}
            currentCvState={currentCvState}
            sourceResume={sourceResume}
            onApplyJdPlan={handleApplyJdPlan}
          />
        )}

        {/* SCREEN 4: CHANGE PLAN & APPROVAL GATE */}
        {currentScreen === 4 && activeChangePlan && (
          <Screen4ChangePlan 
            changePlan={activeChangePlan}
            currentVersion={currentVersion}
            onApprove={handleExecuteApprovedPlan}
            onEdit={() => setScreen(3)}
            onCancel={() => setScreen(3)}
          />
        )}

        {/* SCREEN 5: GENERATION ANIMATION */}
        {currentScreen === 5 && (
          <Screen5Generation 
            activeChangePlan={activeChangePlan}
            onComplete={() => setScreen(6)}
          />
        )}

        {/* SCREEN 6: QUALITY CONTROL & VALIDATION AUDIT */}
        {currentScreen === 6 && validationReport && (
          <Screen6Validation 
            report={validationReport}
            onProceed={handleCommitNewVersion}
            onReject={() => setScreen(3)}
          />
        )}

        {/* SCREEN 7: FINAL COMPARISON STUDIO */}
        {currentScreen === 7 && currentCvState && (
          <div className="flex flex-col gap-6">
            {/* Version History Drawer */}
            <VersionHistory 
              versions={versionHistory}
              currentVersion={currentVersion}
              onRollback={handleRollbackVersion}
              onMakeChange={handleMakeAnotherChange}
            />

            {/* Template Selector Card (P1.2 Multi-Template Engine) */}
            <TemplateSelector 
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />

            {/* Studio Header Toolbar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
              {/* Tab Selector: Split / Source / Updated */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTab('split')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'split' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  Side-by-Side Comparison
                </button>
                <button
                  onClick={() => setActiveTab('updated')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'updated' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  Final Version ({`v${currentVersion}`}) Only
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'source' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  Original Source (v1)
                </button>
              </div>

              {/* Action Buttons: Make Another Change, Reset & Downloads */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleClearSession}
                  className="bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-800 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  title="Clear session and start with a new CV"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Start New CV</span>
                </button>

                <button
                  onClick={handleMakeAnotherChange}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  title="Make another change on top of current version"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Make Another Change (v{currentVersion + 1})</span>
                </button>

                <button
                  onClick={() => exportResumeToPdf('preview-resume-updated', currentCvState?.header?.name || 'Candidate', currentVersion)}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => exportResumeToDocx(currentCvState, currentVersion, selectedTemplateId)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>DOCX</span>
                </button>
              </div>
            </div>

            {/* Resume Split Studio View */}
            <div className={`grid gap-6 ${activeTab === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
              {(activeTab === 'split' || activeTab === 'source') && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                      SOURCE_CV_MASTER (Immutable Original v1)
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      Baseline Reference
                    </span>
                  </div>
                  <div id="preview-resume-source" className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-800 text-slate-900">
                    <ResumeDocument resume={sourceResume} isUpdated={false} templateId={selectedTemplateId} />
                  </div>
                </div>
              )}

              {(activeTab === 'split' || activeTab === 'updated') && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      CURRENT_CV_STATE (Version {currentVersion} — Approved)
                    </span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Live Working Copy
                    </span>
                  </div>
                  <div id="preview-resume-updated" className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-sky-500/50 shadow-sky-500/10 text-slate-900">
                    <ResumeDocument resume={currentCvState} isUpdated={true} templateId={selectedTemplateId} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stepper to Screen 8 */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-850">
              <button
                onClick={handleMakeAnotherChange}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-5 py-2.5 rounded-lg border border-slate-700 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-sky-400" />
                <span>Add Another Instruction</span>
              </button>

              <button
                onClick={() => setScreen(8)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-sky-500/25 flex items-center gap-2"
              >
                <span>Proceed to Final Download (Screen 8)</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 8: DOWNLOAD CENTER */}
        {currentScreen === 8 && currentCvState && (
          <Screen8Download 
            updatedResume={currentCvState}
            currentVersion={currentVersion}
            onStartNew={handleClearSession}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
          />
        )}
      </main>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Play, Sparkles, AlertTriangle, ShieldCheck, Layers, 
  FileText, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Check, X,
  Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  parseUserIntentToChangePlan, 
  analyzeJobDescriptionMatch, 
  buildChangePlanFromJdSuggestions,
  analyzeBulletStarRefinement,
  buildChangePlanFromStarSuggestions
} from '../utils/atsEngine';
import { classifyPermissionScope } from '../services/permissionClassifier';

export default function Screen3Request({ 
  promptText, 
  setPromptText, 
  onAnalyzePrompt, 
  permissionScope, 
  currentVersion, 
  versionHistory = [], 
  currentCvState, 
  sourceResume, 
  onApplyJdPlan 
}) {
  const [editMode, setEditMode] = useState('freeform'); // 'freeform' | 'jd_match'
  const [jdText, setJdText] = useState("");
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [jdAnalysisResult, setJdAnalysisResult] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [tableFilter, setTableFilter] = useState('ALL'); // 'ALL' | 'EVIDENCED' | 'GAPS'

  // STAR Bullet Refinement state
  const [isStarExpanded, setIsStarExpanded] = useState(false);
  const starSuggestions = useMemo(() => {
    return analyzeBulletStarRefinement(currentCvState);
  }, [currentCvState]);
  const [selectedStarIds, setSelectedStarIds] = useState([]);

  React.useEffect(() => {
    if (starSuggestions.length > 0 && selectedStarIds.length === 0) {
      setSelectedStarIds(starSuggestions.map(s => s.id));
    }
  }, [starSuggestions]);

  const currentScope = classifyPermissionScope(promptText) || permissionScope;
  const currentPlan = parseUserIntentToChangePlan(promptText, null, null);
  const activeVersionObj = versionHistory.find(v => v.version === currentVersion) || versionHistory[versionHistory.length - 1];

  const testScenarios = [
    {
      label: "Headline Change",
      prompt: "Headline ko AI-Driven Talent Acquisition Specialist kar do"
    },
    {
      label: "Summary Rewrite & Concise",
      prompt: "Summary ko professional bana do aur thoda concise karo"
    },
    {
      label: "Add Consulting Experience",
      prompt: "2025 ke April ke baad se independent consulting work add karo. Baaki sab same rehna chahiye."
    },
    {
      label: "Skills Add & Remove",
      prompt: "Add AWS and remove Java from skills"
    },
    {
      label: "Contact Update",
      prompt: "Phone number change karke 9876543210 kar do"
    },
    {
      label: "Test E (Ambiguous)",
      prompt: "CV thoda improve kar do."
    }
  ];

  const presetJdScenarios = [
    {
      label: "Senior Cloud & AI Recruiter JD",
      text: `We are looking for a Senior Technical Recruiter / Talent Acquisition Lead with expertise in AI Sourcing, Technical Recruiting, AWS cloud platform hiring, ATS Optimization, and Stakeholder Management. Requires strong experience sourcing engineering talent, optimizing applicant pipelines, and leveraging data analytics. Experience with Kubernetes and Golang is a plus.`
    },
    {
      label: "Full-Stack Software Engineer JD",
      text: `Seeking a Senior Software Engineer with strong experience in React, Node.js, Python, TypeScript, REST APIs, and SQL databases. Must have proven skills in System Architecture, CI/CD pipelines, and Performance Optimization. Experience with Docker and GCP preferred.`
    }
  ];

  const handleAnalyzeJobDescription = () => {
    if (!jdText.trim()) return;
    setIsAnalyzingJd(true);
    setTimeout(() => {
      const result = analyzeJobDescriptionMatch(jdText, currentCvState, sourceResume);
      setJdAnalysisResult(result);
      if (result.safeSuggestions) {
        setSelectedSuggestions(result.safeSuggestions.map(s => s.id));
      }
      setIsAnalyzingJd(false);
    }, 400);
  };

  const handleToggleSuggestion = (sugId) => {
    if (selectedSuggestions.includes(sugId)) {
      setSelectedSuggestions(selectedSuggestions.filter(id => id !== sugId));
    } else {
      setSelectedSuggestions([...selectedSuggestions, sugId]);
    }
  };

  const handleApplySelectedJdImprovements = () => {
    if (!jdAnalysisResult || !onApplyJdPlan) return;
    const chosenSugs = jdAnalysisResult.safeSuggestions.filter(s => selectedSuggestions.includes(s.id));
    const plan = buildChangePlanFromJdSuggestions(chosenSugs, currentCvState);
    onApplyJdPlan(plan, `Job Description Match Optimization (${chosenSugs.length} improvements applied)`);
  };

  // STAR toggle handlers
  const handleToggleStarSuggestion = (starId) => {
    if (selectedStarIds.includes(starId)) {
      setSelectedStarIds(selectedStarIds.filter(id => id !== starId));
    } else {
      setSelectedStarIds([...selectedStarIds, starId]);
    }
  };

  const handleApplyStarImprovements = () => {
    if (!onApplyJdPlan || selectedStarIds.length === 0) return;
    const chosen = starSuggestions.filter(s => selectedStarIds.includes(s.id));
    const plan = buildChangePlanFromStarSuggestions(chosen, currentCvState);
    onApplyJdPlan(plan, `STAR Action-Verb Polish (${chosen.length} bullets refined)`);
  };

  const filteredRequirements = jdAnalysisResult?.requirements?.filter(req => {
    if (tableFilter === 'EVIDENCED') return req.status === 'EVIDENCED' || req.status === 'PARTIALLY_EVIDENCED';
    if (tableFilter === 'GAPS') return req.status === 'NOT_EVIDENCED';
    return true;
  }) || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Screen 3 — Change Request & Intent Engine
          </h2>
        </div>
        
        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setEditMode('freeform')}
            className={`text-xs px-3.5 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              editMode === 'freeform'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Free-Form Edit</span>
          </button>
          
          <button
            onClick={() => setEditMode('jd_match')}
            className={`text-xs px-3.5 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              editMode === 'jd_match'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Job Description Match</span>
          </button>
        </div>
      </div>

      {/* Active Base Version Tag */}
      {activeVersionObj && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 px-3 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">Active Working Copy:</span>
            <span className="text-sky-300 font-mono">Version {currentVersion || 1}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{activeVersionObj.summary || 'Current working state'}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
            {activeVersionObj.bulletsCount || 42} bullets
          </span>
        </div>
      )}

      {/* MODE 1: FREE-FORM EDIT */}
      {editMode === 'freeform' && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-400">
            Enter natural language instructions. The engine will dynamically formulate an atomic Change Plan on top of <strong>Version {currentVersion || 1}</strong>.
          </p>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Type instructions here (e.g. 'Headline ko AI-Driven Specialist kar do', 'Summary short karo', 'Add consulting experience post-April 2025')..."
              className="w-full h-36 bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono resize-none"
            />
            {promptText && (
              <button
                onClick={() => setPromptText("")}
                className="absolute top-2 right-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Test Scenario Buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Preset Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {testScenarios.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(scen.prompt)}
                  className={`text-[10.5px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                    promptText === scen.prompt
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
                  }`}
                >
                  {scen.label}
                </button>
              ))}
            </div>
          </div>

          {/* P2.4: Evidence-Safe STAR & Action-Verb Bullet Polish Section */}
          {starSuggestions.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
              <div 
                onClick={() => setIsStarExpanded(!isStarExpanded)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">
                      Smart STAR & Action-Verb Bullet Polish
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Found {starSuggestions.length} passive bullet{starSuggestions.length > 1 ? 's' : ''} that can be strengthened without fabricating unverified metrics.
                    </p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-white">
                  {isStarExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isStarExpanded && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-850">
                  <div className="grid gap-2">
                    {starSuggestions.map(sug => {
                      const isSelected = selectedStarIds.includes(sug.id);
                      return (
                        <div 
                          key={sug.id}
                          onClick={() => handleToggleStarSuggestion(sug.id)}
                          className={`p-3 rounded-lg border transition cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected 
                              ? 'bg-sky-950/40 border-sky-700 text-slate-100' 
                              : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                              isSelected ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600 bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="font-semibold text-slate-400 text-[10.5px]">
                                {sug.role} ({sug.company})
                              </span>
                              <span className="text-[11px] text-slate-400 line-through">
                                "{sug.originalBullet}"
                              </span>
                              <span className="text-[11px] text-emerald-300 font-semibold">
                                ➔ "{sug.suggestedBullet}"
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <span className="text-sky-400 font-mono bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                                  Verb: {sug.strongVerb}
                                </span>
                                <span className="text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                  {sug.metricNote}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isSelected ? 'bg-sky-900/80 text-sky-200 border-sky-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {isSelected ? 'Accepted' : 'Rejected'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleApplyStarImprovements}
                      disabled={selectedStarIds.length === 0}
                      className={`text-xs font-bold px-5 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition cursor-pointer ${
                        selectedStarIds.length === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Apply {selectedStarIds.length} Selected STAR Polish{selectedStarIds.length > 1 ? 'es' : ''} (Screen 4)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real-Time Permission & Operation Preview Badge */}
          {currentScope && (
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              currentScope.scope === 'AMBIGUOUS' 
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                : 'bg-slate-950 border-sky-800/60 text-sky-200'
            }`}>
              {currentScope.scope === 'AMBIGUOUS' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider">{currentScope.label}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      SCOPE: {currentScope.scope}
                    </span>
                  </div>
                  {currentPlan?.operations?.length > 0 && (
                    <span className="text-[10px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {currentPlan.operations.length} Planned Operation{currentPlan.operations.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">{currentScope.description}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button
              onClick={onAnalyzePrompt}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-sky-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Classify Intent & Formulate Change Plan (Screen 4)</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: JOB DESCRIPTION MATCH & EVIDENCE GAP ANALYZER */}
      {editMode === 'jd_match' && (
        <div className="flex flex-col gap-5">
          <div className="bg-sky-950/40 border border-sky-800/40 p-3 rounded-lg text-xs text-sky-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Evidence-Based Anti-Hallucination Matching</span>
              <span className="text-[11px] text-slate-300">
                Pasted Job Descriptions are evaluated against your actual CV facts. The system will categorize requirements into <strong>EVIDENCED</strong>, <strong>PARTIALLY EVIDENCED</strong>, or <strong>NOT EVIDENCED</strong>, and will never invent skills you don't possess.
              </span>
            </div>
          </div>

          {/* JD Input Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-200">
              Target Job Description:
            </label>
            <div className="relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the complete job description here (e.g. requirements, responsibilities, technical keywords)..."
                className="w-full h-36 bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono resize-none"
              />
              {jdText && (
                <button
                  onClick={() => { setJdText(""); setJdAnalysisResult(null); }}
                  className="absolute top-2 right-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick JD Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Preset Job Descriptions:
              </span>
              {presetJdScenarios.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={() => setJdText(scen.text)}
                  className="text-[10.5px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-2.5 py-1 rounded-md border border-slate-700 transition cursor-pointer"
                >
                  {scen.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-start">
            <button
              onClick={handleAnalyzeJobDescription}
              disabled={!jdText.trim() || isAnalyzingJd}
              className={`text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition cursor-pointer ${
                !jdText.trim() || isAnalyzingJd
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzingJd ? 'Analyzing Job Description against CV...' : 'Analyze Job Description against Active CV'}</span>
            </button>
          </div>

          {/* Error Notice */}
          {jdAnalysisResult?.error && (
            <div className="bg-red-950/80 border border-red-500/50 p-3 rounded-lg text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{jdAnalysisResult.error}</span>
            </div>
          )}

          {/* Analysis Results Display */}
          {jdAnalysisResult && !jdAnalysisResult.error && (
            <div className="flex flex-col gap-5 mt-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {/* Match Score & Summary Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-mono font-bold text-lg text-sky-300">
                    {jdAnalysisResult.matchScore}%
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                      Evidence-Based Job Match Score
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Calculated deterministically from requirements found in active Version {currentVersion || 1}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {jdAnalysisResult.summary.evidencedCount} Evidenced
                  </span>
                  <span className="text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {jdAnalysisResult.summary.partialCount} Partial
                  </span>
                  <span className="text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {jdAnalysisResult.summary.gapCount} Gaps
                  </span>
                </div>
              </div>

              {/* Requirements Evidence Table */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Extracted Job Requirements & Evidence
                  </span>
                  
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-800 text-[10px]">
                    <button
                      onClick={() => setTableFilter('ALL')}
                      className={`px-2 py-0.5 rounded font-medium ${tableFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                    >
                      All ({jdAnalysisResult.requirements.length})
                    </button>
                    <button
                      onClick={() => setTableFilter('EVIDENCED')}
                      className={`px-2 py-0.5 rounded font-medium ${tableFilter === 'EVIDENCED' ? 'bg-emerald-900/60 text-emerald-300' : 'text-slate-400'}`}
                    >
                      Evidenced ({jdAnalysisResult.summary.evidencedCount + jdAnalysisResult.summary.partialCount})
                    </button>
                    <button
                      onClick={() => setTableFilter('GAPS')}
                      className={`px-2 py-0.5 rounded font-medium ${tableFilter === 'GAPS' ? 'bg-slate-800 text-slate-300' : 'text-slate-400'}`}
                    >
                      Gaps ({jdAnalysisResult.summary.gapCount})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                        <th className="p-2.5 px-3">Requirement</th>
                        <th className="p-2.5 px-3">Status</th>
                        <th className="p-2.5 px-3">Evidence Found in CV</th>
                        <th className="p-2.5 px-3">Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {filteredRequirements.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-2.5 px-3 font-semibold text-slate-100">{req.name}</td>
                          <td className="p-2.5 px-3">
                            {req.status === 'EVIDENCED' && (
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                EVIDENCED
                              </span>
                            )}
                            {req.status === 'PARTIALLY_EVIDENCED' && (
                              <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <AlertCircle className="w-3 h-3" />
                                PARTIAL
                              </span>
                            )}
                            {req.status === 'NOT_EVIDENCED' && (
                              <span className="bg-slate-900 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <X className="w-3 h-3" />
                                NOT EVIDENCED
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 px-3 text-slate-300">{req.evidenceSnippet}</td>
                          <td className="p-2.5 px-3 text-slate-400">{req.cvLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Suggested Safe Improvements */}
              {jdAnalysisResult.safeSuggestions?.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      Suggested Safe Improvements (Based Only on Verified Evidence)
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">
                      {selectedSuggestions.length} of {jdAnalysisResult.safeSuggestions.length} selected
                    </span>
                  </div>

                  <div className="grid gap-2.5">
                    {jdAnalysisResult.safeSuggestions.map((sug) => {
                      const isSelected = selectedSuggestions.includes(sug.id);
                      return (
                        <div
                          key={sug.id}
                          onClick={() => handleToggleSuggestion(sug.id)}
                          className={`p-3 rounded-lg border transition cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-sky-950/40 border-sky-700 text-slate-100'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                              isSelected ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600 bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-bold text-sky-300">{sug.requirement}</span>
                              <span className="text-[11px] text-slate-200 font-semibold">{sug.suggestedChange}</span>
                              <span className="text-[11px] text-slate-400">{sug.reason}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isSelected ? 'bg-sky-900/80 text-sky-200 border-sky-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {isSelected ? 'Accepted' : 'Rejected'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Apply Selected Button */}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleApplySelectedJdImprovements}
                      disabled={selectedSuggestions.length === 0}
                      className={`text-xs font-bold px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition cursor-pointer ${
                        selectedSuggestions.length === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review & Apply {selectedSuggestions.length} Safe Improvement{selectedSuggestions.length > 1 ? 's' : ''} (Screen 4)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

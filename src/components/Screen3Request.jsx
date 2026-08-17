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
      label: "✨ Pura CV is JD ke hisab se bana do",
      prompt: "Pura CV is JD ke hisab se bana do. Keep original template and factual baseline locked."
    },
    {
      label: "🎯 Tailor Entire CV",
      prompt: "Tailor my entire CV to match this Job Description while preserving all authentic employment dates and credentials."
    },
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
      label: "📄 Keep Original Template",
      prompt: "Keep the original format and template unchanged while improving bullet points."
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

  const handleOptimizeEntireCvForJd = () => {
    if (!jdText.trim() || !onApplyJdPlan) return;
    const plan = jdAnalysisResult?.fullOptimization || generateFullDocumentOptimization(jdText, currentCvState);
    onApplyJdPlan(plan, `Full CV Optimization for Target Job Description (100% Coverage)`);
  };

  const handleApplySelectedJdImprovements = () => {
    if (!jdAnalysisResult || !onApplyJdPlan) return;
    if (jdAnalysisResult.fullOptimization) {
      onApplyJdPlan(jdAnalysisResult.fullOptimization, `Full CV Optimization for Target Job Description (100% Coverage)`);
      return;
    }
    const allCandidates = [
      ...(jdAnalysisResult.safeSuggestions || []),
      ...(jdAnalysisResult.decisionIntelligence?.topSafeActions || [])
    ];
    const chosenSugs = allCandidates.filter(s => selectedSuggestions.includes(s.id));
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
              {/* P1.6 Primary Call-to-Action: Optimize Entire CV (100% Coverage) */}
              <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-2 border-sky-500/50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                      Full CV & Job Description Optimization (100% Coverage)
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Analyze all sections, upgrade bullets with STAR verbs, prioritize target keywords, and preserve original template.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOptimizeEntireCvForJd}
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>OPTIMIZE ENTIRE CV FOR THIS JD</span>
                </button>
              </div>

              {/* P1.6 Directive Section 3: Explicit Intent Understanding Confirmation Card */}
              <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                      REQUEST CONFIRMATION
                    </span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Request Understood As: <span className="text-sky-300 font-extrabold">FULL CV TAILORING</span>
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    100% Inspection • Factual Safety Locked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex flex-col gap-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">Target Role & Scope</span>
                    <span className="font-semibold text-slate-100">
                      {jdAnalysisResult.fullOptimization?.targetRole || currentCvState?.header?.title || 'Target Job Alignment'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <strong>Requested Operation:</strong> Tailor the complete existing CV to this target JD without dropping unrelated factual experience.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wide font-sans text-[10.5px]">The System Will Review (100%):</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-emerald-400/90 mt-0.5">
                      <span>✓ Header / Target Title</span>
                      <span>✓ Professional Summary</span>
                      <span>✓ Core Skills Inventory</span>
                      <span>✓ Every Experience Bullet</span>
                      <span>✓ Education Credentials</span>
                      <span>✓ Certifications & IT Skills</span>
                      <span>✓ Languages & ATS Structure</span>
                      <span>✓ Grammar & Readability</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span><strong>Template:</strong> Preserves original CV template/layout unless a new template is explicitly selected.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong>Safety:</strong> Strict zero-invention lock on skills, metrics, employers, and dates.</span>
                  </div>
                </div>
              </div>

              {/* P1.5: 5-Signal Multi-Dimensional Job Fit Card */}
              {jdAnalysisResult.decisionIntelligence?.jobFit && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 shadow-lg">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 border border-sky-500/40 flex flex-col items-center justify-center font-mono">
                        <span className="text-lg font-extrabold text-sky-300 leading-none">
                          {jdAnalysisResult.decisionIntelligence.jobFit.overallJobFit}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">FIT</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                            Overall Job Fit Score
                          </h3>
                          <span className="text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full">
                            P1.5 Decision Intelligence
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Comprehensive evaluation across 5 distinct ATS & Recruiter fit signals.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {jdAnalysisResult.summary.evidencedCount} Evidenced
                      </span>
                      <span className="bg-amber-950 text-amber-300 border border-amber-800/80 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {jdAnalysisResult.summary.partialCount} Partial
                      </span>
                      <span className="bg-slate-900 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {jdAnalysisResult.summary.gapCount} Gaps
                      </span>
                    </div>
                  </div>

                  {/* 5-Signal Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">ATS Compatibility</span>
                      <span className="text-base font-mono font-bold text-sky-400">
                        {jdAnalysisResult.decisionIntelligence.jobFit.atsCompatibility}%
                      </span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Evidence Strength</span>
                      <span className="text-base font-mono font-bold text-emerald-400">
                        {jdAnalysisResult.decisionIntelligence.jobFit.evidenceStrength}%
                      </span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Recruiter Readability</span>
                      <span className="text-base font-mono font-bold text-indigo-400">
                        {jdAnalysisResult.decisionIntelligence.jobFit.recruiterReadability}%
                      </span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Keyword Coverage</span>
                      <span className="text-base font-mono font-bold text-teal-400">
                        {jdAnalysisResult.decisionIntelligence.jobFit.keywordCoverage}%
                      </span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Credibility & Safety</span>
                      <span className="text-base font-mono font-bold text-cyan-400">
                        {jdAnalysisResult.decisionIntelligence.jobFit.contentCredibility}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic bg-slate-900/40 p-2 rounded border border-slate-800/60">
                    ⚠ {jdAnalysisResult.decisionIntelligence.jobFit.disclaimer}
                  </p>
                </div>
              )}

              {/* Recruiter Risk Alerts */}
              {jdAnalysisResult.decisionIntelligence?.recruiterRisks?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Recruiter Risk Alerts ({jdAnalysisResult.decisionIntelligence.recruiterRisks.length} Detected)</span>
                  </div>
                  <div className="grid gap-2">
                    {jdAnalysisResult.decisionIntelligence.recruiterRisks.map((risk, idx) => (
                      <div key={idx} className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-200 font-mono font-bold">
                              {risk.severity}
                            </span>
                            {risk.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{risk.description}</p>
                        <p className="text-[11px] text-amber-200/90 font-medium">{risk.recommendation}</p>
                        {risk.blockedActions?.length > 0 && (
                          <div className="text-[10px] text-red-300 font-mono bg-red-950/40 p-1.5 rounded border border-red-800/40 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Guarded Action: {risk.blockedActions.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Score & Summary Bar (P1.4 / P1.5 Backward-Compatible) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Evidence-Based Job Match Score</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Score Audit & Explainability: {jdAnalysisResult.summary.exactCount || 0} Exact • {jdAnalysisResult.summary.strongCount || 0} Strong Synonym • {jdAnalysisResult.summary.partialCount || 0} Partial • {jdAnalysisResult.summary.gapCount || 0} Gaps
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Why {jdAnalysisResult.matchScore}%? {jdAnalysisResult.summary.evidencedCount} of {jdAnalysisResult.summary.total} target competencies have verified evidence in candidate history. {jdAnalysisResult.summary.gapCount} high-priority terms remain unsupported.
                </p>

                {/* Non-Mutating Projected Impact Simulator */}
                {jdAnalysisResult.simulation && jdAnalysisResult.simulation.delta > 0 && (
                  <div className="mt-1 bg-sky-950/60 border border-sky-500/30 rounded-md p-2.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-sky-300">Projected ATS Impact:</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {jdAnalysisResult.simulation.currentScore}% → {jdAnalysisResult.simulation.projectedScore}% (+{jdAnalysisResult.simulation.delta}%)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-300/90 font-mono">
                      ⚠ Projection only • Active CV has not been modified
                    </span>
                  </div>
                )}
              </div>

              {/* TOP SAFE ACTIONS (ROI-Ranked) */}
              {jdAnalysisResult.decisionIntelligence?.topSafeActions?.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>TOP SAFE ACTIONS (Ranked by ROI & Evidence Proof)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {selectedSuggestions.length} active
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {jdAnalysisResult.decisionIntelligence.topSafeActions.map((act) => {
                      const isSelected = selectedSuggestions.includes(act.id);
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleToggleSuggestion(act.id)}
                          className={`p-3 rounded-lg border transition cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-700/60 text-slate-100'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                              isSelected ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-600 bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="flex flex-col gap-0.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-300">{act.title}</span>
                                <span className="text-[10px] font-mono font-bold bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 px-1.5 py-0.2 rounded">
                                  +{act.impactWeight || 2} pts
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-200 font-medium">{act.action}</span>
                              <span className="text-[11px] text-slate-400">{act.reason}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                            isSelected ? 'bg-emerald-900/80 text-emerald-200 border-emerald-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {isSelected ? 'Accepted' : 'Excluded'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BLOCKED ACTIONS PANEL */}
              {jdAnalysisResult.decisionIntelligence?.blockedActions?.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4" />
                    <span>🛡 BLOCKED ACTIONS (Anti-Hallucination & Fact Lock Guards)</span>
                  </div>

                  <div className="grid gap-2">
                    {jdAnalysisResult.decisionIntelligence.blockedActions.map((blk, idx) => (
                      <div key={idx} className="p-2.5 bg-red-950/20 border border-red-800/30 rounded-lg flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-300 flex items-center gap-1.5">
                            <span>✕</span>
                            <span>{blk.title}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded">
                            BLOCKED (+0 pts)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{blk.reason}</p>
                        <p className="text-[10px] text-slate-500 font-mono italic">
                          Allowed Resolution: {blk.allowedResolution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Evidence Table */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Extracted Job Requirements & Deep Evidence Lineage
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
                        <th className="p-2.5 px-3">Importance</th>
                        <th className="p-2.5 px-3">Confidence & Status</th>
                        <th className="p-2.5 px-3">Recommendation</th>
                        <th className="p-2.5 px-3">Evidence Provenance Lineage</th>
                        <th className="p-2.5 px-3">CV Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {filteredRequirements.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-2.5 px-3 font-semibold text-slate-100">{req.name}</td>
                          <td className="p-2.5 px-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              req.importance === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              req.importance === 'IMPORTANT' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                              'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}>
                              {req.importance || 'STANDARD'}
                            </span>
                          </td>
                          <td className="p-2.5 px-3">
                            {req.confidence === 'EXACT' && (
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                EXACT
                              </span>
                            )}
                            {req.confidence === 'STRONG' && (
                              <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                STRONG
                              </span>
                            )}
                            {req.confidence === 'PARTIAL' && (
                              <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <AlertCircle className="w-3 h-3" />
                                PARTIAL
                              </span>
                            )}
                            {(!req.confidence || req.confidence === 'NONE') && (
                              <span className="bg-slate-900 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                                <X className="w-3 h-3" />
                                NONE
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 px-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              req.recommendation === 'KEEP' ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800' :
                              req.recommendation === 'STRENGTHEN' || req.recommendation === 'STRENGTHEN_PLACEMENT' ? 'text-sky-300 bg-sky-950/60 border border-sky-800' :
                              req.recommendation === 'DO_NOT_INVENT' ? 'text-red-300 bg-red-950/60 border border-red-800' :
                              'text-slate-400 bg-slate-900 border border-slate-700'
                            }`}>
                              {req.recommendation || (req.status === 'EVIDENCED' ? 'KEEP' : 'DO_NOT_INVENT')}
                            </span>
                          </td>
                          <td className="p-2.5 px-3 text-slate-300 max-w-xs truncate" title={req.evidenceSnippet}>
                            {req.evidenceSnippet}
                          </td>
                          <td className="p-2.5 px-3 text-slate-400 max-w-xs truncate" title={req.cvLocation}>
                            {req.cvLocation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button: Review ChangePlan */}
              <div className="flex justify-end mt-2 pt-3 border-t border-slate-800">
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
                  <span>Review ChangePlan & Apply ({selectedSuggestions.length} Safe Action{selectedSuggestions.length > 1 ? 's' : ''})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

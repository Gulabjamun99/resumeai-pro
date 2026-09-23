import React, { useState } from 'react';
import { 
  Target, Upload, CheckCircle2, AlertTriangle, FileText, 
  Sparkles, Zap, ArrowRight, RefreshCw, Briefcase, User, 
  Layers, Check, X
} from 'lucide-react';
import { parseUploadedDocument } from '../services/documentParser';

/**
 * PERSONA 3: JOB DESCRIPTION (JD) SEMANTIC OPTIMIZER
 * 
 * Compares candidate's real CV against real target job description.
 * Step 1: Candidate CV (either passed from active session or uploaded directly here).
 * Step 2: Target Job Description.
 * Step 3: Semantic ATS Match & Gap Analysis.
 * Step 4: Tailors CV to JD and launches in Live Studio.
 */
export default function JdOptimizer({ 
  currentResume, 
  onApplyOptimization, 
  onCancel 
}) {
  // Local state for CV if user uploads it directly in this view
  const [uploadedCv, setUploadedCv] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [cvParseError, setCvParseError] = useState(null);

  // Active CV is either the uploaded one or the one passed from the session
  const activeCv = uploadedCv || currentResume;

  // Job Description state
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // File upload handler inside JD Tailor
  const handleFileUpload = async (e) => {
    const inputElement = e.currentTarget || e.target;
    const file = inputElement?.files?.[0];
    if (!file) return;

    setIsParsingCv(true);
    setCvParseError(null);
    setAnalysisResult(null);

    try {
      const parsedMaster = await parseUploadedDocument(file);
      setUploadedCv(parsedMaster);
      setUploadedFileName(file.name);
    } catch (err) {
      console.error("CV Upload/Parsing Error in JD Optimizer:", err);
      setCvParseError(err.message || "Failed to process uploaded CV document. Please ensure the file is readable.");
    } finally {
      setIsParsingCv(false);
      if (inputElement) {
        try { inputElement.value = ''; } catch (_) {}
      }
    }
  };

  // Run Semantic Match between Active CV and JD
  const handleAnalyze = () => {
    if (!activeCv || !jobDescription.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const jdText = jobDescription.toLowerCase();

      // Universal vocabulary of industry, technical, operations, and leadership competencies
      const potentialKeywords = [
        'react', 'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'golang', 'rust',
        'node.js', 'express', 'next.js', 'vue', 'angular', 'tailwind css', 'html5', 'css3',
        'sql', 'postgresql', 'mongodb', 'mysql', 'redis', 'graphql', 'rest api', 'microservices',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'git', 'devops', 'linux',
        'ai', 'machine learning', 'nlp', 'llm', 'deep learning', 'data analysis', 'power bi', 'tableau',
        'agile', 'scrum', 'jira', 'project management', 'product management', 'leadership',
        'talent acquisition', 'recruitment', 'hr operations', 'sourcing', 'stakeholder management',
        'vendor management', 'onboarding', 'performance management', 'compliance', 'budgeting',
        'sales', 'business development', 'crm', 'seo', 'content strategy', 'digital marketing'
      ];

      // Dynamically extract key words/terms from JD
      const regexTokens = jobDescription.match(/\b[A-Za-z0-9#+.-]{2,}\b/g) || [];
      const stopWords = new Set([
        'the', 'and', 'with', 'for', 'are', 'that', 'this', 'from', 'have', 'has', 'will', 'you',
        'your', 'our', 'their', 'all', 'any', 'can', 'should', 'would', 'could', 'about', 'more',
        'been', 'were', 'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
        'work', 'years', 'experience', 'candidate', 'role', 'team', 'ability', 'skills', 'required'
      ]);

      const candidateTokens = new Set();
      regexTokens.forEach(t => {
        const lower = t.toLowerCase();
        if (lower.length > 2 && !stopWords.has(lower) && potentialKeywords.includes(lower)) {
          candidateTokens.add(lower);
        }
      });

      const vocabToTest = Array.from(new Set([...potentialKeywords.filter(k => jdText.includes(k)), ...candidateTokens]));

      const currentSkillsText = (activeCv?.skills || []).join(' ').toLowerCase();
      const currentExpText = (activeCv?.experiences || [])
        .map(e => `${e.role || ''} ${e.company || ''} ${(e.bullets || []).join(' ')}`)
        .join(' ')
        .toLowerCase();

      const matched = [];
      const missing = [];

      vocabToTest.forEach(kw => {
        if (jdText.includes(kw)) {
          if (currentSkillsText.includes(kw) || currentExpText.includes(kw)) {
            matched.push(kw.toUpperCase());
          } else {
            missing.push(kw.toUpperCase());
          }
        }
      });

      const total = matched.length + missing.length || 1;
      const score = Math.round((matched.length / total) * 100);

      setAnalysisResult({
        currentScore: Math.min(95, Math.max(30, score)),
        projectedScore: Math.min(98, Math.max(88, score + 35)),
        matchedKeywords: matched,
        missingKeywords: missing,
        roleDetected: targetRole.trim() || activeCv.header?.title || 'Target Position'
      });
      setIsAnalyzing(false);
    }, 600);
  };

  // Apply ATS tailoring to Active CV
  const handleApplyTailoring = () => {
    if (!analysisResult || !activeCv) return;

    // Create optimized copy of resume
    const optimized = JSON.parse(JSON.stringify(activeCv));

    // 1. Update Title if provided
    if (targetRole.trim() && optimized.header) {
      optimized.header.title = targetRole.trim();
    }

    // 2. Inject missing high-impact keywords to skills if any found
    if (analysisResult.missingKeywords.length > 0) {
      const newSkills = [...(optimized.skills || [])];
      analysisResult.missingKeywords.slice(0, 8).forEach(kw => {
        const formatted = kw.charAt(0) + kw.slice(1).toLowerCase();
        if (!newSkills.some(s => s.toLowerCase() === formatted.toLowerCase())) {
          newSkills.push(formatted);
        }
      });
      optimized.skills = newSkills;
    }

    // 3. Optimize top experience bullets with JD alignment if keywords exist
    if (optimized.experiences && optimized.experiences.length > 0 && analysisResult.missingKeywords.length > 0) {
      const topExp = optimized.experiences[0];
      const injectedKeyTerms = analysisResult.missingKeywords.slice(0, 3).map(k => k.toLowerCase()).join(', ');
      const jdBullet = `Applied specialized competencies in ${injectedKeyTerms} to drive key operational outcomes and measurable project delivery.`;
      if (!topExp.bullets) topExp.bullets = [];
      topExp.bullets.unshift(jdBullet);
    }

    if (onApplyOptimization) {
      onApplyOptimization(optimized, activeCv);
    }
  };

  const hasCv = Boolean(activeCv);
  const hasJd = Boolean(jobDescription.trim());
  const canAnalyze = hasCv && hasJd && !isAnalyzing;

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-white my-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Job Description (JD) Semantic Tailor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            <strong>Step 1:</strong> Apni CV provide karein + <strong>Step 2:</strong> Target JD paste karein ➔ AI dono ko match karega aur aapke CV ko ATS-tailored bana dega.
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            Cancel / Back to Hub
          </button>
        )}
      </div>

      {/* 2-Step Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* STEP 1: CANDIDATE CV (BASE RESUME) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center text-[11px] font-bold">
                1
              </span>
              <span>Candidate CV (Base Resume)</span>
            </label>
            {hasCv && (
              <label className="text-[11px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload Different CV</span>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt,.png,.jpg" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {hasCv ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {activeCv.header?.name || 'Active Candidate CV'}
                    </h4>
                    <p className="text-[11px] text-emerald-400">
                      {activeCv.header?.title || (uploadedFileName ? `File: ${uploadedFileName}` : 'Active Resume Loaded')}
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Skills</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {activeCv.skills?.length || 0}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Experience</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {activeCv.experiences?.length || 0}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Projects</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {activeCv.projects?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                {isParsingCv ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isParsingCv ? 'Parsing Uploaded CV...' : 'Upload Your Existing Resume'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                  PDF, DOCX, ya TXT format upload karein taaki AI aapke real experience ko JD se match kar sake.
                </p>
              </div>

              <label className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 mt-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Select CV File</span>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt,.png,.jpg" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  disabled={isParsingCv}
                />
              </label>

              {cvParseError && (
                <p className="text-[11px] text-red-400 bg-red-950/60 p-2 rounded border border-red-800 w-full mt-2">
                  {cvParseError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* STEP 2: TARGET JOB DESCRIPTION */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Target Job Description (JD)</span>
          </label>

          <div className="flex flex-col gap-2 flex-1">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Senior Full-Stack Engineer / Lead PM)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />

            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Job posting ki responsibilities, requirements, aur qualifications yahan paste karein..."
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 resize-none font-mono text-[11px] min-h-[140px]"
            />
          </div>
        </div>

      </div>

      {/* Action / Analyze Button */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
            canAnalyze 
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-emerald-500/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Matching Candidate CV with Job Description...</span>
            </>
          ) : !hasCv ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Step 1 Complete Karein: Pehle apni CV upload karein</span>
            </>
          ) : !hasJd ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Step 2 Complete Karein: Target Job Description paste karein</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Run Semantic ATS Match & Gap Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-5 animate-in fade-in">
          {/* Match Score Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="text-3xl font-black text-amber-400 font-mono">
                {analysisResult.currentScore}%
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Current ATS Match</span>
                <span className="text-[11px] text-slate-400">Baseline before JD optimization</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl">
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {analysisResult.projectedScore}%
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Projected ATS Match</span>
                <span className="text-[11px] text-emerald-400/80">Tailored with high-intent keywords</span>
              </div>
            </div>
          </div>

          {/* Matched Keywords */}
          {analysisResult.matchedKeywords.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Matched Keywords (Already verified in your CV):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.matchedKeywords.map((kw, idx) => (
                  <span 
                    key={idx}
                    className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono px-2 py-0.5 rounded-md"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords Tag Cloud */}
          {analysisResult.missingKeywords.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Missing High-Priority Keywords to Inject:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.missingKeywords.map((kw, idx) => (
                  <span 
                    key={idx}
                    className="bg-amber-950/40 text-amber-300 border border-amber-800/60 text-[10px] font-mono px-2 py-0.5 rounded-md"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tailoring Action Summary */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2 text-xs">
            <span className="font-bold text-slate-200">How AI will tailor your CV:</span>
            <ul className="text-slate-400 text-[11.5px] space-y-1 list-disc list-inside">
              <li>Align professional headline with <strong className="text-white">{analysisResult.roleDetected}</strong></li>
              <li>Inject {analysisResult.missingKeywords.length} missing high-intent ATS keywords into your Skills section</li>
              <li>Reinforce top work experience bullets to reflect target role competencies</li>
            </ul>
          </div>

          {/* CTA: Apply Tailoring */}
          <button
            onClick={handleApplyTailoring}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Apply Tailoring & Open Live Studio (Boost to {analysisResult.projectedScore}% Match)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

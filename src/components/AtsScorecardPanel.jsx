import React, { useState } from 'react';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  BarChart3, 
  FileCheck, 
  BookOpen, 
  Target 
} from 'lucide-react';
import { calculateGranularAtsScorecard } from '../utils/atsEngine';

export default function AtsScorecardPanel({ resume, targetKeywords = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!resume) return null;

  const scorecard = calculateGranularAtsScorecard(resume, targetKeywords);
  const { overallScore, grade, dimensions, actionableTips } = scorecard;

  // Dynamic status badge styling
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60';
    if (score >= 65) return 'text-sky-400 border-sky-500/40 bg-sky-950/60';
    return 'text-amber-400 border-amber-500/40 bg-amber-950/60';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  const dimensionIcons = {
    keywords: <Target className="w-3.5 h-3.5 text-sky-400" />,
    actionVerbs: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    metrics: <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />,
    structure: <FileCheck className="w-3.5 h-3.5 text-purple-400" />,
    brevity: <BookOpen className="w-3.5 h-3.5 text-blue-400" />
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 flex flex-col gap-3 transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                ATS Health & Diagnostic Scorecard
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getScoreColor(overallScore)}`}>
                {overallScore}% • {grade}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">5-dimensional resume parseability & impact analysis</p>
          </div>
        </div>

        {/* Quick Highlights & Expand Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>Keywords: <strong className="text-sky-300">{dimensions.keywords.score}%</strong></span>
            <span>•</span>
            <span>STAR Verbs: <strong className="text-amber-300">{dimensions.actionVerbs.score}%</strong></span>
            <span>•</span>
            <span>Metrics: <strong className="text-emerald-300">{dimensions.metrics.score}%</strong></span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Diagnostics' : 'View Full Breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Diagnostic Breakdown */}
      {isExpanded && (
        <div className="flex flex-col gap-4 pt-1 animate-fadeIn">
          {/* 5 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(dimensions).map(([key, dim]) => (
              <div 
                key={key}
                className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {dimensionIcons[key] || <Activity className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-xs font-bold text-slate-200">{dim.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{dim.weight} weight</span>
                  </div>

                  <p className="text-[10.5px] text-slate-400 mt-1">{dim.details}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                    <span className="text-slate-400">Score</span>
                    <span className="font-bold text-slate-200">{dim.score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getProgressColor(dim.score)} transition-all duration-500`} 
                      style={{ width: `${dim.score}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Overall Health Summary Box */}
            <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Overall ATS Health</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Weighted Index</span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white font-mono">{overallScore}</span>
                <span className="text-xs text-slate-400">/ 100 ({grade})</span>
              </div>

              <p className="text-[10px] text-slate-400">
                Calculated across {scorecard.totalBullets} experience bullets with 0 factual loss.
              </p>
            </div>
          </div>

          {/* Actionable Insights Banner */}
          <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                ATS Optimization & Diagnostic Recommendations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              {actionableTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

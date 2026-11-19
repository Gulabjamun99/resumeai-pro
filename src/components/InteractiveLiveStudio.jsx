import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Download, ZoomIn, ZoomOut, 
  Layout, MessageSquare, Palette, Target, 
  Check, Wand2, ShieldCheck, FileDown, CheckCircle2,
  TrendingUp, Award, Layers, Grid, List, Search, X
} from 'lucide-react';
import ResumeCanvas from './ResumeCanvas.jsx';
import { CATEGORIES, TEMPLATES } from '../data/templateCatalog.js';
import { exportResumeToPdf } from '../utils/pdfExporter.js';
import { exportResumeToDocx } from '../utils/docxExporter.js';
import { refineCvWithAi, tailorCvToJd } from '../services/geminiService.js';
import confetti from 'canvas-confetti';

export { TEMPLATES };

const ACCENT_COLORS = [
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Modern Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Corporate Slate', value: '#334155' },
  { name: 'Crimson', value: '#e11d48' },
  { name: 'Teal', value: '#0d9488' }
];

const QUICK_PROMPTS = [
  "Summary ko executive impact ke sath aur strong banao",
  "Work experience me metrics aur % achievements add karo",
  "Designation change karke Senior Specialist karo",
  "Is resume ko strictly 1 page me compact fit karo",
  "Skills ko high-priority ATS keywords se enrich karo"
];

/**
 * Visual Template Thumbnail Component
 * Renders an exact miniature SVG/CSS blueprint pattern of the template layout.
 */
function TemplateThumbnail({ tpl, isSelected, accentColor }) {
  const accent = accentColor || tpl.accentColor || '#2563eb';
  const isTwoCol = tpl.layout === 'two-column-left' || tpl.layout === 'two-column-sidebar';
  const isCentered = tpl.layout === 'centered-formal' || tpl.headerStyle === 'centered-formal';
  const isTopStrip = tpl.layout === 'header-banner' || tpl.headerStyle === 'top-strip';

  return (
    <div 
      className={`w-full h-24 rounded-lg border overflow-hidden p-2 flex flex-col justify-between transition-all select-none ${
        isSelected ? 'bg-blue-50/50 border-blue-500 shadow-2xs' : 'bg-slate-50/70 border-slate-200 group-hover:border-slate-300'
      }`}
    >
      {/* Top Banner / Strip if applicable */}
      {isTopStrip ? (
        <div className="w-full h-2 rounded-xs mb-1 flex items-center px-1" style={{ backgroundColor: accent }}>
          <div className="w-8 h-0.5 bg-white/80 rounded-full" />
        </div>
      ) : null}

      {/* Miniature Header Simulation */}
      <div className={`flex flex-col ${isCentered ? 'items-center text-center' : 'items-start'} mb-1`}>
        <div className={`flex items-center gap-1 w-full ${isCentered ? 'justify-center' : ''}`}>
          {!isCentered && (
            <div className="w-1 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
          )}
          <div className="w-16 h-1.5 bg-slate-800 rounded-xs" />
          {!isCentered && (
            <div className="w-8 h-1 rounded-xs ml-auto" style={{ backgroundColor: `${accent}99` }} />
          )}
        </div>
        <div className={`flex items-center gap-1 mt-1 opacity-60 ${isCentered ? 'justify-center' : ''}`}>
          <div className="w-5 h-0.5 bg-slate-400 rounded-full" />
          <div className="w-1 h-0.5 bg-slate-300 rounded-full" />
          <div className="w-6 h-0.5 bg-slate-400 rounded-full" />
        </div>
      </div>

      {/* Miniature Body Columns Simulation */}
      {isTwoCol ? (
        <div className="flex-1 flex gap-1.5 items-stretch overflow-hidden">
          {/* Left Rail */}
          <div className="w-[34%] rounded-xs p-1 flex flex-col gap-1 border-r border-slate-200/60" style={{ backgroundColor: `${accent}0d` }}>
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: accent }} />
            <div className="w-4/5 h-0.5 bg-slate-300 rounded-full" />
            <div className="w-3/5 h-0.5 bg-slate-300 rounded-full mt-0.5" />
            <div className="flex gap-0.5 mt-auto">
              <div className="w-2 h-0.5 bg-slate-400 rounded-xs" />
              <div className="w-2 h-0.5 bg-slate-400 rounded-xs" />
            </div>
          </div>
          {/* Right Content */}
          <div className="flex-1 flex flex-col gap-1 py-0.5">
            <div className="w-full h-0.5 bg-slate-700 rounded-full" />
            <div className="w-5/6 h-0.5 bg-slate-300 rounded-full" />
            <div className="w-full h-0.5 bg-slate-300 rounded-full" />
            <div className="w-3/4 h-0.5 bg-slate-300 rounded-full" />
          </div>
        </div>
      ) : (
        /* Single Column / Compact Simulation */
        <div className="flex-1 flex flex-col justify-around py-0.5 overflow-hidden">
          <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: accent }} />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <div className="w-1 h-0.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <div className="w-4/5 h-0.5 bg-slate-400 rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-0.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <div className="w-3/5 h-0.5 bg-slate-400 rounded-full" />
            </div>
          </div>
          <div className="w-2/3 h-0.5 rounded-full" style={{ backgroundColor: `${accent}66` }} />
          <div className="flex gap-1">
            <div className="w-5 h-1 bg-slate-200 rounded-xs" />
            <div className="w-5 h-1 bg-slate-200 rounded-xs" />
            <div className="w-5 h-1 bg-slate-200 rounded-xs" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveLiveStudio({
  resume,
  onUpdateResume,
  versionHistory = [],
  currentVersion = 1,
  onRollback,
  initialMode = 'upload'
}) {
  const [activeTab, setActiveTab] = useState(initialMode === 'jd' ? 'jd' : 'chat');
  const [promptInput, setPromptInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(85);
  const [selectedTemplate, setSelectedTemplate] = useState(
    resume?.styleProfile?.templateId || resume?.templateId || 'modern-executive'
  );
  const [selectedAccent, setSelectedAccent] = useState(resume?.styleProfile?.accentColor || '#2563eb');
  const [selectedFont, setSelectedFont] = useState(resume?.styleProfile?.fontFamily || 'font-sans');
  const [jdInputText, setJdInputText] = useState('');
  const [jdMatchResult, setJdMatchResult] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Template Picker State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateViewMode, setTemplateViewMode] = useState('tile'); // 'tile' | 'list'

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: initialMode === 'fresh'
        ? "👋 Welcome! Main aapka AI Career Architect hoon. ChatGPT ya Gemini ki tarah kisi bhi bhasha (Hindi, Hinglish, English) me mujhe apne baare me batayein — aapka target role, education, projects ya skills. Main real-time me aapka 1-page ATS resume update karta jaunga!"
        : initialMode === 'jd'
        ? "🎯 Job Description (JD) Mode Active: Aap jis job ke liye apply kar rahe hain, uski Job Description yahan paste karein. AI aapke resume ko 95%+ ATS semantic match ke sath optimize kar dega!"
        : "✅ Aapka resume live canvas par loaded hai! ChatGPT/Gemini ki tarah kisi bhi bhasha (Hindi, Hinglish, English) me batayein — kya improve karna hai, kya add karna hai, ya kaisa ATS impact chahiye. Canvas par 100% Corporate English me real-time updates honge!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle Design & Style Updates (Persists to CV State)
  const handleUpdateStyle = (newTemplate, newAccent, newFont) => {
    const templateToUse = newTemplate || selectedTemplate;
    const accentToUse = newAccent || selectedAccent;
    const fontToUse = newFont || selectedFont;

    setSelectedTemplate(templateToUse);
    setSelectedAccent(accentToUse);
    setSelectedFont(fontToUse);

    const isTwoCol = templateToUse === 'two-column-pro' || templateToUse.includes('sidebar') || templateToUse.includes('split') || templateToUse.includes('duo');

    const updatedCv = {
      ...resume,
      layoutType: isTwoCol ? 'two-column-sidebar' : 'single-column',
      templateId: templateToUse,
      styleProfile: {
        ...(resume.styleProfile || {}),
        templateId: templateToUse,
        accentColor: accentToUse,
        fontFamily: fontToUse,
        layoutType: isTwoCol ? 'two-column-sidebar' : 'single-column'
      }
    };
    onUpdateResume(updatedCv, `Applied ${templateToUse} template`);
  };

  // Filter templates: global search across all 75 templates when query present, otherwise by category
  const filteredTemplates = TEMPLATES.filter(tpl => {
    if (templateSearchQuery.trim()) {
      const q = templateSearchQuery.toLowerCase().trim();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.badge.toLowerCase().includes(q) ||
        tpl.categoryLabel.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.id.toLowerCase().includes(q)
      );
    }
    return selectedCategory === 'all' || tpl.category === selectedCategory;
  });

  // Handle AI Chat Refinement
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || promptInput).trim();
    if (!text || isAiProcessing) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setPromptInput('');
    setIsAiProcessing(true);

    try {
      const result = await refineCvWithAi(resume, text);
      if (result && result.cv) {
        onUpdateResume(result.cv, result.planSummary || `Applied edit: "${text.slice(0, 30)}..."`);
        
        const aiMsg = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: result.message || "Aapke bataye gaye badlav resume me 100% Corporate English me successfully apply kar diye gaye hain!",
          planSummary: result.planSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, aiMsg]);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
      }
    } catch (err) {
      console.error("AI Refine Error:", err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Maafi chahta hoon, update karte waqt error aaya: ${err.message || 'Unknown error'}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle JD Tailoring
  const handleTailorToJd = async () => {
    if (!jdInputText.trim() || isAiProcessing) return;
    setIsAiProcessing(true);

    try {
      const result = await tailorCvToJd(resume, jdInputText);
      if (result && result.cv) {
        onUpdateResume(result.cv, `Target JD Tailoring: ${result.matchScore}% ATS Match`);
        setJdMatchResult({
          matchScore: result.matchScore,
          matchedKeywords: result.matchedKeywords || [],
          explanation: result.explanation || "Resume has been semantically optimized for target role requirements with 0% fake data."
        });

        const aiMsg = {
          id: `msg-jd-${Date.now()}`,
          sender: 'ai',
          text: `🎯 Aapka resume target Job Description ke liye optimize ho gaya hai! ATS Semantic Match Score: ${result.matchScore}%. Check live preview!`,
          planSummary: `JD ATS Score: ${result.matchScore}%`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, aiMsg]);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error("JD Tailoring Error:", err);
      alert(`JD Tailoring Error: ${err.message}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export Handlers
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const candidateName = resume?.header?.name || 'Candidate';
      await exportResumeToPdf('resume-document', candidateName);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert(`PDF Export Failed: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportResumeToDocx(resume);
    } catch (err) {
      console.error("DOCX Export failed:", err);
      alert(`DOCX Export Failed: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden bg-slate-100">
      
      {/* LEFT CONTROL PANEL (40% width) */}
      <aside className="w-full md:w-[42%] lg:w-[40%] flex flex-col h-full bg-white border-r border-slate-200 z-10 shadow-sm">
        
        {/* Studio Navigation Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Interactive Live Studio</h2>
              <span className="text-[11px] text-slate-500 font-medium">ChatGPT / Gemini Style Real-Time Refiner</span>
            </div>
          </div>

          {/* Version Rollback Pill */}
          {versionHistory.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-200/70 px-2 py-1 rounded-full text-xs">
              <span className="text-[10.5px] font-mono text-slate-600 font-semibold">
                v{currentVersion}
              </span>
              <button
                type="button"
                onClick={onRollback}
                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 px-1.5 py-0.5 rounded bg-white shadow-2xs hover:bg-blue-50 transition cursor-pointer"
                title="Undo last change"
              >
                Undo
              </button>
            </div>
          )}
        </div>

        {/* Tab Buttons (Chat vs Templates vs JD) */}
        <div className="flex items-center border-b border-slate-200/90 px-4 pt-3 gap-2 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Templates & Styles ({TEMPLATES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jd')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'jd'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Tailor to JD</span>
            {jdMatchResult && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full">
                {jdMatchResult.matchScore}%
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: AI CHAT ASSISTANT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.planSummary && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60">
                        ⚡ {msg.planSummary}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isAiProcessing && (
                <div className="flex items-center gap-2 p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-700">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI synthesizing changes in Corporate English (1–2 page budget)...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-slate-50/50 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">Suggestions:</span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isAiProcessing}
                  className="text-[11px] bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200/90 bg-white">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:border-blue-500 focus-within:bg-white transition"
              >
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Kisi bhi language (Hindi, Hinglish, English) me bol sakte hain..."
                  disabled={isAiProcessing}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={!promptInput.trim() || isAiProcessing}
                  className={`p-2 rounded-lg text-white transition cursor-pointer ${
                    promptInput.trim() && !isAiProcessing
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-sm'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Canvas text is guaranteed 100% Corporate English with strict 1-2 page limits.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPLATES & STYLING (75 ATS TEMPLATES WITH TILE VIEW) */}
        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            
            {/* Header: Title + View Mode Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Choose ATS Template ({TEMPLATES.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">Pick from 75 latest designs • 100% Data Preserved</p>
                </div>

                {/* Grid / List Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTemplateViewMode('tile')}
                    title="Tile Grid View"
                    className={`p-1.5 rounded-md transition cursor-pointer ${
                      templateViewMode === 'tile'
                        ? 'bg-white text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateViewMode('list')}
                    title="Compact List View"
                    className={`p-1.5 rounded-md transition cursor-pointer ${
                      templateViewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="Search 75 templates (e.g. ivy, tech, executive, compact, finance...)"
                  className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition"
                />
                {templateSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTemplateSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {CATEGORIES.map(cat => {
                  const isCatActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                        isCatActive
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                        isCatActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Gallery: Tile View vs List View */}
            <div>
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Koi template match nahi hua. Search query clear karein.
                </div>
              ) : templateViewMode === 'tile' ? (
                /* 1. TILE GRID VIEW (Miniature Wireframes) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleUpdateStyle(tpl.id, tpl.accentColor || selectedAccent, tpl.fontFamily || selectedFont)}
                        className={`group p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2.5 relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Mini Blueprint Pattern */}
                        <div className="relative w-full">
                          <TemplateThumbnail tpl={tpl} isSelected={isSelected} accentColor={tpl.accentColor || selectedAccent} />
                          {isSelected && (
                            <span className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Template Details */}
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">{tpl.name}</span>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {tpl.badge}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                            {tpl.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* 2. COMPACT LIST VIEW */
                <div className="space-y-2">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleUpdateStyle(tpl.id, tpl.accentColor || selectedAccent, tpl.fontFamily || selectedFont)}
                        className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="w-14 h-12 shrink-0">
                          <TemplateThumbnail tpl={tpl} isSelected={isSelected} accentColor={tpl.accentColor || selectedAccent} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{tpl.name}</span>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {tpl.badge}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                            {tpl.description}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accent Color Palette */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Executive Accent Color</span>
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleUpdateStyle(selectedTemplate, c.value, selectedFont)}
                    title={c.name}
                    className={`h-9 rounded-lg flex items-center justify-center transition cursor-pointer shadow-xs ${
                      selectedAccent === c.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : 'hover:scale-102'
                    }`}
                    style={{ backgroundColor: c.value }}
                  >
                    {selectedAccent === c.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Fonts */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Typography Font
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Modern Sans", value: "font-sans" },
                  { label: "Classic Serif", value: "font-serif" },
                  { label: "Tech Mono", value: "font-mono" }
                ].map(f => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handleUpdateStyle(selectedTemplate, selectedAccent, f.value)}
                    className={`p-2.5 rounded-lg border text-center text-xs font-medium transition cursor-pointer ${
                      selectedFont === f.value
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Budget Guarantee */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Strict Max 1–2 Page Guarantee Across All 75 Templates</span>
                <span className="text-[11px] text-emerald-700 leading-tight">
                  Har ek layout standard A4 proportions (210mm x 297mm) me calibrated hai. Chahe template switch karein ya content badhein, zero data loss ke sath 1-2 page ke andar hi fit rahega.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JOB DESCRIPTION TAILOR */}
        {activeTab === 'jd' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* If Tailored ATS Result Exists, Show Score Card */}
            {jdMatchResult && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">ATS Semantic Match</span>
                      <span className="text-[10px] text-emerald-700 font-medium">Ready for Top Enterprise ATS</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-0.5 text-emerald-700">
                    <span className="text-2xl font-black">{jdMatchResult.matchScore}</span>
                    <span className="text-xs font-bold">%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-emerald-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${jdMatchResult.matchScore}%` }}
                  />
                </div>

                {/* Matched Keywords */}
                {jdMatchResult.matchedKeywords && jdMatchResult.matchedKeywords.length > 0 && (
                  <div className="mt-3.5">
                    <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Matched High-Priority Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {jdMatchResult.matchedKeywords.map((kw, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[10.5px] bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-md font-medium shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{kw}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-emerald-800 mt-3 bg-white/70 p-2.5 rounded-xl border border-emerald-200/60 leading-relaxed">
                  {jdMatchResult.explanation}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Target className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Target Job Description (JD)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jis job ke liye apply karna chahte hain, uski Job Description yahan paste karein. AI authentic facts ko target JD keywords ke sath align karega bina koi fake experience invent kiye.
              </p>

              <textarea
                rows={6}
                value={jdInputText}
                onChange={(e) => setJdInputText(e.target.value)}
                placeholder="Paste Job Description (JD) requirements here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleTailorToJd}
              disabled={!jdInputText.trim() || isAiProcessing}
              className={`w-full py-3 rounded-xl font-semibold text-xs text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer ${
                jdInputText.trim() && !isAiProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {isAiProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Aligning Resume with JD...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Tailor Resume for 95%+ ATS Match</span>
                </>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* RIGHT PREVIEW CANVAS PANEL (60% width) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200/60 relative">
        {/* Floating Top Control Toolbar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
          {/* Zoom Controls & Page Info */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-700 w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(85)}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition cursor-pointer ml-1"
            >
              Fit
            </button>

            <span className="text-slate-300 mx-1">|</span>

            {/* Strict Page Badge */}
            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>Strict Max 1–2 Pages (A4 Standard)</span>
            </span>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {isExportingDocx ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>Word DOCX</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              {isExportingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Scroll Area */}
        <div className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start">
          <div 
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
          >
            <ResumeCanvas
              resume={resume}
              id="resume-document"
              accentColor={selectedAccent}
              fontFamily={selectedFont}
              templateId={selectedTemplate}
            />
          </div>
        </div>
      </main>

    </div>
  );
}

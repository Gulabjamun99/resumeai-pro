import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, Download, FileText, CheckCircle2, 
  Eye, RefreshCw, ZoomIn, ZoomOut, Layout, MessageSquare, 
  ShieldCheck, Filter, Check, Trash2, Edit3, Palette, Sliders, 
  Type, Columns, AlignLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Maximize2, 
  Minimize2, CheckCheck, AlertCircle, PlusCircle, MinusCircle, Flame 
} from 'lucide-react';
import ResumeDocument from './ResumeDocument';
import { exportResumeToPdf } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';
import { RESUME_TEMPLATES_CATALOG, TEMPLATE_TAG_FILTERS } from '../data/templateCatalog';
import { COLOR_PALETTES, FONT_FAMILIES, DENSITY_OPTIONS, DEFAULT_DESIGN_THEME } from '../data/themePresets';
import { computeResumeDiff } from '../utils/changeDiffDetector';

/**
 * RESUMEAI PRO — COCKPIT STUDIO (CONTENT CLARITY & TEMPLATE SHOWCASE ENGINE)
 * 
 * Workflow Architecture (Directly aligned with user requirement):
 * 1. PHASE 1: Content & AI Edit Clarifier ("Pehle content clear ho jaye kya likha hai")
 *    - Full transparent diff verification: Clearly shows what was deleted, added, or modified.
 *    - Conversational AI live edits + 1-Click command chips.
 *    - Full visible CV canvas with no cutoffs or clipping.
 * 
 * 2. PHASE 2: 36 Modern Templates Showcase ("CV right side, left me change template dikhta rahega")
 *    - LEFT PANE (40%): 36 Modern ATS Templates (39 Available) with categories, search, 12 palettes & 2-Col/1-Col switcher.
 *    - RIGHT PANE (60%): Live Reactive CV Preview updating in real-time as user clicks any template on the left!
 */
export default function InteractiveLiveStudio({
  resume,
  sourceResume,
  currentVersion = 2,
  selectedTemplateId = 'source-template',
  onSelectTemplate,
  onApplyRefinement,
  onRollback,
  onStartNewCv,
  versionHistory = [],
  designTheme = DEFAULT_DESIGN_THEME,
  onUpdateDesignTheme
}) {
  // Phase Modes: 'content' (Step 1: Content Clarifier) | 'templates' (Step 2: Template Showcase)
  const [studioPhase, setStudioPhase] = useState('content');
  
  // Controls inside Templates Phase: 'templates' | 'styling'
  const [templateSubTab, setTemplateSubTab] = useState('templates');
  
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(80); // Default 80% fits standard viewports perfectly
  const [activeTemplateTag, setActiveTemplateTag] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [highlightChangesOnCv, setHighlightChangesOnCv] = useState(true);

  const currentTheme = designTheme || DEFAULT_DESIGN_THEME;

  // Compute exact diff between original baseline and current working version
  const diffReport = computeResumeDiff(sourceResume, resume);

  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Aapka CV content load ho chuka hai! Pehle yahan check karein ki kya likha hua hai aur kaun se changes hue hain. Agar sab perfect lage to "Next: 36 Templates" par click karein!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);
  const step1ScrollRef = useRef(null);
  const step2ScrollRef = useRef(null);

  const scrollToBottom = (phase) => {
    const targetRef = phase === 'content' ? step1ScrollRef : step2ScrollRef;
    if (targetRef.current) {
      targetRef.current.scrollTo({
        top: targetRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = (phase) => {
    const targetRef = phase === 'content' ? step1ScrollRef : step2ScrollRef;
    if (targetRef.current) {
      targetRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSendPrompt = async (textToSend) => {
    const text = textToSend || promptInput;
    if (!text.trim() || isProcessing) return;

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, userMsg]);
    setPromptInput('');
    setIsProcessing(true);

    try {
      if (onApplyRefinement) {
        const result = await onApplyRefinement(text.trim());
        const summaryText = result?.planSummary || `Instruction "${text.trim()}" live apply ho gaya hai.`;
        const aiResponseText = `✅ ${summaryText} Right side preview aur "Recent Changes" me update check kijiye!`;
        
        setTimeout(() => {
          setChatLog(prev => [
            ...prev,
            {
              sender: 'ai',
              text: aiResponseText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsProcessing(false);
        }, 400);
      }
    } catch (err) {
      console.error("Refinement error:", err);
      setIsProcessing(false);
    }
  };

  const handleApplyPalette = (palette) => {
    if (!onUpdateDesignTheme) return;
    onUpdateDesignTheme(prev => ({
      ...prev,
      colorPresetId: palette.id,
      primaryColor: palette.primaryColor,
      sidebarBg: palette.sidebarBg,
      sidebarText: palette.sidebarText,
      pageBg: palette.pageBg,
      textColor: palette.textColor,
      headingColor: palette.headingColor
    }));
  };

  const handleToggleLayoutMode = (mode) => {
    if (!onUpdateDesignTheme) return;
    onUpdateDesignTheme(prev => ({
      ...prev,
      layoutMode: mode
    }));
    if (mode === 'two-column' && selectedTemplateId === 'single-column' && onSelectTemplate) {
      onSelectTemplate('designer-dual');
    }
  };

  const handleToggleSidebarPosition = (pos) => {
    if (!onUpdateDesignTheme) return;
    onUpdateDesignTheme(prev => ({
      ...prev,
      sidebarPosition: pos
    }));
  };

  const handleFontChange = (fontObj) => {
    if (!onUpdateDesignTheme) return;
    onUpdateDesignTheme(prev => ({
      ...prev,
      fontId: fontObj.id,
      fontFamily: fontObj.value
    }));
  };

  const handleCustomColorChange = (key, value) => {
    if (!onUpdateDesignTheme) return;
    onUpdateDesignTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredTemplates = RESUME_TEMPLATES_CATALOG.filter(tpl => {
    const matchesTag = activeTemplateTag === 'All' || (tpl.tags && tpl.tags.includes(activeTemplateTag));
    const matchesSearch = !templateSearch || 
      tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.category.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ========================================================
          TOP WORKFLOW CONTROL BAR (2 PHASES: CONTENT vs TEMPLATES)
          ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl flex flex-wrap justify-between items-center gap-3">
        {/* Phase Mode Toggle Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStudioPhase('content')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer ${
                studioPhase === 'content'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Step 1: Content Clarity & AI Edits</span>
              {diffReport.hasChanges && (
                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {diffReport.totalChangesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStudioPhase('templates')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer ${
                studioPhase === 'templates'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Step 2: 36 Templates & Design (Left: Templates | Right: CV)</span>
            </button>
          </div>
        </div>

        {/* Viewport Zoom & Instant Export Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Zoom Presets */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(120, prev + 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="text-slate-700">|</span>

            <button
              onClick={() => setZoomLevel(80)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition ${zoomLevel === 80 ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Fit to page width"
            >
              Fit
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition ${zoomLevel === 100 ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title="100% Actual size"
            >
              100%
            </button>
          </div>

          {/* Instant PDF Download Button */}
          <button
            onClick={() => exportResumeToPdf('cockpit-preview-canvas', resume?.header?.name || 'Candidate', currentVersion)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Download printable vector PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Instant DOCX Download Button */}
          <button
            onClick={() => exportResumeToDocx(resume, currentVersion, selectedTemplateId)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Download Word DOCX"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CHANGE VERIFICATION PROOF BAR (100% TRANSPARENCY)
          Always visible so candidate knows exactly what changed vs original!
          ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            Change Proof Verification:
          </span>

          {/* Deleted Companies Badges */}
          {diffReport.deletedCompanies.map((del, dIdx) => (
            <span key={dIdx} className="bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1">
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>Deleted: <strong>{del.company}</strong></span>
            </span>
          ))}

          {/* Added Companies Badges */}
          {diffReport.addedCompanies.map((add, aIdx) => (
            <span key={aIdx} className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1">
              <PlusCircle className="w-3 h-3 text-emerald-400" />
              <span>Added: <strong>{add.role || add.company}</strong></span>
            </span>
          ))}

          {/* Added Projects */}
          {diffReport.addedProjects.map((proj, pIdx) => (
            <span key={pIdx} className="bg-sky-950/80 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Live Product: <strong>{proj}</strong></span>
            </span>
          ))}

          {/* Added Skills */}
          {diffReport.addedSkills.length > 0 && (
            <span className="bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1">
              <span>+Skills: <strong>{diffReport.addedSkills.join(', ')}</strong></span>
            </span>
          )}

          {/* Summary or Headline Updates */}
          {diffReport.summaryChanged && (
            <span className="bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1">
              <span>Summary Optimized</span>
            </span>
          )}

          {!diffReport.hasChanges && (
            <span className="text-slate-400 text-[11px] italic">
              Original content intact. Type any request (e.g. "Nathcorp delete karo") to make live changes.
            </span>
          )}
        </div>

        {/* Step Progression Button */}
        {studioPhase === 'content' ? (
          <button
            onClick={() => setStudioPhase('templates')}
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <span>Content Clear! Next: 36 Templates & Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => setStudioPhase('content')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold px-3 py-1.5 rounded-lg text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Content & Edits</span>
          </button>
        )}
      </div>

      {/* ========================================================
          MAIN WORKSPACE LAYOUT (2 DIFFERENT WORKFLOW VIEWS)
          ======================================================== */}

      {/* --------------------------------------------------------
          PHASE 1: CONTENT CLARIFIER & AI LIVE EDITS
          Focus: Reviewing words, bullets, deletions & additions
          Left: Conversational AI Edit | Right: Full Visible CV
          -------------------------------------------------------- */}
      {studioPhase === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Pane (Col 5 / 40%): AI Edit Assistant */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden h-[calc(100vh-230px)] min-h-[580px]">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  AI Live Edit & Content Clarifier
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Step 1 of 2
              </span>
            </div>

            {/* Chat Log Stream */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
              {chatLog.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div 
                    className={`p-3 rounded-xl leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-sky-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9.5px] text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-sky-400 text-xs p-3 bg-slate-800/80 rounded-xl border border-sky-500/20 max-w-[80%]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing instruction and updating CV state...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Form & Undo Control */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Natural Language Live Editor</span>
                </span>
                {versionHistory && versionHistory.length > 1 && (
                  <button
                    onClick={() => onRollback && onRollback(versionHistory.length - 1)}
                    className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-600/40 flex items-center gap-1.5 transition cursor-pointer font-medium shadow-sm active:scale-95"
                    title="Undo previous edit and revert to last version"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Undo Last Edit (v{currentVersion})</span>
                  </button>
                )}
              </div>

              {/* Input Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="relative mt-0.5"
              >
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Type any edit (e.g. 'Name change karke Rahul kar do', 'Skills me Docker add karo', 'Execo delete karo')..."
                  disabled={isProcessing}
                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!promptInput.trim() || isProcessing}
                  className="absolute right-1.5 top-1.5 p-1.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Advance to Step 2 Button */}
              <button
                onClick={() => setStudioPhase('templates')}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer mt-1"
              >
                <span>Content Finalized! Choose 36 Templates & Colors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Pane (Col 7 / 60%): Complete CV Visual Preview */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center px-1 gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                Live CV Content Preview (Read & Verify Every Line)
              </span>

              <div className="flex items-center gap-2">
                {/* Scroll Jump Controls */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-[10.5px]">
                  <button
                    onClick={() => scrollToTop('content')}
                    className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                    title="Scroll to Top"
                  >
                    <ArrowUp className="w-3 h-3 text-sky-400" />
                    <span>Top</span>
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => scrollToBottom('content')}
                    className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                    title="Scroll to Bottom"
                  >
                    <ArrowDown className="w-3 h-3 text-sky-400" />
                    <span>Bottom</span>
                  </button>
                </div>

                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  Full Length Scrollable
                </span>
              </div>
            </div>

            {/* Document Viewport - Auto-sized with no cutoff, full scrollability */}
            <div 
              ref={step1ScrollRef}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 overflow-x-auto overflow-y-auto max-h-[calc(100vh-230px)] min-h-[580px] shadow-2xl flex justify-center items-start text-left scroll-smooth"
            >
              <div 
                id="cockpit-preview-canvas"
                style={{ 
                  zoom: zoomLevel / 100,
                  transition: 'zoom 0.2s ease-out' 
                }}
                className="bg-white rounded shadow-2xl text-slate-900 shrink-0 text-left h-auto min-h-fit"
              >
                <ResumeDocument 
                  resume={resume} 
                  isUpdated={true} 
                  templateId={selectedTemplateId} 
                  theme={currentTheme}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          PHASE 2: 36 MODERN TEMPLATES SHOWCASE
          USER DIRECTIVE: "cv right side left m change template dikhta rhega jo bhi select krega"
          Left: 36 Modern Templates Catalog (40%) | Right: CV Visuals (60%)
          -------------------------------------------------------- */}
      {studioPhase === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ========================================================
              LEFT PANE (Col 5 / 40%): 36 MODERN ATS TEMPLATES CATALOG
              ======================================================== */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden h-[calc(100vh-230px)] min-h-[580px]">
            {/* Sub-Tabs: Templates vs Styling */}
            <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5">
              <button
                onClick={() => setTemplateSubTab('templates')}
                className={`flex-1 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  templateSubTab === 'templates'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>36 Modern Templates (39 Available)</span>
              </button>

              <button
                onClick={() => setTemplateSubTab('styling')}
                className={`flex-1 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  templateSubTab === 'styling'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Colors & Layout</span>
              </button>
            </div>

            {/* SUB-TAB 1: 36 TEMPLATES LIST (FILTERABLE & SEARCHABLE) */}
            {templateSubTab === 'templates' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search and Category Filters */}
                <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                      Select Template to View on Right:
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">
                      {filteredTemplates.length} Templates
                    </span>
                  </div>

                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search template name..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />

                  {/* Filter Tags */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10.5px]">
                    <Filter className="w-3 h-3 text-slate-500 shrink-0 mr-1" />
                    {TEMPLATE_TAG_FILTERS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTemplateTag(tag)}
                        className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                          activeTemplateTag === tag
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates Scrollable List */}
                <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => onSelectTemplate && onSelectTemplate(tpl.id)}
                        className={`p-3 rounded-xl border transition flex flex-col gap-1.5 cursor-pointer text-left relative ${
                          isSelected
                            ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                            : 'bg-slate-950/50 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block" 
                              style={{ backgroundColor: tpl.accent || '#0284c7' }} 
                            />
                            <span className="text-xs font-bold text-white">{tpl.name}</span>
                          </div>
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 hover:text-sky-400">Apply ➔</span>
                          )}
                        </div>

                        {tpl.badge && (
                          <span className="text-[9px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.2 rounded w-fit">
                            {tpl.badge}
                          </span>
                        )}

                        <p className="text-[11px] text-slate-400 leading-snug">
                          {tpl.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[9.5px] text-slate-500">
                          <span>{tpl.category}</span>
                          <span className="font-mono uppercase">{tpl.layout === 'dual' ? '2-Column' : 'Single-Col'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: DESIGN, COLORS & LAYOUT ENGINE */}
            {templateSubTab === 'styling' && (
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-xs text-left">
                {/* 1. LAYOUT ARCHITECTURE SELECTOR */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10.5px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Columns className="w-3.5 h-3.5" />
                    1. Layout Mode (Two-Column vs Single-Column)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleToggleLayoutMode('two-column')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        currentTheme.layoutMode === 'two-column'
                          ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Columns className="w-5 h-5 text-sky-400" />
                      <span className="font-bold text-[11px]">Two-Column (Sidebar)</span>
                      <span className="text-[9.5px] opacity-70 text-center">Compact sidebar for skills, contact & badges</span>
                    </button>

                    <button
                      onClick={() => handleToggleLayoutMode('single-column')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        currentTheme.layoutMode === 'single-column'
                          ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlignLeft className="w-5 h-5 text-sky-400" />
                      <span className="font-bold text-[11px]">Single-Column (Linear)</span>
                      <span className="text-[9.5px] opacity-70 text-center">Top-down classic chronological flow</span>
                    </button>
                  </div>

                  {/* Sidebar Position for 2-Column */}
                  {currentTheme.layoutMode === 'two-column' && (
                    <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 mt-1">
                      <span className="text-[10px] text-slate-400">Sidebar Position:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleSidebarPosition('left')}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded transition cursor-pointer ${
                            currentTheme.sidebarPosition === 'left' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Left Sidebar
                        </button>
                        <button
                          onClick={() => handleToggleSidebarPosition('right')}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded transition cursor-pointer ${
                            currentTheme.sidebarPosition === 'right' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Right Sidebar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. 12 CURATED DESIGNER COLOR PALETTES */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10.5px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    2. Full Variety Color Palettes (1-Click Switch)
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((pal) => {
                      const isSelected = currentTheme.colorPresetId === pal.id;
                      return (
                        <button
                          key={pal.id}
                          onClick={() => handleApplyPalette(pal)}
                          className={`p-2.5 rounded-xl border flex flex-col gap-1.5 text-left transition cursor-pointer relative ${
                            isSelected
                              ? 'bg-slate-800 border-sky-500 ring-1 ring-sky-500/50'
                              : 'bg-slate-950/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10.5px] text-slate-200 truncate">{pal.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
                          </div>

                          {/* Swatches */}
                          <div className="flex items-center gap-1.5">
                            {pal.preview.map((c, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="w-4 h-4 rounded-full border border-black/30 shadow-xs" 
                                style={{ backgroundColor: c }} 
                                title={c}
                              />
                            ))}
                            <span className="text-[9px] text-slate-500 font-mono ml-auto">{pal.category}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. GRANULAR COLOR PICKERS */}
                <div className="flex flex-col gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    3. Granular Custom Color Pickers
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400">Primary Accent:</label>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <input
                          type="color"
                          value={currentTheme.primaryColor}
                          onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[10px] text-slate-300 uppercase">{currentTheme.primaryColor}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400">Sidebar Background:</label>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <input
                          type="color"
                          value={currentTheme.sidebarBg}
                          onChange={(e) => handleCustomColorChange('sidebarBg', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[10px] text-slate-300 uppercase">{currentTheme.sidebarBg}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400">Page Background:</label>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <input
                          type="color"
                          value={currentTheme.pageBg}
                          onChange={(e) => handleCustomColorChange('pageBg', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[10px] text-slate-300 uppercase">{currentTheme.pageBg}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400">Body Text Color:</label>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <input
                          type="color"
                          value={currentTheme.textColor}
                          onChange={(e) => handleCustomColorChange('textColor', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="font-mono text-[10px] text-slate-300 uppercase">{currentTheme.textColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TYPOGRAPHY & FONT FAMILIES */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10.5px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    4. Font Typography
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_FAMILIES.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => handleFontChange(font)}
                        className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                          currentTheme.fontId === font.id
                            ? 'bg-sky-950/60 border-sky-500 text-white font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-[10.5px] block">{font.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              RIGHT PANE (Col 7 / 60%): LIVE CV VISUAL PREVIEW
              USER DIRECTIVE: "cv right side left m change template dikhta rhega jo bhi select krega"
              ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center px-1 gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                Live Template Visual Preview (Updates Live on Selection)
              </span>
              <div className="flex items-center gap-2">
                {/* Scroll Jump Controls */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-[10.5px]">
                  <button
                    onClick={() => scrollToTop('templates')}
                    className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                    title="Scroll to Top"
                  >
                    <ArrowUp className="w-3 h-3 text-sky-400" />
                    <span>Top</span>
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => scrollToBottom('templates')}
                    className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                    title="Scroll to Bottom"
                  >
                    <ArrowDown className="w-3 h-3 text-sky-400" />
                    <span>Bottom</span>
                  </button>
                </div>

                <span className="text-[10px] text-purple-300 bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded-full font-mono">
                  Active: {RESUME_TEMPLATES_CATALOG.find(t => t.id === selectedTemplateId)?.name || selectedTemplateId}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  100% Facts Locked
                </span>
              </div>
            </div>

            {/* Document Viewport - Auto-sized with no cutoff, full scrollability */}
            <div 
              ref={step2ScrollRef}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 overflow-x-auto overflow-y-auto max-h-[calc(100vh-230px)] min-h-[580px] shadow-2xl flex justify-center items-start text-left scroll-smooth"
            >
              <div 
                id="cockpit-preview-canvas"
                style={{ 
                  zoom: zoomLevel / 100,
                  transition: 'zoom 0.2s ease-out' 
                }}
                className="bg-white rounded shadow-2xl text-slate-900 shrink-0 text-left h-auto min-h-fit"
              >
                <ResumeDocument 
                  resume={resume} 
                  isUpdated={true} 
                  templateId={selectedTemplateId} 
                  theme={currentTheme}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, Download, FileText, CheckCircle2, 
  Eye, RefreshCw, ZoomIn, ZoomOut, Layout, MessageSquare, 
  ShieldCheck, Filter, Check, Trash2, Edit3, Palette, Sliders, 
  Type, Columns, AlignLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Maximize2, 
  Minimize2, CheckCheck, AlertCircle, PlusCircle, MinusCircle, Flame, Search
} from 'lucide-react';
import ResumeDocument from './ResumeDocument';
import { exportResumeToPdf } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';
import { RESUME_TEMPLATES_CATALOG, TEMPLATE_TAG_FILTERS } from '../data/templateCatalog';
import { COLOR_PALETTES, FONT_FAMILIES, DENSITY_OPTIONS, DEFAULT_DESIGN_THEME } from '../data/themePresets';
import { computeResumeDiff } from '../utils/changeDiffDetector';

/**
 * RESUMEAI PRO — MODERN ULTRA-CLEAN SPLIT STUDIO
 * 
 * Inspired by Canva, Figma, and Resume.io:
 * - Left Panel (42%): Unified Workspace Tools (Templates Gallery [Default], AI Chat Editor, Colors & Fonts)
 * - Right Panel (58%): Live A4 Document Canvas with Zoom Controls and Docked AI Quick-Edit Bar
 * - Real-Time Instant 1-Click Template Switching
 * - Zero Developer Jargon or Intimidating Banners
 */
export default function InteractiveLiveStudio({
  resume,
  sourceResume,
  currentVersion = 2,
  selectedTemplateId = 'designer-dual',
  onSelectTemplate,
  onApplyRefinement,
  onRollback,
  onStartNewCv,
  versionHistory = [],
  designTheme = DEFAULT_DESIGN_THEME,
  onUpdateDesignTheme,
  onToggleCompare
}) {
  // Main Studio Tabs: 'templates' (Default visual gallery) | 'chat' (AI live editor) | 'styling' (Colors & typography)
  const [activeTab, setActiveTab] = useState('templates');
  
  const [promptInput, setPromptInput] = useState('');
  const [quickPromptInput, setQuickPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(80); // Default 80% fits standard viewports
  const [activeTemplateTag, setActiveTemplateTag] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const currentTheme = designTheme || DEFAULT_DESIGN_THEME;

  // Compute exact diff between original baseline and current working version
  const diffReport = computeResumeDiff(sourceResume, resume);

  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Your resume is loaded and ready! Select any executive template from the left gallery, or describe custom refinements in the AI prompt bar below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);
  const scrollCanvasRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollCanvasRef.current) {
      scrollCanvasRef.current.scrollTo({
        top: scrollCanvasRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    if (scrollCanvasRef.current) {
      scrollCanvasRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Show auto-dismissing toast notifications for user actions
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSendPrompt = async (customText = null) => {
    const text = customText || promptInput || quickPromptInput;
    if (!text || !text.trim() || isProcessing) return;

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, userMsg]);
    setPromptInput('');
    setQuickPromptInput('');
    setIsProcessing(true);

    try {
      if (onApplyRefinement) {
        const result = await onApplyRefinement(text.trim());
        const summaryText = result?.planSummary || `Instruction "${text.trim()}" live apply ho gaya hai.`;
        const aiResponseText = `✅ ${summaryText} Preview canvas me update check kijiye!`;
        
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
          showToast(`✅ ${summaryText}`);
        }, 400);
      }
    } catch (err) {
      console.error("Refinement error:", err);
      setIsProcessing(false);
      showToast("❌ Error applying update. Please try again.");
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
    showToast(`Color palette switched to: ${palette.name}`);
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
    showToast(`Layout set to: ${mode === 'two-column' ? 'Two-Column Sidebar' : 'Single-Column Linear'}`);
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
    showToast(`Font switched to: ${fontObj.name}`);
  };

  const handleCustomColorChange = (key, value) => {
    if (!onUpdateDesignTheme) return;
    onUpdateDesignTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filter templates by active category tag and search query
  const filteredTemplates = RESUME_TEMPLATES_CATALOG.filter(tpl => {
    const matchesTag = activeTemplateTag === 'All' || (tpl.tags && tpl.tags.includes(activeTemplateTag)) || tpl.category === activeTemplateTag;
    const matchesSearch = !templateSearch || tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) || (tpl.description && tpl.description.toLowerCase().includes(templateSearch.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const activeTemplateObj = RESUME_TEMPLATES_CATALOG.find(t => t.id === selectedTemplateId) || RESUME_TEMPLATES_CATALOG[0];

  return (
    <div className="flex flex-col gap-3 w-full max-w-[1600px] mx-auto text-slate-100 animate-fadeIn">
      
      {/* ========================================================
          1. ULTRA-CLEAN MODERN TOP BAR (NO DEVELOPER JARGON)
          ======================================================== */}
      <header className="bg-slate-900/90 backdrop-blur border border-slate-800 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Brand & Document Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                {resume?.header?.name || 'ResumeAI Pro'}
              </span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-medium">
                Version {currentVersion}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {activeTemplateObj?.name} • ATS Optimized Live Canvas
            </span>
          </div>
        </div>

        {/* Center: Undo & Rollback Control */}
        <div className="flex items-center gap-2">
          {versionHistory && versionHistory.length > 1 && (
            <button
              onClick={() => onRollback && onRollback(versionHistory.length - 1)}
              className="text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 px-3 py-1.5 rounded-xl border border-amber-600/30 flex items-center gap-1.5 transition cursor-pointer font-medium active:scale-95 shadow-sm"
              title="Undo last modification"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Edit (v{currentVersion})</span>
            </button>
          )}

          {/* Diff Tag if changes made */}
          {diffReport.hasChanges && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-xl text-[11px] text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{diffReport.totalChangesCount} Changes Verified</span>
            </div>
          )}
        </div>

        {/* Right: Zoom Presets & Primary Export Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl text-slate-300">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-9 text-center font-bold">{zoomLevel}%</span>
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
              className={`text-[10.5px] px-2 py-0.5 rounded transition cursor-pointer ${zoomLevel === 80 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Fit
            </button>
          </div>

          {/* Primary Action: Download PDF */}
          <button
            onClick={() => exportResumeToPdf('cockpit-preview-canvas', resume?.header?.name || 'Candidate', currentVersion)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            title="Download vector printable PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* Secondary Action: DOCX */}
          <button
            onClick={() => exportResumeToDocx(resume, currentVersion, selectedTemplateId)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            title="Download Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>DOCX</span>
          </button>

          {/* Split Compare Button */}
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Side-by-side comparison with original CV"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-sky-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          2. UNIFIED 2-PANE STUDIO (LEFT: TOOLS & TEMPLATES | RIGHT: LIVE CV)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ========================================================
            LEFT PANE (Col 5 / 42%): UNIFIED WORKSPACE TOOLS
            Tab 1: 🎨 36 Templates (Default, Large Visual Cards)
            Tab 2: 💬 AI Live Editor
            Tab 3: ✨ Colors & Typography
            ======================================================== */}
        <aside className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-140px)] min-h-[620px]">
          
          {/* Main Segmented Tool Tabs */}
          <div className="p-2 bg-slate-950 border-b border-slate-800 grid grid-cols-3 gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>36 Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('styling')}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'styling'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Colors & Style</span>
            </button>
          </div>

          {/* ----------------------------------------------------
              TAB 1: 36 TEMPLATES SHOWCASE (BIG VISUAL CARDS GRID)
              User Directive: "template bhi ek bada samne rehta kuch aisa format whi dikh jaye log select kre apply ho jaye"
              ---------------------------------------------------- */}
          {activeTab === 'templates' && (
            <div className="flex-1 flex flex-col overflow-hidden text-left">
              
              {/* Category Filters & Search */}
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-2 shrink-0">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search 36 templates by name or style..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                {/* Category Pills (Horizontal Scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {TEMPLATE_TAG_FILTERS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTemplateTag(tag)}
                      className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                        activeTemplateTag === tag
                          ? 'bg-sky-500 text-white font-bold shadow'
                          : 'bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Visual Templates Gallery */}
              <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 gap-3 auto-rows-max items-start min-h-0">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const isDual = tpl.layout === 'dual';

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        if (onSelectTemplate) {
                          onSelectTemplate(tpl.id);
                          showToast(`Applied: ${tpl.name}`);
                        }
                      }}
                      className={`group rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative min-h-[240px] ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-500 shadow-lg shadow-sky-500/20 ring-2 ring-sky-500/60 scale-[1.01]'
                          : 'bg-slate-950/60 hover:bg-slate-850/80 border-slate-800/90 hover:border-slate-700 hover:shadow-md'
                      }`}
                    >
                      {/* Visual Resume Schematic / Thumbnail */}
                      <div className="w-full h-32 bg-slate-100 p-2.5 flex flex-col justify-between border-b border-slate-800 relative overflow-hidden select-none">
                        
                        {/* Dual Column Layout Mockup */}
                        {isDual ? (
                          <div className="w-full h-full flex gap-1.5 bg-white rounded shadow-sm border border-slate-200 p-1.5">
                            {/* Left Colored Sidebar */}
                            <div 
                              className="w-1/3 h-full rounded-sm flex flex-col gap-1 p-1"
                              style={{ backgroundColor: tpl.accent || '#0284c7' }}
                            >
                              <div className="w-3 h-3 rounded-full bg-white/70 mx-auto" />
                              <div className="w-full h-1 bg-white/50 rounded" />
                              <div className="w-4/5 h-1 bg-white/50 rounded" />
                              <div className="w-3/5 h-1 bg-white/50 rounded mt-auto" />
                            </div>
                            {/* Right Main Body */}
                            <div className="w-2/3 h-full flex flex-col gap-1 p-0.5">
                              <div className="w-3/4 h-1.5 bg-slate-800 rounded" />
                              <div className="w-1/2 h-1 bg-slate-400 rounded mb-1" />
                              <div className="w-full h-1 bg-slate-300 rounded" />
                              <div className="w-full h-1 bg-slate-300 rounded" />
                              <div className="w-5/6 h-1 bg-slate-300 rounded" />
                              <div className="w-2/3 h-1 bg-slate-300 rounded" />
                            </div>
                          </div>
                        ) : (
                          /* Single Column Layout Mockup */
                          <div className="w-full h-full flex flex-col gap-1 bg-white rounded shadow-sm border border-slate-200 p-2">
                            <div className="w-1/2 h-2 mx-auto rounded" style={{ backgroundColor: tpl.accent || '#0284c7' }} />
                            <div className="w-3/4 h-1 mx-auto bg-slate-400 rounded mb-1" />
                            <div className="w-full h-0.5 bg-slate-300 rounded" />
                            <div className="w-full h-1 bg-slate-300 rounded" />
                            <div className="w-5/6 h-1 bg-slate-300 rounded" />
                            <div className="w-full h-1 bg-slate-300 rounded" />
                            <div className="w-4/6 h-1 bg-slate-300 rounded" />
                          </div>
                        )}

                        {/* Selected Indicator Ribbon */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                            <Check className="w-2.5 h-2.5" />
                            <span>ACTIVE</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-3 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white group-hover:text-sky-300 transition truncate">
                            {tpl.name}
                          </span>
                        </div>

                        {tpl.badge && (
                          <span className="text-[9.5px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-1.5 py-0.5 rounded-md w-fit">
                            {tpl.badge}
                          </span>
                        )}

                        <p className="text-[10.5px] text-slate-400 leading-snug line-clamp-2">
                          {tpl.description}
                        </p>

                        <div className="pt-2 mt-auto border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 uppercase font-mono">
                            {isDual ? '2-Column' : 'Single-Col'}
                          </span>

                          {isSelected ? (
                            <span className="text-sky-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          ) : (
                            <span className="text-slate-400 group-hover:text-white font-medium flex items-center gap-0.5">
                              1-Click Apply ➔
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 2: AI LIVE CHAT & CONVERSATIONAL EDITOR
              ---------------------------------------------------- */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden text-left">
              {/* Header Info */}
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-200">
                    AI Natural Language Live Editor
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  NLP AI Active
                </span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
                {chatLog.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div 
                      className={`p-3 rounded-2xl leading-relaxed shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-sky-600 text-white rounded-br-none' 
                          : 'bg-slate-850 text-slate-200 border border-slate-700/80 rounded-bl-none'
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
                    <span>Processing instruction and updating CV in real time...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10.5px]">
                <span className="text-slate-500 shrink-0 font-medium">Try:</span>
                {['Add Docker to skills', 'Make summary concise', 'Add new project', 'Remove bullet point'].map((suggestion, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendPrompt(suggestion)}
                    className="bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/70 whitespace-nowrap transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt();
                  }}
                  className="relative"
                >
                  <textarea
                    rows={2}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (promptInput.trim() && !isProcessing) {
                          handleSendPrompt();
                        }
                      }
                    }}
                    placeholder="Type any instruction (e.g. 'Add Docker to skills', 'Remove bullet point', 'Update headline to Senior Engineer')..."
                    disabled={isProcessing}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none disabled:opacity-50 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isProcessing}
                    className="absolute right-2 bottom-3.5 p-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition cursor-pointer shadow-sm"
                    title="Send instruction (Enter)"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 3: COLORS, STYLING & TYPOGRAPHY
              ---------------------------------------------------- */}
          {activeTab === 'styling' && (
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-xs text-left">
              
              {/* 1. Layout Mode Architecture */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
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
                    <span className="text-[9.5px] opacity-70 text-center">Compact sidebar for skills & contact</span>
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

                {currentTheme.layoutMode === 'two-column' && (
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1">
                    <span className="text-[10.5px] text-slate-400">Sidebar Position:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleSidebarPosition('left')}
                        className={`text-[10px] font-semibold px-3 py-1 rounded-lg transition cursor-pointer ${
                          currentTheme.sidebarPosition === 'left' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Left Sidebar
                      </button>
                      <button
                        onClick={() => handleToggleSidebarPosition('right')}
                        className={`text-[10px] font-semibold px-3 py-1 rounded-lg transition cursor-pointer ${
                          currentTheme.sidebarPosition === 'right' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Right Sidebar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 12 Curated Designer Color Palettes */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  2. Designer Color Palettes (1-Click Switch)
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

              {/* 3. Granular Custom Color Pickers */}
              <div className="flex flex-col gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  3. Custom Accent Colors
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
                </div>
              </div>

              {/* 4. Typography Font Families */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  4. Font Typography
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_FAMILIES.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => handleFontChange(font)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        currentTheme.fontId === font.id
                          ? 'bg-sky-950/60 border-sky-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] block">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ========================================================
            RIGHT PANE (Col 7 / 58%): LIVE CV CANVAS & DOCKED AI QUICK-EDIT BAR
            ======================================================== */}
        <main className="lg:col-span-7 flex flex-col gap-2">
          
          {/* Subheader: Canvas Status & Scroll Jump Controls */}
          <div className="flex flex-wrap justify-between items-center px-1 gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Live Interactive Canvas:
              </span>
              <span className="text-xs font-semibold text-white bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-800">
                {activeTemplateObj?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Scroll Jump Controls */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-[10.5px]">
                <button
                  onClick={scrollToTop}
                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                  title="Scroll to Top"
                >
                  <ArrowUp className="w-3 h-3 text-sky-400" />
                  <span>Top</span>
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={scrollToBottom}
                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                  title="Scroll to Bottom"
                >
                  <ArrowDown className="w-3 h-3 text-sky-400" />
                  <span>Bottom</span>
                </button>
              </div>

              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" />
                Facts Locked
              </span>
            </div>
          </div>

          {/* Document Viewport - Auto-sized with full scrollability */}
          <div 
            ref={scrollCanvasRef}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] min-h-[580px] shadow-2xl flex justify-center items-start text-left scroll-smooth"
          >
            <div 
              id="cockpit-preview-canvas"
              style={{ 
                zoom: zoomLevel / 100,
                transition: 'zoom 0.2s ease-out' 
              }}
              className="bg-white rounded-lg shadow-2xl text-slate-900 shrink-0 text-left h-auto min-h-fit"
            >
              <ResumeDocument 
                resume={resume} 
                isUpdated={true} 
                templateId={selectedTemplateId} 
                theme={currentTheme}
              />
            </div>
          </div>

          {/* DOCKED AI QUICK-EDIT BAR (Always accessible at the bottom) */}
          <div className="bg-slate-900/95 backdrop-blur border border-slate-800 p-2 rounded-2xl shadow-xl flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sky-400 pl-2 shrink-0">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden sm:inline">AI Quick Edit:</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex-1 flex items-center gap-2"
            >
              <input
                type="text"
                value={quickPromptInput}
                onChange={(e) => setQuickPromptInput(e.target.value)}
                placeholder="Type any instruction (e.g. 'Add Docker to skills', 'Make summary concise', 'Remove bullet point')..."
                disabled={isProcessing}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!quickPromptInput.trim() || isProcessing}
                className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shrink-0 shadow"
                title="Apply AI edit"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Apply</span>
              </button>
            </form>
          </div>

        </main>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, Download, FileText, CheckCircle2, 
  Eye, RefreshCw, ZoomIn, ZoomOut, Layout, MessageSquare, 
  ShieldCheck, Filter, Check, Trash2, Edit3, Palette, Sliders, 
  Type, Columns, AlignLeft, ArrowLeftRight, CheckCheck 
} from 'lucide-react';
import ResumeDocument from './ResumeDocument';
import { exportResumeToPdf } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';
import { RESUME_TEMPLATES_CATALOG, TEMPLATE_TAG_FILTERS } from '../data/templateCatalog';
import { COLOR_PALETTES, FONT_FAMILIES, DENSITY_OPTIONS, DEFAULT_DESIGN_THEME } from '../data/themePresets';

/**
 * INTERACTIVE SPLIT-SCREEN COCKPIT STUDIO (SCREEN 7 USER-OPTIMIZED)
 * 
 * Layout Architecture:
 * - LEFT SIDE (65% width): Full-Fidelity CV Visuals / Preview (No up-down scrolling needed, perfectly aligned).
 * - RIGHT SIDE (35% width): Tabbed Control Cockpit:
 *     Tab 1: 🤖 AI Live Edit (Conversational Prompt Assistant with instant deletions, updates & additions).
 *     Tab 2: 🎨 36 Modern Templates (Single-Grid with Filter Tags and 1-Click instant switch).
 *     Tab 3: 🖌️ Design & Colors (Dynamic 2-Col vs 1-Col, 12 Color Palettes, Custom Color Pickers, Typography).
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
  const [rightPanelTab, setRightPanelTab] = useState('edit'); // 'edit' | 'templates' | 'design'
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTemplateTag, setActiveTemplateTag] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');

  const currentTheme = designTheme || DEFAULT_DESIGN_THEME;

  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Aapka CV live load ho chuka hai! Yahan aam bolchal me likhein jaise "Nathcorp delete karo", "Summary short karo", ya "Python add karo". Tab 3 me jaakar colors aur 2-column/1-column layout customize kar sakte hain!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const quickActionChips = [
    { label: '🗑️ Nathcorp delete karo', prompt: 'Nathcorp wala experience delete kar do.' },
    { label: '🗑️ Pulse Solutions delete karo', prompt: 'Pulse Solutions company ka experience remove kar do.' },
    { label: '⚡ Summary 3 lines me concise karo', prompt: 'Executive summary ko 3 punchy, high-impact lines me concise kar do.' },
    { label: '🚀 Projects me live apps highlight karo', prompt: 'Key projects me 6 live applications with Vercel and Supabase cloud stack highlight karo.' },
    { label: '🛠️ Python & Antigravity skills me add karo', prompt: 'Skills me Python, Google Antigravity, aur Supabase add karo.' }
  ];

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
        const aiResponseText = `Maine aapka instruction execute kar diya hai ("${text.trim()}"). Left side me live preview check kijiye!`;
        
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
    // If switching to two-column and currently on a single-column-only template, switch to designer-dual
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
      {/* Top Banner Toolbar */}
      <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">Live CV Cockpit Studio</h2>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.2 rounded-full font-mono">
                Version {currentVersion} Active
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.2 rounded-full font-mono">
                {currentTheme.layoutMode === 'two-column' ? '2-Column Mode' : '1-Column Mode'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Left: Visual CV & Instant Preview • Right: AI Live Edit, 36 Templates & Design Colors.
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Quick Layout Mode Pill Toggle */}
          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => handleToggleLayoutMode('two-column')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
                currentTheme.layoutMode === 'two-column' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Two-column dual sidebar layout"
            >
              <Columns className="w-3 h-3" />
              <span>Two-Column</span>
            </button>
            <button
              onClick={() => handleToggleLayoutMode('single-column')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
                currentTheme.layoutMode === 'single-column' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Classic single-column linear layout"
            >
              <AlignLeft className="w-3 h-3" />
              <span>Single-Column</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
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
          </div>

          <button
            onClick={() => exportResumeToPdf('cockpit-preview-canvas', resume?.header?.name || 'Candidate', currentVersion)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Download vector printable PDF with exact alignment"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => exportResumeToDocx(resume, currentVersion, selectedTemplateId)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Download Microsoft Word DOCX"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </button>
        </div>
      </div>

      {/* Main Cockpit Layout: LEFT SIDE (CV Visuals) + RIGHT SIDE (Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================
            LEFT SIDE (Col 7 / 60%): CV VISUALS / PREVIEW CANVAS
            ======================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              CV Visual Preview (Left-Aligned • 100% Hubahu)
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentTheme.primaryColor }} />
                <span>Theme: {currentTheme.primaryColor}</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" />
                Strict Left-Alignment
              </span>
            </div>
          </div>

          {/* Document Viewport */}
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 overflow-x-auto overflow-y-auto max-h-[860px] shadow-2xl flex justify-center text-left">
            <div 
              id="cockpit-preview-canvas"
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out' 
              }}
              className="bg-white rounded shadow-2xl overflow-hidden text-slate-900 shrink-0 text-left"
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

        {/* ========================================================
            RIGHT SIDE (Col 5 / 40%): CONTROL COCKPIT (AI EDIT + TEMPLATES + DESIGN)
            ======================================================== */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden h-[860px]">
          {/* Panel Tab Switcher Header (3 TABS) */}
          <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5">
            <button
              onClick={() => setRightPanelTab('edit')}
              className={`flex-1 text-[11px] sm:text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelTab === 'edit'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Edit</span>
            </button>

            <button
              onClick={() => setRightPanelTab('templates')}
              className={`flex-1 text-[11px] sm:text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelTab === 'templates'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>36 Templates</span>
            </button>

            <button
              onClick={() => setRightPanelTab('design')}
              className={`flex-1 text-[11px] sm:text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelTab === 'design'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design & Colors</span>
            </button>
          </div>

          {/* TAB 1: AI LIVE EDIT ASSISTANT */}
          {rightPanelTab === 'edit' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Chat Stream Log */}
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
                    <span>Applying refinement and synchronizing state...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Quick Chips + Interactive Prompt Box */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    1-Click Edit Commands:
                  </span>
                  {versionHistory.length > 1 && (
                    <button
                      onClick={() => onRollback && onRollback(versionHistory.length - 1)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Undo</span>
                    </button>
                  )}
                </div>

                {/* 1-Click Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {quickActionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(chip.prompt)}
                      disabled={isProcessing}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10.5px] px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>

                {/* Textarea Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt();
                  }}
                  className="relative mt-1"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g. 'Nathcorp delete karo' ya 'Summary 3 line karo'..."
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
              </div>
            </div>
          )}

          {/* TAB 2: 36 MODERN TEMPLATES CATALOG */}
          {rightPanelTab === 'templates' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search & Category Filter Toolbar */}
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2 shrink-0">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search template name..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />

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

              {/* Template Cards List */}
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
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
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

          {/* TAB 3: 🎨 DESIGN, COLORS & LAYOUT ENGINE (USER REQUESTED) */}
          {rightPanelTab === 'design' && (
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-xs text-left">
              {/* 1. LAYOUT ARCHITECTURE SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-[10.5px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Columns className="w-3.5 h-3.5" />
                  1. Layout Structure (Two-Column vs Single-Column)
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

                        {/* Visual Palette Preview Swatches */}
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
                  {/* Primary Accent */}
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

                  {/* Sidebar Background */}
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

                  {/* Main Page Background */}
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

                  {/* Text Color */}
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

              {/* 5. RESET BUTTON */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onUpdateDesignTheme && onUpdateDesignTheme(DEFAULT_DESIGN_THEME)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Styling to Default</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

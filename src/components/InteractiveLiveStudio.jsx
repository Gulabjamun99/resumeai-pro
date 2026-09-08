import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, Download, FileText, CheckCircle2, 
  Eye, RefreshCw, ZoomIn, ZoomOut, Layout, MessageSquare, 
  ShieldCheck, Filter, Check, Trash2, Edit3 
} from 'lucide-react';
import ResumeDocument from './ResumeDocument';
import { exportResumeToPdf } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';
import { RESUME_TEMPLATES_CATALOG, TEMPLATE_TAG_FILTERS } from '../data/templateCatalog';

/**
 * INTERACTIVE SPLIT-SCREEN COCKPIT STUDIO (SCREEN 7 USER-OPTIMIZED)
 * 
 * Layout Architecture:
 * - LEFT SIDE (65% width): Full-Fidelity CV Visuals / Preview (No up-down scrolling needed, perfectly aligned).
 * - RIGHT SIDE (35% width): Tabbed Control Cockpit:
 *     Tab 1: 🤖 AI Live Edit (Conversational Prompt Assistant with instant deletions, updates & additions).
 *     Tab 2: 🎨 36 Modern Templates (Single-Grid with Filter Tags and 1-Click instant switch).
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
  versionHistory = []
}) {
  const [rightPanelTab, setRightPanelTab] = useState('edit'); // 'edit' | 'templates'
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTemplateTag, setActiveTemplateTag] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');

  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Aapka CV live load ho chuka hai! Yahan aam bolchal me likhein jaise "Nathcorp delete karo", "Summary short karo", ya "Python add karo".',
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
        }, 500);
      }
    } catch (err) {
      console.error("Refinement error:", err);
      setIsProcessing(false);
    }
  };

  const filteredTemplates = RESUME_TEMPLATES_CATALOG.filter(tpl => {
    const matchesTag = activeTemplateTag === 'All' || (tpl.tags && tpl.tags.includes(activeTemplateTag));
    const matchesSearch = !templateSearch || 
      tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-3 w-full max-w-[1680px] mx-auto">
      {/* Studio Top Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Live CV Cockpit Studio
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Version {currentVersion} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Left side: CV Visuals ➔ Right side: AI Edit Assistant & 36 Modern Templates (Zero Scroll).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
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
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              Strict Left-Alignment Guard
            </span>
          </div>

          {/* Document Viewport */}
          <div className="bg-slate-950/90 p-4 sm:p-6 rounded-xl border border-slate-800 overflow-x-auto shadow-2xl flex justify-center items-start min-h-[820px] text-left">
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
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT SIDE (Col 5 / 40%): CONTROL COCKPIT (AI EDIT + TEMPLATES)
            ======================================================== */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden h-[860px]">
          {/* Panel Tab Switcher Header */}
          <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5">
            <button
              onClick={() => setRightPanelTab('edit')}
              className={`flex-1 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                rightPanelTab === 'edit'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Live Edit Assistant</span>
            </button>

            <button
              onClick={() => setRightPanelTab('templates')}
              className={`flex-1 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                rightPanelTab === 'templates'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>36 Modern Templates</span>
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
                  <div className="flex items-center gap-2 text-sky-400 bg-sky-950/40 border border-sky-800/40 p-2.5 rounded-lg mr-auto">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-[11px] font-medium">Applying your change to CV...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    1-Click Edit Commands:
                  </span>
                  {versionHistory.length > 1 && (
                    <button
                      onClick={() => onRollback && onRollback(versionHistory[versionHistory.length - 2]?.version || 1)}
                      className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                      title="Undo last change"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Undo</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {quickActionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(chip.prompt)}
                      disabled={isProcessing}
                      className="text-[10.5px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2 py-1 rounded-md transition text-left cursor-pointer disabled:opacity-50"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Form */}
              <div className="p-3 bg-slate-950 border-t border-slate-800">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g. 'Nathcorp delete karo' ya 'Summary 3 line karo'..."
                    disabled={isProcessing}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isProcessing}
                    className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white disabled:text-slate-600 p-2 rounded-lg transition cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: 36 MODERN TEMPLATES GALLERY (RIGHT SIDE INTEGRATED) */}
          {rightPanelTab === 'templates' && (
            <div className="flex-1 flex flex-col gap-3 p-3 overflow-hidden">
              {/* Search & Tag Filter Bar */}
              <div className="flex flex-col gap-2">
                <input 
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search template name..."
                  className="bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 px-3 py-1.5 rounded-lg outline-none focus:border-sky-500 w-full"
                />

                {/* Filter Tag Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  <Filter className="w-3 h-3 text-slate-500 shrink-0 mr-1" />
                  {TEMPLATE_TAG_FILTERS.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTemplateTag(tag)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap transition cursor-pointer ${
                        activeTemplateTag === tag
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Templates Grid */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => onSelectTemplate && onSelectTemplate(tpl.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 text-left ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-500 shadow-md ring-1 ring-sky-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full inline-block" 
                            style={{ backgroundColor: tpl.accent || '#0284c7' }}
                          />
                          {tpl.name}
                        </span>
                        {isSelected && (
                          <span className="bg-sky-500 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <span className="inline-block text-[9px] font-semibold bg-slate-800 text-sky-400 border border-slate-700 px-1.5 py-0.2 rounded w-fit">
                        {tpl.badge}
                      </span>

                      <p className="text-[10.5px] text-slate-400 leading-snug line-clamp-2">
                        {tpl.description}
                      </p>

                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/60">
                        <span>{tpl.category}</span>
                        <span>{tpl.layout === 'dual' ? '2-Column' : 'Single-Col'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

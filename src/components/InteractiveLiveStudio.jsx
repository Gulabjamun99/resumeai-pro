import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, Download, FileText, CheckCircle2, 
  ArrowLeft, ArrowRight, Eye, RefreshCw, ZoomIn, ZoomOut, 
  Sliders, MessageSquare, ShieldCheck, AlertCircle, Maximize2 
} from 'lucide-react';
import ResumeDocument from './ResumeDocument';
import { exportResumeToPdf } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';

/**
 * INTERACTIVE SPLIT-SCREEN LIVE STUDIO (SCREEN 7 PREMIUM EDITION)
 * 
 * Left Pane: Conversational AI Prompt Assistant with quick-action chips.
 * Right Pane: Real-time reactive WYSIWYG Hubahu CV preview with instant visual feedback.
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
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRefinedSection, setLastRefinedSection] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Aapka CV 100% Hubahu format me load ho chuka hai! Yahan aam bolchal me batayein agar koi bhi line, bullet, spacing ya skill change karni ho.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const quickActionChips = [
    { label: '⚡ Summary ko 3 crisp lines me karo', prompt: 'Executive summary ko 3 punchy, high-impact lines me concise kar do.' },
    { label: '🚀 Project bullets me metrics add karo', prompt: 'Key projects me realistic performance metrics jaise 99.9% uptime, 10x faster deployment highlight karo.' },
    { label: '🛠️ Naye trending AI skills highlight karo', prompt: 'Google Antigravity, Claude 3.7, Vercel, Supabase, aur Vibe Coding ko skills me prominently add karo.' },
    { label: '🔠 Alignment aur tight spacing fix karo', prompt: 'Sidebar aur main body ke margins aur line-heights ko executive compact balance me align karo.' }
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
        setLastRefinedSection(result?.section || 'general');
      }

      setTimeout(() => {
        const aiMsg = {
          sender: 'ai',
          text: `Maine aapke request ke mutabik changes live update kar diye hain! Right side preview me dekhiye. Kya yeh theek hai ya kuch aur modify karein?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatLog(prev => [...prev, aiMsg]);
        setIsProcessing(false);
      }, 700);
    } catch (err) {
      console.error("Refinement error:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
      {/* Studio Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-xl flex flex-wrap justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Interactive Split-Screen Studio
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/80 px-2 py-0.5 rounded-full font-mono">
                Version {currentVersion} Live
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Left side se AI ko instruction dein ➔ Right side me instant Live CV preview update dekhein.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(125, prev + 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => exportResumeToPdf('interactive-preview-canvas', resume?.header?.name || 'Candidate', currentVersion)}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Download vector printable PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => exportResumeToDocx(resume, currentVersion, selectedTemplateId)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
            title="Download Microsoft Word DOCX"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Conversational AI Prompt Assistant (Col 5) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden h-[780px]">
          {/* Assistant Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AI Live Refinement Assistant
              </span>
            </div>

            {versionHistory && versionHistory.length > 1 && (
              <button
                onClick={() => onRollback && onRollback(versionHistory[versionHistory.length - 2]?.version || 1)}
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                title="Undo last change"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}
          </div>

          {/* Chat Stream Log */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
            {chatLog.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[88%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
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
                <span className="text-[11px] font-medium">Processing your edit & updating Live CV...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[10.5px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Suggestions (Click to Apply):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {quickActionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(chip.prompt)}
                  disabled={isProcessing}
                  className="text-[10.5px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1 rounded-md transition text-left cursor-pointer disabled:opacity-50"
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
                placeholder="Yahan likhein: e.g. 'Project me 2 bullets badha do'..."
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

        {/* RIGHT PANE: Live WYSIWYG Hubahu Preview (Col 7) */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              Live Interactive Hubahu Preview
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              WYSIWYG Parity Protected
            </span>
          </div>

          {/* Canvas Viewport Container */}
          <div 
            className="bg-slate-950/80 p-3 sm:p-5 rounded-xl border border-slate-800 overflow-x-auto shadow-2xl flex justify-center items-start min-h-[780px]"
          >
            <div 
              id="interactive-preview-canvas"
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out' 
              }}
              className="bg-white rounded-md shadow-2xl overflow-hidden text-slate-900 shrink-0"
            >
              <ResumeDocument 
                resume={resume} 
                isUpdated={true} 
                templateId={selectedTemplateId} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, RotateCw, Download, FileText, CheckCircle2, 
  ZoomIn, ZoomOut, RefreshCw, Layout, MessageSquare, Palette, Target, 
  Check, ArrowRight, Wand2, ShieldCheck, Copy, ChevronRight, Layers, FileDown
} from 'lucide-react';
import ResumeCanvas from './ResumeCanvas.jsx';
import { exportResumeToPdf } from '../utils/pdfExporter.js';
import { exportResumeToDocx } from '../utils/docxExporter.js';
import { refineCvWithAi, tailorCvToJd } from '../services/geminiService.js';
import confetti from 'canvas-confetti';

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
  const [selectedAccent, setSelectedAccent] = useState(resume?.styleProfile?.accentColor || '#2563eb');
  const [selectedFont, setSelectedFont] = useState(resume?.styleProfile?.fontFamily || 'font-sans');
  const [selectedLayout, setSelectedLayout] = useState('auto');
  const [jdInputText, setJdInputText] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: initialMode === 'fresh'
        ? "👋 Welcome! Main aapka AI Career Architect hoon. ChatGPT ya Gemini ki tarah kisi bhi bhasha (Hindi, Hinglish, English) me mujhe apne baare me batayein — aapka naam, target role, education, projects, skills ya experience. Main real-time me aapka resume assemble aur ATS-optimize karta jaunga!"
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

  // Handle AI Chat Refinement
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || promptInput).trim();
    if (!text || isAiProcessing) return;

    setPromptInput('');
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiProcessing(true);

    try {
      const result = await refineCvWithAi(text, resume, chatMessages);

      if (result && result.updatedCv) {
        onUpdateResume(result.updatedCv, result.planSummary || text);

        setChatMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: result.explanation || "✅ Changes live canvas par apply ho gaye hain! All text formatted in 100% Corporate English with strict 1-2 page A4 budget.",
            planSummary: result.planSummary,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        } catch (_) {}
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: "AI service se response generate nahi ho paya. Kripya punah prayas karein.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error("AI Refine Error:", err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "AI service abhi busy hai. Kripya dobara try karein.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle 1-Click JD Tailoring
  const handleTailorToJd = async () => {
    if (!jdInputText.trim() || isAiProcessing) return;
    setIsAiProcessing(true);

    try {
      const result = await tailorCvToJd(resume, jdInputText);
      if (result && result.updatedCv) {
        onUpdateResume(result.updatedCv, result.planSummary || "Tailored to Job Description");
        setChatMessages(prev => [
          ...prev,
          {
            id: `jd-${Date.now()}`,
            sender: 'ai',
            text: `🎯 ${result.explanation || "Resume successfully tailored to Job Description!"} Match score boosted to 95%+!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setActiveTab('chat');
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      }
    } catch (err) {
      console.error("JD Tailor Error:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // PDF Export
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportResumeToPdf('resume-document', resume?.header?.name || 'Candidate');
    } catch (err) {
      alert("Failed to export PDF: " + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // DOCX Export
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportResumeToDocx(resume);
    } catch (err) {
      alert("Failed to export DOCX: " + err.message);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col md:flex-row bg-slate-100/90 text-slate-800 overflow-hidden">
      
      {/* LEFT CONTROL PANEL (40% width) */}
      <aside className="w-full md:w-[42%] lg:w-[38%] xl:w-[35%] bg-white border-r border-slate-200/90 flex flex-col h-full shadow-xs shrink-0 z-10">
        {/* Navigation Tabs */}
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
            <span>Design & Templates</span>
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

        {/* TAB 2: TEMPLATES & STYLING */}
        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Layout Switcher */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-blue-600" />
                <span>Format & Layout Style</span>
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedLayout('single-column')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedLayout === 'single-column'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-8 bg-slate-100 rounded mb-2 border border-slate-200 flex flex-col justify-around p-1">
                    <div className="w-3/4 h-1 bg-slate-400 rounded"></div>
                    <div className="w-1/2 h-1 bg-slate-300 rounded"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Single-Column Linear</span>
                  <span className="text-[10.5px] text-slate-500">Standard clean white ATS layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLayout('two-column-sidebar')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedLayout === 'two-column-sidebar'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-8 bg-slate-100 rounded mb-2 border border-slate-200 flex gap-1 p-1">
                    <div className="w-1/3 h-full bg-slate-300 rounded"></div>
                    <div className="w-2/3 h-full flex flex-col justify-around">
                      <div className="w-3/4 h-1 bg-slate-400 rounded"></div>
                      <div className="w-1/2 h-1 bg-slate-300 rounded"></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Two-Column Sidebar</span>
                  <span className="text-[10.5px] text-slate-500">Modern sidebar for skills & contact</span>
                </button>
              </div>
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
                    onClick={() => setSelectedAccent(c.value)}
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
                    onClick={() => setSelectedFont(f.value)}
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

            {/* Page Budget Reminder */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Strict Max 1–2 Page Guarantee</span>
                <span className="text-[11px] text-emerald-700 leading-tight">
                  Har ek layout standard A4 proportions (210mm x 297mm) me calibrated hai. Chahe kitna bhi content ho, ye 2 page ke andar hi fit rahega.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JOB DESCRIPTION TAILOR */}
        {activeTab === 'jd' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Target className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Job Description (JD) Semantic Tailor</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aap jis job ke liye apply karna chahte hain, uski Job Description (JD) yahan paste karein. AI candidate ke authentic facts ko target JD keywords ke sath align karke 95%+ ATS semantic match achieve karega.
              </p>

              <textarea
                rows={8}
                value={jdInputText}
                onChange={(e) => setJdInputText(e.target.value)}
                placeholder="Paste Job Description (JD) text here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleTailorToJd}
              disabled={!jdInputText.trim() || isAiProcessing}
              className={`w-full py-3 rounded-xl font-semibold text-xs text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer mt-4 ${
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
              templateLayout={selectedLayout}
            />
          </div>
        </div>
      </main>

    </div>
  );
}

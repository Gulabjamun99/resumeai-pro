import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, RotateCcw, RotateCw, Download, FileText, CheckCircle2, 
  Eye, RefreshCw, ZoomIn, ZoomOut, Layout, MessageSquare, 
  ShieldCheck, Filter, Check, Trash2, Edit3, Palette, Sliders, 
  Type, Columns, AlignLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Maximize2, 
  Minimize2, CheckCheck, AlertCircle, PlusCircle, MinusCircle, Flame, Search, Target, Wand2, Upload, Printer
} from 'lucide-react';
import ResumeDocument from './ResumeDocument';
import QuickEditPanel from './QuickEditPanel';
import { exportResumeToPdf, printResume } from '../utils/pdfExporter';
import { exportResumeToDocx } from '../utils/docxExporter';
import { RESUME_TEMPLATES_CATALOG, TEMPLATE_TAG_FILTERS } from '../data/templateCatalog';
import { COLOR_PALETTES, FONT_FAMILIES, DENSITY_OPTIONS, DEFAULT_DESIGN_THEME } from '../data/themePresets';
import { computeResumeDiff, isDiffInquiry, isConversationalQuestion, formatDiffAsExplanation, isJdOptimizationRequest, isImprovementOrOptionsRequest, generateDomainImprovementOptions } from '../utils/changeDiffDetector';
import { getGeminiChatResponse } from '../services/geminiService';

/**
 * RESUMEAI PRO — MODERN ULTRA-CLEAN SPLIT STUDIO
 * 
 * Inspired by Canva, Figma, and Resume.io:
 * - Left Panel (42%): Unified Workspace Tools (AI Chat, Quick Direct Edit, Templates, Colors & Fonts)
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
  onToggleCompare,
  initialMode = 'upload',
  initialJd = '',
  onDirectUpdateCv,
  onLiveSyncCv
}) {
  const latestVersionSnapshot = versionHistory.length > 0 ? versionHistory[versionHistory.length - 1] : null;
  const isPostChangeVersion = currentVersion > 1 || (versionHistory.length > 1);

  // Undo / Redo State & Handlers
  const canUndo = currentVersion > 1;
  const canRedo = currentVersion < (versionHistory?.length || 0);

  const handleUndo = () => {
    if (canUndo && onRollback) {
      onRollback(currentVersion - 1);
      showToast(`Undo applied: Restored Version ${currentVersion - 1}`);
    }
  };

  const handleRedo = () => {
    if (canRedo && onRollback) {
      onRollback(currentVersion + 1);
      showToast(`Redo applied: Advanced to Version ${currentVersion + 1}`);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVersion, versionHistory]);

  // Main Studio Tabs: Default to 'chat' like ChatGPT / Claude
  const [activeTab, setActiveTab] = useState('chat');
  
  const [promptInput, setPromptInput] = useState('');
  const [quickPromptInput, setQuickPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(80); // Default 80% fits standard viewports
  const [activeTemplateTag, setActiveTemplateTag] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [jdInputText, setJdInputText] = useState('');

  const currentTheme = designTheme || DEFAULT_DESIGN_THEME;

  // Compute exact diff between original baseline and current working version
  const diffReport = computeResumeDiff(sourceResume, resume);

  const isFreshMode = initialMode === 'fresh' || resume?.header?.name === 'Your Full Name' || resume?.header?.name === 'Your Name';
  const isJdMode = initialMode === 'jd';

  let initialGreetingText;
  if (isPostChangeVersion && latestVersionSnapshot?.summary) {
    initialGreetingText = `✅ Version ${currentVersion} update applied: "${latestVersionSnapshot.summary}". Live canvas updated! Aap koi aur change bol sakte hain.`;
  } else if (isFreshMode) {
    initialGreetingText = `👋 Welcome to AI Career Builder!\n\nMain aapka AI Career Architect hoon. ChatGPT ya Gemini ki tarah kisi bhi language (Hindi, Hinglish, English) me mujhe apne baare me batayein — aapka naam, target role, education, projects, skills ya experience.\n\nJaise hi aap batayenge, main realtime me aapka resume live canvas par assemble aur ATS-optimize karta jaunga!`;
  } else if (isJdMode) {
    initialGreetingText = `🎯 Job Description (JD) Semantic Tailoring Mode:\n\nAap jis job ke liye apply karna chahte hain, uski Job Description (JD) yahan chat me paste karein ya "Tailor to JD" button dabayein. Main aapke resume ko 95%+ ATS semantic match ke sath optimize kar dunga!`;
  } else {
    initialGreetingText = 'Aapka resume live canvas par loaded hai! ChatGPT/Gemini ki tarah kisi bhi language (Hindi, Hinglish, English) me batayein — kya add karna hai, kya change karna hai, ya kaisa resume banana hai.';
  }

  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: initialGreetingText,
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

  useEffect(() => {
    if (initialJd && initialJd.trim()) {
      const timer = setTimeout(() => {
        handleSendPrompt(`Tailor this resume to strictly match the following target Job Description. Align experience bullets with measurable STAR outcomes, incorporate key required technical and domain competencies, and optimize for 95%+ ATS parseability:\n\n${initialJd.trim()}`);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

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

    const trimmed = text.trim();
    const userMsg = {
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, userMsg]);
    setPromptInput('');
    setQuickPromptInput('');
    setIsProcessing(true);

    // 1. INQUIRY / DIFF QUESTION INTENT (e.g. "kya kya change kha kha kiye ye bataye")
    if (isDiffInquiry(trimmed)) {
      const latestDiff = computeResumeDiff(sourceResume, resume);
      const explanation = formatDiffAsExplanation(latestDiff, currentVersion);
      let geminiReply = null;
      try {
        geminiReply = await getGeminiChatResponse(trimmed, resume, explanation, chatLog);
      } catch (err) {
        console.warn("Gemini chat query fallback:", err.message);
      }

      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: geminiReply || explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsProcessing(false);
      return;
    }

    // 1.5 CONVERSATIONAL QUESTIONS & CV CHECKS (e.g. "education kha add kiye hai aap dikhaye", "targetCompany se pehle ek tha check krye")
    if (isConversationalQuestion(trimmed)) {
      let geminiReply = null;
      try {
        geminiReply = await getGeminiChatResponse(trimmed, resume, null, chatLog);
      } catch (err) {
        console.warn("Gemini conversational question fallback:", err.message);
      }

      if (!geminiReply) {
        const compList = (resume?.experiences || []).map(e => e.company).join(', ');
        const eduList = (resume?.education || []).map(e => typeof e === 'string' ? e : e?.degree).join(', ');
        geminiReply = `Aapke live canvas par abhi ye details hain:\n• **Experiences:** ${compList || 'None'}\n• **Education:** ${eduList || 'None'}\n\nAapko isme jo bhi change karwana hai, mujhe batayein!`;
      }

      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: geminiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsProcessing(false);
      return;
    }

    // 2. SUGGESTIONS & MULTI-TRACK OPTIONS INTENT (e.g. "ye acha nhi lag rha hai koi tarike se ache bnao")
    if (isImprovementOrOptionsRequest(trimmed)) {
      const options = generateDomainImprovementOptions(resume);
      const optionsText = `Bilkul! Jab aapko lagta hai ki resume me aur impact chahiye, toh hum aapke career profile ke hisaab se 3 tailored tracks offer karte hain:\n\n` +
        options.map((opt) => `🔹 **${opt.title}:**\n${opt.description}`).join('\n\n') +
        `\n\n👇 **Neeche diye gaye kisi bhi track par click karke aap ise turant live canvas par apply kar sakte hain:**`;

      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: optionsText,
          options: options,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsProcessing(false);
      return;
    }

    // 3. RESUME REFINEMENT / JD TAILORING INTENT
    try {
      if (onApplyRefinement) {
        const result = await onApplyRefinement(trimmed, chatLog);

        if (result && result.success === false) {
          setChatLog(prev => [
            ...prev,
            {
              sender: 'ai',
              text: result.aiExplanation || result.error || 'AI service se response generate nahi ho paya. Kripya punah prayas karein.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsProcessing(false);
          showToast('⚠️ AI service busy. Kripya retry karein.');
          return;
        }

        const stepDiff = result?.stepDiff;

        // Build conversational response like ChatGPT / Claude / Gemini
        let naturalExplanation = result?.aiExplanation || null;
        if (!naturalExplanation) {
          try {
            naturalExplanation = await getGeminiChatResponse(trimmed, result?.updatedCv || resume, result?.planSummary, chatLog);
          } catch (gemErr) {
            console.warn("Gemini chat explanation fallback:", gemErr.message);
          }
        }

        // Crisp factual diff highlights to accompany the conversational response
        let diffBadge = '';
        if (stepDiff && stepDiff.hasChanges) {
          const highlights = [];
          if (stepDiff.summaryChanged) highlights.push('• Professional summary updated with executive impact');
          if (stepDiff.headlineChanged) highlights.push(`• Headline updated to: "${stepDiff.headlineAfter}"`);
          if (stepDiff.addedCompanies?.length > 0) {
            stepDiff.addedCompanies.forEach(c => highlights.push(`• Added experience: ${c.company} (${c.role || ''})`));
          }
          if (stepDiff.modifiedCompanies?.length > 0) {
            stepDiff.modifiedCompanies.forEach(c => highlights.push(`• ${c.company}: ${c.changesSummary}`));
          }
          if (stepDiff.addedProjects?.length > 0) {
            stepDiff.addedProjects.forEach(p => highlights.push(`• Added project: ${p.title}`));
          }
          if (stepDiff.addedEducation?.length > 0) {
            stepDiff.addedEducation.forEach(e => highlights.push(`• Added education: ${e}`));
          }
          if (stepDiff.removedEducation?.length > 0) {
            stepDiff.removedEducation.forEach(e => highlights.push(`• Removed education: ${e}`));
          }
          if (stepDiff.removedSkills?.length > 0) {
            highlights.push(`• Skills updated: removed ${stepDiff.removedSkills.join(', ')}`);
          }
          if (stepDiff.contactChanged) {
            highlights.push(`• Contact details updated`);
          }

          if (highlights.length > 0) {
            diffBadge = `\n\n📋 **Canvas Updates Applied:**\n` + highlights.slice(0, 5).join('\n');
          }
        }

        let finalText = '';
        if (naturalExplanation) {
          finalText = naturalExplanation + (diffBadge ? diffBadge : '');
        } else if (stepDiff && stepDiff.hasChanges) {
          finalText = `✅ **${result?.planSummary || 'Update successfully applied!'}**\n${diffBadge}\n\nLive canvas right panel me update ho gaya hai. Aap koi aur change bol sakte hain ya refine karwa sakte hain!`;
        } else {
          finalText = `✅ ${result?.planSummary || `Instruction "${trimmed}" live apply ho gaya hai.`}\n\nPreview canvas me update check kijiye!`;
        }

        setChatLog(prev => [
          ...prev,
          {
            sender: 'ai',
            text: finalText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsProcessing(false);
        showToast(`✅ ${result?.planSummary || 'Update applied'}`);
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
          1. ULTRA-CLEAN MODERN TOP BAR (EXECUTIVE UNIVERSAL DESIGN)
          ======================================================== */}
      <header className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Brand & Document Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white tracking-tight">
                {resume?.header?.name || 'ResumeAI Pro'}
              </span>
              <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                v{currentVersion}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {activeTemplateObj?.name} • ATS Optimized Live Canvas
            </span>
          </div>
        </div>

        {/* Center: Undo & Redo Controls + Quick Edit Access */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 shadow-inner">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition ${
                canUndo 
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-95' 
                  : 'text-slate-600 opacity-50 cursor-not-allowed'
              }`}
              title="Undo change (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            <span className="text-slate-700 font-mono">|</span>

            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition ${
                canRedo 
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-95' 
                  : 'text-slate-600 opacity-50 cursor-not-allowed'
              }`}
              title="Redo change (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Redo</span>
            </button>

            <span className="text-[10px] font-mono text-slate-400 px-1.5 bg-slate-900 rounded py-0.5 border border-slate-800">
              v{currentVersion}/{versionHistory?.length || 1}
            </span>
          </div>

          {/* Quick Edit Direct Access Button */}
          <button
            onClick={() => setActiveTab('edit')}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              activeTab === 'edit'
                ? 'bg-amber-600 border-amber-500 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 border-slate-700'
            }`}
            title="Edit fields directly without using AI credits"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Direct Edit (0 Credits)</span>
          </button>

          {/* Diff Tag if changes made */}
          {diffReport.hasChanges && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{diffReport.totalChangesCount} Changes</span>
            </div>
          )}
        </div>

        {/* Right: Zoom Presets & Primary Export Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-9 text-center font-semibold">{zoomLevel}%</span>
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
              className={`text-[10.5px] px-2 py-0.5 rounded transition cursor-pointer ${zoomLevel === 80 ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Fit
            </button>
          </div>

          {/* Primary Action: Download PDF */}
          <button
            onClick={() => exportResumeToPdf('cockpit-preview-canvas', resume?.header?.name || 'Candidate', currentVersion)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            title="Download vector printable PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Secondary Action: DOCX */}
          <button
            onClick={() => exportResumeToDocx(resume, currentVersion, selectedTemplateId)}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            title="Download Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>DOCX</span>
          </button>

          {/* Tertiary Action: High-Fidelity Browser Print / Vector PDF */}
          <button
            onClick={() => printResume('resume-document')}
            className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            title="Browser vector print / Save to PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Split Compare Button */}
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Side-by-side comparison with original CV"
            >
              <Columns className="w-3.5 h-3.5 text-slate-400" />
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
          {/* Main Segmented Tool Tabs (AI Chat, Direct Edit, Templates, Styles) */}
          <div className="p-2 bg-slate-950 border-b border-slate-800 grid grid-cols-4 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
              title="Edit fields directly without using AI credits"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Quick Edit</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('styling')}
              className={`py-2 px-1 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'styling'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Styles</span>
            </button>
          </div>

          {/* ----------------------------------------------------
              TAB 0: DIRECT QUICK EDIT (ZERO AI CREDITS / INSTANT WYSIWYG)
              ---------------------------------------------------- */}
          {activeTab === 'edit' && (
            <QuickEditPanel 
              resume={resume}
              onLiveSync={onLiveSyncCv}
              onCommit={onDirectUpdateCv}
              currentVersion={currentVersion}
            />
          )}

          {/* ----------------------------------------------------
              TAB 1: 36 TEMPLATES SHOWCASE (BIG VISUAL CARDS GRID)
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Category Pills (Horizontal Scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {TEMPLATE_TAG_FILTERS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTemplateTag(tag)}
                      className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                        activeTemplateTag === tag
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
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
                      className={`group rounded-xl border transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative min-h-[240px] ${
                        isSelected
                          ? 'bg-slate-850 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                          : 'bg-slate-950/70 hover:bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:shadow-sm'
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
              <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Conversational AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsJdModalOpen(true)}
                    className="text-[11px] bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    title="Paste target Job Description to tailor resume"
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tailor to JD</span>
                  </button>
                  <span className="text-[10px] text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono">
                    Online
                  </span>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
                {chatLog.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div 
                      className={`p-3 rounded-xl leading-relaxed shadow-sm whitespace-pre-line ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div>{msg.text}</div>

                      {msg.options && msg.options.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-col gap-2 w-full text-left">
                          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                            Select a recommended track:
                          </span>
                          <div className="flex flex-col gap-2">
                            {msg.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleSendPrompt(opt.actionPrompt || opt.title)}
                                className="text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 hover:border-blue-500 transition flex flex-col gap-1 cursor-pointer group shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-200 group-hover:text-blue-300 text-xs flex items-center gap-1.5">
                                    <span>{opt.icon || '•'}</span> {opt.title}
                                  </span>
                                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium group-hover:bg-blue-600 group-hover:text-white transition">
                                    Apply Track ➔
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug">
                                  {opt.description}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9.5px] text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-slate-300 text-xs p-3 bg-slate-850 rounded-xl border border-slate-800 max-w-[85%]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Processing instruction and updating CV live...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                <span className="text-slate-500 shrink-0 font-medium">Suggestions:</span>
                {(isFreshMode ? [
                  'Mera naam aur target role set karo',
                  'Degree aur education add karo',
                  'Core technical skills add karo',
                  'College / personal project add karo',
                  'ATS executive summary banao'
                ] : isJdMode ? [
                  '🎯 Paste Target JD to Tailor',
                  'Boost ATS keyword density',
                  'Align STAR bullets to JD',
                  'Tailor for Senior position'
                ] : [
                  '🎯 Tailor to Job Description',
                  'Add STAR metrics to bullets',
                  'Make summary concise & executive',
                  'Add experience or degrees',
                  'Tailor for Senior role'
                ]).map((suggestion, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      if (suggestion.includes('Tailor to Job Description') || suggestion.includes('Paste Target JD')) {
                        setIsJdModalOpen(true);
                      } else {
                        handleSendPrompt(suggestion);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition cursor-pointer ${
                      suggestion.includes('Tailor') || suggestion.includes('JD')
                        ? 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-700/60 text-emerald-300'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <div className="p-3 bg-slate-950 border-t border-slate-800">
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
                    placeholder={
                      isFreshMode 
                        ? "Apne bare me batayein (naam, degree, skills, projects)..." 
                        : "Type any instruction (e.g. 'Add Docker to skills', 'Make summary punchy')..."
                    }
                    disabled={isProcessing}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isProcessing}
                    className="absolute right-2 bottom-3.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition cursor-pointer shadow-sm"
                    title="Send instruction (Enter)"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Tailor to Job Description (JD) Modal */}
              {isJdModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <Target className="w-5 h-5" />
                        <span>Tailor Resume to Target Job Description (JD)</span>
                      </div>
                      <button 
                        onClick={() => setIsJdModalOpen(false)}
                        className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">
                      Paste the target job posting below. AI will perform ATS semantic gap analysis, align STAR experience bullets, and inject missing keywords to achieve a 95%+ match score.
                    </p>

                    <textarea
                      value={jdInputText}
                      onChange={(e) => setJdInputText(e.target.value)}
                      placeholder="Paste job posting here (roles, responsibilities, required skills, technical requirements)..."
                      rows={8}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsJdModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!jdInputText.trim() || isProcessing}
                        onClick={() => {
                          const text = jdInputText.trim();
                          setIsJdModalOpen(false);
                          setJdInputText('');
                          handleSendPrompt(`Tailor this resume to strictly match the following target Job Description. Align experience bullets with measurable STAR outcomes, incorporate key required technical and domain competencies, and optimize for 95%+ ATS parseability:\n\n${text}`);
                        }}
                        className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analyze & Tailor Resume Live</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 3: COLORS, STYLING & TYPOGRAPHY
              ---------------------------------------------------- */}
          {activeTab === 'styling' && (
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 text-xs text-left">
              
              {/* 1. Layout Mode Architecture */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Columns className="w-3.5 h-3.5 text-blue-400" />
                  1. Layout Mode (Two-Column vs Single-Column)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleLayoutMode('two-column')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      currentTheme.layoutMode === 'two-column'
                        ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/40 text-white font-medium'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Columns className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-[11px]">Two-Column (Sidebar)</span>
                    <span className="text-[9.5px] opacity-70 text-center">Compact sidebar for skills & contact</span>
                  </button>

                  <button
                    onClick={() => handleToggleLayoutMode('single-column')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      currentTheme.layoutMode === 'single-column'
                        ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/40 text-white font-medium'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignLeft className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-[11px]">Single-Column (Linear)</span>
                    <span className="text-[9.5px] opacity-70 text-center">Top-down classic chronological flow</span>
                  </button>
                </div>

                {currentTheme.layoutMode === 'two-column' && (
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-1">
                    <span className="text-[10.5px] text-slate-400">Sidebar Position:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleSidebarPosition('left')}
                        className={`text-[10px] font-medium px-3 py-1 rounded transition cursor-pointer ${
                          currentTheme.sidebarPosition === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Left Sidebar
                      </button>
                      <button
                        onClick={() => handleToggleSidebarPosition('right')}
                        className={`text-[10px] font-medium px-3 py-1 rounded transition cursor-pointer ${
                          currentTheme.sidebarPosition === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
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
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  2. Executive Color Palettes
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((pal) => {
                    const isSelected = currentTheme.colorPresetId === pal.id;
                    return (
                      <button
                        key={pal.id}
                        onClick={() => handleApplyPalette(pal)}
                        className={`p-2.5 rounded-lg border flex flex-col gap-1.5 text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/40'
                            : 'bg-slate-950/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[10.5px] text-slate-200 truncate">{pal.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
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
              <div className="flex flex-col gap-2.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <span className="text-[10.5px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
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
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  4. Font Typography
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_FAMILIES.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => handleFontChange(font)}
                      className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                        currentTheme.fontId === font.id
                          ? 'bg-slate-800 border-blue-500 text-white font-medium'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
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
            RIGHT PANE (Col 7 / 58%): LIVE CV DOCUMENT CANVAS
            ======================================================== */}
        <main className="lg:col-span-7 flex flex-col gap-2">
          
          {/* Subheader: Canvas Status & Scroll Jump Controls */}
          <div className="flex flex-wrap justify-between items-center px-1 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Document Preview:
              </span>
              <span className="text-xs font-medium text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {activeTemplateObj?.name}
              </span>

              {/* Strict Page Budget Switcher (Max 1 to 2 Pages) */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10.5px]">
                <button
                  onClick={() => onUpdateDesignTheme && onUpdateDesignTheme(prev => ({ ...prev, density: 'compact' }))}
                  className={`px-2 py-0.5 rounded transition cursor-pointer font-medium ${
                    currentTheme.density === 'compact' 
                      ? 'bg-sky-600 text-white font-bold shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fit content strictly to 1 Page"
                >
                  Fit 1-Page
                </button>
                <button
                  onClick={() => onUpdateDesignTheme && onUpdateDesignTheme(prev => ({ ...prev, density: 'normal' }))}
                  className={`px-2 py-0.5 rounded transition cursor-pointer font-medium ${
                    currentTheme.density !== 'compact' 
                      ? 'bg-sky-600 text-white font-bold shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fit content strictly to 2 Pages Max"
                >
                  Fit 2-Page Max
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Canvas Undo/Redo */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10.5px]">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Undo</span>
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw className="w-3 h-3 text-slate-400" />
                  <span>Redo</span>
                </button>
              </div>

              {/* Scroll Jump Controls */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10.5px]">
                <button
                  onClick={scrollToTop}
                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                  title="Scroll to Top"
                >
                  <ArrowUp className="w-3 h-3 text-slate-400" />
                  <span>Top</span>
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={scrollToBottom}
                  className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition cursor-pointer"
                  title="Scroll to Bottom"
                >
                  <ArrowDown className="w-3 h-3 text-slate-400" />
                  <span>Bottom</span>
                </button>
              </div>

              <span className="text-[10.5px] text-emerald-400 bg-slate-800/80 border border-slate-700 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Facts Locked
              </span>
            </div>
          </div>

          {/* Document Viewport - Auto-sized with full viewport scrollability matching left panel */}
          <div 
            ref={scrollCanvasRef}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-5 overflow-x-auto overflow-y-auto h-[calc(100vh-140px)] min-h-[620px] shadow-xl flex justify-center items-start text-left scroll-smooth"
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
        </main>
      </div>
    </div>
  );
}

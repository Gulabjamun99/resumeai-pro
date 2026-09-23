import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, User, Briefcase, GraduationCap, Code, 
  CheckCircle2, ArrowRight, MessageSquare, Plus, Trash2, ArrowLeft,
  Bot, HelpCircle, Zap, Check, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { 
  extractFresherFacts, 
  analyzeCandidateGaps, 
  synthesizeDetailedFresherResume 
} from '../utils/freshCvSynthesizer';

/**
 * PERSONA 2: AI GUIDED FRESH CV BUILDER
 * 
 * Interactive conversational onboarding specifically designed for freshers & career starters:
 * 1. Takes casual, informal user input in Hinglish or English.
 * 2. Asks smart, friendly clarification questions for missing details (with 1-click chips).
 * 3. Deeply synthesizes raw context into detailed, industry-standard STAR bullets.
 * 4. STRICT GUARANTEE: All CV content is 100% pure corporate English (no Hinglish in resume data).
 * 5. Features real-time live preview of the assembled CV card alongside the chat.
 */
export default function FreshCvBuilder({ onComplete, onCancel }) {
  // Mode switcher: 'chat' (AI Conversational Guide) vs 'manual' (Classic Step Form)
  const [viewMode, setViewMode] = useState('chat');

  // Input states
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Accumulated candidate facts
  const [candidateFacts, setCandidateFacts] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    targetRole: '',
    summary: '',
    education: [],
    experiences: [],
    projects: [],
    skills: [],
    rawNotes: []
  });

  // Conversation history
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome-1',
      sender: 'bot',
      text: 'Namaste! 👋 Main aapka AI Career Assistant hu.\n\nAap bilkul aam bolchal (Hinglish ya English) me batayein — aapne kya padhai ki hai, kahan intern ya kaam kiya, aur kya projects banaye hain. Baaki professional ATS English CV banana mera kaam hai!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Derived gaps from current accumulated facts
  const detectedGaps = useMemo(() => {
    return analyzeCandidateGaps(candidateFacts);
  }, [candidateFacts]);

  // Real-time synthesized CV draft (100% Pure Corporate English)
  const liveSynthesizedCv = useMemo(() => {
    return synthesizeDetailedFresherResume(candidateFacts);
  }, [candidateFacts]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Process a user response (from chat input or 1-click chip)
  const handleSendMessage = (textToSend = null) => {
    const rawContent = (textToSend !== null ? textToSend : inputMessage).trim();
    if (!rawContent) return;

    // 1. Add user message to chat
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: rawContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (textToSend === null) setInputMessage('');
    setIsTyping(true);

    // 2. Extract facts and update state
    setTimeout(() => {
      const updatedFacts = extractFresherFacts(rawContent, candidateFacts);
      setCandidateFacts(updatedFacts);

      // Check remaining gaps
      const newGaps = analyzeCandidateGaps(updatedFacts);

      let botReply = '';
      if (newGaps.length === 0) {
        botReply = 'Shaandaar! 🎉 Aapki details mil gayi hain. Maine aapka detailed professional CV pure corporate English me taiyar kar diya hai. Niche "Assemble & Open in Live Studio" click karke aap direct 36 modern templates apply kar sakte hain!';
      } else {
        const topGap = newGaps[0];
        botReply = `Bahut badiya! Maine ye details aapke CV me add kar di hain.\n\nEk aur cheez batayein:\n👉 ${topGap.question}`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  // Direct 1-Click Chip Handler
  const handleSelectGapOption = (optionValue) => {
    handleSendMessage(optionValue);
  };

  // Final Action: Complete and Launch Studio (Screen 7)
  const handleFinalSubmit = () => {
    if (onComplete) {
      onComplete(liveSynthesizedCv);
    }
  };

  // Manual Form States (if user switches to manual mode) - Clean initial state with ZERO dummy data
  const [manualData, setManualData] = useState({
    name: candidateFacts.name || '',
    title: candidateFacts.targetRole || '',
    email: candidateFacts.email || '',
    phone: candidateFacts.phone || '',
    location: candidateFacts.location || '',
    summary: liveSynthesizedCv.header?.summary || '',
    skills: liveSynthesizedCv.skills?.join(', ') || '',
    company: candidateFacts.experiences[0]?.company || '',
    role: candidateFacts.experiences[0]?.role || '',
    period: candidateFacts.experiences[0]?.period || '',
    degree: candidateFacts.education[0]?.degree || '',
    school: candidateFacts.education[0]?.institution || '',
    year: candidateFacts.education[0]?.year || ''
  });

  const handleManualSubmit = () => {
    const manualResume = {
      ...liveSynthesizedCv,
      header: {
        name: manualData.name,
        title: manualData.title,
        summary: manualData.summary || liveSynthesizedCv.header.summary
      },
      contact: {
        ...liveSynthesizedCv.contact,
        email: manualData.email,
        phone: manualData.phone,
        location: manualData.location
      },
      skills: manualData.skills.split(',').map(s => s.trim()).filter(Boolean),
      experiences: [
        {
          id: 'exp-manual-1',
          role: manualData.role,
          company: manualData.company,
          period: manualData.period,
          location: manualData.location,
          bullets: liveSynthesizedCv.experiences[0]?.bullets || [
            'Architected and implemented scalable features adhering to corporate quality standards.',
            'Collaborated with engineering teams to resolve application bugs and improve user workflows.'
          ]
        }
      ],
      education: [`${manualData.degree} • ${manualData.school} (${manualData.year})`]
    };

    if (onComplete) onComplete(manualResume);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
      
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 bg-slate-900 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                AI Guided Fresh CV Builder
              </h2>
              <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded-full font-bold">
                Fresher Friendly • Hinglish / English
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Apni baatein aam bhasha me batayein — AI use detailed, industry-standard ATS English CV me convert karega.
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switch */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'chat'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Conversation Guide</span>
            </button>
            <button
              onClick={() => setViewMode('manual')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'manual'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Classic Form</span>
            </button>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: CONVERSATIONAL AI STUDIO (SPLIT SCREEN) */}
      {viewMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT PANEL (7 Cols / 58%): CONVERSATIONAL AGENT FEED */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 p-4 sm:p-5">
            
            {/* Top Coverage Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-slate-200">AI Context Intake Status:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className={`px-2 py-0.5 rounded border ${candidateFacts.name ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {candidateFacts.name ? '✓ Name' : '○ Name'}
                </span>
                <span className={`px-2 py-0.5 rounded border ${candidateFacts.education.length > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {candidateFacts.education.length > 0 ? '✓ Education' : '○ Education'}
                </span>
                <span className={`px-2 py-0.5 rounded border ${candidateFacts.experiences.length > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {candidateFacts.experiences.length > 0 ? '✓ Experience' : '○ Experience'}
                </span>
                <span className={`px-2 py-0.5 rounded border ${candidateFacts.projects.length > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {candidateFacts.projects.length > 0 ? `✓ ${candidateFacts.projects.length} Projects` : '○ Projects'}
                </span>
              </div>
            </div>

            {/* Chat Message Scroll Feed */}
            <div className="flex-1 overflow-y-auto max-h-[380px] sm:max-h-[420px] flex flex-col gap-3 pr-2 mb-3">
              
              {/* Clean Guidance Tip (No dummy pre-filled profiles) */}
              {messages.length <= 1 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 my-1 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Aap apna <strong>Naam, College, Degree, Projects ya Internship</strong> ke baare me niche likhein. AI unhe turant live parse karke professional corporate English me assemble karega.
                  </p>
                </div>
              )}

              {/* Chat Message Bubbles */}
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[92%] ${
                    msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                    msg.sender === 'user' 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-purple-600 text-white'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1 opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 self-start items-center text-xs text-purple-400 bg-slate-950 p-2 px-3 rounded-lg border border-slate-800">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>AI assistant is analyzing your details & crafting STAR bullets...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Smart Clarification Query Cards (Interactive 1-Click Chips) */}
            {detectedGaps.length > 0 && messages.length > 1 && (
              <div className="bg-slate-950/90 border border-purple-800/40 rounded-xl p-3 flex flex-col gap-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Quick Answer Chips (1-Click to Add):</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {detectedGaps.length} detail{detectedGaps.length > 1 ? 's' : ''} suggested
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {detectedGaps[0].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectGapOption(opt.value)}
                      className="text-[11px] bg-slate-900 hover:bg-purple-950/70 border border-slate-700 hover:border-purple-500/70 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-purple-400" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Aam bhasha me likhein: e.g. 'Mera naam Rahul hai, DU se 2024 me B.Tech kiya, React me E-Commerce project banaya...'"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none font-mono"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 rounded-xl flex items-center justify-center transition cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL (5 Cols / 42%): REAL-TIME LIVE A4 CV PREVIEW */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 p-4 sm:p-5 border-t lg:border-t-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Assembled CV (Pure English)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900">
                100% Corporate English
              </span>
            </div>

            {/* Mini Visual CV Document Card - ONLY displays user-provided live facts */}
            {(!candidateFacts.name && !candidateFacts.targetRole && candidateFacts.skills.length === 0 && candidateFacts.experiences.length === 0 && candidateFacts.projects.length === 0 && candidateFacts.education.length === 0) ? (
              <div className="flex-1 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Live Resume Canvas Awaiting Input</h4>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Aap jaise hi left side me apna background batayenge, aapka professional English CV yahan real-time assemble hoga. Zero dummy data.
                </p>
              </div>
            ) : (
              <div className="flex-1 bg-white text-slate-900 rounded-xl p-4 sm:p-5 shadow-2xl overflow-y-auto max-h-[500px] border border-slate-200 font-sans text-left select-none text-[11px] leading-relaxed">
                
                {/* Header */}
                {(liveSynthesizedCv.header.name || liveSynthesizedCv.header.title || liveSynthesizedCv.contact.email) && (
                  <div className="border-b border-slate-300 pb-2.5 mb-2.5">
                    {liveSynthesizedCv.header.name && (
                      <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {liveSynthesizedCv.header.name}
                      </h1>
                    )}
                    {liveSynthesizedCv.header.title && (
                      <p className="text-xs font-bold text-sky-700 mt-0.5">
                        {liveSynthesizedCv.header.title}
                      </p>
                    )}
                    {(liveSynthesizedCv.contact.email || liveSynthesizedCv.contact.phone || liveSynthesizedCv.contact.location) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-600 mt-1 font-mono">
                        {liveSynthesizedCv.contact.email && <span>{liveSynthesizedCv.contact.email}</span>}
                        {liveSynthesizedCv.contact.phone && <span>• {liveSynthesizedCv.contact.phone}</span>}
                        {liveSynthesizedCv.contact.location && <span>• {liveSynthesizedCv.contact.location}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Executive Summary */}
                {liveSynthesizedCv.header.summary && (
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">
                      Executive Summary
                    </h4>
                    <p className="text-[10.5px] text-slate-700 leading-snug">
                      {liveSynthesizedCv.header.summary}
                    </p>
                  </div>
                )}

                {/* Skills Chips */}
                {liveSynthesizedCv.skills.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">
                      Core Skills & Technologies
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {liveSynthesizedCv.skills.map((s, idx) => (
                        <span 
                          key={idx}
                          className="bg-slate-100 border border-slate-300 text-slate-800 text-[9.5px] px-1.5 py-0.5 rounded font-mono font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience / Internships */}
                {liveSynthesizedCv.experiences.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">
                      Work Experience / Internships
                    </h4>
                    {liveSynthesizedCv.experiences.map((exp, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                          <span className="text-slate-900">{exp.role}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{exp.period}</span>
                        </div>
                        <div className="text-[10px] text-sky-800 font-semibold mb-1">
                          {exp.company} {exp.location ? `• ${exp.location}` : ''}
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-700">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {liveSynthesizedCv.projects.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">
                      Featured Engineering Projects
                    </h4>
                    {liveSynthesizedCv.projects.map((p, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between items-baseline font-bold text-[10.5px]">
                          <span className="text-slate-900">{p.title}</span>
                          <span className="text-[9.5px] text-sky-700 font-mono">{p.techStack}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-700 mt-0.5">
                          {p.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {liveSynthesizedCv.education.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">
                      Education & Credentials
                    </h4>
                    {liveSynthesizedCv.education.map((edu, idx) => (
                      <div key={idx} className="text-[10.5px] text-slate-800 font-medium">
                        {edu}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Direct Studio Launch CTA */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={handleFinalSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Assemble & Open in Live Studio (Screen 7)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                Screen 7 me 36 modern visual templates, full WYSIWYG editor aur instant PDF export milega.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CLASSIC MANUAL FORM */}
      {viewMode === 'manual' && (
        <div className="p-6 flex flex-col gap-5 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={manualData.name}
                onChange={e => setManualData({ ...manualData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Job Title</label>
              <input
                type="text"
                value={manualData.title}
                onChange={e => setManualData({ ...manualData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                value={manualData.email}
                onChange={e => setManualData({ ...manualData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={manualData.phone}
                onChange={e => setManualData({ ...manualData, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Executive Summary (English)</label>
            <textarea
              rows={3}
              value={manualData.summary}
              onChange={e => setManualData({ ...manualData, summary: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Skills (Comma separated)</label>
            <input
              type="text"
              value={manualData.skills}
              onChange={e => setManualData({ ...manualData, skills: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Org</label>
              <input
                type="text"
                value={manualData.company}
                onChange={e => setManualData({ ...manualData, company: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
              <input
                type="text"
                value={manualData.role}
                onChange={e => setManualData({ ...manualData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Duration</label>
              <input
                type="text"
                value={manualData.period}
                onChange={e => setManualData({ ...manualData, period: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Degree</label>
              <input
                type="text"
                value={manualData.degree}
                onChange={e => setManualData({ ...manualData, degree: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">College / University</label>
              <input
                type="text"
                value={manualData.school}
                onChange={e => setManualData({ ...manualData, school: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Year</label>
              <input
                type="text"
                value={manualData.year}
                onChange={e => setManualData({ ...manualData, year: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleManualSubmit}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Assemble & Open in Live Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

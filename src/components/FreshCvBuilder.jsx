import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, User, Briefcase, GraduationCap, Code, 
  CheckCircle2, ArrowRight, MessageSquare, Plus, Trash2, ArrowLeft,
  Bot, HelpCircle, Zap, Check, AlertCircle, RefreshCw, Layers,
  Globe, Link as LinkIcon, Award
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
 * 6. Includes a comprehensive Classic Step Form with multi-experience, multi-project, and social links.
 */
export default function FreshCvBuilder({ onComplete, onCancel }) {
  // Mode switcher: 'chat' (AI Conversational Guide) vs 'manual' (Classic Step Form)
  const [viewMode, setViewMode] = useState('chat');

  // Input states
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [askedGaps, setAskedGaps] = useState([]);
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
      text: 'Hello and welcome! 👋 I am your AI Career Guide.\n\nTell me about your background — your education, internships or work experience, and any academic or personal projects you have built. I will automatically synthesize your information into an executive, ATS-optimized English resume!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Derived gaps from current accumulated facts
  const detectedGaps = useMemo(() => {
    return analyzeCandidateGaps(candidateFacts, askedGaps);
  }, [candidateFacts, askedGaps]);

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
      
      const lowerInput = rawContent.toLowerCase();
      let acknowledgement = '';
      if (lowerInput.includes('mba') && (lowerInput.includes('marketing') || lowerInput.includes('sales'))) {
        acknowledgement = "Samajh gaya! 👍 Maine aapka profile **MBA (Marketing Management)** aur **1 Year Lenskart Store Sales** ke mutabiq set kar diya hai.\n\n";
      } else if (lowerInput.includes('store sales') || lowerInput.includes('lenskart')) {
        acknowledgement = "Noted! 👍 Retail store sales experience CV me add kar diya gaya hai.\n\n";
      } else if (lowerInput.includes('marketing') || lowerInput.includes('sales')) {
        acknowledgement = "Samajh gaya! 👍 Marketing profile details CV me incorporate ho gayi hain.\n\n";
      }

      setCandidateFacts(updatedFacts);

      // Check remaining gaps
      const newGaps = analyzeCandidateGaps(updatedFacts, askedGaps);

      let botReply = '';
      if (newGaps.length === 0) {
        botReply = `${acknowledgement}Shaandar! 🎉 Aapka resume executive ATS standard ke mutabiq synthesize ho gaya hai. Right side me live preview check kijiye aur **"Assemble & Open in Live Studio"** button click karke aage badhiye!`;
      } else {
        const topGap = newGaps[0];
        setAskedGaps(prev => [...prev, topGap.id]);
        botReply = `${acknowledgement}Great progress! Ye details aapke resume me add ho chuki hain.\n\nATS score maximize karne ke liye:\n👉 ${topGap.question}`;
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
    }, 500);
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

  // Manual Form States (Classic Step Form)
  const [manualData, setManualData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    skills: '',
    certifications: '',
    experiences: [
      { company: '', role: '', period: '', location: '', bullets: '' }
    ],
    projects: [
      { title: '', techStack: '', bullets: '' }
    ],
    education: [
      { degree: '', major: '', school: '', year: '', score: '' }
    ]
  });

  // Switch to Manual Mode and auto-populate from current facts
  const handleSwitchToManual = () => {
    setManualData({
      name: candidateFacts.name || manualData.name,
      title: candidateFacts.targetRole || manualData.title,
      email: candidateFacts.email || manualData.email,
      phone: candidateFacts.phone || manualData.phone,
      location: candidateFacts.location || manualData.location,
      linkedin: liveSynthesizedCv.contact?.linkedin || manualData.linkedin,
      github: liveSynthesizedCv.contact?.github || manualData.github,
      website: liveSynthesizedCv.contact?.website || manualData.website,
      summary: liveSynthesizedCv.header?.summary || manualData.summary,
      skills: liveSynthesizedCv.skills?.length > 0 ? liveSynthesizedCv.skills.join(', ') : manualData.skills,
      certifications: manualData.certifications || '',
      experiences: candidateFacts.experiences.length > 0 
        ? candidateFacts.experiences.map(e => ({
            company: e.company || '',
            role: e.role || '',
            period: e.period || '',
            location: e.location || '',
            bullets: Array.isArray(e.bullets) ? e.bullets.join('\n') : (e.bullets || '')
          }))
        : manualData.experiences,
      projects: candidateFacts.projects.length > 0
        ? candidateFacts.projects.map(p => ({
            title: p.title || '',
            techStack: p.techStack || '',
            bullets: Array.isArray(p.bullets) ? p.bullets.join('\n') : (p.bullets || '')
          }))
        : manualData.projects,
      education: candidateFacts.education.length > 0
        ? candidateFacts.education.map(ed => ({
            degree: typeof ed === 'string' ? ed : ed.degree || '',
            major: typeof ed === 'string' ? '' : ed.major || '',
            school: typeof ed === 'string' ? '' : ed.institution || '',
            year: typeof ed === 'string' ? '' : ed.year || '',
            score: typeof ed === 'string' ? '' : ed.score || ''
          }))
        : manualData.education
    });
    setViewMode('manual');
  };

  // Dynamic list manipulation handlers for Manual Form
  const handleAddExperience = () => {
    setManualData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { company: '', role: '', period: '', location: '', bullets: '' }]
    }));
  };

  const handleRemoveExperience = (idx) => {
    setManualData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateExperience = (idx, field, value) => {
    setManualData(prev => {
      const updated = [...prev.experiences];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  const handleAddProject = () => {
    setManualData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', techStack: '', bullets: '' }]
    }));
  };

  const handleRemoveProject = (idx) => {
    setManualData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateProject = (idx, field, value) => {
    setManualData(prev => {
      const updated = [...prev.projects];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const handleAddEducation = () => {
    setManualData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', major: '', school: '', year: '', score: '' }]
    }));
  };

  const handleRemoveEducation = (idx) => {
    setManualData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateEducation = (idx, field, value) => {
    setManualData(prev => {
      const updated = [...prev.education];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleManualSubmit = () => {
    const formattedExperiences = manualData.experiences
      .filter(e => e.company.trim() || e.role.trim())
      .map(e => ({
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        company: e.company.trim(),
        role: e.role.trim() || 'Professional Associate',
        period: e.period.trim() || '1 Year',
        location: e.location.trim() || manualData.location.trim(),
        bullets: e.bullets.split('\n').map(b => b.trim()).filter(b => b.length > 3)
      }));

    const formattedProjects = manualData.projects
      .filter(p => p.title.trim())
      .map(p => ({
        id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: p.title.trim(),
        techStack: p.techStack.trim() || 'Industry Tools',
        bullets: p.bullets.split('\n').map(b => b.trim()).filter(b => b.length > 3)
      }));

    const formattedEducation = manualData.education
      .filter(ed => ed.degree.trim())
      .map(ed => {
        const deg = ed.degree.trim();
        const maj = ed.major.trim() ? ` in ${ed.major.trim()}` : '';
        const sch = ed.school.trim() ? ` • ${ed.school.trim()}` : '';
        const yr = ed.year.trim() ? ` (${ed.year.trim()})` : '';
        return `${deg}${maj}${sch}${yr}`;
      });

    const parsedSkills = manualData.skills
      ? manualData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const manualResume = {
      header: {
        name: manualData.name.trim() || 'Candidate Name',
        title: manualData.title.trim() || 'Professional Specialist',
        summary: manualData.summary.trim()
      },
      contact: {
        email: manualData.email.trim(),
        phone: manualData.phone.trim(),
        location: manualData.location.trim(),
        linkedin: manualData.linkedin.trim(),
        github: manualData.github.trim(),
        website: manualData.website.trim()
      },
      skills: parsedSkills,
      experiences: formattedExperiences,
      projects: formattedProjects,
      education: formattedEducation,
      certifications: manualData.certifications ? manualData.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
      languages: [
        { name: 'English', level: 'Professional Working Proficiency' }
      ],
      layoutType: 'two-column-left-sidebar'
    };

    if (onComplete) {
      onComplete(manualResume);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-4 text-white">
      {/* Top Header / Mode Switcher */}
      <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                AI Guided Career Builder
              </h2>
              <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
                Persona 2
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Describe your background naturally — our AI synthesizes it into an executive, ATS-optimized English resume.
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
              onClick={handleSwitchToManual}
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
                  {candidateFacts.education.length > 0 ? `✓ ${candidateFacts.education.length} Degrees` : '○ Education'}
                </span>
                <span className={`px-2 py-0.5 rounded border ${candidateFacts.experiences.length > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {candidateFacts.experiences.length > 0 ? '✓ Experience' : '○ Experience'}
                </span>
                <span className={`px-2 py-0.5 rounded border ${candidateFacts.skills.length > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {candidateFacts.skills.length > 0 ? `✓ ${candidateFacts.skills.length} Skills` : '○ Skills'}
                </span>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto max-h-[460px] flex flex-col gap-3.5 pr-2 mb-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'self-end flex-row-reverse text-right' : 'self-start text-left'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
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
                  <span>AI assistant is analyzing your details & crafting executive bullets...</span>
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
                placeholder="Type your background details here (e.g. 'Ravi kumar, MBA Marketing, 1 year lenskart store sales, LPU 2015, b.com 2010')..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none font-sans"
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
          <div className="lg:col-span-5 flex flex-col bg-slate-950 p-4 sm:p-5 border-t lg:border-t-0 text-left">
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
            {(!candidateFacts.name && !candidateFacts.targetRole && candidateFacts.skills.length === 0 && candidateFacts.experiences.length === 0 && candidateFacts.education.length === 0) ? (
              <div className="flex-1 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Live Resume Canvas Awaiting Input</h4>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Share your background on the left to see your executive English resume assemble in real time.
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
                      Core Skills & Competencies
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {liveSynthesizedCv.skills.map((s, idx) => (
                        <span 
                          key={idx}
                          className="bg-slate-100 border border-slate-300 text-slate-800 text-[9.5px] px-1.5 py-0.5 rounded font-medium"
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
                      Work Experience
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
                      Featured Projects & Initiatives
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
                      <div key={idx} className="text-[10.5px] text-slate-800 font-medium py-0.5">
                        • {edu}
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
                Screen 7 me 36 modern visual templates, full WYSIWYG editor aur instant PDF/DOCX export milega.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: COMPREHENSIVE CLASSIC STEP FORM */}
      {viewMode === 'manual' && (
        <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full text-left">
          
          {/* Section 1: Personal & Contact Information */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4" />
              <span>Personal Details & Contact Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ravi Kumar"
                  value={manualData.name}
                  onChange={e => setManualData({ ...manualData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Specialist / Retail Sales Executive"
                  value={manualData.title}
                  onChange={e => setManualData({ ...manualData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ravi@example.com"
                  value={manualData.email}
                  onChange={e => setManualData({ ...manualData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={manualData.phone}
                  onChange={e => setManualData({ ...manualData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, India"
                  value={manualData.location}
                  onChange={e => setManualData({ ...manualData, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-sky-400" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={manualData.linkedin}
                  onChange={e => setManualData({ ...manualData, linkedin: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <Code className="w-3 h-3 text-slate-400" />
                  <span>GitHub Profile URL</span>
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/username"
                  value={manualData.github}
                  onChange={e => setManualData({ ...manualData, github: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Portfolio / Personal Website</span>
                </label>
                <input
                  type="text"
                  placeholder="https://myportfolio.com"
                  value={manualData.website}
                  onChange={e => setManualData({ ...manualData, website: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Executive Summary & Skills */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>Executive Summary & Core Skills</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Executive Summary (English)</label>
              <textarea
                rows={3}
                placeholder="Brief summary highlighting your background, key strengths, and target goals..."
                value={manualData.summary}
                onChange={e => setManualData({ ...manualData, summary: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Store Sales, Customer Consultation, CRM, Merchandising"
                  value={manualData.skills}
                  onChange={e => setManualData({ ...manualData, skills: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Certifications (Optional, Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Retail Management Certificate, Google Digital Garage"
                  value={manualData.certifications}
                  onChange={e => setManualData({ ...manualData, certifications: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Work Experience & Internships (Dynamic Cards) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Work Experience & Internships ({manualData.experiences.length})</span>
              </h3>
              <button
                onClick={handleAddExperience}
                className="text-xs text-purple-400 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-2.5 py-1 rounded-lg border border-purple-700/60 transition cursor-pointer flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {manualData.experiences.map((exp, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Position #{idx + 1}</span>
                    {manualData.experiences.length > 1 && (
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
                        title="Delete position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Company / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. Lenskart Solutions Ltd."
                        value={exp.company}
                        onChange={e => handleUpdateExperience(idx, 'company', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Designation / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Retail Store Sales Executive"
                        value={exp.role}
                        onChange={e => handleUpdateExperience(idx, 'role', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Duration / Period</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Year (2023 - 2024)"
                        value={exp.period}
                        onChange={e => handleUpdateExperience(idx, 'period', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi, India"
                        value={exp.location}
                        onChange={e => handleUpdateExperience(idx, 'location', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Key Responsibilities / Bullet Points (One per line)</label>
                    <textarea
                      rows={2}
                      placeholder="Consulted customers on optical prescriptions and lens coatings&#10;Managed daily store operations, inventory merchandising, and POS billing"
                      value={exp.bullets}
                      onChange={e => handleUpdateExperience(idx, 'bullets', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Academic & Personal Projects */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>Projects & Academic Initiatives ({manualData.projects.length})</span>
              </h3>
              <button
                onClick={handleAddProject}
                className="text-xs text-purple-400 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-2.5 py-1 rounded-lg border border-purple-700/60 transition cursor-pointer flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {manualData.projects.map((proj, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Project #{idx + 1}</span>
                    {manualData.projects.length > 1 && (
                      <button
                        onClick={() => handleRemoveProject(idx)}
                        className="text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Project Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Retail Sales Optimization & Consumer Behavior Study"
                        value={proj.title}
                        onChange={e => handleUpdateProject(idx, 'title', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Technologies / Tools Used</label>
                      <input
                        type="text"
                        placeholder="e.g. MS Excel, CRM Systems, Market Survey"
                        value={proj.techStack}
                        onChange={e => handleUpdateProject(idx, 'techStack', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Description / Highlights (One per line)</label>
                    <textarea
                      rows={2}
                      placeholder="Conducted consumer survey across 200+ patrons to determine purchasing drivers&#10;Formulated recommendations reducing cart abandonment by 18%"
                      value={proj.bullets}
                      onChange={e => handleUpdateProject(idx, 'bullets', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Education & Credentials (Dynamic Cards) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>Education & Academic Credentials ({manualData.education.length})</span>
              </h3>
              <button
                onClick={handleAddEducation}
                className="text-xs text-purple-400 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-2.5 py-1 rounded-lg border border-purple-700/60 transition cursor-pointer flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {manualData.education.map((edu, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Credential #{idx + 1}</span>
                    {manualData.education.length > 1 && (
                      <button
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
                        title="Delete credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Degree / Certificate</label>
                      <input
                        type="text"
                        placeholder="e.g. Master of Business Administration (MBA)"
                        value={edu.degree}
                        onChange={e => handleUpdateEducation(idx, 'degree', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Field of Study / Major</label>
                      <input
                        type="text"
                        placeholder="e.g. Marketing Management"
                        value={edu.major}
                        onChange={e => handleUpdateEducation(idx, 'major', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Institution / University</label>
                      <input
                        type="text"
                        placeholder="e.g. Lovely Professional University, Punjab"
                        value={edu.school}
                        onChange={e => handleUpdateEducation(idx, 'school', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Passing Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2015"
                        value={edu.year}
                        onChange={e => handleUpdateEducation(idx, 'year', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setViewMode('chat')}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AI Chat Guide</span>
            </button>

            <button
              onClick={handleManualSubmit}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Assemble & Open in Live Studio (Screen 7)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

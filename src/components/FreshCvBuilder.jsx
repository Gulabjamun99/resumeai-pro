import React, { useState } from 'react';
import { 
  Sparkles, Send, User, Briefcase, GraduationCap, Code, 
  CheckCircle2, ArrowRight, MessageSquare, Plus, Trash2, ArrowLeft 
} from 'lucide-react';

/**
 * PERSONA 2: CONVERSATIONAL FRESH CV BUILDER
 * 
 * Interactive conversational onboarding for users without an existing CV.
 * Multi-language friendly, zero rigid complaints, progressive assembly.
 */
export default function FreshCvBuilder({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    experienceRole: '',
    experienceCompany: '',
    experienceDates: '',
    experienceBullets: '',
    educationDegree: '',
    educationSchool: '',
    educationYear: ''
  });

  const steps = [
    { num: 1, title: 'Personal Info', icon: User, desc: 'Aapka naam aur contact details' },
    { num: 2, title: 'Target Role & Bio', icon: Briefcase, desc: 'Aap kis role ke liye CV bana rahe hain?' },
    { num: 3, title: 'Experience / Projects', icon: Code, desc: 'Aapka previous work ya key projects' },
    { num: 4, title: 'Skills & Education', icon: GraduationCap, desc: 'Key skills aur academic qualification' }
  ];

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    // Construct valid candidate resume object
    const skillsList = formData.skills
      .split(/[,|\n]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const bulletsList = formData.experienceBullets
      .split('\n')
      .map(b => b.replace(/^[•*\-]\s*/, '').trim())
      .filter(Boolean);

    const assembledResume = {
      header: {
        name: formData.name || 'Candidate Name',
        title: formData.title || 'Software & AI Specialist',
        summary: formData.summary || `${formData.name || 'Professional'} is a dedicated specialist in ${formData.title || 'technology'} with a proven track record of execution and impact.`
      },
      contact: {
        email: formData.email || 'candidate@example.com',
        phone: formData.phone || '+91 98765 43210',
        location: formData.location || 'Bangalore, India',
        linkedin: `https://linkedin.com/in/${(formData.name || 'candidate').toLowerCase().replace(/\s+/g, '-')}`,
        github: '',
        website: ''
      },
      skills: skillsList.length > 0 ? skillsList : [
        'Full-Stack Development', 'AI Tools', 'Problem Solving', 'Team Leadership', 'Project Execution'
      ],
      experiences: formData.experienceRole ? [
        {
          id: 'exp-1',
          role: formData.experienceRole,
          company: formData.experienceCompany || 'Technology Ventures',
          period: formData.experienceDates || '2024 – Present',
          location: formData.location || 'Remote',
          bullets: bulletsList.length > 0 ? bulletsList : [
            'Spearheaded key product initiatives and deployed end-to-end scalable solutions.',
            'Collaborated with cross-functional teams to streamline workflows and improve productivity.',
            'Leveraged modern frameworks and tools to achieve high reliability and performance.'
          ]
        }
      ] : [],
      projects: [],
      education: formData.educationDegree ? [
        `${formData.educationDegree} from ${formData.educationSchool || 'University'} (${formData.educationYear || '2023'})`
      ] : ['Bachelor of Technology / Degree in Engineering'],
      certifications: [],
      languages: [{ name: 'English', level: 'Professional' }, { name: 'Hindi', level: 'Native' }],
      layoutType: 'two-column-left-sidebar'
    };

    if (onComplete) {
      onComplete(assembledResume);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            AI Guided Fresh CV Builder
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bas kuch simple sawalon ke jawab dein — AI aapka executive ATS resume automatically assemble karega.
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Steps Progress Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map(s => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <div 
              key={s.num} 
              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition ${
                isActive 
                  ? 'bg-sky-950/60 border-sky-500 shadow-md ring-1 ring-sky-500' 
                  : isDone
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400'
                    : 'bg-slate-950 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Step {s.num}</span>
              </div>
              <span className="text-[10px] truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Step Form Content */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Step 1: Aapki Basic Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Poora Naam (Full Name) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email ID *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Current City / Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bangalore, India"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Step 2: Target Role & Career Summary
            </span>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Aapka Target Job Title / Headline *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Full-Stack AI Developer | Product Engineer"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Short Bio / Summary (Aam bhasha me likhein, AI polish kar dega)</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                placeholder="e.g. 2 saal se web development aur AI tools pe kaam kiya hai, clean code aur fast deployment me interest hai..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Step 3: Experience Ya Key Projects
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={formData.experienceRole}
                  onChange={e => setFormData({ ...formData, experienceRole: e.target.value })}
                  placeholder="e.g. AI Engineer / Frontend Intern"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Company / College Project Name</label>
                <input
                  type="text"
                  value={formData.experienceCompany}
                  onChange={e => setFormData({ ...formData, experienceCompany: e.target.value })}
                  placeholder="e.g. Tech Solutions / Final Year Project"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Duration / Dates</label>
              <input
                type="text"
                value={formData.experienceDates}
                onChange={e => setFormData({ ...formData, experienceDates: e.target.value })}
                placeholder="e.g. May 2024 – Present"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Aapne kya kaam kiya? (Har line me ek bullet point likhein)</label>
              <textarea
                rows={3}
                value={formData.experienceBullets}
                onChange={e => setFormData({ ...formData, experienceBullets: e.target.value })}
                placeholder="• React aur Supabase se live web app banaya&#10;• User onboarding time 30% reduce kiya&#10;• AI prompt orchestration implement kiya"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Step 4: Skills & Academic Qualification
            </span>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Skills & Tools (Comma separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. React, Node.js, Python, Tailwind, Google Antigravity, Supabase, Git"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Degree / Course</label>
                <input
                  type="text"
                  value={formData.educationDegree}
                  onChange={e => setFormData({ ...formData, educationDegree: e.target.value })}
                  placeholder="e.g. B.Tech in CSE / MBA"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">College / Institute</label>
                <input
                  type="text"
                  value={formData.educationSchool}
                  onChange={e => setFormData({ ...formData, educationSchool: e.target.value })}
                  placeholder="e.g. Delhi University / LPU"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Passing Year</label>
                <input
                  type="text"
                  value={formData.educationYear}
                  onChange={e => setFormData({ ...formData, educationYear: e.target.value })}
                  placeholder="e.g. 2024"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        {step > 1 ? (
          <button
            onClick={() => setStep(prev => prev - 1)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : <div />}

        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 transition cursor-pointer ml-auto"
        >
          <span>{step === 4 ? 'Assemble & Choose Template' : 'Next Step'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

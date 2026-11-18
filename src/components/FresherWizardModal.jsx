import React, { useState } from 'react';
import { 
  Sparkles, User, GraduationCap, Code2, FolderGit2, Award, 
  ArrowRight, ArrowLeft, CheckCircle2, X, Plus, Trash2, Wand2 
} from 'lucide-react';
import { callGeminiApi } from '../services/geminiService.js';
import { normalizeCvSchema } from '../utils/cvNormalizer.js';

export default function FresherWizardModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State (100% Real User Data)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    degree: '',
    institution: '',
    passingYear: '',
    grade: '',
    skillsInput: '',
    skillsList: [],
    projects: [
      { title: '', tech: '', description: '' }
    ],
    certificationsInput: '',
    languagesInput: 'English, Hindi'
  });

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skillsList.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skillsList: [...prev.skillsList, trimmed],
        skillsInput: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsList: prev.skillsList.filter(s => s !== skillToRemove)
    }));
  };

  const handleProjectChange = (idx, field, val) => {
    setFormData(prev => {
      const updated = [...prev.projects];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, projects: updated };
    });
  };

  const handleAddProject = () => {
    if (formData.projects.length < 3) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, { title: '', tech: '', description: '' }]
      }));
    }
  };

  const handleRemoveProject = (idx) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx)
    }));
  };

  // Build the Fresher Resume from User's authentic input
  const handleSynthesizeResume = async () => {
    setIsGenerating(true);

    const rawSkills = [
      ...formData.skillsList,
      ...formData.skillsInput.split(/[,|]+/).map(s => s.trim()).filter(Boolean)
    ].filter((v, i, a) => a.indexOf(v) === i);

    const validProjects = formData.projects.filter(p => p.title.trim().length > 0);
    const validCerts = formData.certificationsInput.split(/[,|]+/).map(c => c.trim()).filter(Boolean);
    const validLangs = formData.languagesInput.split(/[,|]+/).map(l => ({ name: l.trim(), level: "Proficient" })).filter(l => l.name);

    const basicCv = {
      layoutType: "single-column",
      header: {
        name: formData.name.trim() || "Candidate Name",
        title: formData.title.trim() || "Aspiring Professional",
        summary: ""
      },
      contact: {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        linkedin: formData.linkedin.trim(),
        github: formData.github.trim(),
        website: ""
      },
      skills: rawSkills,
      experiences: [],
      education: formData.degree.trim() ? [
        {
          degree: formData.degree.trim(),
          institution: formData.institution.trim(),
          year: formData.passingYear.trim(),
          details: formData.grade.trim() ? `Score/Grade: ${formData.grade.trim()}` : "",
          grade: formData.grade.trim()
        }
      ] : [],
      projects: validProjects.map(p => ({
        title: p.title.trim(),
        tech: p.tech.trim(),
        description: p.description.trim(),
        bullets: p.description.trim() ? [p.description.trim()] : []
      })),
      certifications: validCerts,
      languages: validLangs,
      styleProfile: {
        templateId: "modern-executive",
        layoutType: "single-column",
        accentColor: "#2563eb",
        fontFamily: "font-sans"
      }
    };

    // If Gemini AI is active, polish summary and project bullets for 1-page ATS perfection
    try {
      const prompt = `Synthesize a professional 1-page ATS fresher resume based strictly on these verified candidate details:
${JSON.stringify(basicCv, null, 2)}

Requirements:
1. Write a 2-3 line punchy, professional Executive Summary in 100% polished Corporate English.
2. For each project, write 1-2 quantified, action-oriented STAR bullets (e.g. "Engineered...", "Built...", "Implemented...").
3. DO NOT invent fake companies, fake degrees, or fake certifications.
4. Keep the CV strictly within a 1-page budget.

Return JSON in this exact structure:
{
  "summary": "Compelling 2-3 sentence summary",
  "projectBullets": [
    ["Bullet 1 for project 1", "Bullet 2 for project 1"]
  ]
}`;

      const aiPromise = callGeminiApi(prompt, "You are a Senior ATS Career Architect. Return valid JSON only.", [], { responseMimeType: "application/json" });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI synthesis timeout')), 6000));
      const aiResponse = await Promise.race([aiPromise, timeoutPromise]);
      if (aiResponse) {
        let clean = aiResponse.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.summary) {
          basicCv.header.summary = parsed.summary;
        }
        if (Array.isArray(parsed.projectBullets)) {
          basicCv.projects = basicCv.projects.map((p, idx) => {
            if (parsed.projectBullets[idx] && parsed.projectBullets[idx].length > 0) {
              return { ...p, bullets: parsed.projectBullets[idx] };
            }
            return p;
          });
        }
      }
    } catch (err) {
      console.warn("AI synthesis skipped or offline fallback used:", err.message);
      if (!basicCv.header.summary) {
        basicCv.header.summary = `Motivated ${formData.title.trim() || 'graduate'} with a strong academic foundation in ${formData.degree.trim() || 'technical and analytical coursework'}, proficient in ${rawSkills.slice(0, 3).join(', ') || 'core fundamentals'}, seeking to drive immediate impact through dedicated problem solving and collaborative execution.`;
      }
    }

    setIsGenerating(false);
    onComplete(normalizeCvSchema(basicCv));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/80 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Fresher 1-Page Resume Wizard</h2>
              <p className="text-xs text-slate-500">Apni authentic details bharein — 100% ATS Ready 1-Page CV banega</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between my-5 px-2">
          {[
            { num: 1, label: 'Contact', icon: User },
            { num: 2, label: 'Education', icon: GraduationCap },
            { num: 3, label: 'Skills', icon: Code2 },
            { num: 4, label: 'Projects', icon: FolderGit2 }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div 
                key={s.num} 
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 cursor-pointer transition ${
                  isActive ? 'text-blue-600 font-bold' : isDone ? 'text-emerald-600 font-medium' : 'text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition ${
                  isActive ? 'bg-blue-600 text-white shadow-sm' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-xs hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Basic Identity & Contact */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Role / Headline *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Associate Software Engineer / Data Analyst"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City, State</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Bengaluru, Karnataka"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile (optional)</label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub / Portfolio (optional)</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => handleChange('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Education */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Course *</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder="e.g. B.Tech in Computer Science / BBA / B.Com"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">College / University Name *</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  placeholder="e.g. Delhi Technological University"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year *</label>
                <input
                  type="text"
                  value={formData.passingYear}
                  onChange={(e) => handleChange('passingYear', e.target.value)}
                  placeholder="e.g. 2024 (or 2020 – 2024)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CGPA / Percentage (optional)</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  placeholder="e.g. 8.5 CGPA or 82%"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certifications / Courses (optional)</label>
              <input
                type="text"
                value={formData.certificationsInput}
                onChange={(e) => handleChange('certificationsInput', e.target.value)}
                placeholder="e.g. AWS Cloud Certified, Google Data Analytics (comma separated)"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Skills */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Add Key Skills & Tools (Press Enter or comma to add)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.skillsInput}
                  onChange={(e) => handleChange('skillsInput', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddSkill(formData.skillsInput);
                    }
                  }}
                  placeholder="e.g. Python, SQL, React, Git, Problem Solving"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(formData.skillsInput)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Added Skills Chips */}
            {formData.skillsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {formData.skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestions for Freshers */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Popular suggestions (Click to add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Python', 'Java', 'SQL', 'JavaScript', 'React', 'HTML/CSS', 
                  'Git & GitHub', 'Data Structures', 'Data Analysis', 'Problem Solving',
                  'Communication', 'Teamwork', 'MS Excel', 'Agile'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 transition cursor-pointer"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Languages</label>
              <input
                type="text"
                value={formData.languagesInput}
                onChange={(e) => handleChange('languagesInput', e.target.value)}
                placeholder="English, Hindi"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Academic / Personal Projects */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                Freshers ke liye projects sabse important hote hain. Apne 1 ya 2 academic/personal projects add karein.
              </p>
              {formData.projects.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              )}
            </div>

            {formData.projects.map((proj, pIdx) => (
              <div key={pIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Project #{pIdx + 1}</span>
                  {formData.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(pIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Title *</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleProjectChange(pIdx, 'title', e.target.value)}
                      placeholder="e.g. Student Attendance Management System"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Technologies Used</label>
                    <input
                      type="text"
                      value={proj.tech}
                      onChange={(e) => handleProjectChange(pIdx, 'tech', e.target.value)}
                      placeholder="e.g. Python, Django, SQLite, Bootstrap"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">What did you build? (Brief description)</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleProjectChange(pIdx, 'description', e.target.value)}
                    placeholder="e.g. Developed an automated web application for tracking student attendance with secure login and CSV report export."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Skip Wizard & Chat Directly
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSynthesizeResume}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating 1-Page ATS Resume...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate 1-Page ATS Resume</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
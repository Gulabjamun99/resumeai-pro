import React, { useState } from 'react';
import { 
  User, Briefcase, GraduationCap, Code2, FolderGit2, 
  Plus, Trash2, Check, Sparkles, ChevronDown, ChevronUp, Save, Clock
} from 'lucide-react';

/**
 * QUICK EDIT PANEL (ZERO AI CREDITS / INSTANT CLIENT-SIDE WYSIWYG)
 * 
 * Allows users to edit any section of their resume instantly without
 * burning AI tokens or waiting for LLM network requests. Updates the
 * live A4 document canvas in real time.
 */
export default function QuickEditPanel({ 
  resume, 
  onLiveSync, 
  onCommit, 
  currentVersion = 1 
}) {
  const [openSection, setOpenSection] = useState('header'); // 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  if (!resume) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No active resume data loaded.
      </div>
    );
  }

  // Clone and emit change
  const updateResumeData = (mutatorFn, summary = "Direct edit") => {
    const updated = JSON.parse(JSON.stringify(resume));
    mutatorFn(updated);
    setHasUnsavedChanges(true);
    if (onLiveSync) {
      onLiveSync(updated);
    }
  };

  const handleSaveSnapshot = () => {
    if (onCommit) {
      onCommit(resume, `Manual edit v${currentVersion + 1}`);
      setHasUnsavedChanges(false);
    }
  };

  const header = resume.header || {};
  const contact = resume.contact || {};
  const experiences = Array.isArray(resume.experiences) 
    ? resume.experiences 
    : (Array.isArray(resume.experience) ? resume.experience : []);
  const education = Array.isArray(resume.education) ? resume.education : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const skills = resume.skills || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-left bg-slate-900 text-slate-200 text-xs">
      {/* Top Banner with Zero AI Token Notice & Save Snapshot */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-600/40 px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Zero AI Credits Used
          </span>
        </div>

        <button
          onClick={handleSaveSnapshot}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] px-3 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
          title="Save as a new version snapshot for Undo/Redo"
        >
          <Save className="w-3 h-3" />
          <span>Save Version</span>
        </button>
      </div>

      {/* Scrollable Accordions */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        
        {/* 1. Personal & Contact Details */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setOpenSection(openSection === 'header' ? null : 'header')}
            className="w-full p-3 flex items-center justify-between font-bold text-xs text-slate-200 hover:bg-slate-900/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sky-400">
              <User className="w-4 h-4" />
              <span>Personal Details & Target Role</span>
            </div>
            {openSection === 'header' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {openSection === 'header' && (
            <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2.5 bg-slate-900/40">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={header.name || ''}
                  onChange={(e) => updateResumeData((c) => {
                    if (!c.header) c.header = {};
                    c.header.name = e.target.value;
                  })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                  placeholder="e.g. Rohit Kumar"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Headline / Target Title</label>
                <input
                  type="text"
                  value={header.title || header.headline || ''}
                  onChange={(e) => updateResumeData((c) => {
                    if (!c.header) c.header = {};
                    c.header.title = e.target.value;
                    c.header.headline = e.target.value;
                  })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                  placeholder="e.g. Autonomous AI Agentic Developer & Full-Stack Vibe Developer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => updateResumeData((c) => {
                      if (!c.contact) c.contact = {};
                      c.contact.email = e.target.value;
                    })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={contact.phone || ''}
                    onChange={(e) => updateResumeData((c) => {
                      if (!c.contact) c.contact = {};
                      c.contact.phone = e.target.value;
                    })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Location</label>
                  <input
                    type="text"
                    value={contact.location || contact.address || ''}
                    onChange={(e) => updateResumeData((c) => {
                      if (!c.contact) c.contact = {};
                      c.contact.location = e.target.value;
                      c.contact.address = e.target.value;
                    })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={contact.linkedin || ''}
                    onChange={(e) => updateResumeData((c) => {
                      if (!c.contact) c.contact = {};
                      c.contact.linkedin = e.target.value;
                    })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Professional Profile / Summary */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setOpenSection(openSection === 'summary' ? null : 'summary')}
            className="w-full p-3 flex items-center justify-between font-bold text-xs text-slate-200 hover:bg-slate-900/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>Executive Profile Summary</span>
            </div>
            {openSection === 'summary' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {openSection === 'summary' && (
            <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2 bg-slate-900/40">
              <textarea
                rows={5}
                value={header.summary || resume.summary || ''}
                onChange={(e) => updateResumeData((c) => {
                  if (!c.header) c.header = {};
                  c.header.summary = e.target.value;
                  c.summary = e.target.value;
                })}
                placeholder="Write or edit your executive profile summary..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-200 leading-relaxed resize-y"
              />
            </div>
          )}
        </div>

        {/* 3. Work Experience */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setOpenSection(openSection === 'experience' ? null : 'experience')}
            className="w-full p-3 flex items-center justify-between font-bold text-xs text-slate-200 hover:bg-slate-900/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 text-emerald-400">
              <Briefcase className="w-4 h-4" />
              <span>Work Experience ({experiences.length})</span>
            </div>
            {openSection === 'experience' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {openSection === 'experience' && (
            <div className="p-3 border-t border-slate-800/80 flex flex-col gap-4 bg-slate-900/40">
              {experiences.map((exp, expIdx) => (
                <div key={expIdx} className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="font-bold text-xs text-emerald-400">Role #{expIdx + 1}</span>
                    <button
                      onClick={() => updateResumeData((c) => {
                        const arr = c.experiences || c.experience || [];
                        arr.splice(expIdx, 1);
                        c.experiences = arr;
                      })}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 transition cursor-pointer"
                      title="Delete this role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Job Title / Role</label>
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => updateResumeData((c) => {
                          const arr = c.experiences || c.experience || [];
                          if (arr[expIdx]) arr[expIdx].role = e.target.value;
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Company</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateResumeData((c) => {
                          const arr = c.experiences || c.experience || [];
                          if (arr[expIdx]) arr[expIdx].company = e.target.value;
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Duration</label>
                      <input
                        type="text"
                        value={exp.duration || ''}
                        onChange={(e) => updateResumeData((c) => {
                          const arr = c.experiences || c.experience || [];
                          if (arr[expIdx]) arr[expIdx].duration = e.target.value;
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        placeholder="e.g. Apr 2025 – Present"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => updateResumeData((c) => {
                          const arr = c.experiences || c.experience || [];
                          if (arr[expIdx]) arr[expIdx].location = e.target.value;
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Responsibilities / Bullets ({exp.bullets?.length || 0})
                    </span>
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateResumeData((c) => {
                            const arr = c.experiences || c.experience || [];
                            if (arr[expIdx]?.bullets) arr[expIdx].bullets[bIdx] = e.target.value;
                          })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-200 resize-y"
                        />
                        <button
                          onClick={() => updateResumeData((c) => {
                            const arr = c.experiences || c.experience || [];
                            if (arr[expIdx]?.bullets) arr[expIdx].bullets.splice(bIdx, 1);
                          })}
                          className="text-slate-500 hover:text-red-400 p-1 mt-1 cursor-pointer"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => updateResumeData((c) => {
                        const arr = c.experiences || c.experience || [];
                        if (arr[expIdx]) {
                          if (!Array.isArray(arr[expIdx].bullets)) arr[expIdx].bullets = [];
                          arr[expIdx].bullets.push("Spearheaded key operational initiatives to drive measurable business outcomes.");
                        }
                      })}
                      className="w-fit text-[10.5px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bullet Point</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => updateResumeData((c) => {
                  if (!Array.isArray(c.experiences)) c.experiences = [];
                  c.experiences.unshift({
                    role: "New Role Title",
                    company: "Company Name",
                    duration: "Apr 2025 – Present",
                    location: "Location",
                    bullets: ["Executed key project deliverables with cross-functional alignment."]
                  });
                })}
                className="w-full py-2 rounded-lg border border-dashed border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Work Experience</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Education */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setOpenSection(openSection === 'education' ? null : 'education')}
            className="w-full p-3 flex items-center justify-between font-bold text-xs text-slate-200 hover:bg-slate-900/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 text-purple-400">
              <GraduationCap className="w-4 h-4" />
              <span>Education & Degrees ({education.length})</span>
            </div>
            {openSection === 'education' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {openSection === 'education' && (
            <div className="p-3 border-t border-slate-800/80 flex flex-col gap-3 bg-slate-900/40">
              {education.map((edu, eduIdx) => (
                <div key={eduIdx} className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                    <span className="font-bold text-xs text-purple-400">Degree #{eduIdx + 1}</span>
                    <button
                      onClick={() => updateResumeData((c) => {
                        if (Array.isArray(c.education)) c.education.splice(eduIdx, 1);
                      })}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Delete degree"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Degree / Qualification</label>
                    <input
                      type="text"
                      value={typeof edu === 'string' ? edu : (edu.degree || '')}
                      onChange={(e) => updateResumeData((c) => {
                        if (Array.isArray(c.education)) {
                          if (typeof c.education[eduIdx] === 'string') {
                            c.education[eduIdx] = { degree: e.target.value, institution: '', year: '' };
                          } else {
                            c.education[eduIdx].degree = e.target.value;
                          }
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      placeholder="e.g. MBA or BBA"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">University / Institute</label>
                      <input
                        type="text"
                        value={typeof edu === 'object' ? (edu.institution || edu.school || '') : ''}
                        onChange={(e) => updateResumeData((c) => {
                          if (Array.isArray(c.education) && typeof c.education[eduIdx] === 'object') {
                            c.education[eduIdx].institution = e.target.value;
                            c.education[eduIdx].school = e.target.value;
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        placeholder="e.g. State University / College Name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Year</label>
                      <input
                        type="text"
                        value={typeof edu === 'object' ? (edu.year || edu.duration || '') : ''}
                        onChange={(e) => updateResumeData((c) => {
                          if (Array.isArray(c.education) && typeof c.education[eduIdx] === 'object') {
                            c.education[eduIdx].year = e.target.value;
                            c.education[eduIdx].duration = e.target.value;
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        placeholder="e.g. 2012"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => updateResumeData((c) => {
                  if (!Array.isArray(c.education)) c.education = [];
                  c.education.push({ degree: "Degree Name", institution: "University Name", year: "2024" });
                })}
                className="w-full py-2 rounded-lg border border-dashed border-purple-500/40 text-purple-300 hover:bg-purple-950/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education Degree</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Core Skills */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setOpenSection(openSection === 'skills' ? null : 'skills')}
            className="w-full p-3 flex items-center justify-between font-bold text-xs text-slate-200 hover:bg-slate-900/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 text-indigo-400">
              <Code2 className="w-4 h-4" />
              <span>Core Skills & Technologies</span>
            </div>
            {openSection === 'skills' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {openSection === 'skills' && (
            <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2.5 bg-slate-900/40">
              <span className="text-[10px] text-slate-400">
                Enter skills separated by commas (e.g. Google Antigravity IDE, Claude, ChatGPT, Supabase, React):
              </span>
              <textarea
                rows={4}
                value={
                  Array.isArray(skills) 
                    ? skills.join(', ') 
                    : typeof skills === 'object' 
                      ? Object.entries(skills).map(([cat, list]) => `${cat}: ${Array.isArray(list) ? list.join(', ') : list}`).join('\n')
                      : String(skills || '')
                }
                onChange={(e) => updateResumeData((c) => {
                  const val = e.target.value;
                  if (Array.isArray(c.skills)) {
                    c.skills = val.split(',').map(s => s.trim()).filter(Boolean);
                  } else if (typeof c.skills === 'object' && c.skills !== null) {
                    c.skills = val.split(',').map(s => s.trim()).filter(Boolean);
                  } else {
                    c.skills = val.split(',').map(s => s.trim()).filter(Boolean);
                  }
                })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 resize-y"
              />
            </div>
          )}
        </div>

        {/* 6. Projects */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            onClick={() => setOpenSection(openSection === 'projects' ? null : 'projects')}
            className="w-full p-3 flex items-center justify-between font-bold text-xs text-slate-200 hover:bg-slate-900/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <FolderGit2 className="w-4 h-4" />
              <span>Projects & Production Apps ({projects.length})</span>
            </div>
            {openSection === 'projects' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {openSection === 'projects' && (
            <div className="p-3 border-t border-slate-800/80 flex flex-col gap-3 bg-slate-900/40">
              {projects.map((proj, pIdx) => (
                <div key={pIdx} className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                    <span className="font-bold text-xs text-rose-400">Project #{pIdx + 1}</span>
                    <button
                      onClick={() => updateResumeData((c) => {
                        if (Array.isArray(c.projects)) c.projects.splice(pIdx, 1);
                      })}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Project Name</label>
                      <input
                        type="text"
                        value={proj.name || proj.title || ''}
                        onChange={(e) => updateResumeData((c) => {
                          if (Array.isArray(c.projects) && c.projects[pIdx]) {
                            c.projects[pIdx].name = e.target.value;
                            c.projects[pIdx].title = e.target.value;
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        placeholder="e.g. Mobile Utility App / E-Commerce Platform"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Tech Stack</label>
                      <input
                        type="text"
                        value={proj.tech || proj.technologies || ''}
                        onChange={(e) => updateResumeData((c) => {
                          if (Array.isArray(c.projects) && c.projects[pIdx]) {
                            c.projects[pIdx].tech = e.target.value;
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        placeholder="e.g. Google Antigravity IDE, Claude, Supabase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Key Bullets / Highlights</label>
                    {(proj.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5 mb-1.5">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateResumeData((c) => {
                            if (Array.isArray(c.projects) && c.projects[pIdx]?.bullets) {
                              c.projects[pIdx].bullets[bIdx] = e.target.value;
                            }
                          })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-200 resize-y"
                        />
                        <button
                          onClick={() => updateResumeData((c) => {
                            if (Array.isArray(c.projects) && c.projects[pIdx]?.bullets) {
                              c.projects[pIdx].bullets.splice(bIdx, 1);
                            }
                          })}
                          className="text-slate-500 hover:text-red-400 p-1 mt-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateResumeData((c) => {
                        if (Array.isArray(c.projects) && c.projects[pIdx]) {
                          if (!Array.isArray(c.projects[pIdx].bullets)) c.projects[pIdx].bullets = [];
                          c.projects[pIdx].bullets.push("Engineered modern features delivering robust user engagement.");
                        }
                      })}
                      className="text-[10.5px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bullet</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => updateResumeData((c) => {
                  if (!Array.isArray(c.projects)) c.projects = [];
                  c.projects.push({
                    name: "New Project",
                    tech: "Modern Web Stack & AI Copilots",
                    bullets: ["Engineered scalable application with robust architecture."]
                  });
                })}
                className="w-full py-2 rounded-lg border border-dashed border-rose-500/40 text-rose-300 hover:bg-rose-950/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

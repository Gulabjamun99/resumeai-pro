import React from 'react';
import { Mail, Phone, MapPin, Globe, Code, Layers } from 'lucide-react';

export default function HybridPortfolioTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;
  const header = resume.header || {};
  const contact = resume.contact || {};
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experiences = Array.isArray(resume.experiences) ? resume.experiences : (Array.isArray(resume.experience) ? resume.experience : []);
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];

  return (
    <div id={id} className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col font-sans transition-all duration-300 print:shadow-none print:m-0" style={{ width: '100%', maxWidth: '820px', minHeight: '1050px', padding: '36px 44px', boxSizing: 'border-box' }}>
      <header className="flex justify-between items-start border-b-2 border-emerald-600 pb-3 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">{header.name || "Candidate Name"}</h1>
          {header.title && <p className="text-sm font-bold text-emerald-700 mt-0.5">{header.title}</p>}
        </div>
        <div className="text-right text-xs text-slate-600 font-medium">
          <div>{contact.email}</div>
          <div>{contact.phone} • {contact.address}</div>
          {contact.linkedin && <div className="text-emerald-700 font-mono">{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</div>}
        </div>
      </header>

      {header.summary && (
        <section className="mb-4">
          <p className="text-xs text-slate-700 leading-relaxed text-justify bg-emerald-50/50 p-2.5 rounded border border-emerald-100">{header.summary}</p>
        </section>
      )}

      {/* Featured Projects Grid */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-0.5 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Featured Live Applications & Product Portfolio</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                  <span className="text-[9.5px] font-mono bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">LIVE</span>
                </div>
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? <p className="text-[10.5px] text-slate-600 mt-0.5">{proj.bullets[0]}</p> : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skills & Technologies</span>
          </h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-[10.5px] font-medium px-2 py-0.5 rounded">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-0.5 mb-2">Work Experience</h2>
          <div className="flex flex-col gap-3">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-900">{exp.role} <span className="font-semibold text-emerald-700">• {exp.company}</span></span>
                  <span className="text-[10.5px] font-mono text-slate-500 font-semibold">{exp.period || exp.dates}</span>
                </div>
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <section className="mt-auto pt-2 border-t border-emerald-200 flex justify-between text-xs text-slate-700">
          {education.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 uppercase text-[10.5px] block">Education</span>
              {education.map((edu, idx) => (
                <div key={idx} className="text-slate-600">{typeof edu === 'string' ? edu : `${edu.degree || ''} • ${edu.school || ''}`}</div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 uppercase text-[10.5px] block">Certifications</span>
              <div>{certifications.map((c) => (typeof c === 'string' ? c : c.name)).join(', ')}</div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

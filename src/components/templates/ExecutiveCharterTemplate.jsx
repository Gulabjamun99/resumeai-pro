import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function ExecutiveCharterTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;
  const header = resume.header || {};
  const contact = resume.contact || {};
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experiences = Array.isArray(resume.experiences) ? resume.experiences : (Array.isArray(resume.experience) ? resume.experience : []);
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];

  return (
    <div id={id} className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col font-serif transition-all duration-300 print:shadow-none print:m-0" style={{ width: '100%', maxWidth: '820px', minHeight: '1050px', padding: '40px 48px', boxSizing: 'border-box' }}>
      <header className="border-b-2 border-slate-900 pb-4 mb-4">
        <h1 className="text-3xl font-bold tracking-normal text-slate-950 uppercase">{header.name || "Candidate Name"}</h1>
        {header.title && <p className="text-sm font-semibold text-slate-700 italic mt-0.5 tracking-wide">{header.title}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600 font-sans">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>• {contact.phone}</span>}
          {contact.address && <span>• {contact.address}</span>}
          {contact.linkedin && <span>• {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>}
        </div>
      </header>

      {header.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-400 pb-0.5 mb-1.5 font-sans">Executive Biography</h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">{header.summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-400 pb-0.5 mb-1.5 font-sans">Strategic Competencies</h2>
          <p className="text-xs text-slate-800 font-sans">{skills.join('  •  ')}</p>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-400 pb-0.5 mb-2 font-sans">Executive Ventures & Initiatives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2 border border-slate-300 rounded font-sans">
                <span className="text-xs font-bold text-slate-950 block">{proj.title}</span>
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? <p className="text-[10.5px] text-slate-600 mt-0.5">{proj.bullets[0]}</p> : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-400 pb-0.5 mb-2 font-sans">Leadership & Career History</h2>
          <div className="flex flex-col gap-3">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-950">{exp.role} <span className="font-normal italic text-slate-700">• {exp.company}</span></span>
                  <span className="text-[11px] font-sans text-slate-600 font-medium">{exp.period || exp.dates}</span>
                </div>
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-slate-800 leading-relaxed font-sans">
                    {exp.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <section className="mt-auto pt-2 border-t border-slate-300 flex justify-between text-xs text-slate-800 font-sans">
          {education.length > 0 && (
            <div>
              <span className="font-bold text-slate-950 uppercase text-[10.5px] block font-serif">Education</span>
              {education.map((edu, idx) => (
                <div key={idx} className="text-slate-700">{typeof edu === 'string' ? edu : `${edu.degree || ''} • ${edu.school || ''}`}</div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <span className="font-bold text-slate-950 uppercase text-[10.5px] block font-serif">Credentials</span>
              <div>{certifications.map((c) => (typeof c === 'string' ? c : c.name)).join(', ')}</div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

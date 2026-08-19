import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function CompactOnePageTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;
  const header = resume.header || {};
  const contact = resume.contact || {};
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experiences = Array.isArray(resume.experiences) ? resume.experiences : (Array.isArray(resume.experience) ? resume.experience : []);
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];

  return (
    <div id={id} className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col font-sans transition-all duration-300 print:shadow-none print:m-0" style={{ width: '100%', maxWidth: '820px', minHeight: '1050px', padding: '28px 36px', boxSizing: 'border-box' }}>
      <header className="border-b border-slate-900 pb-2 mb-3">
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{header.name || "Candidate Name"}</h1>
            {header.title && <p className="text-xs font-semibold text-slate-700">{header.title}</p>}
          </div>
          <div className="text-right text-[10.5px] text-slate-600 leading-tight">
            <div>{contact.email} {contact.phone && `• ${contact.phone}`}</div>
            <div>{contact.address} {contact.linkedin && `• ${contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}`}</div>
          </div>
        </div>
      </header>

      {header.summary && (
        <section className="mb-2.5">
          <p className="text-[11px] text-slate-700 leading-snug text-justify">{header.summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-2.5">
          <div className="text-[11px] text-slate-800"><span className="font-bold text-slate-950">Skills: </span>{skills.join(', ')}</div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-2.5">
          <h2 className="text-[11px] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">Key Live Projects</h2>
          <div className="grid grid-cols-2 gap-1.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-1 bg-slate-50 border border-slate-200 rounded text-[10.5px]">
                <span className="font-bold text-slate-900 block">{proj.title}</span>
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? <p className="text-slate-600">{proj.bullets[0]}</p> : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mb-2.5">
          <h2 className="text-[11px] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1">Experience</h2>
          <div className="flex flex-col gap-2">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col">
                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-600">• {exp.company}</span></span>
                  <span className="font-mono text-[10px] text-slate-500">{exp.period || exp.dates}</span>
                </div>
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10.5px] text-slate-700 leading-snug">
                    {exp.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <section className="mt-auto pt-1.5 border-t border-slate-200 flex justify-between text-[10.5px] text-slate-700">
          {education.length > 0 && (
            <div><span className="font-bold">Education: </span>{education.map(e => typeof e === 'string' ? e : e.degree).join(' • ')}</div>
          )}
          {certifications.length > 0 && (
            <div><span className="font-bold">Certifications: </span>{certifications.map(c => typeof c === 'string' ? c : c.name).join(' • ')}</div>
          )}
        </section>
      )}
    </div>
  );
}

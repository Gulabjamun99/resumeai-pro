import React from 'react';
import { Mail, Phone, MapPin, Globe, Code, Terminal, Layers, ExternalLink } from 'lucide-react';

export default function TechDeveloperTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;

  const header = resume.header || {};
  const contact = resume.contact || {};
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experiences = Array.isArray(resume.experiences) 
    ? resume.experiences 
    : Array.isArray(resume.experience) 
      ? resume.experience 
      : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];

  return (
    <div
      id={id}
      className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col font-sans transition-all duration-300 print:shadow-none print:m-0"
      style={{
        width: '100%',
        maxWidth: '820px',
        minHeight: '1050px',
        padding: '36px 44px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <p className="text-sm font-semibold text-indigo-700 font-mono mt-0.5">
                {header.title}
              </p>
            )}
          </div>
        </div>

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-600 font-medium">
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>{contact.email}</span>
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{contact.phone}</span>
            </span>
          )}
          {contact.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>{contact.address}</span>
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {header.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-200 pb-1 mb-1.5 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Technical Profile & Core Competencies</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {header.summary}
          </p>
        </section>
      )}

      {/* Technical Skills Matrix */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-200 pb-1 mb-1.5 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Technical Skills & Tools Stack</span>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-[11px] font-mono font-medium px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Live Projects & Applications Spotlight */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-200 pb-1 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Featured Live Applications & Open-Source Projects</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{proj.title || "Project"}</span>
                    <span className="text-[9.5px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Live</span>
                  </div>
                  {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.bullets[0]}</p>
                  ) : proj.description ? (
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-200 pb-1 mb-2 flex items-center gap-1.5">
            <span>Engineering & Professional Experience</span>
          </h2>
          <div className="flex flex-col gap-3.5">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {exp.role || "Role"}
                    </span>
                    <span className="text-xs text-indigo-700 font-semibold">
                      • {exp.company || exp.location || "Company"}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-500 font-semibold whitespace-nowrap">
                    {exp.period || exp.dates || ""}
                  </span>
                </div>

                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="pl-0.5">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certs */}
      {(education.length > 0 || certifications.length > 0) && (
        <section className="mt-auto pt-2 border-t border-slate-200 flex flex-wrap justify-between gap-4 text-xs text-slate-700">
          {education.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-900 uppercase text-[11px]">Education</span>
              {education.map((edu, idx) => (
                <div key={idx} className="text-slate-600 font-medium">
                  {typeof edu === 'string' ? edu : `${edu.degree || ''} ${edu.school ? `• ${edu.school}` : ''}`}
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-900 uppercase text-[11px]">Certifications</span>
              <div className="flex flex-wrap gap-1">
                {certifications.map((cert, idx) => (
                  <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10.5px] font-medium text-slate-700">
                    {typeof cert === 'string' ? cert : cert.name || ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

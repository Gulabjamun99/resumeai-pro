import React from 'react';
import { Mail, Phone, MapPin, Globe, Sparkles, Briefcase, Award } from 'lucide-react';

export default function CreativeStartupTemplate({ resume, id = "resume-document" }) {
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
      {/* Header with Purple Modern Accent */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-xl mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <p className="text-sm font-medium text-purple-200 mt-0.5 tracking-wide">
                {header.title}
              </p>
            )}
          </div>
        </div>

        {/* Contact info inline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-purple-100/90 font-medium">
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-purple-300" />
              <span>{contact.email}</span>
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-purple-300" />
              <span>{contact.phone}</span>
            </span>
          )}
          {contact.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-300" />
              <span>{contact.address}</span>
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-purple-300" />
              <span>{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {header.summary && (
        <section className="mb-4">
          <div className="p-3 bg-purple-50/50 border-l-4 border-purple-600 rounded-r-lg">
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {header.summary}
            </p>
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-purple-200 pb-1 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Core Competencies & Stack</span>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-purple-200 pb-1 mb-2 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            <span>Ventures, Products & Highlights</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold text-slate-900">{proj.title || "Project"}</span>
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{proj.bullets[0]}</p>
                ) : proj.description ? (
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-purple-200 pb-1 mb-2 flex items-center gap-1.5">
            <span>Career Experience & Impact</span>
          </h2>
          <div className="flex flex-col gap-3.5">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {exp.role || "Role"}
                    </span>
                    <span className="text-xs text-purple-700 font-semibold">
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

      {/* Education & Certifications */}
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
              <span className="font-bold text-slate-900 uppercase text-[11px]">Credentials & Honors</span>
              <div className="flex flex-wrap gap-1">
                {certifications.map((cert, idx) => (
                  <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[10.5px] font-medium text-slate-700">
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

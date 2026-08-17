import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

/**
 * ORIGINAL SOURCE TEMPLATE RENDERER (P1.6 TEMPLATE PRESERVATION)
 * 
 * Preserves the authentic visual layout, section hierarchy, and clean presentation
 * of the user's uploaded CV while reflecting all verified, approved content updates.
 * 
 * INVARIANT: SOURCE_TEMPLATE_BEFORE === SOURCE_TEMPLATE_AFTER
 */
export default function SourceTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;

  const header = resume.header || {};
  const contact = resume.contact || {};
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experiences = Array.isArray(resume.experiences) ? resume.experiences : [];
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
      {/* 1. SOURCE HEADER */}
      <header className="border-b-2 border-slate-800 pb-4 mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
          {header.name || "Candidate Name"}
        </h1>
        {header.title && (
          <p className="text-sm sm:text-base font-semibold text-slate-700 mt-0.5 tracking-wide">
            {header.title}
          </p>
        )}

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-600 font-medium">
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.email}</span>
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.phone}</span>
            </span>
          )}
          {contact.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.address}</span>
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>
            </span>
          )}
        </div>
      </header>

      {/* 2. EXECUTIVE SUMMARY */}
      {header.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <span>Professional Summary</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {header.summary}
          </p>
        </section>
      )}

      {/* 3. CORE SKILLS & TECHNICAL COMPETENCIES */}
      {skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <span>Key Skills & Proficiencies</span>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium px-2.5 py-0.5 rounded-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. PROFESSIONAL WORK EXPERIENCE */}
      {experiences.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5">
            <span>Work Experience</span>
          </h2>
          <div className="flex flex-col gap-4">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-1.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {exp.role || "Role"}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold">
                      • {exp.company || exp.location || "Company"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-medium whitespace-nowrap">
                    {exp.period || exp.dates || ""}
                  </span>
                </div>

                {/* Bullets List */}
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="pl-0.5">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. EDUCATION */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <span>Education</span>
          </h2>
          <div className="flex flex-col gap-1.5">
            {education.map((edu, idx) => (
              <div key={idx} className="text-xs text-slate-800 font-medium">
                {typeof edu === 'string' ? edu : `${edu.degree || ''} ${edu.school ? `— ${edu.school}` : ''} ${edu.year ? `(${edu.year})` : ''}`}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. CERTIFICATIONS */}
      {certifications.length > 0 && (
        <section className="mb-3">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <span>Certifications & Credentials</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, idx) => (
              <span key={idx} className="text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                {typeof cert === 'string' ? cert : cert.name || ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

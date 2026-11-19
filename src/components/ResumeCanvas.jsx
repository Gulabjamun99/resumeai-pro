import React from 'react';
import { Mail, Phone, MapPin, Globe, Code, ExternalLink, Award, BookOpen, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import { normalizeCvSchema } from '../utils/cvNormalizer.js';
import { TEMPLATES, getTemplateById } from '../data/templateCatalog.js';

export { TEMPLATES, getTemplateById };

function getBulletSymbol(style) {
  switch (style) {
    case 'circle': return '○';
    case 'hyphen': return '–';
    case 'arrow': return '▸';
    case 'diamond': return '◆';
    case 'disc':
    default: return '•';
  }
}

export default function ResumeCanvas({ 
  resume, 
  id = "resume-document", 
  accentColor = "#2563eb",
  fontFamily = "font-sans",
  templateId = "modern-executive"
}) {
  if (!resume) return null;

  const cv = normalizeCvSchema(resume);
  const header = cv.header || {};
  const contact = cv.contact || {};
  const skills = Array.isArray(cv.skills) ? cv.skills : [];
  const experiences = Array.isArray(cv.experiences) ? cv.experiences : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const projects = Array.isArray(cv.projects) ? cv.projects : [];
  const certifications = Array.isArray(cv.certifications) ? cv.certifications : [];
  const languages = Array.isArray(cv.languages) ? cv.languages : [];
  const customSections = Array.isArray(cv.customSections) ? cv.customSections : [];

  const activeTemplate = templateId || cv.styleProfile?.templateId || 'modern-executive';
  const templateConfig = getTemplateById(activeTemplate);

  const activeAccent = accentColor || cv.styleProfile?.accentColor || templateConfig.accentColor || "#2563eb";
  const activeFont = fontFamily || cv.styleProfile?.fontFamily || templateConfig.fontFamily || "font-sans";

  // Common A4 canvas dimensions
  const a4CanvasStyle = {
    width: '100%',
    maxWidth: '820px',
    minHeight: '1120px',
    boxSizing: 'border-box'
  };

  // ========================================================
  // 1. CLASSIC IVY LEAGUE (Centred, Serif, Formal)
  // ========================================================
  if (activeTemplate === 'classic-ivy') {
    return (
      <div
        id={id}
        className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-col font-serif p-10 sm:p-12 transition-all duration-200 print:shadow-none print:m-0`}
        style={{ ...a4CanvasStyle, color: '#111827' }}
      >
        <header className="text-center border-b pb-4 mb-4" style={{ borderColor: '#d1d5db' }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase text-slate-950">
            {header.name || "Candidate Name"}
          </h1>
          {header.title && (
            <p className="text-xs sm:text-sm italic font-medium mt-1 text-slate-700 tracking-wider">
              {header.title}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-600 font-sans">
            {contact.location && <span>{contact.location}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.email && (
              <span>• <a href={`mailto:${contact.email}`} className="text-slate-800 hover:underline">{contact.email}</a></span>
            )}
            {contact.linkedin && (
              <span>• <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-slate-800 hover:underline">{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'linkedin/')}</a></span>
            )}
            {contact.github && (
              <span>• <a href={contact.github} target="_blank" rel="noreferrer" className="text-slate-800 hover:underline">{contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github/')}</a></span>
            )}
          </div>
        </header>

        {header.summary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-1.5 text-slate-900" style={{ borderColor: '#9ca3af' }}>
              Professional Summary
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed text-justify font-sans">
              {header.summary}
            </p>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2 text-slate-900" style={{ borderColor: '#9ca3af' }}>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{edu.institution || "University"}</span>
                    <span className="text-[11px] font-normal italic text-slate-600">{edu.year}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11.5px] italic text-slate-800 font-sans">
                    <span>{edu.degree}</span>
                    {edu.grade && <span className="text-[10.5px] font-mono not-italic text-slate-600">{edu.grade}</span>}
                  </div>
                  {edu.details && <p className="text-[11px] text-slate-600 font-sans mt-0.5">{edu.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2.5 text-slate-900" style={{ borderColor: '#9ca3af' }}>
              Experience
            </h2>
            <div className="space-y-3.5">
              {experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-900">{exp.company}</span>
                    <span className="text-[11px] italic text-slate-600">{exp.period}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11.5px] italic text-slate-700 font-sans mb-1">
                    <span>{exp.role}</span>
                    {exp.location && <span className="text-[10.5px] not-italic text-slate-500">{exp.location}</span>}
                  </div>

                  {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-800 font-sans leading-relaxed">
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

        {projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2 text-slate-900" style={{ borderColor: '#9ca3af' }}>
              Projects
            </h2>
            <div className="space-y-2">
              {projects.map((proj, idx) => (
                <div key={idx} className="text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900 font-serif">{proj.title}</span>
                    {proj.tech && <span className="text-[10.5px] text-slate-500 italic">{proj.tech}</span>}
                  </div>
                  {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">{proj.bullets[0]}</p>
                  ) : proj.description ? (
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">{proj.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mb-3 font-sans">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-1.5 font-serif text-slate-900" style={{ borderColor: '#9ca3af' }}>
              Skills & Expertise
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed">
              <span className="font-bold">Core Competencies: </span>
              {skills.join(' • ')}
            </p>
          </section>
        )}

        {(certifications.length > 0 || languages.length > 0) && (
          <section className="font-sans text-xs text-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-1.5 font-serif text-slate-900" style={{ borderColor: '#9ca3af' }}>
              Additional Information
            </h2>
            {certifications.length > 0 && (
              <p className="mb-1">
                <span className="font-bold">Certifications: </span>
                {certifications.map(c => typeof c === 'string' ? c : c.name).join(', ')}
              </p>
            )}
            {languages.length > 0 && (
              <p>
                <span className="font-bold">Languages: </span>
                {languages.map(l => `${l.name} (${l.level || 'Fluent'})`).join(', ')}
              </p>
            )}
          </section>
        )}
      </div>
    );
  }

  // ========================================================
  // 2. TECH MINIMALIST (Modern Tech / Engineering)
  // ========================================================
  if (activeTemplate === 'tech-minimal') {
    return (
      <div
        id={id}
        className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-col ${activeFont} p-8 sm:p-10 transition-all duration-200 print:shadow-none print:m-0`}
        style={a4CanvasStyle}
      >
        <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-3.5 mb-4 gap-2" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <p className="text-xs sm:text-sm font-semibold tracking-wide mt-1" style={{ color: activeAccent }}>
                {header.title}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:items-end text-xs text-slate-600 gap-0.5">
            {contact.email && <span>{contact.email}</span>}
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              {contact.phone && <span>{contact.phone}</span>}
              {contact.location && <span>• {contact.location}</span>}
            </div>
            <div className="flex items-center gap-2 text-[10.5px] font-mono mt-0.5" style={{ color: activeAccent }}>
              {contact.github && <span>{contact.github.replace(/^https?:\/\//i, '')}</span>}
              {contact.linkedin && <span>• {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>}
            </div>
          </div>
        </header>

        {header.summary && (
          <section className="mb-4">
            <p className="text-xs text-slate-700 leading-relaxed">
              {header.summary}
            </p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">
              // Technical Arsenal & Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-mono px-2 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2.5">
              // Professional Experience
            </h2>
            <div className="space-y-3.5">
              {experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-900">
                      {exp.role} <span className="font-normal text-slate-500">@ {exp.company}</span>
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {exp.period}
                    </span>
                  </div>

                  {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed mt-1">
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

        {projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">
              // Technical Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                    {proj.tech && <span className="text-[10px] font-mono text-slate-500">{proj.tech}</span>}
                  </div>
                  {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.bullets[0]}</p>
                  ) : proj.description ? (
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {(education.length > 0 || certifications.length > 0) && (
          <section className="mb-3">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              // Education & Credentials
            </h2>
            <div className="flex flex-wrap justify-between gap-3 text-xs">
              {education.map((edu, idx) => (
                <div key={idx} className="text-slate-800">
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-slate-500 text-[11px]"> — {edu.institution} ({edu.year})</span>
                </div>
              ))}
              {certifications.length > 0 && (
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Certifications: </span>
                  {certifications.map(c => typeof c === 'string' ? c : c.name).join(', ')}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ========================================================
  // 3. COMPACT ATS PRO (Maximum Content Density)
  // ========================================================
  if (activeTemplate === 'compact-ats') {
    return (
      <div
        id={id}
        className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-col ${activeFont} p-6 sm:p-8 transition-all duration-200 print:shadow-none print:m-0`}
        style={a4CanvasStyle}
      >
        <header className="border-b pb-2.5 mb-3" style={{ borderColor: activeAccent }}>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-tight">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <span className="text-xs font-bold" style={{ color: activeAccent }}>
                {header.title}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-600">
            {contact.phone && <span>{contact.phone}</span>}
            {contact.email && <span>• {contact.email}</span>}
            {contact.location && <span>• {contact.location}</span>}
            {contact.linkedin && <span>• {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>}
            {contact.github && <span>• {contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github/')}</span>}
          </div>
        </header>

        {header.summary && (
          <section className="mb-2.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: '#cbd5e1' }}>
              Summary
            </h2>
            <p className="text-[11.5px] text-slate-700 leading-snug">
              {header.summary}
            </p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mb-2.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: '#cbd5e1' }}>
              Core Skills
            </h2>
            <p className="text-[11px] text-slate-800 leading-tight">
              {skills.join('  |  ')}
            </p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1.5" style={{ borderColor: '#cbd5e1' }}>
              Experience
            </h2>
            <div className="space-y-2">
              {experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx}>
                  <div className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{exp.role}</span>
                      <span className="text-slate-600 font-semibold">, {exp.company}</span>
                      {exp.location && <span className="text-slate-500 text-[10.5px]"> ({exp.location})</span>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{exp.period}</span>
                  </div>

                  {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11px] text-slate-700 leading-snug mt-0.5">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-2.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: '#cbd5e1' }}>
              Key Projects
            </h2>
            <div className="space-y-1.5 text-[11px]">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.tech && <span className="text-slate-500 font-mono text-[10px]"> [{proj.tech}]</span>}
                  {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                    <span className="text-slate-700"> — {proj.bullets[0]}</span>
                  ) : proj.description ? (
                    <span className="text-slate-700"> — {proj.description}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: '#cbd5e1' }}>
              Education
            </h2>
            <div className="space-y-1 text-[11px]">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600"> — {edu.institution}</span>
                    {edu.grade && <span className="text-slate-500 text-[10px]"> ({edu.grade})</span>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(certifications.length > 0 || languages.length > 0) && (
          <section className="text-[10.5px] text-slate-600">
            {certifications.length > 0 && (
              <p><span className="font-bold text-slate-800">Certifications: </span>{certifications.map(c => typeof c === 'string' ? c : c.name).join(', ')}</p>
            )}
            {languages.length > 0 && (
              <p className="mt-0.5"><span className="font-bold text-slate-800">Languages: </span>{languages.map(l => `${l.name} (${l.level || 'Fluent'})`).join(', ')}</p>
            )}
          </section>
        )}
      </div>
    );
  }

  // ========================================================
  // 4. TWO-COLUMN LAYOUTS (Two-Column Pro, Sidebar Accent, etc.)
  // ========================================================
  if (templateConfig.layout === 'two-column-left' || templateConfig.layout === 'two-column-sidebar' || activeTemplate === 'two-column-pro') {
    const bulletChar = getBulletSymbol(templateConfig.bulletStyle);
    return (
      <div
        id={id}
        className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-row text-left ${activeFont} transition-all duration-200 print:shadow-none print:m-0`}
        style={a4CanvasStyle}
      >
        {/* Left Sidebar */}
        <aside 
          className="w-[33%] min-w-[240px] p-6 sm:p-7 flex flex-col gap-5 shrink-0 border-r border-slate-200"
          style={{ backgroundColor: cv.styleProfile?.sidebarBg || '#f8fafc' }}
        >
          {/* Contact */}
          <section>
            <h3 
              className="text-[11px] font-bold tracking-widest uppercase border-b pb-1 mb-2.5"
              style={{ color: activeAccent, borderColor: `${activeAccent}33` }}
            >
              Contact
            </h3>
            <div className="flex flex-col gap-2 text-xs text-slate-600 font-medium">
              {contact.email && (
                <div className="flex items-center gap-2 break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: activeAccent }} />
                  <a href={`mailto:${contact.email}`} className="text-slate-700 hover:underline">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: activeAccent }} />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: activeAccent }} />
                  <span>{contact.location}</span>
                </div>
              )}
              {contact.linkedin && (
                <div className="flex items-center gap-2 break-all">
                  <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: activeAccent }} />
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">
                    {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}
                  </a>
                </div>
              )}
              {contact.github && (
                <div className="flex items-center gap-2 break-all">
                  <Code className="w-3.5 h-3.5 shrink-0" style={{ color: activeAccent }} />
                  <span>{contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/')}</span>
                </div>
              )}
            </div>
          </section>

          {/* Core Skills */}
          {skills.length > 0 && (
            <section>
              <h3 
                className="text-[11px] font-bold tracking-widest uppercase border-b pb-1 mb-2.5"
                style={{ color: activeAccent, borderColor: `${activeAccent}33` }}
              >
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span 
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200/90 text-slate-800 shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h3 
                className="text-[11px] font-bold tracking-widest uppercase border-b pb-1 mb-2.5"
                style={{ color: activeAccent, borderColor: `${activeAccent}33` }}
              >
                Education
              </h3>
              <div className="flex flex-col gap-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold text-slate-900 block leading-tight">{edu.degree}</span>
                    {edu.institution && <span className="text-slate-600 block text-[11px] mt-0.5">{edu.institution}</span>}
                    {(edu.year || edu.grade) && (
                      <span className="text-slate-500 block text-[10.5px] mt-0.5 font-mono">
                        {[edu.year, edu.grade].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section>
              <h3 
                className="text-[11px] font-bold tracking-widest uppercase border-b pb-1 mb-2"
                style={{ color: activeAccent, borderColor: `${activeAccent}33` }}
              >
                Certifications
              </h3>
              <div className="flex flex-col gap-1 text-xs text-slate-700">
                {certifications.map((c, idx) => (
                  <div key={idx} className="text-[11px] leading-snug">
                    • {typeof c === 'string' ? c : c.name || ''}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h3 
                className="text-[11px] font-bold tracking-widest uppercase border-b pb-1 mb-2"
                style={{ color: activeAccent, borderColor: `${activeAccent}33` }}
              >
                Languages
              </h3>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {languages.map((l, idx) => (
                  <span key={idx} className="text-[11px] text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {l.name} {l.level ? `(${l.level})` : ''}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Right Main Column */}
        <main className="flex-1 p-7 sm:p-8 flex flex-col gap-4 bg-white text-left">
          <header className="border-b border-slate-200 pb-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase leading-none">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <p className="text-sm sm:text-base font-bold mt-1.5 tracking-wide" style={{ color: activeAccent }}>
                {header.title}
              </p>
            )}
          </header>

          {header.summary && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                Executive Profile
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {header.summary}
              </p>
            </section>
          )}

          {experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5">
                Professional Experience
              </h2>
              <div className="flex flex-col gap-3.5">
                {experiences.map((exp, expIdx) => (
                  <div key={exp.id || expIdx}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-[12.5px] font-bold text-slate-900">{exp.role}</span>
                        <span className="text-xs font-semibold text-slate-600">• {exp.company}</span>
                        {exp.location && <span className="text-xs text-slate-500">({exp.location})</span>}
                      </div>
                      <span className="text-[10.5px] font-mono font-medium text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                        {exp.period}
                      </span>
                    </div>

                    {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-700 leading-relaxed mt-0.5">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5">
                            <span className="shrink-0 text-slate-400 font-bold select-none">{bulletChar}</span>
                            <span className="flex-1">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                Key Projects
              </h2>
              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-900 block">{proj.title}</span>
                    {proj.tech && <span className="text-[10px] text-blue-600 font-mono block mt-0.5">{proj.tech}</span>}
                    {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.bullets[0]}</p>
                    ) : proj.description ? (
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  // ========================================================
  // 5. UNIVERSAL PARAMETRIC RENDERER (Supports remaining 70+ ATS Templates)
  // ========================================================
  const density = templateConfig.density || 'balanced';
  const headerStyle = templateConfig.headerStyle || 'accent-bar';
  const dividerStyle = templateConfig.dividerStyle || 'solid-accent';
  const bulletStyle = templateConfig.bulletStyle || 'disc';
  const skillsLayout = templateConfig.skillsLayout || 'inline-pipe';
  const bulletChar = getBulletSymbol(bulletStyle);

  // Density spacing maps
  const paddingMap = {
    'ultra-compact': 'p-6 sm:p-7',
    'compact': 'p-7 sm:p-9',
    'balanced': 'p-8 sm:p-11',
    'spacious': 'p-10 sm:p-12'
  };

  const sectionMarginMap = {
    'ultra-compact': 'mb-2.5',
    'compact': 'mb-3',
    'balanced': 'mb-3.5',
    'spacious': 'mb-4.5'
  };

  const itemSpaceMap = {
    'ultra-compact': 'space-y-2',
    'compact': 'space-y-2.5',
    'balanced': 'space-y-3.5',
    'spacious': 'space-y-4'
  };

  // Section divider builder
  const renderDivider = (title, icon) => {
    switch (dividerStyle) {
      case 'solid-accent':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2 flex items-center gap-1.5" style={{ color: activeAccent, borderColor: activeAccent }}>
            {icon}
            <span>{title}</span>
          </h2>
        );
      case 'double-rule':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider border-b-4 border-double pb-1 mb-2 text-slate-900" style={{ borderColor: activeAccent }}>
            <span>{title}</span>
          </h2>
        );
      case 'left-callout':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider pl-2.5 border-l-4 pb-0.5 mb-2 text-slate-900 flex items-center gap-1.5" style={{ borderLeftColor: activeAccent }}>
            <span>{title}</span>
          </h2>
        );
      case 'dashed':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-dashed pb-1 mb-2 text-slate-800" style={{ borderColor: activeAccent }}>
            <span>{title}</span>
          </h2>
        );
      case 'pill-header':
        return (
          <div className="mb-2">
            <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded text-white" style={{ backgroundColor: activeAccent }}>
              {title}
            </span>
          </div>
        );
      case 'none':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-1.5 text-slate-900">
            <span>{title}</span>
          </h2>
        );
      case 'subtle-gray':
      default:
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 text-slate-900 flex items-center gap-1.5">
            <span>{title}</span>
          </h2>
        );
    }
  };

  // Header Renderer
  const renderHeader = () => {
    if (headerStyle === 'centered-formal') {
      return (
        <header className="text-center border-b pb-3.5 mb-3.5" style={{ borderColor: `${activeAccent}44` }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase text-slate-950">
            {header.name || "Candidate Name"}
          </h1>
          {header.title && (
            <p className="text-xs sm:text-sm italic font-medium mt-1 text-slate-700 tracking-wider">
              {header.title}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-600">
            {contact.location && <span>{contact.location}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.email && <span>• {contact.email}</span>}
            {contact.linkedin && <span>• {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>}
            {contact.github && <span>• {contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github/')}</span>}
          </div>
        </header>
      );
    }

    if (headerStyle === 'badge-head') {
      return (
        <header className="border-b pb-3 mb-3" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  {header.name || "Candidate Name"}
                </h1>
                {header.title && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: activeAccent }}>
                    {header.title}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>• {contact.phone}</span>}
              {contact.location && <span>• {contact.location}</span>}
            </div>
          </div>
        </header>
      );
    }

    if (headerStyle === 'bordered-box') {
      return (
        <header className="p-3.5 rounded-xl border mb-3.5 bg-slate-50/70" style={{ borderColor: `${activeAccent}33` }}>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                {header.name || "Candidate Name"}
              </h1>
              {header.title && (
                <p className="text-xs font-bold mt-0.5" style={{ color: activeAccent }}>
                  {header.title}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-600">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>• {contact.phone}</span>}
              {contact.location && <span>• {contact.location}</span>}
            </div>
          </div>
        </header>
      );
    }

    if (headerStyle === 'left-accent') {
      return (
        <header className="pl-3.5 border-l-4 mb-3.5 py-0.5" style={{ borderColor: activeAccent }}>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            {header.name || "Candidate Name"}
          </h1>
          {header.title && (
            <p className="text-xs sm:text-sm font-bold tracking-wide mt-0.5" style={{ color: activeAccent }}>
              {header.title}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.location && <span>• {contact.location}</span>}
            {contact.linkedin && <span>• {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>}
          </div>
        </header>
      );
    }

    if (headerStyle === 'top-strip') {
      return (
        <header className="pt-2 border-t-4 border-b pb-3 mb-3.5" style={{ borderTopColor: activeAccent, borderBottomColor: '#e2e8f0' }}>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <span className="text-xs font-bold tracking-wide" style={{ color: activeAccent }}>
                {header.title}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.location && <span>• {contact.location}</span>}
          </div>
        </header>
      );
    }

    // Default: Accent Bar
    return (
      <header className="border-b-2 pb-3 mb-3.5" style={{ borderColor: activeAccent }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
          {header.name || "Candidate Name"}
        </h1>
        {header.title && (
          <p className="text-sm sm:text-base font-semibold mt-1 tracking-wide" style={{ color: activeAccent }}>
            {header.title}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-600 font-medium">
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{contact.email}</span>
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{contact.phone}</span>
            </span>
          )}
          {contact.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{contact.location}</span>
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>
            </span>
          )}
          {contact.github && (
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-slate-400" />
              <span>{contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/')}</span>
            </span>
          )}
        </div>
      </header>
    );
  };

  // Skills format renderer
  const renderSkills = () => {
    if (!skills.length) return null;

    if (skillsLayout === 'inline-pipe') {
      return (
        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          {skills.join('  |  ')}
        </p>
      );
    }

    if (skillsLayout === 'dots') {
      return (
        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          {skills.join('  •  ')}
        </p>
      );
    }

    if (skillsLayout === 'pills') {
      return (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${activeAccent}12`, color: activeAccent, border: `1px solid ${activeAccent}33` }}
            >
              {s}
            </span>
          ))}
        </div>
      );
    }

    // Default tags
    return (
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s, idx) => (
          <span
            key={idx}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-medium px-2.5 py-0.5 rounded"
          >
            {s}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      id={id}
      className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-col ${activeFont} ${paddingMap[density] || 'p-8 sm:p-10'} transition-all duration-200 print:shadow-none print:m-0`}
      style={a4CanvasStyle}
    >
      {/* 1. Header */}
      {renderHeader()}

      {/* 2. Professional Summary */}
      {header.summary && (
        <section className={sectionMarginMap[density] || 'mb-3.5'}>
          {renderDivider("Professional Summary")}
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {header.summary}
          </p>
        </section>
      )}

      {/* 3. Core Skills */}
      {skills.length > 0 && (
        <section className={sectionMarginMap[density] || 'mb-3.5'}>
          {renderDivider("Skills & Core Competencies")}
          {renderSkills()}
        </section>
      )}

      {/* 4. Work Experience */}
      {experiences.length > 0 && (
        <section className={sectionMarginMap[density] || 'mb-3.5'}>
          {renderDivider("Work Experience")}
          <div className={`flex flex-col ${itemSpaceMap[density] || 'gap-3.5'}`}>
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-0.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{exp.role}</span>
                    <span className="text-xs font-semibold text-slate-600">• {exp.company}</span>
                    {exp.location && <span className="text-xs text-slate-500">({exp.location})</span>}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-medium whitespace-nowrap bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    {exp.period}
                  </span>
                </div>

                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-700 leading-relaxed mt-0.5">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5">
                        <span className="shrink-0 text-slate-400 font-bold select-none">{bulletChar}</span>
                        <span className="flex-1">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Key Projects */}
      {projects.length > 0 && (
        <section className={sectionMarginMap[density] || 'mb-3.5'}>
          {renderDivider("Key Projects & Initiatives")}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold text-slate-900 block">{proj.title}</span>
                {proj.tech && <span className="text-[10px] font-mono block mt-0.5" style={{ color: activeAccent }}>{proj.tech}</span>}
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.bullets[0]}</p>
                ) : proj.description ? (
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Education & Credentials */}
      {(education.length > 0 || certifications.length > 0) && (
        <section className={sectionMarginMap[density] || 'mb-3'}>
          {renderDivider("Education & Credentials")}
          <div className="flex flex-wrap justify-between gap-4 text-xs text-slate-700">
            {education.length > 0 && (
              <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-slate-700 font-medium text-[11px]">
                    <span className="font-bold text-slate-900 block">{edu.degree}</span>
                    {edu.institution && <span className="text-slate-600 block text-[10.5px]">{edu.institution}</span>}
                    {(edu.year || edu.details || edu.grade) && (
                      <span className="text-slate-500 block text-[10px] font-mono mt-0.5">
                        {[edu.year, edu.details, edu.grade].filter(Boolean).join(" | ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {certifications.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-900 uppercase text-[10.5px] block">Certifications</span>
                <div className="flex flex-wrap gap-1">
                  {certifications.map((c, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10.5px]">
                      {typeof c === 'string' ? c : c.name || ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. Languages */}
      {languages.length > 0 && (
        <section className="mb-2">
          {renderDivider("Languages")}
          <div className="flex flex-wrap gap-2 text-xs text-slate-700">
            {languages.map((l, idx) => (
              <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10.5px]">
                {l.name} {l.level ? `(${l.level})` : ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

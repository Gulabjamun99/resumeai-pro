import React from 'react';
import { Mail, Phone, MapPin, Globe, Code, ExternalLink, Award, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { normalizeCvSchema } from '../utils/cvNormalizer.js';

/**
 * RESUMEAI PRO — LIVE A4 DOCUMENT CANVAS
 * 
 * Hubahu Layout Replication:
 * 1. Single-Column Linear: Crisp white, elegant typography, standard A4 margins.
 * 2. Two-Column Sidebar: Authentic split layout for dual-stream resumes.
 * 
 * Strict 1–2 Page Budget Enforcement with visual page break indicator.
 */
export default function ResumeCanvas({ 
  resume, 
  id = "resume-document", 
  accentColor = "#2563eb",
  fontFamily = "font-sans",
  templateLayout = "auto" // "auto" | "single-column" | "two-column-sidebar"
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

  const effectiveLayout = templateLayout === 'auto' 
    ? (cv.layoutType || 'single-column') 
    : templateLayout;

  const activeAccent = accentColor || cv.styleProfile?.accentColor || "#2563eb";

  // DUAL-COLUMN SIDEBAR LAYOUT
  if (effectiveLayout === 'two-column-sidebar') {
    return (
      <div
        id={id}
        className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-row text-left ${fontFamily} transition-all duration-200 print:shadow-none print:m-0`}
        style={{
          width: '100%',
          maxWidth: '820px',
          minHeight: '1120px',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFT SIDEBAR */}
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
              {contact.website && (
                <div className="flex items-center gap-2 break-all">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: activeAccent }} />
                  <span>{contact.website.replace(/^https?:\/\//i, '')}</span>
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

          {/* Education in Sidebar */}
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

          {/* Certifications in Sidebar */}
          {certifications.length > 0 && (
            <section>
              <h3 
                className="text-[11px] font-bold tracking-widest uppercase border-b pb-1 mb-2"
                style={{ color: activeAccent, borderColor: `${activeAccent}33` }}
              >
                Certifications
              </h3>
              <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                {certifications.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <span className="font-bold" style={{ color: activeAccent }}>•</span>
                    <span>{typeof c === 'string' ? c : c.name || ''}</span>
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

        {/* RIGHT MAIN COLUMN */}
        <main className="flex-1 p-7 sm:p-8 flex flex-col gap-5 bg-white text-left">
          {/* Header */}
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

          {/* Summary */}
          {header.summary && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                Executive Profile
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {header.summary}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                Professional Experience
              </h2>
              <div className="flex flex-col gap-4">
                {experiences.map((exp, expIdx) => (
                  <div key={exp.id || expIdx} className="flex flex-col gap-1">
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
                      <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed mt-0.5">
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

          {/* Key Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5">
                Key Projects & Initiatives
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg">
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

          {/* Custom Sections */}
          {customSections.map((sec, idx) => (
            <section key={sec.id || idx}>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                {sec.title}
              </h2>
              {Array.isArray(sec.items) ? (
                <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                  {sec.items.map((it, iIdx) => <li key={iIdx}>{it}</li>)}
                </ul>
              ) : (
                <p className="text-xs text-slate-700">{sec.content || sec.rawContent}</p>
              )}
            </section>
          ))}
        </main>
      </div>
    );
  }

  // SINGLE-COLUMN LINEAR LAYOUT (DEFAULT FOR SINGLE-COLUMN RESUMES)
  return (
    <div
      id={id}
      className={`resume-canvas bg-white text-slate-900 shadow-xl mx-auto flex flex-col ${fontFamily} transition-all duration-200 print:shadow-none print:m-0`}
      style={{
        width: '100%',
        maxWidth: '820px',
        minHeight: '1120px',
        padding: '40px 48px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header */}
      <header className="border-b-2 pb-4 mb-4" style={{ borderColor: activeAccent }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
          {header.name || "Candidate Name"}
        </h1>
        {header.title && (
          <p className="text-sm sm:text-base font-semibold mt-1 tracking-wide" style={{ color: activeAccent }}>
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
          {contact.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.location}</span>
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>
            </span>
          )}
          {contact.github && (
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/')}</span>
            </span>
          )}
          {contact.website && (
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.website.replace(/^https?:\/\//i, '')}</span>
            </span>
          )}
        </div>
      </header>

      {/* 2. Professional Summary */}
      {header.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5" style={{ color: activeAccent }}>
            <span>Professional Summary</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {header.summary}
          </p>
        </section>
      )}

      {/* 3. Core Competencies & Skills */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5" style={{ color: activeAccent }}>
            <span>Key Skills & Competencies</span>
          </h2>
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
        </section>
      )}

      {/* 4. Work Experience */}
      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5" style={{ color: activeAccent }}>
            <span>Work Experience</span>
          </h2>
          <div className="flex flex-col gap-4">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-1">
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
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed mt-0.5">
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

      {/* 5. Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5" style={{ color: activeAccent }}>
            <span>Key Projects & Technical Initiatives</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold text-slate-900 block">{proj.title}</span>
                {proj.tech && <span className="text-[10px] font-mono block mt-0.5" style={{ color: activeAccent }}>{proj.tech}</span>}
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                  <p className="text-[11px] text-slate-600 mt-1">{proj.bullets[0]}</p>
                ) : proj.description ? (
                  <p className="text-[11px] text-slate-600 mt-1">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Education & Certifications */}
      {(education.length > 0 || certifications.length > 0) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-1.5" style={{ color: activeAccent }}>
            <span>Education & Credentials</span>
          </h2>
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

      {/* 7. Languages & Custom Sections */}
      {languages.length > 0 && (
        <section className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5" style={{ color: activeAccent }}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-2 text-xs text-slate-700">
            {languages.map((l, idx) => (
              <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10.5px]">
                {l.name} {l.level ? `(${l.level})` : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {customSections.map((sec, idx) => (
        <section key={sec.id || idx} className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5" style={{ color: activeAccent }}>
            {sec.title}
          </h2>
          {Array.isArray(sec.items) ? (
            <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
              {sec.items.map((it, iIdx) => <li key={iIdx}>{it}</li>)}
            </ul>
          ) : (
            <p className="text-xs text-slate-700">{sec.content || sec.rawContent}</p>
          )}
        </section>
      ))}
    </div>
  );
}

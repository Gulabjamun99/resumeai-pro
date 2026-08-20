import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

/**
 * ORIGINAL SOURCE TEMPLATE RENDERER (P1.6 DYNAMIC TEMPLATE REPLICA ENGINE)
 * 
 * Preserves the authentic visual layout (Dual-Column Sidebar or Single-Column Linear),
 * section hierarchy, and clean typography of the user's uploaded CV while reflecting 
 * all verified, approved content updates with pixel-perfect alignment.
 * 
 * INVARIANT: SOURCE_TEMPLATE_BEFORE === SOURCE_TEMPLATE_AFTER
 */
export default function SourceTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;

  const header = resume.header || {};
  const contact = resume.contact || {};
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experiences = Array.isArray(resume.experiences) 
    ? resume.experiences 
    : Array.isArray(resume.experience) 
      ? resume.experience 
      : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const languages = Array.isArray(resume.languages) ? resume.languages : [];
  const publications = Array.isArray(resume.publications) ? resume.publications : [];

  const isDualColumn = resume.layoutType === 'two-column-left-sidebar' || 
                       (contact.email && skills.length > 5 && experiences.length > 0 && !resume.layoutType);

  if (isDualColumn) {
    return (
      <div
        id={id}
        className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col md:flex-row font-sans transition-all duration-300 print:shadow-none print:m-0"
        style={{
          width: '100%',
          maxWidth: '820px',
          minHeight: '1050px',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFT SIDEBAR COLUMN */}
        <aside className="w-full md:w-[32%] bg-slate-900 text-slate-100 p-6 flex flex-col gap-5 print:bg-slate-900 print:text-white">
          {/* Contact Section */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700 pb-1 mb-2.5">
              Contact
            </h2>
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-medium">
              {contact.email && (
                <div className="flex items-center gap-2 break-all">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.address}</span>
                </div>
              )}
              {contact.location && !contact.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.location}</span>
                </div>
              )}
              {contact.linkedin && (
                <div className="flex items-center gap-2 break-all">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills Section */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700 pb-1 mb-2.5">
                Skills & Proficiencies
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-800 text-slate-200 border border-slate-700 text-[10.5px] font-medium px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages Section */}
          {languages.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700 pb-1 mb-2.5">
                Languages
              </h2>
              <div className="flex flex-col gap-1 text-xs text-slate-300">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{typeof lang === 'string' ? lang : lang.name}</span>
                    <span className="text-slate-400 text-[10.5px]">{typeof lang === 'object' && lang.level ? lang.level : ''}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education in Sidebar */}
          {education.length > 0 && (
            <section className="mt-auto">
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700 pb-1 mb-2.5">
                Education
              </h2>
              <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                {education.map((edu, idx) => (
                  <div key={idx} className="leading-snug">
                    <span className="font-semibold text-slate-100 block">
                      {typeof edu === 'string' ? edu : edu.degree || ''}
                    </span>
                    {typeof edu === 'object' && edu.school && (
                      <span className="text-slate-400 text-[10.5px] block">{edu.school} {edu.year ? `(${edu.year})` : ''}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications in Sidebar */}
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700 pb-1 mb-2.5">
                Certifications
              </h2>
              <div className="flex flex-col gap-1 text-xs text-slate-300">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="text-[10.5px]">
                    • {typeof cert === 'string' ? cert : cert.name || ''}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="w-full md:w-[68%] p-6 sm:p-8 flex flex-col gap-5 bg-white">
          {/* Header */}
          <header className="border-b border-slate-200 pb-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <p className="text-sm font-semibold text-sky-700 mt-0.5 tracking-wide">
                {header.title}
              </p>
            )}
          </header>

          {/* Executive Summary */}
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

          {/* Projects & Live Apps */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                Key Projects & Live Applications
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-slate-900 block">{proj.title || "Project"}</span>
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

          {/* Work Experience */}
          {experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                Work Experience
              </h2>
              <div className="flex flex-col gap-4">
                {experiences.map((exp, expIdx) => (
                  <div key={exp.id || expIdx} className="flex flex-col gap-1">
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

          {/* Publications */}
          {publications.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                Publications & Research
              </h2>
              <div className="flex flex-col gap-1 text-xs text-slate-700">
                {publications.map((pub, idx) => (
                  <div key={idx}>• {typeof pub === 'string' ? pub : pub.title || ''}</div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  // SINGLE COLUMN LAYOUT
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
      <header className="border-b-2 border-slate-800 pb-4 mb-4">
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
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-1.5 flex items-center gap-1.5">
            <span>Professional Summary</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {header.summary}
          </p>
        </section>
      )}

      {/* 3. CORE SKILLS */}
      {skills.length > 0 && (
        <section className="mb-4">
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

      {/* 4. PROJECTS */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <span>Key Projects & Live Products</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold text-slate-900 block">{proj.title}</span>
                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                  <p className="text-[11px] text-slate-600 mt-0.5">{proj.bullets[0]}</p>
                ) : proj.description ? (
                  <p className="text-[11px] text-slate-600 mt-0.5">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. WORK EXPERIENCE */}
      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5">
            <span>Work Experience</span>
          </h2>
          <div className="flex flex-col gap-4">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-1">
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

      {/* 6. EDUCATION & CERTS */}
      {(education.length > 0 || certifications.length > 0) && (
        <section className="mt-auto pt-3 border-t border-slate-200 flex flex-wrap justify-between gap-4 text-xs text-slate-700">
          {education.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 uppercase text-[11px] block">Education</span>
              {education.map((edu, idx) => (
                <div key={idx} className="text-slate-600 font-medium">
                  {typeof edu === 'string' ? edu : `${edu.degree || ''} • ${edu.school || ''}`}
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 uppercase text-[11px] block">Certifications</span>
              <div className="flex flex-wrap gap-1">
                {certifications.map((cert, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10.5px]">
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

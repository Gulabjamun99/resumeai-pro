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
  const positionsHiredFor = Array.isArray(resume.positionsHiredFor) ? resume.positionsHiredFor : [];
  const itSkills = Array.isArray(resume.itSkills) ? resume.itSkills : [];

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
        <aside className="w-full md:w-[32%] bg-[#0f172a] text-slate-100 p-5 sm:p-6 flex flex-col gap-4.5 print:bg-[#0f172a] print:text-white shrink-0">
          {/* Contact Section */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2.5">
              Contact
            </h2>
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-medium">
              {contact.email && (
                <div className="flex items-center gap-2 break-all">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-slate-200 hover:text-sky-300 transition-colors">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {(contact.address || contact.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{contact.address || contact.location}</span>
                </div>
              )}
              {contact.linkedin && (
                <div className="flex items-center gap-2 break-all">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                    {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Skills & Proficiencies */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2">
                Skills & Proficiencies
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-800/90 text-slate-200 border border-slate-700/80 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm"
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
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2">
                Languages
              </h2>
              <div className="flex flex-col gap-1 text-xs text-slate-300">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-slate-200">{typeof lang === 'string' ? lang : lang.name}</span>
                    <span className="text-sky-400/90 text-[10px] font-medium bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700/60">
                      {typeof lang === 'object' && lang.level ? lang.level : 'Proficient'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education in Sidebar (Right below Languages) */}
          {education.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2">
                Education
              </h2>
              <div className="flex flex-col gap-2 text-xs text-slate-300">
                {education.map((edu, idx) => (
                  <div key={idx} className="leading-tight bg-slate-800/40 p-2 rounded border border-slate-800">
                    <span className="font-bold text-slate-100 text-[11px] block">
                      {typeof edu === 'string' ? edu : edu.degree || ''}
                    </span>
                    {typeof edu === 'object' && edu.school && (
                      <span className="text-slate-400 text-[10px] block mt-0.5">
                        {edu.school} {edu.year ? `(${edu.year})` : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications in Sidebar (Right below Education) */}
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2">
                Certifications
              </h2>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-300">
                {certifications.map((cert, idx) => (
                  <li key={idx} className="text-[10.5px] leading-snug flex items-start gap-1.5 text-slate-300">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{typeof cert === 'string' ? cert : cert.name || ''}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Positions / Domains Hired For */}
          {positionsHiredFor.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2">
                Skills / Positions Hired For
              </h2>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(positionsHiredFor) ? positionsHiredFor : [positionsHiredFor]).map((pos, idx) => (
                  <span
                    key={idx}
                    className="text-[9.5px] bg-slate-800/60 text-slate-300 border border-slate-700/50 px-1.5 py-0.5 rounded leading-tight"
                  >
                    {pos}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* IT & Tooling Skills */}
          {itSkills.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold tracking-widest text-sky-400 uppercase border-b border-slate-700/80 pb-1 mb-2">
                IT & Analytics Tools
              </h2>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                {itSkills.join(' • ')}
              </p>
            </section>
          )}
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="w-full md:w-[68%] p-6 sm:p-7 flex flex-col gap-4.5 bg-white">
          {/* Header */}
          <header className="border-b border-slate-200 pb-2.5">
            <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-950 uppercase leading-none">
              {header.name || "Candidate Name"}
            </h1>
            {header.title && (
              <p className="text-xs sm:text-[13px] font-bold text-sky-700 mt-1 tracking-wide">
                {header.title}
              </p>
            )}
          </header>

          {/* Executive Summary */}
          {header.summary && (
            <section>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-sky-600 rounded-xs inline-block"></span>
                Executive Profile
              </h2>
              <div className="border-l-2 border-sky-600 bg-sky-50/30 pl-3 py-1 text-xs text-slate-700 leading-relaxed text-justify rounded-r">
                {header.summary}
              </div>
            </section>
          )}

          {/* Projects & Live Apps (Modern Sleek Grid Design) */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-sky-600 rounded-xs inline-block"></span>
                Key Projects & Live Applications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {projects.map((proj, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 bg-white border border-slate-200/90 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-sky-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11.5px] font-bold text-slate-900 flex items-center gap-1">
                          <span className="text-sky-600 text-xs">⚡</span>
                          {proj.title || "Project"}
                        </span>
                        <span className="text-[9px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.2 rounded">
                          Live App
                        </span>
                      </div>
                      {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                        <p className="text-[10.5px] text-slate-600 leading-snug">{proj.bullets[0]}</p>
                      ) : proj.description ? (
                        <p className="text-[10.5px] text-slate-600 leading-snug">{proj.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-sky-600 rounded-xs inline-block"></span>
                Work Experience
              </h2>
              <div className="flex flex-col gap-3.5">
                {experiences.map((exp, expIdx) => (
                  <div key={exp.id || expIdx} className="flex flex-col gap-1 page-break-inside-avoid">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-[12px] font-bold text-slate-900">
                          {exp.role || "Role"}
                        </span>
                        {exp.subtitle && (
                          <span className="text-xs text-slate-500 font-normal">
                            | {exp.subtitle}
                          </span>
                        )}
                        <span className="text-xs text-sky-800 font-semibold">
                          • {exp.company || exp.location || "Company"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {exp.period || exp.dates || ""}
                      </span>
                    </div>

                    {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside pl-4 space-y-1 text-[11px] text-slate-700 leading-relaxed mt-0.5">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="pl-0.5 marker:text-sky-600">{b}</li>
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
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-sky-600 rounded-xs inline-block"></span>
                Publications & Research
              </h2>
              <div className="flex flex-col gap-1 text-xs text-slate-700">
                {publications.map((pub, idx) => (
                  <div key={idx} className="text-[11px]">• {typeof pub === 'string' ? pub : pub.title || ''}</div>
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

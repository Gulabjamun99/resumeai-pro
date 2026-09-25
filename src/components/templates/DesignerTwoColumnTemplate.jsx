import React from 'react';
import { Mail, Phone, MapPin, Globe, CheckCircle2, Briefcase, GraduationCap, Award, Code2, Sparkles, Terminal } from 'lucide-react';
import { DEFAULT_DESIGN_THEME } from '../../data/themePresets';

/**
 * DESIGNER DUAL-COLUMN ATS TEMPLATE
 * 
 * An ultra-modern, high-conversion executive two-column template
 * featuring custom sidebar styling, dynamic color theming,
 * live project cards, and an interactive timeline.
 */
export default function DesignerTwoColumnTemplate({ 
  resume, 
  id = "resume-document",
  theme = DEFAULT_DESIGN_THEME 
}) {
  if (!resume) return null;

  const currentTheme = { ...DEFAULT_DESIGN_THEME, ...theme };
  const {
    header = {},
    contact = {},
    skills = [],
    languages = [],
    positionsHiredFor = [],
    education = [],
    certifications = [],
    itSkills = [],
    projects = [],
    experiences = [],
    publications = []
  } = resume;

  // Extract initials for modern monogram badge
  const nameParts = (header.name || "Candidate Name").trim().split(/\s+/);
  const initials = nameParts.length >= 2 
    ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
    : nameParts[0]?.substring(0, 2).toUpperCase() || "CV";

  const isTwoColumn = currentTheme.layoutMode !== 'single-column';
  const isRightSidebar = currentTheme.sidebarPosition === 'right';

  // Sidebar Component (Reusable for 2-column left/right or single-column bottom)
  const SidebarContent = () => (
    <div 
      className="p-6 flex flex-col gap-5 text-left resume-sidebar"
      style={{
        backgroundColor: currentTheme.sidebarBg,
        color: currentTheme.sidebarText,
        width: isTwoColumn ? '34%' : '100%',
        minHeight: '100%',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Candidate Monogram Badge */}
      <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg tracking-wider shrink-0"
          style={{ 
            backgroundColor: currentTheme.primaryColor,
            color: '#ffffff'
          }}
        >
          {initials}
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-widest block opacity-70 font-semibold">Executive CV</span>
          <span className="text-xs font-bold block truncate max-w-[150px]">{header.title || "Professional"}</span>
        </div>
      </div>

      {/* Contact Details */}
      <div className="flex flex-col gap-2.5">
        <h3 
          className="text-[11px] font-black uppercase tracking-widest pb-1 border-b flex items-center gap-1.5"
          style={{ 
            color: currentTheme.primaryColor,
            borderColor: 'rgba(255,255,255,0.15)'
          }}
        >
          <Phone className="w-3 h-3" />
          Contact Details
        </h3>
        
        <div className="flex flex-col gap-2 text-[10.5px]">
          {contact.email && (
            <div className="flex items-start gap-2">
              <Mail className="w-3 h-3 mt-0.5 opacity-60 shrink-0" />
              <a href={`mailto:${contact.email}`} className="hover:underline break-all" style={{ color: currentTheme.sidebarText }}>
                {contact.email}
              </a>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 opacity-60 shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}

          {contact.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 opacity-60 shrink-0" />
              <span>{contact.location}</span>
            </div>
          )}

          {contact.linkedin && (
            <div className="flex items-start gap-2">
              <Globe className="w-3 h-3 mt-0.5 opacity-60 shrink-0" />
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="hover:underline break-all text-[9.5px]">
                {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Core Skills Matrix */}
      {skills.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b flex items-center gap-1.5"
            style={{ 
              color: currentTheme.primaryColor,
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            <Code2 className="w-3 h-3" />
            Core Competencies
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded shadow-sm border leading-tight"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.14)',
                  color: currentTheme.sidebarText
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b flex items-center gap-1.5"
            style={{ 
              color: currentTheme.primaryColor,
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            <Globe className="w-3 h-3" />
            Languages
          </h3>
          <div className="flex flex-col gap-1.5 text-[10.5px]">
            {languages.map((lang, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-medium">{typeof lang === 'string' ? lang : lang.name}</span>
                <span 
                  className="text-[9px] px-1.5 py-0.2 rounded border font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: currentTheme.primaryColor
                  }}
                >
                  {typeof lang === 'object' && lang.level ? lang.level : 'Proficient'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b flex items-center gap-1.5"
            style={{ 
              color: currentTheme.primaryColor,
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            <GraduationCap className="w-3 h-3" />
            Education
          </h3>
          <div className="flex flex-col gap-2 text-[10.5px]">
            {education.map((edu, idx) => (
              <div 
                key={idx}
                className="p-2 rounded border"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <span className="font-bold text-[11px] block text-white leading-tight">
                  {typeof edu === 'string' ? edu : edu.degree || ''}
                </span>
                {typeof edu === 'object' && edu.school && (
                  <span className="opacity-75 text-[10px] block mt-0.5">
                    {edu.school} {edu.year ? `(${edu.year})` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b flex items-center gap-1.5"
            style={{ 
              color: currentTheme.primaryColor,
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            <Award className="w-3 h-3" />
            Certifications
          </h3>
          <div className="flex flex-col gap-1.5 text-[10px]">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-start gap-1.5 leading-snug">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: currentTheme.primaryColor }} />
                <span>{typeof cert === 'string' ? cert : cert.name || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IT & Analytics Tools */}
      {itSkills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 
            className="text-[11px] font-black uppercase tracking-widest pb-1 border-b flex items-center gap-1.5"
            style={{ 
              color: currentTheme.primaryColor,
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            <Terminal className="w-3 h-3" />
            Tools & Platforms
          </h3>
          <p className="text-[10px] opacity-80 leading-relaxed">
            {itSkills.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );

  // Main Body Content
  const MainContent = () => (
    <div 
      className="p-7 flex flex-col gap-5 flex-1 text-left"
      style={{
        backgroundColor: currentTheme.pageBg,
        color: currentTheme.textColor,
        boxSizing: 'border-box'
      }}
    >
      {/* Header Banner */}
      <header className="border-b pb-4 flex flex-col gap-1.5" style={{ borderColor: '#e2e8f0' }}>
        <h1 
          className="text-[28px] font-black tracking-tight uppercase leading-none"
          style={{ color: currentTheme.headingColor }}
        >
          {header.name || "Candidate Name"}
        </h1>
        {header.title && (
          <p 
            className="text-[13px] font-bold tracking-wide uppercase flex items-center gap-2"
            style={{ color: currentTheme.primaryColor }}
          >
            <span>{header.title}</span>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentTheme.primaryColor }} />
          </p>
        )}
      </header>

      {/* Executive Summary Card */}
      {header.summary && (
        <section className="flex flex-col gap-1.5">
          <h2 
            className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
            style={{ color: currentTheme.headingColor }}
          >
            <span className="w-2 h-3.5 rounded-xs inline-block" style={{ backgroundColor: currentTheme.primaryColor }} />
            Professional Profile & Summary
          </h2>
          <div 
            className="p-3.5 rounded-lg border text-xs leading-relaxed text-justify shadow-xs"
            style={{
              backgroundColor: `${currentTheme.primaryColor}0c`, // 5% opacity tint
              borderColor: `${currentTheme.primaryColor}30`,
              borderLeftWidth: '4px',
              borderLeftColor: currentTheme.primaryColor,
              color: currentTheme.textColor
            }}
          >
            {header.summary}
          </div>
        </section>
      )}

      {/* Key Projects & Live Applications Grid */}
      {projects.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 
            className="text-xs font-black uppercase tracking-wider flex items-center justify-between border-b pb-1"
            style={{ 
              color: currentTheme.headingColor,
              borderColor: '#e2e8f0'
            }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-3.5 rounded-xs inline-block" style={{ backgroundColor: currentTheme.primaryColor }} />
              Key Projects & Live Applications
            </span>
            <span 
              className="text-[9.5px] px-2 py-0.5 rounded-full font-bold border"
              style={{
                backgroundColor: `${currentTheme.primaryColor}15`,
                color: currentTheme.primaryColor,
                borderColor: `${currentTheme.primaryColor}40`
              }}
            >
              {projects.length} Production Systems
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {projects.map((proj, idx) => (
              <div 
                key={idx}
                className="p-3 bg-white rounded-lg border shadow-xs flex flex-col justify-between"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11.5px] font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" style={{ color: currentTheme.primaryColor }} />
                      {proj.title || "Live Application"}
                    </span>
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        backgroundColor: `${currentTheme.primaryColor}10`,
                        color: currentTheme.primaryColor,
                        borderColor: `${currentTheme.primaryColor}30`
                      }}
                    >
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

      {/* Work Experience Timeline */}
      {experiences.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 
            className="text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b pb-1"
            style={{ 
              color: currentTheme.headingColor,
              borderColor: '#e2e8f0'
            }}
          >
            <span className="w-2 h-3.5 rounded-xs inline-block" style={{ backgroundColor: currentTheme.primaryColor }} />
            Professional Experience
          </h2>

          <div className="flex flex-col gap-4 relative pl-3 border-l-2" style={{ borderColor: `${currentTheme.primaryColor}35` }}>
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="relative flex flex-col gap-1 page-break-inside-avoid">
                {/* Timeline Node Marker */}
                <div 
                  className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white shadow-xs"
                  style={{ 
                    borderColor: currentTheme.primaryColor,
                    backgroundColor: expIdx === 0 ? currentTheme.primaryColor : '#ffffff'
                  }}
                />

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <span className="text-[12.5px] font-black block" style={{ color: currentTheme.headingColor }}>
                      {exp.role || "Role"}
                    </span>
                    <span className="text-[11.5px] font-bold" style={{ color: currentTheme.primaryColor }}>
                      {exp.company || exp.location || ""}
                    </span>
                  </div>
                  <span 
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border self-start sm:self-auto"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0',
                      color: '#475569'
                    }}
                  >
                    {exp.period || exp.dates || ""}
                  </span>
                </div>

                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-[11px] text-slate-700 leading-relaxed mt-1">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="pl-0.5 marker:text-slate-400">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Publications / Research */}
      {publications.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 
            className="text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b pb-1"
            style={{ 
              color: currentTheme.headingColor,
              borderColor: '#e2e8f0'
            }}
          >
            <span className="w-2 h-3.5 rounded-xs inline-block" style={{ backgroundColor: currentTheme.primaryColor }} />
            Publications & Research
          </h2>
          <ul className="list-disc list-outside pl-4 space-y-1 text-[11px] text-slate-700">
            {publications.map((pub, idx) => (
              <li key={idx} className="marker:text-slate-400">{pub}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );

  return (
    <div 
      id={id}
      className="shadow-2xl rounded-sm mx-auto overflow-hidden print:shadow-none print:m-0 text-left transition-all"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        display: isTwoColumn ? 'flex' : 'block',
        flexDirection: isRightSidebar ? 'row-reverse' : 'row',
        alignItems: 'stretch',
        fontFamily: currentTheme.fontFamily,
        backgroundColor: currentTheme.pageBg,
        lineHeight: '1.4'
      }}
    >
      {isTwoColumn ? (
        <>
          <SidebarContent />
          <MainContent />
        </>
      ) : (
        <>
          <MainContent />
          <div className="border-t border-slate-200">
            <SidebarContent />
          </div>
        </>
      )}
    </div>
  );
}

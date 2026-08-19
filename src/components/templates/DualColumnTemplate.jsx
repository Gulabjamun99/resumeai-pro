import React from 'react';

/**
 * TEMPLATE A: CLASSIC DUAL-COLUMN ATS TEMPLATE (Baseline Production Layout)
 * Preserves the exact verified dual-column layout with dark navy sidebar.
 */
export default function DualColumnTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;

  const { header = {}, contact = {}, skills = [], languages = [], positionsHiredFor = [], education = [], certifications = [], itSkills = [], experiences = [] } = resume;

  return (
    <div 
      id={id} 
      className="bg-white text-slate-800 font-sans shadow-2xl rounded-sm mx-auto overflow-hidden print:shadow-none print:m-0"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        padding: '0',
        display: 'flex',
        fontSize: '11px',
        lineHeight: '1.4'
      }}
    >
      {/* LEFT SIDEBAR (DARK/NAVY BLUE COMPACT COLUMN) */}
      <div 
        className="w-[32%] bg-[#1E293B] text-slate-100 p-6 flex flex-col gap-5 print:bg-[#1E293B] print:text-slate-100"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Contact Info */}
        <div className="cv-section page-break-inside-avoid">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-sky-400 border-b border-slate-700 pb-1 mb-2">
            Contact Information
          </h3>
          <div className="flex flex-col gap-2 text-[10.5px]">
            <div>
              <span className="text-slate-400 block text-[9.5px]">Email id:</span>
              <a href={`mailto:${contact.email}`} className="text-sky-300 hover:underline break-all">
                {contact.email}
              </a>
            </div>
            <div>
              <span className="text-slate-400 block text-[9.5px]">Contact number:</span>
              <span className="text-slate-200">{contact.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9.5px]">Address:</span>
              <span className="text-slate-200">{contact.address}</span>
            </div>
            {contact.linkedin && (
              <div>
                <span className="text-slate-400 block text-[9.5px]">LinkedIn:</span>
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline break-all text-[9px]">
                  {contact.linkedin}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Core Competencies / Skills */}
        <div className="cv-section cv-skill-group page-break-inside-avoid">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-sky-400 border-b border-slate-700 pb-1 mb-2">
            Skill
          </h3>
          <ul className="flex flex-col gap-1 text-[10px] pl-3 list-disc text-slate-300 leading-tight">
            {skills.map((skill, idx) => (
              <li key={idx} className="marker:text-sky-400">{skill}</li>
            ))}
          </ul>
        </div>

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="cv-section page-break-inside-avoid">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-sky-400 border-b border-slate-700 pb-1 mb-2">
              Language
            </h3>
            <div className="flex flex-col gap-1 text-[10px]">
              {languages.map((lang, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-200 font-medium">{lang.name}</span>
                  <span className="text-slate-400">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Position Hired For */}
        {positionsHiredFor && positionsHiredFor.length > 0 && (
          <div className="cv-section page-break-inside-avoid">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-sky-400 border-b border-slate-700 pb-1 mb-2">
              Skills/Position Hired For:
            </h3>
            <p className="text-[9.5px] text-slate-300 leading-normal">
              {positionsHiredFor.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div 
        className="w-[68%] p-6 flex flex-col gap-4 text-slate-900 bg-white"
        style={{ boxSizing: 'border-box' }}
      >
        {/* HEADER AREA */}
        <div className="cv-section page-break-inside-avoid border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1">
            {header.name}
          </h1>
          <h2 className="text-[12px] font-semibold text-sky-700 tracking-wide">
            {header.title}
          </h2>
          <p className="text-[10px] text-slate-600 mt-2 leading-relaxed text-justify">
            {header.summary}
          </p>
        </div>

        {/* WORK EXPERIENCE */}
        <div className="cv-section">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5 page-break-inside-avoid">
            <span className="w-1.5 h-3.5 bg-sky-600 rounded-sm inline-block"></span>
            Work Experience
          </h3>

          <div className="flex flex-col gap-4">
            {experiences.map((exp) => (
              <div key={exp.id || exp.role} className="cv-experience-item page-break-inside-avoid flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11.5px] font-bold text-slate-900">
                    {exp.role} {exp.subtitle && <span className="font-normal text-slate-600">| {exp.subtitle}</span>}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>{exp.company || exp.location}</span>
                  {exp.company && exp.location && <span>{exp.location}</span>}
                </div>

                <ul className="list-disc pl-4 text-[10px] text-slate-700 flex flex-col gap-1 mt-1 leading-snug">
                  {(exp.bullets || []).map((bullet, idx) => (
                    <li key={idx} className="marker:text-sky-600 text-justify">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* EDUCATION */}
        {education && education.length > 0 && (
          <div className="cv-section cv-education-item page-break-inside-avoid">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sky-600 rounded-sm inline-block"></span>
              Education
            </h3>
            <ul className="list-square pl-4 text-[10px] text-slate-700 flex flex-col gap-0.5">
              {education.map((edu, idx) => (
                <li key={idx}>▪ {edu}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CERTIFICATIONS */}
        {certifications && certifications.length > 0 && (
          <div className="cv-section cv-certification-item page-break-inside-avoid">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sky-600 rounded-sm inline-block"></span>
              Certifications
            </h3>
            <ul className="list-square pl-4 text-[10px] text-slate-700 flex flex-col gap-0.5">
              {certifications.map((cert, idx) => (
                <li key={idx}>▪ {cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* IT SKILLS */}
        {itSkills && itSkills.length > 0 && (
          <div className="cv-section page-break-inside-avoid">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sky-600 rounded-sm inline-block"></span>
              IT Skills
            </h3>
            <p className="text-[10px] text-slate-700 leading-normal">
              {itSkills.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

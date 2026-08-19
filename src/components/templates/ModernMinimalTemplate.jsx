import React from 'react';

/**
 * TEMPLATE C: MODERN MINIMAL ATS TEMPLATE
 * Sleek, contemporary single-column layout with refined typography,
 * subtle left-accent bars, and clean modern spacing.
 */
export default function ModernMinimalTemplate({ resume, id = "resume-document" }) {
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
        padding: '16mm 18mm',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        fontSize: '11px',
        lineHeight: '1.45',
        backgroundColor: '#ffffff'
      }}
    >
      {/* 1. MODERN HEADER */}
      <div className="cv-section page-break-inside-avoid pb-3 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1">
              {header.name}
            </h1>
            <h2 className="text-xs font-semibold text-teal-700 tracking-wide">
              {header.title}
            </h2>
          </div>

          {/* Contact Details (Modern Right-Aligned or Stacked) */}
          <div className="flex flex-wrap md:flex-col md:items-end gap-x-3 gap-y-0.5 text-[10px] text-slate-600 font-medium">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="text-slate-700 hover:text-teal-700">
                {contact.email}
              </a>
            )}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.address && <span>{contact.address}</span>}
            {contact.linkedin && (
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                {contact.linkedin}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. PROFESSIONAL SUMMARY */}
      {header.summary && (
        <div className="cv-section page-break-inside-avoid">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900">
              Profile Summary
            </h3>
          </div>
          <p className="text-[10px] text-slate-600 leading-relaxed text-justify pl-3.5">
            {header.summary}
          </p>
        </div>
      )}

      {/* 3. CORE SKILLS & EXPERTISE */}
      {(skills.length > 0 || (itSkills && itSkills.length > 0)) && (
        <div className="cv-section cv-skill-group page-break-inside-avoid">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900">
              Skills & Expertise
            </h3>
          </div>
          <div className="pl-3.5 flex flex-col gap-1 text-[10px] text-slate-700">
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[9.5px] font-medium border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {itSkills && itSkills.length > 0 && (
              <div className="mt-1">
                <span className="font-semibold text-slate-900">Tools & Technologies: </span>
                <span>{itSkills.join(', ')}</span>
              </div>
            )}
            {positionsHiredFor && positionsHiredFor.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900">Specialized For: </span>
                <span>{positionsHiredFor.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. WORK EXPERIENCE */}
      {experiences.length > 0 && (
        <div className="cv-section">
          <div className="flex items-center gap-2 mb-2 page-break-inside-avoid">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900">
              Work Experience
            </h3>
          </div>

          <div className="pl-3.5 flex flex-col gap-3.5">
            {experiences.map((exp) => (
              <div key={exp.id || exp.role} className="cv-experience-item page-break-inside-avoid flex flex-col gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-bold text-slate-900">
                    {exp.role} {exp.subtitle && <span className="font-normal text-slate-600">| {exp.subtitle}</span>}
                  </span>
                  <span className="text-[10px] font-semibold text-teal-700 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>{exp.company || exp.location}</span>
                  {exp.company && exp.location && <span>{exp.location}</span>}
                </div>

                <ul className="list-disc pl-4 text-[10px] text-slate-700 flex flex-col gap-1 mt-1 leading-snug">
                  {(exp.bullets || []).map((bullet, idx) => (
                    <li key={idx} className="marker:text-teal-600 text-justify">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EDUCATION & CERTIFICATIONS */}
      {((education && education.length > 0) || (certifications && certifications.length > 0)) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {education && education.length > 0 && (
            <div className="cv-section cv-education-item page-break-inside-avoid">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
                <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900">
                  Education
                </h3>
              </div>
              <ul className="pl-3.5 list-disc text-[10px] text-slate-700 flex flex-col gap-0.5">
                {education.map((edu, idx) => (
                  <li key={idx} className="marker:text-teal-600">{edu}</li>
                ))}
              </ul>
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div className="cv-section cv-certification-item page-break-inside-avoid">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
                <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900">
                  Certifications
                </h3>
              </div>
              <ul className="pl-3.5 list-disc text-[10px] text-slate-700 flex flex-col gap-0.5">
                {certifications.map((cert, idx) => (
                  <li key={idx} className="marker:text-teal-600">{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. LANGUAGES */}
      {languages && languages.length > 0 && (
        <div className="cv-section page-break-inside-avoid pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900">
              Languages
            </h3>
          </div>
          <div className="pl-3.5 flex flex-wrap gap-x-4 text-[10px] text-slate-700">
            {languages.map((lang, idx) => (
              <span key={idx}>
                <strong className="text-slate-900">{lang.name}:</strong> {lang.level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

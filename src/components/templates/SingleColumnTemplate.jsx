import React from 'react';

/**
 * TEMPLATE B: EXECUTIVE SINGLE-COLUMN LINEAR ATS TEMPLATE
 * Conservative, top-down chronological structure preferred by enterprise,
 * finance, government, healthcare, and traditional corporate ATS systems.
 */
export default function SingleColumnTemplate({ resume, id = "resume-document" }) {
  if (!resume) return null;

  const { header = {}, contact = {}, skills = [], languages = [], positionsHiredFor = [], education = [], certifications = [], itSkills = [], experiences = [] } = resume;

  return (
    <div 
      id={id} 
      className="bg-white text-slate-900 font-sans shadow-2xl rounded-sm mx-auto overflow-hidden print:shadow-none print:m-0"
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
      {/* 1. TOP HEADER & CONTACT BAR */}
      <div className="cv-section page-break-inside-avoid text-center border-b-2 border-slate-900 pb-3">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-950 mb-0.5">
          {header.name}
        </h1>
        <h2 className="text-[12.5px] font-semibold text-sky-800 tracking-wide uppercase mb-2">
          {header.title}
        </h2>

        {/* Contact Strip */}
        <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-700 font-medium">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-slate-800 hover:underline">
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <>
              <span className="text-slate-400">•</span>
              <span>{contact.phone}</span>
            </>
          )}
          {contact.address && (
            <>
              <span className="text-slate-400">•</span>
              <span>{contact.address}</span>
            </>
          )}
          {contact.linkedin && (
            <>
              <span className="text-slate-400">•</span>
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
                {contact.linkedin}
              </a>
            </>
          )}
        </div>
      </div>

      {/* 2. PROFESSIONAL SUMMARY */}
      {header.summary && (
        <div className="cv-section page-break-inside-avoid">
          <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
            Professional Summary
          </h3>
          <p className="text-[10px] text-slate-700 leading-relaxed text-justify">
            {header.summary}
          </p>
        </div>
      )}

      {/* 3. CORE SKILLS & COMPETENCIES */}
      {(skills.length > 0 || (itSkills && itSkills.length > 0)) && (
        <div className="cv-section cv-skill-group page-break-inside-avoid">
          <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
            Core Competencies & Technical Skills
          </h3>
          <div className="flex flex-col gap-1 text-[10px] text-slate-800">
            {skills.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Key Skills: </span>
                <span>{skills.join(' • ')}</span>
              </div>
            )}
            {itSkills && itSkills.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">IT & Tools: </span>
                <span>{itSkills.join(', ')}</span>
              </div>
            )}
            {positionsHiredFor && positionsHiredFor.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Domains: </span>
                <span>{positionsHiredFor.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. WORK EXPERIENCE */}
      {experiences.length > 0 && (
        <div className="cv-section">
          <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2 flex items-center gap-1.5 page-break-inside-avoid">
            Professional Experience
          </h3>

          <div className="flex flex-col gap-3.5">
            {experiences.map((exp) => (
              <div key={exp.id || exp.role} className="cv-experience-item page-break-inside-avoid flex flex-col gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-bold text-slate-950">
                    {exp.role} {exp.subtitle && <span className="font-normal text-slate-700">| {exp.subtitle}</span>}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-700 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-600 font-medium italic">
                  <span>{exp.company || exp.location}</span>
                  {exp.company && exp.location && <span>{exp.location}</span>}
                </div>

                <ul className="list-disc pl-4 text-[10px] text-slate-800 flex flex-col gap-1 mt-1 leading-snug">
                  {(exp.bullets || []).map((bullet, idx) => (
                    <li key={idx} className="text-justify">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EDUCATION & CERTIFICATIONS (2-COLUMN BOTTOM GRID) */}
      {((education && education.length > 0) || (certifications && certifications.length > 0)) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Education */}
          {education && education.length > 0 && (
            <div className="cv-section cv-education-item page-break-inside-avoid">
              <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                Education
              </h3>
              <ul className="list-disc pl-4 text-[10px] text-slate-800 flex flex-col gap-0.5">
                {education.map((edu, idx) => (
                  <li key={idx}>{edu}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div className="cv-section cv-certification-item page-break-inside-avoid">
              <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                Certifications
              </h3>
              <ul className="list-disc pl-4 text-[10px] text-slate-800 flex flex-col gap-0.5">
                {certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. LANGUAGES */}
      {languages && languages.length > 0 && (
        <div className="cv-section page-break-inside-avoid pt-1">
          <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1">
            Languages
          </h3>
          <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-800">
            {languages.map((lang, idx) => (
              <span key={idx}>
                <strong className="text-slate-950">{lang.name}:</strong> {lang.level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

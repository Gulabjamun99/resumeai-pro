import React from 'react';
import { Mail, Phone, MapPin, Globe, BookOpen, GraduationCap, Shield } from 'lucide-react';

export default function AcademicMedicalTemplate({ resume, id = "resume-document" }) {
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
  const publications = Array.isArray(resume.publications) ? resume.publications : [];

  return (
    <div
      id={id}
      className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col font-serif transition-all duration-300 print:shadow-none print:m-0"
      style={{
        width: '100%',
        maxWidth: '820px',
        minHeight: '1050px',
        padding: '40px 48px',
        boxSizing: 'border-box'
      }}
    >
      {/* Formal Centered Academic/Clinical Header */}
      <header className="text-center border-b-2 border-slate-800 pb-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase font-serif">
          {header.name || "Candidate Name"}
        </h1>
        {header.title && (
          <p className="text-sm font-semibold text-slate-700 italic mt-0.5 font-serif">
            {header.title}
          </p>
        )}

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600 font-sans">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>• {contact.phone}</span>}
          {contact.address && <span>• {contact.address}</span>}
          {contact.linkedin && <span>• {contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/')}</span>}
        </div>
      </header>

      {/* Summary */}
      {header.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-1.5 font-sans">
            Executive / Clinical Profile
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">
            {header.summary}
          </p>
        </section>
      )}

      {/* Education & Academic Appointments */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-sans">
            Education & Academic Appointments
          </h2>
          <div className="flex flex-col gap-1.5 text-xs text-slate-800">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between font-serif">
                <span className="font-semibold">{typeof edu === 'string' ? edu : edu.degree || ''}</span>
                <span className="text-slate-600 italic font-sans">{typeof edu === 'object' ? edu.school : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience / Clinical Practice */}
      {experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-sans">
            Professional & Clinical Experience
          </h2>
          <div className="flex flex-col gap-3.5">
            {experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-950 font-serif">{exp.role} • <span className="font-normal italic">{exp.company}</span></span>
                  <span className="text-[11px] font-sans text-slate-600">{exp.period || exp.dates}</span>
                </div>
                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-800 leading-relaxed font-sans">
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

      {/* Publications / Research */}
      {publications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-sans">
            Publications & Research Works
          </h2>
          <div className="flex flex-col gap-1 text-xs text-slate-800 font-serif italic pl-2">
            {publications.map((pub, idx) => (
              <div key={idx}>• {typeof pub === 'string' ? pub : pub.title || ''}</div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Board Licensures */}
      {certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-300 pb-1 mb-1.5 font-sans">
            Board Certifications & Licensure
          </h2>
          <div className="flex flex-wrap gap-2 text-xs text-slate-800 font-sans">
            {certifications.map((cert, idx) => (
              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {typeof cert === 'string' ? cert : cert.name || ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mt-auto pt-2 border-t border-slate-200">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-1 font-sans">
            Domain Competencies & Methodologies
          </h2>
          <p className="text-xs text-slate-700 font-sans">
            {skills.join(' • ')}
          </p>
        </section>
      )}
    </div>
  );
}

/**
 * RESUMEAI PRO — UNIVERSAL EDUCATION FORMATTER
 * 
 * Safely parses and normalizes any education item (string or object)
 * ensuring full institution, location, passing year, and academic details
 * are cleanly rendered across all templates and document exporters.
 */

export function formatEducationItem(edu) {
  if (!edu) {
    return {
      degree: '',
      institution: '',
      location: '',
      year: '',
      details: '',
      subLine: '',
      formattedLine: ''
    };
  }

  if (typeof edu === 'string') {
    return {
      degree: edu,
      institution: '',
      location: '',
      year: '',
      details: '',
      subLine: '',
      formattedLine: edu
    };
  }

  const degree = (edu.degree || edu.title || edu.name || 'Degree').trim();
  const institution = (edu.institution || edu.school || edu.university || edu.college || '').trim();
  const location = (edu.location || edu.city || '').trim();
  const year = (edu.year || edu.duration || edu.period || '').trim();
  const details = (edu.details || edu.description || edu.grade || edu.score || edu.specialization || '').trim();

  const instAndLoc = [institution, location].filter(Boolean).join(', ');
  let subLine = instAndLoc;
  if (year) {
    subLine = instAndLoc ? `${instAndLoc} (${year})` : year;
  }

  const parts = [degree];
  if (subLine) parts.push(subLine);
  if (details) parts.push(details);
  const formattedLine = parts.join(' — ');

  return {
    degree,
    institution,
    location,
    year,
    details,
    subLine,
    formattedLine
  };
}

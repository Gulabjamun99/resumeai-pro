import { evaluateEvidenceConfidence } from './confidenceEngine.js';
import { matchesTermInText } from './keywordMatcher.js';

/**
 * TRACES STRUCTURED EVIDENCE LINEAGE DOWN TO EXACT SECTION, COMPANY, ROLE & BULLET
 * 
 * Returns rich lineage object:
 * {
 *   keyword: "Python",
 *   canonicalKeyword: "python",
 *   status: "EVIDENCED",
 *   confidence: "EXACT",
 *   source: {
 *     type: "experience",
 *     section: "Work Experience",
 *     company: "Global Tech Solutions",
 *     role: "Lead Talent Acquisition Partner",
 *     bulletIndex: 2
 *   },
 *   snippet: "Built data pipelines in Python...",
 *   lineageBreadcrumb: "Work Experience → Global Tech Solutions → Lead Talent Acquisition Partner → Bullet #3",
 *   matchType: "exact",
 *   scoreContribution: 2.5
 * }
 */
export function traceEvidenceLineage(targetTerm, resume) {
  const confidenceRes = evaluateEvidenceConfidence(targetTerm, resume);
  const termToSearch = confidenceRes.matchedTerm || targetTerm;
  const normTerm = termToSearch.toLowerCase().trim();

  // If no evidence found
  if (confidenceRes.confidence === 'NONE') {
    return {
      keyword: targetTerm,
      canonicalKeyword: confidenceRes.canonicalTerm,
      status: 'NOT_EVIDENCED',
      confidence: 'NONE',
      source: {
        type: 'none',
        section: 'None',
        company: null,
        role: null,
        bulletIndex: null
      },
      snippet: 'No supporting CV evidence found in candidate record.',
      lineageBreadcrumb: 'No supporting CV evidence',
      matchType: 'unsupported',
      scoreContribution: 0.0
    };
  }

  // 1. Search in Experience Bullets (Highest Provenance Value)
  if (resume.experiences && Array.isArray(resume.experiences)) {
    for (let expIdx = 0; expIdx < resume.experiences.length; expIdx++) {
      const exp = resume.experiences[expIdx];
      const bullets = exp.bullets || [];
      for (let bIdx = 0; bIdx < bullets.length; bIdx++) {
        const bullet = bullets[bIdx];
        if (matchesTermInText(normTerm, bullet)) {
          const comp = exp.company || exp.location || 'Company';
          const role = exp.role || 'Role';
          return {
            keyword: targetTerm,
            canonicalKeyword: confidenceRes.canonicalTerm,
            status: confidenceRes.status,
            confidence: confidenceRes.confidence,
            source: {
              type: 'experience',
              section: 'Work Experience',
              company: comp,
              role: role,
              bulletIndex: bIdx,
              expIndex: expIdx
            },
            snippet: bullet,
            lineageBreadcrumb: `Work Experience → ${comp} → ${role} → Bullet #${bIdx + 1}`,
            matchType: confidenceRes.matchType,
            scoreContribution: confidenceRes.confidence === 'EXACT' ? 2.5 : confidenceRes.confidence === 'STRONG' ? 2.0 : 1.0
          };
        }
      }
    }
  }

  // 2. Search in Skills Section
  const cvSkills = Array.isArray(resume.skills) ? resume.skills : [];
  const matchingSkill = cvSkills.find(s => matchesTermInText(normTerm, s));
  if (matchingSkill) {
    return {
      keyword: targetTerm,
      canonicalKeyword: confidenceRes.canonicalTerm,
      status: confidenceRes.status,
      confidence: confidenceRes.confidence,
      source: {
        type: 'skills',
        section: 'Skills & Competencies',
        company: null,
        role: null,
        bulletIndex: null
      },
      snippet: `Explicitly listed in Skills inventory: "${matchingSkill}"`,
      lineageBreadcrumb: `Skills & Competencies → Verified Skill Entry`,
      matchType: confidenceRes.matchType,
      scoreContribution: confidenceRes.confidence === 'EXACT' ? 2.0 : confidenceRes.confidence === 'STRONG' ? 1.8 : 0.8
    };
  }

  // 3. Search in Header Profile Summary / Title
  const cvSummary = resume.header?.summary || "";
  const cvTitle = resume.header?.title || "";
  if (matchesTermInText(normTerm, cvSummary) || matchesTermInText(normTerm, cvTitle)) {
    return {
      keyword: targetTerm,
      canonicalKeyword: confidenceRes.canonicalTerm,
      status: confidenceRes.status,
      confidence: confidenceRes.confidence,
      source: {
        type: 'header',
        section: 'Profile Summary / Title',
        company: null,
        role: null,
        bulletIndex: null
      },
      snippet: cvSummary ? `Referenced in Summary: "${cvSummary.substring(0, 100)}..."` : `Referenced in Title: "${cvTitle}"`,
      lineageBreadcrumb: `Profile Summary → Executive Header`,
      matchType: confidenceRes.matchType,
      scoreContribution: confidenceRes.confidence === 'EXACT' ? 2.0 : confidenceRes.confidence === 'STRONG' ? 1.5 : 0.7
    };
  }

  // 4. Search in Education / Certifications
  const cvCerts = resume.certifications || [];
  const matchingCert = cvCerts.find(c => matchesTermInText(normTerm, typeof c === 'string' ? c : c.name || ''));
  if (matchingCert) {
    return {
      keyword: targetTerm,
      canonicalKeyword: confidenceRes.canonicalTerm,
      status: confidenceRes.status,
      confidence: confidenceRes.confidence,
      source: {
        type: 'certifications',
        section: 'Certifications',
        company: null,
        role: null,
        bulletIndex: null
      },
      snippet: `Certified in: "${typeof matchingCert === 'string' ? matchingCert : matchingCert.name}"`,
      lineageBreadcrumb: `Certifications & Qualifications → Verified Entry`,
      matchType: confidenceRes.matchType,
      scoreContribution: 1.5
    };
  }

  return {
    keyword: targetTerm,
    canonicalKeyword: confidenceRes.canonicalTerm,
    status: confidenceRes.status,
    confidence: confidenceRes.confidence,
    source: { type: 'general', section: 'Document Body', company: null, role: null, bulletIndex: null },
    snippet: `Related context found in document body for "${termToSearch}"`,
    lineageBreadcrumb: `Document Body → Context Match`,
    matchType: confidenceRes.matchType,
    scoreContribution: 1.0
  };
}

/**
 * RESUMEAI PRO — PRODUCTION ATS OPENXML DOCX EXPORTER
 * 
 * Generates an executive, ATS-optimized Microsoft Word (.docx) file
 * that exactly preserves all candidate data with zero [object Object] artifacts,
 * proper dates, education degrees, key projects, and categorized skills.
 */

import { sanitizeCandidateFilename } from './pdfExporter';
import { formatEducationItem } from './educationFormatter';

export async function exportResumeToDocx(resume, version = 1, templateId = 'designer-dual') {
  if (!resume) {
    throw new Error("No active CV data provided for DOCX export.");
  }

  const filename = sanitizeCandidateFilename(resume.header?.name, version, 'docx');

  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

    const header = resume.header || {};
    const contact = resume.contact || {};
    const skills = resume.skills || [];
    const experiences = Array.isArray(resume.experiences) 
      ? resume.experiences 
      : (Array.isArray(resume.experience) ? resume.experience : []);
    const education = Array.isArray(resume.education) ? resume.education : [];
    const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    const itSkills = Array.isArray(resume.itSkills) ? resume.itSkills : [];
    const languages = Array.isArray(resume.languages) ? resume.languages : [];

    const accentColor = '0284C7'; // Professional Executive Blue

    const docChildren = [
      // 1. Candidate Name
      new Paragraph({
        children: [
          new TextRun({
            text: header.name || "Candidate Name",
            bold: true,
            size: 32,
            color: "0F172A"
          })
        ],
        spacing: { after: 80 }
      }),

      // 2. Headline / Target Title
      new Paragraph({
        children: [
          new TextRun({
            text: header.title || header.headline || "Professional Profile",
            bold: true,
            color: accentColor,
            size: 22
          })
        ],
        spacing: { after: 140 }
      }),

      // 3. Contact Details Line
      new Paragraph({
        children: [
          new TextRun({ 
            text: [
              contact.email ? `Email: ${contact.email}` : '',
              contact.phone ? `Phone: ${contact.phone}` : '',
              (contact.location || contact.address) ? `Location: ${contact.location || contact.address}` : '',
              contact.linkedin ? `LinkedIn: ${contact.linkedin}` : ''
            ].filter(Boolean).join("  |  "),
            size: 18,
            color: "475569"
          })
        ],
        spacing: { after: 240 }
      })
    ];

    // 4. Professional Summary
    const summaryText = header.summary || resume.summary;
    if (summaryText) {
      docChildren.push(
        new Paragraph({
          text: "EXECUTIVE SUMMARY",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: summaryText,
              size: 20,
              color: "1E293B"
            })
          ],
          spacing: { after: 220 }
        })
      );
    }

    // 5. Work Experience
    if (experiences.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "WORK EXPERIENCE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      experiences.forEach(exp => {
        const durationText = exp.duration || exp.period || '';
        const companyText = exp.company || '';
        const locationText = exp.location || '';
        const subtitleParts = [companyText, locationText, durationText].filter(Boolean);

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: exp.role || "Job Title", 
                bold: true, 
                size: 21,
                color: "0F172A"
              }),
              subtitleParts.length > 0 
                ? new TextRun({ 
                    text: `  —  ${subtitleParts.join(" | ")}`, 
                    color: "475569", 
                    size: 19 
                  }) 
                : new TextRun("")
            ],
            spacing: { before: 140, after: 50 }
          })
        );

        const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
        bullets.forEach(bullet => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: "•  ", bold: true, color: accentColor }),
                new TextRun({ text: bullet, size: 19, color: "1E293B" })
              ],
              spacing: { after: 40 }
            })
          );
        });
      });
    }

    // 6. Education
    if (education.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "EDUCATION",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 100 }
        })
      );

      education.forEach(edu => {
        const item = formatEducationItem(edu);
        const line = [item.degree, item.subLine].filter(Boolean).join("  —  ");

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: "▪  ", bold: true, color: accentColor }),
              new TextRun({ text: line || item.formattedLine, bold: true, size: 20, color: "0F172A" })
            ],
            spacing: { before: 60, after: 30 }
          })
        );

        if (item.details) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `   ${item.details}`, italic: true, size: 18, color: "475569" })
              ],
              spacing: { after: 60 }
            })
          );
        }
      });
    }

    // 7. Key Projects & Production Apps
    if (projects.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "KEY PROJECTS & PRODUCTION APPLICATIONS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 100 }
        })
      );

      projects.forEach(proj => {
        const titleStr = proj.name || proj.title || "Project";
        const techStr = proj.tech || proj.technologies || "";

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: titleStr, bold: true, size: 20, color: "0F172A" }),
              techStr ? new TextRun({ text: `  [Stack: ${techStr}]`, italic: true, color: accentColor, size: 18 }) : new TextRun("")
            ],
            spacing: { before: 100, after: 40 }
          })
        );

        const pBullets = Array.isArray(proj.bullets) ? proj.bullets : (proj.description ? [proj.description] : []);
        pBullets.forEach(b => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: "•  ", bold: true, color: accentColor }),
                new TextRun({ text: b, size: 19, color: "1E293B" })
              ],
              spacing: { after: 35 }
            })
          );
        });
      });
    }

    // 8. Skills & Competencies
    docChildren.push(
      new Paragraph({
        text: "CORE SKILLS & TECHNOLOGIES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 220, after: 80 }
      })
    );

    if (Array.isArray(skills)) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: skills.join("  •  "), size: 19, color: "1E293B" })
          ],
          spacing: { after: 120 }
        })
      );
    } else if (typeof skills === 'object' && skills !== null) {
      Object.entries(skills).forEach(([cat, list]) => {
        const items = Array.isArray(list) ? list.join("  •  ") : String(list);
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${cat}: `, bold: true, size: 19, color: "0F172A" }),
              new TextRun({ text: items, size: 19, color: "334155" })
            ],
            spacing: { after: 60 }
          })
        );
      });
    }

    if (itSkills.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Tools & Platforms: ", bold: true, size: 19, color: "0F172A" }),
            new TextRun({ text: itSkills.join("  •  "), size: 19, color: "334155" })
          ],
          spacing: { after: 120 }
        })
      );
    }

    // 9. Certifications
    if (certifications.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "CERTIFICATIONS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 }
        })
      );

      certifications.forEach(cert => {
        const certName = typeof cert === 'string' ? cert : (cert.name || cert.title || '');
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: "▪  ", bold: true, color: accentColor }),
              new TextRun({ text: certName, size: 19, color: "1E293B" })
            ],
            spacing: { after: 40 }
          })
        );
      });
    }

    // 10. Languages
    if (languages.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "LANGUAGES",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 60 }
        }),
        new Paragraph({
          children: [
            new TextRun({ 
              text: languages.map(l => typeof l === 'string' ? l : `${l.name || ''} (${l.level || 'Proficient'})`).join("  |  "),
              size: 19, 
              color: "1E293B" 
            })
          ],
          spacing: { after: 100 }
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 720, right: 720 }
            }
          },
          children: docChildren
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => URL.revokeObjectURL(downloadAnchor.href), 1000);

    return { success: true, filename };
  } catch (err) {
    console.error("DOCX Export failed:", err);
    throw new Error(err.message || "Failed to generate DOCX. Your active CV state has been preserved.");
  }
}

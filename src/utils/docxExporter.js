/**
 * RESUMEAI PRO — PRODUCTION WORD (.DOCX) EXPORTER
 */

import { sanitizeCandidateFilename } from './pdfExporter.js';

export async function exportResumeToDocx(resume) {
  if (!resume) throw new Error("No resume data provided for DOCX export.");

  const filename = sanitizeCandidateFilename(resume.header?.name, 'docx');

  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

    const header = resume.header || {};
    const contact = resume.contact || {};
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const experiences = Array.isArray(resume.experiences) ? resume.experiences : [];
    const education = Array.isArray(resume.education) ? resume.education : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];

    const docChildren = [
      // Name
      new Paragraph({
        children: [
          new TextRun({
            text: header.name || "Candidate Name",
            bold: true,
            size: 32,
            color: "0F172A"
          })
        ],
        spacing: { after: 60 }
      }),

      // Headline
      new Paragraph({
        children: [
          new TextRun({
            text: header.title || "Professional Specialist",
            bold: true,
            size: 22,
            color: "2563EB"
          })
        ],
        spacing: { after: 120 }
      }),

      // Contact
      new Paragraph({
        children: [
          new TextRun({
            text: [
              contact.email ? `Email: ${contact.email}` : '',
              contact.phone ? `Phone: ${contact.phone}` : '',
              contact.location ? `Location: ${contact.location}` : '',
              contact.linkedin ? `LinkedIn: ${contact.linkedin}` : ''
            ].filter(Boolean).join("  |  "),
            size: 18,
            color: "475569"
          })
        ],
        spacing: { after: 180 }
      })
    ];

    // Summary
    if (header.summary) {
      docChildren.push(
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 }
        }),
        new Paragraph({
          children: [new TextRun({ text: header.summary, size: 20, color: "1E293B" })],
          spacing: { after: 180 }
        })
      );
    }

    // Skills
    if (skills.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "CORE SKILLS & EXPERTISE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 }
        }),
        new Paragraph({
          children: [new TextRun({ text: skills.join("  •  "), size: 20, color: "1E293B" })],
          spacing: { after: 180 }
        })
      );
    }

    // Experiences
    if (experiences.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "WORK EXPERIENCE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      experiences.forEach(exp => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.role || "Role", bold: true, size: 21, color: "0F172A" }),
              new TextRun({ text: ` — ${[exp.company, exp.location, exp.period].filter(Boolean).join(" | ")}`, color: "475569", size: 19 })
            ],
            spacing: { before: 120, after: 60 }
          })
        );

        if (Array.isArray(exp.bullets)) {
          exp.bullets.forEach(b => {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: b, size: 19, color: "334155" })],
                bullet: { level: 0 },
                spacing: { before: 30, after: 30 }
              })
            );
          });
        }
      });
    }

    // Education
    if (education.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "EDUCATION",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      education.forEach(edu => {
        const titleLine = [edu.degree, edu.institution].filter(Boolean).join(" — ");
        const subLine = [edu.year, edu.details, edu.grade].filter(Boolean).join(" | ");

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: titleLine, bold: true, size: 20, color: "0F172A" }),
              subLine ? new TextRun({ text: `\n${subLine}`, size: 18, color: "64748B" }) : new TextRun("")
            ],
            spacing: { before: 80, after: 80 }
          })
        );
      });
    }

    // Projects
    if (projects.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "KEY PROJECTS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );

      projects.forEach(p => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: p.title || "Project", bold: true, size: 20, color: "0F172A" }),
              p.tech ? new TextRun({ text: ` (${p.tech})`, color: "2563EB", size: 18 }) : new TextRun("")
            ],
            spacing: { before: 100, after: 40 }
          })
        );

        if (p.description) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: p.description, size: 19, color: "334155" })],
              spacing: { after: 60 }
            })
          );
        }

        if (Array.isArray(p.bullets)) {
          p.bullets.forEach(b => {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: b, size: 19, color: "334155" })],
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 }
              })
            );
          });
        }
      });
    }

    const doc = new Document({
      sections: [{ children: docChildren }]
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    return { success: true, filename };
  } catch (err) {
    console.error("DOCX Export error:", err);
    throw new Error(err.message || "Failed to generate DOCX document.");
  }
}

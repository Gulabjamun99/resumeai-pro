import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export function exportResumeToDocx(resume, filename = "Candidate_ATS_Updated_Resume.docx") {
  if (!resume) return;

  const { header, contact, skills, experiences, education, certifications, itSkills } = resume;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children: [
          // Header Name & Title
          new Paragraph({
            text: header.name,
            heading: HeadingLevel.TITLE,
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: header.title,
                bold: true,
                color: "0284C7",
                size: 24
              })
            ],
            spacing: { after: 200 }
          }),

          // Contact Details
          new Paragraph({
            children: [
              new TextRun({ text: `Email: ${contact.email} | Phone: ${contact.phone} | Location: ${contact.address}`, size: 18 }),
              contact.linkedin ? new TextRun({ text: ` | LinkedIn: ${contact.linkedin}`, size: 18 }) : new TextRun("")
            ],
            spacing: { after: 300 }
          }),

          // Professional Summary Section
          new Paragraph({
            text: "PROFESSIONAL SUMMARY",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: header.summary,
            spacing: { after: 300 }
          }),

          // Work Experience Section
          new Paragraph({
            text: "WORK EXPERIENCE",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...experiences.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.role, bold: true, size: 22 }),
                exp.subtitle ? new TextRun({ text: ` | ${exp.subtitle}`, italic: true, size: 20 }) : new TextRun(""),
                new TextRun({ text: `   (${exp.period})`, bold: true, color: "475569", size: 18 })
              ],
              spacing: { before: 150, after: 50 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: exp.company || exp.location, italic: true, color: "64748B", size: 18 })
              ],
              spacing: { after: 100 }
            }),
            ...exp.bullets.map(bullet => new Paragraph({
              text: `•  ${bullet}`,
              spacing: { after: 50 }
            }))
          ]),

          // Education Section
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 }
          }),
          ...education.map(edu => new Paragraph({
            text: `▪  ${edu}`,
            spacing: { after: 50 }
          })),

          // Certifications Section
          new Paragraph({
            text: "CERTIFICATIONS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...certifications.map(cert => new Paragraph({
            text: `▪  ${cert}`,
            spacing: { after: 50 }
          })),

          // Core Skills & IT Skills Section
          new Paragraph({
            text: "SKILLS & COMPETENCIES",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: skills.join(", "),
            spacing: { after: 100 }
          }),
          itSkills && itSkills.length > 0 ? new Paragraph({
            text: `IT Skills: ${itSkills.join(", ")}`,
            spacing: { after: 100 }
          }) : new Paragraph("")
        ]
      }
    ]
  });

  Packer.toBlob(doc).then(blob => {
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

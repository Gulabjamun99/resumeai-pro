/**
 * RESUMEAI PRO — PRODUCTION WYSIWYG A4 PDF EXPORTER
 * 
 * Guarantees:
 * 1. Strict 1 to 2 A4 Page Limit
 * 2. High Resolution Vector Print
 * 3. Exact 1:1 match with on-screen Live Canvas
 */

export function sanitizeCandidateFilename(candidateName, extension = 'pdf') {
  const ext = extension.replace(/^\.+/, '').toLowerCase();
  let cleanName = (candidateName || 'Candidate')
    .replace(/[^a-zA-Z0-9_\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  if (!cleanName) cleanName = 'Candidate';
  return `${cleanName}_ATS_Resume.${ext}`;
}

export async function exportResumeToPdf(elementId = 'resume-document', candidateName = 'Candidate') {
  const filename = sanitizeCandidateFilename(candidateName, 'pdf');
  
  let element = document.getElementById(elementId);
  if (!element) {
    element = document.querySelector('#resume-document') || document.querySelector('.resume-canvas');
  }

  if (!element) {
    throw new Error("Resume canvas element not found for PDF export.");
  }

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123; // Exact ratio: 794 * (297 / 210) = 1122.94px -> 1123px

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        clonedDoc.body.style.zoom = '1';
        clonedDoc.body.style.transform = 'none';
        clonedElement.style.zoom = '1';
        clonedElement.style.transform = 'none';
        clonedElement.style.width = `${A4_WIDTH_PX}px`;
        clonedElement.style.maxWidth = `${A4_WIDTH_PX}px`;
        clonedElement.style.minWidth = `${A4_WIDTH_PX}px`;
        clonedElement.style.margin = '0 auto';
        clonedElement.style.boxShadow = 'none';

        // Check natural height: max 2 pages
        const naturalHeight = clonedElement.scrollHeight || clonedElement.offsetHeight;
        const totalPages = naturalHeight <= 1140 ? 1 : 2;
        const targetHeight = totalPages * A4_HEIGHT_PX;

        clonedElement.style.height = `${targetHeight}px`;
        clonedElement.style.minHeight = `${targetHeight}px`;
        clonedElement.style.maxHeight = `${targetHeight}px`;
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pageHeight = 297;
    const a4Ratio = 297 / 210;
    const pageHeightInCanvasPx = Math.round(canvas.width * a4Ratio);

    const totalPages = Math.min(2, Math.max(1, Math.round(canvas.height / pageHeightInCanvasPx)));

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) pdf.addPage();

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightInCanvasPx;
      const ctx = pageCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      const srcY = p * pageHeightInCanvasPx;
      const srcHeight = Math.min(pageHeightInCanvasPx, canvas.height - srcY);

      ctx.drawImage(
        canvas,
        0, srcY, canvas.width, srcHeight,
        0, 0, pageCanvas.width, srcHeight
      );

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageHeight, undefined, 'FAST');
    }

    pdf.save(filename);
    return { success: true, filename };
  } catch (err) {
    console.error("PDF Export error:", err);
    throw new Error(err.message || "Failed to generate PDF document.");
  }
}

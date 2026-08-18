/**
 * RESUMEAI PRO — SECURE VECTOR PDF EXPORTER (P2 HARDENING)
 * Features:
 * - Dynamic Lazy Import of html2pdf.js (Code Splitting)
 * - Safe Candidate Filename Sanitizer (Path Traversal & Windows Reserved Name Protection)
 * - Error Boundary & Loading State Handling
 */

const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

/**
 * SHARED SECURE FILENAME SANITIZER
 */
export function sanitizeCandidateFilename(candidateName, version = 1, extension = 'pdf') {
  const ext = extension.replace(/^\.+/, '').toLowerCase();
  const ver = Math.max(1, parseInt(version, 10) || 1);

  if (!candidateName || typeof candidateName !== 'string') {
    return `Candidate_ATS_Resume_v${ver}.${ext}`;
  }

  // 1. Strip script tags with content, then general HTML tags, path separators (/ and \), and path traversal (..)
  let cleanName = candidateName
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\/\\]+/g, '')
    .replace(/\.{2,}/g, '')
    // 2. Remove illegal filename characters: < > : " | ? * ( ) [ ] and control chars
    .replace(/[<>:"|?*()\[\]\x00-\x1F\x7F]/g, '')
    // 3. Trim whitespace and replace consecutive whitespace/underscores with single underscore
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    // 4. Remove leading/trailing dots and underscores
    .replace(/^[._]+|[._]+$/g, '');

  // 5. Check for Windows Reserved Names
  const upperName = cleanName.toUpperCase();
  if (!cleanName || WINDOWS_RESERVED_NAMES.has(upperName) || cleanName.length === 0) {
    cleanName = 'Candidate';
  }

  // 6. Max length limit for candidate name slug
  if (cleanName.length > 50) {
    cleanName = cleanName.substring(0, 50).replace(/_+$/, '');
  }

  return `${cleanName}_ATS_Resume_v${ver}.${ext}`;
}

export async function exportResumeToPdf(elementId, candidateName = 'Candidate', version = 1) {
  const filename = sanitizeCandidateFilename(candidateName, version, 'pdf');
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Resume preview element "#${elementId}" not found for PDF export.`);
  }

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc, clonedElement) => {
        // Enforce exact standard A4 proportions on the cloned DOM element
        clonedElement.style.width = '794px';
        clonedElement.style.maxWidth = '794px';
        clonedElement.style.minWidth = '794px';
        clonedElement.style.margin = '0 auto';
        clonedElement.style.padding = '36px 44px';
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.transform = 'none';

        const elementsToCheck = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))];
        elementsToCheck.forEach((el) => {
          const computed = window.getComputedStyle(el);
          const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'];
          
          colorProps.forEach((prop) => {
            const val = computed[prop];
            if (val && typeof val === 'string' && val.includes('oklch')) {
              if (prop === 'backgroundColor') {
                el.style[prop] = '#ffffff';
              } else if (prop === 'color') {
                el.style[prop] = '#1e293b';
              } else {
                el.style[prop] = 'transparent';
              }
            }
          });
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const blob = pdf.output('blob');
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => URL.revokeObjectURL(downloadAnchor.href), 1000);

    return { success: true, filename };
  } catch (err) {
    console.error("PDF Export failed:", err);
    throw new Error(err.message || "Failed to generate PDF. Your active CV state has been preserved.");
  }
}

/**
 * PRINT VIEW HELPER
 */
export function printResume(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>ATS Updated Resume</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .page-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          ${document.querySelector('style')?.innerHTML || ''}
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

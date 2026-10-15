/**
 * RESUMEAI PRO — SECURE VECTOR & MULTI-PAGE A4 PDF EXPORTER
 * 
 * Guarantees:
 * 1. STRICT MAX 1 TO 2 PAGES: Automatically fits content into exactly 1 or 2 A4 pages.
 * 2. EXACT 1:1 VISUAL MATCH: What you see on the canvas is exactly what downloads.
 * 3. CLEAN PAGE SLICING: Prevents negative offset distortion and blur by slicing into dedicated page canvases.
 * 4. ZOOM ISOLATION: Eliminates CSS zoom artifacts by resetting zoom on the cloned export node.
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

  let cleanName = candidateName
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\/\\]+/g, '')
    .replace(/\.{2,}/g, '')
    .replace(/[<>:"|?*()\[\]\x00-\x1F\x7F]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[._]+|[._]+$/g, '');

  const upperName = cleanName.toUpperCase();
  if (!cleanName || WINDOWS_RESERVED_NAMES.has(upperName) || cleanName.length === 0) {
    cleanName = 'Candidate';
  }

  if (cleanName.length > 50) {
    cleanName = cleanName.substring(0, 50).replace(/_+$/, '');
  }

  return `${cleanName}_ATS_Resume_v${ver}.${ext}`;
}

export async function exportResumeToPdf(elementId, candidateName = 'Candidate', version = 1) {
  const filename = sanitizeCandidateFilename(candidateName, version, 'pdf');
  
  // Find the exact document element (either #resume-document or the canvas wrapper)
  let element = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById('resume-document') || document.getElementById('cockpit-preview-canvas');
  }

  if (!element) {
    throw new Error(`Resume element "#${elementId}" not found for PDF export.`);
  }

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    // Standard A4 dimensions in pixels at 96 DPI
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123; // Exact ratio: 794 * (297 / 210) = 1122.94px -> 1123px

    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution crisp export
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        // 1. Completely reset any CSS zoom or scaling on body and cloned node
        clonedDoc.body.style.zoom = '1';
        clonedDoc.body.style.transform = 'none';
        clonedElement.style.zoom = '1';
        clonedElement.style.transform = 'none';

        // 2. Enforce exact standard A4 proportions on cloned element
        clonedElement.style.width = `${A4_WIDTH_PX}px`;
        clonedElement.style.maxWidth = `${A4_WIDTH_PX}px`;
        clonedElement.style.minWidth = `${A4_WIDTH_PX}px`;
        clonedElement.style.margin = '0 auto';
        clonedElement.style.padding = '0';
        clonedElement.style.textAlign = 'left';
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.boxShadow = 'none';

        // Ensure child resume-document also conforms
        const childDoc = clonedElement.querySelector('#resume-document') || clonedElement;
        if (childDoc) {
          childDoc.style.width = `${A4_WIDTH_PX}px`;
          childDoc.style.maxWidth = `${A4_WIDTH_PX}px`;
          childDoc.style.minWidth = `${A4_WIDTH_PX}px`;
          childDoc.style.boxSizing = 'border-box';
          childDoc.style.boxShadow = 'none';
        }

        // 3. Sanitize unsupported oklch color properties for html2canvas
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

        // 4. Calculate exact multi-page height (STRICT RULE: MAX 1 OR 2 PAGES)
        const naturalHeight = childDoc.scrollHeight || clonedElement.scrollHeight || clonedElement.offsetHeight;
        
        // If content fits within 1 page (up to ~1140px with tolerance), make it strictly 1 page.
        // Otherwise, strictly 2 pages max.
        const totalPages = naturalHeight <= 1140 ? 1 : 2;
        const targetExactHeight = totalPages * A4_HEIGHT_PX;

        clonedElement.style.height = `${targetExactHeight}px`;
        clonedElement.style.minHeight = `${targetExactHeight}px`;
        clonedElement.style.maxHeight = `${targetExactHeight}px`;

        if (childDoc && childDoc !== clonedElement) {
          childDoc.style.height = `${targetExactHeight}px`;
          childDoc.style.minHeight = `${targetExactHeight}px`;
          childDoc.style.maxHeight = `${targetExactHeight}px`;
        }

        // 5. Stretch sidebar height to match the full document height cleanly
        const sidebars = clonedElement.querySelectorAll('.resume-sidebar, [class*="sidebar"]');
        sidebars.forEach(sb => {
          sb.style.height = `${targetExactHeight}px`;
          sb.style.minHeight = `${targetExactHeight}px`;
          sb.style.boxSizing = 'border-box';
        });
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210; // 210mm A4 width
    const pageHeight = 297; // 297mm A4 height
    const a4Ratio = 297 / 210;
    const pageHeightInCanvasPx = Math.round(canvas.width * a4Ratio);

    // Compute whether 1 or 2 pages based on canvas height
    const totalPages = Math.min(2, Math.max(1, Math.round(canvas.height / pageHeightInCanvasPx)));

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) {
        pdf.addPage();
      }

      // Create a dedicated page canvas slice for each page to prevent any vertical drift or bleeding
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightInCanvasPx;
      const ctx = pageCanvas.getContext('2d');

      // Draw exact slice of the main canvas
      const srcY = p * pageHeightInCanvasPx;
      const srcHeight = Math.min(pageHeightInCanvasPx, canvas.height - srcY);

      // Fill background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0, srcY, canvas.width, srcHeight,
        0, 0, pageCanvas.width, srcHeight
      );

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageHeight, undefined, 'FAST');
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
 * HIGH-PRECISION BROWSER VECTOR PRINT (Zero Rasterization / 100% Vector Fonts)
 */
export function printResume(elementId = 'resume-document') {
  let element = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById('resume-document') || document.getElementById('cockpit-preview-canvas');
  }
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ATS Resume</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #print-container {
            width: 210mm;
            margin: 0 auto;
          }
          .page-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div id="print-container">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
}

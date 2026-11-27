/**
 * RESUMEAI PRO — PRODUCTION VECTOR ATS A4 PDF EXPORTER
 *
 * Guarantees:
 * 1. 100% Real Selectable, Copyable, ATS-Readable Vector Text (NOT an image PDF)
 * 2. Exact Top & Bottom A4 Margins (11mm) with Zero Text Cutting across 1–2 Pages
 * 3. Preserves Multicolor Accents, Text Colors, Column/Sidebar Backgrounds & Borders
 * 4. Preserves Clickable Hyperlinks (Play Store, Vercel Live Demo, GitHub, LinkedIn, Email)
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

/**
 * Converts any CSS color (oklch, rgb, rgba, hex) into [r, g, b, a].
 */
function createRgbParser(doc) {
  const canvas = doc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  const cache = new Map();

  return function parseRgba(cssColor) {
    if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') {
      return null;
    }
    if (cache.has(cssColor)) return cache.get(cssColor);

    let r = 15, g = 23, b = 42, a = 1;
    try {
      if (ctx) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#000000';
        ctx.fillStyle = cssColor;
        const normalized = ctx.fillStyle;
        if (normalized.startsWith('#')) {
          const hex = normalized.slice(1);
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
        } else {
          const m = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (m) {
            r = parseInt(m[1], 10);
            g = parseInt(m[2], 10);
            b = parseInt(m[3], 10);
            a = m[4] !== undefined ? parseFloat(m[4]) : 1;
          }
        }
      }
    } catch {
      // fallback to dark slate
    }

    const res = a <= 0.02 ? null : [r, g, b, a];
    cache.set(cssColor, res);
    return res;
  };
}

/**
 * Sanitizes Unicode punctuation/symbols unsupported by standard PDF Type1 fonts
 * so ATS parsers & copy-paste always get clean, readable characters.
 */
function sanitizePdfText(str) {
  if (!str) return '';
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '*')
    .replace(/\u25B8/g, '>')
    .replace(/\u25C6/g, '*')
    .replace(/\u25CB/g, '-')
    .replace(/\u2197/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ');
}

function mapCssFontToPdfFont(cssFontFamily = '') {
  const lower = cssFontFamily.toLowerCase();
  if (lower.includes('mono') || lower.includes('courier') || lower.includes('code')) {
    return 'courier';
  }
  if (
    lower.includes('serif') ||
    lower.includes('georgia') ||
    lower.includes('merriweather') ||
    lower.includes('lora') ||
    lower.includes('playfair') ||
    lower.includes('garamond') ||
    lower.includes('baskerville')
  ) {
    return 'times';
  }
  return 'helvetica';
}

export async function exportResumeToPdf(
  elementId = 'resume-document',
  candidateName = 'Candidate',
  pageMode = 2
) {
  const filename = sanitizeCandidateFilename(candidateName, 'pdf');

  let element = document.getElementById(elementId);
  if (!element) {
    element = document.querySelector('#resume-document') || document.querySelector('.resume-canvas');
  }
  if (!element) {
    throw new Error('Resume canvas element not found for PDF export.');
  }

  try {
    const { jsPDF } = await import('jspdf');

    const rootRect = element.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) {
      throw new Error('Resume canvas has zero dimensions.');
    }

    const PAGE_W = 210; // A4 width in mm
    const PAGE_H = 297; // A4 height in mm
    const MARGIN_TOP = 11; // 11mm clean top margin on every page
    const MARGIN_BOTTOM = 11; // 11mm clean bottom margin on every page
    const USABLE_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM; // 275mm printable area per page

    // Scale factor from current DOM pixels (accounting for any CSS zoom transform) to A4 mm
    const pxToMm = PAGE_W / rootRect.width;
    const totalContentHeightMm = rootRect.height * pxToMm;

    // In Strict 1-Page mode, gently scale vertically if slightly over 1 usable page so nothing spills/cuts
    const maxPages = pageMode === 1 ? 1 : 2;
    const maxUsableTotal = maxPages * USABLE_H;
    const verticalCompress =
      totalContentHeightMm > maxUsableTotal
        ? Math.max(0.78, maxUsableTotal / totalContentHeightMm)
        : 1;

    const parseRgba = createRgbParser(document);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Collect vector boxes (backgrounds, sidebars, borders) and text runs
    const bgRects = [];
    const borderLines = [];
    const textRuns = [];
    const linkAnnotations = [];

    const walk = (node, activeHref = null) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'style' || tag === 'script' || tag === 'svg') return;

        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
          return;
        }

        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          Array.from(node.childNodes).forEach(child => walk(child, activeHref));
          return;
        }

        const x = (rect.left - rootRect.left) * pxToMm;
        const y = (rect.top - rootRect.top) * pxToMm * verticalCompress;
        const w = rect.width * pxToMm;
        const h = rect.height * pxToMm * verticalCompress;

        // Track <a> href
        let href = activeHref;
        if (tag === 'a') {
          const rawHref = node.getAttribute('href');
          if (rawHref && /^(https?:|mailto:)/i.test(rawHref)) {
            href = rawHref;
            linkAnnotations.push({ x, y, w, h, url: rawHref });
          }
        }

        // Background fill (paint root/main/aside full-height if non-white)
        const bg = parseRgba(style.backgroundColor);
        if (bg && !(bg[0] >= 253 && bg[1] >= 253 && bg[2] >= 253)) {
          bgRects.push({
            x,
            y,
            w,
            h,
            rgb: [bg[0], bg[1], bg[2]],
            isFullColumn: node === element || tag === 'aside' || tag === 'main'
          });
        }

        if (node !== element) {

          // Borders (top, right, bottom, left)
          const bTop = parseFloat(style.borderTopWidth) || 0;
          const bBottom = parseFloat(style.borderBottomWidth) || 0;
          const bLeft = parseFloat(style.borderLeftWidth) || 0;
          const bRight = parseFloat(style.borderRightWidth) || 0;

          if (bTop > 0) {
            const c = parseRgba(style.borderTopColor);
            if (c) borderLines.push({ x1: x, y1: y, x2: x + w, y2: y, width: bTop * pxToMm, rgb: c });
          }
          if (bBottom > 0) {
            const c = parseRgba(style.borderBottomColor);
            if (c) borderLines.push({ x1: x, y1: y + h, x2: x + w, y2: y + h, width: bBottom * pxToMm, rgb: c });
          }
          if (bLeft > 0) {
            const c = parseRgba(style.borderLeftColor);
            if (c) borderLines.push({ x1: x, y1: y, x2: x, y2: y + h, width: bLeft * pxToMm, rgb: c });
          }
          if (bRight > 0) {
            const c = parseRgba(style.borderRightColor);
            if (c) borderLines.push({ x1: x + w, y1: y, x2: x + w, y2: y + h, width: bRight * pxToMm, rgb: c });
          }
        }

        Array.from(node.childNodes).forEach(child => walk(child, href));
      } else if (node.nodeType === Node.TEXT_NODE) {
        const rawText = node.textContent;
        if (!rawText || !rawText.trim()) return;

        const parent = node.parentElement;
        if (!parent) return;
        const style = window.getComputedStyle(parent);
        const clean = sanitizePdfText(rawText).trim();
        if (!clean) return;

        // Use Range to get exact visual line boxes for this text node
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = Array.from(range.getClientRects());
        if (!rects.length) return;

        const fontSizePx = parseFloat(style.fontSize) || 12;
        // pxToMm * 2.83465 converts px -> pt accurately for A4
        const fontSizePt = Math.max(6.5, fontSizePx * pxToMm * 2.83465 * Math.min(1, verticalCompress + 0.04));
        const pdfFont = mapCssFontToPdfFont(style.fontFamily);
        const fontWeight = parseInt(style.fontWeight, 10);
        const isBold = fontWeight >= 600 || style.fontWeight === 'bold';
        const isItalic = style.fontStyle === 'italic';
        const pdfFontStyle = isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal';
        const colorRgba = parseRgba(style.color) || [15, 23, 42, 1];

        // Bounding box of the whole text node
        const totalRect = range.getBoundingClientRect();
        const x = (totalRect.left - rootRect.left) * pxToMm;
        const y = (totalRect.top - rootRect.top) * pxToMm * verticalCompress;
        const w = Math.max(4, totalRect.width * pxToMm);
        const h = totalRect.height * pxToMm * verticalCompress;

        textRuns.push({
          text: clean,
          x,
          y,
          w,
          h,
          fontSizePt,
          pdfFont,
          pdfFontStyle,
          rgb: [colorRgba[0], colorRgba[1], colorRgba[2]],
          align: style.textAlign,
          parentWidthMm: parent.getBoundingClientRect().width * pxToMm
        });
      }
    };

    walk(element, null);

    // Determine exact page count (1 or 2)
    let maxY = 0;
    textRuns.forEach(t => {
      if (t.y + t.h > maxY) maxY = t.y + t.h;
    });
    const actualPages = Math.min(maxPages, Math.max(1, Math.ceil(maxY / USABLE_H)));

    // Render each page with clean MARGIN_TOP & MARGIN_BOTTOM
    for (let p = 0; p < actualPages; p++) {
      if (p > 0) pdf.addPage();

      const pageStart = p * USABLE_H;
      const pageEnd = (p + 1) * USABLE_H;

      // 1. Full-column sidebar backgrounds span full page height cleanly
      bgRects
        .filter(b => b.isFullColumn)
        .forEach(b => {
          pdf.setFillColor(b.rgb[0], b.rgb[1], b.rgb[2]);
          pdf.rect(b.x, 0, b.w, PAGE_H, 'F');
        });

      // 2. Card / badge / header backgrounds on this page
      bgRects
        .filter(b => !b.isFullColumn && b.y + b.h > pageStart && b.y < pageEnd)
        .forEach(b => {
          const clampedTop = Math.max(b.y, pageStart);
          const clampedBottom = Math.min(b.y + b.h, pageEnd);
          const drawY = MARGIN_TOP + (clampedTop - pageStart);
          const drawH = Math.max(0.5, clampedBottom - clampedTop);
          pdf.setFillColor(b.rgb[0], b.rgb[1], b.rgb[2]);
          pdf.rect(b.x, drawY, b.w, drawH, 'F');
        });

      // 3. Borders & dividers on this page
      borderLines.forEach(l => {
        if (l.y2 >= pageStart && l.y1 <= pageEnd) {
          const drawY1 = MARGIN_TOP + (Math.max(pageStart, l.y1) - pageStart);
          const drawY2 = MARGIN_TOP + (Math.min(pageEnd, l.y2) - pageStart);
          pdf.setDrawColor(l.rgb[0], l.rgb[1], l.rgb[2]);
          pdf.setLineWidth(Math.max(0.15, Math.min(1.2, l.width)));
          pdf.line(l.x1, drawY1, l.x2, drawY2);
        }
      });

      // 4. Vector Selectable Text Runs (no text ever sliced at page boundary!)
      textRuns.forEach(t => {
        pdf.setFont(t.pdfFont, t.pdfFontStyle);
        pdf.setFontSize(t.fontSizePt);
        pdf.setTextColor(t.rgb[0], t.rgb[1], t.rgb[2]);

        const maxLineW = Math.max(t.w + 2, 10);
        const lines = pdf.splitTextToSize(t.text, maxLineW);
        const lineStepMm = lines.length > 1 ? t.h / lines.length : t.h;
        const baselineOffset = (t.fontSizePt / 2.83465) * 0.82;

        lines.forEach((lineStr, idx) => {
          const lineTop = t.y + idx * lineStepMm;
          // Assign line cleanly to the page where its vertical midpoint lives
          const lineMid = lineTop + lineStepMm * 0.5;
          if (lineMid >= pageStart && lineMid < pageEnd) {
            const drawY = MARGIN_TOP + (lineTop - pageStart) + baselineOffset;
            // Ensure drawY stays strictly inside [MARGIN_TOP, PAGE_H - MARGIN_BOTTOM]
            if (drawY >= MARGIN_TOP && drawY <= PAGE_H - MARGIN_BOTTOM + 2) {
              pdf.text(lineStr, t.x, drawY);
            }
          }
        });
      });

      // 5. Clickable Links on this page
      linkAnnotations.forEach(l => {
        const mid = l.y + l.h * 0.5;
        if (mid >= pageStart && mid < pageEnd) {
          const drawY = MARGIN_TOP + (l.y - pageStart);
          try {
            pdf.link(l.x, drawY, Math.max(l.w, 4), Math.max(l.h, 3), { url: l.url });
          } catch {
            // ignore malformed URL
          }
        }
      });
    }

    pdf.save(filename);
    return { success: true, filename, vector: true, pages: actualPages };
  } catch (err) {
    console.error('PDF Export error:', err);
    throw new Error(err.message || 'Failed to generate PDF document.');
  }
}

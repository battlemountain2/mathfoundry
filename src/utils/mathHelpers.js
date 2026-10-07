import katex from 'katex';

/**
 * Render a LaTeX string to HTML using KaTeX.
 */
export function renderMath(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      trust: false,
    });
  } catch (e) {
    console.warn('KaTeX render error:', e);
    return latex;
  }
}

/**
 * Process text containing inline math ($...$), display math ($$...$$),
 * and standard markdown (bold **text**, italic *text*, inline code `code`).
 * Returns HTML string with rendered math and formatted text.
 */
export function processContent(text, plainText = false) {
  if (!text) return '';

  const displayBlocks = [];
  const inlineBlocks = [];

  // 1. Extract display math ($$...$$) first to protect formulas from markdown regexes
  let result = String(text).replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    const idx = displayBlocks.length;
    displayBlocks.push(latex);
    return `@@MATH_DISPLAY_${idx}@@`;
  });

  // 2. Extract inline math ($...$)
  result = result.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
    const idx = inlineBlocks.length;
    inlineBlocks.push(latex);
    return `@@MATH_INLINE_${idx}@@`;
  });

  // 3. HTML escape untrusted text if plainText is requested
  if (plainText) {
    result = result.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  // 4. Markdown formatting on prose outside math tokens
  // Bold: **text** or __text__
  result = result.replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-bold text-[var(--ink)]">$1</strong>');
  result = result.replace(/__([^_]+?)__/g, '<strong class="font-bold text-[var(--ink)]">$1</strong>');

  // Italic: *text* (avoiding bullet list markers at line starts)
  result = result.replace(/(^|[^\*])\*([^*\n]+?)\*([^\*]|$)/g, '$1<em class="italic">$2</em>$3');

  // Inline code: `code`
  result = result.replace(/`([^`\n]+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink)] font-mono text-xs">$1</code>');

  // 5. Restore KaTeX math
  result = result.replace(/@@MATH_DISPLAY_(\d+)@@/g, (_, idx) => {
    const latex = displayBlocks[Number(idx)];
    return `<div class="my-4 text-center overflow-x-auto">${renderMath(latex.trim(), true)}</div>`;
  });

  result = result.replace(/@@MATH_INLINE_(\d+)@@/g, (_, idx) => {
    const latex = inlineBlocks[Number(idx)];
    return renderMath(latex.trim(), false);
  });

  return result;
}

/**
 * Convert degrees to radians.
 */
export function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees.
 */
export function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate distance between two points.
 */
export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Calculate midpoint between two points.
 */
export function midpoint(x1, y1, x2, y2) {
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

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
 * Process text containing inline math ($...$) and display math ($$...$$).
 * Returns HTML string with rendered math.
 */
export function processContent(text, plainText = false) {
  if (!text) return '';
  if (plainText) text = String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  // First, handle display math ($$...$$)
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    return `<div class="my-4 text-center">${renderMath(latex.trim(), true)}</div>`;
  });

  // Then handle inline math ($...$)
  result = result.replace(/\$([^$]+?)\$/g, (_, latex) => {
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

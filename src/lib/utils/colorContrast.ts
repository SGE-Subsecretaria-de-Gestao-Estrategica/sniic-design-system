import { black, white } from '../tokens.js';

/**
 * Returns a text color (black or white token) with sufficient contrast
 * against the given background hex color, using ITU-R BT.601 luma.
 *
 * Accepts 3-, 6-, or 8-digit hex strings (alpha channel is ignored).
 *
 * @example
 * getContrastColor('#4271b5') // → '#fffffe' (white — dark bg)
 * getContrastColor('#f6c341') // → '#000000' (black — light bg)
 */
export function getContrastColor(bgColor: string): string {
  const hex = bgColor.replace('#', '').slice(0, 6);
  const full = hex.length === 3
    ? hex.split('').map(c => c + c).join('')
    : hex;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? black : white;
}

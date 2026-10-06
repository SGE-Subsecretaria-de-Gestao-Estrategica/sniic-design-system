/**
 * Greedy word wrap: fills each line until the next word would overflow
 * `maxWidth`, then starts a new one. A single word longer than `maxWidth`
 * gets its own line rather than being cut.
 *
 * Takes a `measure` callback instead of a font size/family/weight directly,
 * so callers plug in whatever measurer matches what they actually render
 * with — `measureTextWidth` from `$lib/utils/labelHelpers`, most often. This
 * is the same algorithm `useText.svelte.ts` runs internally for a `<Text>`
 * with a `width`; this standalone version exists for charts that need the
 * *line count* (and so the total wrapped height) before layout, to position
 * whatever comes after the text block — `<Text>` doesn't report that back.
 *
 * @example
 * const lines = wrapText(title, (s) => measureTextWidth(s, 14, fontFamily, 600), textWidth);
 * const titleHeight = lines.length * lineHeight;
 */
export function wrapText(
  text: string,
  measure: (line: string) => number,
  maxWidth: number,
): string[] {
  if (!text) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines;
}

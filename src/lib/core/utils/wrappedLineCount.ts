import getStringWidth from "./getStringWidth";
import { wrapText } from "./wrapText";

/**
 * How many lines a `<Text>` with this `width` will wrap `text` into.
 *
 * Layouts need it before drawing, so a long name in a narrow gutter makes
 * room for itself instead of running into the next label. It measures with
 * the same unstyled measurer `<Text>` wraps with, so the count agrees with
 * what gets drawn.
 */
export default function wrappedLineCount(text: string, width: number): number {
  return wrapText(text, (line) => getStringWidth(line, "") ?? line.length * 7, width).length;
}

import type { ParsedNumber } from "../types";

interface ParseOptions {
  decimalSeparator?: string;
  thousandsSeparator?: string;
}

function stripZeroDecimals(number: string, decimalSeparator: string): string {
  const escapedSep = decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^(.*)${escapedSep}0+$`);
  const match = number.match(regex);
  return match ? match[1] : number;
}

export function parseFormattedNumber(
  formatted: string,
  options: ParseOptions = {}
): ParsedNumber {
  const { decimalSeparator = ',', thousandsSeparator = '.' } = options;
  const trimmedInput = formatted.trim();
  const match = trimmedInput.match(/^([^\d-]*)(-?[\d.,]+)([^\d]*)$/);
  if (!match) {
    return { formatted, prefix: '', number: trimmedInput, suffix: '' };
  }
  const [, prefix, rawNumber, suffix] = match;
  const number = stripZeroDecimals(rawNumber, decimalSeparator);
  return { formatted, prefix, number, suffix };
}
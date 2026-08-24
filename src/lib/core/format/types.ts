export type Formater = (n: number | { valueOf(): number; }) => string;

export interface ParsedNumber {
  formatted: string;
  prefix: string;
  number: string;
  suffix: string;
}
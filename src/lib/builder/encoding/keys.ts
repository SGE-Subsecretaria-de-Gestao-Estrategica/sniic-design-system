import * as d3 from "d3";
import type { Accessor } from "$lib/types/Accessor";
import type { XValue } from "$lib/core/layouts/types";
import type { Row } from "../data/types";
import type { ChannelReader } from "./accessors";

const YEAR = d3.timeFormat("%Y");
const MONTH = d3.timeFormat("%m/%Y");
const DAY = d3.timeFormat("%d/%m/%Y");

/**
 * Labels for the ticks of an x axis. Dates are written in numbers, as fine
 * as the ticks need (years, months or days), so no month or weekday name
 * shows up in English; numbers are written as they are (years).
 */
export function tickLabeller(
  ticks: readonly XValue[],
): (value: XValue) => string {
  const dates = ticks.filter((t): t is Date => t instanceof Date);
  if (!dates.length) return (value) => String(value);
  const format = dates.some((d) => d.getDate() !== 1)
    ? DAY
    : dates.some((d) => d.getMonth() !== 0)
      ? MONTH
      : YEAR;
  return (value) => (value instanceof Date ? format(value) : String(value));
}

/**
 * A channel read as category keys, whatever its column type: text and UF
 * cells as written, in file order; numbers and dates as `tickLabeller`
 * writes them, in ascending order (`order`).
 */
export function categoryKeys(
  read: ChannelReader,
  rows: readonly Row[],
  channel: string,
): { get: Accessor<Row, string>; order?: string[] } {
  const type = read.type(channel);
  if (type === "text" || type === "uf") return { get: read.text(channel) };
  const getX = read.x(channel);
  const values = [
    ...new Map(rows.map((row) => [+getX(row), getX(row)])).values(),
  ].sort((a, b) => +a - +b);
  const label = tickLabeller(values);
  return { get: (row) => label(getX(row)), order: values.map(label) };
}

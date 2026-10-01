import type { AxisSizing } from "../registry/types";

export function plotSize(sizing: AxisSizing, user: number | null, fallback: number, margins: number) {
  return (sizing === "free" ? (user ?? fallback) : fallback) - margins;
}

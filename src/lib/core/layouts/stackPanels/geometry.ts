import type { PanelSpec } from "./types";

// Pure helpers: every input is an argument, no defaults or config reads.

/** Fixed heights as given; the rest split by share (default 1) of what is left. */
export function distributeHeights(specs: readonly PanelSpec[], available: number): number[] {
  const fixed = specs.reduce((sum, s) => sum + (s.height ?? 0), 0);
  const shares = specs.map((s) => (s.height === undefined ? (s.share ?? 1) : 0));
  const totalShare = shares.reduce((a, b) => a + b, 0);
  const free = Math.max(0, available - fixed);
  return specs.map((s, i) =>
    s.height ?? (totalShare > 0 ? (free * shares[i]) / totalShare : 0),
  );
}

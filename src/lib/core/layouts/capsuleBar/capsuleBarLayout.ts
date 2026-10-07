import { resolveCapsuleBarSpacing } from "./defaults";
import { bandAlong, capsuleFrame, capsulePath, placeCapDot, pointAlong } from "./geometry";
import type { CapsuleBarLayout, CapsuleBarLayoutConfig } from "./types";

/**
 * The Cultura em Números bar: a flat base, a fully round tip and a dot
 * concentric with the tip. The only function that reads the config.
 */
export function capsuleBarLayout(config: CapsuleBarLayoutConfig): CapsuleBarLayout {
  const spacing = resolveCapsuleBarSpacing(config);
  const frame = capsuleFrame(config, config.orientation ?? "horizontal");
  const { length, thickness } = frame;
  const r = thickness / 2;

  return {
    length,
    thickness,
    clip: bandAlong(frame, 0, length),
    path: capsulePath(frame, length),
    gradient: { from: pointAlong(frame, 0, r), to: pointAlong(frame, length, r) },
    dot: placeCapDot(frame, length, spacing.dotRatio),
  };
}

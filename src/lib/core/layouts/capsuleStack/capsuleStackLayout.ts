import { bandAlong, capsuleFrame, capsulePath } from "../capsuleBar/geometry";
import { resolveCapsuleStackSpacing } from "./defaults";
import type {
  CapsuleStackLayout,
  CapsuleStackLayoutConfig,
  CapsuleStackPiece,
  CapsuleStackSegment,
} from "./types";

/**
 * A capsule split into segments: one flat base and one round tip for the
 * stack as a whole, the segments plain bands inside it — so no segment gets
 * rounded corners that would shave off area its value does not lose. The
 * config's box is the stack's; its length is the segments' sum.
 */
export function capsuleStackLayout<S extends CapsuleStackSegment>(
  segments: readonly S[],
  config: CapsuleStackLayoutConfig,
): CapsuleStackLayout<S> {
  const spacing = resolveCapsuleStackSpacing(config);
  const frame = capsuleFrame(config, config.orientation ?? "vertical");

  let cursor = 0;
  const pieces = segments.flatMap((segment, index): CapsuleStackPiece<S>[] => {
    if (!(segment.length > 0)) return [];
    const from = cursor;
    cursor += segment.length;
    return [{ ...segment, index, from, to: cursor, rect: bandAlong(frame, from, cursor) }];
  });
  const total = cursor;

  return {
    total,
    thickness: frame.thickness,
    clip: bandAlong(frame, 0, total),
    path: capsulePath(frame, total),
    pieces,
    gaps: pieces
      .slice(1)
      .map((piece) => bandAlong(frame, piece.from - spacing.gap / 2, piece.from + spacing.gap / 2)),
  };
}

import { cn } from '@/lib/utils/cn';

/**
 * THE BRAND MARK.
 *
 * Two long arcs sweeping past each other around a pair of leaves — the shop's
 * own drawing of the round "eco" badge idiom, not a copy of any particular
 * one.
 *
 * The taper is its whole character: each arc is a filled crescent, widest in
 * the middle and narrowing to a point at both ends, so the two cross rather
 * than meeting bluntly. A stroked circle cannot do that — round or butt caps
 * both read as a cut pipe — which is why the arcs are generated outlines
 * rather than strokes, and why their `d` data is long.
 *
 * Inline SVG rather than an image file: no extra request, crisp at any size,
 * recolourable. Drawn on a 32-unit grid and kept simple enough to survive the
 * 32px the header renders it at; anything finer turns to mush there.
 *
 * The greens are written as literals rather than taken from the theme. A logo
 * should not shift when a palette is retuned — these are the mark's own
 * colours, and the one place in the codebase where a colour is hard-coded.
 *
 * `mono` redraws everything in `currentColor` with the lighter half held back
 * by opacity, so the two-tone reading survives where the brand greens cannot
 * be used — the footer sits on deep green and would swallow both.
 */
const MARK_DARK = '#1b7a3d';
const MARK_LIGHT = '#8cc63e';

const ARC_DARK =
  'M4.8 21.2 L4.1 20.4 L3.7 19.4 L3.4 18.3 L3.2 17.3 L3.1 16.2 L3.1 15.1 L3.1 14.0 L3.3 12.9 L3.6 11.8 L4.0 10.8 L4.4 9.8 L5.0 8.8 L5.6 7.9 L6.3 7.0 L7.1 6.2 L7.9 5.5 L8.8 4.8 L9.8 4.2 L10.8 3.7 L11.8 3.3 L12.9 3.0 L14.0 2.8 L15.2 2.6 L16.3 2.6 L17.4 2.7 L18.5 2.8 L19.7 3.1 L20.7 3.4 L21.8 3.9 L22.8 4.4 L23.7 5.0 L24.6 5.7 L25.5 6.5 L26.3 7.3 L26.9 8.2 L27.6 9.2 L28.1 10.2 L28.5 11.2 L28.9 12.3 L29.2 13.4 L29.3 14.5 L29.4 15.6 L29.4 16.8 L29.2 17.9 L29.0 19.0 L28.7 20.1 L28.3 21.1 L27.8 22.1 L27.2 23.1 L26.5 24.0 L25.8 24.8 L25.0 25.6 L24.1 26.3 L23.2 26.9 L22.3 27.5 L21.3 27.9 L20.2 28.3 L19.2 28.6 L18.1 28.8 L17.0 28.8 L15.9 28.8 L14.8 28.7 L13.8 28.4 L12.8 28.0 L12.8 28.0 L13.9 28.0 L14.9 28.0 L15.9 28.0 L16.9 27.9 L17.9 27.7 L18.9 27.5 L19.8 27.2 L20.7 26.8 L21.6 26.3 L22.4 25.7 L23.2 25.1 L23.9 24.5 L24.6 23.8 L25.2 23.0 L25.7 22.2 L26.2 21.3 L26.6 20.4 L26.9 19.5 L27.2 18.6 L27.3 17.6 L27.4 16.7 L27.4 15.7 L27.3 14.7 L27.2 13.8 L26.9 12.8 L26.6 11.9 L26.2 11.1 L25.8 10.2 L25.2 9.4 L24.7 8.7 L24.0 8.0 L23.3 7.3 L22.5 6.7 L21.7 6.2 L20.9 5.7 L20.0 5.4 L19.1 5.1 L18.2 4.8 L17.2 4.7 L16.2 4.6 L15.3 4.6 L14.3 4.7 L13.4 4.9 L12.4 5.1 L11.5 5.4 L10.6 5.8 L9.8 6.3 L9.0 6.9 L8.2 7.5 L7.5 8.1 L6.9 8.9 L6.3 9.7 L5.7 10.5 L5.3 11.4 L4.9 12.3 L4.6 13.2 L4.4 14.2 L4.2 15.2 L4.1 16.2 L4.1 17.2 L4.2 18.2 L4.4 19.2 L4.6 20.2 L4.8 21.2 Z';

const ARC_LIGHT =
  'M27.2 10.8 L27.9 11.6 L28.3 12.6 L28.6 13.7 L28.8 14.7 L28.9 15.8 L28.9 16.9 L28.9 18.0 L28.7 19.1 L28.4 20.2 L28.0 21.2 L27.6 22.2 L27.0 23.2 L26.4 24.1 L25.7 25.0 L24.9 25.8 L24.1 26.5 L23.2 27.2 L22.2 27.8 L21.2 28.3 L20.2 28.7 L19.1 29.0 L18.0 29.2 L16.8 29.4 L15.7 29.4 L14.6 29.3 L13.5 29.2 L12.3 28.9 L11.3 28.6 L10.2 28.1 L9.2 27.6 L8.3 27.0 L7.4 26.3 L6.5 25.5 L5.7 24.7 L5.1 23.8 L4.4 22.8 L3.9 21.8 L3.5 20.8 L3.1 19.7 L2.8 18.6 L2.7 17.5 L2.6 16.4 L2.6 15.2 L2.8 14.1 L3.0 13.0 L3.3 11.9 L3.7 10.9 L4.2 9.9 L4.8 8.9 L5.5 8.0 L6.2 7.2 L7.0 6.4 L7.9 5.7 L8.8 5.1 L9.7 4.5 L10.7 4.1 L11.8 3.7 L12.8 3.4 L13.9 3.2 L15.0 3.2 L16.1 3.2 L17.2 3.3 L18.2 3.6 L19.2 4.0 L19.2 4.0 L18.1 4.0 L17.1 4.0 L16.1 4.0 L15.1 4.1 L14.1 4.3 L13.1 4.5 L12.2 4.8 L11.3 5.2 L10.4 5.7 L9.6 6.3 L8.8 6.9 L8.1 7.5 L7.4 8.2 L6.8 9.0 L6.3 9.8 L5.8 10.7 L5.4 11.6 L5.1 12.5 L4.8 13.4 L4.7 14.4 L4.6 15.3 L4.6 16.3 L4.7 17.3 L4.8 18.2 L5.1 19.2 L5.4 20.1 L5.8 20.9 L6.2 21.8 L6.8 22.6 L7.3 23.3 L8.0 24.0 L8.7 24.7 L9.5 25.3 L10.3 25.8 L11.1 26.3 L12.0 26.6 L12.9 26.9 L13.8 27.2 L14.8 27.3 L15.8 27.4 L16.7 27.4 L17.7 27.3 L18.6 27.1 L19.6 26.9 L20.5 26.6 L21.4 26.2 L22.2 25.7 L23.0 25.1 L23.8 24.5 L24.5 23.9 L25.1 23.1 L25.7 22.3 L26.3 21.5 L26.7 20.6 L27.1 19.7 L27.4 18.8 L27.6 17.8 L27.8 16.8 L27.9 15.8 L27.9 14.8 L27.8 13.8 L27.6 12.8 L27.4 11.8 L27.2 10.8 Z';

/** Dark leaf, upright and slightly left. */
const LEAF_DARK =
  'M16.1 21.8C12.1 19.4 10.9 14.2 13.1 9.3C17.1 11.7 18.3 16.9 16.1 21.8Z';

/** Lighter leaf, angled out to the right. */
const LEAF_LIGHT =
  'M16.1 21.8C17.6 17.7 21.6 15.3 25.5 16.1C23.9 20.2 19.9 22.6 16.1 21.8Z';

/** Vein cut into the lighter leaf. */
const LEAF_VEIN = 'M16.6 21C18.4 19 20.8 17.6 23.4 17.1';

export function BrandMark({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  const dark = mono ? 'currentColor' : MARK_DARK;
  const light = mono ? 'currentColor' : MARK_LIGHT;
  const lightOpacity = mono ? 0.7 : 1;

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('shrink-0', className)}
      fill="none"
      aria-hidden="true"
    >
      <path d={ARC_DARK} fill={dark} />
      <path d={ARC_LIGHT} fill={light} opacity={lightOpacity} />
      {/* Nudged so the leaf pair sits centred inside the ring rather than
          low and to one side, which is where its raw coordinates put it. */}
      <g transform="translate(-1.8,-1.2)">
        <path d={LEAF_DARK} fill={dark} />
        <path d={LEAF_LIGHT} fill={light} opacity={lightOpacity} />
        {/* In mono there is no lighter leaf to cut into, so the vein is left off. */}
        {mono ? null : (
          <path
            d={LEAF_VEIN}
            stroke="#fff"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.92"
          />
        )}
      </g>
    </svg>
  );
}

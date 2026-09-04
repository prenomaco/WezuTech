import type { FramePath, LitEdge } from "@/lib/design/notched-frame";

/**
 * One of the design's notched panels: the quote frame and its attribution
 * capsule, and the "How we work" panel on the About page.
 *
 * All are filled `black` at 10% — they darken the page rather than tinting it.
 * The stroke is not in the export, and measuring the render shows it is not a
 * full outline either. Down every one of their sides the page reads its own ink
 * untouched; what is lit is the long edges, and not always both — the quote
 * frame lights only its top, the capsule only its bottom, the About panel both,
 * and at different strengths.
 *
 * So each lit edge is drawn separately: a horizontal gradient supplies the
 * colour, running from nothing at the ends to the measured peak across the
 * middle, and a vertical mask keeps it to its own edge.
 */
function edgeStops(edge: LitEdge["edge"]): readonly (readonly [number, number])[] {
  return edge === "top"
    ? [
        [0, 1],
        [0.3, 1],
        [0.45, 0],
        [1, 0],
      ]
    : [
        [0, 0],
        [0.55, 0],
        [0.7, 1],
        [1, 1],
      ];
}

export function NotchedPanel({ shape, gradientId }: { shape: FramePath; gradientId: string }) {
  const flip = shape.flipY ? `translate(0 ${shape.height}) scale(1 -1)` : undefined;

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      /* Below `lg` the box is no longer the shape's own aspect ratio, so the
         frame has to stretch to it rather than letterbox inside it. */
      preserveAspectRatio="none"
      viewBox={`0 0 ${shape.width} ${shape.height}`}
    >
      <defs>
        {shape.lit.map((lit) => {
          const id = `${gradientId}-${lit.edge}`;
          return (
            <g key={lit.edge}>
              {/* Measured across the lit edge: nothing at both ends, flat over
                  the middle third. The shoulders are where the chamfers turn
                  away from the edge. */}
              <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
                {[0, 0.61, 0.79, 0.96, 1, 1, 0.96, 0.79, 0.57, 0].map((share, index) => (
                  <stop
                    key={`${lit.edge}-${index}`}
                    offset={[0, 0.06, 0.17, 0.34, 0.45, 0.56, 0.67, 0.83, 0.94, 1][index]}
                    stopColor="#dafaf5"
                    stopOpacity={lit.alpha * share}
                  />
                ))}
              </linearGradient>

              {/* Keeps the stroke to its own edge, dying within a third of the
                  height, which is where the render loses it. */}
              <linearGradient id={`${id}-mask`} x1="0" x2="0" y1="0" y2="1">
                {edgeStops(lit.edge).map(([offset, value]) => (
                  <stop key={offset} offset={offset} stopColor={value ? "#fff" : "#000"} />
                ))}
              </linearGradient>
              <mask id={`${id}-m`}>
                <rect
                  fill={`url(#${id}-mask)`}
                  height={shape.height}
                  width={shape.width}
                  x="0"
                  y="0"
                />
              </mask>
            </g>
          );
        })}
      </defs>

      <path d={shape.d} fill={shape.opaqueFill ?? "rgb(0 0 0 / 0.1)"} transform={flip} />

      {shape.lit.map((lit) => (
        <g key={lit.edge} mask={`url(#${gradientId}-${lit.edge}-m)`}>
          <path
            d={shape.d}
            fill="none"
            stroke={`url(#${gradientId}-${lit.edge})`}
            strokeWidth={shape.strokeWidth ?? 1}
            transform={flip}
          />
        </g>
      ))}
    </svg>
  );
}

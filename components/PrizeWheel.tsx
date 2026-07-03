import { segmentColor } from "@/lib/wheel";

const R = 500; // outer radius in SVG user units
const RING = 468; // inner ring where segments live
const HUB = 74;

type Props = {
  entries: string[];
  rotation: number;
  spinning: boolean;
  segmentColors?: string[];
  onSpinEnd: () => void;
};

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
}

function truncate(label: string, count: number) {
  // ponytail: hard cap at 50; per-count caps keep dense wheels legible
  const max = count <= 8 ? 50 : count <= 16 ? 30 : count <= 28 ? 18 : 10;
  return label.length > max ? label.slice(0, max - 1).trimEnd() + "…" : label;
}

export default function PrizeWheel({ entries, rotation, spinning, segmentColors, onSpinEnd }: Props) {
  const count = Math.max(entries.length, 1);
  const seg = 360 / count;
  const single = count === 1;
  const longest = entries.reduce((m, e) => Math.max(m, truncate("" + e, count).length), 1);
  // ponytail: shrink font so the longest label fits the radial span (~0.85 * RING)
  const fontSize = Math.min(Math.max(15, Math.min(66, 640 / count)), (RING * 0.85) / (longest * 0.55));
  const showLabels = count <= 60;
  const bulbCount = Math.min(Math.max(count * 2, 24), 72);

  return (
    <div
      className={`wheel-spin ${spinning ? "is-spinning" : ""}`}
      style={{ ["--rot" as string]: `${rotation}deg` }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform") onSpinEnd();
      }}
    >
      <svg
        viewBox="-540 -540 1080 1080"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="hubGrad" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="var(--cream)" />
            <stop offset="55%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-deep)" />
          </radialGradient>
          <radialGradient id="sheen" cx="50%" cy="38%" r="72%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="42%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
          </radialGradient>
          <filter id="wheelShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="26" floodColor="#000" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* outer gold rim */}
        <circle r={R + 26} fill="var(--on-accent)" />
        <circle r={R + 22} fill="none" stroke="url(#hubGrad)" strokeWidth={26} filter="url(#wheelShadow)" />

        {/* segments */}
        <g>
          {single ? (
            <circle r={RING} fill={segmentColor(0, segmentColors)} />
          ) : (
            entries.map((_, i) => {
              const a0 = i * seg;
              const a1 = (i + 1) * seg;
              const p0 = polar(a0, RING);
              const p1 = polar(a1, RING);
              const large = seg > 180 ? 1 : 0;
              const d = `M 0 0 L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${RING} ${RING} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
              return (
                <path
                  key={i}
                  d={d}
                  fill={segmentColor(i, segmentColors)}
                  stroke="rgba(11,7,19,0.55)"
                  strokeWidth={count > 30 ? 1.5 : 3}
                />
              );
            })
          )}
        </g>

        {/* glossy sheen + rim highlight */}
        <circle r={RING} fill="url(#sheen)" pointerEvents="none" />
        <circle r={RING} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={2} />

        {/* labels */}
        {showLabels && (
          <g fontFamily="var(--font-display), sans-serif" fill="var(--cream)">
            {(single ? ["" + entries[0]] : entries).map((label, i) => {
              const mid = (i + 0.5) * seg;
              const pos = polar(mid, RING * 0.62);
              const flip = mid > 90 && mid < 270 ? 180 : 0;
              return (
                <text
                  key={i}
                  x={pos.x}
                  y={pos.y}
                  fontSize={fontSize}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${mid + flip} ${pos.x} ${pos.y})`}
                  style={{
                    paintOrder: "stroke",
                    stroke: "rgba(11,7,19,0.55)",
                    strokeWidth: Math.max(2, fontSize * 0.09),
                    letterSpacing: "0.01em",
                  }}
                >
                  {truncate(label, count)}
                </text>
              );
            })}
          </g>
        )}

        {/* marquee bulbs around the rim */}
        <g>
          {Array.from({ length: bulbCount }).map((_, i) => {
            const a = (i / bulbCount) * 360;
            const p = polar(a, R + 22);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={6.5}
                fill={i % 2 === 0 ? "var(--cream)" : "var(--hot)"}
                opacity={0.92}
              />
            );
          })}
        </g>

        {/* center hub */}
        <circle r={HUB + 8} fill="var(--on-accent)" />
        <circle r={HUB} fill="url(#hubGrad)" />
        <circle r={HUB * 0.4} fill="var(--gold-deep)" stroke="var(--cream)" strokeWidth={3} />
      </svg>
    </div>
  );
}

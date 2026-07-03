"use client";

import { useMemo } from "react";

const COLORS = [
  "var(--gold)",
  "var(--hot)",
  "var(--confetti-1)",
  "var(--confetti-2)",
  "var(--confetti-3)",
  "var(--cream)",
];

/** One-shot confetti burst. GPU-only (transform + opacity). Mounts on win. */
export default function Confetti({ count = 130 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const dx = (Math.random() - 0.5) * 40;
        const delay = Math.random() * 0.6;
        const duration = 2.6 + Math.random() * 2.2;
        const size = 8 + Math.random() * 12;
        const spin = (Math.random() > 0.5 ? 1 : -1) * (540 + Math.random() * 720);
        const color = COLORS[i % COLORS.length];
        const round = Math.random() > 0.7;
        return { i, left, dx, delay, duration, size, spin, color, round };
      }),
    [count]
  );

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }}
    >
      {pieces.map((p) => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            top: "-8vh",
            left: `${p.left}vw`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
            opacity: 0,
            willChange: "transform",
            animation: `confetti-fall ${p.duration}s var(--ease-out-expo) ${p.delay}s forwards`,
            ["--dx" as string]: `${p.dx}vw`,
            ["--spin" as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

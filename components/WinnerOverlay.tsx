"use client";

import Confetti from "./Confetti";

type Props = {
  winner: string;
  onSpinAgain: () => void;
  onClose: () => void;
};

export default function WinnerOverlay({ winner, onSpinAgain, onClose }: Props) {
  // ponytail: scale headline down for long winners so it stays on screen
  const len = winner.length;
  const vw = len <= 10 ? 15 : len <= 20 ? 10 : len <= 35 ? 7 : 5;
  const maxRem = len <= 10 ? 15 : len <= 20 ? 9 : len <= 35 ? 6 : 4;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Winner: ${winner}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(120% 90% at 50% 45%, color-mix(in srgb, var(--ink-2) 72%, transparent), color-mix(in srgb, var(--ink) 92%, transparent))",
        animation: "overlay-fade 0.4s var(--ease-out-expo) forwards",
      }}
    >
      <Confetti />

      <div style={{ textAlign: "center", padding: "0 6vw", position: "relative", zIndex: 61 }}>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 800,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            fontSize: "clamp(1rem, 2.4vw, 2rem)",
            color: "var(--gold)",
            margin: 0,
            animation: "eyebrow-in 0.5s var(--ease-out-expo) 0.05s both",
          }}
        >
          ✦ Winner ✦
        </p>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: `clamp(2rem, ${vw}vw, ${maxRem}rem)`,
            lineHeight: 0.9,
            margin: "2vh 0 0",
            color: "var(--cream)",
            textShadow: "0 0 60px color-mix(in srgb, var(--gold) 45%, transparent), 0 8px 40px rgba(0,0,0,0.6)",
            animation: "label-sweep 0.6s var(--ease-out-expo) 0.15s both",
            wordBreak: "break-word",
          }}
        >
          {winner}
        </h2>

        <div
          style={{
            marginTop: "5vh",
            display: "flex",
            gap: "1.2rem",
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "eyebrow-in 0.5s var(--ease-out-expo) 0.5s both",
          }}
        >
          <button
            onClick={onSpinAgain}
            className="press"
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 800,
              fontSize: "clamp(1.1rem, 2vw, 1.8rem)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--on-accent)",
              background: "linear-gradient(180deg, var(--cream), var(--gold))",
              border: "none",
              borderRadius: 999,
              padding: "0.9em 2.2em",
              cursor: "pointer",
              boxShadow: "0 18px 50px -12px rgba(0,0,0,0.7)",
              transition: "transform 0.12s var(--ease-out-expo)",
            }}
          >
            Spin Again
          </button>
          <button
            onClick={onClose}
            className="press"
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 700,
              fontSize: "clamp(1.1rem, 2vw, 1.8rem)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--cream)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 999,
              padding: "0.9em 2.2em",
              cursor: "pointer",
              transition: "transform 0.12s var(--ease-out-expo)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder sponsor lockup. To swap in a real sponsor, change SPONSOR_NAME
 * or replace the mark <svg> below with the sponsor's logo.
 */
export const SPONSOR_NAME = "SPONSOR";

export default function SponsorLockup() {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "3.5vh",
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <div
        className="rise-in"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.9em",
          animationDelay: "0.4s",
        }}
      >
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontWeight: 700,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontSize: "clamp(0.7rem, 1vw, 1rem)",
          color: "var(--cream)",
          opacity: 0.55,
        }}
      >
        Presented by
      </span>

      {/* placeholder mark */}
      <svg
        width="clamp(22, 2vw, 34)"
        height="30"
        viewBox="0 0 30 30"
        aria-hidden="true"
        style={{ width: "clamp(22px, 2vw, 34px)", height: "auto", opacity: 0.9 }}
      >
        <defs>
          <linearGradient id="sponsorMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--cream)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <path
          d="M15 1 L19 11 L29 15 L19 19 L15 29 L11 19 L1 15 L11 11 Z"
          fill="url(#sponsorMark)"
        />
      </svg>

      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.1rem, 1.9vw, 2rem)",
          letterSpacing: "0.06em",
          color: "var(--gold)",
          lineHeight: 1,
        }}
      >
        {SPONSOR_NAME}
      </span>
      </div>
    </div>
  );
}

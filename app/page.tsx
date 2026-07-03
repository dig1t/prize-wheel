"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PrizeWheel from "@/components/PrizeWheel";
import SettingsPanel from "@/components/SettingsPanel";
import SponsorLockup from "@/components/SponsorLockup";
import WinnerOverlay from "@/components/WinnerOverlay";
import {
  DEFAULT_CONFIG,
  getWinnerIndex,
  loadConfig,
  loadEntries,
  saveConfig,
  saveEntries,
  type WheelConfig,
} from "@/lib/wheel";
import { applyTheme, DEFAULT_THEME, loadTheme, saveTheme, type Theme } from "@/lib/theme";

export default function Home() {
  const [entries, setEntries] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [config, setConfig] = useState<WheelConfig>(DEFAULT_CONFIG);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [centered, setCentered] = useState(false);

  const rotationRef = useRef(0);
  const pendingWinner = useRef<string>("");
  const wheelBoxRef = useRef<HTMLDivElement>(null);
  const kickRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  // hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setEntries(loadEntries());
    setConfig(loadConfig());
    const t = loadTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);
  }, []);

  const spin = useCallback(() => {
    if (spinning || settingsOpen || entries.length === 0) return;
    setWinner(null);
    setHasSpun(true);
    setCentered(true);
    const count = entries.length;
    const revolutions = 4 + Math.floor(Math.random() * 5); // 4–8 full turns
    const offset = Math.random() * 360;
    const next = rotationRef.current + revolutions * 360 + offset;
    rotationRef.current = next;
    pendingWinner.current = entries[getWinnerIndex(next, count)];
    setRotation(next);
    setSpinning(true);
  }, [spinning, settingsOpen, entries]);

  // Spin finished: hold the centered wheel for a beat, then reveal the winner
  // while the wheel glides back to its corner behind the overlay. `spinning`
  // stays true through the hold so re-triggers are ignored until the reveal.
  const handleSpinEnd = useCallback(() => {
    if (!spinning) return;
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => {
      setSpinning(false);
      setWinner(pendingWinner.current);
      setCentered(false);
    }, 1000);
  }, [spinning]);

  // Pointer "clacker" kick: while spinning, sample the wheel's live rotation
  // each frame from its composited transform and fire a short GPU-only kick
  // whenever a segment boundary sweeps past the pointer. If crossings arrive
  // faster than the kick animation (many segments, early in the spin), the
  // extra crossings are skipped so the pointer never stutters.
  useEffect(() => {
    if (!spinning) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wheelEl = wheelBoxRef.current?.querySelector<HTMLElement>(".wheel-spin");
    const kickEl = kickRef.current;
    if (!wheelEl || !kickEl) return;

    const seg = 360 / Math.max(entries.length, 1);
    let prevAngle: number | null = null;
    let unwrapped = 0;
    let raf = 0;

    const tick = () => {
      const t = getComputedStyle(wheelEl).transform;
      if (t && t !== "none") {
        const m = t.match(/matrix\(([-\d.e]+),\s*([-\d.e]+)/);
        if (m) {
          const angle = (Math.atan2(parseFloat(m[2]), parseFloat(m[1])) * 180) / Math.PI;
          if (prevAngle !== null) {
            let d = angle - prevAngle;
            if (d < -180) d += 360;
            if (d > 180) d -= 360;
            const before = Math.floor(unwrapped / seg);
            unwrapped += d;
            if (Math.floor(unwrapped / seg) !== before && kickEl.getAnimations().length === 0) {
              kickEl.animate(
                [
                  { transform: "rotate(0deg)" },
                  { transform: "rotate(-9deg)", offset: 0.35 },
                  { transform: "rotate(0deg)" },
                ],
                { duration: 110, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
              );
            }
          }
          prevAngle = angle;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning, entries.length]);

  // spacebar trigger
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (settingsOpen) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      e.preventDefault();
      spin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spin, settingsOpen]);

  const handleSave = (next: string[], nextConfig: WheelConfig) => {
    setEntries(next);
    saveEntries(next);
    setConfig(nextConfig);
    saveConfig(nextConfig);
    setSettingsOpen(false);
    setWinner(null);
  };

  // headline splits into two lines; the second line takes the accent color
  const headlineWords = config.headline.trim().split(/\s+/);
  const headlineSplit = Math.max(1, Math.floor(headlineWords.length / 2));
  const headlineLine1 = headlineWords.slice(0, headlineSplit).join(" ");
  const headlineLine2 = headlineWords.slice(headlineSplit).join(" ");

  const zoom = config.zoom;
  // scale that shrinks the corner wheel (230·zoom vmin) to ~88vmin when centered
  const centerScale = 88 / (230 * zoom);

  const handleThemeChange = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  const handleThemeSave = (next: Theme) => {
    handleThemeChange(next);
    saveTheme(next);
  };

  return (
    <main className="stage-rays grain" style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* ===== Backdrop blur while the wheel takes center stage ===== */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 24,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "rgba(6, 4, 12, 0.35)",
          opacity: centered ? 1 : 0,
          visibility: centered ? "visible" : "hidden",
          pointerEvents: "none",
          transition: centered
            ? "opacity 0.45s var(--ease-out-expo)"
            : "opacity 0.45s var(--ease-out-expo), visibility 0s 0.45s",
        }}
      />

      {/* ===== Stage group: wheel + pointer move as one unit. Scaling/translating
           this single composited layer swings the wheel from its corner anchor to
           center stage and back — pointer stays glued to the rim, and the inner
           rotation transition is untouched. ===== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: centered ? 26 : 10,
          transformOrigin: "0% 100%",
          transform: centered
            ? `translate(50vw, -50vh) scale(${centerScale})`
            : "translate(0px, 0px) scale(1)",
          transition: "transform 0.9s var(--ease-out-expo)",
          willChange: centered || spinning ? "transform" : "auto",
          pointerEvents: "none",
        }}
      >
      {/* ===== Wheel anchored at bottom-left corner (quarter visible) ===== */}
      <div
        ref={wheelBoxRef}
        aria-hidden={!mounted}
        style={{
          position: "fixed",
          left: 0,
          top: "100vh",
          width: `${230 * zoom}vmin`,
          height: `${230 * zoom}vmin`,
          transform: "translate(-50%, -50%)",
          zIndex: 1,
        }}
      >
        {mounted && (
          <PrizeWheel
            entries={entries}
            rotation={rotation}
            spinning={spinning}
            segmentColors={theme.segmentColors}
            onSpinEnd={handleSpinEnd}
          />
        )}
      </div>

      {/* ===== Fixed pointer sitting on the rim of the visible arc ===== */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: `${86.3 * zoom}vmin`,
          top: `calc(100vh - ${49.8 * zoom}vmin)`,
          transform: "translate(-50%, -50%) rotate(150deg)",
          transformOrigin: "center",
          zIndex: 30,
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))",
        }}
      >
        {/* kick layer: rotates a few degrees around the pivot on each segment crossing */}
        <div
          ref={kickRef}
          style={{ transformOrigin: "22.7% 50%", willChange: spinning ? "transform" : "auto" }}
        >
        <svg width="150" height="120" viewBox="0 0 150 120" style={{ display: "block" }}>
          <defs>
            <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--cream)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          <path
            d="M148 60 L36 14 Q10 24 10 60 Q10 96 36 106 Z"
            fill="url(#ptr)"
            stroke="var(--on-accent)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <circle cx="34" cy="60" r="12" fill="var(--on-accent)" />
        </svg>
        </div>
      </div>
      </div>

      {/* ===== Headline + controls (right side, clear of the wheel) ===== */}
      <section
        style={{
          position: "relative",
          zIndex: 20,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          textAlign: "right",
          padding: "6vh 6vw",
          pointerEvents: "none",
        }}
      >
        <p
          className="rise-in"
          style={{
            margin: 0,
            fontWeight: 800,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            fontSize: "clamp(0.9rem, 1.6vw, 1.5rem)",
            color: "var(--gold)",
            animationDelay: "0.05s",
          }}
        >
          Step Right Up
        </p>
        <h1
          className="rise-in"
          style={{
            margin: "1.5vh 0 0",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(4rem, 12vw, 13rem)",
            lineHeight: 0.85,
            color: "var(--cream)",
            textShadow: "0 0 70px rgba(255,207,92,0.35)",
            animationDelay: "0.15s",
          }}
        >
          {headlineLine1}
          {headlineLine2 && (
            <>
              <br />
              <span style={{ color: "var(--gold)" }}>{headlineLine2}</span>
            </>
          )}
        </h1>
        {/* Subtitle: entrance animation lives on the wrapper; the inner p owns
            the one-way exit transition so the two never fight. */}
        <div className="rise-in" style={{ animationDelay: "0.25s" }}>
          <p
            aria-hidden={hasSpun}
            style={{
              margin: "2.5vh 0 0",
              maxWidth: "22ch",
              fontSize: "clamp(1rem, 1.7vw, 1.7rem)",
              lineHeight: 1.4,
              opacity: hasSpun ? 0 : 0.72,
              transform: hasSpun ? "translateY(-14px)" : "translateY(0)",
              transition:
                "opacity 0.5s var(--ease-out-expo), transform 0.5s var(--ease-out-expo)",
            }}
          >
            Tap the button or hit the spacebar and watch the wheel decide your fate.
          </p>
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className={`press ${spinning ? "" : "cta-idle"}`}
          style={{
            pointerEvents: "auto",
            marginTop: "4.5vh",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 4rem)",
            letterSpacing: "0.04em",
            color: "var(--on-accent)",
            background: spinning
              ? "linear-gradient(180deg, color-mix(in srgb, var(--cream) 70%, #666), color-mix(in srgb, var(--gold) 70%, #666))"
              : "linear-gradient(180deg, var(--cream), var(--gold))",
            border: "none",
            borderRadius: 999,
            padding: "0.5em 1.4em",
            cursor: spinning ? "default" : "pointer",
            transition: "transform 0.12s var(--ease-out-expo)",
          }}
        >
          {spinning ? "Spinning…" : "SPIN"}
        </button>
      </section>

      {/* ===== Subtle settings button (corner) ===== */}
      <button
        onClick={() => setSettingsOpen(true)}
        aria-label="Edit prizes"
        style={{
          position: "fixed",
          top: "1.4rem",
          right: "1.4rem",
          zIndex: 45,
          width: 52,
          height: 52,
          display: "grid",
          placeItems: "center",
          borderRadius: 14,
          color: "var(--cream)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          opacity: 0.35,
          cursor: "pointer",
          transition: "opacity 0.2s var(--ease-out-expo)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <SponsorLockup />

      {winner && (
        <WinnerOverlay
          winner={winner}
          onSpinAgain={() => {
            setWinner(null);
            requestAnimationFrame(() => spin());
          }}
          onClose={() => setWinner(null)}
        />
      )}

      <SettingsPanel
        open={settingsOpen}
        entries={entries}
        theme={theme}
        config={config}
        onSave={handleSave}
        onThemeChange={handleThemeChange}
        onThemeSave={handleThemeSave}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}

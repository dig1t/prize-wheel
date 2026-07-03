"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CONFIG,
  DEFAULT_ENTRIES,
  MAX_SPIN_MS,
  MAX_ZOOM,
  MIN_SPIN_MS,
  MIN_ZOOM,
  segmentColor,
  type WheelConfig,
} from "@/lib/wheel";
import { PRESETS, type Theme } from "@/lib/theme";

type Props = {
  open: boolean;
  entries: string[];
  theme: Theme;
  config: WheelConfig;
  onSave: (entries: string[], config: WheelConfig) => void;
  onThemeChange: (theme: Theme) => void;
  onThemeSave: (theme: Theme) => void;
  onClose: () => void;
};

const THEME_FIELDS: { key: keyof Theme; label: string }[] = [
  { key: "ink", label: "Background" },
  { key: "ink2", label: "Background accent" },
  { key: "glow", label: "Background glow" },
  { key: "gold", label: "Primary accent" },
  { key: "goldDeep", label: "Primary deep" },
  { key: "hot", label: "Highlight" },
  { key: "cream", label: "Text" },
  { key: "onAccent", label: "Text on buttons" },
  { key: "confetti1", label: "Confetti 1" },
  { key: "confetti2", label: "Confetti 2" },
  { key: "confetti3", label: "Confetti 3" },
];

export default function SettingsPanel({
  open,
  entries,
  theme,
  config,
  onSave,
  onThemeChange,
  onThemeSave,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<string[]>(entries);
  const [configDraft, setConfigDraft] = useState<WheelConfig>(config);
  const [tab, setTab] = useState<"prizes" | "design">("prizes");
  const addRef = useRef<HTMLInputElement>(null);
  const themeSnapshot = useRef<Theme>(theme);

  useEffect(() => {
    if (open) {
      setDraft(entries);
      setConfigDraft(config);
      themeSnapshot.current = theme;
    }
    // theme intentionally omitted: snapshot only on open, not on live edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entries, config]);

  const cancel = () => {
    onThemeChange(themeSnapshot.current);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  if (!open) return null;

  const commit = () => {
    const clean = draft.map((s) => s.trim()).filter(Boolean);
    onSave(clean.length ? clean : DEFAULT_ENTRIES, {
      headline: configDraft.headline.trim() || DEFAULT_CONFIG.headline,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, configDraft.zoom)),
      spinMs: Math.min(MAX_SPIN_MS, Math.max(MIN_SPIN_MS, configDraft.spinMs)),
      autoClose: configDraft.autoClose,
    });
    onThemeSave(theme);
  };

  const update = (i: number, val: string) =>
    setDraft((d) => d.map((v, idx) => (idx === i ? val : v)));
  const remove = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));
  const add = () => {
    setDraft((d) => [...d, ""]);
    requestAnimationFrame(() => addRef.current?.focus());
  };

  const setColor = (key: keyof Theme, value: string) =>
    onThemeChange({ ...theme, [key]: value });
  const setSegment = (i: number, value: string) =>
    onThemeChange({
      ...theme,
      segmentColors: theme.segmentColors.map((c, idx) => (idx === i ? value : c)),
    });

  const tabBtn = (id: "prizes" | "design", label: string) => (
    <button
      onClick={() => setTab(id)}
      style={{
        fontFamily: "var(--font-ui)",
        fontWeight: 700,
        fontSize: "0.9rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: tab === id ? "var(--gold)" : "var(--cream)",
        opacity: tab === id ? 1 : 0.5,
        background: "transparent",
        border: "none",
        borderBottom: tab === id ? "2px solid var(--gold)" : "2px solid transparent",
        padding: "0.6rem 0.2rem",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={cancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "grid",
        placeItems: "center",
        background: "rgba(6,4,12,0.6)",
        backdropFilter: "blur(6px)",
        animation: "overlay-fade 0.3s var(--ease-out-expo) forwards",
        padding: "4vh 4vw",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise-in"
        style={{
          width: "min(560px, 100%)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, var(--ink-2), var(--ink))",
          border: "1px solid color-mix(in srgb, var(--gold) 22%, transparent)",
          borderRadius: 24,
          boxShadow: "0 40px 120px -30px rgba(0,0,0,0.85)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.6rem 1.8rem 0",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-ui)",
              fontWeight: 800,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontSize: "0.8rem",
              color: "var(--gold)",
            }}
          >
            Settings
          </p>
          <h2
            style={{
              margin: "0.3rem 0 0",
              fontFamily: "var(--font-display)",
              fontSize: "2.2rem",
              color: "var(--cream)",
            }}
          >
            {tab === "prizes" ? "Wheel Entries" : "Design"}
          </h2>
          <div style={{ display: "flex", gap: "1.4rem", marginTop: "0.6rem" }}>
            {tabBtn("prizes", "Prizes")}
            {tabBtn("design", "Design")}
          </div>
        </div>

        {tab === "prizes" ? (
          <div style={{ overflowY: "auto", padding: "1rem 1.4rem", flex: 1 }}>
            {draft.map((val, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.6rem" }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 5,
                    flexShrink: 0,
                    background: segmentColor(i, theme.segmentColors),
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.12)",
                  }}
                />
                <input
                  ref={i === draft.length - 1 ? addRef : undefined}
                  value={val}
                  placeholder="Prize name…"
                  onChange={(e) => update(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") add();
                  }}
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-ui)",
                    fontSize: "1.05rem",
                    color: "var(--cream)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: "0.7rem 0.9rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => remove(i)}
                  aria-label={`Remove ${val || "entry"}`}
                  className="press"
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    color: "var(--hot)",
                    background: "color-mix(in srgb, var(--hot) 12%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--hot) 28%, transparent)",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={add}
              className="press"
              style={{
                width: "100%",
                marginTop: "0.4rem",
                padding: "0.8rem",
                borderRadius: 12,
                fontFamily: "var(--font-ui)",
                fontWeight: 700,
                color: "var(--gold)",
                background: "transparent",
                border: "1.5px dashed color-mix(in srgb, var(--gold) 40%, transparent)",
                cursor: "pointer",
              }}
            >
              + Add prize
            </button>
          </div>
        ) : (
          <div style={{ overflowY: "auto", padding: "1rem 1.4rem", flex: 1 }}>
            {/* headline */}
            <p style={{ margin: "0.2rem 0 0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>
              Headline
            </p>
            <input
              value={configDraft.headline}
              placeholder={DEFAULT_CONFIG.headline}
              onChange={(e) => setConfigDraft((c) => ({ ...c, headline: e.target.value }))}
              aria-label="Headline text"
              style={{
                width: "100%",
                fontFamily: "var(--font-ui)",
                fontSize: "1.05rem",
                color: "var(--cream)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "0.7rem 0.9rem",
                outline: "none",
                marginBottom: "1.2rem",
              }}
            />

            {/* wheel zoom */}
            <p style={{ margin: "0 0 0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>
              Wheel size · {Math.round(configDraft.zoom * 100)}%
            </p>
            <input
              type="range"
              min={MIN_ZOOM * 100}
              max={MAX_ZOOM * 100}
              step={5}
              value={Math.round(configDraft.zoom * 100)}
              onChange={(e) =>
                setConfigDraft((c) => ({ ...c, zoom: Number(e.target.value) / 100 }))
              }
              aria-label="Wheel size"
              style={{
                width: "100%",
                accentColor: "var(--gold)",
                marginBottom: "1.4rem",
                cursor: "pointer",
              }}
            />

            {/* spin speed */}
            <p style={{ margin: "0 0 0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>
              Spin duration · {(configDraft.spinMs / 1000).toFixed(1)}s
            </p>
            <input
              type="range"
              min={MIN_SPIN_MS}
              max={MAX_SPIN_MS}
              step={200}
              value={configDraft.spinMs}
              onChange={(e) => setConfigDraft((c) => ({ ...c, spinMs: Number(e.target.value) }))}
              aria-label="Spin duration"
              style={{
                width: "100%",
                accentColor: "var(--gold)",
                marginBottom: "1.4rem",
                cursor: "pointer",
              }}
            />

            {/* auto-close winner screen */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                marginBottom: "1.4rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={configDraft.autoClose}
                onChange={(e) => setConfigDraft((c) => ({ ...c, autoClose: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: "var(--gold)", cursor: "pointer" }}
              />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.95rem", color: "var(--cream)" }}>
                Auto-close winner screen
              </span>
            </label>

            {/* presets */}
            <p style={{ margin: "0.2rem 0 0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>
              Presets
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => onThemeChange(p.theme)}
                  className="press"
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--cream)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 999,
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${p.theme.gold} 50%, ${p.theme.ink} 50%)`,
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.25)",
                    }}
                  />
                  {p.name}
                </button>
              ))}
            </div>

            {/* theme colors */}
            <p style={{ margin: "0 0 0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>Colors</p>
            {THEME_FIELDS.map(({ key, label }) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  marginBottom: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="color"
                  value={theme[key] as string}
                  onChange={(e) => setColor(key, e.target.value)}
                  style={{
                    width: 40,
                    height: 32,
                    padding: 0,
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 8,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.95rem", color: "var(--cream)" }}>
                  {label}
                </span>
              </label>
            ))}

            {/* segment colors */}
            <p style={{ margin: "1.2rem 0 0.5rem", opacity: 0.6, fontSize: "0.85rem" }}>
              Wheel segment colors {theme.segmentColors.length === 0 && "· automatic rainbow"}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {theme.segmentColors.map((c, i) => (
                <span key={i} style={{ position: "relative", display: "inline-flex" }}>
                  <input
                    type="color"
                    value={c}
                    aria-label={`Segment color ${i + 1}`}
                    onChange={(e) => setSegment(i, e.target.value)}
                    style={{
                      width: 40,
                      height: 32,
                      padding: 0,
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 8,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  />
                  <button
                    onClick={() =>
                      onThemeChange({
                        ...theme,
                        segmentColors: theme.segmentColors.filter((_, idx) => idx !== i),
                      })
                    }
                    aria-label={`Remove segment color ${i + 1}`}
                    style={{
                      position: "absolute",
                      top: -7,
                      right: -7,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      color: "var(--cream)",
                      background: "var(--ink)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      fontSize: "0.7rem",
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() =>
                  onThemeChange({ ...theme, segmentColors: [...theme.segmentColors, "#888888"] })
                }
                className="press"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--gold)",
                  background: "transparent",
                  border: "1.5px dashed color-mix(in srgb, var(--gold) 40%, transparent)",
                  borderRadius: 8,
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                }}
              >
                + Add
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.8rem",
            padding: "1.2rem 1.4rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => {
              if (tab === "prizes") {
                setDraft(DEFAULT_ENTRIES);
              } else {
                onThemeChange(PRESETS[0].theme);
                setConfigDraft(DEFAULT_CONFIG);
              }
            }}
            className="press"
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              color: "var(--cream)",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "0.7rem 1.2rem",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <span style={{ flex: 1 }} />
          <button
            onClick={cancel}
            className="press"
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              color: "var(--cream)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "0.7rem 1.4rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={commit}
            className="press"
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 800,
              color: "var(--on-accent)",
              background: "linear-gradient(180deg, var(--cream), var(--gold))",
              border: "none",
              borderRadius: 999,
              padding: "0.7rem 1.8rem",
              cursor: "pointer",
              boxShadow: "0 10px 30px -8px color-mix(in srgb, var(--gold) 50%, transparent)",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

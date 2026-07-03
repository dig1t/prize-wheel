export const THEME_STORAGE_KEY = "prize-wheel.theme.v1";

export type Theme = {
  /** page background */
  ink: string;
  /** secondary background (gradient top) */
  ink2: string;
  /** primary accent (buttons, rim, headline) */
  gold: string;
  /** deeper accent shade */
  goldDeep: string;
  /** highlight / secondary accent (bulbs, delete) */
  hot: string;
  /** main text */
  cream: string;
  /** text on accent-colored buttons + dark wheel rings */
  onAccent: string;
  /** third background glow tint */
  glow: string;
  /** extra confetti colors */
  confetti1: string;
  confetti2: string;
  confetti3: string;
  /** custom segment colors; empty = automatic rainbow */
  segmentColors: string[];
};

export const DEFAULT_THEME: Theme = {
  ink: "#0b0713",
  ink2: "#150b26",
  gold: "#ffcf5c",
  goldDeep: "#f5a623",
  hot: "#ff3d78",
  cream: "#fff7ea",
  onAccent: "#1a1030",
  glow: "#7850ff",
  confetti1: "#5ce1e6",
  confetti2: "#a06bff",
  confetti3: "#7dff9b",
  segmentColors: [],
};

/** Palette pulled from @larotonda_bychefluiscorrea — charcoal, burgundy wine, champagne gold, cream. */
export const LA_ROTONDA_THEME: Theme = {
  ink: "#121014",
  ink2: "#2a161d",
  gold: "#c99b5f",
  goldDeep: "#a5763a",
  hot: "#92304d",
  cream: "#f3e9dc",
  onAccent: "#1d1216",
  glow: "#6e2340",
  confetti1: "#6e2340",
  confetti2: "#c99b5f",
  confetti3: "#f3e9dc",
  segmentColors: ["#6e2340", "#c99b5f", "#472029", "#92304d", "#2e2228", "#a5763a"],
};

export const PRESETS: { name: string; theme: Theme }[] = [
  { name: "Classic", theme: DEFAULT_THEME },
  { name: "La Rotonda", theme: LA_ROTONDA_THEME },
];

export function applyTheme(t: Theme): void {
  if (typeof document === "undefined") return;
  const s = document.documentElement.style;
  s.setProperty("--ink", t.ink);
  s.setProperty("--ink-2", t.ink2);
  s.setProperty("--gold", t.gold);
  s.setProperty("--gold-deep", t.goldDeep);
  s.setProperty("--hot", t.hot);
  s.setProperty("--cream", t.cream);
  s.setProperty("--on-accent", t.onAccent);
  s.setProperty("--glow", t.glow);
  s.setProperty("--confetti-1", t.confetti1);
  s.setProperty("--confetti-2", t.confetti2);
  s.setProperty("--confetti-3", t.confetti3);
}

export function loadTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_THEME;
}

export function saveTheme(t: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(t));
  } catch {
    /* storage may be unavailable; ignore */
  }
}

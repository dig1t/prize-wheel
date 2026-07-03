export const STORAGE_KEY = "prize-wheel.entries.v1";
export const CONFIG_KEY = "prize-wheel.config.v1";

export type WheelConfig = {
  /** headline shown beside the wheel */
  headline: string;
  /** wheel scale multiplier */
  zoom: number;
  /** spin duration in milliseconds */
  spinMs: number;
  /** auto-dismiss the winner screen after a beat */
  autoClose: boolean;
};

export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 1.4;
export const MIN_SPIN_MS = 2000;
export const MAX_SPIN_MS = 10000;
/** delay before the winner screen auto-closes, when enabled */
export const AUTO_CLOSE_MS = 5000;

export const DEFAULT_CONFIG: WheelConfig = {
  headline: "SPIN TO WIN",
  zoom: 1,
  spinMs: 5600,
  autoClose: false,
};

export function loadConfig(): WheelConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<WheelConfig>;
    const headline =
      typeof parsed.headline === "string" && parsed.headline.trim()
        ? parsed.headline.trim()
        : DEFAULT_CONFIG.headline;
    const zoom =
      typeof parsed.zoom === "number" && Number.isFinite(parsed.zoom)
        ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parsed.zoom))
        : DEFAULT_CONFIG.zoom;
    const spinMs =
      typeof parsed.spinMs === "number" && Number.isFinite(parsed.spinMs)
        ? Math.min(MAX_SPIN_MS, Math.max(MIN_SPIN_MS, parsed.spinMs))
        : DEFAULT_CONFIG.spinMs;
    const autoClose = typeof parsed.autoClose === "boolean" ? parsed.autoClose : DEFAULT_CONFIG.autoClose;
    return { headline, zoom, spinMs, autoClose };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: WheelConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* storage may be unavailable; ignore */
  }
}

/**
 * Fixed pointer direction, measured clockwise from due-east (screen space, y-down).
 * The wheel center is anchored at the viewport's bottom-left corner, so the visible
 * quarter is the upper-right quadrant. 330deg points north-east into that quadrant —
 * the same direction the on-screen pointer graphic sits on the rim.
 */
export const POINTER_ANGLE = 330;

export const DEFAULT_ENTRIES: string[] = [
  "Free Coffee",
  "10% Off",
  "T-Shirt",
  "Sticker Pack",
  "Try Again",
  "$25 Gift Card",
  "Tote Bag",
  "Grand Prize",
];

/**
 * Segment color: cycles a custom palette when provided, otherwise a vibrant,
 * evenly-distinct golden-angle hue walk so neighbouring segments never collide.
 */
export function segmentColor(index: number, palette?: string[]): string {
  if (palette && palette.length) return palette[index % palette.length];
  const hue = (index * 137.508) % 360;
  const light = index % 2 === 0 ? 54 : 46;
  return `hsl(${hue.toFixed(1)} 74% ${light}%)`;
}

/**
 * Given the wheel's final rotation (deg, clockwise) and the entry count,
 * return the index of the segment sitting under the fixed pointer.
 *
 * Segment i occupies local angles [i*seg, (i+1)*seg) clockwise from east.
 * A feature drawn at local angle a appears at screen angle a + rotation,
 * so the entry under screen-angle POINTER_ANGLE has local angle
 * (POINTER_ANGLE - rotation).
 */
export function getWinnerIndex(rotation: number, count: number): number {
  if (count <= 0) return 0;
  const seg = 360 / count;
  const local = (((POINTER_ANGLE - rotation) % 360) + 360) % 360;
  return Math.floor(local / seg) % count;
}

export function loadEntries(): string[] {
  if (typeof window === "undefined") return DEFAULT_ENTRIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENTRIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean);
      return clean.length ? clean : DEFAULT_ENTRIES;
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_ENTRIES;
}

export function saveEntries(entries: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage may be unavailable; ignore */
  }
}

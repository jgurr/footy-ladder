/**
 * Footy Ladder Theme System
 *
 * Design decisions:
 * - Typography: Mono for numbers, sans for text
 * - Effects: Subtle scanlines (optional)
 * - Themes: Blues, Maroons, Kiwis, Aussies
 */

// All 17 NRL teams with official colors (kept for team flags)
export const TEAM_COLORS: Record<string, { name: string; primary: string; secondary: string }> = {
  bri: { name: "Broncos", primary: "#6B2C35", secondary: "#FDB813" },
  can: { name: "Raiders", primary: "#00A651", secondary: "#FFFFFF" },
  cby: { name: "Bulldogs", primary: "#005BAC", secondary: "#FFFFFF" },
  cro: { name: "Sharks", primary: "#00A8E8", secondary: "#000000" },
  dol: { name: "Dolphins", primary: "#C8102E", secondary: "#FDB813" },
  gld: { name: "Titans", primary: "#00A8E8", secondary: "#FDB813" },
  man: { name: "Sea Eagles", primary: "#6B2C35", secondary: "#FFFFFF" },
  mel: { name: "Storm", primary: "#452C7C", secondary: "#FDB813" },
  new: { name: "Knights", primary: "#005BAC", secondary: "#C8102E" },
  nql: { name: "Cowboys", primary: "#002B5C", secondary: "#FDB813" },
  nzl: { name: "Warriors", primary: "#000000", secondary: "#C8102E" },
  par: { name: "Eels", primary: "#005BAC", secondary: "#FDB813" },
  pen: { name: "Panthers", primary: "#000000", secondary: "#FF69B4" },
  sou: { name: "Rabbitohs", primary: "#00A651", secondary: "#C8102E" },
  sti: { name: "Dragons", primary: "#C8102E", secondary: "#FFFFFF" },
  syd: { name: "Roosters", primary: "#00205B", secondary: "#C8102E" },
  wst: { name: "Tigers", primary: "#F57F20", secondary: "#000000" },
};

// Theme palettes
export const PALETTES = {
  dark: {
    name: "Dark",
    bg: "#0f0f0f",
    text: "#e5e5e5",
    textMuted: "#888888",
    accent: "#ffffff",
    highlight: "#00A8E8",
    positive: "#4ade80",
    negative: "#f87171",
    border: "rgba(255,255,255,0.1)",
  },
  blues: {
    name: "Blues",
    bg: "#0a1628",
    text: "#e0e8f0",
    textMuted: "#8898a8",
    accent: "#00A8E8",
    highlight: "#FFFFFF",
    positive: "#00A8E8",
    negative: "#ff6b6b",
    border: "rgba(0,168,232,0.2)",
  },
  maroons: {
    name: "Maroons",
    bg: "#1a0a0a",
    text: "#f0e0e0",
    textMuted: "#a88888",
    accent: "#6B2C35",
    highlight: "#FDB813",
    positive: "#FDB813",
    negative: "#ff6b6b",
    border: "rgba(107,44,53,0.3)",
  },
  kiwis: {
    name: "Kiwis",
    bg: "#0a0a0a",
    text: "#e0e0e0",
    textMuted: "#888888",
    accent: "#FFFFFF",
    highlight: "#C8102E",
    positive: "#FFFFFF",
    negative: "#C8102E",
    border: "rgba(255,255,255,0.1)",
  },
  aussies: {
    name: "Aussies",
    bg: "#0a1a0a",
    text: "#e0f0e0",
    textMuted: "#88a888",
    accent: "#00A651",
    highlight: "#FDB813",
    positive: "#00A651",
    negative: "#ff6b6b",
    border: "rgba(0,166,81,0.2)",
  },
} as const;

export type PaletteKey = keyof typeof PALETTES;

export interface ThemePalette {
  name: string;
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  highlight: string;
  positive: string;
  negative: string;
  border: string;
}

/**
 * Get palette by key
 */
export function getPalette(key: string): ThemePalette {
  return PALETTES[key as PaletteKey] || PALETTES.dark;
}

// Typography configuration
export const TYPOGRAPHY = {
  numbers: "font-mono tabular-nums",
  text: "font-sans",
  heading: "font-sans font-semibold",
} as const;

// Effect intensity levels
export const EFFECTS = {
  subtle: {
    scanlineOpacity: 0.02,
    glowIntensity: "0 0 10px",
    glowOpacity: 0.1,
  },
  medium: {
    scanlineOpacity: 0.05,
    glowIntensity: "0 0 20px",
    glowOpacity: 0.2,
  },
  full: {
    scanlineOpacity: 0.08,
    glowIntensity: "0 0 30px",
    glowOpacity: 0.4,
  },
} as const;

export type EffectLevel = keyof typeof EFFECTS;

// CSS custom properties for theme
export function getThemeCSSVars(palette: ThemePalette): Record<string, string> {
  return {
    "--theme-bg": palette.bg,
    "--theme-text": palette.text,
    "--theme-text-muted": palette.textMuted,
    "--theme-accent": palette.accent,
    "--theme-highlight": palette.highlight,
    "--theme-positive": palette.positive,
    "--theme-negative": palette.negative,
    "--theme-border": palette.border,
  };
}

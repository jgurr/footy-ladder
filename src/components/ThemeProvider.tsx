"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ThemePalette,
  getPalette,
  getThemeCSSVars,
  PALETTES,
  EffectLevel,
  EFFECTS,
  PaletteKey,
} from "@/lib/theme";

interface ThemeContextType {
  palette: ThemePalette;
  paletteKey: PaletteKey;
  effectLevel: EffectLevel;
  setPaletteKey: (key: PaletteKey) => void;
  setEffectLevel: (level: EffectLevel) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Default theme for SSR/prerendering
const defaultTheme: ThemeContextType = {
  palette: PALETTES.dark,
  paletteKey: "dark",
  effectLevel: "subtle",
  setPaletteKey: () => {},
  setEffectLevel: () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default during SSR/prerendering
  if (!context) {
    return defaultTheme;
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>("dark");
  const [effectLevel, setEffectLevel] = useState<EffectLevel>("subtle");
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("footy-palette-key") as PaletteKey | null;
    const savedEffects = localStorage.getItem("footy-effects") as EffectLevel | null;

    if (savedKey && PALETTES[savedKey]) setPaletteKey(savedKey);
    if (savedEffects) setEffectLevel(savedEffects);
    setMounted(true);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("footy-palette-key", paletteKey);
    localStorage.setItem("footy-effects", effectLevel);
  }, [paletteKey, effectLevel, mounted]);

  const palette = getPalette(paletteKey);
  const effects = EFFECTS[effectLevel];

  // Apply CSS variables to document
  useEffect(() => {
    if (!mounted) return;
    const vars = getThemeCSSVars(palette);
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [palette, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div
        style={{
          background: PALETTES.dark.bg,
          color: PALETTES.dark.text,
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        palette,
        paletteKey,
        effectLevel,
        setPaletteKey,
        setEffectLevel,
      }}
    >
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          background: palette.bg,
          color: palette.text,
        }}
      >
        {/* Scanline overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,${effects.scanlineOpacity}) 2px,
              rgba(255,255,255,${effects.scanlineOpacity}) 4px
            )`,
          }}
        />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

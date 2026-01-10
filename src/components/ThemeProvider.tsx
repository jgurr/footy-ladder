"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ThemePalette,
  getPalette,
  getThemeCSSVars,
  REGION_PALETTES,
  EffectLevel,
  EFFECTS,
} from "@/lib/theme";

interface ThemeContextType {
  palette: ThemePalette;
  paletteType: "region" | "team";
  paletteKey: string;
  effectLevel: EffectLevel;
  setPaletteType: (type: "region" | "team") => void;
  setPaletteKey: (key: string) => void;
  setEffectLevel: (level: EffectLevel) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Default theme for SSR/prerendering
const defaultTheme: ThemeContextType = {
  palette: REGION_PALETTES.dark,
  paletteType: "region",
  paletteKey: "dark",
  effectLevel: "subtle",
  setPaletteType: () => {},
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
  const [paletteType, setPaletteType] = useState<"region" | "team">("region");
  const [paletteKey, setPaletteKey] = useState("dark");
  const [effectLevel, setEffectLevel] = useState<EffectLevel>("subtle");
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedType = localStorage.getItem("footy-palette-type") as "region" | "team" | null;
    const savedKey = localStorage.getItem("footy-palette-key");
    const savedEffects = localStorage.getItem("footy-effects") as EffectLevel | null;

    if (savedType) setPaletteType(savedType);
    if (savedKey) setPaletteKey(savedKey);
    if (savedEffects) setEffectLevel(savedEffects);
    setMounted(true);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("footy-palette-type", paletteType);
    localStorage.setItem("footy-palette-key", paletteKey);
    localStorage.setItem("footy-effects", effectLevel);
  }, [paletteType, paletteKey, effectLevel, mounted]);

  const palette = getPalette(paletteType, paletteKey);
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
          background: REGION_PALETTES.dark.bg,
          color: REGION_PALETTES.dark.text,
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
        paletteType,
        paletteKey,
        effectLevel,
        setPaletteType,
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

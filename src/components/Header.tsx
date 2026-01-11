"use client";

import { useTheme } from "./ThemeProvider";
import { PALETTES, PaletteKey } from "@/lib/theme";

export function Header() {
  const { palette, paletteKey, setPaletteKey } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        borderColor: palette.border,
        background: `${palette.bg}ee`,
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: palette.accent }}
          >
            Footy Ladder
          </h1>
          <p className="text-sm" style={{ color: palette.textMuted }}>
            The ladder that actually makes sense
          </p>
        </div>

        <select
          value={paletteKey}
          onChange={(e) => setPaletteKey(e.target.value as PaletteKey)}
          className="rounded-lg px-3 py-2 text-sm font-medium"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: `1px solid ${palette.border}`,
            color: palette.text,
          }}
        >
          {Object.entries(PALETTES).map(([key, p]) => (
            <option key={key} value={key}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

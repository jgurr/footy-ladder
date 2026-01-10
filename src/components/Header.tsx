"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { REGION_PALETTES, TEAM_COLORS } from "@/lib/theme";

export function Header() {
  const { palette, paletteType, paletteKey, setPaletteType, setPaletteKey } = useTheme();
  const [showPalettePicker, setShowPalettePicker] = useState(false);

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

        <div className="relative">
          <button
            onClick={() => setShowPalettePicker(!showPalettePicker)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/10"
            style={{ border: `1px solid ${palette.border}` }}
          >
            <div
              className="h-5 w-5 rounded-full"
              style={{
                background:
                  paletteType === "team"
                    ? `linear-gradient(135deg, ${palette.accent} 50%, ${palette.highlight} 50%)`
                    : palette.accent,
              }}
            />
            <span className="text-sm">{palette.name}</span>
            <svg
              className="h-4 w-4 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showPalettePicker && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowPalettePicker(false)}
              />
              <div
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border p-4 shadow-xl"
                style={{
                  background: palette.bg,
                  borderColor: palette.border,
                }}
              >
                {/* Type Toggle */}
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => {
                      setPaletteType("region");
                      setPaletteKey("dark");
                    }}
                    className={`flex-1 rounded px-3 py-1.5 text-sm transition ${
                      paletteType === "region"
                        ? "bg-white/20"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    Region
                  </button>
                  <button
                    onClick={() => {
                      setPaletteType("team");
                      setPaletteKey("pen");
                    }}
                    className={`flex-1 rounded px-3 py-1.5 text-sm transition ${
                      paletteType === "team"
                        ? "bg-white/20"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    My Team
                  </button>
                </div>

                {paletteType === "region" ? (
                  <div className="space-y-1">
                    {Object.entries(REGION_PALETTES).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setPaletteKey(key);
                          setShowPalettePicker(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left transition ${
                          paletteKey === key
                            ? "bg-white/20"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ background: p.accent }}
                        />
                        {p.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto">
                    {Object.entries(TEAM_COLORS).map(([key, team]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setPaletteKey(key);
                          setShowPalettePicker(false);
                        }}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition ${
                          paletteKey === key
                            ? "bg-white/20"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${team.primary} 50%, ${team.secondary} 50%)`,
                          }}
                        />
                        <span className="truncate">{team.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

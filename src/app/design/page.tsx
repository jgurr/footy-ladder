"use client";

import { useState } from "react";

// Sample ladder data for preview
const SAMPLE_LADDER = [
  { pos: 1, team: "Raiders", code: "CAN", wins: 19, losses: 5, draws: 0, winPct: 79.17, pf: 612, pa: 380, color: "#00A651" },
  { pos: 2, team: "Storm", code: "MEL", wins: 17, losses: 7, draws: 0, winPct: 70.83, pf: 580, pa: 398, color: "#452C7C" },
  { pos: 3, team: "Bulldogs", code: "CBY", wins: 16, losses: 8, draws: 0, winPct: 66.67, pf: 542, pa: 410, color: "#005BAC" },
  { pos: 4, team: "Broncos", code: "BRI", wins: 15, losses: 9, draws: 0, winPct: 62.50, pf: 598, pa: 456, color: "#6B2C35" },
  { pos: 5, team: "Sharks", code: "CRO", wins: 15, losses: 9, draws: 0, winPct: 62.50, pf: 512, pa: 448, color: "#00A8E8" },
];

type ColorPalette = "dark" | "nsw" | "qld" | "nz" | "australia" | string;
type EffectLevel = "subtle" | "medium" | "full";
type Typography = "mono-sans" | "full-mono" | "serif-sans";

// Team colors for personalization
const TEAM_PALETTES: Record<string, { name: string; primary: string; secondary: string }> = {
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

const REGION_PALETTES: Record<string, { name: string; bg: string; text: string; accent: string; highlight: string }> = {
  dark: {
    name: "Dark Mode",
    bg: "#0a0a0a",
    text: "#e0e0e0",
    accent: "#39ff14",
    highlight: "#ffd700",
  },
  nsw: {
    name: "NSW Blues",
    bg: "#0a1628",
    text: "#e0e8f0",
    accent: "#00A8E8",
    highlight: "#FFFFFF",
  },
  qld: {
    name: "QLD Maroons",
    bg: "#1a0a0a",
    text: "#f0e0e0",
    accent: "#6B2C35",
    highlight: "#FDB813",
  },
  nz: {
    name: "New Zealand",
    bg: "#0a0a0a",
    text: "#e0e0e0",
    accent: "#FFFFFF",
    highlight: "#C8102E",
  },
  australia: {
    name: "Australia",
    bg: "#0a1a0a",
    text: "#e0f0e0",
    accent: "#00A651",
    highlight: "#FDB813",
  },
};

function getTeamPalette(teamId: string): { name: string; bg: string; text: string; accent: string; highlight: string } {
  const team = TEAM_PALETTES[teamId];
  if (!team) return REGION_PALETTES.dark;
  return {
    name: team.name,
    bg: "#0a0a0a",
    text: "#e0e0e0",
    accent: team.primary,
    highlight: team.secondary,
  };
}

const FONTS: Record<Typography, { name: string; numbers: string; text: string }> = {
  "mono-sans": {
    name: "Mono Numbers + Sans Text",
    numbers: "font-mono",
    text: "font-sans",
  },
  "full-mono": {
    name: "Full Monospace",
    numbers: "font-mono",
    text: "font-mono",
  },
  "serif-sans": {
    name: "Serif Headers + Sans Body",
    numbers: "font-sans",
    text: "font-serif",
  },
};

export default function DesignPlayground() {
  const [paletteType, setPaletteType] = useState<"region" | "team">("region");
  const [regionPalette, setRegionPalette] = useState<string>("dark");
  const [teamPalette, setTeamPalette] = useState<string>("pen");
  const [effects, setEffects] = useState<EffectLevel>("subtle");
  const [typography, setTypography] = useState<Typography>("mono-sans");

  const colors = paletteType === "team"
    ? getTeamPalette(teamPalette)
    : REGION_PALETTES[regionPalette] || REGION_PALETTES.dark;
  const fonts = FONTS[typography];

  const getEffectStyles = () => {
    switch (effects) {
      case "subtle":
        return {
          filter: "none",
          scanlines: "rgba(255,255,255,0.02)",
          glow: "0 0 10px rgba(57, 255, 20, 0.1)",
        };
      case "medium":
        return {
          filter: "none",
          scanlines: "rgba(255,255,255,0.05)",
          glow: "0 0 20px rgba(57, 255, 20, 0.2)",
        };
      case "full":
        return {
          filter: "contrast(1.1) brightness(1.05)",
          scanlines: "rgba(255,255,255,0.08)",
          glow: "0 0 30px rgba(57, 255, 20, 0.4)",
        };
    }
  };

  const effectStyles = getEffectStyles();

  return (
    <div
      className="min-h-screen p-8 transition-all duration-300"
      style={{
        background: colors.bg,
        color: colors.text,
        filter: effectStyles.filter,
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
            ${effectStyles.scanlines} 2px,
            ${effectStyles.scanlines} 4px
          )`,
        }}
      />

      {/* Controls */}
      <div className="mb-8 rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur">
        <h1 className="mb-6 text-2xl font-bold">Footy Ladder Design Playground</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Color Palette */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
              Color Palette
            </h2>

            {/* Palette Type Toggle */}
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setPaletteType("region")}
                className={`flex-1 rounded px-3 py-1.5 text-sm transition ${
                  paletteType === "region"
                    ? "bg-white/20 ring-2 ring-white/40"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                Region
              </button>
              <button
                onClick={() => setPaletteType("team")}
                className={`flex-1 rounded px-3 py-1.5 text-sm transition ${
                  paletteType === "team"
                    ? "bg-white/20 ring-2 ring-white/40"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                My Team
              </button>
            </div>

            {paletteType === "region" ? (
              <div className="space-y-2">
                {Object.entries(REGION_PALETTES).map(([key, palette]) => (
                  <button
                    key={key}
                    onClick={() => setRegionPalette(key)}
                    className={`flex w-full items-center gap-3 rounded px-4 py-2 text-left transition ${
                      regionPalette === key
                        ? "bg-white/20 ring-2 ring-white/40"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ background: palette.accent }}
                    />
                    {palette.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TEAM_PALETTES).map(([key, team]) => (
                  <button
                    key={key}
                    onClick={() => setTeamPalette(key)}
                    className={`flex items-center gap-2 rounded px-3 py-2 text-left text-sm transition ${
                      teamPalette === key
                        ? "bg-white/20 ring-2 ring-white/40"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
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

          {/* Effects */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
              CRT Effects
            </h2>
            <div className="space-y-2">
              {(["subtle", "medium", "full"] as EffectLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setEffects(level)}
                  className={`block w-full rounded px-4 py-2 text-left capitalize transition ${
                    effects === level
                      ? "bg-white/20 ring-2 ring-white/40"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
              Typography
            </h2>
            <div className="space-y-2">
              {(Object.keys(FONTS) as Typography[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTypography(key)}
                  className={`block w-full rounded px-4 py-2 text-left transition ${
                    typography === key
                      ? "bg-white/20 ring-2 ring-white/40"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {FONTS[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ladder Preview */}
      <div
        className="overflow-hidden rounded-lg border border-white/10"
        style={{ boxShadow: effectStyles.glow }}
      >
        {/* Header */}
        <div
          className="border-b border-white/10 px-6 py-4"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <h2 className={`text-xl font-bold ${fonts.text}`}>
            2025 NRL Ladder
            <span className="ml-3 text-sm font-normal opacity-60">
              After Round 27
            </span>
          </h2>
          <p
            className="mt-1 text-sm opacity-60"
            style={{ color: colors.accent }}
          >
            Ranked by Win Percentage
          </p>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr
              className="text-xs uppercase tracking-wider"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <th className={`px-4 py-3 text-left ${fonts.text}`}>Pos</th>
              <th className={`px-4 py-3 text-left ${fonts.text}`}>Team</th>
              <th className={`px-4 py-3 text-center ${fonts.numbers}`}>W</th>
              <th className={`px-4 py-3 text-center ${fonts.numbers}`}>L</th>
              <th className={`px-4 py-3 text-center ${fonts.numbers}`}>D</th>
              <th
                className={`px-4 py-3 text-right ${fonts.numbers}`}
                style={{ color: colors.accent }}
              >
                Win%
              </th>
              <th className={`px-4 py-3 text-right ${fonts.numbers}`}>PF</th>
              <th className={`px-4 py-3 text-right ${fonts.numbers}`}>PA</th>
              <th className={`px-4 py-3 text-right ${fonts.numbers}`}>+/-</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_LADDER.map((entry, idx) => (
              <tr
                key={entry.code}
                className="border-t border-white/5 transition hover:bg-white/5"
                style={{
                  background:
                    idx === 0
                      ? `linear-gradient(90deg, ${entry.color}20 0%, transparent 100%)`
                      : undefined,
                }}
              >
                <td className={`px-4 py-4 ${fonts.numbers}`}>
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: entry.pos <= 4 ? colors.accent : "transparent",
                      color: entry.pos <= 4 ? "#000" : colors.text,
                      border: entry.pos > 4 ? `1px solid ${colors.text}30` : undefined,
                    }}
                  >
                    {entry.pos}
                  </span>
                </td>
                <td className={`px-4 py-4 ${fonts.text}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ background: entry.color }}
                    />
                    <div>
                      <div className="font-semibold">{entry.team}</div>
                      <div
                        className={`text-xs opacity-50 ${fonts.numbers}`}
                      >
                        {entry.code}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-4 text-center ${fonts.numbers}`}>
                  {entry.wins}
                </td>
                <td className={`px-4 py-4 text-center ${fonts.numbers}`}>
                  {entry.losses}
                </td>
                <td className={`px-4 py-4 text-center ${fonts.numbers}`}>
                  {entry.draws}
                </td>
                <td
                  className={`px-4 py-4 text-right font-bold ${fonts.numbers}`}
                  style={{ color: colors.accent }}
                >
                  {entry.winPct.toFixed(2)}%
                </td>
                <td className={`px-4 py-4 text-right ${fonts.numbers}`}>
                  {entry.pf}
                </td>
                <td className={`px-4 py-4 text-right ${fonts.numbers}`}>
                  {entry.pa}
                </td>
                <td
                  className={`px-4 py-4 text-right ${fonts.numbers}`}
                  style={{
                    color: entry.pf - entry.pa > 0 ? colors.accent : "#ff6b6b",
                  }}
                >
                  {entry.pf - entry.pa > 0 ? "+" : ""}
                  {entry.pf - entry.pa}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Current Selection Summary */}
      <div className="mt-8 rounded-lg border border-white/10 bg-black/30 p-4 text-center">
        <p className="text-sm opacity-60">Current Selection:</p>
        <p className="mt-1 font-mono text-lg">
          {colors.name} / {effects} effects / {fonts.name}
        </p>
        <p className="mt-2 text-xs opacity-40">
          Palette preference will be saved to localStorage
        </p>
      </div>
    </div>
  );
}

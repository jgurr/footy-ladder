"use client";

import type { RunHomeFixture, ScheduleFactor } from "@/lib/run-home";
import { useTheme } from "./ThemeProvider";

const ASSESSMENT_LABELS = {
  favourable: "Favourable",
  even: "Even",
  disadvantage: "Disadvantage",
} as const;

function assessmentColor(factor: ScheduleFactor, muted: string): string {
  if (factor.assessment === "favourable") return "#22c55e";
  if (factor.assessment === "disadvantage") return "#ef4444";
  return muted;
}

export function FixtureDifficulty({ fixture }: { fixture: RunHomeFixture }) {
  const { palette } = useTheme();
  const factors = Object.values(fixture.factors);

  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: palette.border }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase" style={{ color: palette.textMuted }}>
            Difficulty
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums">{fixture.difficulty}</span>
            <span className="text-sm font-semibold" style={{ color: palette.accent }}>
              {fixture.difficultyLabel}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase" style={{ color: palette.textMuted }}>
            Win chance
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums">{fixture.winChance}%</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {factors.map((factor) => (
          <div key={factor.label} className="min-w-0">
            <div className="text-xs uppercase" style={{ color: palette.textMuted }}>
              {factor.label}
            </div>
            <div className="mt-0.5 text-sm font-medium leading-snug">{factor.detail}</div>
            <div
              className="mt-0.5 text-xs font-semibold"
              style={{ color: assessmentColor(factor, palette.textMuted) }}
            >
              {ASSESSMENT_LABELS[factor.assessment]}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed" style={{ color: palette.textMuted }}>
        {fixture.explanation}
      </p>
    </div>
  );
}

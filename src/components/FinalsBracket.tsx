"use client";

import { getTeamLogoSrc } from "@/lib/team-logo";
import type { FinalsData, FinalsMatch } from "@/lib/finals";
import { useTheme } from "./ThemeProvider";

const FINALS_GOLD = "#d7b75b";

function matchCode(match: FinalsMatch): string {
  return match.id.toUpperCase();
}

function formatMatchMeta(match: FinalsMatch): string {
  if (match.status === "live") return "LIVE NOW";
  if (match.status === "final") return match.venue || "FULL TIME";
  if (!match.kickoff) return "DATE · VENUE TBC";

  const kickoff = new Date(match.kickoff);
  const time = kickoff.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${time}${match.venue ? ` · ${match.venue}` : ""}`;
}

function teamLabel(match: FinalsMatch, slotIndex: number, compact: boolean): string {
  const slot = match.slots[slotIndex];
  if (!slot.team) return slot.source.toUpperCase();
  return compact ? slot.team.shortCode : slot.team.name;
}

function SvgMatch({
  match,
  x,
  y,
  width,
  mobile = false,
}: {
  match: FinalsMatch;
  x: number;
  y: number;
  width: number;
  mobile?: boolean;
}) {
  const { palette } = useTheme();
  const height = 100;
  const titleSize = mobile ? 11 : 12;
  const teamSize = mobile ? 12 : 13;
  const meta = formatMatchMeta(match);

  return (
    <g aria-label={`${match.title}: ${teamLabel(match, 0, false)} versus ${teamLabel(match, 1, false)}`}>
      <title>{`${match.title}: ${teamLabel(match, 0, false)} versus ${teamLabel(match, 1, false)}`}</title>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={mobile ? 0 : 8}
        fill={palette.bg}
        stroke={mobile ? "none" : palette.border}
      />
      <line x1={x} y1={y} x2={x + width} y2={y} stroke={palette.border} />
      <line x1={x} y1={y + 34} x2={x + width} y2={y + 34} stroke={palette.border} />
      <line x1={x} y1={y + 82} x2={x + width} y2={y + 82} stroke={palette.border} />
      <line x1={x} y1={y + height} x2={x + width} y2={y + height} stroke={palette.border} />

      <text
        x={x + 8}
        y={y + 14}
        fill={FINALS_GOLD}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize={titleSize}
        fontWeight="700"
        letterSpacing="0.7"
      >
        {matchCode(match)}
      </text>
      <text
        x={x + 8}
        y={y + 28}
        fill={palette.textMuted}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize={mobile ? 8.5 : 9.5}
        letterSpacing="0.35"
      >
        {match.subtitle.toUpperCase()}
      </text>

      {match.slots.map((slot, index) => {
        const rowY = y + 53 + index * 23;
        const logo = slot.team ? getTeamLogoSrc(slot.team.id, 24, "compact") : null;
        const score = slot.score === null ? "—" : String(slot.score);
        const isKnown = Boolean(slot.team);

        return (
          <g key={`${match.id}-${index}`} opacity={isKnown ? 1 : 0.72}>
            {logo ? (
              <image
                href={logo}
                x={x + 7}
                y={rowY - 14}
                width={18}
                height={18}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : (
              <circle
                cx={x + 16}
                cy={rowY - 5}
                r={3}
                fill="none"
                stroke={palette.textMuted}
              />
            )}
            {slot.team && (
              <text
                x={x + 30}
                y={rowY}
                fill={slot.winner ? FINALS_GOLD : palette.textMuted}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize={mobile ? 9 : 10}
              >
                {slot.team.seed}
              </text>
            )}
            <text
              x={x + (slot.team ? 43 : 29)}
              y={rowY}
              fill={slot.winner ? FINALS_GOLD : palette.text}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize={teamSize}
              fontWeight={slot.winner ? "700" : "500"}
            >
              {teamLabel(match, index, mobile)}
            </text>
            <text
              x={x + width - 9}
              y={rowY}
              textAnchor="end"
              fill={slot.winner ? FINALS_GOLD : palette.text}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize={teamSize}
              fontWeight="700"
            >
              {score}
            </text>
          </g>
        );
      })}

      <text
        x={x + 8}
        y={y + 95}
        fill={match.status === "live" ? "#ef4444" : palette.textMuted}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize={mobile ? 7.5 : 8.5}
      >
        {meta.length > (mobile ? 26 : 34) ? `${meta.slice(0, mobile ? 25 : 33)}…` : meta}
      </text>
    </g>
  );
}

function StageLabel({
  x,
  y,
  anchor = "start",
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "middle";
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={FINALS_GOLD}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontSize="12"
      fontWeight="700"
      letterSpacing="1.1"
    >
      {children}
    </text>
  );
}

function HorizontalBracket({ data }: { data: FinalsData }) {
  const { palette } = useTheme();
  const m = data.matches;
  const route = {
    fill: "none",
    stroke: palette.textMuted,
    strokeWidth: 1.35,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const direct = { ...route, stroke: FINALS_GOLD, strokeWidth: 1.6 };

  return (
    <svg
      className="hidden h-auto w-full lg:block"
      viewBox="0 0 900 640"
      role="img"
      aria-label="Horizontal NRL finals bracket"
    >
      <title>Horizontal NRL finals bracket</title>
      <desc>Finals Week One progresses from left to right through the Grand Final. Gold routes show qualifying-final winners advancing directly to preliminary finals.</desc>

      <StageLabel x={10} y={24}>FINALS WEEK 1</StageLabel>
      <StageLabel x={244} y={24}>SEMI FINALS</StageLabel>
      <StageLabel x={478} y={24}>PRELIMINARY FINALS</StageLabel>
      <StageLabel x={716} y={24}>GRAND FINAL</StageLabel>

      {/* Week 1 into semi finals: all routing stays inside the column gutter. */}
      <path d="M184 100 H212 V163 H244" {...route} />
      <path d="M184 240 H226 V187 H244" {...route} />
      <path d="M184 400 H212 V463 H244" {...route} />
      <path d="M184 540 H226 V487 H244" {...route} />

      {/* Qualifying-final winners bypass the semis via the empty outer gutters. */}
      <path d="M184 88 H202 V38 H452 V193 H478" {...direct} />
      <path d="M184 388 H202 V616 H452 V483 H478" {...direct} />

      {/* Semi-final winners cross only in the clear inter-column channel. */}
      <path d="M418 170 H438 V507 H478" {...route} />
      <path d="M418 470 H458 V217 H478" {...route} />

      {/* Preliminary-final winners converge beside, not underneath, the GF node. */}
      <path d="M652 200 H678 V313 H716" {...route} />
      <path d="M652 490 H694 V337 H716" {...route} />

      <SvgMatch match={m.qf1} x={10} y={50} width={174} />
      <SvgMatch match={m.ef1} x={10} y={190} width={174} />
      <SvgMatch match={m.qf2} x={10} y={350} width={174} />
      <SvgMatch match={m.ef2} x={10} y={490} width={174} />
      <SvgMatch match={m.sf1} x={244} y={120} width={174} />
      <SvgMatch match={m.sf2} x={244} y={420} width={174} />
      <SvgMatch match={m.pf1} x={478} y={150} width={174} />
      <SvgMatch match={m.pf2} x={478} y={440} width={174} />
      <SvgMatch match={m.gf} x={716} y={270} width={174} />

      <text
        x="803"
        y="398"
        textAnchor="middle"
        fill={FINALS_GOLD}
        fontFamily="Georgia, serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="1"
      >
        {data.season} PREMIERS
      </text>
      <path d="M803 370 V382" {...direct} />
    </svg>
  );
}

function VerticalBracket({ data }: { data: FinalsData }) {
  const { palette } = useTheme();
  const m = data.matches;
  const route = {
    fill: "none",
    stroke: palette.textMuted,
    strokeWidth: 1.35,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const direct = { ...route, stroke: FINALS_GOLD, strokeWidth: 1.6 };

  return (
    <svg
      className="h-auto w-full lg:hidden"
      viewBox="0 0 360 1140"
      role="img"
      aria-label="Vertical NRL finals bracket"
    >
      <title>Vertical NRL finals bracket</title>
      <desc>Finals Week One progresses downward to the Grand Final. Every connector is routed through the empty gaps between match panels.</desc>

      <StageLabel x={20} y={28}>FINALS WEEK 1</StageLabel>
      <StageLabel x={180} y={402} anchor="middle">SEMI FINALS</StageLabel>
      <StageLabel x={180} y={732} anchor="middle">PRELIMINARY FINALS</StageLabel>
      <StageLabel x={20} y={932}>GRAND FINAL</StageLabel>

      {/* Gold direct-qualification rails live outside the game columns. */}
      <path d="M95 155 V174 H8 V708 H52 V760" {...direct} />
      <path d="M265 155 V182 H352 V716 H308 V760" {...direct} />

      {/* QF losers use the centre gutter while EF winners rise through open space. */}
      <path d="M125 155 V174 H176 V378 H60 V430" {...route} />
      <path d="M235 155 V182 H184 V386 H300 V430" {...route} />
      <path d="M95 320 V354 H130 V430" {...route} />
      <path d="M265 320 V362 H230 V430" {...route} />

      {/* Semi-final crossover happens entirely inside this dedicated connector band. */}
      <path d="M95 530 V566 H174 V676 H308 V760" {...route} />
      <path d="M265 530 V590 H186 V652 H52 V760" {...route} />

      {/* Preliminary-final winners meet in the clear space above the GF. */}
      <path d="M95 860 V888 H138 V960" {...route} />
      <path d="M265 860 V904 H222 V960" {...route} />

      <SvgMatch match={m.qf1} x={20} y={55} width={150} mobile />
      <SvgMatch match={m.qf2} x={190} y={55} width={150} mobile />
      <SvgMatch match={m.ef1} x={20} y={220} width={150} mobile />
      <SvgMatch match={m.ef2} x={190} y={220} width={150} mobile />
      <SvgMatch match={m.sf1} x={20} y={430} width={150} mobile />
      <SvgMatch match={m.sf2} x={190} y={430} width={150} mobile />
      <SvgMatch match={m.pf1} x={20} y={760} width={150} mobile />
      <SvgMatch match={m.pf2} x={190} y={760} width={150} mobile />
      <SvgMatch match={m.gf} x={105} y={960} width={150} mobile />

      <path d="M180 1060 V1090" {...direct} />
      <text
        x="180"
        y="1118"
        textAnchor="middle"
        fill={FINALS_GOLD}
        fontFamily="Georgia, serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="1"
      >
        {data.season} PREMIERS
      </text>
    </svg>
  );
}

export function FinalsBracket({ data }: { data: FinalsData }) {
  const { palette } = useTheme();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: FINALS_GOLD }}>
            {data.mode === "projected" ? "If the season ended now" : "Official finals series"}
          </div>
          <h2 className="mt-1 text-2xl font-bold">{data.season} NRL Finals</h2>
          <p className="mt-1 text-sm" style={{ color: palette.textMuted }}>
            {data.regularSeasonComplete
              ? "The regular season is complete. Results advance automatically."
              : "Projected from the live win-percentage ladder through Round 27."}
          </p>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-wider" style={{ color: palette.textMuted }}>
          Gold path = qualifying-final winner earns a week off
        </div>
      </div>

      <div
        className="overflow-hidden rounded-lg border px-1 py-3 sm:px-3"
        style={{ borderColor: palette.border, background: "rgba(255,255,255,0.02)" }}
      >
        <HorizontalBracket data={data} />
        <VerticalBracket data={data} />
      </div>
    </section>
  );
}

"use client";

import {
  Check,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  Layers,
  PackageOpen,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import allTeamsSalaryData from "@/data/salary-cap/all-teams-2026.json";
import { useTheme } from "./ThemeProvider";

type SalarySource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  supportsDirectSalaryClaim?: boolean;
  notes?: string;
};

type SalaryEstimate = {
  season: number;
  estimateType: string;
  claimShape: string;
  amountCents?: number;
  lowAmountCents?: number;
  highAmountCents?: number;
  confidenceScore: number;
  confidenceBand: "high" | "medium" | "low" | "unknown";
  sources?: string[];
  reasoning: string;
};

type SalaryPlayer = {
  name: string;
  aliases?: string[];
  position: string;
  contractYears: number[];
  rosterCategory: string;
  salaryEstimates: SalaryEstimate[];
};

type HistoricalClaim = {
  player?: string;
  players?: string[];
  source: string;
  claimSummary: string;
  amountCents?: number;
  annualizedAmountCents?: number;
  rangeCents?: [number, number];
  claimYears: number[];
  useIn2026Estimate: string;
};

type SalaryDataset = {
  teamName: string;
  teamId: string;
  season: number;
  sources: SalarySource[];
  players: SalaryPlayer[];
  paidMediaSearch?: {
    directHistoricalClaims?: HistoricalClaim[];
  };
};

type AllTeamsSalaryDataset = {
  season: number;
  teams: SalaryDataset[];
};

const salaryData = allTeamsSalaryData as AllTeamsSalaryDataset;
const teams = salaryData.teams;
const TIMELINE_YEARS = [2026, 2027, 2028, 2029, 2030, 2031];

function formatMoney(cents?: number): string {
  if (cents === undefined) return "UNK";

  const dollars = cents / 100;
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(dollars % 1_000_000 === 0 ? 0 : 1)}m`;
  }

  return `$${Math.round(dollars / 1_000)}k`;
}

function getPrimaryEstimate(player: SalaryPlayer): SalaryEstimate {
  return (
    player.salaryEstimates.find((estimate) => estimate.season === salaryData.season) ||
    player.salaryEstimates[0]
  );
}

function getClaimPlayers(claim: HistoricalClaim): string[] {
  if (claim.player) return [claim.player];
  return claim.players || [];
}

function confidenceColor(confidenceBand: SalaryEstimate["confidenceBand"]): string {
  switch (confidenceBand) {
    case "high":
      return "#22c55e";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#fb7185";
    default:
      return "#737373";
  }
}

function getEvidenceBadge({
  estimate,
  historicalClaims,
}: {
  estimate: SalaryEstimate;
  historicalClaims: HistoricalClaim[];
}) {
  if (estimate.estimateType === "unknown") {
    const isGroupedBucket = estimate.reasoning.toLowerCase().includes("rest");
    return {
      label: isGroupedBucket ? "Bucket" : "Open",
      detail: isGroupedBucket
        ? "Grouped in a roster bucket, no individual number"
        : "No individual salary claim found",
      Icon: isGroupedBucket ? PackageOpen : CircleHelp,
      color: "#a3a3a3",
    };
  }

  if (historicalClaims.length > 0) {
    return {
      label: "Layered",
      detail: "Current valuation plus corroborating contract or historical article context",
      Icon: Layers,
      color: "#22c55e",
    };
  }

  return {
    label: "Direct",
    detail: "Single direct media roster valuation",
    Icon: ShieldCheck,
    color: "#f59e0b",
  };
}

function sortPlayersBySeason(players: SalaryPlayer[], season: number): SalaryPlayer[] {
  return [...players].sort((a, b) => {
    const aEstimate = a.salaryEstimates.find((estimate) => estimate.season === season);
    const bEstimate = b.salaryEstimates.find((estimate) => estimate.season === season);
    const aAmount = aEstimate?.amountCents ?? -1;
    const bAmount = bEstimate?.amountCents ?? -1;

    return bAmount - aAmount || a.name.localeCompare(b.name);
  });
}

export function SalaryCapBoard() {
  const { palette } = useTheme();
  const [selectedTeamId, setSelectedTeamId] = useState("wst");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const data = teams.find((team) => team.teamId === selectedTeamId) || teams[0];
  const sourcesById = useMemo(
    () => new Map(data.sources.map((source) => [source.id, source])),
    [data]
  );
  const players = useMemo(() => sortPlayersBySeason(data.players, data.season), [data]);
  const knownSpendCents = players.reduce((total, player) => {
    const estimate = getPrimaryEstimate(player);
    return total + (estimate.amountCents || 0);
  }, 0);
  const knownPlayerCount = players.filter((player) => getPrimaryEstimate(player).amountCents).length;

  const getHistoricalClaims = (player: SalaryPlayer) =>
    data.paidMediaSearch?.directHistoricalClaims?.filter((claim) =>
      getClaimPlayers(claim).includes(player.name)
    ) || [];

  return (
    <section className="space-y-4">
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: palette.border, background: "rgba(255,255,255,0.035)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase"
              style={{ color: palette.textMuted }}
            >
              <WalletCards size={14} />
              Salary Cap Sample
            </div>
            <h2 className="text-xl font-bold" style={{ color: palette.text }}>
              {data.teamName}
            </h2>
            <select
              value={selectedTeamId}
              onChange={(event) => {
                setSelectedTeamId(event.target.value);
                setExpandedPlayer(null);
              }}
              aria-label="Salary cap team"
              className="mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold sm:w-auto"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${palette.border}`,
                color: palette.text,
              }}
            >
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right font-mono">
            <div className="text-lg font-bold" style={{ color: palette.accent }}>
              {formatMoney(knownSpendCents)}
            </div>
            <div className="text-xs" style={{ color: palette.textMuted }}>
              {knownPlayerCount}/{players.length} sourced
            </div>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: palette.border }}
      >
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr
                className="text-xs uppercase tracking-wider"
                style={{ background: "rgba(255,255,255,0.04)", color: palette.textMuted }}
              >
                <th className="sticky left-0 z-10 w-28 px-2 py-3 text-left font-sans backdrop-blur sm:w-44 sm:px-3" style={{ background: palette.bg }}>
                  Player
                </th>
                <th className="w-11 px-1 py-3 text-center font-mono sm:w-16">Src</th>
                {TIMELINE_YEARS.map((year) => (
                  <th
                    key={year}
                    className={`${year === data.season ? "w-14" : "w-7"} px-1 py-3 text-center font-mono sm:w-16`}
                  >
                    <span className="sm:hidden">{String(year).slice(2)}</span>
                    <span className="hidden sm:inline">{year}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const estimate = getPrimaryEstimate(player);
                const isExpanded = expandedPlayer === player.name;
                const playerSources = (estimate.sources || [])
                  .map((sourceId) => sourcesById.get(sourceId))
                  .filter((source): source is SalarySource => Boolean(source));
                const historicalClaims = getHistoricalClaims(player);
                const bandColor = confidenceColor(estimate.confidenceBand);
                const evidenceBadge = getEvidenceBadge({ estimate, historicalClaims });
                const EvidenceIcon = evidenceBadge.Icon;

                return (
                  <Fragment key={player.name}>
                    <tr
                      key={player.name}
                      className="border-t transition hover:bg-white/5"
                      style={{ borderColor: palette.border }}
                    >
                      <td className="sticky left-0 z-10 px-2 py-3 backdrop-blur sm:px-3" style={{ background: palette.bg }}>
                        <button
                          type="button"
                          onClick={() => setExpandedPlayer(isExpanded ? null : player.name)}
                          className="flex w-full items-center justify-between gap-2 text-left"
                          aria-expanded={isExpanded}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold sm:text-sm">
                              {player.name}
                            </span>
                            <span className="block truncate text-xs" style={{ color: palette.textMuted }}>
                              {player.position}
                            </span>
                          </span>
                          <ChevronDown
                            size={16}
                            className="shrink-0 transition"
                            style={{
                              color: palette.textMuted,
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        </button>
                      </td>
                      <td className="px-1 py-3 text-center">
                        <span
                          title={evidenceBadge.detail}
                          className="inline-flex min-w-9 items-center justify-center rounded px-1.5 py-1 font-mono text-[11px] font-bold sm:min-w-12 sm:px-2 sm:text-xs"
                          style={{ background: `${evidenceBadge.color}24`, color: evidenceBadge.color }}
                        >
                          <EvidenceIcon size={13} strokeWidth={2.6} />
                          <span className="hidden sm:inline">{evidenceBadge.label}</span>
                          <span className="sr-only">{evidenceBadge.detail}</span>
                        </span>
                      </td>
                      {TIMELINE_YEARS.map((year) => {
                        const isContracted = player.contractYears.includes(year);
                        const isEstimateYear = year === estimate.season;
                        const hasAmount = estimate.amountCents !== undefined;

                        return (
                          <td key={year} className="px-1 py-3 text-center">
                            {isContracted ? (
                              <span
                                className={`inline-flex items-center justify-center font-mono font-bold ${
                                  isEstimateYear
                                    ? "min-h-7 w-full rounded px-1 text-[10px] sm:text-[11px]"
                                    : "mx-auto size-6 rounded-full"
                                }`}
                                style={{
                                  background: isEstimateYear
                                    ? hasAmount
                                      ? "rgba(245,127,32,0.22)"
                                      : "rgba(115,115,115,0.22)"
                                    : "rgba(0,168,232,0.16)",
                                  border: `1px solid ${
                                    isEstimateYear ? "#F57F20" : "rgba(0,168,232,0.38)"
                                  }`,
                                  color: isEstimateYear
                                    ? hasAmount
                                      ? "#FDB813"
                                      : palette.textMuted
                                    : palette.text,
                                }}
                              >
                                {isEstimateYear ? (
                                  formatMoney(estimate.amountCents)
                                ) : (
                                  <>
                                    <Check size={13} strokeWidth={3} />
                                    <span className="sr-only">Contracted</span>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="font-mono text-xs" style={{ color: palette.textMuted }}>
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {isExpanded && (
                      <tr className="border-t" style={{ borderColor: palette.border }}>
                        <td colSpan={TIMELINE_YEARS.length + 2} className="p-0">
                          <div
                            className="sticky left-0 space-y-3 px-3 py-4"
                            style={{
                              background: "rgba(255,255,255,0.035)",
                              width: "min(728px, calc(100vw - 2rem))",
                            }}
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono font-bold"
                                style={{ background: `${evidenceBadge.color}24`, color: evidenceBadge.color }}
                              >
                                <EvidenceIcon size={13} />
                                {evidenceBadge.label.toUpperCase()}
                              </span>
                              <span
                                className="rounded px-2 py-1 font-mono"
                                style={{ background: `${bandColor}24`, color: bandColor }}
                              >
                                {estimate.confidenceBand.toUpperCase()} {estimate.confidenceScore}
                              </span>
                              <span className="rounded px-2 py-1 font-mono" style={{ background: "rgba(255,255,255,0.07)" }}>
                                {player.contractYears[0]}-{player.contractYears[player.contractYears.length - 1]}
                              </span>
                              <span className="rounded px-2 py-1 font-mono" style={{ background: "rgba(255,255,255,0.07)" }}>
                                {estimate.claimShape.replaceAll("_", " ")}
                              </span>
                            </div>

                            <p className="text-sm leading-relaxed" style={{ color: palette.text }}>
                              {estimate.reasoning}
                            </p>

                            {historicalClaims.length > 0 && (
                              <div className="space-y-2">
                                {historicalClaims.map((claim) => {
                                  const source = sourcesById.get(claim.source);
                                  return (
                                    <div
                                      key={`${player.name}-${claim.source}-${claim.claimSummary}`}
                                      className="rounded-md border px-3 py-2 text-xs"
                                      style={{ borderColor: palette.border }}
                                    >
                                      <div className="font-medium" style={{ color: palette.text }}>
                                        {claim.claimSummary}
                                      </div>
                                      {source && (
                                        <a
                                          href={source.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="mt-1 inline-flex items-center gap-1 hover:opacity-80"
                                          style={{ color: palette.accent }}
                                        >
                                          {source.publisher}
                                          <ExternalLink size={12} />
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {playerSources.map((source) => (
                                <a
                                  key={source.id}
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-white/10"
                                  style={{ borderColor: palette.border, color: palette.text }}
                                >
                                  <span className="truncate">{source.publisher}: {source.title}</span>
                                  <ExternalLink size={12} className="shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: palette.textMuted }}>
        <span>
          <span className="mr-1 inline-block h-2 w-5 rounded-sm" style={{ background: "rgba(245,127,32,0.5)" }} />
          2026 value
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-5 rounded-sm" style={{ background: "rgba(0,168,232,0.38)" }} />
          Contracted
        </span>
        <span>UNK=No individual salary claim</span>
      </div>
    </section>
  );
}

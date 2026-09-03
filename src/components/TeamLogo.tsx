"use client";

import Image from "next/image";
import { getTeamLogoSrc, type TeamLogoVariant } from "@/lib/team-logo";
import { getTeamById } from "@/lib/teams";

interface TeamLogoProps {
  teamId: string;
  size?: number;
  variant?: TeamLogoVariant;
  decorative?: boolean;
  className?: string;
}

export function TeamLogo({
  teamId,
  size = 24,
  variant = "auto",
  decorative = true,
  className = "",
}: TeamLogoProps) {
  const source = getTeamLogoSrc(teamId, size, variant);
  const team = getTeamById(teamId.toLowerCase());
  const teamName = team ? `${team.location} ${team.name}` : teamId.toUpperCase();

  if (!source) {
    return (
      <span
        aria-label={decorative ? undefined : teamName}
        aria-hidden={decorative || undefined}
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        {teamId.slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={source}
      alt={decorative ? "" : `${teamName} logo`}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
      unoptimized
    />
  );
}

"use client";

import Image from "next/image";

interface TeamFlagProps {
  teamId: string;
  size?: number;
  className?: string;
}

/**
 * Team flag icons using PNG images
 */
export function TeamFlag({ teamId, size = 24, className = "" }: TeamFlagProps) {
  const width = Math.round(size * 1.4);
  const height = size;

  return (
    <Image
      src={`/flags/${teamId}.png`}
      alt={teamId}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

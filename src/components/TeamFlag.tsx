"use client";

import React from "react";

interface TeamFlagProps {
  teamId: string;
  size?: number;
  className?: string;
}

/**
 * 8-bit style team flag icons based on 2026 NRL home jerseys
 * Each flag uses a 7x5 pixel grid for the retro look
 */
export function TeamFlag({ teamId, size = 24, className = "" }: TeamFlagProps) {
  const width = size * 1.4;
  const height = size;
  // 7 columns x 5 rows grid - each pixel is 4x4 units in viewBox 28x20
  const px = 4;

  const flags: Record<string, React.ReactElement> = {
    // Brisbane Broncos - Maroon base with 2 gold bars (2000 premiership style)
    bri: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#6B2C35" />
        {/* Two gold horizontal bars */}
        <rect y={px * 1} width="28" height={px} fill="#FDB813" />
        <rect y={px * 3} width="28" height={px} fill="#FDB813" />
        {/* White shoulder pixels */}
        <rect x={0} y={0} width={px} height={px} fill="#FFFFFF" />
        <rect x={px * 6} y={0} width={px} height={px} fill="#FFFFFF" />
      </svg>
    ),

    // Canberra Raiders - Lime green and white diagonal (traditional)
    can: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#00B140" />
        {/* White diagonal stripe - pixel stairs */}
        <rect x={0} y={0} width={px * 2} height={px} fill="#FFFFFF" />
        <rect x={px * 1} y={px} width={px * 2} height={px} fill="#FFFFFF" />
        <rect x={px * 2} y={px * 2} width={px * 2} height={px} fill="#FFFFFF" />
        <rect x={px * 3} y={px * 3} width={px * 2} height={px} fill="#FFFFFF" />
        <rect x={px * 4} y={px * 4} width={px * 2} height={px} fill="#FFFFFF" />
      </svg>
    ),

    // Canterbury Bulldogs - White with blue hoops (2004 anniversary)
    cby: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        {/* Blue horizontal bands */}
        <rect y={0} width="28" height={px} fill="#005BAC" />
        <rect y={px * 2} width="28" height={px} fill="#005BAC" />
        <rect y={px * 4} width="28" height={px} fill="#005BAC" />
      </svg>
    ),

    // Cronulla Sharks - Black and white/sky blue stripes
    cro: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#000000" />
        {/* Sky blue and white stripes */}
        <rect y={px} width="28" height={px} fill="#00B5E2" />
        <rect y={px * 3} width="28" height={px} fill="#FFFFFF" />
      </svg>
    ),

    // Dolphins - Predominantly red with gold trim
    dol: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#E31837" />
        {/* Gold horizontal accent */}
        <rect y={px * 2} width="28" height={px} fill="#FDB813" />
        {/* Red/gold pixel pattern top */}
        <rect x={px * 3} y={0} width={px} height={px} fill="#FDB813" />
      </svg>
    ),

    // Gold Coast Titans - Light blue/aqua with gold band
    gld: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#00B5E2" />
        {/* Gold horizontal band middle */}
        <rect y={px * 2} width="28" height={px} fill="#FDB813" />
        {/* Navy accent pixels */}
        <rect x={0} y={0} width={px} height={px} fill="#002B5C" />
        <rect x={px * 6} y={0} width={px} height={px} fill="#002B5C" />
      </svg>
    ),

    // Manly Sea Eagles - White with maroon (90s Pepsi style)
    man: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        {/* Maroon chevron-like pixel pattern */}
        <rect x={px * 2} y={0} width={px * 3} height={px} fill="#6B2C35" />
        <rect x={px * 1} y={px} width={px * 2} height={px} fill="#6B2C35" />
        <rect x={px * 4} y={px} width={px * 2} height={px} fill="#6B2C35" />
        <rect x={0} y={px * 2} width={px * 2} height={px} fill="#6B2C35" />
        <rect x={px * 5} y={px * 2} width={px * 2} height={px} fill="#6B2C35" />
        {/* Bottom accent */}
        <rect y={px * 4} width="28" height={px} fill="#6B2C35" />
      </svg>
    ),

    // Melbourne Storm - Purple and dark blue with lightning bolt
    mel: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#452C7C" />
        {/* Dark blue sections */}
        <rect x={0} y={0} width={px * 3} height="20" fill="#002B5C" />
        {/* Gold lightning bolt pixels */}
        <rect x={px * 4} y={0} width={px} height={px} fill="#FDB813" />
        <rect x={px * 3} y={px} width={px} height={px} fill="#FDB813" />
        <rect x={px * 4} y={px * 2} width={px} height={px} fill="#FDB813" />
        <rect x={px * 3} y={px * 3} width={px} height={px} fill="#FDB813" />
        <rect x={px * 2} y={px * 4} width={px} height={px} fill="#FDB813" />
      </svg>
    ),

    // Newcastle Knights - Vertical red and blue stripes (2026 return)
    new: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        {/* Alternating red and blue vertical stripes */}
        <rect x={0} width={px} height="20" fill="#C8102E" />
        <rect x={px * 2} width={px} height="20" fill="#005BAC" />
        <rect x={px * 4} width={px} height="20" fill="#C8102E" />
        <rect x={px * 6} width={px} height="20" fill="#005BAC" />
      </svg>
    ),

    // North Queensland Cowboys - Navy with gold/yellow chevron
    nql: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#002B5C" />
        {/* Gold V-shaped chevron pixels */}
        <rect x={px * 3} y={0} width={px} height={px} fill="#FDB813" />
        <rect x={px * 2} y={px} width={px} height={px} fill="#FDB813" />
        <rect x={px * 4} y={px} width={px} height={px} fill="#FDB813" />
        <rect x={px * 1} y={px * 2} width={px} height={px} fill="#FDB813" />
        <rect x={px * 5} y={px * 2} width={px} height={px} fill="#FDB813" />
        <rect x={0} y={px * 3} width={px} height={px} fill="#FDB813" />
        <rect x={px * 6} y={px * 3} width={px} height={px} fill="#FDB813" />
      </svg>
    ),

    // New Zealand Warriors - Predominantly blue (mid-90s style)
    nzl: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#0033A0" />
        {/* White/silver accents */}
        <rect y={0} width="28" height={px} fill="#C0C0C0" />
        {/* Red accent pixels */}
        <rect x={px * 3} y={px * 2} width={px} height={px} fill="#C8102E" />
        <rect x={px * 3} y={px * 3} width={px} height={px} fill="#C8102E" />
      </svg>
    ),

    // Parramatta Eels - Blue and gold hoops (1986 design)
    par: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#005BAC" />
        {/* Gold horizontal hoops */}
        <rect y={px} width="28" height={px} fill="#FDB813" />
        <rect y={px * 3} width="28" height={px} fill="#FDB813" />
      </svg>
    ),

    // Penrith Panthers - Black with pink/magenta accent (60th anniversary)
    pen: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#000000" />
        {/* Pink diagonal accent */}
        <rect x={px * 4} y={0} width={px} height={px} fill="#FF69B4" />
        <rect x={px * 5} y={0} width={px} height={px} fill="#FF69B4" />
        <rect x={px * 3} y={px} width={px} height={px} fill="#FF69B4" />
        <rect x={px * 4} y={px} width={px} height={px} fill="#FF69B4" />
        <rect x={px * 2} y={px * 2} width={px} height={px} fill="#FF69B4" />
        <rect x={px * 3} y={px * 2} width={px} height={px} fill="#FF69B4" />
        {/* White bottom edge */}
        <rect y={px * 4} width="28" height={px} fill="#FFFFFF" />
      </svg>
    ),

    // South Sydney Rabbitohs - Cardinal red and myrtle green hoops
    sou: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#00843D" />
        {/* Cardinal red horizontal bands */}
        <rect y={0} width="28" height={px} fill="#C8102E" />
        <rect y={px * 2} width="28" height={px} fill="#C8102E" />
        <rect y={px * 4} width="28" height={px} fill="#C8102E" />
      </svg>
    ),

    // St George Illawarra Dragons - Red V on white (unchanged classic)
    sti: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        {/* Red V shape - pixel art */}
        <rect x={px * 3} y={0} width={px} height={px} fill="#C8102E" />
        <rect x={px * 2} y={px} width={px} height={px} fill="#C8102E" />
        <rect x={px * 4} y={px} width={px} height={px} fill="#C8102E" />
        <rect x={px * 1} y={px * 2} width={px} height={px} fill="#C8102E" />
        <rect x={px * 5} y={px * 2} width={px} height={px} fill="#C8102E" />
        <rect x={0} y={px * 3} width={px} height={px} fill="#C8102E" />
        <rect x={px * 6} y={px * 3} width={px} height={px} fill="#C8102E" />
        <rect x={0} y={px * 4} width={px} height={px} fill="#C8102E" />
        <rect x={px * 6} y={px * 4} width={px} height={px} fill="#C8102E" />
      </svg>
    ),

    // Sydney Roosters - Tricolor with red stripe accents
    syd: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        {/* Navy left section */}
        <rect x={0} width={px * 2} height="20" fill="#00205B" />
        {/* Red right section */}
        <rect x={px * 5} width={px * 2} height="20" fill="#C8102E" />
        {/* Red side stripes (2026 update) */}
        <rect x={px * 2} y={px} width={px} height={px * 3} fill="#C8102E" />
        <rect x={px * 4} y={px} width={px} height={px * 3} fill="#C8102E" />
      </svg>
    ),

    // Wests Tigers - Orange with black claw marks (Balmain vibe 2026)
    wst: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#F57F20" />
        {/* Black claw mark pixels - diagonal scratches */}
        <rect x={px} y={0} width={px} height={px} fill="#000000" />
        <rect x={px * 2} y={px} width={px} height={px} fill="#000000" />
        <rect x={px * 3} y={px * 2} width={px} height={px} fill="#000000" />
        {/* Second claw */}
        <rect x={px * 4} y={0} width={px} height={px} fill="#000000" />
        <rect x={px * 5} y={px} width={px} height={px} fill="#000000" />
        <rect x={px * 6} y={px * 2} width={px} height={px} fill="#000000" />
        {/* White accent */}
        <rect x={px * 3} y={px * 4} width={px} height={px} fill="#FFFFFF" />
      </svg>
    ),
  };

  // Fallback for unknown teams - pixelated gray
  const fallback = (
    <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
      <rect width="28" height="20" fill="#333333" />
      <rect x={px * 2} y={px} width={px * 3} height={px * 3} fill="#555555" />
    </svg>
  );

  return flags[teamId] || fallback;
}

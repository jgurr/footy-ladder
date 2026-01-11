"use client";

import React from "react";

interface TeamFlagProps {
  teamId: string;
  size?: number;
  className?: string;
}

/**
 * Team flag icons based on traditional NRL jersey patterns
 */
export function TeamFlag({ teamId, size = 24, className = "" }: TeamFlagProps) {
  const width = size * 1.4;
  const height = size;

  const flags: Record<string, React.ReactElement> = {
    // Brisbane Broncos - Maroon and gold (solid with gold chest band)
    bri: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#6B2C35" />
        <rect y="6" width="28" height="8" fill="#FDB813" />
      </svg>
    ),

    // Canberra Raiders - Lime green (solid green with white side)
    can: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#97D700" />
        <rect width="8" height="20" fill="#FFFFFF" />
      </svg>
    ),

    // Canterbury Bulldogs - Blue and white (horizontal blocks)
    cby: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#0055A4" />
        <rect y="10" width="28" height="10" fill="#FFFFFF" />
      </svg>
    ),

    // Cronulla Sharks - Black, sky blue, white (horizontal thirds)
    cro: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#000000" />
        <rect y="7" width="28" height="6" fill="#00A9CE" />
        <rect y="13" width="28" height="7" fill="#FFFFFF" />
      </svg>
    ),

    // Dolphins - Red and gold (red with gold bottom)
    dol: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#C8102E" />
        <rect y="14" width="28" height="6" fill="#FFB81C" />
      </svg>
    ),

    // Gold Coast Titans - Aqua and gold (aqua with gold top)
    gld: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#009FDF" />
        <rect width="28" height="6" fill="#FFB81C" />
      </svg>
    ),

    // Manly Sea Eagles - Maroon and white (chevron from left)
    man: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#84002E" />
        <polygon points="0,0 16,10 0,20" fill="#FFFFFF" />
      </svg>
    ),

    // Melbourne Storm - Purple (solid purple with navy side)
    mel: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#5F259F" />
        <rect width="10" height="20" fill="#001F5C" />
      </svg>
    ),

    // Newcastle Knights - Red and blue (diagonal split with white)
    new: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#0055A4" />
        <polygon points="0,0 28,0 28,10 0,20" fill="#C8102E" />
        <polygon points="12,6 16,6 16,14 12,14" fill="#FFFFFF" />
      </svg>
    ),

    // North Queensland Cowboys - Navy and gold (navy with gold band)
    nql: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#002B5C" />
        <rect y="6" width="28" height="8" fill="#FFB81C" />
      </svg>
    ),

    // New Zealand Warriors - Navy (navy with red top stripe)
    nzl: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#002B5C" />
        <rect width="28" height="5" fill="#C8102E" />
      </svg>
    ),

    // Parramatta Eels - Blue and gold HOOPS (signature pattern)
    par: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#0055A4" />
        <rect y="0" width="28" height="4" fill="#FFB81C" />
        <rect y="8" width="28" height="4" fill="#FFB81C" />
        <rect y="16" width="28" height="4" fill="#FFB81C" />
      </svg>
    ),

    // Penrith Panthers - Black with pink (black with pink diagonal)
    pen: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#000000" />
        <polygon points="18,0 28,0 10,20 0,20" fill="#E84087" />
      </svg>
    ),

    // South Sydney Rabbitohs - Red and green HOOPS (signature pattern)
    sou: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#007544" />
        <rect y="0" width="28" height="5" fill="#C8102E" />
        <rect y="10" width="28" height="5" fill="#C8102E" />
      </svg>
    ),

    // St George Illawarra Dragons - Red V on white (signature pattern)
    sti: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        <polygon points="0,0 14,14 28,0 22,0 14,8 6,0" fill="#C8102E" />
      </svg>
    ),

    // Sydney Roosters - Tricolor chevron (signature pattern)
    syd: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#001F5C" />
        <polygon points="0,0 14,14 28,0 22,0 14,8 6,0" fill="#FFFFFF" />
        <polygon points="0,0 14,10 28,0 24,0 14,6 4,0" fill="#C8102E" />
      </svg>
    ),

    // Wests Tigers - Orange and black STRIPES (signature pattern)
    wst: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#F57F20" />
        <rect y="0" width="28" height="4" fill="#000000" />
        <rect y="8" width="28" height="4" fill="#000000" />
        <rect y="16" width="28" height="4" fill="#000000" />
      </svg>
    ),
  };

  // Fallback for unknown teams
  const fallback = (
    <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
      <rect width="28" height="20" fill="#333333" />
    </svg>
  );

  return flags[teamId] || fallback;
}

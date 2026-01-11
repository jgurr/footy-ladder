"use client";

import React from "react";

interface TeamFlagProps {
  teamId: string;
  size?: number;
  className?: string;
}

/**
 * Team flag component matching jersey designs
 * Each flag is a small rectangular icon with the team's characteristic pattern
 */
export function TeamFlag({ teamId, size = 24, className = "" }: TeamFlagProps) {
  const width = size * 1.4; // Aspect ratio ~1.4:1 for flags
  const height = size;

  const flags: Record<string, React.ReactElement> = {
    // Brisbane Broncos - Gold with maroon diagonal
    bri: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FDB813" />
        <polygon points="0,0 28,0 0,20" fill="#6B2C35" />
      </svg>
    ),

    // Canberra Raiders - Green/lime diagonal split
    can: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FDB813" />
        <polygon points="0,0 28,20 0,20" fill="#00A651" />
      </svg>
    ),

    // Canterbury Bulldogs - Blue with white chevron
    cby: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#005BAC" />
        <polygon points="0,0 14,10 28,0 28,6 14,16 0,6" fill="#FFFFFF" />
      </svg>
    ),

    // Cronulla Sharks - Light blue with black horizontal stripes
    cro: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#00A8E8" />
        <rect y="4" width="28" height="3" fill="#000000" />
        <rect y="10" width="28" height="3" fill="#000000" />
        <rect y="16" width="28" height="3" fill="#000000" />
      </svg>
    ),

    // Dolphins - Gold with red chevron
    dol: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FDB813" />
        <polygon points="0,0 14,10 28,0 28,6 14,16 0,6" fill="#C8102E" />
      </svg>
    ),

    // Gold Coast Titans - Light blue with gold band
    gld: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#00A8E8" />
        <rect y="7" width="28" height="6" fill="#FDB813" />
      </svg>
    ),

    // Manly Sea Eagles - Maroon with white chevron
    man: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#6B2C35" />
        <polygon points="0,0 14,10 28,0 28,6 14,16 0,6" fill="#FFFFFF" />
      </svg>
    ),

    // Melbourne Storm - Purple with white diagonal stripe
    mel: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#452C7C" />
        <polygon points="6,0 14,0 28,14 28,20 20,20 0,6 0,0" fill="#FFFFFF" />
      </svg>
    ),

    // Newcastle Knights - Red and blue vertical stripes
    new: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#C8102E" />
        <rect x="7" width="7" height="20" fill="#005BAC" />
        <rect x="21" width="7" height="20" fill="#005BAC" />
      </svg>
    ),

    // North Queensland Cowboys - Navy with gold chevron
    nql: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#002B5C" />
        <polygon points="0,0 14,10 28,0 28,6 14,16 0,6" fill="#FDB813" />
      </svg>
    ),

    // New Zealand Warriors - Black with red chevron
    nzl: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#000000" />
        <polygon points="0,0 14,10 28,0 28,6 14,16 0,6" fill="#C8102E" />
      </svg>
    ),

    // Parramatta Eels - Blue and gold horizontal
    par: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#005BAC" />
        <rect y="5" width="28" height="5" fill="#FDB813" />
        <rect y="15" width="28" height="5" fill="#FDB813" />
      </svg>
    ),

    // Penrith Panthers - Black/pink/gold horizontal stripes
    pen: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#000000" />
        <rect y="5" width="28" height="5" fill="#FDB813" />
        <rect y="13" width="28" height="4" fill="#FF69B4" />
      </svg>
    ),

    // South Sydney Rabbitohs - Green and red horizontal
    sou: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#00A651" />
        <rect y="7" width="28" height="6" fill="#C8102E" />
      </svg>
    ),

    // St George Illawarra Dragons - Red V on white
    sti: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#FFFFFF" />
        <polygon points="14,0 28,20 22,20 14,8 6,20 0,20" fill="#C8102E" />
      </svg>
    ),

    // Sydney Roosters - Tricolor (red, white, blue vertical)
    syd: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="9" height="20" fill="#00205B" />
        <rect x="9" width="10" height="20" fill="#FFFFFF" />
        <rect x="19" width="9" height="20" fill="#C8102E" />
      </svg>
    ),

    // Wests Tigers - Orange and black hoops
    wst: (
      <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
        <rect width="28" height="20" fill="#F57F20" />
        <rect y="0" width="28" height="5" fill="#000000" />
        <rect y="10" width="28" height="5" fill="#000000" />
      </svg>
    ),
  };

  // Fallback for unknown teams
  const fallback = (
    <svg width={width} height={height} viewBox="0 0 28 20" className={className}>
      <rect width="28" height="20" fill="#333" rx="2" />
    </svg>
  );

  return flags[teamId] || fallback;
}

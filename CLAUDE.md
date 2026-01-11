# Footy Ladder

**Required Reading:** Before responding, read `docs/architecture.md` for full project context.

## What Is This?

Footy Ladder is an NRL ladder that ranks teams by **win percentage** instead of traditional ladder points. This removes bye-round distortion and shows the true competitive standing.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3) or Prisma + Postgres
- **Styling**: Tailwind CSS with retro/poolsuite-inspired design
- **Hosting**: Vercel
- **Real-time**: SSE for live score updates

## Key Directories

```
/src
  /app           - Next.js pages and API routes
  /components    - React components
  /lib           - Business logic, calculations, data fetching
/prisma          - Database schema (if using Prisma)
/docs
  /architecture.md  - Full project context (Jamie Mill's framework)
  /sprints          - Sprint planning documents
```

## Core Calculation

```typescript
// Win percentage (the core value prop)
winPercentage = (wins + 0.5 * draws) / gamesPlayed * 100

// Tiebreaker cascade
1. NRL Points (wins × 2 + draws)
2. Points Differential (PF - PA)
3. Points For
```

## Design Philosophy

Inspired by [Poolsuite.net](https://poolsuite.net):
- Retro terminal aesthetic
- Vintage luxury branding (gold accents, serif fonts)
- Playful nostalgic UI
- Rugby league flair

## Related Projects

This project shares Claude Code skills with [Bonnie](/Users/jeffgurr/Documents/Bonnie). The original prototype lives at `/Users/jeffgurr/nrl-ladder`.

## Critical Data Rule

**NEVER** take data from the original nrl-ladder project (`/Users/jeffgurr/nrl-ladder`). All game data for footy-ladder was scraped specifically for this project from official sources (Rugby League Project, NRL.com). If you need to restore or reference historical data, use git history from THIS repository only.

## Working Style

**Always take the most detailed approach. Never cut corners.**

When implementing features or gathering data:
1. Use primary sources (official NRL.com, Rugby League Project, etc.)
2. Scrape actual data rather than making assumptions or using shortcuts
3. Account for special cases (Magic Round, Las Vegas, regional games, etc.)

**Always present recommendations and ask for decisions.** Before implementing:
1. Research the options
2. Present findings with pros/cons
3. Ask which approach to take
4. Only proceed after explicit approval

## Current Sprint

See `docs/sprints/` for current sprint documentation.

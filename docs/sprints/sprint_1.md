# Sprint 1: Foundation & Live Ladder

---

## Sprint Kickoff Checklist

- [x] **Interview complete** - Used AskUserQuestionTool, got answers to deep questions
- [x] **Architecture doc written** - Created `docs/architecture.md` with Jamie Mill's framework
- [ ] **Sprint doc written** - This file
- [ ] **Sign-off received** - User approved plan before implementation began

---

## Current Status

**Branch:** `main` (initial development)

**Status:** Planning

**Depends on:** None (first sprint)

**Required Reading:** `docs/architecture.md`

---

## Overview

Sprint 1 establishes the foundation for Footy Ladder: a public website that displays the NRL ladder ranked by win percentage with near real-time score updates. We'll port the core logic from the original nrl-ladder project, implement the poolsuite-inspired retro design, scrape the 2026 schedule, and deploy to Vercel.

By the end of this sprint, users can:
- View the current NRL ladder sorted by win percentage
- See live scores update during games
- Browse historical rounds (2025 season + 2026)
- Enjoy a distinctive retro-luxe visual experience

---

## User Stories / Goals

- [x] As a fan, I can see the ladder ranked by win percentage
- [ ] As a fan, I can see live scores update during games (10-30s refresh)
- [ ] As a fan, I can pick a round to see the historical ladder
- [ ] As a fan, I can compare attack/defense stats across teams
- [ ] As a fan, I experience a distinctive retro-luxe design

---

## Technical Scope

### Surfaces to Update

#### Data Layer
- [x] **Database Schema** - Teams, Games, LadderSnapshots, ScrapingLog
- [ ] **Seed Data** - 17 teams with codes, colors, logos
- [ ] **Historical Data** - 2025 season results (scraped)
- [ ] **2026 Schedule** - Full season schedule with venues/times

#### API Layer
- [ ] **GET /api/ladder** - Current ladder with optional round param
- [ ] **GET /api/games** - Games for a round, with live status
- [ ] **GET /api/teams** - All teams with metadata
- [ ] **GET /api/schedule** - 2026 season schedule
- [ ] **POST /api/sync** - Trigger manual data refresh (protected)

#### Real-time Updates
- [ ] **SSE Endpoint** - `/api/live` for real-time score streaming
- [ ] **Cron Job** - Poll NRL source every 30s during games

#### UI Components
- [ ] **LadderTable** - Main rankings display
- [ ] **TeamRow** - Team with stats, logo, colors
- [ ] **LiveScore** - Real-time game score component
- [ ] **RoundPicker** - Historical navigation dropdown
- [ ] **ViewTabs** - Ladder / Attack / Defense views
- [ ] **Header** - Logo, title, round info

#### Design System
- [ ] **Color Tokens** - Retro palette (dark, neon accents)
- [ ] **Typography** - Monospace, serif, sans stack
- [ ] **Effects** - Subtle CRT glow, scanlines
- [ ] **Team Colors** - Gradient backgrounds per team

#### External Integrations
- [ ] **Data Source** - Research and implement (NRL API/scraping)
- [ ] **Vercel** - Deployment with environment variables
- [ ] **Domain** - Purchase and configure

---

## Implementation Phases

### Phase 1.1: Project Setup & Data Research (Day 1)

- [ ] Initialize Next.js 16 with TypeScript
- [ ] Configure Tailwind CSS with design tokens
- [ ] Set up SQLite database with better-sqlite3
- [ ] Research NRL data sources:
  - Official NRL API (check terms, rate limits)
  - NRL.com scraping feasibility
  - Third-party options (SportRadar, etc.)
- [ ] Document findings in `docs/data-sources.md`

### Phase 1.2: Core Logic & Database (Day 2)

- [ ] Port calculation logic from nrl-ladder:
  - `calculateWinPercentage()`
  - `sortLadder()` with tiebreakers
  - `detectByeRounds()`
- [ ] Create database schema:
  ```sql
  teams (id, name, location, short_code, colors, logo_url)
  games (id, round, home_team, away_team, home_score, away_score,
         venue, kickoff, status, minute)
  ladder_snapshots (id, round, team_id, played, wins, losses, draws,
                    pf, pa, win_pct, position)
  ```
- [ ] Seed 17 teams with metadata
- [ ] Create API routes: `/api/ladder`, `/api/games`, `/api/teams`

### Phase 1.3: 2025 Historical Data (Day 3)

- [ ] Scrape/source 2025 season results (all 27 rounds)
- [ ] Import into database
- [ ] Generate ladder snapshots for each round
- [ ] Verify calculations match official final standings

### Phase 1.4: 2026 Schedule (Day 3-4)

- [ ] Scrape 2026 NRL season schedule
- [ ] Extract: home team, away team, venue, kickoff time
- [ ] Import into database
- [ ] Create round picker with all scheduled rounds

### Phase 1.5: Retro Design System (Day 4-5)

- [ ] Review [Poolsuite.net](https://poolsuite.net) for inspiration
- [ ] Define color palette (dark base, neon accents, gold)
- [ ] Set up typography (monospace + serif + sans)
- [ ] Create CRT/scanline effects (subtle, toggle-able)
- [ ] Design team row with gradient backgrounds
- [ ] Build component library:
  - `LadderTable`
  - `TeamRow`
  - `RoundPicker`
  - `ViewTabs`
  - `Header`

### Phase 1.6: Live Score Infrastructure (Day 5-6)

- [ ] Implement data source integration (based on Phase 1.1 research)
- [ ] Create cron job for live score polling (30s during games)
- [ ] Build SSE endpoint for real-time client updates
- [ ] Add "live" indicators to active games
- [ ] Implement ladder recalculation on score change

### Phase 1.7: Stats Views (Day 6)

- [ ] Attack view: PF, PF/game, ranked by attack
- [ ] Defense view: PA, PA/game, ranked by defense
- [ ] View tabs for switching between Ladder/Attack/Defense
- [ ] Port For/Against view from original project

### Phase 1.8: Deployment (Day 7)

- [ ] Create Vercel project
- [ ] Configure environment variables
- [ ] Research domain options:
  - footyladder.com.au
  - trueladder.com.au
  - theladder.com.au
- [ ] Purchase domain
- [ ] Configure DNS with Vercel
- [ ] Deploy and verify production

---

## Data Model

```prisma
model Team {
  id        String   @id @default(cuid())
  name      String   // "Panthers"
  location  String   // "Penrith"
  shortCode String   @unique // "PEN"
  colors    Json     // { primary: "#FF69B4", secondary: "#1A1A1A" }
  logoUrl   String?

  homeGames     Game[] @relation("HomeTeam")
  awayGames     Game[] @relation("AwayTeam")
  ladderEntries LadderSnapshot[]
}

model Game {
  id          String   @id @default(cuid())
  season      Int      // 2025, 2026
  round       Int
  homeTeamId  String
  homeTeam    Team     @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeamId  String
  awayTeam    Team     @relation("AwayTeam", fields: [awayTeamId], references: [id])
  homeScore   Int?
  awayScore   Int?
  venue       String
  kickoff     DateTime
  status      GameStatus @default(SCHEDULED)
  minute      Int?     // Current game minute if live

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum GameStatus {
  SCHEDULED
  LIVE
  FINAL
  POSTPONED
}

model LadderSnapshot {
  id           String @id @default(cuid())
  season       Int
  round        Int
  teamId       String
  team         Team   @relation(fields: [teamId], references: [id])

  played       Int
  wins         Int
  losses       Int
  draws        Int
  pointsFor    Int
  pointsAgainst Int
  differential Int
  winPct       Float
  nrlPoints    Int    // Traditional ladder points
  position     Int
  byesTaken    Int

  createdAt    DateTime @default(now())

  @@unique([season, round, teamId])
}
```

---

## API Routes

```
GET  /api/ladder?round=5&season=2026  - Get ladder for specific round
GET  /api/games?round=5&season=2026   - Get games for a round
GET  /api/teams                        - Get all teams with metadata
GET  /api/schedule?season=2026         - Get season schedule
GET  /api/live                         - SSE endpoint for live updates
POST /api/sync?secret=xxx              - Manual data refresh (protected)
```

---

## File Changes Summary

**New Files:**
- `src/app/page.tsx` - Home page with ladder
- `src/app/api/ladder/route.ts` - Ladder API
- `src/app/api/games/route.ts` - Games API
- `src/app/api/teams/route.ts` - Teams API
- `src/app/api/live/route.ts` - SSE endpoint
- `src/lib/calculations.ts` - Win %, sorting logic
- `src/lib/database.ts` - DB connection and queries
- `src/lib/scraper.ts` - Data source integration
- `src/components/LadderTable.tsx`
- `src/components/TeamRow.tsx`
- `src/components/RoundPicker.tsx`
- `src/components/ViewTabs.tsx`
- `src/components/LiveScore.tsx`
- `tailwind.config.ts` - Design tokens
- `prisma/schema.prisma` - Database schema

---

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL="file:./data/footy.db"

# Data Source (TBD based on research)
NRL_API_KEY=xxx
NRL_API_URL=https://...

# Sync
SYNC_SECRET=xxx

# Vercel
VERCEL_URL=xxx
```

---

## Dependencies

- [ ] `next@16` - Framework
- [ ] `typescript` - Type safety
- [ ] `tailwindcss` - Styling
- [ ] `better-sqlite3` - SQLite database
- [ ] `zod` - Schema validation
- [ ] `lucide-react` - Icons
- [ ] `date-fns` - Date utilities
- [ ] `cheerio` - HTML scraping (if needed)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| NRL API access denied | Medium | High | Have scraping fallback ready |
| Live score rate limiting | Medium | Medium | Implement caching, backoff |
| 2025 data unavailable | Low | Medium | Use official NRL archives |
| Design scope creep | Medium | Low | MVP first, polish in Phase 1.5 |

---

## Success Criteria

1. Ladder displays correctly sorted by win %
2. Live scores update within 30s during games
3. Round picker shows 2025 historical + 2026 schedule
4. Design matches poolsuite-inspired aesthetic
5. Deployed to Vercel with custom domain
6. Page loads in < 2s on mobile

---

## Open Questions

1. **Domain name** - Need to decide and check availability
2. **Data source** - NRL API vs scraping vs third-party (Phase 1.1 research)
3. **2025 data** - Exact source for historical game results

---

## Notes / Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-10 | Use Vercel for hosting | Best Next.js DX, free tier sufficient |
| 2026-01-10 | Use SQLite initially | Simpler than Postgres, can migrate later |
| 2026-01-10 | Target 10-30s freshness | User priority for real-time experience |
| 2026-01-10 | Store 2025 history | Enables round picker testing and fan nostalgia |

---

## Future Considerations (Backlog)

- [ ] ELO rating system
- [ ] Strength of schedule calculation
- [ ] Push notifications for close games
- [ ] Share cards for social media
- [ ] PWA with offline support

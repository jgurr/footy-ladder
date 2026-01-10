# Sprint 1: Foundation & Live Ladder

---

## Sprint Kickoff Checklist

- [x] **Interview complete** - Used AskUserQuestionTool, got answers to deep questions
- [x] **Architecture doc written** - Created `docs/architecture.md` with Jamie Mill's framework
- [x] **Sprint doc written** - This file
- [x] **Autonomy mapped** - Each phase marked as autonomous or requires-input
- [x] **Acceptance criteria defined** - Each phase has testable criteria + eval commands
- [ ] **Sections validated** - Verified ALL template sections exist
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

> **Phase Structure Requirements:**
> - Each phase MUST have acceptance criteria (testable conditions for "done")
> - Each phase MUST be marked as autonomous or requires-input
> - After completing each phase, fill in the Learnings section before proceeding

---

### Phase 1.1: Project Setup & Data Research

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [ ] Initialize Next.js 16 with TypeScript
- [ ] Configure Tailwind CSS with design tokens
- [ ] Set up SQLite database with better-sqlite3
- [ ] Research NRL data sources:
  - Official NRL API (check terms, rate limits)
  - NRL.com scraping feasibility
  - Third-party options (SportRadar, etc.)
- [ ] Document findings in `docs/data-sources.md`
- [ ] Make recommendation for data source approach

**Acceptance Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes render correctly
- [ ] SQLite database file created at `data/footy.db`
- [ ] `docs/data-sources.md` exists with pros/cons/recommendation

**Eval Commands:**
```bash
cd /Users/jeffgurr/Documents/footy-ladder
npm run dev &                    # Starts on port 3000
curl -s localhost:3000 | head    # Returns HTML
ls data/footy.db                 # File exists
cat docs/data-sources.md | head  # Has content
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.2: Core Logic & Database

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [ ] Port calculation logic from nrl-ladder:
  - `calculateWinPercentage()`
  - `sortLadder()` with tiebreakers
  - `detectByeRounds()`
- [ ] Create database schema (teams, games, ladder_snapshots)
- [ ] Seed 17 teams with metadata (names, codes, colors)
- [ ] Create API routes: `/api/ladder`, `/api/games`, `/api/teams`

**Acceptance Criteria:**
- [ ] `calculateWinPercentage(10, 5, 1)` returns `65.625`
- [ ] GET `/api/teams` returns 17 teams
- [ ] GET `/api/ladder` returns sorted array with winPct field
- [ ] No TypeScript errors in build

**Eval Commands:**
```bash
npm run build                                    # No errors
curl -s localhost:3000/api/teams | jq length     # Returns 17
curl -s localhost:3000/api/teams | jq '.[0]'     # Has name, shortCode, colors
curl -s localhost:3000/api/ladder | jq '.[0].winPct'  # Has winPct field
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.3: 2025 Historical Data

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [ ] Scrape/source 2025 season results (all 27 rounds)
- [ ] Import game results into database
- [ ] Generate ladder snapshots for each round
- [ ] Verify calculations match official final standings

**Acceptance Criteria:**
- [ ] Database contains 27 rounds of 2025 games
- [ ] Each round has 8 games (216 total, minus byes)
- [ ] Final round ladder matches official NRL final standings
- [ ] Panthers are #1 with highest win % (verify against official)

**Eval Commands:**
```bash
# Count 2025 games
curl -s "localhost:3000/api/games?season=2025" | jq length

# Check final round ladder
curl -s "localhost:3000/api/ladder?season=2025&round=27" | jq '.[0]'

# Verify top team
curl -s "localhost:3000/api/ladder?season=2025&round=27" | jq '.[0].team.name'
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.4: 2026 Schedule

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [ ] Scrape 2026 NRL season schedule from official source
- [ ] Extract: home team, away team, venue, kickoff time (UTC)
- [ ] Import into database with SCHEDULED status
- [ ] Create round picker component with all scheduled rounds

**Acceptance Criteria:**
- [ ] Database contains 2026 schedule (approx 200+ games)
- [ ] Each game has homeTeam, awayTeam, venue, kickoff
- [ ] Kickoff times stored in UTC, displayed in user timezone
- [ ] Round picker shows rounds 1-27

**Eval Commands:**
```bash
# Count 2026 scheduled games
curl -s "localhost:3000/api/schedule?season=2026" | jq length

# Check a game has required fields
curl -s "localhost:3000/api/games?season=2026&round=1" | jq '.[0] | keys'

# Verify venue exists
curl -s "localhost:3000/api/games?season=2026&round=1" | jq '.[0].venue'
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.5: Retro Design System

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** Design is subjective. Need user approval on color palette, typography choices, and CRT effect intensity before building all components.

**Tasks:**
- [ ] Review [Poolsuite.net](https://poolsuite.net) for inspiration
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Build proof-of-concept with 2-3 team rows
- [ ] **CHECKPOINT: Get user approval on design direction**
- [ ] Create CRT/scanline effects (subtle, toggle-able)
- [ ] Build full component library:
  - `LadderTable`
  - `TeamRow`
  - `RoundPicker`
  - `ViewTabs`
  - `Header`

**Acceptance Criteria:**
- [ ] Design tokens defined in `tailwind.config.ts`
- [ ] All 17 teams render with correct gradient colors
- [ ] Monospace font used for numbers, serif for headings
- [ ] CRT effect visible but not distracting
- [ ] Mobile responsive (works on 375px width)
- [ ] User approved design direction

**Eval Commands:**
```bash
# Check design tokens exist
grep -c "neon" tailwind.config.ts    # Has neon colors

# Visual check required - open in browser
open http://localhost:3000

# Mobile responsive check
# Use browser devtools to test 375px width
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.6: Live Score Infrastructure

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [ ] Implement data source integration (per Phase 1.1 recommendation)
- [ ] Create cron job for live score polling (30s during games)
- [ ] Build SSE endpoint `/api/live` for real-time client updates
- [ ] Add "live" indicators to active games
- [ ] Implement ladder recalculation on score change

**Acceptance Criteria:**
- [ ] SSE endpoint streams score updates
- [ ] Client receives updates without page refresh
- [ ] Ladder recalculates within 5s of score change
- [ ] "LIVE" indicator appears on in-progress games
- [ ] No memory leaks in SSE connection handling

**Eval Commands:**
```bash
# Test SSE endpoint
curl -N localhost:3000/api/live

# Simulate score update and verify ladder recalc
# (will need manual testing during actual games)

# Check for TypeScript errors
npm run build
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.7: Stats Views

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [ ] Attack view: PF, PF/game, ranked by offensive output
- [ ] Defense view: PA, PA/game, ranked by defensive strength
- [ ] View tabs for switching between Ladder/Attack/Defense
- [ ] Port For/Against view from original project

**Acceptance Criteria:**
- [ ] Attack view sorts by PF descending
- [ ] Defense view sorts by PA ascending (lower = better)
- [ ] Tab switching doesn't cause page reload
- [ ] Stats match calculated values from ladder data

**Eval Commands:**
```bash
# Check attack endpoint
curl -s "localhost:3000/api/ladder?view=attack" | jq '.[0].pointsFor'

# Check defense endpoint
curl -s "localhost:3000/api/ladder?view=defense" | jq '.[0].pointsAgainst'

# Verify sorting
curl -s "localhost:3000/api/ladder?view=attack" | jq '[.[0].pointsFor, .[1].pointsFor] | .[0] >= .[1]'
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

### Phase 1.8: Deployment

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** Domain name selection and purchase requires user decision and payment.

**Tasks:**
- [ ] Create Vercel project and link to GitHub repo
- [ ] Configure environment variables in Vercel
- [ ] **CHECKPOINT: User decides domain name**
- [ ] Research domain availability and pricing
- [ ] **CHECKPOINT: User purchases domain**
- [ ] Configure DNS with Vercel
- [ ] Deploy and verify production
- [ ] Test all functionality on production URL

**Acceptance Criteria:**
- [ ] Site accessible at custom domain (HTTPS)
- [ ] All API routes work in production
- [ ] SSE live updates work in production
- [ ] Page loads in < 2s on mobile (Lighthouse check)
- [ ] No console errors in production

**Eval Commands:**
```bash
# Test production API
curl -s https://[domain]/api/teams | jq length

# Lighthouse performance check
npx lighthouse https://[domain] --only-categories=performance

# Check HTTPS
curl -I https://[domain] | grep -i strict-transport
```

**Learnings:** *(Fill after phase completion)*
- What worked:
- What didn't:
- Context for next phase:

---

## User Input Requirements

> Summary of which phases need user input, enabling autonomous overnight runs.

| Phase | Autonomous? | Input Needed | Can Be Deferred? |
|-------|-------------|--------------|------------------|
| 1.1 | Yes | - | - |
| 1.2 | Yes | - | - |
| 1.3 | Yes | - | - |
| 1.4 | Yes | - | - |
| 1.5 | **No** | Design approval | No - blocks component build |
| 1.6 | Yes | - | - |
| 1.7 | Yes | - | - |
| 1.8 | **No** | Domain selection + purchase | No - blocks deployment |

**Recommended Run Strategy:**
- [x] **User online** - Sprint 1 runs with user present, checkpoints handled in real-time
- [ ] **Checkpoint at 1.5** - Get design approval before continuing
- [ ] **Checkpoint at 1.8** - Get domain decision before deployment

**Note:** Autonomy mapping included for template consistency and future reference. This sprint runs interactively.

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
| 2026-01-10 | Display times in user timezone | Better UX for international fans (Warriors, expats) |
| 2026-01-10 | **Learning: Include retrospective** | Initially missed this section from template - lesson: don't skip sections even when excited to ship |

---

## Future Considerations (Backlog)

- [ ] ELO rating system
- [ ] Strength of schedule calculation
- [ ] Push notifications for close games
- [ ] **Share ladder as image** - Generate shareable image with optional team highlight
  - Platform formats: X (1200x675), Instagram (1080x1080), iMessage/WhatsApp
  - Native share sheet on mobile
- [ ] PWA with offline support

---

## Sprint Retrospective

**IMPORTANT:** Complete this section at the end of every sprint before marking it complete.

### What Went Well
-

### What Could Be Improved
-

### Recommendations for Future Sprints
*Add actionable improvements to sprint_template.md if they apply broadly*
-

### Metrics
- **Duration:** X days
- **Phases Completed:** X/8
- **Commits:** X
- **Key Files Changed:** X

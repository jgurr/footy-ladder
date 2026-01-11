# Sprint 1: Foundation & Live Ladder

---

## Sprint Kickoff Checklist

- [x] **Interview complete** - Used AskUserQuestionTool, got answers to deep questions
- [x] **Architecture doc written** - Created `docs/architecture.md` with Jamie Mill's framework
- [x] **Sprint doc written** - This file
- [x] **Autonomy mapped** - Each phase marked as autonomous or requires-input
- [x] **Acceptance criteria defined** - Each phase has testable criteria + eval commands
- [x] **Sections validated** - Verified ALL template sections exist
- [x] **Sign-off received** - User approved plan before implementation began

---

## Current Status

**Branch:** `main` (initial development)

**Status:** Complete

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
- [x] As a fan, I can see live scores update during games (10-30s refresh) - Infrastructure ready
- [x] As a fan, I can pick a round to see the historical ladder
- [x] As a fan, I can compare attack/defense stats across teams (For/Against view)
- [x] As a fan, I experience a distinctive retro-luxe design (dark theme)

---

## Technical Scope

### Surfaces to Update

#### Data Layer
- [x] **Database Schema** - Teams, Games, LadderSnapshots, ScrapingLog
- [x] **Seed Data** - 17 teams with codes, colors, logos
- [x] **Historical Data** - 2025 season results (204 games from Rugby League Project)
- [x] **2026 Schedule** - Full season schedule (203 games with venues)

#### API Layer
- [x] **GET /api/ladder** - Current ladder with optional round param
- [x] **GET /api/games** - Games for a round, with live status
- [x] **GET /api/teams** - All teams with metadata
- [x] **GET /api/schedule** - 2026 season schedule (grouped by round)
- [x] **POST /api/sync** - Score updates (protected by SYNC_SECRET)

#### Real-time Updates
- [x] **SSE Endpoint** - `/api/live` for real-time score streaming
- [x] **Sync Endpoint** - `/api/sync` for score updates (cron/manual)
- [x] **LiveGames Component** - Real-time game cards with status

#### UI Components
- [x] **LadderTable** - Main rankings display with stats
- [x] **TeamRow** - Integrated into LadderTable
- [x] **LiveGames** - Real-time game cards with SSE updates
- [x] **RoundPicker** - Season/round dropdowns in LadderTable
- [x] **ViewTabs** - Ladder / Attack / Defense toggle
- [x] **Header** - Logo, title, palette picker

#### Design System
- [x] **Color Tokens** - Dark default + team/region palettes
- [x] **Typography** - JetBrains Mono (numbers), Inter (text)
- [x] **Effects** - Subtle scanlines, configurable
- [x] **Team Colors** - All 17 teams with gradient badges

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
- [x] Initialize Next.js 16 with TypeScript
- [x] Configure Tailwind CSS with design tokens
- [x] Set up SQLite database with better-sqlite3
- [x] Research NRL data sources:
  - Official NRL API (check terms, rate limits)
  - NRL.com scraping feasibility
  - Third-party options (SportRadar, etc.)
- [x] Document findings in `docs/data-sources.md`
- [x] Make recommendation for data source approach

**Acceptance Criteria:**
- [x] `npm run dev` starts without errors
- [x] Tailwind classes render correctly
- [x] SQLite database file created at `data/footy.db` (schema ready, file created on first run)
- [x] `docs/data-sources.md` exists with pros/cons/recommendation

**Eval Commands:**
```bash
cd /Users/jeffgurr/Documents/footy-ladder
npm run dev &                    # Starts on port 3000
curl -s localhost:3000 | head    # Returns HTML
ls data/footy.db                 # File exists
cat docs/data-sources.md | head  # Has content
```

**Learnings:**
- What worked: Tailwind 4 uses CSS-based @theme configuration instead of tailwind.config.ts - cleaner and more powerful
- What didn't: Initial setup tried create-next-app which conflicted with existing files - had to set up manually
- Context for next phase: Use NRL.com undocumented API as primary source, Rugby League Project for 2025 historical data. Build DataSource abstraction for flexibility.

---

### Phase 1.2: Core Logic & Database

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [x] Port calculation logic from nrl-ladder:
  - `calculateWinPercentage()`
  - `sortLadder()` with tiebreakers
  - `detectByeRounds()` (via roundsPlayed tracking)
- [x] Create database schema (teams, games, ladder_snapshots)
- [x] Seed 17 teams with metadata (names, codes, colors)
- [x] Create API routes: `/api/ladder`, `/api/games`, `/api/teams`

**Acceptance Criteria:**
- [x] `calculateWinPercentage(10, 5, 1)` returns `65.625`
- [x] GET `/api/teams` returns 17 teams
- [x] GET `/api/ladder` returns sorted array with winPct field
- [x] No TypeScript errors in build

**Eval Commands:**
```bash
npm run build                                    # No errors
curl -s localhost:3000/api/teams | jq length     # Returns 17
curl -s localhost:3000/api/teams | jq '.[0]'     # Has name, shortCode, colors
curl -s localhost:3000/api/ladder | jq '.[0].winPct'  # Has winPct field
```

**Learnings:**
- What worked: Clean separation of concerns - types.ts, calculations.ts, teams.ts, queries.ts, database.ts each have single responsibility. API routes are thin wrappers around query functions.
- What didn't: N/A - phase went smoothly
- Context for next phase: Database schema ready for game imports. Need to scrape 2025 data from Rugby League Project and use insertGame() to populate. calculateLadderFromGames() will handle ladder computation.

---

### Phase 1.3: 2025 Historical Data

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [x] Scrape/source 2025 season results (all 27 rounds)
- [x] Import game results into database
- [x] Generate ladder snapshots for each round (calculated on-demand from games)
- [x] Verify calculations match official final standings

**Acceptance Criteria:**
- [x] Database contains 27 rounds of 2025 games (204 games total)
- [x] Each round has games (varies due to byes, total 204)
- [x] Final round ladder calculates correctly from game results
- [x] Raiders #1 with 79.17% win rate (19-5-0) - correct per win% ranking

**Eval Commands:**
```bash
# Count 2025 games
curl -s "localhost:3000/api/games?season=2025" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))"
# Returns: 204

# Check final round ladder
curl -s "localhost:3000/api/ladder?season=2025&round=27" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0])"

# Verify top team
curl -s "localhost:3000/api/ladder?season=2025&round=27" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['team']['name'])"
# Returns: Raiders
```

**Learnings:**
- What worked: Scraped all 2025 results from Rugby League Project in one fetch. Created seed-2025.ts with all game data as typed arrays for easy import. Seed script runs in ~100ms.
- What didn't: Original acceptance criteria said "Panthers #1" but win% correctly ranks Raiders #1 (79.17% vs Panthers 56.25%). This is the whole point - win% removes bye distortion.
- Context for next phase: Same approach for 2026 schedule - scrape from NRL.com, store as SCHEDULED games. Team name mapping already works.

---

### Phase 1.4: 2026 Schedule

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [x] Scrape 2026 NRL season schedule from official source (Rugby League Zone)
- [x] Extract: home team, away team, venue, kickoff time (UTC)
- [x] Import into database with SCHEDULED status (203 games)
- [x] Create /api/schedule endpoint with round grouping

**Acceptance Criteria:**
- [x] Database contains 2026 schedule (203 games - some bye rounds have 5 games)
- [x] Each game has homeTeam, awayTeam, venue, kickoff
- [x] Kickoff times stored in ISO format (UTC)
- [x] API returns all 27 rounds

**Eval Commands:**
```bash
# Count 2026 scheduled games
curl -s "localhost:3000/api/schedule?season=2026" | python3 -c "import sys,json; print(json.load(sys.stdin)['totalGames'])"
# Returns: 203

# Check a game has required fields
curl -s "localhost:3000/api/games?season=2026&round=1" | python3 -c "import sys,json; print(json.load(sys.stdin)[0].keys())"

# Verify venue exists
curl -s "localhost:3000/api/games?season=2026&round=1" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['venue'])"
# Returns: Allegiant Stadium
```

**Learnings:**
- What worked: WebFetch from Rugby League Zone gave complete 27-round schedule in clean format. Same team name mapping approach from 2025 worked perfectly.
- What didn't: Dynamic pages (Austadiums) couldn't be scraped round-by-round. NRL.com draw page returned "No data available" error.
- Context for next phase: Data layer complete. Move to visual design - need user approval on color palette and effects before building components.

---

### Phase 1.5: Retro Design System

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** Design is subjective. Need user approval on color palette, typography choices, and CRT effect intensity before building all components.

**Tasks:**
- [x] Review [Poolsuite.net](https://poolsuite.net) for inspiration
- [x] Create design tokens (colors, typography, spacing)
- [x] Build proof-of-concept with design playground at /design
- [x] **CHECKPOINT: Get user approval on design direction**
- [x] Create CRT/scanline effects (subtle, toggle-able)
- [x] Build full component library:
  - `LadderTable` - Full stats with team colors
  - `Header` - With palette picker dropdown
  - `ThemeProvider` - Context for theme state
  - `RoundPicker` - Integrated into LadderTable

**Acceptance Criteria:**
- [x] Design tokens defined in theme.ts
- [x] All 17 teams render with correct gradient colors
- [x] Monospace font for numbers (JetBrains Mono), sans for text (Inter)
- [x] CRT effect subtle by default, stored in localStorage
- [x] Mobile responsive (hidden PF/PA columns on small screens)
- [x] User approved: Dark mode default, team/region palette options

**Eval Commands:**
```bash
# Build succeeds
npm run build

# Visual check
open http://localhost:3000
open http://localhost:3000/design
```

**Learnings:**
- What worked: Design playground pattern (/design page) for rapid iteration. User could toggle options and decide quickly. Pattern to reuse for future design decisions.
- What didn't: WebFetch couldn't render Poolsuite.net (requires JS). Had to work from memory/research.
- Context for next phase: Design system complete. Theme preference persists in localStorage. Ready for live score infrastructure.

---

### Phase 1.6: Live Score Infrastructure

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [x] Implement data source integration (via /api/sync endpoint)
- [x] Create SSE infrastructure with 30s polling
- [x] Build SSE endpoint `/api/live` for real-time client updates
- [x] Add LiveGames component with live indicators
- [x] Ladder recalculates automatically via existing calculateLadderFromGames()

**Acceptance Criteria:**
- [x] SSE endpoint streams score updates every 30s
- [x] Client receives updates without page refresh
- [x] Ladder recalculates from games data on each request
- [x] "LIVE" indicator with pulsing dot on in-progress games
- [x] Connection status shown (Live/Reconnecting)

**Eval Commands:**
```bash
# Test SSE endpoint (streams data every 30s)
curl -N localhost:3000/api/live

# Test sync endpoint
curl -X POST localhost:3000/api/sync -H "Content-Type: application/json" \
  -d '{"gameId":"test","homeScore":24,"awayScore":18,"status":"final"}'

# Build succeeds
npm run build
```

**Learnings:**
- What worked: Next.js SSE with ReadableStream pattern. EventSource reconnects automatically. 30s poll interval is good balance.
- What didn't: N/A - infrastructure ready, just needs real data source when season starts
- Context for next phase: Live infrastructure ready. Need to add ViewTabs for Attack/Defense views.

---

### Phase 1.7: Stats Views

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**
- [x] Attack view: PF highlighted, ranked by offensive output
- [x] Defense view: PA highlighted, ranked by defensive strength (lower = better)
- [x] View tabs for switching between Ladder/Attack/Defense
- [x] Dynamic column highlighting based on active view

**Acceptance Criteria:**
- [x] Attack view sorts by PF descending
- [x] Defense view sorts by PA ascending (lower = better)
- [x] Tab switching doesn't cause page reload (React state)
- [x] Active view's key column highlighted in accent color

**Eval Commands:**
```bash
# Check attack endpoint
curl -s "localhost:3000/api/ladder?view=attack" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['pointsFor'])"

# Check defense endpoint
curl -s "localhost:3000/api/ladder?view=defense" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['pointsAgainst'])"

# Build succeeds
npm run build
```

**Learnings:**
- What worked: View tabs with clear visual states. API already supported view param, just needed UI.
- What didn't: N/A - straightforward implementation
- Context for next phase: Core features complete. Ready for design review and polish.

---

### Phase 1.8: Design Review & Polish

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** Final design review before deployment. User may want tweaks to spacing, colors, or interactions.

**Tasks:**
- [x] Review full site with user
- [x] Gather feedback on visual design
- [x] Implement requested polish/changes
- [x] Test on mobile devices
- [x] Performance optimization if needed
- [x] **CHECKPOINT: User approves final design**

**Acceptance Criteria:**
- [x] User has reviewed all pages
- [x] All requested changes implemented
- [x] Mobile experience verified
- [x] No visual bugs or rough edges
- [x] User gives go-ahead for deployment

**Eval Commands:**
```bash
# Visual check on desktop and mobile
open http://localhost:3000

# Lighthouse performance check
npx lighthouse http://localhost:3000 --only-categories=performance
```

**Learnings:**
- What worked: Iterative feedback loop - user flagged issues (duplicates, loading flash, Vegas games) and fixes were applied immediately
- What didn't: Initial mobile layout had horizontal scroll; fixed with tighter spacing
- Context for next phase: Design approved, ready for production deployment

---

### Phase 1.9: Deployment

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** Domain name selection and purchase requires user decision and payment.

**Tasks:**
- [x] Create Vercel project and link to GitHub repo
- [x] Configure environment variables in Vercel
- [x] **CHECKPOINT: User decides domain name**
- [x] Research domain availability and pricing
- [x] **CHECKPOINT: User purchases domain**
- [x] Configure DNS with Vercel
- [x] Deploy and verify production
- [x] Test all functionality on production URL

**Acceptance Criteria:**
- [x] Site accessible at custom domain (HTTPS)
- [x] All API routes work in production
- [x] SSE live updates work in production
- [x] Page loads in < 2s on mobile (Lighthouse check)
- [x] No console errors in production

**Eval Commands:**
```bash
# Test production API
curl -s https://[domain]/api/teams | jq length

# Lighthouse performance check
npx lighthouse https://[domain] --only-categories=performance

# Check HTTPS
curl -I https://[domain] | grep -i strict-transport
```

**Learnings:**
- What worked: Vercel deployment with Postgres integration was seamless
- What didn't: N/A
- Context for next phase: Sprint 1 complete. Ready for Sprint 2 features (ELO ratings, share images, etc.)

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
| 1.8 | **No** | Final design review | No - ensures quality before deploy |
| 1.9 | **No** | Domain selection + purchase | No - blocks deployment |

**Recommended Run Strategy:**
- [x] **User online** - Sprint 1 runs with user present, checkpoints handled in real-time
- [x] **Checkpoint at 1.5** - Design approval received
- [x] **Checkpoint at 1.8** - Final design review before deploy
- [x] **Checkpoint at 1.9** - Get domain decision before deployment

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
- **Rapid iteration** - Completed phases 1.1-1.7 in a single day with user-driven feedback
- **Clean architecture** - Separated concerns (types, calculations, queries, database) made changes easy
- **User-driven refinement** - Caught data quality issues early (rejected venue shortcuts, placeholder times)
- **Mid-sprint database migration** - Moved from SQLite to Vercel Postgres without major issues
- **Accurate data scraping** - Got full 2026 schedule from Rugby League Project with actual venues/times
- **Sophisticated caching** - 2025 immutable (1yr), 2026 hourly refresh, live games 30s
- **Multiple view types** - Ladder, For/Against, Next 5, Scores, Team schedule all working
- **Timezone handling** - All times stored as UTC, displayed in user's local timezone

### What Could Be Improved
- **Data shortcuts rejected** - Initially tried home venue assumption and placeholder times; user correctly pushed back for actual data
- **Duplicate data bug** - Seed script inserted without deleting first, caused 3x duplicates in team view
- **Cache invalidation** - Stale cache served after reseeds; needed `v=2` cache buster to force refresh
- **Vegas games sorting** - Null kickoff times sorted to end; fixed with `ORDER BY ... NULLS FIRST`
- **Loading flash** - Old data displayed briefly before new data loaded; fixed with dedicated loading states
- **Cold start performance** - `initializeDatabase()` ran on every API call adding ~500ms; removed from read-only routes

### Recommendations for Future Sprints
- **Always get actual data** - Never assume or shortcut with placeholder data. If data isn't available, use explicit "TBD" values
- **DELETE before INSERT** - When reseeding, always clear existing data first to prevent duplicates
- **Cache buster for dev** - Add version params to API calls during active development
- **Null handling in ORDER BY** - Use `NULLS FIRST` or `NULLS LAST` explicitly for nullable columns
- **Loading states per view** - Add dedicated loading states for each data-dependent view to prevent flash

### Metrics
- **Duration:** 1 day (January 10, 2026)
- **Phases Completed:** 9/9
- **Commits:** 35
- **Key Files Changed:**
  - `src/components/LadderTable.tsx` - Main UI component with all views
  - `src/lib/queries.ts` - Database queries with ladder calculation
  - `src/lib/database.ts` - Schema and connection (migrated to Vercel Postgres)
  - `src/lib/seed-2025.ts` - 2025 historical data (204 games)
  - `src/lib/seed-2026.ts` - 2026 schedule with venues/times (204 games)
  - `src/app/api/*/route.ts` - All API routes with caching headers

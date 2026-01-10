# Footy Ladder - Architecture

> Based on [Jamie Mill's Elements of Product Design](https://jamiemill.com/blog/2021-07-10-elements-of-product-design/) framework.
> This document serves as shared context for humans and AI assistants working on this project.

---

## 1. Project Context

### Why This Exists

The NRL (National Rugby League) uses a traditional ladder system that awards 2 points per win. However, teams have different numbers of games played due to bye rounds, making the ladder misleading mid-season. A team with 8 wins from 10 games (80%) appears below a team with 9 wins from 14 games (64%).

**Footy Ladder solves this by ranking teams by win percentage**, removing bye-round distortion and showing the true competitive standing.

### Business Context

- **Type**: Public side project, not a business
- **Revenue model**: None (may add unobtrusive sponsorship later)
- **Competitive landscape**: Official NRL.com ladder, various sports apps
- **Differentiation**: Win percentage focus, retro/premium aesthetic, real-time updates

### Constraints

- Solo developer (Jeff) with Claude Code assistance
- Vercel free tier hosting
- Must respect NRL data source terms of use
- Australian timezone focus (games are AEST/AEDT)

---

## 2. User Needs

### Primary User: Fair Ladder Enthusiast

> "I want to see which team is actually performing best, not which team has played more games."

**Behaviors**:
- Checks ladder during/after games
- Shares screenshots with mates arguing about team rankings
- Cares about the "if they'd played the same games" comparison
- Wants fast, mobile-friendly access

**Jobs to be Done**:
1. See the "real" ladder based on win rate
2. Check live scores during games
3. Compare attacking/defensive strength across teams
4. Look back at how the ladder evolved over the season

### Secondary User: Stats-Curious Fan

> "I want to know if my team's defense is actually improving or just facing weak opponents."

**Behaviors**:
- Digs into stats beyond basic win/loss
- Interested in ELO, strength of schedule
- May use data for tipping competitions or fantasy
- Appreciates historical trends

---

## 3. Domain

### NRL Rugby League Concepts

| Term | Definition |
|------|------------|
| **Ladder** | League standings table showing team rankings |
| **Round** | A week of games (typically 8 games per round) |
| **Bye** | A round where a team doesn't play (2 per team per season) |
| **Points For (PF)** | Total points scored by team |
| **Points Against (PA)** | Total points conceded by team |
| **Differential (PD)** | PF minus PA |
| **Win %** | (Wins + 0.5 × Draws) / Games Played × 100 |
| **NRL Points** | Traditional ladder points (Win=2, Draw=1, Loss=0) |
| **Finals** | Top 8 teams qualify for playoffs |

### The 17 Teams (2025/2026)

```
Broncos, Bulldogs, Cowboys, Dolphins, Dragons,
Eels, Knights, Panthers, Rabbitohs, Raiders,
Roosters, Sea Eagles, Sharks, Storm, Tigers,
Titans, Warriors
```

### Season Structure

- **Regular Season**: ~27 rounds, March to September
- **Bye Rounds**: Each team has 2 byes
- **Game Times**: Thursday-Monday, primarily evening AEST
- **Finals**: September, top 8 teams

### Key Calculations

```typescript
// Core win percentage formula
winPercentage = (wins + 0.5 * draws) / gamesPlayed * 100

// Tiebreaker cascade (when win % is equal)
1. NRL Points (wins × 2 + draws)
2. Points Differential
3. Points For

// Bye detection
byesTaken = currentRound - gamesPlayed
```

### Future Domain Extensions

- **ELO Rating**: Predictive strength rating that updates after each game
- **Strength of Schedule**: Average ELO of opponents faced
- **Expected Points**: Points a team "should" have based on opponent strength

---

## 4. Product Strategy

### Core Value Proposition

**"The ladder that actually makes sense."**

Remove bye distortion. Show win percentage. Update in real-time.

### Strategic Priorities (Ordered)

1. **Accuracy** - Correct data, correct calculations, real-time freshness
2. **Clarity** - Instantly understand rankings at a glance
3. **Delight** - Retro aesthetic that makes checking the ladder fun
4. **Depth** - Stats and history for those who want to dig deeper

### What We're NOT Building

- Fantasy league management
- Betting tips or predictions
- Social features (comments, profiles)
- Other sports (AFL, soccer, etc.)
- Native mobile apps (PWA only)

### Success Metrics

- Page loads during game days
- Social shares / screenshots
- Return visitors per week
- Time to first meaningful paint

---

## 5. Conceptual Model

### Core Objects

```
┌─────────────────────────────────────────────────────────────┐
│                         SEASON                              │
│  (year, startDate, endDate, totalRounds)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ has many
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         ROUND                               │
│  (number, startTime, endTime, status: scheduled|live|done)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ has many
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          GAME                               │
│  (homeTeam, awayTeam, homeScore, awayScore, venue, time,    │
│   status: scheduled|live|final, minute)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ involves
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          TEAM                               │
│  (name, location, shortCode, logoUrl, colors)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ has (per round snapshot)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      LADDER_ENTRY                           │
│  (team, round, played, wins, losses, draws, pf, pa,         │
│   winPct, differential, position, byesTaken)                │
└─────────────────────────────────────────────────────────────┘
```

### Terminology Decisions

| Instead of... | We say... | Why |
|---------------|-----------|-----|
| "Ladder" | "Ladder" | Keep Aussie term |
| "Table" | "Ladder" | Consistency |
| "For/Against" | "Attack/Defense" | Clearer meaning |
| "Win Rate" | "Win %" | Familiar format |

### User Mental Model

1. **"The ladder updates live"** - No manual refresh needed
2. **"Position = Win %"** - Not NRL points
3. **"Byes don't count"** - Only actual games matter
4. **"Top 8 make finals"** - Visual distinction at cutoff

---

## 6. Interaction Structure and Flow

### Touchpoints

| Touchpoint | Context | Primary Action |
|------------|---------|----------------|
| **Home/Ladder** | Game day, checking standings | Scan positions, see live scores |
| **Round Picker** | Historical exploration | Jump to specific round's ladder |
| **Stats View** | Deeper analysis | Compare attack/defense rankings |
| **Live Game** | During match | See score updates, ladder impact |

### Navigation Structure

```
┌─────────────────────────────────────────────┐
│                 HEADER                      │
│  Logo / Title          Round Picker ▼       │
├─────────────────────────────────────────────┤
│                                             │
│              LADDER TABLE                   │
│  (default view, always visible)             │
│                                             │
├─────────────────────────────────────────────┤
│               VIEW TABS                     │
│  [ Ladder ] [ Attack ] [ Defense ] [ Live ] │
└─────────────────────────────────────────────┘
```

### Key Flows

**Flow 1: Check Current Ladder (Primary)**
```
1. Open site → See current ladder immediately
2. Scan positions → Find my team
3. Note win % → Compare to rivals
4. (Optional) Tap team → See game history
```

**Flow 2: Live Game Updates**
```
1. Game in progress → Scores update automatically
2. Ladder recalculates → See position changes
3. Visual indicator → Shows "live" games
4. (Optional) Tap game → See details
```

**Flow 3: Historical Exploration**
```
1. Tap round picker → See all rounds
2. Select past round → Ladder loads for that point
3. Compare to now → See how standings evolved
```

### Interactivity Patterns

- **Real-time updates**: WebSocket/SSE for live scores
- **Optimistic UI**: Instant visual feedback
- **Pull to refresh**: Mobile gesture backup
- **Keyboard navigation**: Arrow keys through table
- **Deep linking**: Share specific round views

---

## 7. Surfaces

### Visual Design Language

**Inspiration**: [Poolsuite.net](https://poolsuite.net)

| Element | Treatment |
|---------|-----------|
| **Overall vibe** | Retro-luxe, 80s Miami meets Australian pub TV |
| **Typography** | Monospace for data, serif for headings |
| **Colors** | Dark base, neon accents, team colors for rows |
| **Effects** | CRT glow, scanlines (subtle), gradient borders |
| **Imagery** | Team logos, vintage NRL aesthetic |

### Color Palette (Draft)

```css
/* Base */
--bg-primary: #0a0a0a;      /* Near black */
--bg-secondary: #1a1a1a;    /* Dark gray */
--bg-card: #242424;         /* Card surface */

/* Accent */
--neon-green: #39ff14;      /* Live indicators */
--neon-pink: #ff6b9d;       /* Highlights */
--gold: #ffd700;            /* Premium feel */

/* Semantic */
--win: #22c55e;             /* Green */
--loss: #ef4444;            /* Red */
--draw: #eab308;            /* Yellow */
--finals: #3b82f6;          /* Top 8 blue */
```

### Component Inventory

| Component | Purpose |
|-----------|---------|
| `LadderTable` | Main rankings display |
| `TeamRow` | Individual team with stats |
| `LiveScore` | Real-time game score |
| `RoundPicker` | Historical navigation |
| `StatsCard` | Attack/defense rankings |
| `TeamBadge` | Logo + name with team colors |
| `PositionIndicator` | Finals qualification visual |

### Typography

```css
/* Data/numbers - monospace for alignment */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Headings - vintage serif */
font-family: 'Playfair Display', Georgia, serif;

/* Body - clean sans */
font-family: 'Inter', -apple-system, sans-serif;
```

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, compact table |
| Tablet (640-1024px) | Expanded table, side stats |
| Desktop (>1024px) | Full layout, all views visible |

### Animation Principles

- **Subtle, not distracting** - No flashy transitions during games
- **Purposeful** - Score changes pulse briefly
- **Retro touches** - CRT flicker on load (once)
- **Smooth** - 60fps, no jank

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + custom design tokens |
| **Database** | SQLite (via better-sqlite3) or Prisma + Postgres |
| **Real-time** | SSE or Vercel Edge Config |
| **Hosting** | Vercel |
| **Domain** | TBD (suggestions: trueladder.com, footyladder.com.au) |

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   NRL Source    │────▶│  Scraper/API    │────▶│    Database     │
│  (TBD: API/Web) │     │  (Cron job)     │     │  (SQLite/PG)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │     Client      │◀────│    Next.js      │
                        │   (React SPA)   │ SSE │   (API + SSR)   │
                        └─────────────────┘     └─────────────────┘
```

### Cron Jobs

| Job | Frequency | Purpose |
|-----|-----------|---------|
| `sync-schedule` | Daily 6am | Update game schedule |
| `sync-live-scores` | Every 30s during games | Real-time score updates |
| `calculate-stats` | After each game | Update derived stats |
| `snapshot-round` | End of round | Archive ladder state |

---

## Future Considerations

### Phase 2: Advanced Stats
- ELO rating system
- Strength of schedule
- Expected points
- Team trends over time

### Phase 3: Engagement
- Push notifications for close games
- Share cards for social media
- Embed widget for forums

### Not Planned
- User accounts
- Commenting
- Predictions/tipping
- Multi-sport expansion

---

## References

- [Jamie Mill's Elements of Product Design](https://jamiemill.com/blog/2021-07-10-elements-of-product-design/)
- [Juan Fernando Pacheco's Modern Reinterpretation](https://juanfernandopacheco.medium.com/the-elements-of-product-design-a-modern-reinterpretation-ceb755391c23)
- [Poolsuite Design Inspiration](https://poolsuite.net)
- [NRL Official Site](https://www.nrl.com)

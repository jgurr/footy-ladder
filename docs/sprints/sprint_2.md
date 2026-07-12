# Sprint 2: Salary Cap & Roster Depth

---

## Sprint Kickoff Checklist

- [x] **Interview complete** - User scoped the baseline, evidence policy, and delivery order
- [x] **Rules baseline verified** - Official NRL/RLPA cap rules and allowances documented
- [x] **Pilot team selected** - Wests Tigers chosen as the first Top 30 roster to research
- [x] **Sprint doc approved** - User approved plan before implementation began
- [x] **Autonomy mapped** - Each phase marked as autonomous or requires-input
- [x] **Acceptance criteria defined** - Each phase has testable criteria + eval commands
- [x] **Sections validated** - Verified ALL template sections exist

---

## Current Status

**Branch:** `main`

**Status:** Active - Wests Tigers pilot and deep-pass audit complete, ready to scale research workflow

**Depends on:** Sprint 1 foundation data model and team metadata

**Required Reading:** `docs/architecture.md`

---

## Overview

Sprint 2 adds a salary cap and roster depth tool to Footy Ladder. The goal is to help fans understand roster strength by combining:

- The current active NRL Top 30 roster for each club
- Publicly reported player salary figures and contract terms
- Sourced salary ranges where exact figures are unavailable
- Confidence scoring based on the quality, recency, and specificity of reporting
- A team-by-team visualization of cap allocation across seasons

The feature exists because NRL salaries are private. Unlike American sports leagues, there is no official public salary database. This sprint therefore treats salary data as a research product, not just a scraped dataset. Every salary figure or range must preserve its source trail and uncertainty.

Delivery order:

1. Build a rules and data foundation.
2. Research one team first as a pilot.
3. Scale the research workflow to all 17 teams.
4. Build the UI and visualization using the completed dataset.

---

## Product Goal

Give fans a credible way to analyze how each club's Top 30 roster and salary cap profile affects roster strength, positional depth, contract risk, and future flexibility.

By the end of this sprint, users can:

- Choose a club and see its current active Top 30 roster
- See each player's reported or estimated salary cost by year
- Understand contract length and expiry year
- Distinguish exact reported salary figures from sourced ranges
- See confidence visually in the salary-cap visualization
- Click into each player to inspect sources, quotes/notes, confidence score, and reasoning
- Compare how much cap is committed by year and by player tier

---

## User Stories / Goals

- [ ] As a fan, I can view my club's current active Top 30 roster.
- [ ] As a fan, I can see each player's contract years and salary estimate/range.
- [ ] As a fan, I can tell whether a salary value is exact, ranged, inferred, or unknown.
- [ ] As a fan, I can inspect the reporting sources behind a player's salary estimate.
- [ ] As a fan, I can visually understand which contracts dominate the cap.
- [ ] As a fan, I can compare roster strength against cap allocation and future flexibility.

---

## Definitions

### Current Active Top 30

The sprint targets each club's current active Top 30 roster at the time the research pass is run. Because rosters change during the season, every roster snapshot must include:

- `asOfDate`
- `sourceUrl`
- `sourcePublishedAt` or `sourceCheckedAt`
- roster category: `top30`, `development`, `trainTrial`, `supplementary`, `unknown`

Only Top 30 players are included in the primary cap visualization. Development, supplementary, and train-and-trial players may be stored as context but must not be blended into the Top 30 cap totals unless the rules research confirms the treatment.

### Salary Value Types

| Type | Meaning | UI Treatment |
|------|---------|--------------|
| `reported_exact` | Article reports a specific annual salary or contract total that can be allocated by year | Solid cell/bar, strongest label |
| `reported_range` | Article reports a range, approximate value, or "worth up to" figure | Hatched or banded cell/bar |
| `derived_range` | Range derived from multiple reports, contract total divided by term, or cap-minimum logic | Lower opacity and explanatory note |
| `unknown` | No credible salary reporting found | Empty/neutral cell with "unknown" state |

### Confidence Score

Confidence should be stored as a numeric score from `0` to `100`, plus a display band:

| Band | Score | Evidence Standard |
|------|-------|-------------------|
| High | 80-100 | Multiple credible reports, exact figure, recent reporting, clear contract years |
| Medium | 55-79 | One credible report or multiple partial reports, range is narrow, contract years mostly clear |
| Low | 25-54 | Vague reporting, old article, unclear annualization, wide range, or indirect sourcing |
| Unknown | 0-24 | No usable salary figure; only roster or contract length known |

Confidence scoring must consider:

- Source quality and independence
- Recency
- Whether salary is exact or approximate
- Whether the figure is annual salary, total contract value, or "worth up to"
- Whether third-party agreements, bonuses, options, or club/player options could materially change cap value
- Whether the report covers the current contract or a previous contract

---

## Rules Baseline To Research

Use primary sources first. The initial official sources are:

- [NRL Salary Cap Operations](https://www.nrl.com/operations/integrity/salary-cap/)
- [NRL Statement on CBA](https://www.nrl.com/news/2023/07/05/nrl-statement-on-cba/)
- [NRL Signings Tracker](https://www.nrl.com/news/2026/01/01/2026-nrl-signings-tracker-the-latest-from-all-17-clubs/)

Known starting points from official NRL pages:

- The NRL operations page describes the Top 30 base salary cap and separate Veteran and Developed Player / Motor Vehicle allowances.
- The NRL CBA statement says the broader NRL salary cap increased significantly in 2023 and reaches a higher amount by 2027.
- The NRL signings tracker provides current roster movement and contract length reporting, but usually not salary figures.

Open questions to resolve in Phase 2.1:

- Exact Top 30 base cap by year for the relevant seasons.
- Whether the app should display Top 30 base cap only, or a broader club cap including allowances.
- How to model Veteran and Developed Player allowance.
- How to handle Motor Vehicle allowance.
- How to handle development list, supplementary list, train-and-trial, and minimum salary rules.
- How to model player options, club options, mutual options, released players, medical retirements, mid-season transfers, and freight paid by prior clubs.
- Whether reported media salaries usually refer to nominal contract value or salary-cap value.

---

## Technical Scope

### Data Layer

- [ ] Add salary-cap rule tables by season and cap bucket.
- [ ] Add roster snapshot tables for current active Top 30 lists.
- [ ] Add player identity table with aliases and source IDs.
- [ ] Add player contract table with start year, end year, options, status, and club.
- [ ] Add salary estimate table with exact/range values by player and season.
- [ ] Add salary source table with URL, publisher, published date, quote/note, and extraction metadata.
- [ ] Add confidence scoring fields and calculation notes.

### Research Workflow

- [ ] Create a repeatable source collection process for one pilot team.
- [ ] Store every figure with source URL and explanation.
- [ ] Require at least one source for every non-unknown salary value.
- [ ] Track unresolved player names and conflicting reports.
- [ ] Produce a research audit report per club.

### API Layer

- [ ] `GET /api/salary-cap/rules?season=YYYY`
- [ ] `GET /api/rosters?season=YYYY&club=CODE`
- [ ] `GET /api/salary-cap?season=YYYY&club=CODE`
- [ ] `GET /api/players/[id]/salary-sources`
- [ ] `GET /api/salary-cap/summary?season=YYYY`

### UI Surfaces

- [ ] Salary Cap landing/tool page.
- [ ] Team selector.
- [ ] Team Top 30 salary timeline visualization.
- [ ] Cap committed vs available summary.
- [ ] Player source drawer/modal.
- [ ] Confidence legend.
- [ ] Unknown / low-confidence data states.

---

## Visualization Direction

Working title: **Cap Board**.

The core visualization should feel like a retro roster ledger crossed with a futures trading board:

- Rows: players, sorted by highest estimated annual salary or average annual value.
- Columns: seasons across the top.
- Cells: salary cost for that player in that season.
- Cell fill/opacity: amount of cap consumed.
- Border/texture: confidence band.
- Contract span: continuous band across years under contract.
- Position color: optional secondary signal for spine, middle, edge, outside backs, utility.
- Left rail: player name, position, age, roster status, contract expiry.
- Top rail: season cap, committed cap, known/unknown share, open roster spots.
- Click interaction: player detail drawer with salary estimate, contract logic, sources, confidence score, and unresolved caveats.

Visual confidence treatment:

- High: solid fill, clean border.
- Medium: subtle diagonal hatch.
- Low: dotted outline or translucent fill.
- Unknown: empty cell with muted placeholder.

The UI must make uncertainty visible without making the tool feel broken. Unknowns are part of the story.

---

## Implementation Phases

> **Phase Structure Requirements:**
> - Each phase MUST have acceptance criteria.
> - Each phase MUST be marked as autonomous or requires-input.
> - After completing each phase, fill in the Learnings section before proceeding.

---

### Phase 2.1: Rules Research & Data Model

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**

- [x] Research NRL salary cap rules from official sources.
- [x] Document Top 30 cap by season and allowances.
- [x] Document minimum salary rules and roster categories.
- [x] Decide internal cap buckets and terminology.
- [x] Design database schema for players, rosters, contracts, salary estimates, sources, and confidence.
- [x] Write migration/seed plan.
- [x] Create `docs/salary-cap-rules.md`.

**Acceptance Criteria:**

- [x] `docs/salary-cap-rules.md` exists with sourced rules and unresolved caveats.
- [x] Schema supports exact salary, salary ranges, unknown salaries, source links, and confidence scores.
- [x] Schema can represent player/club options and mid-contract movement.
- [x] No data model depends on a salary being public.

**Eval Commands:**

```bash
test -f docs/salary-cap-rules.md
rg "Top 30|allowance|minimum|confidence|source" docs/salary-cap-rules.md
npm run build
```

**Learnings:**

- What worked: The official NRL Salary Cap Operations page gives enough structure for the first model: Top 30 base cap, veteran/developed allowance, motor vehicle allowance, supplementary list, spend floor, included benefits, bonuses, and excluded outside-cap categories.
- What didn't: Public official sources do not cleanly expose every annual value needed for 2025 and 2026, and there is a visible discrepancy between the 2022 media release and the current operations page for 2023 cap values.
- Context for next phase: Use Top 30 base cap as the primary comparison line, preserve allowances separately, and keep unresolved cap-rule caveats visible while researching Wests Tigers players.

---

### Phase 2.2: Pilot Team Research Pass

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** User chose Wests Tigers as the first team. The pilot team has several well-reported contracts and enough roster movement to test the data model.

**Selected pilot team:**

- **Wests Tigers** - rich reporting around Jarome Luai and a major roster rebuild should stress-test salary ranges, contract options, releases, future commitments, and source confidence.

**Tasks:**

- [x] Confirm pilot team: Wests Tigers.
- [x] Capture current active Top 30 roster snapshot.
- [x] Research every Top 30 player's contract length.
- [x] Research every Top 30 player's reported salary or salary range.
- [x] Store all sources and confidence scores.
- [x] Identify conflicts, gaps, and uncertainty patterns.
- [x] Produce pilot research audit.

**Acceptance Criteria:**

- [x] Pilot team has 30 Top 30 roster records or documented reason why roster count differs.
- [x] Every pilot player has contract years or an `unknown` status with notes.
- [x] Every non-unknown salary estimate has at least one source.
- [x] Every player has a confidence band.
- [x] Research audit lists data gaps and source conflicts.

**Eval Commands:**

```bash
node scripts/salary-cap/audit-team.mjs --team TEAM_CODE --season 2026
node scripts/salary-cap/coverage.mjs --team TEAM_CODE --season 2026
npm run build
```

**Learnings:**

- What worked: Combining the official Wests Tigers Teams page with the official NRL Signings Tracker produced a defensible working Top 30. The club page captured current profile membership, while the NRL tracker clarified contract years, future gains, train-and-trial notes, and releases.
- What didn't: The club Teams page lists 37 NRL Premiership profiles, so it cannot be treated as Top 30 by itself. Many lower-salary players have no public salary figure in the first pass.
- Second-pass correction: Wests Tigers' own signings tracker creates a Top 30/Development List conflict for Bunty Afoa, Javon Andrews, Patrick Herbert, and Faaletino/Tino Tavana. Treat Top 30 confidence as medium, about 68/100, not final.
- Credentialed source correction: Daily Telegraph / Code Sports gives direct individual roster values for 17 Tigers players, and SMH directly reports Sione Fainu's three-year, $1.1m extension. Earlier Zero Tackle-backed figures were replaced or downgraded unless a direct article claim supports the number.
- Data coverage: 30 working roster records, 17 direct individual 2026 salary/value claims, 13 unknown individual salary/value states, 4 ambiguous Top 30/development records, and 9 excluded/monitor players.
- Context for next phase: The scale-up workflow should preserve a club-profile source, an NRL tracker source, a salary-source pass, and an audit report for each club. The UI must show known cap coverage separately from total roster size.

---

### Phase 2.3: Scale Research To All 17 Teams

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**

- [ ] Apply the pilot workflow to all 17 clubs.
- [ ] Capture current active Top 30 roster snapshot for each club.
- [ ] Research contract years and salary values/ranges for every Top 30 player.
- [ ] Store source trails and confidence scoring.
- [ ] Normalize player names and aliases.
- [ ] Generate cross-club coverage report.
- [ ] Flag low-confidence teams and players.

**Acceptance Criteria:**

- [ ] All 17 clubs have a current active Top 30 roster snapshot.
- [ ] All Top 30 players have contract status and salary estimate state.
- [ ] 100% of non-unknown salary values have sources.
- [ ] Coverage report shows exact/range/unknown counts by team.
- [ ] Data import is reproducible.

**Eval Commands:**

```bash
node scripts/salary-cap/audit-all.mjs --season 2026
node scripts/salary-cap/coverage.mjs --season 2026
npm run build
```

**Learnings:**

- TBD

---

### Phase 2.4: Roster Strength Metrics

**Autonomy:** [ ] Autonomous | [x] Requires User Input

**Why input needed:** Roster strength can be measured several ways. User should approve the first metric set before implementation.

**Candidate metrics:**

- Cap concentration: share of known/estimated cap in top 3, top 5, top 10 contracts.
- Positional allocation: spine, middle, edge, outside backs, bench/utility.
- Known cap coverage: how much of the roster has medium/high confidence salary estimates.
- Future flexibility: committed cap by season vs cap rule baseline.
- Depth profile: first-grade experience and positional cover across Top 30.
- Value lens: ladder/ELO contribution vs estimated cap cost, if a reliable performance metric exists.

**Tasks:**

- [ ] Recommend first roster strength metric set.
- [ ] Get user approval.
- [ ] Implement calculations.
- [ ] Add tests for cap totals, concentration, and unknown handling.

**Acceptance Criteria:**

- [ ] Metrics work even when many salaries are unknown.
- [ ] Metrics distinguish known committed cap from estimated/unknown cap.
- [ ] No team is unfairly ranked as "cheap" due to missing data.
- [ ] Tests cover exact, range, low-confidence, and unknown salary cases.

**Eval Commands:**

```bash
npm test -- salary-cap
npm run build
```

**Learnings:**

- TBD

---

### Phase 2.5: Cap Board UI

**Autonomy:** [x] Autonomous | [ ] Requires User Input

**Tasks:**

- [ ] Build salary cap route.
- [ ] Build team selector.
- [ ] Build Cap Board visualization.
- [ ] Add confidence legend and visual encoding.
- [ ] Add player detail drawer with source links and confidence explanation.
- [ ] Add cap summary strip by year.
- [ ] Add responsive mobile treatment.
- [ ] Add loading, empty, and low-confidence states.

**Acceptance Criteria:**

- [ ] User can select every club.
- [ ] Players are sorted by highest estimated annual salary or AAV.
- [ ] Years appear across the top.
- [ ] Confidence is visible without opening the detail drawer.
- [ ] Player click opens sources and confidence details.
- [ ] Visualization works on mobile and desktop.
- [ ] UI does not imply private salary data is official fact.

**Eval Commands:**

```bash
npm run build
npm run dev
# Manual QA:
# - Open salary-cap page
# - Switch teams
# - Open player detail drawer
# - Verify confidence styling
# - Verify mobile viewport
```

**Learnings:**

- TBD

---

## Data Quality Rules

- Never use the original `/Users/jeffgurr/nrl-ladder` project as a data source.
- Prefer official NRL and club pages for roster membership and contract length.
- Prefer primary publisher pages over syndicated copies.
- Store article URL, publisher, author if available, published date, accessed date, and the specific claim being used.
- Do not store a salary figure without explaining whether it is annual, total contract value, approximate, or inferred.
- When sources conflict, preserve both and explain the selected value/range.
- Unknown is acceptable. False precision is not.
- Every displayed team total must disclose how much is exact, ranged, derived, and unknown.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Salaries are private and inconsistently reported | High | Use confidence scoring, ranges, and unknown states |
| Media reports may describe contract value differently | High | Store salary type and annualization notes |
| Top 30 rosters change mid-season | High | Snapshot rosters with `asOfDate` |
| Paywalled articles may contain key figures | Medium | Store citation metadata and use accessible corroboration when possible |
| Allowances and third-party agreements distort cap comparisons | Medium | Separate base Top 30 estimates from allowances and disclose caveats |
| Low-confidence teams look artificially cheap | High | Metrics must distinguish known cap from unknown cap |
| UI may imply official salary certainty | High | Confidence styling and source drawer must be prominent |

---

## Open Decisions

- [x] Which team should be the pilot research team? Wests Tigers.
- [ ] Should the first UI compare against Top 30 base cap only, or show broader cap including allowances when available?
- [ ] Should salary ranges display midpoint by default, min/max band, or both?
- [ ] Should roster strength include performance metrics in this sprint or wait for a later sprint?
- [x] Should paywalled-but-credible salary articles be stored as sources if the claim is visible in snippets or secondary reporting? Yes, but only when the stored source URL points directly to the article making the number claim; use credentialed access where available.

---

## Recommended Next Decision

Approve the sprint plan so Phase 2.1 can begin with rules research and the salary-cap data model.

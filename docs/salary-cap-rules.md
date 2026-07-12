# NRL Salary Cap Rules Baseline

> Sprint 2 source baseline for the salary cap and roster depth tool.
> Last checked: 2026-07-11.

---

## Purpose

This document defines the working salary-cap rules model for Footy Ladder. It is intentionally conservative: the app should show public reporting, ranges, and uncertainty rather than implying access to official club cap ledgers.

NRL player salaries are private. The NRL Salary Cap Auditor has access to lodged contracts and can value players for cap purposes, but public reporting usually describes contract value, playing fee, or approximate media estimates. Those are useful fan-facing signals, but they are not guaranteed to equal official salary-cap value.

---

## Primary Sources

- [NRL Salary Cap Operations](https://www.nrl.com/operations/integrity/salary-cap/)
- [NRL Statement on CBA](https://www.nrl.com/news/2023/07/05/nrl-statement-on-cba/)
- [NRL announces record-high salary caps for 2023 season](https://www.nrl.com/news/2022/12/23/nrl-announces-record-high-salary-caps-for-2023-season/)
- [NRL Unpacked: How does the salary cap work?](https://www.nrl.com/news/2022/04/29/nrl-unpacked-how-does-the-salary-cap-work/)
- [RLPA: The CBA](https://www.rlpa.com.au/the-cba/)

---

## Working Cap Buckets

The app should separate these buckets instead of collapsing them into one number:

| Bucket | Treatment | Notes |
|--------|-----------|-------|
| Top 30 base cap | Primary comparison line | Best default for player salary estimates because the feature focuses on Top 30 players. |
| Veteran and Developed Player Allowance | Separate allowance | Can affect actual cap room but should not be blended into base Top 30 totals unless a player-specific source supports it. |
| Motor Vehicle Allowance | Separate allowance | Maximum five vehicles for Top 30 players, valued at $20,000 each. |
| Supplementary List | Separate roster category | Replaced the Development List under the 2023-27 CBA period. |
| Outside-cap benefits | Excluded context | Includes categories such as education, approved traineeships, reasonable relocation, representative payments, prize money, and approved third-party agreements. |

---

## Known Rule Facts

### Current CBA Period

The RLPA states the current CBA was agreed in 2023 and covers NRL, NRLW, and specified representative players through the end of the 2027 season.

The NRL operations page says the 2023-27 CBA was agreed with the RLPA and signed in February 2024.

### Top 30 Base Cap

The NRL operations page states:

- 2023: $11.05 million base, $100,000 motor vehicle allowance, $300,000 Veteran and Developed Player Allowance, $11.45 million total Top 30 cap.
- 2024: $11.25 million base, $100,000 motor vehicle allowance, $300,000 Veteran and Developed Player Allowance, $11.65 million total Top 30 cap.
- 2025: $11.4 million base, $100,000 motor vehicle allowance, $300,000 Veteran and Developed Player Allowance, $11.8 million total Top 30 cap.
- 2026: $11.55 million base, $100,000 motor vehicle allowance, $300,000 Veteran and Developed Player Allowance, $11.95 million total Top 30 cap.
- 2027: $11.7 million base, $100,000 motor vehicle allowance, $300,000 Veteran and Developed Player Allowance, $12.1 million total Top 30 cap.

Important caveat: a December 2022 NRL media release said the 2023 NRL Premiership salary cap would be $12.1 million. The current operations page is treated as the preferred source for the app's Top 30 cap model.

### Allowances

The NRL operations page lists these allowances for the current CBA period:

- Veteran and Developed Player Allowance: up to $300,000 per year.
- Motor Vehicle Allowance: up to $100,000 per year, through five vehicles valued at $20,000 each.

The Veteran and Developed Player Allowance applies to eligible players developed by the club before becoming NRL players, players with at least eight years as a Top 30 player at the club, or players with at least ten years as a Top 30 player across the game.

### Minimum Salary

The NRL operations page says the Top 30 minimum was:

- 2023: $120,000
- 2024: $130,000
- Then increasing by $5,000 per year until 2027

The NRL CBA statement says the minimum wage progressively increases to $150,000 by 2027. This may refer to a broader minimum-wage definition or a later finalized term. Treat minimum-salary data as source-sensitive until resolved against the long-form CBA or another official rule table.

### Supplementary List

The NRL operations page says the NRL Development List was replaced by the NRL Supplementary List during the 2023-27 CBA period, with Supplementary List players entitled to $80,000 per year.

### Spend Floor

The NRL operations page says clubs are required to spend at least 97.5% of the salary cap. An older 2022 NRL explainer said clubs had been required to spend at least 95% since 2018. Treat 97.5% as the current rule because it appears on the current operations page.

---

## What Counts Toward Cap Value

For Top 30 players, the NRL operations page says salary-cap value can include:

- Playing fee.
- Included benefits such as accommodation, travel, motor vehicles, medical insurance allowances, interest-free loans, manager fees, and applicable fringe benefits tax.
- Match-fee bonuses, calculated from prior-year NRL games played times the applicable bonus.
- Other expected bonuses, including representative bonuses when expected based on prior-year performance.

If a bonus is achieved but was not assessed in that year's salary-cap value, it is carried forward into the following year's salary-cap value.

---

## What Can Sit Outside The Cap

The NRL operations page lists excluded or potentially excluded categories including:

- Tertiary education fees.
- Approved traineeships.
- Reasonable relocation and temporary accommodation costs.
- Representative payments such as State of Origin, All Stars, and Test matches.
- Prize money.
- Approved third-party agreements from parties not related to the club, provided they are not used to induce the player to sign with the club.
- Sponsor leveraging agreements with game sponsors, subject to approval.

For the app, these should be captured as caveats or source notes. They should not be used to adjust a player's salary estimate unless a reliable source gives player-specific details.

---

## Public Salary Data Policy

The app should use these value types:

| Type | Meaning |
|------|---------|
| `reported_exact` | A source reports a specific annual salary or contract value that can be allocated by year. |
| `reported_range` | A source reports a range, approximation, "about", "around", or "worth up to" figure. |
| `derived_range` | The app derives a range from multiple sources, total value divided by term, minimum-salary floor, or conflicting reports. |
| `unknown` | No credible salary value is available. |

Every non-unknown salary estimate must have at least one stored source.

The app should preserve the original claim shape:

- Annual salary.
- Total contract value.
- Average annual value.
- Cap value.
- Market estimate.
- Minimum salary floor.
- Unknown.

---

## Confidence Policy

Confidence is scored from 0 to 100 and displayed as a band:

| Band | Score | Standard |
|------|-------|----------|
| High | 80-100 | Exact or narrow salary reporting from strong, recent sources with clear contract years. |
| Medium | 55-79 | Credible reporting with some ambiguity, or multiple partial reports that support a narrow range. |
| Low | 25-54 | Vague, dated, indirect, or wide-range reporting. |
| Unknown | 0-24 | Contract or roster info only, with no usable salary figure. |

The confidence score must account for:

- Source quality.
- Source independence.
- Recency.
- Specificity of salary claim.
- Whether the report covers the current contract.
- Whether annualization is direct or inferred.
- Whether options, bonuses, third-party agreements, or freight paid by a previous club could materially change actual cap value.

---

## Data Model Implications

The schema must support:

- Multiple roster snapshots per club and season.
- Player aliases, because public sources use inconsistent names and initials.
- Contract years, options, releases, medical retirements, loans/freight, and source notes.
- Multiple salary estimates per player-season when sources conflict.
- Source records independent from salary estimates, so one article can support several claims.
- Confidence scores and written reasoning separate from the numeric salary.
- Unknown values as first-class records, not missing data.

---

## Migration And Seed Plan

Phase 2.1 adds empty schema first. Salary-cap data should be loaded in this order:

1. Seed rule facts into `salary_cap_rules`, one record per season, bucket, and source.
2. Insert or upsert player identities into `players`.
3. Add alternate names into `player_aliases`.
4. Create a dated club roster source in `roster_snapshots`.
5. Attach players to that snapshot through `roster_entries`.
6. Create `player_contracts` from official club/NRL signing information.
7. Create `salary_sources` for every article or source used.
8. Create `salary_estimates` for each player-season, including unknown records.
9. Link supporting articles through `salary_estimate_sources`.
10. Run audit scripts before exposing data in the UI.

Rule facts should not be inferred unless the record clearly says so in `notes`. The 2023-2027 Top 30 table on the NRL operations page is directly sourced and can be seeded.

---

## Unresolved Questions

- Whether the $150,000 2027 minimum in the NRL CBA statement supersedes or refers to a different category than the operations page minimum-salary language.
- Whether the first UI should show only Top 30 base cap or include a toggle for broader cap including allowances.
- How often the app should refresh Top 30 roster snapshots during the season.
- Whether paywalled-but-credible salary articles can be stored when the specific salary claim is only visible via snippets or secondary reporting.

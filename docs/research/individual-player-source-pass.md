# Individual Player Salary Source Pass

> Sprint 2 research standard.
> Started: 2026-07-12.

## Standard

The all-club Daily Telegraph roster-value article is a backup baseline, not a primary source for most players.

For each top-30 player, run player-focused searches and capture every authoritative link that materially supports salary, contract value, average annual value, contract term, or option structure.

## Query Pattern

For every player:

```text
"{player name}" "{team name}" salary contract worth deal extension
site:dailytelegraph.com.au "{player name}" salary contract
site:smh.com.au "{player name}" salary contract
site:news.com.au "{player name}" contract salary NRL
site:nine.com.au/sport/nrl "{player name}" contract salary
site:foxsports.com.au/nrl "{player name}" contract salary
site:{club-domain} "{player name}" contract
```

## Source Roles

| Role | Meaning |
|------|---------|
| `primary_individual_report` | Player-focused article directly supports the selected salary estimate. |
| `cross_referenced_baseline` | Roster-value baseline is supported by one or more player-focused salary/contract articles, but the selected 2026 value still needs stronger direct support. |
| `backup_baseline` | League-wide roster valuation only. Useful lead, not primary evidence. |
| `bucket_unknown` | Player appears only in a grouped roster bucket. |
| `open_unknown` | No individual salary claim captured yet. |

## Promotion Rules

- Do not promote a search snippet into a salary estimate unless the article has been opened and reviewed.
- Official NRL/club pages can support contract years and roster status, but they usually do not support salary.
- A total contract value can become an annual estimate only when the article clearly states the term and the relevant seasons.
- Keep future-year deal reporting separate from the selected 2026 cap value unless the article explicitly applies to 2026.
- If two authoritative sources conflict, retain both links and mark the estimate as a range or lower confidence.

## Initial Search Check

These were checked as a proof of workflow before the full 481-player harvest:

| Player | Source | Link | Current Use |
|--------|--------|------|-------------|
| Payne Haas | Brisbane Broncos official profile | https://www.broncos.com.au/teams/nrl-premiership/brisbane-broncos/payne-haas/ | Contract term support only; official profile says his Broncos contract runs through 2026. |
| Reece Walsh | Brisbane Broncos official profile | https://www.broncos.com.au/teams/nrl-premiership/brisbane-broncos/reece-walsh/ | Roster/profile support only; no salary claim found on profile. |
| Reece Walsh | News.com.au search lead | https://www.news.com.au/sport/nrl/andrew-johns-shocked-as-reece-walsh-loses-1-million-in-contract-steal/news-story/8eac466019fc8c77d9a3bbeb918ba460 | Salary lead only until full article review. |
| Kotoni Staggs | News.com.au search lead | https://www.news.com.au/sport/nrl/selwyn-cobbo-could-be-forced-out-of-broncos-as-kotoni-staggs-set-to-sign-2-million-deal/news-story/e49d7791b0e6fae9a01020da796dc0ab | Salary lead only until full article review. |
| Payne Haas | Nine / ESPN search leads | https://www.nine.com.au/sport/nrl/news-2026-payne-haas-brisbane-broncos-exit-south-sydney-rabbitohs-contract-burning-questions-analysis-20260208-p5o0lk.html and https://www.espn.com/nrl/story/_/id/47864015/nrl-brisbane-broncos-superstar-signs-threeyear-deal-south-sydney-rabbitohs | Future contract leads only until full article review. |

## Next Pass

Work team by team. For each player, capture:

- Search queries run.
- Article links reviewed.
- Salary/value claim text summary.
- Contract term and option years.
- Whether the article supports 2026, future years, or only market context.
- Confidence role and score.

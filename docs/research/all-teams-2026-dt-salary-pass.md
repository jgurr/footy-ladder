# All Teams 2026 Salary Valuation Pass

> Source expansion pass for Sprint 2.
> Checked: 2026-07-11.

## Scope

This pass scales the salary-cap dataset from the Wests Tigers pilot to all 17 NRL clubs using the Daily Telegraph roster-value investigation as the first all-club salary/value source.

## Source Policy

- [Daily Telegraph: NRL Rich List / true roster value investigation](https://www.dailytelegraph.com.au/sport/nrl/the-true-value-of-every-nrl-roster-revealed-and-the-clubs-breaking-the-salary-cap/news-story/a4bafaad73cb13efaa7b8c292800cd52) is used for individual roster values and grouped rest-bucket totals.
- [NRL 2026 Signings Tracker](https://www.nrl.com/news/2026/01/01/2026-nrl-signings-tracker-the-latest-from-all-17-clubs/) was consulted for movement/contract context, but the generated non-Wests records still need a player-by-player contract-length deep pass.
- Daily Telegraph values remain labelled as media roster valuations, not official NRL salary-cap ledger salaries.

## Coverage

| Metric | Count |
|--------|------:|
| Clubs | 17 |
| Player records | 481 |
| Direct individual DT valuation records | 289 |
| Grouped / unknown individual records | 192 |

Each club has 17 individually valued players from the Daily Telegraph table. Remaining named players come from the article's grouped rest bucket and should not be assigned an individual salary until a direct article or official source supports it.

## Contract-Year Caveat

Wests Tigers retain the richer contract-year pilot data. For the other 16 clubs, `contractYears` is currently `[2026]` as a placeholder. That keeps the UI honest: the salary values are scaled, but multi-year roster-depth analysis still needs an official contract-length pass per team.

## UI Evidence Bands

The Cap Board now shows qualitative source badges rather than repeated numeric scores:

- `Layered` - current value plus corroborating historical/future article context.
- `Direct` - direct individual media roster valuation.
- `Bucket` - player is named only in a grouped rest bucket.
- `Open` - no individual salary claim found.

The expanded player row still shows the numeric confidence score for auditability.

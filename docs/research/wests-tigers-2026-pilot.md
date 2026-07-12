# Wests Tigers 2026 Salary Cap Pilot

> Sprint 2 Phase 2.2 pilot research pass.
> Last checked: 2026-07-11.

> Second-pass note: this pilot has been superseded for roster-confidence purposes by
> `docs/research/wests-tigers-2026-deep-pass.md`. The working 30 remains useful, but
> Top 30 confidence is now medium because four records have Top 30/Development List
> ambiguity.

---

## Source Spine

- [Wests Tigers Teams](https://www.weststigers.com.au/teams/) - official club profile page. It lists 37 NRL Premiership profiles, so it is broader than Top 30.
- [NRL 2026 Signings Tracker](https://www.nrl.com/news/2026/01/01/2026-nrl-signings-tracker-the-latest-from-all-17-clubs/) - official contract-year tracker and player movement source.
- [Daily Telegraph: NRL Rich List / true roster value investigation](https://www.dailytelegraph.com.au/sport/nrl/the-true-value-of-every-nrl-roster-revealed-and-the-clubs-breaking-the-salary-cap/news-story/a4bafaad73cb13efaa7b8c292800cd52) - credentialed source pass. Direct Wests Tigers section lists individual roster values for 17 players and a grouped "rest" value.
- [SMH: Sione Fainu contract](https://www.smh.com.au/sport/nrl/nrl-around-the-clubs-preseason-week-one-20260202-p5nyxn.html) - credentialed source pass. Directly reports Sione Fainu's three-year extension value at $1.1m.
- [Paid-media player-by-player source matrix](/Users/jeffgurr/Documents/footy-ladder/docs/research/wests-tigers-2026-paid-media-player-search.md) - Daily Telegraph and SMH search pass across all 30 working players, with direct salary claims separated from context-only articles.
- [Wests Tigers: Doueihi extends stay with Tigers until 2029](https://www.weststigers.com.au/news/2026/03/13/doueihi-extends-stay-with-tigers-until-2029/) - official contract length source.
- [Wests Tigers: MAYDAY: Terrell and Taylan extend until 2030](https://www.weststigers.com.au/news/2026/05/01/mayday-terrell-and-taylan-extend-until-2030/) - official contract length source.
- [news.com.au: Luai future report](https://www.news.com.au/sport/nrl/nrl-rocked-by-shock-jarome-luai-bombshell-as-wests-tigers-make-stunning-decision/news-story/c1e79e9251ee4fc027c044430dc97763) - public salary context around Luai release.

---

## Roster Interpretation

Working Top 30: 30 players.

Method:

1. Start with the NRL Signings Tracker Wests Tigers 2026 contract list.
2. Exclude future-only, train-and-trial, and released entries.
3. Add Bunty Afoa and Javon Andrews because they are current Wests Tigers NRL profiles and listed by the NRL tracker as 2026 gains.
4. Keep unresolved club-profile-only players in the monitor list.

Key caveats:

- The official club Teams page lists more than 30 NRL Premiership profiles.
- The later club signings tracker lists some players in both NRL Squad and NRL Development List contexts.
- Jake Averillo is a 2027 gain, not a 2026 Top 30 pilot player.
- Junior Tupou is listed as train-and-trial for 2027.
- Luke Laulilii remains on the club profile page but is listed as a mid-season release to the Warriors.
- Ethan Roberts is reported by Wests Tigers as development in 2026 and Top 30 from 2027.
- Bunty Afoa, Javon Andrews, Patrick Herbert, and Faaletino/Tino Tavana should be treated as ambiguous until their 2026 roster category is independently resolved.

---

## Pilot Coverage

| Category | Count |
|----------|------:|
| Working Top 30 players | 30 |
| Players with direct individual 2026 salary/value claim | 17 |
| Players with unknown individual 2026 salary/value claim | 13 |
| Excluded / monitor records | 9 |

This is a good early signal for the UI: the tool must show known coverage separately from total cap. Treating unknown players as cheap would be misleading. The Daily Telegraph values are published roster values, not official NRL cap ledger values, so the UI should label them as media-sourced valuations.

---

## Working Top 30 Salary Notes

| Player | Position | Contract years | 2026 salary state | Confidence |
|--------|----------|----------------|-------------------|------------|
| Jarome Luai | Halfback | 2026 | $1.0m Daily Telegraph roster value | Medium |
| Terrell May | Prop | 2026-2030 | $885k Daily Telegraph roster value | Medium |
| Jahream Bula | Fullback | 2026-2030 | $815k Daily Telegraph roster value | Medium |
| Adam Doueihi | Centre | 2026-2029 | $725k Daily Telegraph roster value | Medium |
| Kai Pearce-Paul | 2nd Row | 2026-2028 | $700k Daily Telegraph roster value | Medium |
| Fonua Pole | Prop | 2026-2027 | $665k Daily Telegraph roster value | Medium |
| Apisai Koroisau | Hooker | 2026-2028 | $650k Daily Telegraph roster value | Medium |
| Samuela Fainu | 2nd Row | 2026-2027 | $650k Daily Telegraph roster value | Medium |
| Alex Twal | Prop | 2026-2029 | $565k Daily Telegraph roster value | Medium |
| Taylan May | Centre | 2026-2030 | $550k Daily Telegraph roster value | Medium |
| Sunia Turuva | Winger | 2026-2030 | $500k Daily Telegraph roster value | Medium |
| Royce Hunt | Prop | 2026-2027 | $425k Daily Telegraph roster value | Medium |
| Alex Seyfarth | 2nd Row | 2026-2028 | $425k Daily Telegraph roster value | Medium |
| Sione Fainu | Prop | 2026-2029 | $405k Daily Telegraph roster value; SMH reports $1.1m/3yr extension for future years | Medium |
| Starford To'a | Centre | 2026 | $375k Daily Telegraph roster value | Medium |
| Heamasi Makasini | Centre | 2026-2029 | $350k Daily Telegraph roster value | Medium |
| Jock Madden | Halfback | 2026-2027 | $250k Daily Telegraph roster value | Medium |
| Bunty Afoa | Prop | 2026 | Unknown | Unknown |
| Heath Mason | Fullback | 2026 | Unknown | Unknown |
| Javon Andrews | Five-Eighth | 2026-2028 | Unknown | Unknown |
| Jeral Skelton | Winger | 2026 | Unknown individual value; grouped in Daily Telegraph "rest" bucket | Unknown |
| Kit Laulilii | Lock | 2026 | Unknown | Unknown |
| Latu Fainu | Five-Eighth | 2026-2027 | Unknown individual value; grouped in Daily Telegraph "rest" bucket | Unknown |
| Mavrik Geyer | 2nd Row | 2026 | Unknown | Unknown |
| Patrick Herbert | Centre | 2026-2027 | Unknown | Unknown |
| Solomone Saukuru | Centre | 2026 | Unknown | Unknown |
| Tony Sukkar | 2nd Row | 2026 | Unknown | Unknown |
| Tristan Hope | Hooker | 2026 | Unknown | Unknown |
| Faaletino Tavana | Fullback | 2026-2029 | Unknown | Unknown |
| William Craig | Winger | 2026 | Unknown | Unknown |

---

## Excluded / Monitor

| Player | Reason |
|--------|--------|
| Jake Averillo | Future 2027 gain. |
| Junior Tupou | 2027 train-and-trial note. |
| Ethan Roberts | Development deal in 2026, Top 30 in 2027. |
| Luke Laulilii | Mid-season release to Warriors per NRL tracker. |
| Charlie Murray | Club profile exists, but not in NRL tracker current contract list. |
| Jared Haywood | Club profile exists, but not in NRL tracker current contract list. |
| Josese Lanyon | Club profile exists, but not in NRL tracker current contract list. |
| Lachlan Broederlow | Club profile exists, but not in NRL tracker current contract list. |
| Peter Taateo | Club profile exists, but not in NRL tracker current contract list. |

---

## Next Research Steps

- Resolve whether Daily Telegraph roster values should be displayed as the primary estimate type or separated from reported contract salaries in the first UI.
- Resolve Jahream Bula's reported extension value, because reporting supports contract structure but not a clean individual 2026 cap number beyond the roster-value table.
- Re-open the 2025 Tigers scouting report if extraction improves; the paid-media pass found search snippets suggesting salary content, but the credentialed page did not expose usable article text.
- Decide whether unknown players should display as blank cells or minimum-salary floor ranges in the first Cap Board prototype.

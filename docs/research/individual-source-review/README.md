# Individual Player Source Review - 2026 Salary Cap

Generated: 2026-07-12

This folder is the all-player source-discovery review for the 2026 salary-cap dataset.
It is intentionally a review queue, not final salary truth. Public NRL salaries are private,
so a candidate link only becomes salary evidence after the article text is reviewed and the
reported number/term is copied into the player source trail.

## Files

- `player-source-review-2026.json` - canonical merged machine-readable review queue.
- `player-source-review-2026.csv` - filterable human review file.
- `player-source-review-2026-chunk-*.json` / `.csv` - chunk outputs used to build the merged file.

## Method

- 481 players searched across all 17 teams.
- 5,291 player/source query combinations executed.
- Bing News RSS was used for the completed pass because it exposes decoded publisher URLs.
- Google News RSS returned temporary 503 responses during this run and was not used for the final merged file.
- Query types per player: general, Daily Telegraph, SMH, Nine, Fox Sports, News.com.au, 7NEWS, Yahoo Sports, Zero Tackle, NRL.com, club domain.

## Coverage

| Metric | Count |
| --- | ---: |
| Players searched | 481 |
| Players with at least one candidate | 200 |
| Players with authoritative exact-name candidate | 107 |
| Players with no candidate found | 281 |
| Total candidate links | 506 |
| Exact-name candidate links | 260 |
| Authoritative candidate links | 428 |
| Player-focused authoritative candidates | 241 |
| Team/context authoritative candidates | 187 |

## Priority Source Counts

| Source | Candidate links |
| --- | ---: |
| Daily Telegraph | 54 |
| SMH | 28 |
| Fox Sports | 18 |
| News.com.au | 16 |
| Nine | included where Bing surfaced `nine.com.au` direct URLs; most Nine hits were not salary-specific in this pass |

## Team Coverage

| Team | Players | With candidates | Exact-name authoritative | Candidates | Priority-source candidates | No candidate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Brisbane Broncos | 28 | 17 | 11 | 54 | 13 | 11 |
| Canberra Raiders | 29 | 6 | 2 | 7 | 2 | 23 |
| Canterbury-Bankstown Bulldogs | 30 | 9 | 6 | 18 | 3 | 21 |
| Cronulla-Sutherland Sharks | 28 | 6 | 4 | 9 | 5 | 22 |
| Dolphins | 28 | 20 | 12 | 67 | 5 | 8 |
| Gold Coast Titans | 29 | 20 | 4 | 36 | 3 | 9 |
| Manly Warringah Sea Eagles | 27 | 9 | 1 | 19 | 6 | 18 |
| Melbourne Storm | 28 | 9 | 3 | 17 | 4 | 19 |
| New Zealand Warriors | 29 | 9 | 7 | 25 | 10 | 20 |
| Newcastle Knights | 28 | 14 | 8 | 32 | 7 | 14 |
| North Queensland Cowboys | 27 | 10 | 7 | 28 | 7 | 17 |
| Parramatta Eels | 28 | 10 | 6 | 20 | 6 | 18 |
| Penrith Panthers | 26 | 16 | 8 | 58 | 15 | 10 |
| South Sydney Rabbitohs | 29 | 13 | 9 | 33 | 3 | 16 |
| St George Illawarra Dragons | 29 | 10 | 5 | 19 | 5 | 19 |
| Sydney Roosters | 28 | 9 | 6 | 35 | 11 | 19 |
| Wests Tigers | 30 | 13 | 8 | 29 | 11 | 17 |

## Promotion Rules

- `player_focused_candidate_needs_article_review`: highest-priority review item. Open the direct URL, confirm the article names the player, then capture the reported salary/term and source note.
- `team_or_context_candidate_needs_article_review`: useful backup/context evidence. Do not use as primary salary evidence unless the article body contains a player-specific number.
- `context_only_untrusted_domain`: do not promote without corroboration from an authoritative source.
- Paywalled Daily Telegraph and SMH links require credentialed browser review before any salary figure is promoted.

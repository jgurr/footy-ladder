# Player-Specific Article Review 2026

Generated: 2026-07-12T13:12:43.881Z

## Scope

- Every player in `src/data/salary-cap/all-teams-2026.json` was searched individually by name.
- The combined review includes the per-player Bing News RSS pass, an official club Signings-topic crawl, a lightweight Bing HTML supplemental search pass, and deterministic Zero Tackle player-contract profile fetches.
- The per-player pass searches direct salary, contract, signed-extension, publisher-site, NRL.com, and club-domain query families.
- The official club pass fetches club article pages and matches current squad player names against the article text.
- The Bing HTML pass uses decoded direct result URLs for the query shapes that surfaced missed player-specific contract pages.
- The Zero Tackle pass generates player slugs, applies curated name variants, and captures player-specific contract-table evidence. It is contract evidence, not salary reporting.
- Context-only team articles are excluded from candidate counts by default.
- Salary evidence remains scarce because NRL salaries are private and usually appear only in major-media reporting.

## Totals

- Players searched: 481
- Player-specific candidate links: 1292
- Players with salary candidate: 36 (7.5%)
- Players with contract candidate: 477 (99.2%)
- Players with profile-only candidate: 170 (35.3%)
- Players with preferred primary-source candidate: 178 (37.0%)
- Players with any player-specific candidate: 477 (99.2%)
- Players still needing manual/credentialed search: 4 (0.8%)

## Team Coverage

| Team | Players | Candidates | Salary | Contract | Profile | Still Missing |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Brisbane Broncos | 28 | 125 | 8 | 28 | 14 | 0 |
| Canberra Raiders | 29 | 63 | 0 | 29 | 15 | 0 |
| Canterbury-Bankstown Bulldogs | 30 | 73 | 3 | 30 | 12 | 0 |
| Cronulla-Sutherland Sharks | 28 | 45 | 0 | 28 | 4 | 0 |
| Dolphins | 28 | 80 | 4 | 28 | 11 | 0 |
| Gold Coast Titans | 29 | 57 | 1 | 29 | 4 | 0 |
| Manly Warringah Sea Eagles | 27 | 63 | 1 | 27 | 12 | 0 |
| Melbourne Storm | 28 | 59 | 1 | 27 | 10 | 1 |
| New Zealand Warriors | 29 | 72 | 2 | 29 | 5 | 0 |
| Newcastle Knights | 28 | 78 | 2 | 27 | 7 | 1 |
| North Queensland Cowboys | 27 | 87 | 3 | 27 | 12 | 0 |
| Parramatta Eels | 28 | 99 | 0 | 28 | 14 | 0 |
| Penrith Panthers | 26 | 79 | 2 | 25 | 7 | 1 |
| South Sydney Rabbitohs | 29 | 71 | 2 | 28 | 9 | 1 |
| St George Illawarra Dragons | 29 | 69 | 3 | 29 | 12 | 0 |
| Sydney Roosters | 28 | 91 | 2 | 28 | 12 | 0 |
| Wests Tigers | 30 | 81 | 2 | 30 | 10 | 0 |

## Example Salary / Contract Candidates

- Brisbane Broncos: Reece Walsh — player_specific_salary_candidate — 7news.com.au — [Reece Walsh signs monster new Brisbane Broncos contract until 2029](https://7news.com.au/sport/rugby-league/reece-walsh-signs-monster-new-brisbane-broncos-contract-until-2029-c-16589716)
- Brisbane Broncos: Reece Walsh — player_specific_contract_candidate — 7news.com.au — [Broncos superstar Reece Walsh agrees to multi-million dollar contract extension](https://7news.com.au/sport/rugby-league/broncos-superstar-reece-walsh-agrees-to-multi-million-dollar-contract-extension-c-16162034)
- Brisbane Broncos: Grant Anderson — player_specific_contract_candidate — rnz.co.nz — [NRL: NZ Warriors sign Grant Anderson in Brisbane Broncos exchange for Mitch Barnett](https://www.rnz.co.nz/news/sport/592595/nrl-nz-warriors-sign-grant-anderson-in-brisbane-broncos-exchange-for-mitch-barnett)
- Brisbane Broncos: Grant Anderson — player_specific_contract_candidate — broncos.com.au — [Barnett Signs with Broncos as Club Supports Anderson Release](https://www.broncos.com.au/news/2026/04/16/barnett-signs-with-broncos-as-club-supports-anderson-release/)
- Brisbane Broncos: Grant Anderson — player_specific_contract_candidate — zerotackle.com — [Grant Anderson (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/grant-anderson/)
- Brisbane Broncos: Kotoni Staggs — player_specific_contract_candidate — geelongadvertiser.com.au — [Saint, Sinner, Shoosh: Kotoni Staggs wants to join Broncos exodus; Alex Johnston in rival sights](https://www.geelongadvertiser.com.au/sport/nrl/saint-sinner-shoosh-kotoni-staggs-wants-to-join-broncos-exodus-paul-mcgregor-dragons-future/news-story/4da3d1f9dc35dac2b87987c04e98079e)
- Brisbane Broncos: Gehamat Shibasaki — player_specific_salary_candidate — au.sports.yahoo.com — [Perth Bears table $1 million deal to Broncos off-contract centre](https://au.sports.yahoo.com/perth-bears-table-1-million-025505590.html)
- Brisbane Broncos: Gehamat Shibasaki — player_specific_contract_candidate — goldcoastbulletin.com.au — [Gehamat Shibasaki may fall victim to Broncos salary cap squeeze after latest offer falls short](https://www.goldcoastbulletin.com.au/sport/nrl/gehamat-shibasaki-may-fall-victim-to-broncos-salary-cap-squeeze-after-latest-offer-falls-short/news-story/2d9a60be0cd66cc591fafd90e353d7a5)
- Brisbane Broncos: Gehamat Shibasaki — player_specific_contract_candidate — au.sports.yahoo.com — [Shibasaki's future at Broncos uncertain following contract dispute](https://au.sports.yahoo.com/shibasaki-future-broncos-uncertain-following-233648022.html)
- Brisbane Broncos: Deine Mariner — player_specific_contract_candidate — zerotackle.com — [Deine Mariner (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/deine-mariner/)
- Brisbane Broncos: Ezra Mam — player_specific_contract_candidate — zerotackle.com — [Ezra Mam (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/ezra-mam/)
- Brisbane Broncos: Adam Reynolds — player_specific_salary_candidate — themercury.com.au — [Inside the failed $1.5m heist plan to lure Adam Reynolds to the Tigers](https://www.themercury.com.au/sport/nrl/inside-the-failed-15m-heist-plan-to-lure-adam-reynolds-to-the-tigers/news-story/214d10ad1c9222894ffca37e0225970a)
- Brisbane Broncos: Adam Reynolds — player_specific_contract_candidate — news.com.au — [Adam Reynolds confirms he'll retire in double blow for Broncos after Payne Haas announces defection to Souths](https://www.news.com.au/sport/nrl/adam-reynolds-confirms-hell-retire-in-double-blow-for-broncos-after-payne-haas-announces-defection-to-souths/news-story/76810f864d7f439569c7b49983b6be2a)
- Brisbane Broncos: Adam Reynolds — player_specific_contract_candidate — themercury.com.au — [NRL 2021: Adam Reynolds contract, Rabbitohs lead calls for salary cap revamp](https://www.themercury.com.au/sport/nrl/nrl-2021-adam-reynolds-contract-rabbitohs-lead-calls-for-salary-cap-revamp/news-story/4ad2423dd5dda60c202351b0361c2d55)
- Brisbane Broncos: Corey Jensen — player_specific_contract_candidate — msn.com — [Ben Te Kura leaves Brisbane Broncos for NFL dream as Corey Jensen faces uncertain future](https://www.msn.com/en-au/sport/other/ben-te-kura-leaves-brisbane-broncos-for-nfl-dream-as-corey-jensen-faces-uncertain-future/ar-AA271E2j)
- Brisbane Broncos: Ben Hunt — player_specific_salary_candidate — couriermail.com.au — [Brisbane Broncos veteran Ben Hunt to accept $200K pay cut to remain at Red Hill](https://www.couriermail.com.au/sport/nrl/brisbane-broncos-veteran-ben-hunt-to-accept-200k-pay-cut-to-remain-at-red-hill/news-story/271b9abf08346764743293d2bb398bb4)
- Brisbane Broncos: Ben Hunt — player_specific_salary_candidate — themercury.com.au — [Brisbane Broncos veteran Ben Hunt to accept $200K pay cut to remain at Red Hill](https://www.themercury.com.au/sport/nrl/brisbane-broncos-veteran-ben-hunt-to-accept-200k-pay-cut-to-remain-at-red-hill/news-story/271b9abf08346764743293d2bb398bb4)
- Brisbane Broncos: Ben Hunt — player_specific_contract_candidate — cairnspost.com.au — [Broncos champion Ben Hunt inks new one-year deal to defy retirement calls](https://www.cairnspost.com.au/sport/nrl/ben-hunt-brushes-off-retirement-pleas-from-nrl-greats-despite-brisbane-broncos-slump/news-story/0b707e4a6fc1118d7ceea4290fad1cb5)
- Brisbane Broncos: Payne Haas — player_specific_contract_candidate — 7news.com.au — [Payne Haas quits Brisbane Broncos to join South Sydney Rabbitohs from 2027 NRL season](https://7news.com.au/sport/rugby-league/nrl-rocked-as-payne-haas-sensationally-quits-brisbane-broncos-to-join-south-sydney-rabbitohs-c-21567233)
- Brisbane Broncos: Payne Haas — player_specific_contract_candidate — adelaidenow.com.au — [Broncos deny Payne Haas immediate release demand in contract saga](https://www.adelaidenow.com.au/sport/nrl/broncos-star-payne-haas-demands-immediate-release-over-contract-saga/news-story/de694ec553e257b503875a6b5b1260f1)
- Brisbane Broncos: Payne Haas — player_specific_contract_candidate — heraldsun.com.au — [NRL youngsters' salaries could be capped to limit player market blowout in post-COVID-19 world](https://www.heraldsun.com.au/sport/nrl/nrl-youngsters-salaries-to-be-capped-to-limit-player-market-blowout-in-postcovid19-world/news-story/f7943d5671c9c0a27137cb368519c04d)
- Brisbane Broncos: Brendan Piakura — player_specific_salary_candidate — couriermail.com.au — [Inside the moment that convinced Brendan Piakura to shun Bulldogs' million-dollar move](https://www.couriermail.com.au/sport/nrl/inside-the-moment-that-convinced-brendan-piakura-to-shun-bulldogs-milliondollar-move/news-story/611e2f875ddc5b054d662c5b302cd8ae)
- Brisbane Broncos: Brendan Piakura — player_specific_contract_candidate — townsvillebulletin.com.au — [NRL 2021: Brendan Piakura could join Reece Walsh in quitting Broncos](https://www.townsvillebulletin.com.au/sport/nrl/nrl-2021-reece-walsh-signs-with-warriors-turns-his-back-on-broncos/news-story/a17c7372ce4dc04a74dd62ccb5b030e7)
- Brisbane Broncos: Brendan Piakura — player_specific_contract_candidate — zerotackle.com — [Brendan Piakura (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/brendan-piakura/)
- Brisbane Broncos: Jordan Riki — player_specific_contract_candidate — zerotackle.com — [Jordan Riki (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/jordan-riki/)
- Brisbane Broncos: Patrick Carrigan — player_specific_contract_candidate — zerotackle.com — [Patrick Carrigan (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/patrick-carrigan/)
- Brisbane Broncos: Billy Walters — player_specific_contract_candidate — zerotackle.com — [Billy Walters (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/billy-walters/)
- Brisbane Broncos: Xavier Willison — player_specific_salary_candidate — foxsports.com.au — [Broncos' bid to retain rising star; Intense seven-club, $1m race for Panthers star: Transfer Whispers](https://www.foxsports.com.au/nrl/nrl-premiership/intense-sevenclub-1m-race-developing-for-star-panther-as-club-faces-brutal-roster-reality/news-story/d63356512cc1a68ceac5d85acf94b03a)
- Brisbane Broncos: Xavier Willison — player_specific_contract_candidate — zerotackle.com — [Xavier Willison (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/xavier-willison/)
- Brisbane Broncos: Jack Gosiewski — player_specific_contract_candidate — zerotackle.com — [Jack Gosiewski (Brisbane Broncos) - NRL Stats, News, Contract &amp; Player Profile - Zero Tackle](https://www.zerotackle.com/players/jack-gosiewski/)

## Remaining Gap List

- Melbourne Storm: Siulagi Tuimalata-Brown (Unknown)
- Newcastle Knights: Mathew Croker (Lock)
- Penrith Panthers: John Fonua (Unknown)
- South Sydney Rabbitohs: Bronson Carlick (Unknown)

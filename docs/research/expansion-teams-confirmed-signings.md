# Expansion Teams Confirmed Signings

As of 2026-07-12, expansion signings are tracked in `src/data/salary-cap/expansion-teams-confirmed-contracts.json`.

## Scope

- Perth Bears enter in 2027.
- PNG Chiefs enter in 2028.
- Only confirmed signed or announced contracts from official NRL.com, club, or expansion-team media-release sources are promoted.
- Development and train-and-trial contracts are retained, but they are not Top 30 cap commitments.
- Salary values are not estimated in this ledger. They require the separate player-by-player salary-source review.

## Current Official Ledger Counts

| Team | Top 30 / main squad | Development | Train-and-trial | Notes |
| --- | ---: | ---: | ---: | --- |
| Perth Bears | 16 | 0 | 1 | Four players are confirmed as 2027 squad members but still need exact end-year source confirmation. |
| PNG Chiefs | 4 | 3 | 0 | Matty Lees has a confirmed 2028 start, but the exact term still needs a direct end-year source. |

## Source Notes

- Perth first signings: Toby Sexton, Harry Newman, Luke Smith, and Emarly Bitungane are reported as two-year contracts from 2027.
- Perth Wishart/Meaney: Tyran Wishart is reported on a five-year deal from 2027; Nick Meaney on a three-year deal from 2027. The same official article also names Josh Curran, Liam Henry, Sean Russell, and Isaza Fa'asuamaleaui as part of the 2027 squad, but term lengths still need direct confirmation.
- PNG Luai: Jarome Luai is reported as signed for 2028 and 2029, with an option for 2030.
- PNG development deals: Gairo Voro, Morea Morea, and Finley Glare are reported on two-year development contracts for the Chiefs' 2028 entry window.

## Production Rule

Expansion teams should appear in the salary-cap tool only after the same source standard is met as the 17 current clubs:

1. Confirm active squad category.
2. Confirm contract start/end and option years.
3. Run player-by-player salary source search.
4. Store direct source links and confidence notes.
5. Keep unknown salary as unknown rather than inventing cap cost.

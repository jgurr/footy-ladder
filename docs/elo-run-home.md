# Elo and Run Home Prototype

## Data

The checked-in model history is generated from the official NRL draw at
`https://www.nrl.com/draw/` by `scripts/fetch-elo-history.mjs`.

| Season | Regular season | Finals | Total |
|--------|----------------|--------|-------|
| 2022 | 192 | 9 | 201 |
| 2023 | 204 | 9 | 213 |
| 2024 | 204 | 9 | 213 |
| 2025 | 204 | 9 | 213 |

The four complete seasons contain 840 matches. Completed 2026 matches are appended at request time,
so power rankings update when the existing official-results sync runs.

Refresh and verify the historical snapshot with:

```bash
npm run refresh:elo-history
npm run test:elo
```

## Elo

- New teams begin at 1500.
- Home advantage is 50 Elo points, except for Las Vegas and Grand Finals.
- The update factor is 8.
- Winning margin applies a damped logarithmic multiplier.
- Ratings carry continuously across seasons; they only change when matches are played.
- The update factor and home advantage were selected using out-of-season log-loss over the 2023-2025 official results.

The user interface presents Elo as a power rank. Raw Elo points and rating-point adjustments are not
shown because they do not help explain an individual fixture.

## Fixture Difficulty

For each remaining fixture, the model calculates two related values:

- **Win chance** uses the selected team's Elo and the opponent's Elo.
- **Difficulty** replaces the selected team with a league-average 1500 team. This isolates the
  difficulty of the schedule from the quality of the team playing it.

Both calculations include:

- Opponent Elo strength.
- Actual venue context, including local, away, regional and neutral venues.
- Exact kickoff-to-kickoff recovery time for both teams.
- Great-circle travel from each club's normal base to the match venue.

Rest differences are capped at three days and converted at eight Elo points per day. Travel is
converted at 18 Elo points per 1,000 km and capped at 45 Elo points. These are deliberately modest
prototype assumptions and should be calibrated against historical NRL venue and kickoff data before
the feature is treated as a forecasting product.

Remaining SOS is the unweighted average difficulty of every unplayed fixture. Expected remaining
wins is the sum of the team's game-level win probabilities.

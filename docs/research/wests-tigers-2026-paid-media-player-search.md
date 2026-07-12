# Wests Tigers 2026 Paid-Media Player Salary Search

> Player-by-player Daily Telegraph and Sydney Morning Herald pass.
> Checked: 2026-07-11.

## Method

This pass searched each working Wests Tigers Top 30 player against:

- `dailytelegraph.com.au`
- `smh.com.au`

The workflow was:

1. Search each player with salary/cap/contract terms and site filters.
2. Open credentialed articles where the result appeared to contain salary, value, contract, or cap-space claims.
3. Promote only direct article-reviewed money claims into structured source records.
4. Keep search snippets, grouped roster buckets, and vague contract articles as research leads only.

Important interpretation rule: Daily Telegraph roster values are major-media valuations, not official NRL salary-cap ledger data. They are useful because NRL salaries are private, but the UI should label them as media-sourced estimates.

## Reviewed Money Sources

| Source | Publisher | What it supports | Use |
|--------|-----------|------------------|-----|
| [NRL Rich List: true roster value investigation](https://www.dailytelegraph.com.au/sport/nrl/the-true-value-of-every-nrl-roster-revealed-and-the-clubs-breaking-the-salary-cap/news-story/a4bafaad73cb13efaa7b8c292800cd52) | Daily Telegraph | Individual 2026 Wests roster values for 17 players, plus grouped "rest" bucket | Primary selected 2026 estimate for listed players |
| [Tigers 2026 season scouting report](https://www.dailytelegraph.com.au/sport/nrl/wests-tigers-2026-nrl-season-scouting-report-best-17-every-players-contract-rookie-watch/news-story/434afb4b643d87f4ae79113853ff9bee) | Daily Telegraph | Tigers Rich 100 widget with salaries for Luai, Pearce-Paul, Koroisau, Terrell May, and Bula | Historical/corroborating salary context |
| [Terrell May's $2m Wests Tigers lifeline](https://www.dailytelegraph.com.au/sport/nrl/terrell-mays-2m-wests-tigers-lifeline-after-shock-roosters-axing/news-story/53869ab008162f175ea1d2945f0266b7) | Daily Telegraph | Original Tigers deal reported as three years and $2m | Historical contract AAV context |
| [Jahream Bula $900k contract drama](https://www.dailytelegraph.com.au/sport/nrl/fears-jahream-bula-could-walk-out-on-tigers-after-wife-axed-amid-900k-contract-drama/news-story/a0030038a20bf039b2ad2b7bf1c13ae3) | Daily Telegraph | Bula option/salary dispute context, including $700k to $900k range and $800k trigger discussion | Contract-structure context |
| [Jahream Bula extension / $10m spending spree](https://www.dailytelegraph.com.au/sport/nrl/wests-tigers-lock-down-star-fullback-jahream-bula-on-contract-extension/news-story/2b075b97303f35332304825212bc9074) | Daily Telegraph | Bula extension through 2030 and broader club spending context | Contract length and cap-pressure context only |
| [Makasini/Samuela Fainu $6m retention drive](https://www.dailytelegraph.com.au/sport/nrl/wests-tigers-move-to-resign-rising-nrl-stars-heamasi-makasini-samuela-fainu/news-story/0c7c88f8fddc5a0828d8f01ba1de9101) | Daily Telegraph | Twin five-year retention talks in a $6m-plus package | Future retention context only |
| [Sione Fainu contract](https://www.smh.com.au/sport/nrl/nrl-around-the-clubs-preseason-week-one-20260202-p5nyxn.html) | Sydney Morning Herald | Three-year extension reported at $1.1m | Future extension AAV context |
| [Luai $1.2m exit/cap-space context](https://www.dailytelegraph.com.au/sport/nrl/12m-call-to-turn-jarome-luai-windfall-into-romantic-homecoming-for-mitch-moses/news-story/776a79bf3205f1869087f6bc602c1bbc) | Daily Telegraph | Luai exit reporting framed around about $1.2m in cap space | 2027/exiting-contract context |

## Player Matrix

| Player | Daily Telegraph result | SMH result | 2026 data decision |
|--------|------------------------|------------|--------------------|
| Adam Doueihi | Direct 2026 roster value in DT Rich List. Search found additional contract-market articles, but no stronger opened individual salary claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Alex Twal | Direct 2026 roster value in DT Rich List. Older roster-value search leads exist, but no stronger current opened claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Alex Seyfarth | Direct 2026 roster value in DT Rich List. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Apisai Koroisau | Direct 2026 roster value in DT Rich List; Tigers Rich 100 widget provides historical corroboration. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Bunty Afoa | No Tigers individual 2026 salary claim found. Historical Warriors roster-value search lead exists, but it is not a Tigers cap cost. | No direct opened salary claim. | Keep unknown. |
| Fonua Pole | Direct 2026 roster value in DT Rich List. Contract-extension article found, but no opened stronger salary claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Heamasi Makasini | Direct 2026 roster value in DT Rich List; $6m-plus retention article covers future combined talks with Samuela Fainu. | No direct opened salary claim. | Keep DT 2026 roster value; store future retention context only. |
| Heath Mason | No individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Jahream Bula | Direct 2026 roster value in DT Rich List; Rich 100 widget and option-dispute article add historical/structure context; 2030 extension article adds contract length. | No direct opened salary claim. | Keep DT 2026 roster value; store option/extension context separately. |
| Jarome Luai | Direct 2026 roster value in DT Rich List; Rich 100 widget and exit/cap-space articles support higher historical/future context. | Search points to SMH-origin Luai reporting, but no direct opened SMH article URL was confirmed. | Keep DT 2026 roster value; do not promote SMH lead yet. |
| Javon Andrews | No individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Jeral Skelton | Grouped in DT Rich List "rest" bucket; no individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Jock Madden | Direct 2026 roster value in DT Rich List. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Kai Pearce-Paul | Direct 2026 roster value in DT Rich List; Tigers Rich 100 widget provides historical corroboration. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Kit Laulilii | Grouped in DT Rich List "rest" bucket; Perth contract article found but no opened individual salary claim. | No direct opened salary claim. | Keep unknown. |
| Latu Fainu | Grouped in DT Rich List "rest" bucket; role/contract articles found but no direct opened salary claim. | No direct opened salary claim. | Keep unknown. |
| Mavrik Geyer | No Tigers individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Patrick Herbert | No individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Royce Hunt | Direct 2026 roster value in DT Rich List. Signing/market-watch articles found but no stronger opened salary claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Samuela Fainu | Direct 2026 roster value in DT Rich List; $6m-plus retention article covers future combined talks with Makasini. | No direct opened individual salary claim. | Keep DT 2026 roster value; store future retention context only. |
| Sione Fainu | Direct 2026 roster value in DT Rich List; DT article found on three-year extension but SMH has the cleaner opened value claim. | Direct opened $1.1m/three-year extension article. | Keep DT 2026 roster value; store SMH extension AAV for future years. |
| Solomone Saukuru | Grouped in DT Rich List "rest" bucket; no individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Starford To'a | Direct 2026 roster value in DT Rich List. Manly-market article found but no stronger opened salary claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Sunia Turuva | Direct 2026 roster value in DT Rich List. Signing/move articles found but no stronger opened salary claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Taylan May | Direct 2026 roster value in DT Rich List. Contract-length articles found, but no stronger opened salary claim. | No direct opened salary claim. | Keep DT 2026 roster value. |
| Terrell May | Direct 2026 roster value in DT Rich List; Rich 100 widget and original three-year $2m article provide historical corroboration. | No direct opened salary claim. | Keep DT 2026 roster value; store original deal AAV separately. |
| Tony Sukkar | No individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Tristan Hope | Grouped in DT Rich List "rest" bucket; no individual salary claim found. | No direct opened salary claim. | Keep unknown. |
| Faaletino Tavana | No individual salary claim found under Faaletino or Tino Tavana searches. | No direct opened salary claim. | Keep unknown. |
| William Craig | Grouped in DT Rich List "rest" bucket; no individual salary claim found under William or Will Craig searches. | No direct opened salary claim. | Keep unknown. |

## Findings

- Daily Telegraph is currently the strongest salary source for Wests Tigers because it provides the only opened player-by-player 2026 roster-value table.
- SMH produced one clean opened salary claim in this pass: Sione Fainu's $1.1m extension.
- The lower-roster players remain difficult because they are often grouped into "the rest" rather than individually valued.
- Contract length confidence is stronger than salary confidence because club/NRL trackers often confirm years while salaries remain private.
- For the first visualization, unknowns should remain visually distinct from known low salaries. The "rest" bucket should not be flattened into equal per-player guesses unless the user explicitly chooses a derived-allocation mode.

## Open Leads

- Re-open the 2025 Tigers scouting report if extraction improves; search snippets suggested salary content but the credentialed page did not expose usable article text in this pass.
- Find the direct SMH Luai source URL, if available, before using SMH-origin reporting as a source.
- Re-check lower-roster names after the next top-30 list update, because some current unknowns may move to development, release, or train-and-trial status.

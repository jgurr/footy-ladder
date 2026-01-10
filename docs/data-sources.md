# NRL Data Sources Research

> Phase 1.1 research findings - 2026-01-10

## Summary

| Source | Cost | Live Scores | Historical | Schedule | Reliability | Recommendation |
|--------|------|-------------|------------|----------|-------------|----------------|
| NRL.com API | Free | Yes | Yes | Yes | Unknown | Test first |
| Rugby League Project | Free | No | Yes | Yes | Medium | Fallback for historical |
| Zyla Labs API | Paid | Yes | Yes (2002+) | Yes | High | Consider for production |
| Google Sheets | Free | Manual | Manual | Manual | High | Development fallback |

## Option 1: NRL.com Undocumented API (Recommended for Testing)

**Endpoint**: `https://www.nrl.com/api/ladder/{year}`

The original nrl-ladder project had code to fetch from this endpoint:

```typescript
const response = await fetch(`https://www.nrl.com/api/ladder/2025`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NRL-Ladder-App/1.0)",
    "Accept": "application/json",
  },
})
```

**Pros**:
- Free
- Official source
- Real-time data
- Includes all stats

**Cons**:
- Undocumented - may change without notice
- May be rate limited or blocked
- No official support
- Terms of use unclear

**Action**: Test this endpoint first. If it works reliably, use it as primary source.

---

## Option 2: Rugby League Project Scraping

**URL**: `https://www.rugbyleagueproject.org/seasons/nrl-{year}/results.html`

The original project included a scraper for this site that:
- Fetches match results by round
- Calculates ladder from game results
- Handles team name normalization

**Pros**:
- Free
- Historical data available
- Open access
- Community maintained

**Cons**:
- No live scores
- Requires scraping (fragile)
- May lag official results
- No API, HTML parsing required

**Action**: Use as fallback for historical data (2025 season import).

---

## Option 3: Zyla Labs NRL Data API

**URL**: [https://zylalabs.com/api-marketplace/sports/nrl+data+api/4535](https://zylalabs.com/api-marketplace/sports/nrl+data+api/4535)

Commercial API with comprehensive NRL data.

**Endpoints**:
- `/fixture` - Match fixtures by round
- `/ladder` - Current standings
- `/match/{id}` - Detailed match stats

**Data includes**:
- Match ID, date, time
- Home/away teams and scores
- Referee, venue, crowd
- Player statistics
- Historical data back to 2002

**Pricing**: Unknown - need to check

**Pros**:
- Well-documented
- Reliable
- Comprehensive data
- Historical depth

**Cons**:
- Paid service
- External dependency
- Need to evaluate cost

**Action**: Evaluate pricing. Consider for production if NRL.com API is unreliable.

---

## Option 4: Other Commercial APIs

### Goalserve
- Premium rugby data feed
- Live scores, in-game stats
- XML and JSON formats
- **Cost**: Varies by package

### Sportradar
- Enterprise-grade sports data
- Real-time scores
- Comprehensive coverage
- **Cost**: Enterprise pricing

### API-Sports
- Multi-sport API
- Rugby league coverage
- Reasonable pricing
- **Cost**: Subscription based

---

## Option 5: Google Sheets (Development/Fallback)

The original project used Google Sheets for manual data entry.

**Setup**:
1. Create Google Sheet with columns: name, location, shortName, played, wins, losses, draws, pointsFor, pointsAgainst, byes
2. Get API key from Google Cloud Console
3. Fetch via Sheets API v4

**Pros**:
- Complete control
- Always available
- No rate limits
- Free

**Cons**:
- Manual updates required
- Labor intensive
- Not real-time

**Action**: Keep as emergency fallback.

---

## Recommendation

### Phase 1 (MVP)
1. **Primary**: Test NRL.com undocumented API
2. **Fallback**: Google Sheets for manual updates
3. **Historical**: Rugby League Project scraping for 2025 data

### Phase 2 (Production)
1. **If NRL.com works**: Continue using with caching
2. **If unreliable**: Evaluate Zyla Labs API pricing
3. **Live scores**: Implement 30s polling during game windows

### Implementation Priority
1. Build abstraction layer (`DataSource` interface)
2. Implement NRL.com API client
3. Test reliability over several game days
4. Add fallback sources as needed

---

## Technical Notes

### Rate Limiting Strategy
- Cache responses for 5 minutes minimum
- Increase polling to 30s only during live games
- Implement exponential backoff on errors

### Game Window Detection
NRL games typically run:
- Thursday: 7:30 PM AEDT
- Friday: 6:00 PM, 7:55 PM AEDT
- Saturday: 3:00 PM, 5:30 PM, 7:35 PM AEDT
- Sunday: 2:00 PM, 4:05 PM, 6:10 PM AEDT
- Monday: 7:00 PM AEDT (occasional)

During these windows, poll every 30 seconds. Outside windows, poll every 30 minutes or on-demand.

---

## References

- [NRL Official Ladder](https://www.nrl.com/ladder/)
- [NRL Official Draw](https://www.nrl.com/draw/)
- [Rugby League Project](https://www.rugbyleagueproject.org)
- [Zyla Labs NRL Data API](https://zylalabs.com/api-marketplace/sports/nrl+data+api/4535)

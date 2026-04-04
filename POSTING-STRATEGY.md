# The Dice Drop — Blog Posting Strategy

## Content Calendar

### Weekly (Automated)
| Day | Content | Source |
|-----|---------|--------|
| **Monday** | Weekly Hotness Review | BGG Hotness API → GPT-5.4 analysis |
| **Wednesday** | Deep Dive / Analysis | Top-scored item from gather pipeline |
| **Friday** | Crowdfunding Watch (bi-weekly) | Kickstarter + Reddit roundups |

### Monthly
| Content | Source |
|---------|--------|
| Monthly Roundup | Aggregated from weekly posts |
| Digital Board Games column | Digital source pipeline |

## Automation Pipeline

```
dicedropai gather → score → select top items
    ↓
GPT-5.4 writes long-form article (800-1500 words)
    ↓
AI generates cover image OR uses real box art with attribution
    ↓
Hugo markdown committed to content/posts/
    ↓
Git push → GitHub Actions → deployed to Pages
```

## Image Strategy (REAL ART FIRST)
**Max 1 AI-generated image per day across both bot and blog.**

### ⚠️ HARD GATE: BGG API Verification (added 2026-04-04)
Every game mentioned in an article MUST be verified via BGG XML API before publishing:
1. **Confirm BGG ID** — search by name, verify the correct game (not a different edition or unrelated game)
2. **Pull official image** — use the `image` field from BGG API response, NOT image search results
3. **Cross-check** — if the BGG image doesn't match expected box art, flag for manual review
4. **Never trust Bing/Google image search** for game images — wrong images have shipped before (Spike incident 2026-04-04)

BGG API client: `~/.openclaw/repos/dicedropai/dicedropai/bgg_client.py`

Priority order:
1. **Real box art from BGG API** — verified BGG ID, official image URL (with attribution)
2. **Publisher press kits** — only if BGG image unavailable
3. **Real photos** — Board game photography, event photos, component shots
4. **Screenshots** — BGA/TTS/Steam screenshots for digital content
5. **AI-generated** — LAST RESORT ONLY, max 1/day, clearly marked "🎨 AI-generated art"
6. **Template cards** — Branded cards with text overlay (unlimited, no attribution needed)

The bot tracks AI image usage via `data/ai_image_count.json` (resets daily).
Blog articles should use real game images with publisher credit wherever possible.

## Cross-Posting
- Tweet links to articles (backlink to site drives SEO)
- Article excerpts as tweet threads
- Weekly Hotness already posts as thread — article is the expanded version

## SEO Targets
- "BGG hotness this week"
- "best board game crowdfunding [month] [year]"
- "[game name] review / analysis"
- "D&D gatekeeping / game design"

## Attribution Rules
- Always credit publishers for box art
- AI-generated images marked with "🎨 AI-generated art" in caption
- Link to BGG/publisher when referencing games

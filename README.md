# Racing Alpha MCP server

**GB & Irish horse racing signals for AI agents** — the official
[Model Context Protocol](https://modelcontextprotocol.io) server from
[Racing Alpha](https://racingalpha.co.uk).

Remote server (Streamable HTTP, no install):

```
https://racingalpha.co.uk/api/mcp
```

Listed on the official MCP Registry as
[`uk.co.racingalpha/signals`](https://registry.modelcontextprotocol.io/v0/servers?search=racingalpha).

## Connect

Claude Code:

```bash
claude mcp add --transport http racing-alpha https://racingalpha.co.uk/api/mcp
```

Generic MCP client config:

```json
{
  "mcpServers": {
    "racing-alpha": {
      "type": "http",
      "url": "https://racingalpha.co.uk/api/mcp"
    }
  }
}
```

Works keyless (50 requests/day per IP). A free key raises that to
1,000/day — get one at
[racingalpha.co.uk/developers](https://racingalpha.co.uk/developers)
and pass it as `Authorization: Bearer ra_live_…`.

## Tools

| Tool | What it returns |
|---|---|
| `get_today_races` | Today's GB & IRE races with Racing Alpha's published model picks (advised prices database-frozen at publication) |
| `get_race_signals` | Per-runner AI scores (0–100), de-overrounded fair prices, value vs fair, plus the race's draw-bias verdict |
| `get_tips_ledger` | The public tips ledger — every pick frozen at publication with result, level-stakes P/L, and closing-line-value summary. Losses included; that is the point. |
| `get_draw_bias` | 3-year draw-bias aggregates (IV / A–E / PRB) by course, surface, and distance band |
| `get_combo_stats` | Trainer×jockey strike rates over settled races |

## What this is (and isn't)

Everything served is a **Racing Alpha computation** — model scores,
de-overrounded consensus prices, statistical aggregates, and our own
published tips record. It is **not** a raw racecards/odds/ratings feed.

The differentiator: every prediction Racing Alpha publishes is
database-frozen at publication with a public audit table. Agents can
verify the full track record — including losing runs — before trusting
a single signal, via `get_tips_ledger` or
[racingalpha.co.uk/performance](https://racingalpha.co.uk/performance).

## Fair use

- Attribution required on the free tier: "Signals by Racing Alpha"
  linked to racingalpha.co.uk.
- Not for betting operators or sportsbooks.
- Don't present the signals as guaranteed winners — the public ledger
  exists precisely so nobody has to take our word for anything.
- 18+ audiences · [BeGambleAware.org](https://www.begambleaware.org)

REST equivalent + OpenAPI spec:
[racingalpha.co.uk/developers](https://racingalpha.co.uk/developers)

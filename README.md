# Slow Ping

**Make the ping slow. Keep it working.**

Slow Ping is a planned browser game for networking learners. Each level begins with a working, labeled network. You change static routes through a graphical editor, run ping, and try to reach the level's best achievable round-trip latency without losing delivery.

| Project | Details |
| --- | --- |
| Status | Planning; no playable implementation yet |
| Networking topic | IPv4 static routes, ICMP Echo, and end-to-end latency |
| Typical session | Target: 5–10 minutes |
| Live demo | Not published |
| Built by | Workshop participant |

## The challenge

Inspect a working topology from A to B, then change a router's next hop to make the request and reply take slower paths. Run ping to see both paths and their link-delay totals. Loops and missing routes fail; only a successful Echo Request and Echo Reply count toward the objective.

## What you'll learn

| By the end, you can… | You'll practice by… |
| --- | --- |
| Trace a ping request and reply through a small network | Inspect the topology and current routes |
| Explain how static route choices affect round-trip latency | Change a next hop and compare the resulting ping |
| Distinguish slow delivery from failed delivery | Compare a long successful path with a loop or missing route |

**Before playing:** the opening briefing introduces routes, next hops, ping, and latency.

## Play locally

The game is still in planning, so it cannot be played yet. Once implementation creates `index.html`, the planned preview command is:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` in a browser. Keep the terminal running; **Ctrl+C** stops the server.

## Planned model

The first version uses three supplied topologies and static IPv4 routes. Link delay is fixed and symmetric. Round-trip time is the sum of link delays on the Echo Request path plus the Echo Reply path. The game starts each packet with TTL 8; missing routes and TTL expiry are failures, not slow scores. The game does not model congestion, loss, dynamic routing, EVPN, MPLS-TE, STP, or broadcast storms.

| Reference | What it supports |
| --- | --- |
| [RFC 1812 §5.2.4](https://www.rfc-editor.org/rfc/rfc1812#section-5.2.4) | IPv4 route lookup and forwarding |
| [RFC 792](https://www.rfc-editor.org/rfc/rfc792) | ICMP Echo and Echo Reply |

Fixed delays and the game TTL are explicit teaching assumptions, not claims about real network timing.

## Planning documents

- [Project constitution](StarterKit/CONSTITUTION.md)
- [First playable specification](StarterKit/SPEC.md)
- [Implementation plan input](StarterKit/PLAN.md)
- [Workshop source repository](https://github.com/automateyournetwork/NAF_AC6)

## Verification

No implementation or checks have run. The planned acceptance evidence includes independently checked route and ping cases, a fresh playthrough of all three levels, keyboard access to core actions, a narrow-window check, and reduced-motion behavior. Results will be recorded here after the game exists.

## Credits and license

Workshop by John Capobianco, Joksan Flores, and Elliot Conner. Starter materials are adapted from the NAF AC6 workshop and the [Networking Video Game Starter Kit](https://github.com/automateyournetwork/NetworkingVideoGameStarterKit). The project includes the workshop's [Apache 2.0 license](LICENSE).

# Data model

Canonical constrained fields (other descriptive text is display-only):

| Field | Constraint |
| --- | --- |
| Level.id | Unique nonempty string |
| Level.nodes | 2 endpoints A/B plus 1–8 routers, unique IDs; positions and labels defined |
| Level.links | Unique unordered pairs of existing distinct node IDs, positive integer delayMs |
| Level.routes | Per router route arrays; valid canonical IPv4 CIDR prefix, adjacent nextHop, unique prefix per router |
| Level.edits | Finite slots identified by router ID and route index; unique per slot; prefixes finite valid CIDRs; nextHops finite adjacent IDs or null for disabled; initial value included |
| Level.targetRtt | Positive integer, exceeds baselineRtt, equal to independent achievable maximum |
| Level.baselineRtt | Positive integer equal to initial successful RTT |
| Level.solution | One valid prefix/nextHop assignment for each editable slot achieving target |
| Level.hints | Exactly two nonempty strings: method then worked solution explanation |
| Packet.ttl | Integer 8 initially for each leg; decrement at routers before forwarding; zero means drop |
| PingResult.status | success, no-route, ttl-expired, or invalid-config |
| PingResult.rtt | Positive integer on success; null on all failures |
| PingResult.legs | Ordered request then optional reply; each includes path, steps, delayMs, status, failedAt; no reply after request fails |
| Session.current | Integer 0–2 for current level |
| Session.records | One per level: bestRtt null or positive integer; completed boolean; assistance 0,1,2; attempts nonnegative integer; applied routes; result null or last current ping |
| Session.view | intro, game, summary |

Endpoint addresses: A=192.0.2.1, B=198.51.100.1. Each endpoint has one immutable adjacent gateway. Routers directly attached to an endpoint have a locked /32 direct-delivery route; other route slots can be locked or editable. Missing/unconfigured next hop is a deliberate no-route case; invalid adjacency is an author/configuration error.

Transitions: intro→game; draft input→Apply (atomic, validates finite choices, clears result); Run ping→result/attempt/best/completion; Next only after completion→next level or summary; Reset→initial applied routes/result cleared but earned records retained; Hint→assistance; solution→assistance and applied routes, no completion; confirmed Restart→entire fresh session.

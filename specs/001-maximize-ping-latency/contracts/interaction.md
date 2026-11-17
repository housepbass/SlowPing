# Interaction and forwarding contracts

- Router diagram buttons and the native Router selector select the same inspector. Locked routes are read-only. Each editable row offers a Destination selector, Next hop selector, and Apply routes. Unconfigured next hop disables that route. Validation is atomic; failed Apply preserves current routes.
- Run ping consumes applied routes only. Result: `{status, rtt, legs}`. Each leg provides `{path, steps, delayMs, status, failedAt}`; steps include device, nextHop, link delay, remaining TTL and reason. Failure RTT is null. A configuration revision clears old results on Apply.
- Static adapter: `decide(level, routes, deviceId, packet) → {nextHop, reason}`. Packet has source/destination and TTL. `null` nextHop means no route. Generic traversal owns adjacency, TTL and delay accumulation; adapter owns prefix selection. Invalid protocol identity is a content error.
- Hint reveals method, solution requires explicit Show solution and fills routes while recording help. A subsequent Run ping is required for completion.
- Next level is disabled until earned; Reset retains earned results; Restart uses an accessible confirmation dialog and preserves state on cancel.
- Diagram text alternative lists every link and delay. Results include text paths plus per-hop tables; request and reply use distinct patterns. No essential hover content. Reduced motion suppresses decorative movement.
- Content failure replaces interaction with a readable error and Retry; loading is announced before fetch. Runtime has no external APIs.

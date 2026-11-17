# Slow Ping · Implementation plan input

> Workshop input document. Confirm it against the clarified specification before implementation.

## Build target

Build Slow Ping as a small browser game with three supplied network topologies. The player edits static routes in a graphical route editor and uses ping to maximize successful round-trip latency.

**Hardest behavior to get right:** compute the request and reply paths independently, detect missing routes and TTL expiry, and verify each level's maximum successful RTT.

**First evidence to check:** a hand-calculated topology where changing one route creates a slower successful request path while the reply path still reaches A.

## Stack and serving

- Semantic HTML, CSS, native JavaScript modules, and inline SVG for the labeled topology.
- No framework, bundler, backend, runtime model, or external rendering library.
- Static JSON for levels and fixed link delays; session progress remains in memory.
- Serve from the project root with `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000`.
- Keep paths relative so a later static host can serve the game from a repository subpath.

## Proposed files and responsibilities

```text
index.html                 Page shell and module entry
style.css                  Layout, focus, path styles, reduced motion
main.js                    Load and validate levels, start the session
engine/
  routing.js               Longest-prefix static route lookup
  ping.js                  Request/reply traversal, TTL, delay result
  content.js               Validate topology and level data
  state.js                 Route edits, reset, completion, summary
ui/
  topology.js              SVG topology and textual alternative
  route-editor.js          Labeled static-route editor
  feedback.js              Ping paths, latency breakdown, explanations
data/levels.json           Three authored topologies and targets
tests/
  index.html                Dependency-free test runner
  routing.test.js           Prefix selection and next-hop cases
  ping.test.js              Request/reply, delay, missing route, TTL
  levels.test.js            Independent level targets and content checks
README.md                   Run, play, model limits, and actual evidence
```

## Data contract

Each level defines unique device IDs, endpoint addresses, router route tables, symmetric links with fixed one-way delay in integer milliseconds, a starting configuration, the allowed route edits, and a verified target RTT. Route entries contain a destination prefix and a next-hop device ID. Every next hop must be adjacent. Invalid or ambiguous data prevents the level from starting.

The evaluator independently forwards the Echo Request from A to B and Echo Reply from B to A. At each router it selects the matching route with the longest prefix. A missing route, invalid next hop, or packet TTL expiry returns failure. A successful result includes both device paths and the sum of traversed link delays. UI code does not calculate or override results.

## Interaction

The SVG topology labels routers, endpoints, and link delay. Selecting a router opens its routes in a form. The learner chooses a route row, edits its prefix and next hop from adjacent devices, and applies the change. A separate **Run ping** action evaluates the current configuration. **Reset level** restores the supplied routes. Keyboard focus follows naturally between topology selection, route form, ping, and feedback; all actions are also available without selecting SVG nodes by pointer.

## Implementation order

| Slice | Deliverable | Evidence before the next slice |
| --- | --- | --- |
| 1 · Prove forwarding | Pure route lookup and packet traversal | Hand-checked route, missing-route, and TTL cases pass |
| 2 · Complete one level | Topology, route form, ping, feedback, reset | Correct and incorrect routing changes work in browser |
| 3 · Add the curriculum | Three levels, target RTT checks, progression | Each target is independently shown to be the maximum successful result |
| 4 · Make it usable | Keyboard flow, text equivalent, narrow layout, reduced motion | Manual checks recorded |
| 5 · Package | README and verification evidence | Another attendee can run and explain the game |

## Verification

Use deterministic cases for longest-prefix match, forward-only reachability, return-path failure, TTL expiry, exact target RTT, lower-than-target success, and malformed level data. Independently derive expected target RTTs; do not use the production evaluator to generate its own expected answers. Record pass, fail, or not run for each acceptance criterion in the README.

## Scope controls

Do not add device placement, arbitrary wiring, adjustable link latency, CLI emulation, or protocols beyond static IPv4 routes in v1. If a level cannot be completed in the workshop time, reduce the number of levels while preserving a complete route-edit → ping → explanation loop and update the spec first.

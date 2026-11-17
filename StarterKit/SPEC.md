# Slow Ping · First playable specification

> Workshop input, superseded by [the generated MVP spec](../specs/001-maximize-ping-latency/spec.md). Static routing is the initial MVP; additional protocols may follow immediately after owner confirmation.

## The pitch

The player is a network engineer who changes routes in a working network to make a ping from A to B as slow as possible while keeping it successful. The game shows the request and reply paths and the round-trip time after each ping.

Each level begins with an existing topology and working routes. The player inspects the network, edits static routes through a graphical interface, and runs ping. The session ends when the player reaches the best achievable successful round-trip latency in all three levels.

## Who this is for

- **Learner:** beginner networking students and workshop attendees.
- **Assumed knowledge:** basic familiarity with the idea that routers forward packets; the opening briefing explains routes, next hops, ping, and latency.
- **What the briefing teaches:** a route selects a next hop; a ping needs a request path and a reply path; link delay accumulates along both paths.
- **Why interaction helps:** learners see that the route with more delayed links can still deliver traffic, while a loop or missing route cannot count as successful slow delivery.
- **Session target:** 5–10 minutes, with unlimited thinking time.

## Learning outcomes and evidence

| ID | After playing, the learner can… | The game asks them to… | Evidence of success |
| --- | --- | --- | --- |
| LO1 | Read a small topology and identify the current request and reply paths | Inspect the starting ping | Correctly identify both paths and their link delays |
| LO2 | Explain how static next-hop choices affect end-to-end latency | Change a route and compare ping results | Reach the level's best achievable successful round-trip time and explain the detour |
| LO3 | Distinguish slow delivery from failed delivery | Try a missing route or routing loop | Recognize that no reply or TTL expiry is failure and does not improve the score |

## The technical model

- **Rule being taught:** each router forwards according to the configured static route with the longest matching destination prefix. A ping succeeds only if its echo request reaches B and its echo reply returns to A.
- **Context:** a deterministic teaching model of a small IPv4 network; it is not a vendor CLI emulator.
- **Assumptions:** each link has a fixed, symmetric one-way delay in milliseconds; endpoint and router processing add no delay; routes are evaluated independently for request and reply destinations; each packet starts with a fixed TTL of 8; repeated-router paths expire and fail; all links are available and have no loss or queueing.
- **Latency:** round-trip time is the sum of the one-way link delays traversed by the request plus those traversed by the reply. Animation speed does not affect the score.
- **Excluded behavior:** dynamic routing, ARP, congestion, queueing, packet loss, real-time device behavior, protocol negotiation, Layer 2 switching, EVPN, MPLS-TE, STP, and broadcast storms.
- **Authoritative references:** [RFC 1812 §5.2.4](https://www.rfc-editor.org/rfc/rfc1812#section-5.2.4) for IPv4 route lookup and forwarding; [RFC 792](https://www.rfc-editor.org/rfc/rfc792) for ICMP Echo and Echo Reply. Fixed delays and the game TTL are explicit teaching assumptions, not claims about real networks.

The level briefing states the model and its limits. Each level includes a published target RTT that is independently checked as the maximum achievable successful result under that level's allowed route edits.

## The repeatable game loop

1. **Brief:** introduce route selection, ping, and the latency model.
2. **Inspect:** show a labeled network diagram, device names, link delays, current routes, starting ping paths, and target RTT.
3. **Choose:** select a router, edit a static route's destination prefix and next hop using labeled controls, then apply the change.
4. **Explain:** run ping and show request and reply paths, per-link delays, total RTT, or the reason delivery failed.
5. **Retry or advance:** allow route changes and retries until the target is reached; then enable the next level.
6. **Reflect:** show levels completed and each level's final successful RTT.

**Worked interaction:** A pings B in 14 ms (7 ms each way). Sending the request through R2 increases its path to 52 ms, while the unchanged reply takes 7 ms: a successful 59 ms RTT. A routing loop instead expires at TTL zero and earns no score.

## Required stories and acceptance criteria

### US1 · Inspect and change a working topology — P1

As a learner, I want to see a working network and change routes so that I can test how route choice affects latency.

- **AC1:** A fresh session opens with an introductory briefing before the first level.
- **AC2:** Each of three levels starts with a valid, functional topology, current route tables, and a successful baseline ping.
- **AC3:** The topology diagram labels each device and link delay and has a text equivalent.
- **AC4:** Selecting a router exposes its current static routes and lets the player change a destination prefix and next hop to a valid connected neighbor.
- **AC5:** Applying a route change does not silently count as a ping; the player explicitly runs ping to evaluate it.

### US2 · Maximize latency while preserving delivery — P1

As a learner, I want to make a successful ping as slow as possible and understand the result.

- **AC6:** For a successful ping, the game displays the full request and reply paths, per-link delays, and round-trip time in milliseconds.
- **AC7:** A missing route, invalid next hop, or TTL expiry is reported as failure and never improves the level score.
- **AC8:** Each level has a preverified target RTT equal to its best achievable successful result under the allowed edits. The level completes only when a successful ping reaches that target.
- **AC9:** Changing routes and running ping can be repeated without a penalty. Reset restores that level's original topology and routes.
- **AC10:** A completed level records its best successful RTT once and enables the next level. Completing all three opens a summary.

### US3 · Use the game with accessible controls — P1

As a keyboard user, I want to inspect the topology, edit routes, run ping, and read feedback without relying on pointer precision or color.

- **AC11:** All core actions have accessible names, visible focus, and keyboard operation.
- **AC12:** Request and reply paths can be distinguished by text, labels, and patterns as well as color.
- **AC13:** Reduced-motion settings suppress or simplify packet animation without delaying results or removing information.

## Version-one content

Three levels use the same route-editing mechanic and add one concept at a time.

| Level | New concept | Prerequisite | Misconception to expose |
| --- | --- | --- | --- |
| 1 · Take the scenic route | A successful route can be longer than the baseline | Read a labeled topology and next hop | More hops always mean failure |
| 2 · Make the reply travel | Request and reply can use different routes | Level 1 | Ping latency is only the request path |
| 3 · Slow, not stuck | Maximize successful RTT under a TTL limit | Levels 1–2 | A loop or timeout is a slow successful ping |

**Progression:** sequential, retry without penalty. No timer, points beyond the level's RTT target, lives, leaderboard, or speed scoring. Hints remain available. Reload starts a fresh session.

## Cases the implementation must satisfy

| Case | Input state | Player action | Expected result | Why / source |
| --- | --- | --- | --- | --- |
| Correct | Valid request and reply routes with total RTT equal to the level target | Run ping | Success, both paths and delay sum shown; level completes | RFC 792 Echo; RTT is defined by this game model |
| Plausible mistake | Request path reaches B but reply has no route to A | Run ping | Failure, identify the missing reply route; no completion or score increase | Ping requires a returned Echo Reply |
| Boundary | Route loops until the packet TTL reaches zero | Run ping | TTL expiry is failure; no latency score | RFC 1812 §5.3.1 TTL behavior; game starts packets at TTL 8 |
| Suboptimal | Successful ping below the level target | Run ping | Show measured RTT and path; keep level open | Level's independently checked target |
| Unsupported content | Duplicate route priority or a next hop not connected to the router | Open level | Content/configuration error; no grading | Invalid author data must not be treated as learner failure |

## Experience direction

- **Visual metaphor:** a network map with animated ping packets traveling along highlighted links.
- **One memorable moment:** show the request take a deliberate detour, then reveal the successful reply and accumulated RTT.
- **Always visible:** device labels, link delays, current routes, request/reply path, target RTT, and latest ping result.
- **Feedback voice:** patient and specific; name the route decision and its effect.
- **Layout:** topology first, route editor beside or below it, ping controls and explanation always visible.

## Non-goals

No user accounts, multiplayer, backend, live infrastructure, runtime AI, arbitrary topology editor, free-form CLI, persistence, dynamic routing, EVPN, MPLS-TE, STP, broadcast storms, or protocol selection in v1. The player edits routes in supplied topologies; they do not add devices or change link delays.

## Assumptions to confirm during clarify

- Round-trip time is the objective because ping includes request and reply; one-way delay is shown as a breakdown.
- Each level announces its best achievable RTT as the completion target; the player is not asked to prove an unbounded maximum.
- v1 has three levels, static IPv4 routes, fixed symmetric link delays, and an eight-hop TTL.

## Release evidence

All acceptance criteria have a recorded result. The target RTT for every level is independently checked against all allowed route choices. A learner completes all three levels in a fresh session, including a keyboard-only playthrough. The README states actual run instructions, model limits, and unrun checks.

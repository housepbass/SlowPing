# Feature Specification: Slow Ping MVP

> Historical feature. Superseded for active gameplay by [003 static difficulty](../003-static-difficulty/spec.md). The TE experiment is retired.

**Feature Branch**: `main` (feature discovery uses `.specify/feature.json`)
**Created**: 2026-11-17
**Status**: Ready for implementation
**Input**: Build a graphical game where players change a working network to maximize successful ping RTT. Static routes are the MVP; additional protocols can follow immediately after owner confirmation.

## User Scenarios & Testing

### User Story 1 - Take the scenic route (Priority: P1)

A networking learner opens a working topology, changes a router's next hop through graphical controls, and runs ping to discover a slower successful path.

**Why this priority**: This is the complete core learning loop.
**Independent Test**: Complete level 1, then deliberately create a loop and recover by resetting.

**Acceptance Scenarios**:
1. Given a fresh session, when the player starts, then a briefing introduces next hops, one-way link delay, request/reply paths, and the goal before route editing.
2. Given any initial level, when ping runs, then it succeeds and shows baseline RTT and both paths.
3. Given a router, when selected from the diagram or device selector, then its routes, permitted next hops, and locked entries are visible; applying edits preserves diagram structure.
4. Given a valid edited topology, when ping runs, then it shows both paths and their separate delay sums, total RTT, and comparison with baseline and target.
5. Given a request or reply with no matching route or expired TTL, when ping runs, then it names the failing leg and router, shows the traversed path, and awards no successful RTT.
6. Given malformed route input, when Apply is selected, then guidance appears and the previously applied routes remain intact.

### User Story 2 - Complete three network challenges (Priority: P1)

A learner progressively detours the request, the reply, and both legs, with hints and a summary.

**Why this priority**: The campaign teaches that ping requires two independently routed legs.
**Independent Test**: Solve each supplied level, verify Next gating and final summary, then restart.

**Acceptance Scenarios**:
1. Given a successful RTT below target, when ping runs, then the result is labeled successful but the level stays open; the best successful RTT updates.
2. Given a successful RTT equal to target, when ping runs, then completion is recorded once and Next becomes available.
3. Given a completed level, when routes are subsequently changed to a failing configuration, then earned completion and best successful RTT remain; current feedback reports failure.
4. Given an unsolved level, when Hint or Show solution is selected, then assistance is recorded separately and no completion is awarded until a successful target ping runs.
5. Given edits, when Reset level is selected, then the supplied routes return; earned completion, best RTT, and assistance remain. The result is cleared until another ping runs.
6. Given three completed levels, when Next is selected, then a session summary shows each best RTT and assistance; confirmed Restart clears the session, cancellation preserves it.

### User Story 3 - Play without pointer precision (Priority: P1)

A learner can inspect the graph, configure routes, read results, use hints, reset, and advance by keyboard.

**Why this priority**: A graphical network must remain usable without dragging or color discrimination.
**Independent Test**: Complete all three levels through native keyboard controls with reduced motion enabled.

**Acceptance Scenarios**:
1. Given keyboard navigation, when each action is reached, then it has a visible focus indicator and accessible name.
2. Given a diagram, when the text alternative is opened, then every link and delay and the request/reply paths can be read in text.
3. Given reduced motion or a narrow 375px window, when a ping runs, then its complete explanation and controls remain available without waiting for animation or overflowing the page.

### Edge Cases

- Unapplied edits cannot affect ping. Applying edits makes a prior result visibly stale; Run ping evaluates only applied configuration.
- Failure on the request does not fabricate a reply; failure on the reply retains the successful request trace.
- TTL starts at 8 for each leg. Routers decrement before forwarding; zero prevents traversal of the outgoing link. Endpoints do not decrement.
- All tied optimal successful configurations are accepted. RTT is a sum of fixed integer delays; no wall-clock timeout or artificial score for waiting.
- Route loops are traversed until TTL expires, not treated as success. TTL is not elapsed milliseconds.
- Duplicate prefixes on one router, invalid authored endpoints/links/choices, or an unattainable target are content errors, never learner failure.
- Load failure shows a readable error and Retry. Reload starts a fresh session. Repeated ping cannot award duplicate completions.

## Requirements

### Functional Requirements

- **FR-001**: Provide three sequential levels, each beginning with a finite working topology and successful baseline ping, a briefing, and a target greater than baseline.
- **FR-002**: Show labeled endpoints A/B, routers, all links with fixed symmetric one-way millisecond delays, permitted edits, and target RTT.
- **FR-003**: Allow selecting routers graphically or using a labeled selector; configure existing static route slots using finite, authored destination-prefix choices and adjacent next-hop choices, then explicitly Apply.
- **FR-004**: Show immutable endpoint attachments/direct-delivery routes and editable static routes; reject duplicates and malformed input without changing applied configuration. Endpoints and wires cannot be edited in this MVP.
- **FR-005**: Explicit Run ping sends one Echo Request A→B and, only upon its arrival, an independently routed Echo Reply B→A. Use longest matching prefix, one next hop, and no ECMP. IPv4 addresses and prefix masks must be valid.
- **FR-006**: Each leg starts at TTL 8; each router decrements before forwarding and discards at zero. No route, invalid adjacency, or TTL expiry fails delivery with a specific reason and location.
- **FR-007**: Successful RTT equals summed traversed link delays for both legs; show ordered request/reply traces, delay breakdowns, and baseline/target comparisons. Animation never changes RTT or delays the availability of feedback.
- **FR-008**: Keep the greatest successful RTT per level; failure does not update it. A successful ping at the preverified maximum target completes the level once; accept equivalent optimal configurations.
- **FR-009**: Keep Next disabled until current level completes. Final Next opens a summary. Level resets restore initial routes but preserve earned results; confirmed session restart clears all results and returns to the introduction.
- **FR-010**: Provide unlimited retries, a method hint and explicit worked solution per level; record assistance separately from completion and require running ping to earn completion.
- **FR-011**: Support keyboard operation and visible focus for all core actions, text equivalents for topology/results, textual status, and reduced motion.
- **FR-012**: Report loading/content errors with Retry and no grading. Malformed author data cannot start a level. Prior results must be labeled stale or cleared following applied edits.
- **FR-013**: Run locally using static project files, without accounts, backend, runtime network services, or AI. Keep session state only until reload.
- **FR-014**: Document supported routing behavior and exclusions in briefings/README, with authoritative source sections and independently derived reference cases and maxima for every level.
- **FR-015**: Provide recorded automated domain/state/content checks and browser checks for correct, wrong, boundary, keyboard, narrow-layout, reduced-motion, and restart behavior, with pass/fail/not-run stated honestly.
- **FR-016**: Treat static routing as initial MVP scope. After owner confirmation, permit additional protocols through subsequent feature specifications while preserving graphical configuration and successful-ping latency objective. The plan must describe how shared topology, results, and scoring can be reused.

### Key Entities

- **Level**: identity, title, learning goal, topology, finite edit choices, baseline, optimal target, hints and worked solution.
- **Device**: endpoint or router, identity/label/position, endpoint address or routes, permitted edits.
- **Link**: two distinct devices, fixed positive one-way integer millisecond delay.
- **Route**: destination prefix, adjacent next hop, edit permissions. Longest-prefix lookup selects it for a destination.
- **Ping result**: configuration revision, request and reply traces, per-hop TTL/delay, success or failure, RTT on success only.
- **Session**: current level, applied routes, completion, best successful RTT, and assistance for each level.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Each of the three supplied baselines succeeds; each level has at least one successful configuration above baseline and a provably achievable maximum target.
- **SC-002**: Every independently derived success, failure, return-path, prefix-selection, and TTL boundary case produces the expected trace, RTT, and completion result.
- **SC-003**: A reviewer can complete all three levels by keyboard, see their best RTTs and assistance, cancel a restart without losing progress, and confirm restart to begin again.
- **SC-004**: At 375px and typical laptop width, essential controls and feedback are readable without page-wide horizontal scrolling; reduced motion preserves identical results.
- **SC-005**: Running ping makes the result available within 500ms for supplied topologies; graphical playback is optional and does not hold up the result.
- **SC-006**: A recorded demonstration establishes the core edit→ping→explanation loop, accurate scoring, failure handling, progression, and keyboard access so the owner can confirm MVP and immediately choose the next protocol feature.

## Assumptions

- One deterministic request/reply pair is enough; fixed delays mean repeated samples would give identical RTT.
- Three small authored networks use static IPv4 routing, fixed endpoint gateways, symmetric link delays, zero processing delay, and TTL 8. Link count and RTT are different quantities.
- Route choices are finite dropdowns, including an unconfigured option, to keep editing graphical and optimal targets independently provable. No free-form CLI, device placement, rewiring, or adjustable delay in MVP.
- Only currently authored IPv4 prefixes/routes are considered; no ARP, subnet interface emulation, ICMP error return packets, congestion, queueing, loss, dynamic routing, or Layer 2 simulation.
- Desktop browsers are the primary play environment; narrow windows are supported. No storage, login, or leaderboard. Session target is 5–10 minutes without a countdown.
- EVPN, MPLS-TE, STP, broadcast storms and other protocols are subsequent features after owner confirmation; no further waiting period or constitutional prohibition applies.
- Constitution v1.1.0 is the governing draft; owner ratification is still pending. Implementation demonstration does not imply owner confirmation.

## Clarifications

### Session 2026-11-17

Existing conversation resolves the objective (maximum successful ping RTT), initial working topology, graphical editing, and immediate expansion after confirmed MVP. The owner authorized proceeding through all Spec Kit steps and implementation using this context. No new questions were needed. Finite edit choices, displayed optimal targets, reset semantics, and deterministic TTL behavior are explicit MVP defaults for review.

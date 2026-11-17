# Tasks: Slow Ping MVP

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/interaction.md, constitution v1.1.0.
**Tests**: Required by FR-015. Write meaningful independent expected cases before implementation.

## Phase 1: Setup
- [X] T001 Create package.json, start.py, .gitignore and implementation-status.json for a dependency-free static game (FR-013).

## Phase 2: Foundation
- [X] T002 Write independent route, TTL, failure, level-maxima and content regression cases in tests/network.test.js, observe failure (FR-005–008, FR-014–015).
- [X] T003 Implement protocols/static-ipv4.js and engine/network.js with forwarding, packet traversal and validation; enforce data-model.md Level.id, Level.nodes, Level.links, Level.routes, Level.edits, Packet.ttl, PingResult.status, PingResult.rtt, PingResult.legs (FR-004–007, FR-012, FR-016).
- [X] T004 Author three finite topologies, reference solutions, hints and maxima in data/levels.json; enforce data-model.md Level.targetRtt, Level.baselineRtt, Level.solution, Level.hints (FR-001–002, FR-014).

## Phase 3: US1 - Route and ping (P1)
Goal: one complete inspect/edit/ping/explain loop. Independent test: baseline14, request detour59, TTL failure and recovery.
- [X] T005 [US1] Implement introduction, load/retry and complete first-level UI in index.html, main.js, ui/render.js (FR-001–005, FR-012–013).
- [X] T006 [US1] Implement labeled SVG topology and textual network view in ui/topology.js (FR-002, FR-007).
- [X] T007 [US1] Implement route apply, invalid-input and ping trace feedback in ui/render.js and main.js, satisfying contracts/interaction.md (FR-003–007, FR-012).

## Phase 4: US2 - Campaign (P1)
Goal: three levels with hints, scores and honest progress. Independent test: all targets, summary, duplicate results, reset and restart.
- [X] T008 [US2] Write session transitions and scoring regression cases in tests/session.test.js before state implementation (FR-008–010, FR-015).
- [X] T009 [US2] Implement engine/session.js; enforce data-model.md Session.current, Session.records, Session.view including staleness and assistance (FR-008–010, FR-012).
- [X] T010 [US2] Integrate three levels, hints/solution, next gating, summary and restart confirmation in main.js and ui/render.js (FR-008–010).

## Phase 5: US3 - Accessible graphical play (P1)
Goal: keyboard, narrow layout and reduced motion. Independent test: keyboard-only campaign and textual path inspection.
- [X] T011 [US3] Implement responsive styles, focus, path patterns and reduced motion in style.css; keyboard controls, live feedback and focus restoration in ui/render.js and main.js (FR-011, SC-004–005).
- [X] T012 [US3] Add and run tools/browser-check.mjs for real browser campaign, failure, reset, restart, keyboard, layout, motion and feedback timing (FR-015, SC-003–006).

## Phase 6: Polish and release evidence
- [X] T013 Run domain/state/content checks; review all sources and sums; record actual evidence in docs/verification.md and implementation-status.json (FR-014–015, SC-001–006).
- [X] T014 Update README.md and StarterKit inputs to reference current implemented MVP and immediate future protocol expansion; include actual run/check commands, limitations and owner-confirmation status (FR-013–016).

## Dependencies and execution order
T001→T002→T003→T004→T005/T006→T007→T008→T009→T010→T011→T012→T013→T014.
US1 delivers the first playable slice; US2 integrates progression on that slice; US3 validates access to all actions. All three are required for this MVP. No tasks require parallel agents. Once T004 passes, T005 shell and T006 graph could be implemented independently; US2 tests and US3 CSS can be drafted independently but integration remains sequential.

## Implementation strategy
Keep domain/state pure and test independent outcomes. Validate the first round before the other levels. Owner confirmation follows the recorded demonstration; future protocols are subsequent features and do not block delivery.

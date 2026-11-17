# Tasks: explicit-path lab
Tests required by FR-009. Strictly sequential except independent documentation.

## Setup and foundation
- [X] T001 Author data/tunnel.json; enforce data-model.md Tunnel.topologyId, Tunnel.ingress, Tunnel.egress, Tunnel.targetRtt, Tunnel.baselineRtt, Tunnel.solution, Tunnel.hint (FR-001,008).
- [X] T002 Write tests/tunnel.test.js independent oracle, invalid paths, TTL, reply failure and state cases before implementation (FR-009).
- [X] T003 Implement protocols/explicit-path.js and engine/tunnel.js validating paths and data; enforce data-model.md Lab.draftPath, Lab.appliedPath, Lab.enabled, Lab.result, Lab.bestRtt, Lab.completed, Lab.assistance, Lab.error, Lab.attempts (FR-003–006).

## US1: explicit path challenge
- [X] T004 [US1] Add ui/tunnel.js path builder and shared graph/result reuse via ui/render.js and ui/topology.js (FR-001–005,008).
- [X] T005 [US1] Add lab entry/return, apply/enable/run events to main.js and index.html; keep campaign state intact (FR-001,004–006).

## US2: safe experimentation
- [X] T006 [US2] Add palette/ordered drag/drop, remove/reorder, pending/error, help/solution/reset, restart semantics in main.js and ui/tunnel.js (FR-002–006).

## US3: access and regression
- [X] T007 [US3] Add keyboard controls, focus/live feedback, responsive and reduced-motion styling in style.css and ui/tunnel.js (FR-007).
- [X] T008 [US3] Implement/run tools/tunnel-browser-check.mjs, rerun tools/browser-check.mjs and domain suite; record docs/tunnel-verification.md (FR-007,009, SC-001–004).

## Release
- [X] T009 Update README.md and implementation-status.json; record results and commit verified extension (FR-008–009).

Dependencies: T001→T002→T003→T004→T005→T006→T007→T008→T009. First playable slice is T004–005 with a valid applied path; all tasks required for completed feature. No parallel agents needed for implementation. UI module and readonly graph option could be developed independently after domain contracts; integrate in order. Stories are verified independently with direct lab entry.

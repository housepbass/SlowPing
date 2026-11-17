# Feature Specification: MPLS-TE explicit-path lab

> Historical feature. Superseded for active gameplay by [003 static difficulty](../003-static-difficulty/spec.md). The TE experiment is retired.

**Created**: 2026-11-17 | **Status**: Ready for implementation | **Branch**: main
**Input**: Owner accepted adding a simplified MPLS-TE explicit-path challenge after reviewing the static-routing MVP.

## User Scenarios & Testing

### US1 - Build and test a tunnel (P1)
Player opens a directly accessible bonus lab, sees the working five-router topology, and builds an ordered strict-hop path from ingress R1 to egress R5. Apply installs the draft atomically; Run ping compares it with static routing on the same unchanged topology.
**Independent check**: static44ms; R1→R2→R3→R4→R5 request112ms plus static return22ms =134ms target.
**Acceptance**: Add R2/R3/R4 graphically or by labeled keyboard controls; Apply and Enable tunnel; ping shows request path, unchanged return, delta and target completion. Static mode gives44ms without editing static tables. No score for failure.

### US2 - Experiment safely (P1)
**Acceptance**: Reject missing strict-hop links, repeated/unknown nodes and wrong endpoints with an actionable error while preserving applied path. Draft edits do not affect ping. Mode toggle and Apply clear stale results. Remove/reorder controls and drag reordering change only draft. Reset restores direct disabled tunnel and clears current result, while preserving earned best/completion/assistance. Hint/solution record assistance and require ping for completion. Restart clears both campaign and lab, cancel preserves both. Leaving/returning to the lab retains session-only progress.

### US3 - Accessible explicit routing (P1)
**Acceptance**: Keyboard add/move/remove/apply/toggle/ping/hint/reset/back controls reproduce all drag operations. No narrow-page overflow at375px; text topology lists all delays; reduced motion preserves results. The three-level campaign still works unchanged. Lab is reachable before and after campaign completion.

### Edge cases
Empty, incomplete, repeated, wrong endpoint, unknown node, disconnected and too-long paths must never silently fall back to static forwarding when tunnel mode is enabled. IPv4 packet TTL remains bounded by the shared model. A failed reply prevents successful RTT even when request tunnel succeeds. All equivalent maximum paths are accepted.

## Requirements
- **FR-001**: Reuse the five-router topology and locked initial static routes; keep the static campaign intact. Provide intro and summary entry points and a return action.
- **FR-002**: Fixed ingress R1 and egress R5; each intermediate router appears at most once. Add from a draggable palette or native select/button; reorder by drag or labeled left/right controls; remove via buttons. Endpoints remain fixed.
- **FR-003**: Maintain draft and applied path independently. Apply validates router identity, length, unique nodes, fixed endpoints and adjacency of every consecutive pair. Invalid Apply preserves applied path/mode/score and explains the invalid segment. Clear prior errors on a new draft edit.
- **FR-004**: Provide explicit tunnel enable/disable after a valid applied path exists. Enabled request follows the pre-established strict-hop path and uses static delivery at egress; reply uses its own static routes. Disabled mode uses static routes both ways. Share TTL and RTT accounting. Static tables are never overwritten by a tunnel.
- **FR-005**: Show current mode, applied/draft paths, request/reply traces, TTL/reason details, static RTT44ms, measured RTT and signed delta. Pending draft is visibly identified, and Run ping uses the applied path. Successful tunnel target134ms earns completion; preserve highest successful tunnel RTT, completion and assistance across mode switches/reset. No failure score.
- **FR-006**: Provide hint/solution, reset, return and confirmed restart; keep lab progress until reload/session restart. Solution applies/enables path but does not complete until ping runs.
- **FR-007**: Support keyboard equivalents, live status/errors, visible focus, text network alternative, narrow layout and reduced motion. Handle malformed authored lab content without grading.
- **FR-008**: Explain that this is simplified forwarding over a pre-established unidirectional LSP with strict hops: no RSVP-TE signaling, reservations, label allocation/push/swap/pop or control-plane convergence is simulated. Explicit steering changes latency by changing the path; MPLS alone does not add a latency bonus.
- **FR-009**: Independently verify all simple router paths against the target; test domain, state and browser interactions including drag/drop, keyboard, invalid Apply, mode comparisons, return-leg failure and campaign regression.

### Key Entities
Tunnel definition (topology reference, ingress/egress, target, solution, hint), lab state (draft/applied path, enabled, result, best, completion, assistance), ping result (existing shared trace/RTT shape).

## Success Criteria
- **SC-001**: Direct static and direct tunnel both return44ms; full-chain tunnel returns134ms (112+22), maximal over all allowed simple paths.
- **SC-002**: Disconnected/repeated/unknown paths are rejected atomically; IPv4 TTL expiry or reply failure never scores.
- **SC-003**: Browser drag/drop and keyboard can each build/apply/enable the target path and complete the challenge; 375px has no page overflow and reduced motion removes path animation.
- **SC-004**: All prior static campaign domain/state/browser checks still pass and all new checks are recorded. Owner confirmation is separate from automated verification.

## Assumptions and clarifications
Owner accepted this addition after reviewing MVP ("Looking good!" followed by "Sounds good" to the MPLS-TE proposal). No further clarification is needed. The bonus lab is directly accessible; static campaign progression remains three levels. Single directional tunnel steers the request only; return routes are fixed, making target134ms. No tunnel bandwidth/capacity constraints in this iteration. Path simplicity and fixed TTL are explicit game constraints. More complete MPLS protocol simulation is future work.

# Explicit-path lab verification

> Historical report. Current game and evidence: [static-difficulty-verification.md](static-difficulty-verification.md). Tunnel tooling described here was retired.

Date: 2026-11-17, macOS arm64, Node 26, Chrome 157.0.8103.79. Owner accepted expanding the reviewed static MVP with this feature. Owner review of the new lab remains pending.

## Results
- **23 domain/state/content tests pass** (14 original +9 new); [TAP](domain-results.tap). Independent adjacency traversal finds exactly 3 simple router paths, yielding 44, 88, 134 ms; the implementation agrees for each. Invalid endpoints, unknown/repeated/disconnected paths, atomic rejection, draft/apply distinction, TTL expiry, independent reply failure, scoring/help/reset and reorder operations pass.
- **16 tunnel browser checks pass**; [JSON](tunnel-browser-results.json). Real Playwright drag/drop builds and reorders router paths; invalid Apply preserves installed path. Keyboard Tab/Enter/add/move/remove can build and complete 134 ms. Mode toggle compares 44/134 and earned score persists. Help/solution/reset, return to static campaign, restart cancel/confirm, reload and malformed lab data isolation pass. No browser runtime errors.
- **18 original campaign browser checks pass again**; [JSON](browser-results.json). All three static levels remain solvable by keyboard with correct targets59/76/224.
- Layout checked at 375, 760, 1024, 1440 px with no horizontal page overflow. Reduced motion disables path animation. [Desktop](screenshots/tunnel-desktop.png) and [narrow](screenshots/tunnel-narrow.png) screenshots recorded; desktop reviewed visually.

## Requirement coverage
FR001 entries/reuse→browser entry/campaign regression; FR002 editing→pointer drag+keyboard add/move/remove; FR003 atomic validation→invalid draft browser and shape tests; FR004 forwarding→independent request/reply, direct mode, TTL and return-failure tests; FR005 comparison/scoring→44/88/134 oracle and browser delta/best/completion; FR006 lifecycle→help/reset/return/restart checks; FR007 accessibility/content→keyboard/motion/width/error checks; FR008 limits→visible brief, expanded model explanation, README and source review; FR009 independent checks→TAP/browser JSON and this record. SC001–004 pass for the measured scope.

## Model/source review
[RFC3209§4.3.2–4.3.4](https://www.rfc-editor.org/rfc/rfc3209.html#section-4.3.2) describes strict explicit routing. Each modeled strict node denotes one directly connected router. A planning research helper independently enumerated the three paths and reviewed forwarding boundaries. Full chain18+24+28+36=106, endpoint links3+3=6, so request112; reply 3+16+3=22. Maximum 134. This proves a path-length effect, not an intrinsic MPLS latency effect.

The model assumes a pre-established unidirectional path and shares static-engine IPv4 TTL 8 accounting. No label allocation, MPLS label operations/TTL propagation, RSVP, bandwidth reservation or control-plane convergence is claimed. Simple paths are a game constraint. Shared network/RTT code and static tables were reused rather than rewritten.

## Workflow and limits
Spec→clarify(no new blocking questions)→plan/research/contracts/data model→9 tasks→analysis(no blocking conflicts;9FR+4SC covered)→implementation completed. Constitution v1.1.0 unchanged; original formal ratification TODO retained. No extension hooks configured. New domain cases were written and failed on missing modules before implementation. All required checks now pass. No full screen-reader audit, touch-device drag/drop audit, Safari/Firefox matrix or external learner study; native Add/move/remove controls provide the same path operations without dragging. GitHub publishing depends on terminal credentials.

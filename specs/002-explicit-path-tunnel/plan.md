# Implementation Plan: explicit-path lab
**Date**: 2026-11-17 | **Branch**: main | **Spec**: [spec.md](spec.md)

## Summary
Add a bonus tunnel lab on the existing level3 topology. Keep static campaign and engine intact; a new forwarding adapter is injected through ping's existing forward argument. Shared result view and SVG consume identical traces.

## Technical Context
Browser ES modules, native HTML drag/drop plus select/buttons; existing CSS/SVG; memory-only state; no runtime dependencies. Node20+ tests and existing Playwright/Chrome acceptance tooling. At most5routers,3intermediates. Same loopback8001 preview.

## Constitution Check
All six principles pass before/after design: documented reduced protocol model, successful-ping latency score, finite deterministic paths, keyboard equivalents, complete bonus learning loop, and isolated forwarding adapter reusing topology/traversal/scoring. User accepted expansion after MVP review. No constitutional amendment needed.

## Project Structure
protocols/explicit-path.js: path validation and forwarding adapter.
engine/tunnel.js: lab state transitions/evaluation, independent of campaign.
ui/tunnel.js: path builder, readonly topology, mode/status/help/comparison.
main.js: bonus entry/return and pointer/keyboard/drag events.
ui/render.js: expose shared result renderer and entry links; ui/topology.js: optional readonly rendering.
data/tunnel.json: topology reference, fixed ingress/egress, baseline/target, solution and hint.
tests/tunnel.test.js: independent path oracle, adapter/TTL/reply failure/state checks.
tools/tunnel-browser-check.mjs: drag and keyboard acceptance plus narrow/motion/reset/restart.
docs/tunnel-verification.md and machine results: evidence.

## Implementation sequence
Tests before domain implementation. Keep draft→applied atomic, explicit enable toggle, and no static fallback for invalid enabled paths. Trace reasons distinguish tunnel strict-hop from static reply; no label actions are fabricated. Then integration and regression browser checks.

## Complexity Tracking
No new libraries or engine refactor. Native drag/drop is paired with add/reorder/remove buttons for keyboard/touch. Simple paths are a game rule; TTL is shared teaching accounting, not a complete MPLS TTL model.

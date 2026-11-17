# Implementation Plan: Slow Ping MVP

**Branch**: main | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)
**Input**: constitution v1.1.0, conversation, StarterKit inputs; generated spec is canonical.

## Summary

Deliver a static browser game with a network canvas, router inspector, and immediately readable ping trace. Three handcrafted levels progress from request detour to reply detour to combined path optimization. Resolve protocol lookup independently from traversal, traces, scoring, session transitions, and display.

## Technical Context

**Language/Version**: browser JavaScript ES modules, HTML5/CSS; Python 3.11+ launcher; Node 20+ developer checks.
**Primary Dependencies**: none at runtime. Native SVG and HTML controls. Playwright via an available local browser tooling installation for development checks only.
**Storage**: authored data/levels.json; memory only for player state.
**Testing**: node --test tests/*.test.js for independent domain, state, validation, and exhaustive maxima cases; browser playthrough for all user journeys.
**Target Platform**: current desktop browser, typical laptop and 375px narrow layout.
**Project Type**: static browser game.
**Performance Goals**: feedback under 500ms for all supplied levels.
**Constraints**: no network dependencies or credentials at runtime; relative asset paths; model TTL 8.
**Scale/Scope**: 3 levels, 3–5 routers each, two endpoints, finite editable choices.

## Constitution Check

| Principle | Design evidence | Gate |
| --- | --- | --- |
| I Accuracy | Independent request/reply traversal, longest prefix, real TTL decrement, source records | Pass |
| II Delivery before inefficiency | RTT null on failure; completion only at verified target | Pass |
| III Determinism | Finite options, fixed integer delays, no clock-based scoring | Pass |
| IV Access | Native select/buttons, text graph, focus, reduced motion | Pass |
| V Learning loop | Three working baselines, hints/solutions, retry and progression | Pass |
| VI Expansion | Protocol adapter returns forwarding decision; topology/result/session UI remain shared | Pass |

Pre-research and post-design review: all six gates pass. Owner ratification remains a governance TODO; this implementation is authorized by the owner and will be presented for MVP confirmation.

## Project Structure

```text
index.html, style.css, main.js       Page, interaction, orchestration
start.py                            Safe loopback launcher, default 8001, no-browser/port options
engine/network.js                   IPv4 lookup, traversal, content validation
engine/session.js                   Immutable edit/apply/reset/progress/hints transitions
protocols/static-ipv4.js             Protocol-specific forwarding decisions
ui/topology.js                      SVG graph and path presentation
ui/render.js                        Inspector, feedback and session views
 data/levels.json                   Authored levels with reference configurations
 tests/network.test.js              Domain, error, TTL and exhaustive oracle checks
 tests/session.test.js              Session transitions and staleness
 tools/browser-check.mjs            Reproducible browser acceptance checks
 docs/verification.md               Actual evidence and limits
 specs/001-maximize-ping-latency/     Spec, research, data model, contracts, quickstart, tasks
```

## Implementation sequence

Write independent regression cases first, observe failure, implement domain and state, then one complete level, then campaign and accessibility. Browser validation follows domain checks. Do not mark failed or unrun checks complete.

## Complexity Tracking

No exceptions. SVG avoids a rendering dependency. No plugin loader or future protocol stubs; only a small forwarding-decision boundary. Layer 2 flooding and MPLS label events may extend traversal later while sharing topology, explanation shell, and scoring policy.

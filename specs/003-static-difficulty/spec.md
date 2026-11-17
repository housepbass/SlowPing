# Feature Specification: Static routing difficulty progression
**Created**: 2026-11-17 | **Status**: Implementation authorized | **Branch**: main

## User scenarios and acceptance
US1 (P1): Player learns one request detour on a small working topology, then solves substantially harder mesh topologies using the same graphical route editor.
US2 (P1): Player independently configures request and reply, compares weighted links, avoids loops and diagnoses longest-prefix overrides and TTL expiry.
US3 (P1): Player uses keyboard controls, hints, per-hop explanations and text topology on laptop or375px window.

## Requirements
- FR-001: Remove MPLS-TE lab entry points, runtime modules and related controls; preserve history and label old feature documents superseded.
- FR-002: Keep three sequential levels starting with working pings. Escalate from3routers/1editable route, to6routers/10editable routes, to8routers/16editable routes including more-specific host overrides. Graphical inspector remains the single mechanic.
- FR-003: Level2 requires coordinated weighted-path decisions for both legs. Level3 combines a dense mesh, asymmetric permitted return choices, two /32 overrides above /24 routes, and TTL8 (at most7router forwardings per leg). Every result must remain deterministic.
- FR-004: Independently prove optimal successful RTT under allowed route choices and TTL. Record exact request/reply paths, baselines and solutions; avoid enumerating the exponentially large configuration product.
- FR-005: Show explicit per-level briefing, difficulty badge, editable-route count, and level-specific rule notes. Explain /32 vs /24 before evaluating it; show locked routes and selected prefix per hop. Hints teach method before solution.
- FR-006: Preserve retry, assistance, best score, progression, reset/restart and keyboard/reduced-motion/narrow-layout behavior. Current and best RTT must distinguish success from failure.
- FR-007: Test baseline/maximum, a greedy-hop mistake, asymmetric reply, host-route precedence and disabling, missing route, loop and TTL boundary. Verify campaign in browser at all targets and keyboard-only use, plus layout375/760/1024/1440.

## Success criteria
SC-001: All three baselines succeed and independently calculated targets can be reached with authored solutions.
SC-002: Editable decisions increase1→10→16 and router count3→6→8. Level3's no-TTL optimum is higher than legalTTL8 optimum, proving the hop budget matters.
SC-003: All domain/session/content and browser checks pass, no active TE controls or runtime imports remain; level notes explain each new difficulty rule.

## Clarifications and scope
User redirected product from TE to static-only difficulty. Prior protocol expansion is optional future work rather than the next release priority. Keep three levels and existing interaction. Eight routers deliberately exceeds the7router-forwarding budget on a simple path under TTL8. No backend, timers, adjustable link delay or live device emulation.

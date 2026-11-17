# Slow Ping MVP verification

Historical baseline report. The subsequently accepted MPLS-TE extension and current regression results are in [tunnel-verification.md](tunnel-verification.md).

Date: 2026-11-17 (America/Phoenix). macOS arm64, Node26.0.0, Python3.14.6, Chrome157.0.8103.79. This is a local verification report; owner confirmation remains pending.

## Automated outcomes

- Domain, content and session suite: **14 passed, 0 failed**. Command: `node --test tests/*.test.js`. [Original MVP TAP evidence](mvp-domain-results.tap).
- Browser acceptance: **18 passed, 0 failed**, no page runtime errors. [Machine-readable results](browser-results.json). Keyboard-only campaign uses Tab, Enter, and native select type-ahead; macOS headless Chrome did not respond to simulated dropdown arrow menus, so type-ahead was used.
- Python launcher compiles and served index.html and modules over loopback8001. Preview remains running for owner review.
- Each test suite was written before its implementation; initial executions failed due to absent modules. Final checks pass.
- Visual review: introduction and desktop level1/level3 screenshots reviewed; a level3 shortcut label collision was corrected and browser checks rerun.

## Acceptance coverage

| Requirements / outcomes | Result | Evidence |
| --- | --- | --- |
| FR-001–004 topology and graphical routes | Pass | Browser baseline/draft/apply, native device selector, read-only tables; content tests |
| FR-005–007 request/reply, prefix, TTL and RTT | Pass | Independent route/ping fixtures, loop TTL, forward and return failures, browser traces |
| FR-008–010 scoring, progression, help, reset | Pass | Session checks and complete browser campaign, best score retained after failure |
| FR-011 accessibility and motion | Pass for checked interactions | Keyboard campaign, visible focus in screenshots, text alternative, reduced-motion computed style |
| FR-012 error and stale results | Pass | Content rejection, atomic invalid edits, browser failed fetch and Apply clears result |
| FR-013 local static runtime | Pass | No runtime dependencies; local HTTP playthrough and reload clears session |
| FR-014 sources and maxima | Pass | Source review, independent arithmetic below, path oracle plus exhaustive finite route choices |
| FR-015 recorded checks | Pass | TAP, browser JSON, screenshots and this note |
| FR-016 extension boundary | Pass for MVP design | Static adapter separate from graph/traversal/session/UI; research lists future multi-packet limitations |
| SC-001–002 correct baselines/targets | Pass | Independent oracle and all authored edit combinations |
| SC-003 keyboard campaign/restart | Pass | Browser keyboard campaign, summary, cancel/confirm restart |
| SC-004 layouts/motion | Pass for measured layouts |375,760,1024,1440px widths; no horizontal page overflow; reduced-motion animation disabled |
| SC-005 feedback performance | Pass on this machine | 4–8ms measured in final browser run; budget500ms |
| SC-006 demo evidence | Pass; owner confirmation pending | Recorded browser campaign and preview screenshots |

## Independent arithmetic and target proof

Level1: direct leg1+5+1=7; upper chain1+20+30+1=52. Only request can detour: maximum52+7=59ms. Baseline7+7=14ms.

Level2: direct2+8+2=12; upper chain2+15+25+20+2=64. Only reply can detour: maximum12+64=76ms. Baseline24ms.

Level3: direct3+16+3=22; upper chain3+18+24+28+36+3=112; R2–R4 shortcut6 replaces24+28 and reduces latency. Maximum112+112=224ms. Baseline44ms. Loops cannot deliver under destination-only static forwarding and TTL8.

The test oracle enumerates simple adjacency paths with authored next-hop constraints and independently sums maxima. A separate enumeration checks every full route configuration with the production evaluator: 6 configurations each for levels1/2 and2304 for level3. Equivalent optimal configurations are accepted. Invalid data with a mismatched target is rejected before gameplay.

## Scope and limits

Reference text reviewed: RFC1812§5.2.4 route lookup and §5.3.1 TTL; RFC792 Echo/Echo Reply. Source URLs and modeled simplifications are in README and feature research. The model adds fixed symmetric link delay, zero processing delay, logical gateways, and a chosen TTL8; it omits ARP, subnet negotiation, congestion, loss and control-plane convergence. It does not claim vendor fidelity.

No full accessibility certification, screen-reader audit, Safari/Firefox compatibility run, touch-device playthrough, hosted deployment check, or external learner usability study was performed. Reported timings apply to the local checked machine. Formal constitution ratification and owner MVP confirmation remain owner decisions. No later protocol is implemented yet.

## Workflow record

Specification and clarification: 16/16 requirements-quality checklist items pass, no new questions needed; prior owner decisions and explicit defaults recorded. Plan/research/data model/contracts/quickstart generated. Tasks:14. Analysis before implementation: all16FR and6SC covered, constrained-field citations complete, no critical/high conflicts. No extension hooks configured. Implementation executed in dependency order; required source/state/browser checks pass. Constitution temporary sync-impact comment removed before commit as required by the constitution workflow; governance content preserved.

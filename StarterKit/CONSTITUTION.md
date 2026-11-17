# Slow Ping · Project constitution

**Purpose:** help networking learners understand how route selection affects end-to-end ping latency by changing routes in a working, visible network.

**First release:** one core mechanic, three short levels, a browser, and a small workshop-sized build. Protocol expansion and topology authoring are later work.

## C1 · Technical truth is required

Every scored result must follow the documented network model and the challenge data. A successful ping must deliver an echo request from A to B and an echo reply back to A. A missing route, loop, or expired TTL is a failure, never a high-latency success. State simplifications in the level briefing and README.

**Evidence:** independently checked successful, failed, and boundary paths; every networking rule has a source; all level feedback is reviewed.

## C2 · Each level teaches through a routing decision

The player starts with a functional topology, inspects the devices, links, and current ping, then changes static routes to increase round-trip latency while preserving delivery. Feedback shows the actual forward and return paths, their delays, and why the result succeeded or failed.

Use three levels that introduce route choice, compare a direct and indirect path, and apply the idea across a more constrained topology. Hints explain a method before showing a worked solution.

**Evidence:** a learner can explain how a route change affected the ping and why a plausible alternative failed.

## C3 · Progress and scoring are honest

A level is complete only when the ping succeeds and the player reaches the level's stated best achievable round-trip latency. The score is based on modeled latency, not animation duration. Retries are unlimited; hints and resets do not corrupt the topology. No speed bonus, timer, lives, or penalty for help.

**Evidence:** optimal, suboptimal, looped, unreachable, and repeated-submit cases produce the specified results.

## C4 · The graphical editor is accessible

The network is understandable as a labeled diagram and as text. Core actions work with keyboard and pointer; route editing uses labeled controls, not drag precision alone. State and feedback use text as well as color. Respect reduced-motion preferences and never delay controls or results for animation.

**Evidence:** a keyboard-only level playthrough, a narrow-window check, and a reduced-motion check.

## C5 · The first version is deterministic and self-contained

Use authored finite topologies and deterministic routing and latency rules. The game needs no account, backend, live network, runtime AI, or API key. v1 models static IPv4 routes only. EVPN, MPLS-TE, STP, broadcast storms, and arbitrary link editing are out of scope until the core experience is verified.

**Evidence:** the same topology and route configuration always produce the same paths, delivery result, and score; the game runs from static project files.

## C6 · Content and logic can be reviewed separately

Store devices, links, route tables, level goals, and explanations as reviewable data. Keep path evaluation separate from the diagram and session progress. Reject malformed or ambiguous levels instead of grading them.

**Evidence:** inspect a level's data, trace a ping through the evaluator, and add a level without changing the scoring rule.

## C7 · Done is demonstrated

Requirements, plan, tasks, and README describe the same game. A feature is done only when its acceptance checks pass and the result is recorded. Play the complete game from a fresh session; report failed and unrun checks honestly.

## Changing these rules

Record why a material change is needed, update the affected planning documents, and recheck their consistency. Do not weaken accuracy or accessibility to make implementation easier.

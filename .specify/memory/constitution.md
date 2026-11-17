# Slow Ping Constitution

## Core Principles

### I. Networking Accuracy
The game MUST grade a ping from the documented deterministic model. A successful ping requires
both an Echo Request from A to B and an Echo Reply from B to A. Missing routes, invalid next hops,
or TTL expiry MUST fail rather than count as slow delivery. Level briefings and explanations MUST
distinguish modeled behavior from real network behavior.

### II. Delivery Before Inefficiency
The player's goal MUST be to maximize round-trip latency while preserving successful delivery.
Each level MUST state a verified target RTT, and completion MUST require a successful ping at that
target. Animation duration MUST NOT affect scoring. The game MUST show request and reply paths,
per-link delays, total RTT, and a clear reason for failure.

### III. Deterministic, Bounded Challenges
Levels MUST use finite, authored topologies and fixed route rules. The same topology and route
configuration MUST always produce the same result. The initial MVP MUST use static IPv4 routes,
fixed symmetric link delays, and a fixed packet TTL. The initial MVP MUST NOT include live network
access, dynamic routing, queueing, loss, or protocols beyond its agreed scope.

### IV. Graphical and Accessible Interaction
The network MUST be represented as a labeled diagram with a text equivalent. Players MUST be able
to inspect and edit routes, run ping, reset a level, and read results using keyboard or pointer.
Core actions MUST NOT depend on color, hover, precise dragging, or animation. Reduced-motion
preferences MUST preserve all information and controls.

### V. Small, Reviewable Learning Loop
The first release MUST contain three short levels using one route-editing mechanic. Each level MUST
begin with a working topology and teach through inspect → edit route → run ping → explain → retry or
advance. Device and link data, route tables, expected outcomes, and source references MUST be
reviewable independently of the interface.

### VI. Expansion Beyond Static Routing
The MVP design MUST allow additional networking protocols and configuration actions to be added
after the owner confirms the MVP. Protocol behavior and configuration MUST be separated from
topology representation, graphical interaction, ping results, and scoring. Adding a protocol MUST
allow reuse of those shared parts while extending the controls, simulation, and feedback where
the new behavior requires it. The implementation plan MUST identify these boundaries without
requiring future protocols to be implemented before the MVP is confirmed.

Each expansion MUST document its supported protocol behavior, assumptions, permitted player
actions, and independently checkable delivery and latency outcomes. Graphical configuration and
the objective of maximizing latency while preserving successful ping delivery remain core rules.

## Scope Constraints

The initial MVP uses supplied topologies; players edit static routes but do not add devices,
change link delays, or use a CLI. EVPN, MPLS-TE, STP, broadcast storms, dynamic routing,
persistence, multiplayer, and runtime AI are deferred from the initial MVP.

Protocol expansion MAY begin immediately once the owner confirms the working MVP. Confirmation
follows a demonstration of the core graphical edit → ping → explanation loop, successful and failed
delivery, accurate latency scoring, level progression, and keyboard operation, with results recorded.
EVPN, MPLS-TE, STP, and other mechanisms are candidates for subsequent features; their order is
chosen with the owner. Update the relevant feature specification, plan, and tasks before implementing
each expansion. Completing the MVP MUST NOT impose an additional waiting period or require a
constitution amendment merely to introduce another protocol consistent with these principles.

The runtime MUST work from static project files without an account, backend, API key, live network,
or external service. The game MUST report its modeled assumptions and excluded behaviors in its
README and relevant briefings.

## Development Workflow

The constitution, specification, plan, and tasks MUST agree on the active feature's scope. Before
implementation, independently verify the correct, failed, and boundary ping cases and each level's
best achievable successful RTT. Keep domain evaluation separate from rendering and progress state.
Record pass, fail, or not run for every required acceptance check; never present an unrun check as
passed.

When time is limited, reduce level count or visual polish explicitly while preserving a complete,
accurate, accessible route-edit → ping → explanation loop. Material scope changes require updates to
the affected artifacts and a fresh consistency review.

## Governance

This constitution governs the MVP and subsequent protocol expansions and takes precedence over
conflicting implementation choices. Amendments MUST record the reason, update the version, and identify affected planning
artifacts. Use semantic versioning: MAJOR for incompatible principle changes, MINOR for new or
materially expanded principles, and PATCH for clarifications that do not change intent. Review
compliance during specification analysis and before release. The project owner approves material
scope changes.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): owner approval pending | **Last Amended**: 2026-11-17

---
# ARCADE SUBMISSION — fill this file in, commit it to the ROOT of your game repository as ARCADE.md,
# then send John your GitHub URL. Everything between the two --- lines is machine-read.
#
# INSTRUCTIONS FOR THE BUILD AGENT (the coding agent that built this game):
#  1. You were there. Fill every field from your own session, your files and your tool list.
#  2. Do NOT invent. If something was not recorded or you do not know it, write "unknown".
#     A truthful "unknown" is better than a confident guess. Never estimate tokens or cost.
#  3. Ask the human ONLY for the fields marked (HUMAN): name, location, links, consent, first-project.
#  4. Keep strings on one line, quote any value containing a colon. Lists use [a, b, c] or "- item".
#  5. Do not put secrets, API keys, tokens, private URLs or file paths from the human's machine here.
#  6. Run the game once yourself and confirm the Runtime section is correct before you finish.
#  7. Then fill in the three short prose sections below the frontmatter. Plain language, no hype.
arcade_version: 1
game:
  title: Slow Ping
  slug: slow-ping
  tagline: Make the ping slow. Keep it working.
  summary: Change static routes in working networks to maximize successful ping round-trip time. Three increasingly difficult levels teach weighted paths, independent request/reply routing, longest-prefix matching and TTL limits.
  topics:
  - Static routing
  - IPv4
  - ICMP
  - Latency
  - Longest-prefix match
  - TTL
  category: routing
  skill_level: advanced
  play_minutes: unknown
  levels: 3
  card_image: docs/screenshots/arcade-card.png
  card_image_alt: Slow Ping opening screen showing Take the scenic route and a mission card explaining successful request and reply delivery.
  repo: https://github.com/housepbass/SlowPing
  repo_path: ''
  license: Apache-2.0
creator:
  name: Anthony House
  github: housepbass
  location: unknown
  organization: unknown
  links: []
  first_spec_project: true
  workshop: NAF AC6
  consent_to_publish: true
build:
  started: '2026-11-17'
  finished: '2026-11-17'
  wall_time: unknown
  spec_driven:
    framework: GitHub Spec Kit
    framework_version: 1.4.3.dev0
    artifacts:
    - .specify/memory/constitution.md
    - StarterKit/CONSTITUTION.md
    - StarterKit/SPEC.md
    - StarterKit/PLAN.md
    - specs/001-maximize-ping-latency/checklists/requirements.md
    - specs/001-maximize-ping-latency/contracts/interaction.md
    - specs/001-maximize-ping-latency/data-model.md
    - specs/001-maximize-ping-latency/plan.md
    - specs/001-maximize-ping-latency/quickstart.md
    - specs/001-maximize-ping-latency/research.md
    - specs/001-maximize-ping-latency/spec.md
    - specs/001-maximize-ping-latency/tasks.md
    - specs/002-explicit-path-tunnel/checklists/requirements.md
    - specs/002-explicit-path-tunnel/contracts/interaction.md
    - specs/002-explicit-path-tunnel/data-model.md
    - specs/002-explicit-path-tunnel/plan.md
    - specs/002-explicit-path-tunnel/quickstart.md
    - specs/002-explicit-path-tunnel/research.md
    - specs/002-explicit-path-tunnel/spec.md
    - specs/002-explicit-path-tunnel/tasks.md
    - specs/003-static-difficulty/checklists/requirements.md
    - specs/003-static-difficulty/path-proof.json
    - specs/003-static-difficulty/plan.md
    - specs/003-static-difficulty/research.md
    - specs/003-static-difficulty/spec.md
    - specs/003-static-difficulty/tasks.md
    task_count: 29
    loops_or_phases: unknown
  model: gpt-6.1-sol
  helper_models:
  - gpt-6.1-sol
  harness: Codex desktop app
  harness_version: unknown
  mcp_servers:
  - mcp__cua_repl (integrated-browser computer use; server version unknown)
  rag_and_sources:
  - User-authored requirements, corrections and supplied NAF_AC6 AGENTS.md development guidelines in this chat
  - https://github.com/automateyournetwork/NAF_AC6/blob/main/README.md (local workshop README read)
  - https://github.com/automateyournetwork/NAF_AC6/blob/main/WORKSHOP/LAB/README.md (local lab walkthrough read)
  - https://github.com/automateyournetwork/NAF_AC6/tree/main/WORKSHOP/LAB/StarterKit (CONSTITUTION.md, SPEC.md, PLAN.md and README.md read locally)
  - https://github.com/automateyournetwork/NAF_AC6/blob/main/LICENSE (copied workshop license)
  - https://github.com/automateyournetwork/NAF_AC6/blob/main/WORKSHOP/LAB/Examples/PerHopWorks/README.md (worked-example reference only)
  - https://github.com/automateyournetwork/NAF_AC6/blob/main/WORKSHOP/LAB/Examples/PerHopWorks/implementation-status.json (example completion status inspected)
  - PerHopWorks/tools/browser/package.json and keyboard.mjs (local example developer-tool patterns inspected; these are workshop-relative paths)
  - https://github.com/automateyournetwork/NetworkingVideoGameStarterKit (reference and search-result description; full README fetch not recorded)
  - https://github.com/github/spec-kit (official CLI installation source, commit f56d514a6bec2d1cbcd3e33dc4387ca6178b4678)
  - https://github.github.com/spec-kit/ (documentation search result used)
  - https://github.com/github/spec-kit/blob/main/docs/install/uv.md (installation-guide search result and workspace reference)
  - https://docs.astral.sh/uv/ (documentation link saved as a reference; full page read not recorded)
  - specify version, specify check, specify init --help, gh auth login --help and uv tool install --help (actual local CLI output)
  - .specify/templates/constitution-template.md, spec-template.md, plan-template.md, tasks-template.md and checklist-template.md (bundled templates reviewed/resolved)
  - .specify/init-options.json and .specify/memory/constitution.md (active project configuration and principles)
  - StarterKit/CONSTITUTION.md, StarterKit/SPEC.md and StarterKit/PLAN.md (personalized inputs)
  - specs/001-maximize-ping-latency/ (MVP spec including Clarifications, plan, research, data model, UI contract, quickstart, tasks and requirements checklist)
  - specs/002-explicit-path-tunnel/ (historical TE experiment spec, plan, research, data model, UI contract, quickstart, tasks and checklist; retired)
  - specs/003-static-difficulty/ (active spec, plan, research, tasks, checklist and independent path-proof.json)
  - README.md, implementation-status.json, data/levels.json, tests/network.test.js, tests/session.test.js and tools/author-levels.py (active build and independent proof evidence)
  - docs/verification.md and docs/tunnel-verification.md (historical verification records)
  - docs/static-difficulty-verification.md, docs/domain-results.tap, docs/browser-results.json and docs/arcade-runtime-check.json (current verification records)
  - https://www.rfc-editor.org/rfc/rfc1812.html (sections5.2.4 and5.3.1 fetched and searched)
  - https://www.rfc-editor.org/rfc/rfc792.html (Echo or Echo Reply fetched and searched)
  - https://www.rfc-editor.org/rfc/rfc3209.html (section4.3 strict explicit routes fetched for the retired TE experiment)
  - https://automateyournetwork.com/arcade/ARCADE.md (this template, fetched with curl after the web tool could not open it)
  skills_and_plugins:
  - speckit-constitution (workspace skill supplied by the user; later installed v1.4.3.dev0 constitution workflow also read)
  - speckit-specify (user-supplied workspace skill and installed v1.4.3.dev0 workflow)
  - speckit-clarify (installed workflow; prior conversation resolved critical questions)
  - speckit-plan (installed workflow; delegated research helper used)
  - speckit-tasks (installed workflow)
  - speckit-analyze (installed workflow; consistency reviews)
  - speckit-implement (installed workflow; task execution and checks)
  - loop (SKILL.md inspected to answer an earlier identification question; no loop/heartbeat created or used for the game)
  - unified-computer-use (mcp__cua_repl browser interface used for GitHub authentication/repository setup and local preview)
  - No Spec Kit extension hooks were configured
  other_tools:
  - functions.exec orchestration, exec_command shell, apply_patch, write_stdin and view_image
  - Native collaboration spawn_agent/followup_task tools (one research helper, reused for protocol review; exact helper model self-reported as gpt-6.1-sol)
  - Native web search/open/find tool (official source lookup; not an RFC MCP)
  - Git and GitHub browser UI (repository creation, visibility and source control); GitHub CLI OAuth flow was declined because its scopes exceeded the selected repository
  - curl (exact Arcade template fetch)
  - uv (version unknown) and Specify CLI1.4.3.dev0 (installed from official github/spec-kit commit recorded above)
  - Node.js26.0.0 and node:test
  - Python3.14.6 (static serving, graph authoring, compile check and manifest processing)
  - npm11.12.1 (version shown in installation notice)
  - Playwright1.64.1 local Node development package; not Playwright MCP
  - Google Chrome157.0.8103.79 (headless developer checks) and Codex integrated browser
  - Prettier3.6.2 (developer source formatting)
  - PyYAML (version unknown) for frontmatter parsing/validation
  human_prompts: unknown
  usage:
    input_tokens: unknown
    output_tokens: unknown
    cost_note: unknown
  ai_generated_assets:
  - Code-authored native SVG icons, network diagrams and CSS styling; no image, audio or 3D generation tool was used
  - Arcade card and verification PNGs are browser screenshots of the game, not image-generator outputs
runtime:
  kind: static-web
  stack:
  - HTML5
  - CSS
  - Browser JavaScript ES modules
  - Native SVG
  - Local JSON
  - Python3.11+ optional local static server
  start: python3 start.py
  url_after_start: http://127.0.0.1:8001
  hosted_url: unknown
  static_root: .
  requires_install: false
  requires_network: false
  requires_api_key: false
  uses_ai_at_runtime: false
  browsers:
  - Google Chrome157.0.8103.79 (automated browser checks)
  - Codex integrated browser (preview observed; engine version unknown)
  accessibility: Keyboard-only campaign using Tab/Enter and native select type-ahead passed; visible focus and text topology/path alternatives checked; reduced-motion behavior and375/760/1024/1440px page-overflow checks passed. Full screen-reader audit, touch-device study and accessibility certification unknown/not performed.
  save_state: Memory only; reload or confirmed session restart clears the session. No localStorage or backend persistence.
verification:
  tests: node --test tests/*.test.js
  tests_passing: 20
  facts_sourced_from:
  - RFC1812§5.2.4 (IPv4 route lookup and longest-prefix subset)
  - RFC1812§5.3.1 (TTL decrement and discard)
  - RFC792 Echo/Echo Reply (request and returned reply)
  known_limits:
  - Deterministic teaching model with fixed symmetric integer one-way delays, zero router processing delay and chosen TTL8
  - No ARP, interface subnet negotiation, queueing, congestion, packet loss, dynamic routing, Layer2 switching or live infrastructure
  - Finite permitted edits and R3 return-hop restrictions are authored challenge constraints
  - Three levels; no arbitrary device placement, wiring, CLI, persistence, accounts, multiplayer or runtime AI
  - The MPLS-TE experiment was retired; RFC3209 was used historically but no TE runtime is shipped
  - Play duration of the harder revision is unknown; no timed external learner study was recorded
  - Full accessibility certification, screen-reader coverage and Safari/Firefox compatibility are unknown/not checked
  - No public hosted deployment is recorded; current implementation and manifest commits require a user-authenticated GitHub push
---

## In one paragraph

Slow Ping is a graphical IPv4 routing puzzle for networking learners who want increasingly demanding path-planning challenges. Every topology starts with a working ping; the objective is to maximize its round-trip latency while preserving delivery. Three levels grow from three routers and one editable route to eight routers and sixteen editable entries. Players inspect request and reply paths, discover host-route overrides, and avoid loops and TTL expiry.

## How it was built

We began with the workshop READMEs and personalized constitution, specification and plan inputs. Spec Kit initialization produced the working constitution and MVP artifacts; clarification, planning, tasks and consistency review preceded implementation. The first static-routing game was followed by a simplified MPLS-TE experiment. The owner then chose static routing with substantially harder levels, so we retired the tunnel runtime and authored six- and eight-router meshes. Python graph search and a separate JavaScript path oracle established maxima of 59, 228 and 349 ms.

The first CLI install hit an authenticated package index; using public PyPI with configuration discovery disabled resolved it. Interactive initialization stalled on an unseen selection and succeeded non-interactively. Headless Chrome dropdown arrows did not work in the test harness, so keyboard checks used native type-ahead. Browser tests drove actual route controls and checked failures, resets, progression, motion and narrow layouts. The current suite has 20 domain/session/content checks and 22 browser checks. A fresh launcher run confirmed a 14 ms baseline and 59 ms edited ping without external requests. The card image is a browser screenshot. GitHub browser authentication did not provide terminal credentials; subsequent commits remain local until pushed.

## What we'd tell the next builder

- Prove each target independently before implementing its evaluator; include request and reply, prefix precedence and the TTL boundary.
- Increase the routing decisions before adding protocols. Keep draft/application behavior, help and failure explanations visible and testable.
- Record versions, model identifiers, tools and verification as you work. Browser sign-in does not authenticate Git pushes; never put credentials or private machine paths in this manifest.

<!-- Provenance notes: the current session explicitly identified gpt-6.1-sol; an earlier session segment did not separately report an exact model ID, so that earlier identity is unknown. The helper separately confirmed gpt-6.1-sol. Only the actually invoked MCP namespace is listed; the complete inventory of otherwise connected servers is unknown. RFC MCP, Blender MCP and image generation appeared in the Per-Hop Works reference story but were not used to build Slow Ping. Local Playwright is not Playwright MCP. Location and organization are unknown; optional creator links were not supplied. No links are published from that absent information. The task total is 14 MVP + 9 retired TE + 6 static-difficulty tasks; no build-loop count, token totals, cost, elapsed build time or human-prompt count was measured. Formal constitution ratification remains pending. Clarification and consistency findings are embedded in the listed artifacts; standalone clarify.md and analysis.md files do not exist. -->

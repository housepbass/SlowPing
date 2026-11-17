# Run and validate Slow Ping

From the SlowPing project directory: `python3 start.py` (or `python3 start.py --port 8001 --no-browser`). Open the printed local address; Ctrl+C stops it. From another directory use the absolute path to start.py.

Developer checks: Node20+ `node --test tests/*.test.js`. Browser acceptance tool: `node tools/browser-check.mjs` with an available Playwright package and Chrome; details in tools script and verification note. No game dependency install is required.

1. Start here: briefing→working topology→baseline ping. Level1 baseline14, detour59.
2. Choose R1, send B via R2, Apply, Run ping; target59; Next.
3. Level2 choose R4, send A via R3; Apply and Run ping; target76; Next.
4. Level3 choose R1 send B via R2, R5 send A via R4. Apply at each router, ping; target224; Next shows summary.
5. Create loop R1→R2→R1 where allowed, verify TTL expiry and no score gain. Reset restores working baseline.
6. Show hint/solution: assistance recorded, completion only after ping. Cancel Restart preserves session, confirm restarts. Reload clears session.
7. Repeat with keyboard alone, 375px viewport, and reduced motion; text graph and results remain available.

Expected independent sums, source limits and actual recorded outcomes are in research.md and docs/verification.md. Owner confirmation remains pending after demonstrated MVP.

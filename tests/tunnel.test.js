import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validatePath, tunnelForward } from "../protocols/explicit-path.js";
import {
  createLab,
  validateTunnel,
  editPath,
  applyTunnel,
  toggleTunnel,
  runTunnel,
  resetTunnel,
  assistTunnel,
  insertHop,
  moveHop,
  removeHop,
} from "../engine/tunnel.js";
import { ping, initialRoutes } from "../engine/network.js";
const levels = JSON.parse(
  readFileSync(new URL("../data/levels.json", import.meta.url)),
);
const def = JSON.parse(
    readFileSync(new URL("../data/tunnel.json", import.meta.url)),
  ),
  level = levels[2];
const optimal = () =>
  toggleTunnel(applyTunnel(editPath(createLab(def), def.solution), level, def));
test("authored tunnel is valid and both direct modes equal44ms", () => {
  validateTunnel(def, levels);
  let s = runTunnel(createLab(def), level, def);
  assert.equal(s.result.rtt, 44);
  assert.equal(s.bestRtt, null);
  s = runTunnel(toggleTunnel(s), level, def);
  assert.equal(s.result.rtt, 44);
  assert.equal(s.bestRtt, 44);
  assert.ok(!s.completed);
});
test("tunnel overrides request only; egress delivers B; static routes remain intact", () => {
  const before = structuredClone(level.routes),
    s = runTunnel(optimal(), level, def);
  assert.equal(s.result.rtt, 134);
  assert.deepEqual(
    s.result.legs.map((l) => l.delayMs),
    [112, 22],
  );
  assert.deepEqual(s.result.legs[0].path, [
    "A",
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "B",
  ]);
  assert.deepEqual(s.result.legs[1].path, ["B", "R5", "R1", "A"]);
  assert.deepEqual(level.routes, before);
  assert.ok(s.completed);
  assert.match(s.result.legs[0].steps[1].reason, /strict hop/);
});
test("independent adjacency oracle enumerates all valid simple paths and maximum134", () => {
  const totals = [];
  function walk(id, path, cost) {
    if (id === "R5") {
      totals.push({ path, rtt: cost + 6 + 22 });
      return;
    }
    for (const e of level.links) {
      const n = e.a === id ? e.b : e.b === id ? e.a : null;
      if (!n || !n.startsWith("R") || path.includes(n)) continue;
      walk(n, [...path, n], cost + e.delayMs);
    }
  }
  walk("R1", ["R1"], 0);
  assert.deepEqual(
    totals.map((x) => x.rtt).sort((a, b) => a - b),
    [44, 88, 134],
  );
  for (const v of totals) {
    const result = ping(level, initialRoutes(level), {
      forward: tunnelForward(level, v.path, def),
    });
    assert.equal(result.rtt, v.rtt);
  }
});
test("reject invalid path shapes, duplicates, endpoints and nonadjacent segments", () => {
  for (const path of [
    [],
    ["R1"],
    ["R1", "R2", "R1", "R5"],
    ["R1", "R3", "R5"],
    ["R5", "R1"],
    ["R1", "B", "R5"],
    ["R1", "X", "R5"],
    null,
  ])
    assert.throws(() => validatePath(level, path, def));
  const s = optimal();
  const bad = applyTunnel(editPath(s, ["R1", "R3", "R5"]), level, def);
  assert.match(bad.error, /R1.*R3/);
  assert.deepEqual(bad.appliedPath, s.appliedPath);
  assert.equal(bad.enabled, s.enabled);
  assert.equal(s.error, "");
});
test("pending draft does not change ping; apply and mode switches clear stale traces", () => {
  const s = runTunnel(createLab(def), level, def),
    draft = editPath(s, def.solution);
  assert.equal(runTunnel(draft, level, def).result.rtt, 44);
  assert.deepEqual(draft.appliedPath, ["R1", "R5"]);
  const applied = applyTunnel(draft, level, def);
  assert.equal(applied.result, null);
  assert.equal(toggleTunnel(s).result, null);
});
test("invalid enabled state never falls back; TTL and failed reply never score", () => {
  const invalid = { ...optimal(), appliedPath: ["R1", "R3", "R5"] };
  const s = runTunnel(invalid, level, def);
  assert.equal(s.result.status, "invalid-config");
  assert.equal(s.bestRtt, null);
  const f = tunnelForward(level, def.solution, def);
  assert.equal(
    ping(level, initialRoutes(level), { forward: f, ttl: 3 }).status,
    "ttl-expired",
  );
  const routes = initialRoutes(level);
  routes.R5[1].nextHop = null;
  const fail = ping(level, routes, { forward: f });
  assert.equal(fail.rtt, null);
  assert.equal(fail.legs[0].status, "success");
  assert.equal(fail.legs[1].status, "no-route");
});
test("help, solution, reset and disable preserve earned record but not traces", () => {
  let s = assistTunnel(createLab(def), level, def, 2);
  assert.equal(s.assistance, 2);
  assert.ok(s.enabled);
  assert.ok(!s.completed);
  s = runTunnel(s, level, def);
  assert.ok(s.completed);
  s = resetTunnel(s, def);
  assert.equal(s.result, null);
  assert.equal(s.enabled, false);
  assert.equal(s.bestRtt, 134);
  assert.equal(s.assistance, 2);
  assert.ok(s.completed);
  assert.equal(runTunnel(s, level, def).result.rtt, 44);
});
test("insertion, drag-style reorder, keyboard reorder and remove preserve fixed ends", () => {
  let s = createLab(def);
  for (const r of ["R2", "R3", "R4"])
    s = insertHop(s, level, r, s.draftPath.length - 1, def);
  assert.deepEqual(s.draftPath, def.solution);
  s = moveHop(s, 2, 1);
  assert.deepEqual(s.draftPath, ["R1", "R3", "R2", "R4", "R5"]);
  s = insertHop(s, level, "R3", 4, def);
  assert.deepEqual(s.draftPath, ["R1", "R2", "R4", "R3", "R5"]);
  s = removeHop(s, 1);
  assert.deepEqual(s.draftPath, ["R1", "R4", "R3", "R5"]);
  assert.deepEqual(moveHop(s, 1, 0).draftPath, s.draftPath);
  assert.deepEqual(removeHop(s, 0).draftPath, s.draftPath);
  assert.equal(insertHop(s, level, "B", 1, def), s);
});
test("reject bad authored target, topology, endpoints and solution", () => {
  for (const change of [
    { targetRtt: 999 },
    { topologyId: "unknown" },
    { ingress: "R2" },
    { solution: ["R1", "R3", "R5"] },
    { hint: "" },
  ])
    assert.throws(() => validateTunnel({ ...def, ...change }, levels));
});

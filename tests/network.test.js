import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ping,
  validateLevels,
  initialRoutes,
  applyChanges,
} from "../engine/network.js";
import { matches, decide } from "../protocols/static-ipv4.js";
const levels = JSON.parse(
  readFileSync(new URL("../data/levels.json", import.meta.url)),
);
const copy = (x) => structuredClone(x);
test("IPv4 prefix selection and invalid masks", () => {
  assert.ok(matches("192.0.2.1", "192.0.2.0/24"));
  assert.ok(matches("198.51.100.1", "0.0.0.0/0"));
  assert.ok(!matches("198.51.100.1", "192.0.2.0/24"));
  for (const p of ["999.0.0.1/24", "1.2.3.4/33", "1.2.3/24", "192.0.2.1/24"])
    assert.throws(() => matches("192.0.2.1", p));
  const d = decide(
    {},
    {
      R1: [
        { prefix: "0.0.0.0/0", nextHop: "R2" },
        { prefix: "198.51.100.1/32", nextHop: "R3" },
      ],
    },
    "R1",
    { destination: "198.51.100.1" },
  );
  assert.equal(d.nextHop, "R3");
});
test("all content, baselines and independently calculated solutions", () => {
  validateLevels(levels);
  for (const [i, expected] of [
    [0, [14, 59]],
    [1, [24, 76]],
    [2, [44, 224]],
  ]) {
    const l = levels[i];
    assert.equal(ping(l, initialRoutes(l)).rtt, expected[0]);
    const r = ping(l, applyChanges(l, initialRoutes(l), l.solution));
    assert.equal(r.status, "success");
    assert.equal(r.rtt, expected[1]);
  }
});
test("request-only detour uses independent direct reply", () => {
  const l = levels[0];
  const r = ping(l, applyChanges(l, initialRoutes(l), l.solution));
  assert.deepEqual(
    r.legs.map((x) => x.delayMs),
    [52, 7],
  );
  assert.deepEqual(r.legs[0].path, ["A", "R1", "R2", "R3", "B"]);
  assert.deepEqual(r.legs[1].path, ["B", "R3", "R1", "A"]);
});
test("missing request and missing reply do not become successful scores", () => {
  const l = levels[0];
  let routes = initialRoutes(l);
  routes.R1[0].nextHop = null;
  const out = ping(l, routes);
  assert.equal(out.status, "no-route");
  assert.equal(out.rtt, null);
  assert.equal(out.legs.length, 1);
  routes = initialRoutes(l);
  routes.R3[1].nextHop = null;
  const back = ping(l, routes);
  assert.equal(back.status, "no-route");
  assert.equal(back.rtt, null);
  assert.equal(back.legs.length, 2);
  assert.equal(back.legs[1].failedAt, "R3");
});
test("loop runs until TTL expires rather than failing immediately on revisit", () => {
  const l = levels[2],
    routes = initialRoutes(l);
  routes.R1[0].nextHop = "R2";
  routes.R2[0].nextHop = "R1";
  const r = ping(l, routes);
  assert.equal(r.status, "ttl-expired");
  assert.equal(r.rtt, null);
  assert.equal(r.legs[0].path.length, 9);
  assert.equal(r.legs[0].steps.at(-1).ttl, 0);
});
test("TTL boundary: TTL1 cannot leave first router; TTL2 allows one router", () => {
  const l = levels[0];
  assert.equal(ping(l, initialRoutes(l), { ttl: 1 }).status, "ttl-expired");
  const direct = {
    ...l,
    nodes: [l.nodes[0], l.nodes[1], l.nodes.at(-1)],
    links: [
      { a: "A", b: "R1", delayMs: 1 },
      { a: "R1", b: "B", delayMs: 1 },
    ],
    routes: {
      R1: [
        { prefix: "198.51.100.1/32", nextHop: "B" },
        { prefix: "192.0.2.1/32", nextHop: "A" },
      ],
    },
  };
  assert.equal(ping(direct, direct.routes, { ttl: 2 }).rtt, 4);
});
test("invalid next hop fails without scoring", () => {
  const l = levels[0],
    r = initialRoutes(l);
  r.R1[0].nextHop = "B";
  assert.equal(ping(l, r).status, "invalid-config");
  assert.equal(ping(l, r).rtt, null);
});
test("reject malformed levels and atomic edits", () => {
  for (const mutate of [
    (x) => (x[0].links[0].delayMs = -1),
    (x) => x[0].nodes.push(copy(x[0].nodes[0])),
    (x) => x[0].routes.R1.push(copy(x[0].routes.R1[0])),
    (x) => (x[0].targetRtt = 999),
    (x) => x[0].edits[0].nextHops.push("B"),
  ]) {
    const bad = copy(levels);
    mutate(bad);
    assert.throws(() => validateLevels(bad));
  }
  const l = levels[0],
    before = initialRoutes(l),
    snapshot = copy(before);
  assert.throws(() =>
    applyChanges(l, before, [
      { router: "R1", index: 0, prefix: "198.51.100.1/32", nextHop: "B" },
    ]),
  );
  assert.deepEqual(before, snapshot);
});
// Independent oracle: enumerate simple forward and return paths using adjacency,
// authored next-hop options and destination roles. It never calls production lookup/ping.
function legMaximum(l, from, to, prefix) {
  const adj = (id) =>
    l.links
      .filter((e) => e.a === id || e.b === id)
      .map((e) => [e.a === id ? e.b : e.a, e.delayMs]);
  function walk(id, seen, ttl) {
    if (id === to) return 0;
    if (seen.has(id)) return -Infinity;
    const node = l.nodes.find((n) => n.id === id),
      next = new Set(seen).add(id);
    let choices;
    if (node.kind === "endpoint") choices = adj(id).map((x) => x[0]);
    else {
      if (ttl <= 1) return -Infinity;
      const idx = l.routes[id].findIndex((r) => r.prefix === prefix);
      if (idx < 0) return -Infinity;
      const slot = l.edits.find((s) => s.router === id && s.index === idx);
      choices = slot ? slot.nextHops : [l.routes[id][idx].nextHop];
    }
    return Math.max(
      -Infinity,
      ...adj(id)
        .filter(([n]) => choices.includes(n))
        .map(
          ([n, d]) => d + walk(n, next, node.kind === "router" ? ttl - 1 : ttl),
        ),
    );
  }
  return walk(from, new Set(), 8);
}
test("maxima independently follow path options and exhaustive configurations agree", () => {
  for (const l of levels) {
    assert.equal(
      legMaximum(l, "A", "B", "198.51.100.1/32") +
        legMaximum(l, "B", "A", "192.0.2.1/32"),
      l.targetRtt,
    );
    let best = 0,
      configurations = 0;
    function visit(i, routes) {
      if (i === l.edits.length) {
        configurations++;
        const r = ping(l, routes);
        if (r.status === "success") best = Math.max(best, r.rtt);
        return;
      }
      const s = l.edits[i];
      for (const p of s.prefixes)
        for (const n of s.nextHops)
          visit(
            i + 1,
            applyChanges(l, routes, [
              { router: s.router, index: s.index, prefix: p, nextHop: n },
            ]),
          );
    }
    visit(0, initialRoutes(l));
    assert.equal(best, l.targetRtt);
    assert.ok(configurations > 1);
  }
});

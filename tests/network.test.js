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
    [1, [22, 228]],
    [2, [22, 349]],
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
  const l = levels[1],
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
    (x) => (x[0].briefing = ""),
    (x) => (x[0].links[0].labelX = "bad"),
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
// Independent oracle: enumerate each router's finite local table choices, then
// traverse eligible adjacency paths. Never invokes production prefix lookup/ping.
function contains(address, prefix) {
  const num = (ip) => ip.split(".").reduce((n, x) => n * 256 + Number(x), 0);
  const [network, bits] = prefix.split("/");
  const block = 2 ** (32 - Number(bits));
  return Math.floor(num(address) / block) === Math.floor(num(network) / block);
}
function nextHopOptions(l, id, address) {
  const rows = l.routes[id],
    possible = new Set();
  function enumerate(index, table) {
    if (index === rows.length) {
      if (new Set(table.map((r) => r.prefix)).size !== table.length) return;
      const eligible = table
        .filter((r) => r.nextHop !== null && contains(address, r.prefix))
        .sort(
          (a, b) =>
            Number(b.prefix.split("/")[1]) - Number(a.prefix.split("/")[1]),
        );
      if (eligible.length) possible.add(eligible[0].nextHop);
      return;
    }
    const slot = l.edits.find((e) => e.router === id && e.index === index);
    if (!slot) return enumerate(index + 1, [...table, rows[index]]);
    for (const prefix of slot.prefixes)
      for (const nextHop of slot.nextHops)
        enumerate(index + 1, [...table, { prefix, nextHop }]);
  }
  enumerate(0, []);
  return possible;
}
function legMaximum(l, from, to, ttl = 8) {
  const address = l.nodes.find((n) => n.id === to).address;
  const options = Object.fromEntries(
    l.nodes
      .filter((n) => n.kind === "router")
      .map((n) => [n.id, nextHopOptions(l, n.id, address)]),
  );
  function walk(id, seen, remaining) {
    if (id === to) return 0;
    if (seen.has(id)) return -Infinity;
    const router = l.nodes.find((n) => n.id === id).kind === "router";
    if (router && remaining <= 1) return -Infinity;
    const next = new Set(seen).add(id),
      weights = [];
    for (const edge of l.links) {
      const other = edge.a === id ? edge.b : edge.b === id ? edge.a : null;
      if (other && (!router || options[id].has(other)))
        weights.push(
          edge.delayMs + walk(other, next, remaining - (router ? 1 : 0)),
        );
    }
    return Math.max(-Infinity, ...weights);
  }
  return walk(from, new Set(), ttl);
}
test("prefix-aware independent path oracle proves all maxima without configuration explosion", () => {
  for (const l of levels)
    assert.equal(
      legMaximum(l, "A", "B") + legMaximum(l, "B", "A"),
      l.targetRtt,
    );
});
test("difficulty grows from3 to6 to8 routers and1 to10 to16 editable routes", () => {
  assert.deepEqual(
    levels.map((l) => l.nodes.length - 2),
    [3, 6, 8],
  );
  assert.deepEqual(
    levels.map((l) => l.edits.length),
    [1, 10, 16],
  );
});
test("intermediate optimum coordinates both directions across the mesh", () => {
  const l = levels[1],
    r = ping(l, applyChanges(l, initialRoutes(l), l.solution));
  assert.equal(r.rtt, 228);
  assert.deepEqual(
    r.legs.map((x) => x.delayMs),
    [114, 114],
  );
  assert.deepEqual(r.legs[0].path, [
    "A",
    "R1",
    "R2",
    "R4",
    "R5",
    "R3",
    "R6",
    "B",
  ]);
});
test("expert optimum uses different forward and return paths, both within TTL8", () => {
  const l = levels[2],
    r = ping(l, applyChanges(l, initialRoutes(l), l.solution));
  assert.equal(r.rtt, 349);
  assert.deepEqual(
    r.legs.map((x) => x.delayMs),
    [183, 166],
  );
  assert.deepEqual(r.legs[0].path, [
    "A",
    "R1",
    "R5",
    "R2",
    "R3",
    "R6",
    "R7",
    "R8",
    "B",
  ]);
  assert.deepEqual(r.legs[1].path, [
    "B",
    "R8",
    "R4",
    "R3",
    "R7",
    "R6",
    "R5",
    "R1",
    "A",
  ]);
  assert.notDeepEqual(r.legs[0].path, [...r.legs[1].path].reverse());
});
test("specific /32 routes mask broad /24 detours until explicitly disabled", () => {
  const l = levels[2],
    broad = l.solution.filter((c) => c.index !== 2);
  const masked = ping(l, applyChanges(l, initialRoutes(l), broad));
  assert.equal(masked.rtt, 22);
  assert.match(masked.legs[0].steps[1].reason, /\/32/);
  const freed = ping(l, applyChanges(l, initialRoutes(l), l.solution));
  assert.equal(freed.rtt, 349);
  assert.match(freed.legs[0].steps[1].reason, /\/24/);
});
test("eight-router scenic reply fails TTL8 although a slower unbounded route exists", () => {
  const l = levels[2],
    r = applyChanges(l, initialRoutes(l), l.solution);
  // R8→R4→R3→R7→R6→R2→R5→R1 uses eight forwarding routers.
  for (const [id, hop] of [
    ["R6", "R2"],
    ["R2", "R5"],
    ["R5", "R1"],
  ])
    r[id][1].nextHop = hop;
  const failed = ping(l, r);
  assert.equal(failed.status, "ttl-expired");
  assert.equal(failed.rtt, null);
  assert.equal(failed.legs[1].failedAt, "R1");
  assert.equal(ping(l, r, { ttl: 9 }).rtt, 363);
  assert.equal(legMaximum(l, "A", "B", 9) + legMaximum(l, "B", "A", 9), 363);
  assert.ok(363 > l.targetRtt);
});
test("greedy largest first link cannot replace whole-path optimization", () => {
  const l = levels[1],
    r = initialRoutes(l);
  r.R1[0].nextHop = "R2";
  const result = ping(l, r);
  assert.equal(result.status, "success");
  assert.ok(result.rtt < l.targetRtt);
});

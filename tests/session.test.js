import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createSession,
  start,
  apply,
  run,
  reset,
  next,
  help,
  restart,
} from "../engine/session.js";
const levels = JSON.parse(
  readFileSync(new URL("../data/levels.json", import.meta.url)),
);
const fresh = () => start(createSession(levels));
test("introduction and unsolved next gating", () => {
  const s = createSession(levels);
  assert.equal(s.view, "intro");
  assert.equal(next(fresh()).current, 0);
});
test("solution assistance applies but does not award completion before ping", () => {
  let s = help(fresh(), 2);
  assert.equal(s.records[0].assistance, 2);
  assert.equal(s.records[0].completed, false);
  s = run(s);
  assert.equal(s.records[0].bestRtt, 59);
  assert.equal(s.records[0].completed, true);
});
test("draft/apply staleness, immutable session, invalid changes atomic", () => {
  const s = run(fresh()),
    changed = apply(s, levels[0].solution);
  assert.equal(s.records[0].result.rtt, 14);
  assert.equal(changed.records[0].result, null);
  assert.throws(() =>
    apply(s, [{ router: "R1", index: 0, prefix: "0.0.0.0/0", nextHop: "R2" }]),
  );
  assert.equal(s.records[0].result.rtt, 14);
});
test("failure and repeated pings preserve completion/best; reset keeps earned results", () => {
  let s = run(help(fresh(), 2));
  s = run(s);
  assert.equal(s.records.filter((r) => r.completed).length, 1);
  s = run(apply(s, [{ ...levels[0].solution[0], nextHop: null }]));
  assert.equal(s.records[0].result.rtt, null);
  assert.equal(s.records[0].bestRtt, 59);
  assert.ok(s.records[0].completed);
  s = reset(s);
  assert.equal(s.records[0].result, null);
  assert.equal(s.records[0].assistance, 2);
  assert.equal(run(s).records[0].result.rtt, 14);
});
test("three levels, summary, cancelled and confirmed restart", () => {
  let s = fresh();
  for (let i = 0; i < 3; i++) {
    s = run(help(s, 2));
    assert.ok(s.records[i].completed);
    s = next(s);
  }
  assert.equal(s.view, "summary");
  assert.deepEqual(
    s.records.map((r) => r.bestRtt),
    [59, 228, 349],
  );
  assert.equal(restart(s, false), s);
  const clean = restart(s, true);
  assert.equal(clean.view, "intro");
  assert.ok(clean.records.every((r) => !r.completed && r.bestRtt === null));
});

import { clone, initialRoutes, applyChanges, ping } from "./network.js";
export function createSession(levels) {
  return {
    levels,
    current: 0,
    view: "intro",
    records: levels.map((l) => ({
      routes: initialRoutes(l),
      bestRtt: null,
      completed: false,
      assistance: 0,
      attempts: 0,
      result: null,
    })),
  };
}
export const start = (s) => ({ ...s, view: "game" });
function update(s, fn) {
  const records = s.records.map((r, i) => (i === s.current ? fn(clone(r)) : r));
  return { ...s, records };
}
export const apply = (s, changes) =>
  update(s, (r) => ({
    ...r,
    routes: applyChanges(s.levels[s.current], r.routes, changes),
    result: null,
  }));
export function run(s) {
  return update(s, (r) => {
    const l = s.levels[s.current],
      result = ping(l, r.routes);
    r.result = result;
    r.attempts++;
    if (result.status === "success") {
      r.bestRtt = Math.max(r.bestRtt || 0, result.rtt);
      r.completed = r.completed || result.rtt === l.targetRtt;
    }
    return r;
  });
}
export const reset = (s) =>
  update(s, (r) => ({
    ...r,
    routes: initialRoutes(s.levels[s.current]),
    result: null,
  }));
export function next(s) {
  if (!s.records[s.current].completed) return s;
  return s.current === s.levels.length - 1
    ? { ...s, view: "summary" }
    : { ...s, current: s.current + 1 };
}
export function help(s, amount) {
  let out = update(s, (r) => ({
    ...r,
    assistance: Math.max(r.assistance, amount),
  }));
  if (amount === 2) out = apply(out, s.levels[s.current].solution);
  return out;
}
export const restart = (s, confirmed) =>
  confirmed ? createSession(s.levels) : s;

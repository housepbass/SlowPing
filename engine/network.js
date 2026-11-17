import {
  decide,
  parsePrefix,
  addressNumber,
} from "../protocols/static-ipv4.js";
export const clone = (value) => structuredClone(value);
export const adjacent = (level, id) =>
  level.links
    .filter((e) => e.a === id || e.b === id)
    .map((e) => (e.a === id ? e.b : e.a));
export const initialRoutes = (level) => clone(level.routes);
const linkFor = (level, a, b) =>
  level.links.find((e) => (e.a === a && e.b === b) || (e.b === a && e.a === b));
export function validateRoutes(level, routes) {
  const routers = level.nodes.filter((n) => n.kind === "router");
  if (!routes || Object.keys(routes).length !== routers.length)
    throw new Error("Route tables do not match routers");
  for (const n of routers) {
    if (!Array.isArray(routes[n.id]))
      throw new Error(`Missing route table ${n.id}`);
    const seen = new Set();
    for (const r of routes[n.id]) {
      parsePrefix(r.prefix);
      if (seen.has(r.prefix)) throw new Error(`Duplicate prefix on ${n.id}`);
      seen.add(r.prefix);
      if (r.nextHop !== null && !adjacent(level, n.id).includes(r.nextHop))
        throw new Error(`Invalid next hop on ${n.id}`);
    }
  }
}
export function applyChanges(level, routes, changes) {
  const result = clone(routes);
  for (const change of changes) {
    const slot = level.edits.find(
      (e) => e.router === change.router && e.index === change.index,
    );
    if (
      !slot ||
      !slot.prefixes.includes(change.prefix) ||
      !slot.nextHops.includes(change.nextHop)
    )
      throw new Error(
        "Choose one of the permitted destinations and adjacent next hops.",
      );
    result[change.router][change.index] = {
      prefix: change.prefix,
      nextHop: change.nextHop,
    };
  }
  validateRoutes(level, result);
  return result;
}
/** Single-packet traversal. Later replication/event models can reuse graph/trace consumers. */
function traverse(level, routes, from, to, ttl, forward) {
  const leg = {
    path: [from.id],
    steps: [],
    delayMs: 0,
    status: "success",
    failedAt: null,
  };
  let id = from.id,
    remaining = ttl;
  const fail = (status, reason) => {
    leg.status = status;
    leg.failedAt = id;
    leg.steps.push({
      device: id,
      nextHop: null,
      delayMs: 0,
      ttl: remaining,
      reason,
    });
    return leg;
  };
  while (id !== to.id) {
    const node = level.nodes.find((n) => n.id === id);
    let choice;
    if (node.kind === "endpoint")
      choice = {
        nextHop: adjacent(level, id)[0],
        reason: "Fixed endpoint gateway",
      };
    else {
      remaining--;
      if (remaining <= 0)
        return fail("ttl-expired", "TTL reached zero before forwarding");
      choice = forward(level, routes, id, {
        source: from.address,
        destination: to.address,
        ttl: remaining,
      });
    }
    if (!choice.nextHop) return fail("no-route", choice.reason);
    const edge = linkFor(level, id, choice.nextHop);
    if (!edge)
      return fail("invalid-config", "Next hop is not directly connected");
    leg.steps.push({
      device: id,
      nextHop: choice.nextHop,
      delayMs: edge.delayMs,
      ttl: remaining,
      reason: choice.reason,
    });
    leg.delayMs += edge.delayMs;
    id = choice.nextHop;
    leg.path.push(id);
    if (
      node.kind === "endpoint" &&
      id !== to.id &&
      level.nodes.find((n) => n.id === id)?.kind === "endpoint"
    )
      return fail("no-route", "Wrong endpoint");
    if (
      id !== to.id &&
      level.nodes.find((n) => n.id === id)?.kind === "endpoint"
    )
      return fail("no-route", "Reached the wrong endpoint");
  }
  return leg;
}
export function ping(level, routes, { ttl = 8, forward = decide } = {}) {
  try {
    validateRoutes(level, routes);
  } catch (e) {
    return {
      status: "invalid-config",
      rtt: null,
      legs: [],
      message: e.message,
    };
  }
  if (!Number.isInteger(ttl) || ttl < 1 || ttl > 255)
    return {
      status: "invalid-config",
      rtt: null,
      legs: [],
      message: "Invalid TTL",
    };
  const a = level.nodes.find((n) => n.id === "A"),
    b = level.nodes.find((n) => n.id === "B");
  const request = traverse(level, routes, a, b, ttl, forward),
    legs = [request];
  if (request.status !== "success")
    return { status: request.status, rtt: null, legs };
  const reply = traverse(level, routes, b, a, ttl, forward);
  legs.push(reply);
  return {
    status: reply.status,
    rtt: reply.status === "success" ? request.delayMs + reply.delayMs : null,
    legs,
  };
}
export function validateLevels(levels) {
  const require = (yes, msg) => {
    if (!yes) throw new Error(msg);
  };
  require(Array.isArray(levels) &&
    levels.length === 3, "Expected three levels");
  const ids = new Set();
  for (const l of levels) {
    require(typeof l.id === "string" &&
      l.id.length &&
      !ids.has(l.id), "Duplicate or missing level ID");
    ids.add(l.id);
    require(l.protocol === "static-ipv4", "Unsupported protocol");
    require(Array.isArray(l.nodes) &&
      l.nodes.length >= 3 &&
      l.nodes.length <= 10, "Invalid device count");
    const nodes = new Set();
    let endpoints = 0;
    for (const n of l.nodes) {
      require(typeof n.id === "string" &&
        n.id.length &&
        !nodes.has(n.id), "Duplicate device");
      nodes.add(n.id);
      require(["router", "endpoint"].includes(n.kind) &&
        typeof n.label === "string" &&
        n.label.length &&
        Number.isFinite(n.x) &&
        Number.isFinite(n.y), "Invalid device");
      if (n.kind === "endpoint") {
        endpoints++;
        require(["A", "B"].includes(n.id), "Invalid endpoint");
        addressNumber(n.address);
      }
    }
    require(endpoints === 2 &&
      nodes.has("A") &&
      nodes.has("B"), "Missing endpoints");
    const links = new Set();
    require(Array.isArray(l.links), "Missing links");
    for (const e of l.links) {
      const key = [e.a, e.b].sort().join("/");
      require(nodes.has(e.a) &&
        nodes.has(e.b) &&
        e.a !== e.b &&
        !links.has(key) &&
        Number.isInteger(e.delayMs) &&
        e.delayMs > 0, "Invalid link");
      links.add(key);
    }
    require(adjacent(l, "A").length === 1 &&
      adjacent(l, "B").length === 1, "Endpoints need one gateway");
    validateRoutes(l, l.routes);
    require(Array.isArray(l.edits) &&
      l.edits.length > 0, "Missing route choices");
    const slots = new Set();
    for (const e of l.edits) {
      const key = `${e.router}/${e.index}`,
        r = l.routes[e.router]?.[e.index];
      require(r &&
        !slots.has(key) &&
        Number.isInteger(e.index), "Invalid edit slot");
      slots.add(key);
      require(Array.isArray(e.prefixes) &&
        e.prefixes.length > 0 &&
        Array.isArray(e.nextHops) &&
        e.nextHops.length > 0, "Missing edit choices");
      for (const p of e.prefixes) parsePrefix(p);
      require(e.nextHops.every(
        (n) => n === null || adjacent(l, e.router).includes(n),
      ), "Invalid next hop choice");
      require(e.prefixes.includes(r.prefix) &&
        e.nextHops.includes(r.nextHop), "Initial choice unavailable");
    }
    require(Array.isArray(l.hints) &&
      l.hints.length === 2 &&
      l.hints.every((h) => typeof h === "string" && h.length), "Missing hints");
    require(Number.isInteger(l.targetRtt) &&
      Number.isInteger(l.baselineRtt) &&
      l.targetRtt > l.baselineRtt &&
      l.baselineRtt > 0, "Invalid target");
    require(Array.isArray(l.solution) &&
      l.solution.length === l.edits.length &&
      new Set(l.solution.map((s) => `${s.router}/${s.index}`)).size ===
        l.edits.length, "Incomplete solution");
    require(ping(l, l.routes).rtt === l.baselineRtt, "Invalid baseline");
    require(ping(l, applyChanges(l, l.routes, l.solution)).rtt ===
      l.targetRtt, "Invalid reference target");
  }
  return levels;
}

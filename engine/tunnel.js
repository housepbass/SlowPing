import { clone, initialRoutes, ping } from "./network.js";
import { validatePath, tunnelForward } from "../protocols/explicit-path.js";
export function createLab(def) {
  return {
    draftPath: [def.ingress, def.egress],
    appliedPath: [def.ingress, def.egress],
    enabled: false,
    result: null,
    bestRtt: null,
    completed: false,
    assistance: 0,
    error: "",
    attempts: 0,
  };
}
export function editPath(s, path) {
  return { ...s, draftPath: [...path], error: "" };
}
export function applyTunnel(s, level, def) {
  try {
    validatePath(level, s.draftPath, def);
    return { ...s, appliedPath: [...s.draftPath], result: null, error: "" };
  } catch (e) {
    return { ...s, error: e.message };
  }
}
export const toggleTunnel = (s) => ({
  ...s,
  enabled: !s.enabled,
  result: null,
  error: "",
});
export function runTunnel(s, level, def) {
  let result;
  try {
    result = ping(
      level,
      initialRoutes(level),
      s.enabled ? { forward: tunnelForward(level, s.appliedPath, def) } : {},
    );
  } catch (e) {
    result = {
      status: "invalid-config",
      rtt: null,
      legs: [],
      message: e.message,
    };
  }
  return {
    ...s,
    result,
    attempts: s.attempts + 1,
    error: "",
    bestRtt:
      s.enabled && result.status === "success"
        ? Math.max(s.bestRtt || 0, result.rtt)
        : s.bestRtt,
    completed:
      s.completed ||
      (s.enabled &&
        result.status === "success" &&
        result.rtt === def.targetRtt),
  };
}
export function resetTunnel(s, def) {
  return {
    ...s,
    ...createLab(def),
    bestRtt: s.bestRtt,
    completed: s.completed,
    assistance: s.assistance,
    attempts: s.attempts,
  };
}
export function assistTunnel(s, level, def, amount) {
  let out = { ...s, assistance: Math.max(s.assistance, amount) };
  if (amount === 2) {
    out = applyTunnel(editPath(out, def.solution), level, def);
    if (!out.error) out = { ...out, enabled: true };
  }
  return out;
}
export function insertHop(s, level, id, index, def) {
  if (
    id === def.ingress ||
    id === def.egress ||
    !level.nodes.some((n) => n.id === id && n.kind === "router") ||
    !Number.isInteger(index) ||
    index < 1 ||
    index >= s.draftPath.length
  )
    return s;
  const path = [...s.draftPath],
    old = path.indexOf(id);
  if (old >= 0) {
    path.splice(old, 1);
    if (old < index) index--;
  }
  path.splice(index, 0, id);
  return editPath(s, path);
}
export function moveHop(s, index, target) {
  if (
    index < 1 ||
    target < 1 ||
    index >= s.draftPath.length - 1 ||
    target >= s.draftPath.length - 1
  )
    return s;
  const path = [...s.draftPath];
  path.splice(target, 0, path.splice(index, 1)[0]);
  return editPath(s, path);
}
export function removeHop(s, index) {
  if (index < 1 || index >= s.draftPath.length - 1) return s;
  return editPath(
    s,
    s.draftPath.filter((_, i) => i !== index),
  );
}
export function validateTunnel(def, levels) {
  const level = levels.find((l) => l.id === def?.topologyId);
  if (
    !level ||
    def.ingress !== "R1" ||
    def.egress !== "R5" ||
    typeof def.title !== "string" ||
    !def.title ||
    typeof def.hint !== "string" ||
    !def.hint ||
    !Number.isInteger(def.targetRtt) ||
    !Number.isInteger(def.baselineRtt) ||
    def.targetRtt <= def.baselineRtt
  )
    throw Error("Invalid authored tunnel challenge.");
  validatePath(level, [def.ingress, def.egress], def);
  validatePath(level, def.solution, def);
  if (
    ping(level, initialRoutes(level)).rtt !== def.baselineRtt ||
    runTunnel(
      { ...createLab(def), enabled: true, appliedPath: def.solution },
      level,
      def,
    ).result.rtt !== def.targetRtt
  )
    throw Error(
      "Tunnel baseline or target does not match the reference configuration.",
    );
  return level;
}

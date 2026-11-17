import { decide } from "./static-ipv4.js";
/** Simplified pre-established strict-hop LSP, not signaling or label-plane emulation. */
export function validatePath(level, path, { ingress, egress }) {
  const routers = level.nodes
    .filter((n) => n.kind === "router")
    .map((n) => n.id);
  if (!Array.isArray(path) || path.length < 2 || path.length > routers.length)
    throw Error(
      "Choose a path from ingress to egress using each router at most once.",
    );
  if (path[0] !== ingress || path.at(-1) !== egress)
    throw Error(`Keep ingress ${ingress} first and egress ${egress} last.`);
  if (path.some((id) => !routers.includes(id)))
    throw Error("Only routers in this topology can be tunnel hops.");
  if (new Set(path).size !== path.length)
    throw Error(
      "This challenge requires a simple path. Remove the repeated router.",
    );
  for (let i = 1; i < path.length; i++)
    if (
      !level.links.some(
        (e) =>
          (e.a === path[i - 1] && e.b === path[i]) ||
          (e.b === path[i - 1] && e.a === path[i]),
      )
    )
      throw Error(
        `No direct link ${path[i - 1]} → ${path[i]}. Add an adjacent router or change the hop order.`,
      );
  return path;
}
export function tunnelForward(level, path, definition) {
  validatePath(level, path, definition);
  const hops = [...path],
    destination = level.nodes.find((n) => n.id === "B").address;
  return (network, routes, id, packet) => {
    if (packet.destination !== destination || id === definition.egress)
      return decide(network, routes, id, packet);
    const index = hops.indexOf(id);
    if (index < 0 || index === hops.length - 1)
      return {
        nextHop: null,
        reason: "Packet is outside the enabled explicit path",
      };
    return {
      nextHop: hops[index + 1],
      reason: `Tunnel strict hop ${index + 1}/${hops.length - 1}: ${id} → ${hops[index + 1]}`,
    };
  };
}

/** Static IPv4 selection only. Traversal and presentation are protocol independent. */
export function addressNumber(value) {
  if (typeof value !== "string" || !/^(\d{1,3}\.){3}\d{1,3}$/.test(value))
    throw new Error("Invalid IPv4 address");
  const octets = value.split(".").map(Number);
  if (octets.some((n) => n > 255)) throw new Error("Invalid IPv4 octet");
  return octets.reduce((n, part) => n * 256 + part, 0) >>> 0;
}
export function parsePrefix(prefix) {
  if (typeof prefix !== "string" || !/^.+\/(0|[1-9]\d?)$/.test(prefix))
    throw new Error("Invalid CIDR prefix");
  const [ip, raw] = prefix.split("/"),
    bits = Number(raw);
  if (bits > 32) throw new Error("Invalid prefix length");
  const network = addressNumber(ip),
    mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  if ((network & mask) >>> 0 !== network)
    throw new Error("Prefix must use its network address");
  return { network, mask, bits };
}
export function matches(address, prefix) {
  const { network, mask } = parsePrefix(prefix);
  return (addressNumber(address) & mask) >>> 0 === network;
}
export function decide(level, routes, deviceId, packet) {
  let chosen = null,
    longest = -1;
  for (const route of routes[deviceId] || []) {
    const { bits } = parsePrefix(route.prefix);
    if (
      route.nextHop !== null &&
      bits > longest &&
      matches(packet.destination, route.prefix)
    ) {
      longest = bits;
      chosen = route;
    }
  }
  return chosen
    ? { nextHop: chosen.nextHop, reason: `Longest match ${chosen.prefix}` }
    : { nextHop: null, reason: "No matching active route" };
}

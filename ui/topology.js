const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pair = (a, b) => [a, b].sort().join("/");
export function topology(level, record, selected) {
  const request = new Set(),
    reply = new Set();
  for (const [i, leg] of (record.result?.legs || []).entries())
    for (let j = 1; j < leg.path.length; j++)
      (i === 0 ? request : reply).add(pair(leg.path[j - 1], leg.path[j]));
  const coords = (id) => level.nodes.find((n) => n.id === id);
  const edges = level.links
    .map((e) => {
      const a = coords(e.a),
        b = coords(e.b),
        key = pair(e.a, e.b),
        midX = (a.x + b.x) / 2,
        midY = (a.y + b.y) / 2;
      const active = request.has(key) || reply.has(key);
      const curved = level.id === "slow-not-stuck" && key === "R2/R4";
      const line = (offset = 0) =>
        curved
          ? `d="M ${a.x} ${a.y + offset} Q ${midX} ${265 + offset} ${b.x} ${b.y + offset}"`
          : `d="M ${a.x} ${a.y + offset} L ${b.x} ${b.y + offset}"`;
      const labelY = e.labelY ?? (curved ? 185 : midY);
      const labelX = e.labelX ?? midX;
      return `<g><path class="wire ${active ? "active-wire" : ""}" ${line()}/>${request.has(key) ? `<path class="path-request" ${line(-5)}/>` : ""}${reply.has(key) ? `<path class="path-reply" ${line(5)}/>` : ""}<rect class="link-badge" x="${labelX - 29}" y="${labelY - 13}" width="58" height="26" rx="5"/><text class="link-label" x="${labelX}" y="${labelY + 5}">${e.delayMs} ms</text></g>`;
    })
    .join("");
  const nodes = level.nodes
    .map((n) => {
      const router = n.kind === "router",
        canEdit = level.edits.some((e) => e.router === n.id);
      return `<g class="device ${router ? "router" : "endpoint"} ${selected === n.id ? "selected" : ""}" ${router ? `role="button" tabindex="0" aria-label="Select ${esc(n.label)}${canEdit ? ", editable routes" : ", locked routes"}" data-router="${n.id}"` : ""} transform="translate(${n.x},${n.y})"><rect class="device-box" x="-32" y="-27" width="64" height="54" rx="12"/>${router ? '<path class="device-symbol" d="M-15 -7h30m-6-5 6 5-6 5M15 8h-30m6-5-6 5 6 5"/>' : '<rect class="device-symbol" x="-13" y="-11" width="26" height="18" rx="2"/><path class="device-symbol" d="M0 7v6m-9 0H9"/>'}<text class="device-id" y="51">${esc(n.id)}</text><text class="device-caption" y="71">${router ? (canEdit ? "EDITABLE" : "LOCKED") : esc(n.address)}</text>${canEdit ? '<circle class="edit-dot" cx="27" cy="-23" r="5"/>' : ""}</g>`;
    })
    .join("");
  return `<div class="network-canvas"><svg viewBox="0 0 1000 ${level.viewHeight || 400}" role="group" aria-label="${esc(level.title)} network map. Link delays in milliseconds. Text alternative below."><defs><pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#354244"/></pattern></defs><rect width="1000" height="${level.viewHeight || 400}" fill="url(#grid)"/>${edges}${nodes}</svg></div>`;
}

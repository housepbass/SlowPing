import { topology } from "./topology.js";
export const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const arrow = '<span aria-hidden="true">↗</span>';
export function intro() {
  return `<section class="intro"><div><p class="eyebrow"><span class="pill">A ROUTING PUZZLE</span> BAD NETWORKS. GOOD LESSONS.</p><h1>Take the<br><em>scenic route.</em></h1><p class="intro-copy">Anyone can make a network fast.<br>Can you make it painfully slow <strong>and still get a reply?</strong></p><button id="start" class="primary large">Start here ${arrow}</button><p class="intro-note">3 networks · unlimited retries · no timer</p></div><div class="intro-card"><div class="mini-heading"><span>YOUR MISSION</span><span>ICMP / ECHO</span></div><div class="intro-route"><span>A</span><i>···</i><b>↗<br>↘</b><i>···</i><span>B</span></div><h2>Longer journey.<br>Successful delivery.</h2><ol><li><b>Inspect</b> a network that already works.</li><li><b>Change</b> a router's next hop with the inspector.</li><li><b>Ping</b> to trace the trip out and back.</li></ol><p>Round-trip time (RTT) adds every link delay in both directions. Loops expire; lost packets earn nothing.</p><div class="model-note">TEACHING MODEL · FIXED DELAYS · STATIC IPv4 · TTL 8</div></div></section>`;
}
function routeForm(level, record, selected) {
  const routes = record.routes[selected];
  return `<label class="field-label" for="router-select">INSPECT DEVICE</label><select id="router-select">${level.nodes
    .filter((n) => n.kind === "router")
    .map(
      (n) =>
        `<option value="${n.id}" ${n.id === selected ? "selected" : ""}>${n.id} — ${n.label}${level.edits.some((e) => e.router === n.id) ? " · editable" : ""}</option>`,
    )
    .join(
      "",
    )}</select><div class="device-heading"><span class="router-glyph" aria-hidden="true">⇄</span><div><h3>${escapeHTML(selected)}</h3><span>STATIC IPv4 / ROUTE TABLE</span></div></div><form id="route-form">${routes
    .map((r, i) => {
      const slot = level.edits.find(
        (e) => e.router === selected && e.index === i,
      );
      const name =
        r.prefix === "192.0.2.1/32"
          ? "SOURCE A"
          : r.prefix === "198.51.100.1/32"
            ? "DESTINATION B"
            : "OTHER NETWORK";
      return `<fieldset class="route-row"><legend>${slot ? "EDITABLE ROUTE" : "LOCKED ROUTE"} / ${name}</legend>${slot ? `<label for="prefix-${i}">Destination</label><select id="prefix-${i}" name="prefix-${i}" data-index="${i}">${slot.prefixes.map((p) => `<option ${r.prefix === p ? "selected" : ""}>${p}</option>`).join("")}</select><label for="hop-${i}">Next hop</label><select id="hop-${i}" name="hop-${i}">${slot.nextHops.map((h) => `<option value="${h || ""}" ${r.nextHop === h ? "selected" : ""}>${h ? `via ${h}` : "Unconfigured — no route"}</option>`).join("")}</select>` : `<div class="locked-prefix">${escapeHTML(r.prefix)}</div><div class="locked-hop">via ${escapeHTML(r.nextHop)} <span aria-hidden="true">⌑</span></div>`}</fieldset>`;
    })
    .join(
      "",
    )}<p id="edit-note" class="muted small">${level.edits.some((e) => e.router === selected) ? "Choose a next hop, then apply. Only applied routes affect ping." : "These routes are fixed for this challenge. Choose an editable router."}</p><button id="apply" type="submit" class="secondary full" ${level.edits.some((e) => e.router === selected) ? "" : "disabled"}>Apply routes ${arrow}</button></form>`;
}
function resultView(record, level) {
  const result = record.result;
  if (!result)
    return `<div class="empty-result"><span class="terminal-symbol" aria-hidden="true">›_</span><div><h3>Your network is ready to test.</h3><p>Run ping to reveal the request, reply, and round-trip time.</p></div></div>`;
  const success = result.status === "success",
    optimal = success && result.rtt === level.targetRtt;
  return `<div class="result-head"><div><p class="eyebrow ${success ? "lime" : "coral"}">${success ? (optimal ? "TARGET REACHED / PACKET DELIVERED" : "PACKET DELIVERED") : "DELIVERY FAILED"}</p><h3 id="result-title">${success ? (optimal ? "Beautifully inefficient." : "It works. Can you go slower?") : result.status === "ttl-expired" ? "Going in circles?" : result.legs.length === 1 ? "The packet never reached B." : "The reply never made it home."}</h3></div><div class="result-number">${success ? result.rtt : "—"}<span> ${success ? "ms RTT" : "NO SCORE"}</span></div></div>${result.message ? `<p>${escapeHTML(result.message)}</p>` : ""}<div class="trace-grid">${result.legs.map((leg, i) => `<section class="trace-leg"><div class="trace-label"><span class="${i === 0 ? "lime" : "blue"}">${i === 0 ? "↗ REQUEST · A → B" : "↙ REPLY · B → A"}</span><strong>${leg.delayMs} ms${leg.status === "success" ? "" : " traversed"}</strong></div><p class="path-text">${leg.path.map(escapeHTML).join(" → ")}</p>${leg.status !== "success" ? `<p class="failure">${leg.status === "ttl-expired" ? "TTL expired" : leg.status === "no-route" ? "No active route" : "Invalid next hop"} at ${escapeHTML(leg.failedAt)}. ${i === 0 ? "The reply was not sent." : "Reaching B alone is not a successful ping."}</p>` : ""}<details><summary>Inspect ${i === 0 ? "request" : "reply"} decisions</summary><div class="table-wrap"><table><thead><tr><th>Device</th><th>Next</th><th>Delay</th><th>TTL</th><th>Reason</th></tr></thead><tbody>${leg.steps.map((s) => `<tr><td>${escapeHTML(s.device)}</td><td>${escapeHTML(s.nextHop || "Drop")}</td><td>${s.delayMs} ms</td><td>${s.ttl}</td><td>${escapeHTML(s.reason)}</td></tr>`).join("")}</tbody></table></div></details></section>`).join("")}</div><p class="result-explanation">${success ? `${result.legs[0].delayMs} ms out + ${result.legs[1].delayMs} ms back = ${result.rtt} ms RTT. ${optimal ? "The maximum successful latency for this topology." : `${level.targetRtt - result.rtt} ms to the maximum. Find a longer valid path.`}` : "Failed delivery never improves your best RTT. Check the indicated route, then try again."}</p>`;
}
export function game(session, selected) {
  const level = session.levels[session.current],
    record = session.records[session.current];
  return `<div class="campaign-strip">${session.levels.map((l, i) => `<div class="campaign-step ${i === session.current ? "current" : ""} ${session.records[i].completed ? "done" : ""}"><span class="step-num">${session.records[i].completed ? "✓" : String(i + 1).padStart(2, "0")}</span><span>${escapeHTML(l.title)}</span>${i === session.current ? '<span class="active-tag">IN PROGRESS</span>' : ""}</div>`).join("")}</div><section class="level-heading"><div><p class="eyebrow">CHALLENGE ${String(session.current + 1).padStart(2, "0")} / 03 <span class="slash">/</span> STATIC ROUTING</p><h1>${escapeHTML(level.title)}<span class="lime">.</span></h1><p>${escapeHTML(level.subtitle)} Keep ping working and push round-trip time to the limit.</p></div><div class="goal"><span class="eyebrow">YOUR TARGET</span><strong>${level.targetRtt}<span> ms</span></strong><span>maximum successful RTT</span></div></section><div class="workspace"><section class="panel network-panel" aria-labelledby="network-title"><div class="panel-bar"><h2 id="network-title"><span class="system-light" aria-hidden="true"></span> NETWORK TOPOLOGY</h2><span>${level.nodes.length - 2} ROUTERS / ${level.links.length} LINKS</span></div>${topology(level, record, selected)}<div class="graph-legend"><span><i class="legend-line request"></i>Request</span><span><i class="legend-line reply"></i>Reply</span><span class="legend-right">LINK LABELS = ONE-WAY DELAY</span></div><details class="text-topology"><summary>View network as text &amp; model assumptions</summary><p>Each link works both ways with the same fixed delay. Endpoint gateways are fixed; router processing takes zero time. Each request and reply starts with TTL 8, decremented before router forwarding. No congestion, ARP, loss, switching or dynamic routing is simulated.</p><ul>${level.links.map((e) => `<li>${e.a} ↔ ${e.b}: ${e.delayMs} ms each way</li>`).join("")}</ul><p>IPv4 route selection follows the longest matching prefix. Unconfigured routes are inactive. The two endpoint addresses are A: 192.0.2.1 and B: 198.51.100.1.</p></details><div class="ping-toolbar"><div class="baseline"><span>BASELINE</span><strong>${level.baselineRtt} ms</strong></div><div class="baseline"><span>YOUR BEST</span><strong>${record.bestRtt === null ? "—" : `${record.bestRtt} ms`}</strong></div><button id="reset" class="text-button">↺ Reset level</button><button id="ping" class="primary">Run ping <span aria-hidden="true">↗</span></button></div></section><aside class="panel inspector" aria-label="Router inspector"><div class="panel-bar"><h2>DEVICE INSPECTOR</h2><span>⚙</span></div><div class="inspector-content">${routeForm(level, record, selected)}</div></aside></div><section class="panel result-panel" aria-label="Ping results">${resultView(record, level)}</section><div class="bottom-actions"><div class="help-actions"><span class="muted small">NEED A NUDGE?</span><button id="hint" class="text-button">Hint</button><button id="solution" class="text-button">Show solution</button></div><span class="progress-note">${record.attempts} ping${record.attempts === 1 ? "" : "s"} · ${record.assistance === 2 ? "solution used" : record.assistance === 1 ? "hint used" : "unassisted"}</span><button id="next" class="${record.completed ? "primary" : "secondary"}" ${record.completed ? "" : "disabled"}>${session.current === 2 ? "See results" : "Next challenge"} →</button></div>${record.assistance ? `<aside class="hint-box" aria-label="Assistance"><strong>${record.assistance === 2 ? "WORKED SOLUTION" : "A LITTLE GUIDANCE"}</strong><p>${escapeHTML(level.hints[record.assistance - 1])}</p>${record.assistance === 2 ? "<p>Solution routes are applied. Run ping to verify them and earn completion.</p>" : ""}</aside>` : ""}`;
}
export function summary(session) {
  return `<section class="summary"><p class="eyebrow lime">ALL PACKETS ACCOUNTED FOR</p><h1>Slow looks<br><em>good on you.</em></h1><p>Three working networks. Three spectacular detours.</p><div class="summary-cards">${session.levels.map((l, i) => `<article class="panel"><p class="eyebrow">CHALLENGE 0${i + 1}</p><h2>${escapeHTML(l.title)}</h2><strong>${session.records[i].bestRtt}<span> ms</span></strong><p>Baseline ${l.baselineRtt} ms · +${session.records[i].bestRtt - l.baselineRtt} ms</p><span class="pill">${session.records[i].assistance === 2 ? "SOLUTION USED" : session.records[i].assistance === 1 ? "HINT USED" : "UNASSISTED"}</span></article>`).join("")}</div><p class="summary-reflection">A slow path still needs to get there <strong>and back</strong>.<br>Loops, missing routes, and expired TTL never count as delivery.</p><button id="play-again" class="primary large">Play again ↗</button><p class="muted small">Static-routing MVP · further protocols follow owner confirmation.</p></section>`;
}

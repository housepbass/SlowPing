import * as tunnel from "./engine/tunnel.js";
import { tunnelView } from "./ui/tunnel.js";
import { validateLevels } from "./engine/network.js";
import * as session from "./engine/session.js";
import { intro, game, summary, escapeHTML } from "./ui/render.js";
const main = document.querySelector("#main"),
  announcer = document.querySelector("#announcer");
let state,
  selected = "R1";
let lab,
  tunnelDef,
  tunnelLevel,
  tunnelLoadError,
  returnView = "intro",
  draggedRouter = null;
const announce = (message) => {
  announcer.textContent = message;
};
function render(focusId) {
  main.innerHTML =
    state.view === "tunnel"
      ? tunnelDef
        ? tunnelView(lab, tunnelLevel, tunnelDef)
        : `<section class="error"><h1>Tunnel lab unavailable.</h1><p>${escapeHTML(tunnelLoadError || "Could not load challenge data.")}</p><button id="retry-tunnel" class="primary">Retry tunnel loading</button> <button id="leave-tunnel">Back to campaign</button></section>`
      : state.view === "intro"
        ? intro()
        : state.view === "summary"
          ? summary(state)
          : game(state, selected);
  if (focusId) document.getElementById(focusId)?.focus();
}
function act(fn, focusId, message) {
  state = fn(state);
  render(focusId);
  if (message) announce(message);
}
function openTunnel() {
  if (state.view !== "tunnel") returnView = state.view;
  state = { ...state, view: "tunnel" };
  render(tunnelDef ? "add-router" : "retry-tunnel");
  announce(
    "Explicit-path lab. Build a path, apply it, enable the tunnel, and run ping.",
  );
}
document.querySelector("#tunnel-lab").addEventListener("click", () => {
  if (state) openTunnel();
});
function restartPrompt() {
  document.querySelector("#restart-dialog").showModal();
}
document.querySelector("#restart").addEventListener("click", restartPrompt);
document.querySelector("#restart-dialog").addEventListener("close", (e) => {
  if (e.target.returnValue === "confirm") {
    state = session.restart(state, true);
    if (tunnelDef) lab = tunnel.createLab(tunnelDef);
    selected = "R1";
    render("start");
    announce("Session restarted.");
  }
});
main.addEventListener("change", (e) => {
  if (e.target.id === "router-select") {
    selected = e.target.value;
    render("router-select");
  } else if (e.target.closest("#route-form")) {
    document.querySelector("#edit-note").textContent =
      "Unapplied changes. Apply routes before testing this configuration.";
  }
});
main.addEventListener("submit", (e) => {
  if (e.target.id !== "route-form") return;
  e.preventDefault();
  const level = state.levels[state.current];
  const changes = level.edits
    .filter((s) => s.router === selected)
    .map((s) => ({
      router: selected,
      index: s.index,
      prefix: document.getElementById(`prefix-${s.index}`).value,
      nextHop: document.getElementById(`hop-${s.index}`).value || null,
    }));
  try {
    act(
      (s) => session.apply(s, changes),
      "apply",
      `${selected} routes applied. Run ping for an updated result.`,
    );
  } catch (error) {
    document.querySelector("#edit-note").textContent = error.message;
    announce(error.message);
  }
});
main.addEventListener("keydown", (e) => {
  if (e.target.matches("[data-router]") && ["Enter", " "].includes(e.key)) {
    e.preventDefault();
    selected = e.target.dataset.router;
    render("router-select");
  }
});
main.addEventListener("click", (e) => {
  if (handleTunnelClick(e)) return;
  const node = e.target.closest("[data-router]");
  if (node) {
    selected = node.dataset.router;
    render("router-select");
    return;
  }
  const id = e.target.closest("button")?.id;
  if (id === "start") {
    act(
      session.start,
      "router-select",
      "First network loaded. It already works.",
    );
  }
  if (id === "ping") {
    act(session.run, "ping");
    const r = state.records[state.current].result;
    announce(
      r.status === "success"
        ? `Ping successful. ${r.rtt} milliseconds round trip. ${state.records[state.current].completed ? "Challenge completed. Next is available." : ""}`
        : `Ping failed: ${r.status}. No score awarded.`,
    );
  }
  if (id === "reset")
    act(
      session.reset,
      "reset",
      "Initial routes restored. Earned progress retained.",
    );
  if (id === "hint")
    act((s) => session.help(s, 1), "hint", "Hint revealed below.");
  if (id === "solution")
    act(
      (s) => session.help(s, 2),
      "solution",
      "Worked solution applied. Run ping to verify.",
    );
  if (id === "next") {
    state = session.next(state);
    selected = "R1";
    render(state.view === "summary" ? "play-again" : "router-select");
    announce(
      state.view === "summary"
        ? "All three challenges completed."
        : `Challenge ${state.current + 1} loaded.`,
    );
  }
  if (id === "play-again") restartPrompt();
  if (id === "retry") load();
});
async function load() {
  main.innerHTML = '<p role="status">Loading your network…</p>';
  try {
    const response = await fetch("./data/levels.json");
    if (!response.ok)
      throw new Error(`Content request failed (${response.status})`);
    const levels = validateLevels(await response.json());
    await loadTunnel(levels);
    state = session.createSession(levels);
    render();
  } catch (error) {
    main.innerHTML = `<section class="error"><h1>Network unavailable.</h1><p>${escapeHTML(error.message)}</p><p>Start the local server and try again. No progress has been awarded.</p><button id="retry" class="primary">Retry loading</button></section>`;
  }
}
load();

async function loadTunnel(levels) {
  try {
    const response = await fetch("./data/tunnel.json");
    if (!response.ok)
      throw Error(`Tunnel data request failed (${response.status})`);
    const definition = await response.json(),
      network = tunnel.validateTunnel(definition, levels);
    tunnelDef = definition;
    tunnelLevel = network;
    lab = tunnel.createLab(definition);
    tunnelLoadError = null;
  } catch (error) {
    tunnelDef = null;
    tunnelLoadError = error.message;
  }
}
function labUpdate(next, focus, message) {
  lab = next;
  render(focus);
  if (message) announce(message);
}
function handleTunnelClick(e) {
  const button = e.target.closest("button"),
    id = button?.id;
  if (id === "open-tunnel") {
    openTunnel();
    return true;
  }
  if (id === "leave-tunnel") {
    state = { ...state, view: returnView };
    selected = "R1";
    render(
      returnView === "intro"
        ? "open-tunnel"
        : returnView === "summary"
          ? "open-tunnel"
          : "router-select",
    );
    return true;
  }
  if (state?.view !== "tunnel") return false;
  if (id === "retry-tunnel") {
    loadTunnel(state.levels).then(() =>
      render(tunnelDef ? "add-router" : "retry-tunnel"),
    );
    return true;
  }
  if (!tunnelDef) return true;
  const add = button?.dataset.addHop;
  if (id === "add-hop" || add) {
    const router = add || document.querySelector("#add-router").value;
    labUpdate(
      tunnel.insertHop(
        lab,
        tunnelLevel,
        router,
        lab.draftPath.length - 1,
        tunnelDef,
      ),
      "apply-tunnel",
      `${router} added to draft. Apply to install.`,
    );
    return true;
  }
  if (button?.dataset.moveIndex) {
    const i = Number(button.dataset.moveIndex),
      delta = Number(button.dataset.moveDirection);
    labUpdate(
      tunnel.moveHop(lab, i, i + delta),
      "apply-tunnel",
      "Draft hop order changed. Apply to install.",
    );
    return true;
  }
  if (button?.dataset.removeIndex) {
    labUpdate(
      tunnel.removeHop(lab, Number(button.dataset.removeIndex)),
      "add-router",
      "Router removed from draft.",
    );
    return true;
  }
  if (id === "apply-tunnel") {
    const next = tunnel.applyTunnel(lab, tunnelLevel, tunnelDef);
    labUpdate(
      next,
      "apply-tunnel",
      next.error || "Tunnel path applied. Enable tunnel mode to use it.",
    );
    return true;
  }
  if (id === "toggle-tunnel") {
    const next = tunnel.toggleTunnel(lab);
    labUpdate(
      next,
      "toggle-tunnel",
      next.enabled
        ? "Tunnel enabled for request only."
        : "Static routing enabled for both legs.",
    );
    return true;
  }
  if (id === "tunnel-ping") {
    const next = tunnel.runTunnel(lab, tunnelLevel, tunnelDef);
    labUpdate(
      next,
      "tunnel-ping",
      next.result.status === "success"
        ? `${next.result.rtt} milliseconds RTT. ${next.completed ? "Challenge completed." : ""}`
        : `Ping failed: ${next.result.status}.`,
    );
    return true;
  }
  if (id === "tunnel-reset") {
    labUpdate(
      tunnel.resetTunnel(lab, tunnelDef),
      "tunnel-reset",
      "Initial path restored. Tunnel disabled. Earned progress retained.",
    );
    return true;
  }
  if (id === "tunnel-hint" || id === "tunnel-solution") {
    labUpdate(
      tunnel.assistTunnel(
        lab,
        tunnelLevel,
        tunnelDef,
        id === "tunnel-hint" ? 1 : 2,
      ),
      id,
      id === "tunnel-hint"
        ? "Hint revealed below."
        : "Solution applied and enabled. Run ping to verify.",
    );
    return true;
  }
  return true;
}
main.addEventListener("dragstart", (e) => {
  const node = e.target.closest("[data-drag-router]");
  if (!node || state?.view !== "tunnel") return;
  draggedRouter = node.dataset.dragRouter;
  e.dataTransfer.setData("text/plain", draggedRouter);
  e.dataTransfer.effectAllowed = "move";
});
main.addEventListener("dragover", (e) => {
  const zone = e.target.closest("[data-drop-index]");
  if (!zone || !draggedRouter) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  zone.classList.add("drag-over");
});
main.addEventListener("dragleave", (e) => {
  e.target.closest("[data-drop-index]")?.classList.remove("drag-over");
});
main.addEventListener("dragend", () => {
  draggedRouter = null;
  main
    .querySelectorAll(".drag-over")
    .forEach((e) => e.classList.remove("drag-over"));
});
main.addEventListener("drop", (e) => {
  const zone = e.target.closest("[data-drop-index]");
  if (!zone || !draggedRouter || state?.view !== "tunnel") return;
  e.preventDefault();
  const id = draggedRouter;
  draggedRouter = null;
  labUpdate(
    tunnel.insertHop(
      lab,
      tunnelLevel,
      id,
      Number(zone.dataset.dropIndex),
      tunnelDef,
    ),
    "apply-tunnel",
    `${id} moved into the draft path. Apply to install.`,
  );
});

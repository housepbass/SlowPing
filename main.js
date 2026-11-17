import { validateLevels } from "./engine/network.js";
import * as session from "./engine/session.js";
import { intro, game, summary, escapeHTML } from "./ui/render.js";
const main = document.querySelector("#main"),
  announcer = document.querySelector("#announcer");
let state,
  selected = "R1";
const announce = (message) => {
  announcer.textContent = message;
};
function render(focusId) {
  main.innerHTML =
    state.view === "intro"
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
function restartPrompt() {
  document.querySelector("#restart-dialog").showModal();
}
document.querySelector("#restart").addEventListener("click", restartPrompt);
document.querySelector("#restart-dialog").addEventListener("close", (e) => {
  if (e.target.returnValue === "confirm") {
    state = session.restart(state, true);
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
    state = session.createSession(levels);
    render();
  } catch (error) {
    main.innerHTML = `<section class="error"><h1>Network unavailable.</h1><p>${escapeHTML(error.message)}</p><p>Start the local server and try again. No progress has been awarded.</p><button id="retry" class="primary">Retry loading</button></section>`;
  }
}
load();

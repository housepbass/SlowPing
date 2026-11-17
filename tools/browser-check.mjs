// Development-only browser acceptance checks. npm ci, then node tools/browser-check.mjs.
// Override CHROME_PATH or BASE_URL when needed. Default Chrome path is for macOS.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
const levels = JSON.parse(
  await readFile(new URL("../data/levels.json", import.meta.url), "utf8"),
);
const base = process.env.BASE_URL || "http://127.0.0.1:8001";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } }),
  errors = [],
  checks = [],
  timings = [];
page.on("pageerror", (e) => errors.push(e.message));
const passed = (name) => checks.push({ name, passed: true });
await mkdir("docs/screenshots", { recursive: true });
async function tabTo(selector) {
  const target = page.locator(selector);
  await target.waitFor({ state: "visible" });
  for (let n = 0; n < 100; n++) {
    if (await target.evaluate((e) => e === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw Error("Unreachable by Tab: " + selector);
}
async function press(selector) {
  await tabTo(selector);
  await page.keyboard.press("Enter");
}
async function select(selector, value) {
  await tabTo(selector);
  const option = await page
    .locator(selector)
    .evaluate(
      (e, v) => [...e.options].find((o) => o.value === v)?.textContent,
      value,
    );
  assert.ok(option, "Missing select choice " + value);
  // Native select type-ahead works in macOS headless Chrome; arrow-key menus do not.
  for (let i = 0; i < 20; i++) {
    if ((await page.locator(selector).inputValue()) === value) break;
    await page.keyboard.press(option.trim()[0].toLowerCase());
  }
  assert.equal(await page.locator(selector).inputValue(), value);
  await page.keyboard.press("Tab");
}
async function edit(router, index, nextHop) {
  await select("#router-select", router);
  await select(`#hop-${index}`, nextHop);
  await press("#apply");
}
async function ping(expected) {
  await tabTo("#ping");
  const t = Date.now();
  await page.keyboard.press("Enter");
  await page.locator("#result-title").waitFor();
  timings.push(Date.now() - t);
  if (typeof expected === "number")
    assert.match(
      await page.locator(".result-number").innerText(),
      new RegExp("^" + expected + "\\s"),
    );
  else assert.match(await page.locator("#result-title").innerText(), expected);
}
async function configure(index, filter = () => true) {
  const changes = levels[index].solution.filter(filter);
  for (const router of [...new Set(changes.map((c) => c.router))]) {
    await select("#router-select", router);
    for (const c of changes.filter((c) => c.router === router)) {
      await select(`#prefix-${c.index}`, c.prefix);
      await select(`#hop-${c.index}`, c.nextHop || "");
    }
    await press("#apply");
  }
}
async function checkWidths() {
  for (const width of [1440, 1024, 760, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Horizontal overflow at${width}`,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1080 });
}
try {
  await page.goto(base);
  await page.locator("#start").waitFor();
  assert.equal(
    await page.getByRole("button", { name: /MPLS|tunnel/i }).count(),
    0,
  );
  passed("Static-only game has no TE entry points");
  await page.screenshot({
    path: "docs/screenshots/introduction.png",
    fullPage: true,
  });
  await press("#start");
  assert.ok(await page.locator("#next").isDisabled());
  await ping(14);
  passed("Working baseline and next gating");
  await select("#hop-0", "R2");
  await ping(14);
  passed("Unapplied draft does not affect ping");
  await select("#hop-0", "R2");
  await press("#apply");
  assert.equal(await page.locator("#result-title").count(), 0);
  await ping(59);
  await ping(59);
  assert.ok(await page.locator("#next").isEnabled());
  assert.match(
    await page.locator(".path-text").first().innerText(),
    /A → R1 → R2 → R3 → B/,
  );
  await page.screenshot({
    path: "docs/screenshots/level-1.png",
    fullPage: true,
  });
  passed("Request detour and duplicate completion");
  await edit("R1", 0, "");
  await ping(/never reached/);
  assert.match(await page.locator(".baseline").nth(1).innerText(), /59 ms/);
  passed("Failed delivery preserves earned score");
  await press("#reset");
  await ping(14);
  passed("Reset restores baseline");
  await press("#next");
  await ping(22);
  assert.match(await page.locator(".level-brief").innerText(), /10 EDITABLE/);
  await edit("R1", 0, "R2");
  await edit("R2", 0, "R1");
  await ping(/circles/);
  assert.match(await page.locator(".failure").innerText(), /TTL expired/);
  await press("#reset");
  await ping(22);
  passed("Six-router mesh loop and reset preserve working baseline");
  await configure(1);
  await ping(228);
  passed("Six-router coordinated request and return reach228ms");
  await checkWidths();
  await page.screenshot({
    path: "docs/screenshots/level-2.png",
    fullPage: true,
  });
  await press("#next");
  await ping(22);
  assert.match(
    await page.locator(".level-brief").innerText(),
    /seven forwarding routers/,
  );
  await configure(2, (c) => c.index !== 2);
  await ping(22);
  assert.match(
    await page.locator(".route-note").last().innerText(),
    /\/32 beats/,
  );
  passed("Eight-router /32 overrides mask all broader detours");
  await configure(2);
  await ping(349);
  assert.match(
    await page.locator(".path-text").first().innerText(),
    /A → R1 → R5 → R2 → R3 → R6 → R7 → R8 → B/,
  );
  assert.match(
    await page.locator(".path-text").nth(1).innerText(),
    /B → R8 → R4 → R3 → R7 → R6 → R5 → R1 → A/,
  );
  passed("Expert optimum has independent asymmetric paths and349ms RTT");
  await select("#router-select", "R3");
  assert.deepEqual(
    await page
      .locator("#hop-1 option")
      .evaluateAll((opts) => opts.map((o) => o.value)),
    ["R7", "R4", ""],
  );
  passed("Expert permitted return choices are visible and enforced");
  await edit("R6", 1, "R2");
  await edit("R2", 1, "R5");
  await edit("R5", 1, "R1");
  await ping(/circles/);
  assert.match(await page.locator(".failure").innerText(), /TTL expired at R1/);
  assert.match(await page.locator(".baseline").nth(1).innerText(), /349 ms/);
  passed("Eight-router return exceeds TTL8 and does not improve best");
  await press("#reset");
  await ping(22);
  await configure(2);
  await ping(349);
  await checkWidths();
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.locator(".network-canvas").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "docs/screenshots/level-3-narrow.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.setViewportSize({ width: 1440, height: 2100 });
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        scrollTo(0, 0);
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
  await page.screenshot({
    path: "docs/screenshots/level-3.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await press("#next");
  assert.match(
    await page.locator(".summary").innerText(),
    /59[\s\S]*228[\s\S]*349/,
  );
  passed("Keyboard-only campaign to summary");
  await press("#play-again");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".summary").count(), 1);
  passed("Restart cancellation preserves progress");
  await press("#play-again");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.locator("#start").waitFor();
  passed("Confirmed restart returns to intro");
  await press("#start");
  await press("#solution");
  assert.ok(await page.locator("#next").isDisabled());
  assert.match(await page.locator(".hint-box").innerText(), /applied/);
  await ping(59);
  passed("Worked solution records assistance and requires ping");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".path-request")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  passed("Reduced motion removes path animation");
  for (const width of [1440, 1024, 760, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Horizontal overflow at ${width}`,
    );
    for (const s of ["#ping", "#router-select", "#apply", "#next"])
      assert.ok(await page.locator(s).isVisible());
  }
  await page.screenshot({
    path: "docs/screenshots/narrow.png",
    fullPage: false,
  });
  passed("No horizontal page overflow at 375/760/1024/1440");
  await page
    .getByText("View network as text & model assumptions", { exact: true })
    .click();
  assert.match(
    await page.locator(".text-topology").innerText(),
    /A ↔ R1: 1 ms/,
  );
  passed("Topology has readable textual alternative");
  await page.reload();
  await page.locator("#start").waitFor();
  passed("Reload clears session");
  // A separate fresh context verifies unavailable data is handled without grading.
  const failure = await browser.newPage();
  await failure.route("**/data/levels.json", (route) =>
    route.fulfill({ status: 500, body: "unavailable" }),
  );
  await failure.goto(base);
  await failure.locator("#retry").waitFor();
  assert.equal(await failure.locator("#ping").count(), 0);
  await failure.close();
  passed("Data load failure gives Retry without scoring");
  assert.deepEqual(errors, []);
  assert.ok(Math.max(...timings) < 500, JSON.stringify(timings));
  passed("No runtime errors and ping feedback below 500ms");
  const result = {
    date: new Date().toISOString(),
    browser: await browser.version(),
    checks,
    pingFeedbackMs: timings,
    errors,
  };
  await writeFile(
    "docs/browser-results.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await page.screenshot({
    path: "docs/screenshots/failure.png",
    fullPage: true,
  });
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}

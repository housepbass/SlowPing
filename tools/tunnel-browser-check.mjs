import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } }),
  errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.BASE_URL || "http://127.0.0.1:8001";
const pass = (name) => checks.push({ name, passed: true });
async function key(selector) {
  const target = page.locator(selector);
  await target.waitFor({ state: "visible" });
  for (let i = 0; i < 100; i++) {
    if (await target.evaluate((e) => e === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  assert.ok(
    await target.evaluate((e) => e === document.activeElement),
    "Keyboard unreachable " + selector,
  );
  await page.keyboard.press("Enter");
}
async function testPing(expected, keyboard = false) {
  if (keyboard) await key("#tunnel-ping");
  else await page.locator("#tunnel-ping").click();
  await page.locator("#result-title").waitFor();
  assert.match(
    await page.locator(".result-number").innerText(),
    new RegExp("^" + expected + "\\s"),
  );
}
const pathText = async () =>
  page.locator(".path-builder .hop-card>strong").allTextContents();
async function drag(id, index) {
  await page
    .locator(`[data-drag-router="${id}"]:not(:disabled)`)
    .first()
    .dragTo(page.locator(`[data-drop-index="${index}"]`));
}
try {
  await page.goto(base);
  await page.locator("#open-tunnel").click();
  await page.locator("#add-hop").waitFor();
  await testPing(44);
  pass("Direct lab entry with working static44 baseline");
  assert.match(await page.locator(".lab-brief").innerText(), /pre-established/);
  await drag("R2", 1);
  await drag("R3", 2);
  await drag("R4", 3);
  assert.deepEqual(await pathText(), ["R1", "R2", "R3", "R4", "R5"]);
  await testPing(44);
  assert.match(await page.locator("#draft-status").innerText(), /Pending/);
  pass("Real drag-and-drop builds a pending path without changing ping");
  await page.locator("#apply-tunnel").click();
  assert.equal(await page.locator("#result-title").count(), 0);
  await page.locator("#toggle-tunnel").click();
  await testPing(134);
  assert.match(await page.locator("#tunnel-delta").innerText(), /\+90 ms/);
  assert.match(
    await page.locator(".path-text").nth(1).innerText(),
    /B → R5 → R1 → A/,
  );
  assert.match(await page.locator("#tunnel-earned").innerText(), /completed/);
  pass("Applied enabled tunnel134 vs static44, independent reply, completion");
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/tunnel-desktop.png",
    fullPage: true,
  });
  await page.locator("#toggle-tunnel").click();
  await testPing(44);
  assert.match(await page.locator("#tunnel-best").innerText(), /134/);
  pass("Disable restores static forwarding without erasing best");
  await page.locator("#toggle-tunnel").click();
  await drag("R3", 4);
  assert.deepEqual(await pathText(), ["R1", "R2", "R4", "R3", "R5"]);
  await page.locator("#apply-tunnel").click();
  assert.match(await page.locator("#tunnel-error").innerText(), /R3.*R5/);
  assert.equal(
    await page.locator("#applied-path").innerText(),
    "R1 → R2 → R3 → R4 → R5",
  );
  await testPing(134);
  pass(
    "Drag reordering creates invalid draft; rejected Apply preserves installed tunnel",
  );
  await page.locator("#tunnel-reset").click();
  assert.equal(
    await page.locator("#toggle-tunnel").getAttribute("aria-pressed"),
    "false",
  );
  assert.match(await page.locator("#tunnel-earned").innerText(), /completed/);
  pass("Reset restores configuration and preserves earned results");
  // Keyboard-only path construction and move/remove parity with dragging.
  for (let i = 0; i < 3; i++) await key("#add-hop");
  assert.deepEqual(await pathText(), ["R1", "R2", "R3", "R4", "R5"]);
  await key('[aria-label="Move R3 earlier"]');
  assert.deepEqual(await pathText(), ["R1", "R3", "R2", "R4", "R5"]);
  await key('[aria-label="Move R3 later"]');
  await key('[aria-label="Remove R4"]');
  assert.deepEqual(await pathText(), ["R1", "R2", "R3", "R5"]);
  await key("#add-hop");
  await key("#apply-tunnel");
  await key("#toggle-tunnel");
  await testPing(134, true);
  pass("Keyboard add/move/remove/apply/enable/ping achieves target");
  await key("#tunnel-hint");
  await key("#tunnel-solution");
  assert.equal(await page.locator("#result-title").count(), 0);
  assert.match(
    await page.locator("#tunnel-earned").innerText(),
    /solution used/,
  );
  await testPing(134);
  pass("Help and solution record assistance and require a new ping");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".path-request")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  pass("Reduced motion preserves result and disables animation");
  for (const width of [1440, 1024, 760, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at${width}`,
    );
  }
  await page.locator("#apply-tunnel").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "docs/screenshots/tunnel-narrow.png",
    fullPage: false,
  });
  pass("No page overflow375/760/1024/1440");
  await key("#leave-tunnel");
  await page.locator("#start").waitFor();
  await key("#start");
  await key("#ping");
  assert.match(await page.locator(".result-number").innerText(), /^14\s/);
  await key("#tunnel-lab");
  assert.match(await page.locator("#tunnel-earned").innerText(), /completed/);
  pass("Campaign remains usable; return to lab preserves session");
  await key("#restart");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#tunnel-ping").count(), 1);
  pass("Restart cancellation preserves tunnel state");
  await key("#restart");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.locator("#start").waitFor();
  await page.locator("#open-tunnel").click();
  assert.match(await page.locator("#tunnel-best").innerText(), /—/);
  assert.doesNotMatch(
    await page.locator("#tunnel-earned").innerText(),
    /completed/,
  );
  pass("Confirmed restart clears campaign and tunnel records");
  await page.reload();
  await page.locator("#start").waitFor();
  pass("Reload begins a fresh session");
  const bad = await browser.newPage();
  await bad.route("**/data/tunnel.json", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"topologyId":"missing"}',
    }),
  );
  await bad.goto(base);
  await bad.locator("#open-tunnel").click();
  await bad.locator("#retry-tunnel").waitFor();
  assert.equal(await bad.locator("#tunnel-ping").count(), 0);
  await bad.locator("#leave-tunnel").click();
  await bad.locator("#start").click();
  await bad.locator("#ping").click();
  assert.match(await bad.locator(".result-number").innerText(), /^14\s/);
  await bad.close();
  pass("Malformed lab cannot grade and does not break static campaign");
  assert.deepEqual(errors, []);
  pass("No browser runtime errors");
  const report = {
    date: new Date().toISOString(),
    browser: await browser.version(),
    checks,
    errors,
  };
  await writeFile(
    "docs/tunnel-browser-results.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  await page.screenshot({
    path: "docs/screenshots/tunnel-failure.png",
    fullPage: false,
  });
  console.error(e);
  process.exitCode = 1;
} finally {
  await browser.close();
}

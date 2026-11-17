// Records one fresh runtime confirmation for ARCADE.md, using an already started local server.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const url = process.env.BASE_URL || "http://127.0.0.1:8002";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    reducedMotion: "reduce",
  }),
  errors = [],
  externalRequests = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("**/*", (route) => {
  const requestUrl = new URL(route.request().url());
  if (requestUrl.origin !== new URL(url).origin) {
    externalRequests.push(requestUrl.origin);
    return route.abort();
  }
  return route.continue();
});
try {
  const response = await page.goto(url);
  assert.equal(response.status(), 200);
  await page.locator("#start").waitFor();
  assert.equal(
    await page.getByRole("button", { name: /MPLS|tunnel/i }).count(),
    0,
  );
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/arcade-card.png",
    fullPage: false,
  });
  await page.locator("#start").click();
  await page.locator("#ping").click();
  assert.match(await page.locator(".result-number").innerText(), /^14\s/);
  await page.locator("#hop-0").selectOption("R2");
  await page.locator("#apply").click();
  await page.locator("#ping").click();
  assert.match(await page.locator(".result-number").innerText(), /^59\s/);
  assert.equal(await page.locator("#next").isEnabled(), true);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(errors, []);
  const record = {
    at: new Date().toISOString(),
    browser: await browser.version(),
    launcherCommand: "python3 start.py --port 8002 --no-browser",
    defaultLauncher: "python3 start.py",
    defaultUrl: "http://127.0.0.1:8001",
    checkedUrl: url,
    httpStatus: response.status(),
    baselineRtt: 14,
    editedRtt: 59,
    progressionEnabled: true,
    externalRequests,
    errors,
    cardImage: "docs/screenshots/arcade-card.png",
    cardWidth: 1280,
    cardHeight: 720,
  };
  await writeFile(
    "docs/arcade-runtime-check.json",
    JSON.stringify(record, null, 2) + "\n",
  );
  console.log(JSON.stringify(record, null, 2));
} finally {
  await browser.close();
}

import { test, expect } from "@playwright/test";
import { createGame } from "../../src/engine.js";
const key = "outpost-09-expedition-v1";

test("build, spend orders, advance a cycle, and restore on reload", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("[data-tile]")).toHaveCount(108);
  await page.locator('[data-tile="55"]').click();
  await page.locator('[data-build="turret"]').click();
  await expect(page.locator(".tile-identity h3")).toHaveText("Sentry turret");
  await expect(page.locator(".orders strong")).toHaveText("2 / 3");
  await page.locator('[data-action="charge"]').click();
  await expect(page.locator(".objective-line").last()).toContainText("20%");
  await page.locator('[data-command="end"]').click();
  await expect(page.locator(".cycle-stat strong")).toHaveText("02 / 10");
  await page.reload();
  await expect(page.locator(".cycle-stat strong")).toHaveText("02 / 10");
  await expect(page.locator(".tile-identity h3")).toHaveText("Sentry turret");
  expect(errors).toEqual([]);
});
test("blueprint dock constructs on the map and escape exits construction", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-blueprint="turret"]').click();
  await expect(page.locator(".board")).toHaveClass(/construction-mode/);
  await page.locator('[data-tile="55"]').click();
  await expect(page.locator(".tile-identity h3")).toHaveText("Sentry turret");
  await page.keyboard.press("Escape");
  await expect(page.locator(".board")).not.toHaveClass(/construction-mode/);
  await page.keyboard.press("2");
  await expect(page.locator('[data-blueprint="reactor"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
test("guide, log, pause, audio, scanlines, range, and mission selection work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "How to play", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Field guide", exact: true }).click();
  await expect(page.locator(".codex-grid")).toHaveCount(2);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "View mission log" }).click();
  await expect(page.locator(".full-log")).toContainText("Touchdown confirmed");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Enable sound" }).click();
  await expect(
    page.getByRole("button", { name: "Mute", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Toggle scanlines" }).click();
  await expect(page.locator(".game-shell")).not.toHaveClass(/crt/);
  await page.locator('[data-command="range"]').click();
  await expect(page.locator('[data-command="range"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.getByRole("button", { name: "Pause expedition" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "The universe can wait.",
  );
  await page.keyboard.press("Escape");
  await page.locator('[data-command="end"]').click();
  await page
    .getByRole("button", { name: "New expedition", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(page.locator(".cycle-stat strong")).toHaveText("02 / 10");
  await page
    .getByRole("button", { name: "New expedition", exact: true })
    .click();
  await page.locator('[data-scenario="rust"]').click();
  await page.locator('[data-difficulty="commander"]').click();
  await page.getByRole("button", { name: "Start expedition" }).click();
  await expect(page.locator(".cycle-stat strong")).toHaveText("01 / 14");
  await expect(page.locator(".mission-brief h2")).toHaveText("Rust Moon");
  await expect(page.locator(".difficulty-label")).toContainText("Commander");
});
test("keyboard map navigation and dialog focus stay accessible", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-tile="54"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-tile="55"]')).toBeFocused();
  await expect(page.locator(".coord")).toHaveText("H05");
  await page.keyboard.press("?");
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".modal .primary")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-tile="55"]')).toBeFocused();
});
test("transmissions pause progression and reload into the unresolved decision", async ({
  page,
}) => {
  await page.goto("/");
  for (let i = 0; i < 3; i++)
    await page.locator('[data-command="end"]').click();
  await expect(page.getByRole("dialog")).toContainText(
    "A GHOST ON THE SCANNER",
  );
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveAttribute(
    "aria-label",
    "Incoming transmission",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator('[data-choice="alloy"]').click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".orders strong")).toHaveText("3 / 3");
  await expect(page.locator('[data-command="end"]')).toBeEnabled();
});
test("version one progress migrates into the new command screen", async ({
  page,
}) => {
  const legacy = createGame(42);
  legacy.version = 1;
  legacy.turn = 5;
  legacy.signal = 40;
  legacy.alloy = 61;
  await page.addInitScript(
    ({ key, legacy }) => localStorage.setItem(key, JSON.stringify(legacy)),
    { key, legacy },
  );
  await page.goto("/");
  await expect(page.locator(".cycle-stat strong")).toHaveText("05 / 10");
  await expect(page.locator(".alloy-stat strong")).toHaveText("61");
  await expect(page.locator(".objective-line").last()).toContainText("40%");
});
test("corrupt saves recover and blocked storage remains playable", async ({
  page,
}) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{broken"), key);
  await page.goto("/");
  await expect(page.locator(".cycle-stat strong")).toHaveText("01 / 10");
  const context = await page.context().browser().newContext();
  const blocked = await context.newPage();
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw Error("Blocked");
    };
  });
  await blocked.goto("http://127.0.0.1:5174");
  await expect(blocked.locator("footer")).toContainText("SAVING UNAVAILABLE");
  await blocked.locator('[data-command="end"]').click();
  await expect(blocked.locator(".cycle-stat strong")).toHaveText("02 / 10");
  await context.close();
});
test("mission victory can transition to endless defense", async ({ page }) => {
  const g = createGame(42);
  g.turn = 10;
  g.signal = 100;
  await page.addInitScript(
    ({ key, g }) => localStorage.setItem(key, JSON.stringify(g)),
    { key, g },
  );
  await page.goto("/");
  await page.locator('[data-command="end"]').click();
  await expect(page.locator(".result-overlay h2")).toHaveText(
    "MISSION COMPLETE",
  );
  await page.locator('[data-command="endless"]').click();
  await expect(page.locator(".result-overlay")).toHaveCount(0);
  await expect(page.locator(".cycle-stat strong")).toHaveText("11 / ∞");
  await expect(page.locator(".difficulty-label")).toContainText("ENDLESS");
});
for (const [width, height] of [
  [1440, 1000],
  [1280, 900],
  [1280, 720],
  [1024, 768],
  [768, 1000],
  [390, 844],
  [320, 800],
])
  test(`command screen fits ${width}×${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    await page.locator('[data-tile="55"]').click();
    await expect(page.locator('[data-build="turret"]')).toBeEnabled();
    await page.screenshot({
      path: testInfo.outputPath(`outpost-${width}.png`),
      fullPage: true,
    });
    if (width >= 1100) {
      const board = await page.locator(".board").boundingBox(),
        button = await page.locator('[data-command="end"]').boundingBox();
      expect(board.y + board.height).toBeLessThan(height);
      expect(board.height).toBeGreaterThanOrEqual(220);
      expect(button.y + button.height).toBeLessThanOrEqual(height);
      const container = await page
        .locator(".battlefield-container")
        .boundingBox();
      expect(board.y).toBeGreaterThan(container.y);
      expect(board.y + board.height).toBeLessThan(
        container.y + container.height,
      );
    }
  });

test("orders can be undone within a cycle, but not after enemies advance", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-tile="55"]').click();
  await page.locator('[data-build="turret"]').click();
  await page
    .getByRole("button", { name: "Undo last order", exact: true })
    .click();
  await expect(page.locator(".tile-identity h3")).toHaveText("Open terrain");
  await expect(page.locator(".alloy-stat strong")).toHaveText("36");
  await expect(page.locator(".orders strong")).toHaveText("3 / 3");
  await page.locator('[data-build="turret"]').click();
  await page.locator('[data-command="end"]').click();
  await expect(
    page.getByRole("button", { name: "Undo last order", exact: true }),
  ).toBeDisabled();
});

test("a complete seeded expedition reaches rescue through real player controls", async ({
  page,
}) => {
  const g = createGame(42);
  await page.addInitScript(
    ({ key, g }) => localStorage.setItem(key, JSON.stringify(g)),
    { key, g },
  );
  await page.goto("/");
  for (let i = 0; i < 17; i++) {
    let state = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      key,
    );
    if (state.pendingEvent) {
      await page
        .locator(
          `[data-choice="${state.pendingEvent === "wreck" ? "energy" : state.pendingEvent === "relay" ? "signal" : "kit"}"]`,
        )
        .click();
      state = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)),
        key,
      );
    }
    if (state.status === "won") break;
    for (const [index, type, minTurn] of [
      [55, "turret", 1],
      [64, "mine", 1],
      [65, "reactor", 2],
      [41, "turret", 3],
      [67, "turret", 4],
      [52, "turret", 6],
    ]) {
      state = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)),
        key,
      );
      if (state.turn >= minTurn && !state.tiles[index].structure) {
        await page.locator(`[data-tile="${index}"]`).click();
        const b = page.locator(`[data-build="${type}"]`);
        if (await b.isEnabled()) await b.click();
      }
    }
    state = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      key,
    );
    const upgrade = page.locator('[data-action="upgrade"]');
    if (state.turn >= 5 && (await upgrade.isEnabled())) await upgrade.click();
    const charge = page.locator('[data-action="charge"]');
    if (state.turn >= 4 && (await charge.isEnabled())) await charge.click();
    state = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      key,
    );
    if (state.status === "won") break;
    await page.locator('[data-command="end"]').click();
  }
  await expect(page.locator(".result-overlay h2")).toHaveText(
    "MISSION COMPLETE",
  );
});

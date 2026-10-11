// Selector smoke test — validates every locator record.mjs depends on,
// against the live dev server, without recording anything.
import { chromium } from "playwright";

const U = "http://localhost:3000";
const ok = [];
const bad = [];
const check = async (name, fn) => {
  try {
    await fn();
    ok.push(name);
    console.log(`✓ ${name}`);
  } catch (e) {
    bad.push(`${name}: ${String(e).split("\n")[0]}`);
    console.log(`✗ ${name} — ${String(e).split("\n")[0]}`);
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(U, { waitUntil: "networkidle" });

const clash = (re) => page.locator("li button[aria-expanded]", { hasText: re }).first();

await check("summary line present", async () => {
  if (!(await page.getByText(/promises found in/).first().isVisible())) throw new Error("not visible");
});
await check("Clashes heading", () => page.getByRole("heading", { name: "Clashes" }).first().waitFor());
await check("parking clash row", () => clash(/Crew parking passes/).waitFor());
await check("green room clash row", () => clash(/Stage B green room/).waitFor());
await check("set length clash row", () => clash(/Set length/).waitFor());
await check("orphan clash row", () => clash(/Nobody owns this/).waitFor());

await check("expand parking → See where inside", async () => {
  await clash(/Crew parking passes/).click();
  await page.locator('div.border-t button:has-text("See where")').first().waitFor({ timeout: 4000 });
});
await check("See where → dialog opens", async () => {
  await page.locator('div.border-t button:has-text("See where")').first().click();
  await page.locator("dialog[open]").waitFor({ timeout: 4000 });
});
await check("dialog Close button", () =>
  page.locator('dialog[open] button:has-text("Close")').first().waitFor({ timeout: 4000 }),
);

await check("close dialog", async () => {
  await page.locator('dialog[open] button:has-text("Close")').first().click();
  await page.locator("dialog[open]").waitFor({ state: "detached", timeout: 4000 });
});

await check("Add a conversation button", () =>
  page.getByRole("button", { name: "Add a conversation" }).waitFor(),
);
await check("modal → Use an example → Read it", async () => {
  await page.getByRole("button", { name: "Add a conversation" }).click();
  await page.getByRole("button", { name: "Use an example" }).waitFor({ timeout: 4000 });
  await page.getByRole("button", { name: "Use an example" }).click();
  await page.getByRole("button", { name: "Read it" }).waitFor({ timeout: 4000 });
  await page.getByRole("button", { name: "Read it" }).click();
  await page.locator("dialog[open]").waitFor({ state: "detached", timeout: 25000 });
  console.log("    (gemini extraction completed)");
});

await check("new Site buggies clash present", () => clash(/Site buggies/).waitFor({ timeout: 5000 }));
await check("capacity section + buggies bar", () =>
  page.locator('section[aria-labelledby="capacity"] .grid > div', { hasText: "Site buggies" }).first().waitFor(),
);
await check("buggies bar is red (over capacity)", async () => {
  const bar = page
    .locator('section[aria-labelledby="capacity"] .grid > div', { hasText: "Site buggies" })
    .first()
    .locator("div.h-full");
  const cls = await bar.getAttribute("class");
  if (!/bg-accent/.test(cls ?? "")) throw new Error(`expected bg-accent, got: ${cls}`);
});
await check("expand buggies clash", async () => {
  await clash(/Site buggies/).click();
  await page.locator('div.border-t button:has-text("Draft a fix")').first().waitFor({ timeout: 4000 });
});
await check("Draft a fix produces a draft", async () => {
  await page.locator('div.border-t button:has-text("Draft a fix")').first().click();
  await page.getByText("A draft for you to edit and send").first().waitFor({ timeout: 25000 });
  console.log("    (draft rendered)");
});
await check("Every promise heading + Priya filter", async () => {
  await page.getByRole("heading", { name: "Every promise" }).first().waitFor();
  await page.getByRole("button", { name: "Priya", exact: true }).waitFor();
});
await check("Priya filter narrows the table", async () => {
  await page.getByRole("button", { name: "Priya", exact: true }).click();
  await page.waitForTimeout(600);
  const pressed = await page.getByRole("button", { name: "Priya", exact: true }).getAttribute("aria-pressed");
  if (pressed !== "true") throw new Error(`aria-pressed=${pressed}`);
});
await check("scroll to top", async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("heading", { name: "The Promise Ledger" }).first().waitFor();
});

await browser.close();
console.log(`\n${ok.length} passed, ${bad.length} failed`);
if (bad.length) {
  bad.forEach((b) => console.log(`  ✗ ${b}`));
  process.exit(1);
}

import { test, expect, type Page } from '@playwright/test';

/** Collects console errors and failed requests so every test can assert a clean page. */
function watchForFailures(page: Page) {
  const failures: string[] = [];
  page.on('console', (m) => m.type() === 'error' && failures.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => failures.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()}: ${r.url()}`);
  });
  return failures;
}

test.describe('dashboard shell', () => {
  test('renders cleanly with no console errors or failed requests', async ({ page }) => {
    const failures = watchForFailures(page);

    await page.goto('/');

    await expect(page.locator('nav[aria-label="Main"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Blank page' })).toBeVisible();
    expect(failures).toEqual([]);
  });

  test('stylesheet and favicon resolve', async ({ page }) => {
    await page.goto('/');

    const css = page.locator('link[rel="stylesheet"]');
    await expect(css).toHaveCount(1);

    for (const sel of ['link[rel="stylesheet"]', 'link[rel="icon"]']) {
      const href = await page.locator(sel).getAttribute('href');
      expect(href, `${sel} has an href`).toBeTruthy();
      const res = await page.request.get(href!);
      expect(res.status(), `${href} loads`).toBe(200);
    }
  });

  test('ships plain markup — no hydration runtime', async ({ page }) => {
    const res = await page.request.get('/');
    const html = await res.text();

    // The HTML bundle's whole premise is that consumers can hand-edit the
    // markup. Hydration markers would mean they cannot.
    expect(html).not.toContain('astro-island');
    expect(html).not.toContain('data-hydrate');
    // Alpine attributes must survive into the output.
    expect(html).toContain('x-data');
  });

  test('nested nav expands', async ({ page, isMobile }) => {
    await page.goto('/');

    // The sidebar is off-canvas on mobile, so the nav is unreachable until the
    // drawer is open.
    if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();

    const submenu = page.getByRole('link', { name: 'Spreadsheet' });
    await expect(submenu).toBeHidden();

    await page.getByRole('button', { name: 'Data' }).click();
    await expect(submenu).toBeVisible();
  });
});

test.describe('theme', () => {
  test('toggles and persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    const startedDark = await html.evaluate((el) => el.classList.contains('dark'));
    await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
    await expect(html).toHaveClass(startedDark ? /^(?!.*dark).*$/ : /dark/);

    await page.reload();
    const afterReload = await html.evaluate((el) => el.classList.contains('dark'));
    expect(afterReload).toBe(!startedDark);
  });

  test('applies before paint so there is no flash', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    // 'commit' resolves as soon as the document starts — if the theme class is
    // already set here, it was applied by the inline script, not after load.
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

test.describe('responsive', () => {
  test.skip(({ isMobile }) => !isMobile, 'drawer behaviour is mobile-only');

  test('drawer opens and closes on escape', async ({ page }) => {
    await page.goto('/');

    // Asserting on the off-canvas class rather than translate-x-0, which would
    // also match the always-present lg:translate-x-0 breakpoint variant.
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(sidebar).not.toHaveClass(/-translate-x-full/);

    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });
});

test.describe('sidebar collapse', () => {
  test.skip(({ isMobile }) => isMobile, 'collapse control is desktop-only');

  test('collapses and persists across reload', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-64/);

    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar).toHaveClass(/w-16/);

    await page.reload();
    await expect(sidebar).toHaveClass(/w-16/);
  });
});

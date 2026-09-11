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
    await expect(page.getByRole('heading', { name: 'Revenue vs target' })).toBeVisible();
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

test.describe('auth pack', () => {
  const pages = [
    { path: '/login', heading: 'Sign in' },
    { path: '/register', heading: 'Create account' },
    { path: '/forgot-password', heading: 'Reset password' },
  ];

  for (const { path, heading } of pages) {
    test(`${path} renders cleanly and labels every control`, async ({ page }) => {
      const failures = watchForFailures(page);

      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();

      // A control with no accessible name is the failure mode these pages exist
      // to demonstrate the absence of.
      const controls = page.locator('input:not([type=hidden]), select, textarea');
      const count = await controls.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const name = await controls.nth(i).evaluate((el) => {
          const id = el.getAttribute('id');
          return id ? document.querySelector(`label[for="${id}"]`)?.textContent?.trim() : null;
        });
        expect(name, `control ${i} on ${path} has a label`).toBeTruthy();
      }

      expect(failures).toEqual([]);
    });
  }

  test('password reset swaps the form for a confirmation', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Check your inbox' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeHidden();
  });

  test('404 offers a way back', async ({ page }) => {
    await page.goto('/404');

    await expect(page.getByRole('heading', { name: 'Page not found', level: 2 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to dashboard' })).toBeVisible();
  });
});

test.describe('dashboard overview', () => {
  test('draws every chart with themed colours, not Apex defaults', async ({ page }) => {
    const failures = watchForFailures(page);
    await page.goto('/');

    // Four cards, four rendered SVGs — a chart that throws leaves the card up
    // with an error state, so counting cards alone would not catch it.
    await expect(page.locator('.apexcharts-canvas')).toHaveCount(4);
    await expect(page.locator('[data-chart-error]:not([hidden])')).toHaveCount(0);
    await expect(page.locator('[data-chart-skeleton]')).toHaveCount(0);

    // The series colour comes from a CSS variable that Tailwind will drop if no
    // utility references it; an empty token paints the marks black.
    const stroke = await page
      .locator('[data-chart] .apexcharts-line')
      .first()
      .getAttribute('stroke');
    expect(stroke).toMatch(/15,\s*119,\s*255/);

    expect(failures).toEqual([]);
  });

  test('charts re-theme when the toggle flips', async ({ page }) => {
    await page.goto('/');

    const line = page.locator('[data-chart] .apexcharts-line').first();
    await expect(line).toHaveAttribute('stroke', /15,\s*119,\s*255/);

    await page.getByRole('button', { name: 'Switch to dark theme' }).click();

    // The dark palette is its own set of steps, not a filter over the light one.
    await expect(line).toHaveAttribute('stroke', /58,\s*141,\s*245/);
  });

  test('table sorts, searches, pages, and empties', async ({ page }) => {
    await page.goto('/');

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(6);
    await expect(page.getByText('Showing 1–6 of 12 rows')).toBeVisible();

    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText('Showing 7–12 of 12 rows')).toBeVisible();

    await page.getByRole('columnheader', { name: 'Amount' }).getByRole('button').click();
    await expect(rows.first()).toContainText('$290');

    await page.getByLabel('Search orders').fill('turing');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Alan Turing');

    await page.getByLabel('Search orders').fill('nobody');
    await expect(page.getByText('No matches')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(rows).toHaveCount(6);
  });

  test('blank template still ships at its own route', async ({ page }) => {
    await page.goto('/blank');
    await expect(page.getByRole('heading', { name: 'Blank page' })).toBeVisible();
  });
});

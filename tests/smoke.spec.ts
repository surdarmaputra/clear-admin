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
  test('draws every chart with themed colours, not library defaults', async ({ page }) => {
    const failures = watchForFailures(page);
    await page.goto('/');

    // Four cards, four canvases — a chart that throws leaves the card up with
    // an error state, so counting cards alone would not catch it.
    await expect(page.locator('canvas[data-chart-canvas]')).toHaveCount(4);
    await expect(page.locator('[data-chart-error]:not([hidden])')).toHaveCount(0);
    await expect(page.locator('[data-chart-skeleton]')).toHaveCount(0);

    // The series colours come from CSS variables Tailwind will drop if no
    // utility references them; an empty token paints the marks black. A canvas
    // has no DOM to inspect, so the chart publishes what it actually applied.
    await expect(page.locator('[data-chart]').first()).toHaveAttribute(
      'data-chart-colors',
      '#0f77ff,#eb6834',
    );

    // And it really painted: an empty canvas would pass every check above.
    const painted = await page
      .locator('canvas[data-chart-canvas]')
      .first()
      .evaluate((canvas: HTMLCanvasElement) => {
        const pixels = canvas
          .getContext('2d')!
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) count++;
        return count;
      });
    expect(painted).toBeGreaterThan(1000);

    expect(failures).toEqual([]);
  });

  test('charts re-theme when the toggle flips', async ({ page }) => {
    await page.goto('/');

    const chart = page.locator('[data-chart]').first();
    await expect(chart).toHaveAttribute('data-chart-colors', '#0f77ff,#eb6834');

    await page.getByRole('button', { name: 'Switch to dark theme' }).click();

    // The dark palette is its own set of steps, not a filter over the light one.
    await expect(chart).toHaveAttribute('data-chart-colors', '#3a8df5,#d95926');
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

test.describe('dashboard on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'this is the mobile contract');

  test('never scrolls sideways, and the table scrolls instead of squashing', async ({ page }) => {
    await page.goto('/');

    // A page that pans horizontally on a phone is the failure this guards.
    const { doc, win } = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    expect(doc, `page is ${doc}px wide in a ${win}px viewport`).toBeLessThanOrEqual(win + 1);

    // The table keeps its column widths and scrolls within its own container,
    // rather than compressing until the status badges clip.
    const scroller = page.locator('.overflow-x-auto').first();
    const scrolls = await scroller.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls, 'table container scrolls horizontally').toBe(true);
  });

  test('charts fit their cards', async ({ page }) => {
    await page.goto('/');

    for (const card of await page.locator('[data-chart]').all()) {
      const fits = await card.evaluate((el) => {
        const canvas = el.querySelector('canvas');
        return (
          !canvas || canvas.getBoundingClientRect().width <= el.getBoundingClientRect().width + 1
        );
      });
      expect(fits).toBe(true);
    }
  });
});

test.describe('interaction pack', () => {
  test('overlays, feedback and forms pages render cleanly', async ({ page }) => {
    for (const path of ['/components/overlays', '/components/feedback', '/components/forms']) {
      const failures = watchForFailures(page);
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(failures, `${path} is clean`).toEqual([]);
    }
  });

  test('modal traps Tab, closes on escape, and restores focus', async ({ page }) => {
    await page.goto('/components/overlays');

    const trigger = page.getByRole('button', { name: 'Delete order', exact: true });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Delete this order?' });
    await expect(dialog).toBeVisible();

    // Focus starts inside the panel and Tab never leaves it — the drawer
    // shipping untrapped is the bug this directive exists to prevent.
    for (let i = 0; i < 8; i++) {
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(inside, `focus stayed in the dialog after ${i} tabs`).toBe(true);
      await page.keyboard.press('Tab');
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('drawer opens from either edge and closes on the backdrop', async ({ page }) => {
    await page.goto('/components/overlays');

    await page.getByRole('button', { name: 'Order details' }).click();
    const drawer = page.getByRole('dialog', { name: 'Order #1042' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('Ada Lovelace');

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();

    await page.getByRole('button', { name: 'Filters' }).click();
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  });

  test('dropdown walks with the arrow keys and raises the selected action', async ({ page }) => {
    await page.goto('/components/overlays');

    const menu = page.getByRole('menu', { name: 'Actions' });
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem').first()).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem').nth(1)).toBeFocused();

    await page.keyboard.press('End');
    await expect(menu.getByRole('menuitem').last()).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.locator('[data-toast]')).toContainText('Order deleted');
  });

  test('tooltip answers the keyboard, not just the pointer', async ({ page }) => {
    await page.goto('/components/overlays');

    const tip = page.getByRole('tooltip').filter({ hasText: 'Refresh the table' });
    await expect(tip).toBeHidden();

    const trigger = page.getByRole('button', { name: 'Refresh' });
    await trigger.focus();
    await expect(tip).toBeVisible();

    // The trigger has to point at the tooltip, or a screen reader never hears it.
    const describedBy = await trigger.getAttribute('aria-describedby');
    expect(describedBy).toBe(await tip.getAttribute('id'));

    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
  });

  test('tabs move with the arrow keys and swap panels', async ({ page }) => {
    await page.goto('/components/overlays');

    const details = page.getByRole('tab', { name: 'Details' });
    await expect(details).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('placed 12 March');

    await details.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Members' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tabpanel')).toContainText('Grace Hopper');

    // One Tab stop for the whole tablist: the unselected tabs are skipped.
    await expect(details).toHaveAttribute('tabindex', '-1');

    await page.keyboard.press('ArrowLeft');
    await expect(details).toHaveAttribute('aria-selected', 'true');
  });

  test('toast stacks, announces politely, and dismisses', async ({ page }) => {
    await page.goto('/components/feedback');

    const toasts = page.locator('[data-toast]');
    await page.getByRole('button', { name: 'Success' }).click();
    await expect(toasts).toHaveCount(1);
    await expect(toasts.first()).toContainText('Changes saved.');

    await page.getByRole('button', { name: 'Persistent' }).click();
    await expect(toasts).toHaveCount(2);

    await toasts.last().getByRole('button', { name: 'Dismiss notification' }).click();
    await expect(toasts).toHaveCount(1);

    // The auto-dismissing one clears itself; the persistent one would not have.
    await expect(toasts).toHaveCount(0, { timeout: 6000 });
  });

  test('switch reports its state and posts a value', async ({ page }) => {
    await page.goto('/components/forms');

    const toggle = page.getByRole('switch', { name: 'Auto-renew' });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    const value = page.locator('input[name="auto-renew"]');
    await expect(value).toHaveValue('on');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(value).toHaveValue('off');

    await expect(page.getByRole('switch', { name: 'Sandbox mode' })).toBeDisabled();
  });

  test('date picker walks the grid and posts an ISO value', async ({ page }) => {
    await page.goto('/components/forms');

    const input = page.getByRole('textbox', { name: 'Period start' });
    await expect(input).toHaveValue('Sep 1, 2026');

    await input.click();
    const calendar = page.getByRole('dialog', { name: 'Period start calendar' });
    await expect(calendar).toBeVisible();
    await expect(calendar.getByText('September 2026')).toBeVisible();

    // Right moves a day, down moves a week: the 1st plus 8 days is the 9th.
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(calendar).toBeHidden();
    await expect(input).toHaveValue('Sep 9, 2026');
    await expect(page.locator('input[name="period-start"]')).toHaveValue('2026-09-09');
  });
});

test.describe('mobile nav trap', () => {
  test.skip(({ isMobile }) => !isMobile, 'the off-canvas drawer is mobile-only');

  test('keeps focus inside the open drawer', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Open navigation' }).click();
    const sidebar = page.locator('aside');

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const inside = await sidebar.evaluate((el) => el.contains(document.activeElement));
      expect(inside, `focus stayed in the drawer after ${i + 1} tabs`).toBe(true);
    }
  });
});

test.describe('data pack', () => {
  const firstCustomerCell = (page: Page) => page.locator('[data-cell$=":customer"]').first();

  test('renders cleanly and pages through the endpoint', async ({ page }) => {
    const failures = watchForFailures(page);
    await page.goto('/data/tables');

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(8);
    await expect(page.getByText('Showing 1–8 of 48 rows')).toBeVisible();

    // The request line is the contract: every control writes to these params.
    await expect(page.locator('pre')).toContainText('page=1&pageSize=8&sort=date&dir=desc');

    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText('Showing 9–16 of 48 rows')).toBeVisible();
    await expect(page.locator('pre')).toContainText('page=2');

    expect(failures).toEqual([]);
  });

  test('sorting and searching go to the endpoint, not the page', async ({ page }) => {
    await page.goto('/data/tables');
    await expect(page.locator('tbody tr')).toHaveCount(8);

    await page.getByRole('columnheader', { name: 'Amount' }).getByRole('button').click();
    await expect(page.locator('pre')).toContainText('sort=amount&dir=asc');
    // Ascending across all 48 rows, not just the 8 on screen.
    await expect(page.locator('tbody tr').first()).toContainText('$240');

    await page.getByLabel('Search invoices').fill('turing');
    await expect(page.getByText('Showing 1–4 of 4 rows')).toBeVisible();
    await expect(page.locator('pre')).toContainText('q=turing');

    await page.getByLabel('Search invoices').fill('nobody at all');
    await expect(page.getByText('No invoices match')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByText('Showing 1–8 of 48 rows')).toBeVisible();
  });

  test('a failed request shows the error state and recovers', async ({ page }) => {
    await page.goto('/data/tables');
    await expect(page.locator('tbody tr')).toHaveCount(8);

    await page.getByRole('button', { name: 'Break the endpoint' }).click();
    await expect(page.getByText('Could not load invoices')).toBeVisible();

    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(8);
  });

  test('cells edit in place, commit, and cancel', async ({ page }) => {
    await page.goto('/data/tables');
    const cell = firstCustomerCell(page);
    await expect(cell).toHaveAttribute('aria-label', /^Edit customer for INV-/);

    await cell.click();
    const editor = page.locator('input[data-editor$=":customer"]').first();
    await expect(editor).toBeFocused();

    await editor.fill('Edited Name');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-toast]')).toContainText('Saved.');
    await expect(cell).toHaveText('Edited Name');
    // Focus comes back to the cell, so the next arrow key still works.
    await expect(cell).toBeFocused();

    await cell.click();
    await editor.fill('Discarded');
    await page.keyboard.press('Escape');
    await expect(cell).toHaveText('Edited Name');
    await expect(cell).toBeFocused();
  });

  test('rejects a draft that the column cannot hold', async ({ page }) => {
    await page.goto('/data/tables');

    const amount = page.locator('[data-cell$=":amount"]').first();
    const before = await amount.textContent();
    await amount.click();

    const editor = page.locator('input[data-editor$=":amount"]').first();
    await editor.fill('not a number');
    await page.keyboard.press('Enter');

    await expect(page.locator('[data-toast]')).toContainText('That is not a number.');
    // The editor stays open rather than discarding what was typed.
    await expect(editor).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(amount).toHaveText(before!.trim());
  });

  test('arrow keys walk the editable cells', async ({ page }) => {
    await page.goto('/data/tables');

    const cell = firstCustomerCell(page);
    await cell.focus();
    const id = await cell.getAttribute('data-cell');
    const row = id!.split(':')[0];

    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`[data-cell="${row}:amount"]`)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    const next = await page.evaluate(() => document.activeElement?.getAttribute('data-cell'));
    expect(next).toMatch(/:amount$/);
    expect(next).not.toBe(`${row}:amount`);

    await page.keyboard.press('ArrowLeft');
    await expect(
      page.evaluate(() => document.activeElement?.getAttribute('data-cell')),
    ).resolves.toMatch(/:customer$/);
  });

  test('columns resize from the keyboard and the width persists', async ({ page }) => {
    await page.goto('/data/tables');
    await expect(page.locator('tbody tr')).toHaveCount(8);

    const column = page.locator('colgroup col').nth(1);
    const width = () => column.evaluate((el) => Number.parseFloat(getComputedStyle(el).width));
    const before = await width();

    // A resizer only a mouse can reach is not a resizer for everyone.
    await page.getByRole('separator', { name: 'Resize Customer' }).focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    const after = await width();
    expect(after).toBeGreaterThan(before);

    await page.reload();
    await expect(page.locator('tbody tr')).toHaveCount(8);
    expect(await width()).toBe(after);
  });
});

test.describe('progress', () => {
  test('reports its value to assistive technology, not just in pixels', async ({ page }) => {
    await page.goto('/components/feedback');

    const bar = page.getByRole('progressbar', { name: 'Seats used' });
    await expect(bar).toHaveAttribute('aria-valuenow', '34');
    await expect(bar).toHaveAttribute('aria-valuemax', '50');

    // 34 of 50 is 68%, and the fill has to agree with the number.
    const fill = bar.locator('div');
    const [fillWidth, trackWidth] = await Promise.all([
      fill.evaluate((el) => el.getBoundingClientRect().width),
      bar.evaluate((el) => el.getBoundingClientRect().width),
    ]);
    expect(Math.round((fillWidth / trackWidth) * 100)).toBe(68);

    const ring = page.getByRole('progressbar', { name: 'Import complete' });
    await expect(ring).toHaveAttribute('aria-valuenow', '68');
    await expect(ring).toContainText('68%');
  });
});

test.describe('account pages', () => {
  for (const path of ['/profile', '/settings']) {
    test(`${path} renders cleanly and labels every control`, async ({ page }) => {
      const failures = watchForFailures(page);

      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

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

  test('the account menu reaches both pages', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the account menu is the same dropdown the overlay tests cover');
    await page.goto('/');

    await page.getByRole('button', { name: 'Account' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  });

  test('profile saves through a toast rather than a reload', async ({ page }) => {
    await page.goto('/profile');

    await page.getByLabel('Full name').fill('Ada Lovelace');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Profile saved' })).toBeVisible();
  });

  test('settings tabs swap panels and the danger zone confirms first', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByLabel('Workspace name')).toBeVisible();

    await page.getByRole('tab', { name: 'Notifications' }).click();
    await expect(page.getByRole('switch', { name: 'Weekly digest' })).toBeVisible();
    await expect(page.getByLabel('Workspace name')).toBeHidden();

    await page.getByRole('tab', { name: 'Danger zone' }).click();
    await page.getByRole('button', { name: 'Delete workspace', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe('headless table', () => {
  test('renders cleanly and only this page pays for table-core', async ({ page }) => {
    const failures = watchForFailures(page);
    await page.goto('/data/headless');

    await expect(page.locator('tbody tr')).toHaveCount(8);
    await expect(page.getByText('Showing 1–8 of 48 invoices')).toBeVisible();

    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText('Showing 9–16 of 48 invoices')).toBeVisible();

    expect(failures).toEqual([]);
  });

  test('the core chunk is fetched here and nowhere else', async ({ page }) => {
    const chunks: string[] = [];
    page.on('request', (request) => chunks.push(request.url()));

    await page.goto('/data/tables');
    await expect(page.locator('tbody tr')).toHaveCount(8);
    expect(chunks.filter((url) => /headless/.test(url))).toEqual([]);

    await page.goto('/data/headless');
    await expect(page.locator('tbody tr')).toHaveCount(8);
    expect(chunks.filter((url) => /headless.*\.js$/.test(url)).length).toBeGreaterThan(0);
  });

  test('facet counts filter the rows and exclude their own column', async ({ page }) => {
    await page.goto('/data/headless');
    await expect(page.locator('tbody tr')).toHaveCount(8);

    // 48 invoices, 7 refunded — the count is the core's, computed before this
    // column's own filter is applied.
    const refunded = page.getByRole('checkbox', { name: /^refunded/ });
    await expect(refunded).toBeVisible();
    await refunded.check();

    await expect(page.getByText('Showing 1–7 of 7 invoices')).toBeVisible();
    // Still listed with its count, because a facet does not filter itself away.
    await expect(page.getByRole('checkbox', { name: /^paid/ })).toBeVisible();

    await page.getByRole('checkbox', { name: /^paid/ }).check();
    await expect(page.getByText('Showing 1–8 of 35 invoices')).toBeVisible();

    await page.getByRole('button', { name: 'Reset view' }).click();
    await expect(page.getByText('Showing 1–8 of 48 invoices')).toBeVisible();
  });

  test('columns hide, reorder and pin', async ({ page }) => {
    await page.goto('/data/headless');
    await expect(page.locator('tbody tr')).toHaveCount(8);

    const headers = () =>
      page.locator('thead th').evaluateAll((cells) => cells.map((cell) => cell.dataset.column));
    expect(await headers()).toEqual(['id', 'customer', 'plan', 'status', 'amount', 'date']);

    await page.getByRole('checkbox', { name: 'Plan', exact: true }).uncheck();
    expect(await headers()).not.toContain('plan');

    await page.getByRole('button', { name: 'Move Date left' }).click();
    const reordered = await headers();
    expect(reordered.indexOf('date')).toBeLessThan(reordered.indexOf('amount'));

    // Invoice is pinned on load, so the first cell stays put as the table scrolls.
    const first = page.locator('tbody tr').first().locator('td').first();
    await expect(first).toHaveCSS('position', 'sticky');

    await page.getByRole('button', { name: 'Pin Invoice' }).click();
    await expect(first).not.toHaveCSS('position', 'sticky');
  });

  test('search and sort run in the browser, with no request', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));

    await page.goto('/data/headless');
    await expect(page.locator('tbody tr')).toHaveCount(8);
    const before = requests.length;

    await page.getByLabel('Search invoices').fill('turing');
    await expect(page.getByText('Showing 1–4 of 4 invoices')).toBeVisible();

    await page.getByRole('columnheader', { name: 'Amount' }).getByRole('button').click();
    await expect(page.locator('tbody tr').first()).toContainText('$');

    expect(requests.length, 'nothing was fetched to sort or search').toBe(before);
  });
});

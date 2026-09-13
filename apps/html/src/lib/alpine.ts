import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';
import { serverTable } from './table';

/** Anything a user can reach with Tab, minus what is hidden or disabled. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusable = (el: HTMLElement) =>
  [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (node) => node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement,
  );

/**
 * `x-focus-trap="expr"` — while the expression is truthy, Tab cycles inside the
 * element and focus starts on its first focusable child. Closing hands focus
 * back to whatever opened it.
 *
 * Built once here rather than hand-rolled in Modal, Drawer and the mobile nav,
 * which is how the drawer shipped untrapped in the first place.
 */
Alpine.directive('focus-trap', (el, { expression }, { effect, evaluateLater, cleanup }) => {
  const isActive = evaluateLater(expression);
  let restoreTo: HTMLElement | null = null;
  let active = false;

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const nodes = focusable(el as HTMLElement);
    if (nodes.length === 0) {
      event.preventDefault();
      return;
    }

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const current = document.activeElement;

    // Wrapping by hand rather than trusting the browser: the panel is not the
    // last thing in the DOM, so Tab off its edge would land on the page behind.
    if (event.shiftKey && (current === first || !el.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !el.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  };

  effect(() => {
    isActive((value) => {
      if (value && !active) {
        active = true;
        restoreTo = document.activeElement as HTMLElement;
        document.addEventListener('keydown', onKeydown, true);
        // The panel is x-show'd, so it has no layout until Alpine flushes.
        requestAnimationFrame(() => focusable(el as HTMLElement)[0]?.focus());
      } else if (!value && active) {
        active = false;
        document.removeEventListener('keydown', onKeydown, true);
        restoreTo?.focus();
        restoreTo = null;
      }
    });
  });

  cleanup(() => document.removeEventListener('keydown', onKeydown, true));
});

export interface Toast {
  id: number;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
}

interface OverlayStore {
  active: string | null;
  is(id: string): boolean;
  open(id: string): void;
  close(): void;
}

interface ToastStore {
  items: Toast[];
  seq: number;
  show(message: string, variant?: Toast['variant'], ttl?: number): void;
  dismiss(id: number): void;
}

/**
 * One overlay is open at a time — a modal over a drawer has no focus story that
 * is worth the code. `id` is the name the trigger and the panel agree on.
 */
const overlay: OverlayStore = {
  active: null,
  is(id: string) {
    return this.active === id;
  },
  open(id: string) {
    this.active = id;
    // The page behind must not scroll under the panel.
    document.body.style.overflow = 'hidden';
  },
  close() {
    this.active = null;
    document.body.style.overflow = '';
  },
};

const toast: ToastStore = {
  items: [],
  seq: 0,
  show(message: string, variant: Toast['variant'] = 'info', ttl = 4000) {
    const id = ++this.seq;
    this.items.push({ id, message, variant });
    if (ttl > 0) setTimeout(() => this.dismiss(id), ttl);
  },
  dismiss(id: number) {
    this.items = this.items.filter((item) => item.id !== id);
  },
};

Alpine.plugin(collapse);
Alpine.data('serverTable', serverTable);

// Each of these carries a dependency one page uses — `@tanstack/table-core`,
// Lexical, SortableJS. A static import would put all three in this bundle and
// charge the login screen for them (RFC-001 D10), so each is fetched only when
// a page on screen asks for it by attribute — and before `start()`, because
// `Alpine.data` registered after that never reaches markup already on the page.
if (document.querySelector('[data-headless-table]')) {
  const { headlessTable } = await import('./headless-table');
  Alpine.data('headlessTable', headlessTable);
}

if (document.querySelector('[data-rich-editor]')) {
  const { richEditor } = await import('./editor');
  Alpine.data('richEditor', richEditor);
}

if (document.querySelector('[data-file-drop]')) {
  const { fileDrop } = await import('./files');
  Alpine.data('fileDrop', fileDrop);
}

if (document.querySelector('[data-kanban]')) {
  const { kanbanBoard } = await import('./kanban');
  Alpine.data('kanbanBoard', kanbanBoard);
}

Alpine.store('overlay', overlay);
Alpine.store('toast', toast);

window.Alpine = Alpine;
Alpine.start();

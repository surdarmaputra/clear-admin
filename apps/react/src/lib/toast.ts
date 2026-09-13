export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

type Listener = (items: ToastItem[]) => void;

let uid = 0;
let items: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  const snapshot = [...items];
  listeners.forEach((l) => l(snapshot));
}

export const toast = {
  show(message: string, variant: ToastVariant = 'info', duration = 4000) {
    const item: ToastItem = { id: ++uid, message, variant, duration };
    items = [...items, item];
    notify();
  },
  dismiss(id: number) {
    items = items.filter((i) => i.id !== id);
    notify();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => items,
};

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { toggleTheme } from '@/lib/theme';

export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  function handleClick() {
    toggleTheme();
    setDark((d) => !d);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid size-9 place-items-center rounded-control text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

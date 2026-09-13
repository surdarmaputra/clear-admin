export function getTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function toggleTheme() {
  setTheme(!document.documentElement.classList.contains('dark'));
}

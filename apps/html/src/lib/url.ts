const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefixes an app-absolute path with the configured base. */
export const withBase = (path: string) => `${base}${path}`;

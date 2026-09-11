/**
 * Fails on Tailwind classes that compile to nothing.
 *
 * A class naming a token that no longer exists is dropped silently by the
 * compiler — the markup keeps the class, the page loses the style, and nothing
 * anywhere reports it. This already shipped one bug to main (ThemeToggle).
 *
 * The compiled stylesheet is the source of truth: Tailwind emits a rule for
 * every class it recognises, so a class present in source and absent from the
 * output is dead. Run after `astro build`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const srcDir = join(root, 'apps/html/src');
const distDir = join(root, 'apps/html/dist');

/** Markers Tailwind never emits a rule for — they are selectors, not utilities. */
const MARKERS = /^(group|peer)(\/[\w-]+)?$|^dark$/;

const walk = (dir, match) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path, match) : match.test(entry) ? [path] : [];
  });

const css = walk(distDir, /\.css$/)
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

if (!css) {
  console.error('::error::no compiled CSS found — run the build first');
  process.exit(1);
}

/** `class="a b"`, `class:list={['a']}` and Alpine's `:class="cond ? 'a' : 'b'"`. */
const ATTR =
  /(?:^|\s)((?::|x-bind:)?)class(?::list)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([\s\S]*?)\})/g;

const missing = [];

for (const file of walk(srcDir, /\.astro$/)) {
  const source = readFileSync(file, 'utf8');

  for (const match of source.matchAll(ATTR)) {
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    // A bound class (`:class`, `x-bind:class`, `class:list={}`) holds an
    // expression, where only the string literals are class names — bare
    // identifiers are variables.
    const bound = Boolean(match[1] || match[4] !== undefined);
    const chunks = bound ? [...value.matchAll(/['"`]([^'"`]*)['"`]/g)].map((m) => m[1]) : [value];

    for (const cls of chunks.join(' ').split(/\s+/)) {
      if (!cls || MARKERS.test(cls)) continue;
      // Astro interpolates `${}` into class strings; those fragments are not
      // whole class names.
      if (cls.includes('{') || cls.includes('}')) continue;

      const selector = '.' + cls.replace(/([:./[\]()%!#,])/g, '\\$1');
      if (!css.includes(selector)) missing.push({ file: relative(root, file), cls });
    }
  }
}

if (missing.length) {
  console.error('::error::these classes compile to nothing — the token was renamed or removed:');
  for (const { file, cls } of missing) console.error(`  ${file}: ${cls}`);
  process.exit(1);
}

console.log('token guard: every class in source compiles to a rule');

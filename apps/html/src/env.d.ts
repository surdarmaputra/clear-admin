/// <reference types="astro/client" />

// No top-level import/export here on purpose: that would make this a module and
// turn the declarations below into augmentations rather than ambient globals.

// @alpinejs/collapse ships no type declarations.
declare module '@alpinejs/collapse' {
  import type { PluginCallback } from 'alpinejs';
  const collapse: PluginCallback;
  export default collapse;
}

interface Window {
  Alpine: import('alpinejs').Alpine;
}

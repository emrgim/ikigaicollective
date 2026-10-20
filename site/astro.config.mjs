// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { buildMarkdown } from './scripts/build-md.mjs';

export default defineConfig({
  site: 'https://ikigaicollective.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [{ name: 'markdown-twins', hooks: { 'astro:build:done': ({ dir }) => { console.log(`markdown twins: ${buildMarkdown(fileURLToPath(dir))} pages`); } } }],
  vite: { plugins: [tailwindcss()] },
});

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Small hand-edited pages (question, ...). Notes collection arrives in Phase 2.
const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site' }),
  schema: z.object({ before: z.string(), em: z.string(), after: z.string() }),
});
export const collections = { site };

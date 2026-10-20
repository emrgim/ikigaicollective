import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Small hand-edited pages (question, ...).
const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site' }),
  schema: z.object({ before: z.string(), em: z.string(), after: z.string() }),
});

// Lab Notes. `repo` notes are seeded from lab-notes/src; `substack` notes come from the importer (Phase 5).
const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      week: z.number().int(),
      slug: z.string(),
      cover: image().optional(),
      excerpt: z.string(),
      canonical: z.string().url().optional(),
      source: z.enum(['repo', 'substack']).default('repo'),
    }),
});

export const collections = { site, notes };

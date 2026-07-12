import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content Layer API (Astro 5+): posts live in src/content/blog/*.mdx
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    // `kind` drives the sectioned home page: Essays / Reading maps / Projects.
    kind: z.enum(['essay', 'reading-list']).default('essay'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };

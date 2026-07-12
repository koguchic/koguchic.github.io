import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  // User site — served at the domain root, so no `base` is needed.
  site: 'https://koguchic.github.io',
  integrations: [mdx(), react()],
  markdown: {
    // Inherited by MDX as well (extendMarkdownConfig defaults to true),
    // so `$inline$` and `$$display$$` math works in both .md and .mdx.
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});

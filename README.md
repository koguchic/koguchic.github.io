# koguchi.dev

Personal blog — field notes on machine learning (reinforcement learning, world models, and
whatever else I'm reading). Built with **Astro + MDX + KaTeX + React islands**, deployed to
**GitHub Pages** via push-to-deploy CI.

## Stack

- **Astro** — static site generator
- **MDX** — Markdown + JSX for posts (`src/content/blog/*.mdx`)
- **KaTeX** — math via `remark-math` + `rehype-katex` (write `$inline$` / `$$display$$`)
- **React islands** — interactive components hydrated on the client (e.g. the reading tracker)

## Develop

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to ./dist
npm run preview  # preview the production build
```

## Writing a post

Add an `.mdx` file under `src/content/blog/`. Frontmatter:

```mdx
---
title: 'Post title'
description: 'One-line summary shown on the home page and in social cards.'
pubDate: 2026-07-11
tags: ['tag-one', 'tag-two']
draft: false
---

Body in Markdown. Inline math like $E = mc^2$ and display math:

$$
\int_0^1 x^2 \, dx = \tfrac{1}{3}
$$

To embed an interactive React component:

import Widget from '../../components/Widget.tsx';

<Widget client:load />
```

Set `draft: true` to keep a post out of the published list.

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and publishes to GitHub Pages. The site serves at
<https://koguchic.github.io/>. Pages source must be set to **GitHub Actions**
(Settings → Pages → Build and deployment → Source).

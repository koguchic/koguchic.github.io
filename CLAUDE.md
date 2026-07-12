# koguchic.github.io

Christian's technical blog. This repo is the **single source of truth** for the
site: posts, interactive components, and the GitHub Pages deploy all live here.
(The old `jepa-blog` repo is archived; do not edit it.)

Live site: https://koguchic.github.io

## Stack

Astro 5 (static, islands) · MDX (React components inline in prose) · KaTeX via
`remark-math` + `rehype-katex` · React 18 islands · deployed by
`.github/workflows/deploy.yml` on every push to `main` (no manual deploy step).

## Commands

```bash
npm run dev        # localhost:4321
npm run build      # static build into ./dist  — ALWAYS run before pushing
npm run preview    # serve ./dist
```

## Layout

```
src/content/blog/*.mdx      posts (content collection; frontmatter below)
src/components/viz/*.tsx    interactive React islands
src/data/*.json             exported experiment results the islands import
src/layouts/                BaseLayout (shell, theme), PostLayout (article)
src/pages/                  index + blog/[...id] routes
src/styles/global.css       design tokens; islands use the CSS-variable shim
                            (--accent, --fg, --bg-soft, --good/--bad/--draw, ...)
```

## Adding a post

Drop an `.mdx` file in `src/content/blog/`; it appears on the index automatically.
Frontmatter schema (`src/content.config.ts`):

```yaml
title: "Title Case, a Real Title"
description: "One or two sentences; shown on the card and under the H1."
pubDate: 2026-07-12
kind: "essay"          # or "reading-list"
tags: ["..."]
draft: false
```

## House rules (the voice)

- **No em-dashes.** Use commas, colons, semicolons, or separate sentences.
- Tight prose. Lead with the finding; cut meta-commentary about the essay itself.
- Prefer **glanceable visuals over tables**: paint numbers onto the object
  (boards, dumbbell dots, bars), don't make the reader scan a grid.
- Every number in a post should be traceable to code in a companion experiments
  repo, exported as JSON into `src/data/` by a script committed there.
- Interactive figures are small self-contained React islands in
  `src/components/viz/`, embedded with `client:visible`, styled only with the
  CSS variables (both themes must work).

## Gotchas

- MDX cannot pass JSX fragments as **props** to a React island (Astro wraps them
  as `astro:jsx` objects and React SSR throws). Pass strings, or keep rich
  content inside the component (see `QBoard.tsx` CALLOUTS).
- MDX is JSX: `className`, no bare `<` or stray `{` in prose, straight quotes.
- Multi-equation math: separate `$$ ... $$` blocks, one equation each, never one
  overlong line.
- Scroll-triggered animations (`useInView`) look blank in headless screenshots;
  that is expected.

## Verifying

`npm run build`, then serve `dist/` and screenshot with the playwright headless
shell (cached at `~/Library/Caches/ms-playwright/chromium_headless_shell-*`),
crop with ffmpeg, and actually look at every new figure before pushing.

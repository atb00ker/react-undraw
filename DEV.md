# Development guide

This document covers working on the `react-undraw` repository — local setup, codegen, docs site, and GitHub Pages deployment. For installing and using the published package, see [README.md](./README.md).

## Prerequisites

- [Bun](https://bun.sh/) (used for scripts and dependency management)

## Getting started

```bash
git clone https://github.com/atb00ker/react-undraw.git
cd react-undraw
bun install
bun run generate   # required before build, typecheck, or docs
```

> **Note:** `src/generated/` is gitignored. Always run `bun run generate` before building, typechecking, or starting the docs site.

## Commands

From the repository root:

```bash
# Generate React components from SVGs (1705 files → src/generated/)
bun run generate

# Build the publishable library (dist/)
bun run build

# Dev server for the docs gallery (local)
bun run docs:dev

# Production build for GitHub Pages (outputs docs/)
bun run docs:build:pages

# Preview the production docs build locally
bun run docs:preview

# Typecheck generated output
bun run typecheck

# Typecheck + build in one step
bun run check

# Remove build output (dist/, docs/) or generated components
bun run clean
bun run clean:generated
bun run clean:all
```

For local docs development, omit `DOCS_BASE_PATH` (defaults to `/`). For production builds matching GitHub Pages, use `docs:build:pages` which sets `DOCS_BASE_PATH=/react-undraw/`.

## GitHub Pages deployment

1. Commit and push this repository (includes `.github/workflows/github-pages.yml`).
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` — the workflow runs `bun run docs:build` and deploys `docs/`.
4. The site is published at `https://atb00ker.github.io/react-undraw/`.

## Regenerating components

SVG sources live in `src/images/illustrations/`. After adding or updating SVGs:

```bash
bun run generate
bun run build
```

The generator (`scripts/generate.ts`, `scripts/converter.ts`):

1. Extracts `viewBox` from the root `<svg>` and renders inner content inside `createIllustration`'s wrapper (sizing via `width` / `height` props, defaults `100%` / `auto`)
2. Converts SVG attributes to JSX
3. Replaces `#2563eb` fills/strokes with `{primaryColor}`
4. Emits one component per file in `src/generated/`

Search keywords are built from each slug and expanded with aliases in `scripts/search-synonyms.ts`. Per-slug phrases can be added in `scripts/search-overrides.json`.

## Releasing

Release instructions (version bump, tagging, GitHub release, smoke test) live in the comment block at the top of [`scripts/prepare.ts`](./scripts/prepare.ts). That file is the single source of truth for publishing.

## Project structure

```
scripts/generate.ts       # Codegen entrypoint
scripts/prepare.ts        # Build-on-install + publishing guide (see comment block)
scripts/converter.ts      # SVG → JSX helpers
scripts/search-synonyms.ts
scripts/search-overrides.json
src/createIllustration.tsx
src/UndrawIllustration.tsx
src/generated/            # Generated components (gitignored)
src/docs/                 # Docs gallery source (Rsbuild entry)
public/                   # Static assets copied into docs build (illustrations.json, llms.txt)
docs/                     # Built static site for GitHub Pages (gitignored except README)
.github/workflows/        # GitHub Pages deploy
```

## License

MIT

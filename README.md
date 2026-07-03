<div align="center">

<img src="assets/logo.svg" alt="React Undraw" width="200" />

# React Undraw

**Configurable React components for [Undraw](https://undraw.co/) illustrations.**

Import illustrations by name, customize the accent color (`#2563eb` by default), and tree-shake unused SVGs in your app.

[![CI](https://img.shields.io/github/actions/workflow/status/atb00ker/react-undraw/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/atb00ker/react-undraw/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/atb00ker/react-undraw?style=flat-square)](LICENSE)
[![Illustrations](https://img.shields.io/badge/illustrations-1705-2563eb?style=flat-square)](https://atb00ker.github.io/react-undraw/)
[![React](https://img.shields.io/badge/React-%3E%3D18-61dafb?style=flat-square&logo=react&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](package.json)
[![npm](https://img.shields.io/badge/npm-not%20published-lightgrey?style=flat-square&logo=npm)](https://github.com/atb00ker/react-undraw)

</div>

---

> [!CAUTION]
> **Not published to npm/JSR.** After building this project, I realised that redistribution might not be allowed by [Undraw's license](https://undraw.co/license). Even though I am not an artist and this is not a competing service, based on my reading, it sounds like this will be in a gray area. Hence, I am not publishing this package to npm/jsr.
>
> At this stage, I'll keep the repository for personal use — please do not open issues to ask for redistribution or feature requests.
>
> **Browse illustrations:** [undraw.co](https://undraw.co/)

## Contents

- [Features](#features)
- [Get started](#get-started)
- [Quick start](#quick-start)
- [API](#api)
- [For AI agents](#for-ai-agents)
- [Development](#development)
- [License](#license)

## Features

- **1705 illustrations** as typed React components
- **`primaryColor` prop** to recolor the Undraw accent blue
- **Named imports** for static usage and **`<UndrawIllustration name="..." />`** for lazy dynamic lookup
- **Searchable online gallery** with deep links (`?q=…`, `?illustration=…`)
- **Machine-readable catalog** (`illustrations.json`, `metadata.json`) for search UIs and tooling

## Get started

1. **[Live gallery](https://atb00ker.github.io/react-undraw/)** — browse illustrations, preview accent colors, and copy import snippets
2. **[illustrations.json](https://atb00ker.github.io/react-undraw/illustrations.json)** — full machine-readable catalog with import snippets
3. **[DEV.md](./DEV.md)** — clone, generate, and build locally (for contributors and personal use)

## Quick start

Snippets below match what the gallery copies for each illustration.

### Named component (tree-shakeable)

```tsx
import { ADayOff } from "react-undraw";

export function Hero() {
  return <ADayOff primaryColor="#e11d48" height={280} title="A day off" />;
}
```

### Dynamic lookup (lazy-loaded)

```tsx
import { UndrawIllustration } from "react-undraw";

export function Hero() {
  return (
    <UndrawIllustration
      name="a-day-off"
      primaryColor="#e11d48"
      height={280}
      title="A day off"
      fallback={<div>Loading illustration…</div>}
    />
  );
}
```

## API

### `UndrawProps`

Shared by every illustration component and `UndrawIllustration`.

| Prop           | Type                      | Default   | Description                                                        |
| -------------- | ------------------------- | --------- | ------------------------------------------------------------------ |
| `primaryColor` | `string`                  | `#2563eb` | Accent color applied wherever the SVG uses Undraw blue             |
| `title`        | `string`                  | —         | Accessible label; sets `role="img"` and renders `<title>`          |
| `width`        | `string \| number`        | `100%`    | SVG width                                                          |
| `height`       | `string \| number`        | `auto`    | SVG height                                                         |
| `...rest`      | `SVGProps<SVGSVGElement>` | —         | Passed to the root `<svg>` (`className`, `style`, `onClick`, etc.) |

### `UndrawIllustration`

| Prop       | Type               | Description                              |
| ---------- | ------------------ | ---------------------------------------- |
| `name`     | `IllustrationName` | Kebab-case slug, e.g. `"a-day-off"`      |
| `fallback` | `ReactNode`        | Shown while the illustration chunk loads |

### `illustrationMetadata`

Array of `{ name, componentName, title, keywords, searchText }` for building search UIs in your app. Import from the package:

```ts
import { illustrationMetadata } from "react-undraw";
```

For the full JSON catalog (including import snippets), fetch [illustrations.json](https://atb00ker.github.io/react-undraw/illustrations.json) from the docs site, or use `dist/metadata.json` after a local build (see [DEV.md](./DEV.md)).

## For AI agents

Illustrations are discoverable via a static JSON catalog — no need to scrape the React gallery.

**Docs site:**

- [llms.txt](https://atb00ker.github.io/react-undraw/llms.txt) — entrypoint and usage instructions
- [illustrations.json](https://atb00ker.github.io/react-undraw/illustrations.json) — full catalog with import snippets
- [illustrations.index.json](https://atb00ker.github.io/react-undraw/illustrations.index.json) — compact search index

**Local build** (after `bun run build`):

```bash
cat dist/metadata.json | jq '.illustrations[] | select(.searchText | test("breakfast"))'
```

Or import the JSON directly:

```ts
import catalog from "react-undraw/metadata.json";
```

**Workflow:**

1. Fetch [illustrations.json](https://atb00ker.github.io/react-undraw/illustrations.json) from the docs site (or `dist/metadata.json` after a local build).
2. Filter entries where `searchText` matches intent (case-insensitive).
3. Use `name` for `<UndrawIllustration name="..." />` or `componentName` for named imports.
4. Optionally verify visually: `?illustration=<name>` on the [gallery](https://atb00ker.github.io/react-undraw/).

## Development

Contributing or running this repo locally? See [DEV.md](./DEV.md).

## License

[MIT](LICENSE) — project code and generated components.

Illustrations are from [Undraw](https://undraw.co/) and subject to [their license](https://undraw.co/license).

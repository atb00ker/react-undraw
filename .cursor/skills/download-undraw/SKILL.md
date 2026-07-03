---
name: download-undraw
description: Find, download, and render Undraw SVG illustrations from the react-undraw catalog. Use when the user needs Undraw art, empty-state illustrations, hero graphics, or asks to fetch, download, embed, or draw SVGs from react-undraw or atb00ker.github.io/react-undraw.
---

# Download and Draw Undraw SVGs

Machine-readable catalog for 1700+ Undraw illustrations. No npm install required to download SVG source files.

## Endpoints

| Resource                | URL                                                                |
| ----------------------- | ------------------------------------------------------------------ |
| Entrypoint              | `https://atb00ker.github.io/react-undraw/llms.txt`                 |
| Full catalog            | `https://atb00ker.github.io/react-undraw/illustrations.json`       |
| Compact index           | `https://atb00ker.github.io/react-undraw/illustrations.index.json` |
| Gallery (visual verify) | `https://atb00ker.github.io/react-undraw/?illustration={name}`     |

Fetch `llms.txt` first for a short overview, then `illustrations.json` for the full catalog.

## Workflow

```
Task Progress:
- [ ] Fetch catalog (illustrations.json)
- [ ] Match user intent against searchText / title
- [ ] Download SVG via svgUrl
- [ ] Render or embed in the target project
```

### 1. Fetch catalog

```bash
curl -sL https://atb00ker.github.io/react-undraw/illustrations.json -o /tmp/illustrations.json
```

Or read it directly with WebFetch / HTTP GET.

### 2. Pick an illustration

Search `illustrations[]` where `searchText` or `title` matches user intent (case-insensitive, substring match).

Each entry provides:

| Field           | Use                                                  |
| --------------- | ---------------------------------------------------- |
| `name`          | kebab-case slug (e.g. `add-user`)                    |
| `componentName` | PascalCase React export (e.g. `AddUser`)             |
| `searchText`    | slug tokens + keyword aliases — primary search field |
| `svgUrl`        | absolute URL — use this to download                  |
| `svgPath`       | relative path under site base                        |

**Example:** intent "new user" / "signup" → `add-user`

```json
{
  "name": "add-user",
  "searchText": "add user add-user adduser ... signup register user",
  "svgUrl": "https://atb00ker.github.io/react-undraw/illustrations/add-user.svg"
}
```

When multiple entries match, prefer the closest `searchText` hit; offer alternatives or verify visually via `?illustration={name}` on the gallery.

### 3. Download SVG

Use `svgUrl` from the matched entry:

```bash
curl -LO https://atb00ker.github.io/react-undraw/illustrations/add-user.svg
```

Or fetch programmatically and write to the project's assets directory.

**Note:** Downloaded SVGs are original Undraw source files with hardcoded `#2563eb` accent — not the configurable `{primaryColor}` React variant.

### 4. Draw / render

Pick the approach that fits the target project:

**Static file reference**

```html
<img src="/assets/add-user.svg" alt="Add user" width="400" height="300" />
```

**Inline SVG** — paste file contents into HTML/JSX for CSS styling (`fill`, `currentColor` on paths).

**React (if react-undraw is available locally)**

```tsx
import { UndrawIllustration } from "react-undraw";
<UndrawIllustration name="add-user" primaryColor="#2563eb" height={280} />;
```

**URL without download** — reference `svgUrl` directly:

```html
<img
  src="https://atb00ker.github.io/react-undraw/illustrations/add-user.svg"
  alt="Add user"
/>
```

## Search tips

- Match natural language against `searchText` (includes synonyms like "signup" → `add-user`)
- Also check `title` and `keywords` if `searchText` is inconclusive
- Slug form: kebab-case words joined by hyphens (`remote-work`, `empty-state`)
- Gallery deep link: `?q={search}` to browse matches visually

## Recoloring downloaded SVGs

Downloaded files use `#2563eb`. To recolor without react-undraw:

1. Find-replace `#2563eb` (and `#2563EB`) with the target hex in the SVG file, or
2. Use CSS `filter` on an `<img>` (approximate), or
3. Inline the SVG and set `fill` on accent paths

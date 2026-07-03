import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const rawBase = process.env.DOCS_BASE_PATH ?? "/";
const assetPrefix = rawBase === "/" ? "/" : rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const serverBase =
  assetPrefix === "/" ? "/" : assetPrefix.replace(/\/$/, "");

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/docs/index.tsx",
    },
  },
  resolve: {
    alias: {
      "react-undraw": path.join(repoRoot, "src/index.ts"),
    },
  },
  html: {
    title: "React Undraw — Illustration Gallery",
  },
  dev: {
    lazyCompilation: false,
  },
  server: {
    base: serverBase,
    port: 3100,
  },
  output: {
    assetPrefix,
    distPath: {
      root: "docs",
    },
  },
});

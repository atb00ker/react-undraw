import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  assignComponentNames,
  buildSearchText,
  expandKeywords,
  generateComponentSource,
  parseSvg,
  toDisplayTitle,
  toKeywords,
} from "./converter";

const ROOT = path.resolve(import.meta.dir, "..");
const SVG_DIR = path.join(ROOT, "src/images/illustrations");
const OUT_DIR = path.join(ROOT, "src/generated");
const PUBLIC_DIR = path.join(ROOT, "public");
const DOCS_SITE_URL = "https://atb00ker.github.io/react-undraw";
const SVG_PUBLIC_DIR = path.join(PUBLIC_DIR, "illustrations");
const SCRIPT_PATHS = [
  path.join(ROOT, "scripts/generate.ts"),
  path.join(ROOT, "scripts/converter.ts"),
  path.join(ROOT, "scripts/search-synonyms.ts"),
  path.join(ROOT, "scripts/search-overrides.json"),
];

type IllustrationMeta = {
  name: string;
  componentName: string;
  title: string;
  keywords: string[];
  searchText: string;
};

type CatalogEntry = IllustrationMeta & {
  svgPath: string;
  svgUrl: string;
  usage: {
    dynamic: string;
    named: string;
  };
};

type IllustrationCatalog = {
  version: string;
  siteUrl: string;
  count: number;
  illustrations: CatalogEntry[];
};

type IllustrationIndexEntry = {
  name: string;
  title: string;
  searchText: string;
  svgPath: string;
  svgUrl: string;
};

function toSvgPath(name: string): string {
  return `illustrations/${name}.svg`;
}

function toSvgUrl(name: string): string {
  return `${DOCS_SITE_URL}/${toSvgPath(name)}`;
}

function buildCatalogEntry(
  name: string,
  componentName: string,
  title: string,
  keywords: string[],
  searchText: string,
): CatalogEntry {
  return {
    name,
    componentName,
    title,
    keywords,
    searchText,
    svgPath: toSvgPath(name),
    svgUrl: toSvgUrl(name),
    usage: {
      dynamic: `<UndrawIllustration name="${name}" />`,
      named: `import { ${componentName} } from "react-undraw"`,
    },
  };
}

async function getMtimeMs(filePath: string): Promise<number | null> {
  try {
    const fileStat = await stat(filePath);
    return fileStat.mtimeMs;
  } catch {
    return null;
  }
}

async function getNewestMtimeMs(filePaths: string[]): Promise<number> {
  let newest = 0;

  for (const filePath of filePaths) {
    const mtime = await getMtimeMs(filePath);
    if (mtime !== null && mtime > newest) {
      newest = mtime;
    }
  }

  return newest;
}

async function scriptsAreNewerThanOutputs(
  expectedComponentFiles: string[],
): Promise<boolean> {
  const scriptMtime = await getNewestMtimeMs(SCRIPT_PATHS);
  const outputMtime = await getNewestMtimeMs(expectedComponentFiles);

  if (outputMtime === 0) {
    return true;
  }

  return scriptMtime > outputMtime;
}

async function shouldRegenerateComponent(
  svgPath: string,
  outputPath: string,
  forceRegenerate: boolean,
): Promise<boolean> {
  if (forceRegenerate) {
    return true;
  }

  const svgMtime = await getMtimeMs(svgPath);
  const outputMtime = await getMtimeMs(outputPath);

  if (svgMtime === null || outputMtime === null) {
    return true;
  }

  return svgMtime > outputMtime;
}

async function pruneOrphanedComponents(
  expectedComponentNames: Set<string>,
): Promise<number> {
  const entries = await readdir(OUT_DIR, { withFileTypes: true });
  let removed = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".tsx")) {
      continue;
    }

    const componentName = entry.name.replace(/\.tsx$/i, "");
    if (expectedComponentNames.has(componentName)) {
      continue;
    }

    await rm(path.join(OUT_DIR, entry.name));
    removed += 1;
  }

  return removed;
}

async function syncPublicSvgs(
  svgFiles: string[],
  forceRegenerate: boolean,
): Promise<{ copied: number; skipped: number; removed: number }> {
  await mkdir(SVG_PUBLIC_DIR, { recursive: true });

  const expectedNames = new Set(
    svgFiles.map((file) => file.replace(/\.svg$/i, "")),
  );
  let copied = 0;
  let skipped = 0;

  for (const file of svgFiles) {
    const sourcePath = path.join(SVG_DIR, file);
    const destPath = path.join(SVG_PUBLIC_DIR, file);
    const needsCopy = await shouldRegenerateComponent(
      sourcePath,
      destPath,
      forceRegenerate,
    );

    if (needsCopy) {
      await copyFile(sourcePath, destPath);
      copied += 1;
    } else {
      skipped += 1;
    }
  }

  const entries = await readdir(SVG_PUBLIC_DIR, { withFileTypes: true });
  let removed = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".svg")) {
      continue;
    }

    const slug = entry.name.replace(/\.svg$/i, "");
    if (expectedNames.has(slug)) {
      continue;
    }

    await rm(path.join(SVG_PUBLIC_DIR, entry.name));
    removed += 1;
  }

  return { copied, skipped, removed };
}

async function main(): Promise<void> {
  const svgFiles = (await readdir(SVG_DIR))
    .filter((file) => file.endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b));

  await mkdir(OUT_DIR, { recursive: true });

  const componentNames = assignComponentNames(svgFiles);
  const expectedComponentFiles = svgFiles.map((file) => {
    const slug = file.replace(/\.svg$/i, "");
    const componentName = componentNames.get(slug);
    if (!componentName) {
      throw new Error(`Missing component name for "${slug}".`);
    }

    return path.join(OUT_DIR, `${componentName}.tsx`);
  });

  const forceRegenerate = await scriptsAreNewerThanOutputs(
    expectedComponentFiles,
  );

  const metadata: IllustrationMeta[] = [];
  const exportLines: string[] = [];
  const lazyLines: string[] = [];
  let generated = 0;
  let skipped = 0;

  for (const file of svgFiles) {
    const slug = file.replace(/\.svg$/i, "");
    const componentName = componentNames.get(slug);
    if (!componentName) {
      throw new Error(`Missing component name for "${slug}".`);
    }

    const svgPath = path.join(SVG_DIR, file);
    const outputPath = path.join(OUT_DIR, `${componentName}.tsx`);
    const needsRegenerate = await shouldRegenerateComponent(
      svgPath,
      outputPath,
      forceRegenerate,
    );

    if (needsRegenerate) {
      const svgSource = await readFile(svgPath, "utf8");
      const { viewBox, innerJsx } = parseSvg(svgSource);
      const componentSource = generateComponentSource(
        componentName,
        slug,
        viewBox,
        innerJsx,
      );

      await writeFile(outputPath, componentSource);
      generated += 1;
    } else {
      skipped += 1;
    }

    const title = toDisplayTitle(file);
    const keywords = expandKeywords(toKeywords(file), slug);
    const searchText = buildSearchText(slug, componentName, title, keywords);

    metadata.push({
      name: slug,
      componentName,
      title,
      keywords,
      searchText,
    });
    exportLines.push(`export { ${componentName} } from "./${componentName}.js";`);
    lazyLines.push(
      `  "${slug}": () => import("./${componentName}.js").then((module) => ({ default: module.${componentName} })),`,
    );
  }

  const removed = await pruneOrphanedComponents(
    new Set([...componentNames.values()]),
  );

  await writeFile(
    path.join(OUT_DIR, "index.ts"),
    `${exportLines.join("\n")}\n`,
  );

  await writeFile(
    path.join(OUT_DIR, "metadata.ts"),
    `export const illustrationMetadata = ${JSON.stringify(metadata, null, 2)} as const;

export type IllustrationMetadata = (typeof illustrationMetadata)[number];
export type IllustrationName = IllustrationMetadata["name"];
`,
  );

  await writeFile(
    path.join(OUT_DIR, "lazy.ts"),
    `import type { ComponentType } from "react";
import type { UndrawProps } from "../types.js";

export const lazyIllustrations: Record<
  string,
  () => Promise<{ default: ComponentType<UndrawProps> }>
> = {
${lazyLines.join("\n")}
};
`,
  );

  const packageVersion = JSON.parse(
    await readFile(path.join(ROOT, "package.json"), "utf8"),
  ).version as string;

  const svgSync = await syncPublicSvgs(svgFiles, forceRegenerate);

  const catalog: IllustrationCatalog = {
    version: packageVersion,
    siteUrl: DOCS_SITE_URL,
    count: metadata.length,
    illustrations: metadata.map((entry) =>
      buildCatalogEntry(
        entry.name,
        entry.componentName,
        entry.title,
        entry.keywords,
        entry.searchText,
      ),
    ),
  };

  const indexEntries: IllustrationIndexEntry[] = metadata.map((entry) => ({
    name: entry.name,
    title: entry.title,
    searchText: entry.searchText,
    svgPath: toSvgPath(entry.name),
    svgUrl: toSvgUrl(entry.name),
  }));

  await mkdir(PUBLIC_DIR, { recursive: true });

  const catalogJson = `${JSON.stringify(catalog, null, 2)}\n`;
  await writeFile(path.join(PUBLIC_DIR, "illustrations.json"), catalogJson);
  await writeFile(
    path.join(PUBLIC_DIR, "illustrations.index.json"),
    `${JSON.stringify({ version: packageVersion, count: indexEntries.length, illustrations: indexEntries }, null, 2)}\n`,
  );

  console.log(
    `Generated ${generated}, skipped ${skipped}, removed ${removed} (${svgFiles.length} total) in ${OUT_DIR}`,
  );
  console.log(
    `Synced SVGs: copied ${svgSync.copied}, skipped ${svgSync.skipped}, removed ${svgSync.removed} in ${SVG_PUBLIC_DIR}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

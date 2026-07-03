import { KEYWORD_ALIASES } from "./search-synonyms";
import searchOverrides from "./search-overrides.json";

const KEBAB_ATTRS: Record<string, string> = {
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "color-interpolation-filters": "colorInterpolationFilters",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "flood-opacity": "floodOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "letter-spacing": "letterSpacing",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "word-spacing": "wordSpacing",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
  class: "className",
};

const PRIMARY_COLOR = "#2563eb";

export function toComponentName(filename: string): string {
  const base = filename.replace(/\.svg$/i, "");
  const name = base
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return /^\d/.test(name) ? `Undraw${name}` : name;
}

/** Assign unique PascalCase export names; disambiguate case-insensitive collisions. */
export function assignComponentNames(filenames: string[]): Map<string, string> {
  const slugToName = new Map<string, string>();
  const usedLower = new Map<string, string>();

  for (const file of [...filenames].sort((a, b) => a.localeCompare(b))) {
    const slug = file.replace(/\.svg$/i, "");
    let name = toComponentName(file);
    let lower = name.toLowerCase();

    if (usedLower.has(lower)) {
      const firstSlug = usedLower.get(lower)!;
      const keptName = slugToName.get(firstSlug)!;
      name = `Undraw${name}`;
      lower = name.toLowerCase();

      if (usedLower.has(lower)) {
        throw new Error(
          `Unable to assign a unique component name for "${slug}" ` +
            `(collides with "${firstSlug}" and "${usedLower.get(lower)}").`,
        );
      }

      console.warn(
        `Case-insensitive name collision: "${slug}" → ${name} ` +
          `("${firstSlug}" keeps ${keptName}).`,
      );
    }

    usedLower.set(lower, slug);
    slugToName.set(slug, name);
  }

  return slugToName;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

export function toDisplayTitle(filename: string): string {
  const slug = filename.replace(/\.svg$/i, "");
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toKeywords(filename: string): string[] {
  return filename
    .replace(/\.svg$/i, "")
    .split("-")
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word));
}

function dedupeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const keyword of keywords) {
    const key = keyword.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(keyword);
  }

  return result;
}

export function expandKeywords(baseKeywords: string[], slug: string): string[] {
  const expanded: string[] = [...baseKeywords];

  for (const word of baseKeywords) {
    const aliases = KEYWORD_ALIASES[word.toLowerCase()];
    if (aliases) {
      expanded.push(...aliases);
    }
  }

  for (let i = 0; i < baseKeywords.length; i++) {
    const word = baseKeywords[i];
    if (!word) {
      continue;
    }

    const aliases = KEYWORD_ALIASES[word.toLowerCase()];
    if (!aliases) {
      continue;
    }

    for (const alias of aliases) {
      expanded.push(
        baseKeywords.map((keyword, index) => (index === i ? alias : keyword)).join(" "),
      );
    }
  }

  const overrides = searchOverrides[slug as keyof typeof searchOverrides];
  if (overrides) {
    expanded.push(...overrides);
  }

  return dedupeKeywords(expanded);
}

export function buildSearchText(
  name: string,
  componentName: string,
  title: string,
  keywords: string[],
): string {
  return [title, name, componentName, ...keywords].join(" ").toLowerCase();
}

function stripNonRenderableSvg(svg: string): string {
  return svg
    .replace(/\sdata-name="[^"]*"/gi, "")
    .replace(/\sdata-name='[^']*'/gi, "")
    .replace(/<metadata>[\s\S]*?<\/metadata>/gi, "");
}

function convertAttributes(svg: string): string {
  let result = svg;

  for (const [kebab, camel] of Object.entries(KEBAB_ATTRS)) {
    const pattern = new RegExp(`(\\s)${escapeRegExp(kebab)}=`, "g");
    result = result.replace(pattern, `$1${camel}=`);
  }

  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toCamelCaseCssProperty(property: string): string {
  return property.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function parseCssStyleString(style: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const declaration of style.split(";")) {
    const trimmed = declaration.trim();
    if (!trimmed) {
      continue;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const property = toCamelCaseCssProperty(trimmed.slice(0, colonIndex).trim());
    const value = trimmed.slice(colonIndex + 1).trim();
    if (property) {
      result[property] = value;
    }
  }

  return result;
}

function styleObjectToJsx(style: Record<string, string>): string {
  const entries = Object.entries(style).map(
    ([key, value]) => `${key}: ${JSON.stringify(value)}`,
  );
  return `{{ ${entries.join(", ")} }}`;
}

function convertInlineStyles(svg: string): string {
  return svg
    .replace(/\bstyle="([^"]*)"/gi, (_match, styleValue: string) => {
      const style = parseCssStyleString(styleValue);
      if (Object.keys(style).length === 0) {
        return "";
      }
      return ` style=${styleObjectToJsx(style)}`;
    })
    .replace(/\bstyle='([^']*)'/gi, (_match, styleValue: string) => {
      const style = parseCssStyleString(styleValue);
      if (Object.keys(style).length === 0) {
        return "";
      }
      return ` style=${styleObjectToJsx(style)}`;
    });
}

/** `isolation` is valid CSS but not a React SVG element attribute in @types/react. */
function convertIsolationToStyle(svg: string): string {
  return svg.replace(
    /\bisolation=(["'])([^"']*)\1/gi,
    (_match, _quote, value: string) =>
      ` style={{ isolation: ${JSON.stringify(value)} }}`,
  );
}

function replacePrimaryColor(svg: string): string {
  return svg
    .replace(/fill="#2563eb"/gi, "fill={primaryColor}")
    .replace(/fill='#2563eb'/gi, "fill={primaryColor}")
    .replace(/stroke="#2563eb"/gi, "stroke={primaryColor}")
    .replace(/stroke='#2563eb'/gi, "stroke={primaryColor}")
    .replace(/stop-color="#2563eb"/gi, "stopColor={primaryColor}")
    .replace(/stop-color='#2563eb'/gi, "stopColor={primaryColor}");
}

export function parseSvg(svgSource: string): { viewBox: string; innerJsx: string } {
  let svg = svgSource.trim();
  svg = svg.replace(/<\?xml[^?]*\?>/gi, "");
  svg = svg.replace(/<!--[\s\S]*?-->/g, "");

  const openTagMatch = svg.match(/<svg\b([^>]*)>/i);
  if (!openTagMatch) {
    throw new Error("SVG root element not found");
  }

  const openAttrs = openTagMatch[1] ?? "";
  const viewBoxMatch = openAttrs.match(/viewBox="([^"]+)"/i);
  if (!viewBoxMatch?.[1]) {
    throw new Error("SVG viewBox attribute not found");
  }

  const viewBox = viewBoxMatch[1];
  const innerStart = (openTagMatch.index ?? 0) + openTagMatch[0].length;
  const closeIndex = svg.lastIndexOf("</svg>");
  if (closeIndex === -1) {
    throw new Error("SVG closing tag not found");
  }

  let inner = svg.slice(innerStart, closeIndex).trim();
  inner = stripNonRenderableSvg(inner);
  inner = convertAttributes(inner);
  inner = convertInlineStyles(inner);
  inner = convertIsolationToStyle(inner);
  inner = replacePrimaryColor(inner);

  return { viewBox, innerJsx: inner };
}

export function generateComponentSource(
  componentName: string,
  slug: string,
  viewBox: string,
  innerJsx: string,
): string {
  return `import { createIllustration } from "../createIllustration.js";

export const ${componentName} = createIllustration(
  "${viewBox}",
  "${slug}",
  (primaryColor) => (
    <>
${indentJsx(innerJsx, 6)}
    </>
  ),
);
`;
}

function indentJsx(content: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return content
    .split("\n")
    .map((line) => (line.length > 0 ? `${pad}${line}` : line))
    .join("\n");
}

export { PRIMARY_COLOR };

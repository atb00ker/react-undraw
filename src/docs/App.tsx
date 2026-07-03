import { useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_PRIMARY_COLOR,
  UndrawIllustration,
  illustrationMetadata,
  type IllustrationMetadata,
} from "react-undraw";

import { IllustrationCard } from "./IllustrationCard";
import { IllustrationDetail } from "./IllustrationDetail";

function matchesQuery(item: IllustrationMetadata, query: string): boolean {
  if (!query) {
    return true;
  }

  return item.searchText.includes(query);
}

function readIllustrationFromUrl(): IllustrationMetadata | null {
  const slug = new URLSearchParams(window.location.search).get("illustration");
  if (!slug) {
    return null;
  }

  return illustrationMetadata.find((item) => item.name === slug) ?? null;
}

function syncUrl(query: string, selected: IllustrationMetadata | null): void {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (selected) {
    params.set("illustration", selected.name);
  }

  const next = params.toString();
  const nextUrl = next ? `${window.location.pathname}?${next}` : window.location.pathname;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
}

export function App() {
  const [query, setQuery] = useState(() => {
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [selected, setSelected] = useState<IllustrationMetadata | null>(() =>
    readIllustrationFromUrl(),
  );
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(
    () => illustrationMetadata.filter((item) => matchesQuery(item, deferredQuery)),
    [deferredQuery],
  );

  useEffect(() => {
    syncUrl(query, selected);
  }, [query, selected]);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setSelected(readIllustrationFromUrl());
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">react-undraw</p>
          <h1>Undraw illustration gallery</h1>
          <p className="subtitle">
            Browse {illustrationMetadata.length} SVG illustrations, preview accent colors, and copy import snippets.
          </p>
        </div>

        <div className="controls">
          <label className="control">
            <span>Search</span>
            <input
              type="search"
              placeholder="e.g. breakfast, remote worker, add user"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="control">
            <span>Primary color</span>
            <div className="color-input">
              <label className="color-swatch">
                <span
                  className="color-swatch-preview"
                  style={{ backgroundColor: primaryColor }}
                  aria-hidden
                />
                <input
                  type="color"
                  className="color-swatch-input"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  aria-label="Primary color"
                />
              </label>
              <input
                type="text"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                spellCheck={false}
              />
            </div>
          </label>
        </div>
      </header>

      <p className="results-count">
        Showing {filtered.length.toLocaleString()} of {illustrationMetadata.length.toLocaleString()} illustrations
      </p>

      <main className="grid" aria-live="polite">
        {filtered.map((item) => (
          <IllustrationCard
            key={item.name}
            item={item}
            primaryColor={primaryColor}
            onSelect={() => setSelected(item)}
          />
        ))}
      </main>

      {filtered.length === 0 ? (
        <p className="empty-state">No illustrations match your search.</p>
      ) : null}

      {selected ? (
        <IllustrationDetail
          item={selected}
          primaryColor={primaryColor}
          onClose={() => setSelected(null)}
        />
      ) : null}

      <footer className="footer">
        <p>
          Preview component:{" "}
          <code>
            {"<UndrawIllustration name=\""}
            {selected?.name ?? "a-day-off"}
            {"\" primaryColor=\""}
            {primaryColor}
            {"\" />"}
          </code>
        </p>
        <div className="footer-preview" aria-hidden>
          <UndrawIllustration
            name={selected?.name ?? "a-day-off"}
            primaryColor={primaryColor}
            height={120}
          />
        </div>
      </footer>
    </div>
  );
}

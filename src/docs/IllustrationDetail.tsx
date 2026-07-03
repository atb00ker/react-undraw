import { useEffect } from "react";

import { UndrawIllustration, type IllustrationMetadata } from "react-undraw";

type IllustrationDetailProps = {
  item: IllustrationMetadata;
  primaryColor: string;
  onClose: () => void;
};

function buildNamedImport(item: IllustrationMetadata, primaryColor: string): string {
  return `import { ${item.componentName} } from "react-undraw";

export function Example() {
  return (
    <${item.componentName}
      primaryColor="${primaryColor}"
      height={240}
      title="${item.name}"
    />
  );
}`;
}

function buildDynamicImport(item: IllustrationMetadata, primaryColor: string): string {
  return `import { UndrawIllustration } from "react-undraw";

export function Example() {
  return (
    <UndrawIllustration
      name="${item.name}"
      primaryColor="${primaryColor}"
      height={240}
      title="${item.name}"
    />
  );
}`;
}

async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}

export function IllustrationDetail({
  item,
  primaryColor,
  onClose,
}: IllustrationDetailProps) {
  const namedSnippet = buildNamedImport(item, primaryColor);
  const dynamicSnippet = buildDynamicImport(item, primaryColor);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="modal"
        onClick={(event) => event.stopPropagation()}
        aria-labelledby="detail-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Illustration</p>
            <h2 id="detail-title">{item.title}</h2>
            <p className="subtitle">{item.componentName}</p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="modal-preview">
          <UndrawIllustration
            name={item.name}
            primaryColor={primaryColor}
            height={280}
            title={item.name}
          />
        </div>

        <div className="snippet-block">
          <div className="snippet-header">
            <h3>Named import</h3>
            <button
              type="button"
              className="ghost-button"
              onClick={() => void copyText(namedSnippet)}
            >
              Copy
            </button>
          </div>
          <pre>
            <code>{namedSnippet}</code>
          </pre>
        </div>

        <div className="snippet-block">
          <div className="snippet-header">
            <h3>Dynamic lookup</h3>
            <button
              type="button"
              className="ghost-button"
              onClick={() => void copyText(dynamicSnippet)}
            >
              Copy
            </button>
          </div>
          <pre>
            <code>{dynamicSnippet}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

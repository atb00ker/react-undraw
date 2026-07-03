import { lazy, Suspense, useMemo, type ReactNode } from "react";

import { lazyIllustrations } from "./generated/lazy.js";
import type { IllustrationName } from "./generated/metadata.js";
import type { UndrawProps } from "./types.js";

export type { IllustrationName };

export type UndrawIllustrationProps = UndrawProps & {
  name: IllustrationName;
  fallback?: ReactNode;
};

export function UndrawIllustration({
  name,
  fallback = null,
  ...props
}: UndrawIllustrationProps) {
  const Component = useMemo(
    () =>
      lazy(() => {
        const loader = lazyIllustrations[name];
        if (!loader) {
          return Promise.reject(
            new Error(`Unknown illustration "${name}". Run \`bun run generate\` to refresh metadata.`),
          );
        }
        return loader();
      }),
    [name],
  );

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

import type { ReactNode } from "react";

import { DEFAULT_PRIMARY_COLOR, type UndrawProps } from "./types.js";

export function createIllustration(
  viewBox: string,
  slug: string,
  render: (primaryColor: string) => ReactNode,
) {
  function Illustration({
    primaryColor = DEFAULT_PRIMARY_COLOR,
    title,
    width = "100%",
    height = "auto",
    ...rest
  }: UndrawProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={width}
        height={height}
        data-undraw={slug}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {render(primaryColor)}
      </svg>
    );
  }

  Illustration.displayName = slug;

  return Illustration;
}

import type { SVGProps } from "react";

export const DEFAULT_PRIMARY_COLOR = "#2563eb";

export type UndrawProps = {
  /** Accent color replacing the default Undraw blue (#2563eb). */
  primaryColor?: string;
  /** Accessible label. When set, the SVG is exposed as role="img". */
  title?: string;
} & SVGProps<SVGSVGElement>;

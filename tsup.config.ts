import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/types.ts",
    "src/createIllustration.tsx",
    "src/UndrawIllustration.tsx",
    "src/generated/**/*.ts",
    "src/generated/**/*.tsx",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  bundle: false,
  outDir: "dist",
  external: ["react", "react-dom"],
  tsconfig: "tsconfig.build.json",
});

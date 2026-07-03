/**
 * =============================================================================
 * react-undraw — prepare script (build-on-install + publishing guide)
 * =============================================================================
 *
 * PURPOSE
 * -------
 * This script runs automatically via the `prepare` npm lifecycle hook when the
 * package is installed as a Git dependency. It generates React components from
 * SVG sources and bundles them into `dist/`.
 *
 * When you clone this repo locally and run `bun install`, prepare is SKIPPED
 * (INIT_CWD === cwd) so CI and local dev use explicit `bun run build` instead.
 *
 *
 * TEAM INSTALL (public repo)
 * --------------------------
 * Pin to a release tag for reproducible installs:
 *
 *   bun add github:atb00ker/react-undraw#v0.1.0
 *   npm install github:atb00ker/react-undraw#v0.1.0
 *
 * Or in package.json:
 *
 *   "react-undraw": "github:atb00ker/react-undraw#v0.1.0"
 *
 * First install builds from source (~1 minute). Do NOT use --production;
 * devDependencies (tsup, typescript, tsx) are required for the build.
 *
 * Prerequisites for consumers:
 *   - Node.js >= 18
 *   - Bun optional (faster codegen); falls back to tsx if Bun is not installed
 *
 * Peer dependencies: react >= 18, react-dom >= 18
 *
 *
 * MAINTAINER RELEASE CHECKLIST
 * ----------------------------
 * 1. Bump `version` in package.json (semver).
 * 2. Run `bun run check` to verify typecheck + build.
 * 3. Commit and push to main:
 *      git add -A && git commit -m "release: vX.Y.Z"
 *      git push origin main
 * 4. Create and push an annotated tag:
 *      git tag vX.Y.Z
 *      git push origin vX.Y.Z
 * 5. Create a GitHub release:
 *      gh release create vX.Y.Z --title "vX.Y.Z" --notes "Release notes here."
 * 6. Smoke-test install in a scratch project:
 *      mkdir /tmp/react-undraw-test && cd /tmp/react-undraw-test
 *      bun init -y && bun add github:atb00ker/react-undraw#vX.Y.Z
 *      test -f node_modules/react-undraw/dist/index.js && echo OK
 *
 * Do NOT publish to npm/jsr — unDraw license prohibits redistributing
 * illustrations in packs. Git install for team use only.
 *
 * =============================================================================
 */

import { copyFile, access } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function run(command: string): void {
  console.log(`> ${command}`);
  execSync(command, { cwd: ROOT, stdio: "inherit" });
}

function hasCommand(name: string): boolean {
  try {
    execSync(`command -v ${name}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const initCwd = process.env.INIT_CWD;
  const cwd = process.cwd();

  if (initCwd && path.resolve(initCwd) === path.resolve(cwd)) {
    console.log("prepare: skipping (local repository install)");
    return;
  }

  console.log("prepare: building react-undraw from source…");

  if (hasCommand("bun")) {
    run("bun run scripts/generate.ts");
  } else if (hasCommand("tsx")) {
    run("tsx scripts/generate.ts");
  } else {
    run("npx tsx scripts/generate.ts");
  }

  if (hasCommand("npx")) {
    run("npx tsup");
  } else {
    throw new Error("prepare: npx not found — install Node.js >= 18");
  }

  const catalogPath = path.join(ROOT, "public/illustrations.json");
  const metadataPath = path.join(ROOT, "dist/metadata.json");

  try {
    await access(catalogPath);
  } catch {
    throw new Error(
      "prepare: public/illustrations.json missing — generate step failed",
    );
  }

  await copyFile(catalogPath, metadataPath);
  console.log("prepare: copied metadata.json to dist/");
  console.log("prepare: done");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

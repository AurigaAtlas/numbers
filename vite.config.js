import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

// Stamps dist/sw.js with a release version and the files to keep offline:
// the app itself and every WebP picture (old PNG sources are left out).
function offlineCache() {
  let outDir;
  return {
    name: "offline-cache",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const files = listFiles(outDir)
        .map((path) => relative(outDir, path).split("\\").join("/"))
        .filter((path) => /\.(js|css|webp|webmanifest)$/.test(path) || /^icon-|^index\.html$/.test(path))
        .filter((path) => path !== "sw.js");
      const swPath = join(outDir, "sw.js");
      const source = readFileSync(swPath, "utf8")
        .replace('const VERSION = "dev";', `const VERSION = "${Date.now().toString(36)}";`)
        .replace("const PRECACHE = [];", `const PRECACHE = ${JSON.stringify(["./", ...files])};`);
      writeFileSync(swPath, source);
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), offlineCache()]
});

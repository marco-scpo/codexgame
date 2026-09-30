import { readFile, readdir, writeFile } from "node:fs/promises";
const files = await readdir("dist/assets");
const js = await readFile(
  `dist/assets/${files.find((f) => f.endsWith(".js"))}`,
  "utf8",
);
const css = await readFile(
  `dist/assets/${files.find((f) => f.endsWith(".css"))}`,
  "utf8",
);
let html = await readFile("dist/index.html", "utf8");
html = html.replace(
  /<script[^>]*src="[^"]+"[^>]*><\/script>/,
  () =>
    `<script type="module">${js.replace(/<\/script/gi, "<\\/script")}</script>`,
);
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*>/,
  () => `<style>${css}</style>`,
);
await writeFile("game.html", html);
await writeFile("dist/game.html", html);
console.log("Standalone game ready: game.html");

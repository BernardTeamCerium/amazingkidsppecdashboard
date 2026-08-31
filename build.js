#!/usr/bin/env node
/* Inlines the board into one self-contained page.
   Output: dist/dashboard.html — a body-level fragment (title + style + markup +
   script) with no <html>/<head>/<body> wrapper, which is what the Claude
   Artifact publisher expects. Browsers render it directly as well.
   Usage: node build.js */

const fs = require("fs");
const path = require("path");

const read = (p) => fs.readFileSync(path.join(__dirname, p), "utf8");

const html = read("index.html");
const css = read("assets/css/dashboard.css");
const js = ["assets/js/model.js", "assets/js/charts.js", "assets/js/editor.js", "assets/js/app.js"]
  .map(read).join("\n\n");

const title = html.match(/<title>([^<]*)<\/title>/)[1];
const desc = html.match(/<meta name="description" content="([^"]*)"/)[1];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
  .replace(/\s*<script src="assets\/js\/[^"]+"><\/script>/g, "")
  .trim();

// The published page is a single file and its CSP blocks external images, so
// the logo has to travel with it as a data URI.
const LOGO_TYPES = { ".png": "image/png", ".svg": "image/svg+xml",
                     ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
let logoDataUri = null;
const logoRef = read("assets/js/data.js").match(/logo:\s*"([^"]+)"/);
if (logoRef) {
  const rel = logoRef[1];
  const abs = path.join(__dirname, rel);
  if (fs.existsSync(abs)) {
    const type = LOGO_TYPES[path.extname(abs).toLowerCase()];
    if (!type) throw new Error(`Unsupported logo type: ${rel}`);
    const bytes = fs.readFileSync(abs);
    logoDataUri = `data:${type};base64,${bytes.toString("base64")}`;
    console.log(`  logo inlined from ${rel} (${(bytes.length / 1024).toFixed(0)} KB)`);
  } else {
    console.log(`  no logo at ${rel} — the masthead falls back to the monogram`);
  }
}

// Each source only breaks its own container: CSS on </style>, JS on </script>.
for (const [name, src, bad] of [["css", css, /<\/style/i], ["js", js, /<\/script/i]]) {
  if (bad.test(src)) throw new Error(`Refusing to inline ${name}: it contains a closing tag that would break the page.`);
}

// The data travels as a JSON island, not as a script that assigns a global —
// that is what lets the page rewrite itself with new values when someone saves.
global.window = {};
require("./assets/js/data.js");
const data = global.window.AKP_DATA;
if (logoDataUri) data.meta.logo = logoDataUri;
const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");

const out = `<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style id="app-style">
${css}
</style>

<template id="board-template">
${body}
</template>
<div id="app"></div>

<script id="app-data" type="application/json">${dataJson}</script>
<script id="app-code">
${js}
</script>
`;

fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "dist/dashboard.html"), out);
console.log(`dist/dashboard.html — ${(out.length / 1024).toFixed(0)} KB`);

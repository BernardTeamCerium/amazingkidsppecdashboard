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
const js = ["assets/js/data.js", "assets/js/charts.js", "assets/js/app.js"].map(read).join("\n\n");

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
let jsOut = js;
const logoRef = js.match(/logo:\s*"([^"]+)"/);
if (logoRef) {
  const rel = logoRef[1];
  const abs = path.join(__dirname, rel);
  if (fs.existsSync(abs)) {
    const type = LOGO_TYPES[path.extname(abs).toLowerCase()];
    if (!type) throw new Error(`Unsupported logo type: ${rel}`);
    const bytes = fs.readFileSync(abs);
    const uri = `data:${type};base64,${bytes.toString("base64")}`;
    jsOut = js.replace(logoRef[0], `logo: "${uri}"`);
    console.log(`  logo inlined from ${rel} (${(bytes.length / 1024).toFixed(0)} KB)`);
  } else {
    jsOut = js.replace(logoRef[0], "logo: null");
    console.log(`  no logo at ${rel} — the masthead falls back to the monogram`);
  }
}

for (const [name, src] of [["css", css], ["js", jsOut]]) {
  if (/<\/(style|script)/i.test(src)) throw new Error(`Refusing to inline ${name}: it contains a closing tag that would break the page.`);
}

const out = `<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>
${css}
</style>

${body}

<script>
${jsOut}
</script>
`;

fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "dist/dashboard.html"), out);
console.log(`dist/dashboard.html — ${(out.length / 1024).toFixed(0)} KB`);

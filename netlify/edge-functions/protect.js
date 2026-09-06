/* HTTP Basic Auth in front of the whole site.
 *
 * The password lives in the site's environment (DASH_USER / DASH_PASS), never
 * in this file and never in the page. The check runs at Netlify's edge, before
 * any HTML is sent, so an unauthenticated request never receives the numbers —
 * which is the difference between this and a login screen drawn in JavaScript.
 *
 * Set the two variables in Netlify: Site configuration → Environment variables.
 */

const encoder = new TextEncoder();

/* Compare without letting response time reveal how much of the guess matched. */
function timingSafeEqual(a, b) {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  /* Fold length into the result rather than returning early on it. */
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

function challenge(message) {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Amazing Kids PPEC", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

/* Netlify.env is the documented accessor in edge functions; Deno.env is the
   same store, and reading through both means a runtime that exposes only one
   of them still finds the password. */
function env(name) {
  try {
    if (typeof Netlify !== "undefined" && Netlify.env) {
      const v = Netlify.env.get(name);
      if (v) return v;
    }
  } catch { /* fall through */ }
  try {
    if (typeof Deno !== "undefined" && Deno.env) return Deno.env.get(name) || "";
  } catch { /* fall through */ }
  return "";
}

export default async (request, context) => {
  /* Trailing whitespace is easy to paste into a dashboard field and impossible
     to see there, so it never becomes part of the secret. */
  const user = env("DASH_USER").trim();
  const pass = env("DASH_PASS").trim();

  /* Missing credentials must fail closed. Serving the board because the site
     was deployed without its environment set is the one failure that matters.
     Name which variable is missing — that is a deployment fact, not a secret,
     and without it the only debugging move is guessing. */
  if (!user || !pass) {
    const missing = [!user && "DASH_USER", !pass && "DASH_PASS"].filter(Boolean);
    return new Response(
      [
        "This site is not configured yet.",
        "",
        "Not visible to the edge function: " + missing.join(" and ") + ".",
        (user || pass)
          ? "The other one is visible, so the variables are reaching this function — check the name of the missing one for a typo."
          : "Neither is visible. In Netlify: Site configuration → Environment variables.",
        "",
        "Three things to check, in the order they usually go wrong:",
        "  1. Scopes — a variable scoped only to Builds is invisible here. Set it to All scopes.",
        "  2. Deploy contexts — set the value for all contexts, or at least the one you are viewing.",
        "  3. Redeploy after changing either. Deploys → Trigger deploy → Clear cache and deploy site.",
        "",
        "Deploy context of this request: " + (context && context.deploy ? (context.deploy.context || "unknown") : "unknown") + "."
      ].join("\n"),
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) return challenge("Authentication required.");

  let decoded;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return challenge("Authentication required.");
  }

  /* Only the first colon separates the pair; a password may contain colons. */
  const split = decoded.indexOf(":");
  const gotUser = split === -1 ? decoded : decoded.slice(0, split);
  const gotPass = split === -1 ? "" : decoded.slice(split + 1);

  /* Both comparisons always run, so a wrong username costs the same as a
     wrong password. */
  const okUser = timingSafeEqual(gotUser, user);
  const okPass = timingSafeEqual(gotPass, pass);
  if (!okUser || !okPass) return challenge("Not authorized.");

  const response = await context.next();
  /* A shared cache holding an authenticated page would hand it to the next
     visitor. Belt and braces with the header rule in netlify.toml. */
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
};

export const config = { path: "/*" };

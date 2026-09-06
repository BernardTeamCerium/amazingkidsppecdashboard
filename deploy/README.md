# Putting the board on a password-protected subdomain

The board is one static HTML file, so hosting it is cheap and quick. The part
that matters is *where the password check happens*.

**A password screen drawn by the page is not protection.** If the browser has
the page, it has the numbers; anyone can read them with View Source no matter
what the screen asks for. Real protection means the server refuses to send the
page until the visitor authenticates. Both routes below do that, and neither
puts a password anywhere in this repository.

Pick one:

| | Netlify + Basic Auth | Cloudflare Pages + Access |
|---|---|---|
| Login | one shared username + password | each person's own email, one-time code |
| Setup time | ~10 minutes | ~20 minutes |
| Revoking one person | change the shared password for everyone | remove their email |
| Cost | free tier | free tier (up to 50 users) |
| Audit trail | none | who logged in, and when |

Start with Netlify if you want it live today. Move to Cloudflare Access when
more than two or three people need it, or when you want to be able to cut off
one person without telling everyone else a new password.

---

## Route A — Netlify with a shared password

Everything Netlify needs is already committed: `netlify.toml` and
`netlify/edge-functions/protect.js`. The gate runs at Netlify's edge, before
any HTML is sent.

1. **Connect the repo.** At app.netlify.com → *Add new site* → *Import an
   existing project* → GitHub → this repository. Netlify reads `netlify.toml`,
   so the build command (`node build.js`) and publish directory (`site`) fill
   themselves in. Deploy.

2. **Set the password.** *Site configuration* → *Environment variables* → add
   two:

   | Key | Value |
   |---|---|
   | `DASH_USER` | whatever username you want, e.g. `amazingkids` |
   | `DASH_PASS` | a long passphrase — four or five unrelated words beats a short scramble |

   Then *Deploys* → *Trigger deploy* → *Clear cache and deploy site*, so the
   edge function picks the variables up.

   Until both variables exist the site returns "not configured yet" rather than
   the board. That is deliberate: a missing password must never mean an open
   site.

3. **Check the gate.** Open the `*.netlify.app` URL in a private window. You
   should get a browser username/password prompt, and nothing behind it until
   you answer. If you see the board with no prompt, stop — step 2 did not take
   effect.

4. **Point the subdomain.** *Domain management* → *Add a domain* → e.g.
   `board.amazingkidsppec.com`. Netlify shows the DNS record to create; at your
   domain registrar add that record for the `board` host. Certificates are
   issued automatically once DNS resolves — usually minutes, occasionally an
   hour.

Changing the password later is one edit to `DASH_PASS` plus a redeploy.

## Route B — Cloudflare Pages with per-person logins

Same static site; the gate is Cloudflare Access instead of a shared password,
so each person signs in as themselves.

1. **Create the Pages project.** Cloudflare dashboard → *Workers & Pages* →
   *Create* → *Pages* → connect this GitHub repository.
   Build command: `node build.js`. Build output directory: `site`. Deploy.

2. **Attach the subdomain.** Pages project → *Custom domains* → add
   `board.amazingkidsppec.com`. If the domain's DNS is already on Cloudflare
   the record is created for you.

3. **Put Access in front of it.** *Zero Trust* → *Access* → *Applications* →
   *Add an application* → *Self-hosted*. Application domain:
   `board.amazingkidsppec.com`. Add a policy: action *Allow*, include
   *Emails* → list each owner's address (or *Emails ending in* your company
   domain). Save.

   Now anyone hitting the subdomain gets Cloudflare's sign-in first, receives a
   one-time code by email, and only then reaches the page. Adding or removing
   someone is one line in that policy.

4. **Check it** in a private window, from an address that is *not* on the list —
   you should be refused.

---

## Two things to know before you share the link

**The hosted copy is read-only.** The in-page editor writes a new version of
the page through the Claude artifact runtime, which exists only on the Claude
board link. On Netlify or Cloudflare the Save button hides itself and the
drawer says so. Edits still recalculate live in your own tab so you can try a
scenario, but they vanish on reload.

So there are two surfaces, on purpose:

- **the Claude link** — where you edit, and where a save becomes the new version;
- **the subdomain** — the stable address you hand to owners and lenders.

To move an edit onto the subdomain: change `assets/js/data.js` (it holds only
observed inputs — everything else is calculated from it), commit, push. Both
hosts rebuild on push, so the subdomain updates within a minute or two.

**Decide whether the owner split should be visible.** The distribution card
names each member and their percentage. Set `distributions.showMembers` to
`false` in `data.js` if the subdomain will be seen by anyone outside the six
owners; the totals for savings, debt paydown and distributions still show.

## Deploying without connecting GitHub

If you would rather not link the repository:

```bash
npm install -g netlify-cli
node build.js
netlify deploy --prod
```

Run it from the repository root, not from `site/` — the edge function and
`netlify.toml` live at the root and the password gate travels with them.
Set `DASH_USER` and `DASH_PASS` in the Netlify UI as in step 2 either way.

## What is in the build

`node build.js` writes both outputs from the same sources:

```
dist/dashboard.html   the Claude artifact fragment (the publisher supplies <html>/<head>)
site/index.html       a complete standalone document, for a web server
site/robots.txt       Disallow: /
site/_headers         noindex, nosniff, no-referrer
```

`site/` is generated. Never edit it by hand — edit `index.html`,
`assets/`, or `data.js` and rebuild.

/* =============================================================================
   The edit panel. Changing a field updates the inputs and re-renders the whole
   board immediately, so every calculated figure moves with it. Save publishes a
   new version of the page, which is what every viewer then opens.

   Saving needs the artifact runtime, so it works on the published board and not
   on a file opened from disk — there, edits are live but local to the tab.
   ========================================================================== */

const Editor = (() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* -- what is editable, in the order it appears in the panel ------------- */
  const SECTIONS = [
    { title: "The roster today", blocks: [{ fields: [
      ["roster.enrolled", "Children enrolled", "int"],
      ["roster.medicaidApproved", "Approved through Medicaid", "int"],
      ["roster.pending", "Pending enrollment", "int"]
    ] }] },

    { title: "Targets and the day rate", blocks: [{ fields: [
      ["targets.enrollment", "Enrollment goal", "int"],
      ["targets.monthlyCost", "Monthly cost target", "usd"],
      ["perDiem", "Day rate, per child per day", "usd2"]
    ] }] },

    { title: "Projection", blocks: [
      { fields: [["projection.attendanceRate", "Attendance rate assumed", "pct"]] },
      { rows: { path: "projection.months", label: "full",
        cols: [["weekdays", "Weekdays", "int"], ["closures", "Closed", "int"], ["enrolled", "Enrolled", "int"]] } }
    ] },

    { title: "Monthly actuals", blocks: [
      { rows: { path: "months", label: "full", cols: [
        ["enrolled", "Attended", "int"], ["onReport", "On report", "int"],
        ["opDays", "Op days", "int"], ["childDays", "Child-days", "int"],
        ["revenue", "Revenue", "usd2"], ["cost", "Cost", "usd2"]] } }
    ] },

    { title: "Distributions and savings", blocks: [
      { fields: [
        ["distributions.reserveTarget", "Savings target", "usd"],
        ["distributions.assumedMonthlyCost", "Assumed monthly cost", "usd2"],
        ["distributions.startingReserve", "Reserve in the bank today", "usd2"],
        ["distributions.startingDebt", "Revolving debt outstanding", "usd2"],
        ["distributions.ongoingSavings", "Of net after the target, to savings", "pct"],
        ["distributions.split.debt", "Of what is left, to debt", "pct"],
        ["distributions.split.owners", "Of what is left, to distributions", "pct"]
      ] }
    ] },

    { title: "Staffing", blocks: [
      { rows: { path: "staffing.roles", label: "role", cols: [["count", "Staff", "int"]] } },
      { fields: [["staffing.dailyModel.supports", "The model supports this many children", "int"]] },
      { rows: { path: "staffing.dailyModel.lines", label: "role",
        cols: [["perDay", "On the floor daily", "int"], ["roster", "On the roster", "int"]] } }
    ] },

    { title: "Ventures — Transportation", blocks: [
      { rows: { path: "ventures.list.0.lines", label: "name", cols: [
        ["children", "Children", "int"], ["unitsPerPeriod", "Units", "num"],
        ["periodsPerYear", "Periods/yr", "int"], ["rate", "Rate", "usd2"]] } }
    ] },

    { title: "Ventures — Education", blocks: [
      { rows: { path: "ventures.list.1.lines", label: "name", cols: [
        ["children", "Children 4+", "int"], ["rate", "Annual rate", "usd2"]] } }
    ] },

    { title: "Ventures — Therapy", blocks: [
      { rows: { path: "ventures.list.2.lines", label: "name", cols: [
        ["children", "Children", "int"], ["unitsPerPeriod", "Sessions/wk", "num"],
        ["rate", "Rate", "usd2"]] } }
    ] },

    { title: "Cash", blocks: [
      { rows: { path: "cash.lines", label: "name", cols: [["value", "Balance", "usd2"]] } },
      { fields: [["cash.ytdNet", "Net income, year to date", "usd2"]] }
    ] },

    { title: "Marketing spend", blocks: [
      { rows: { path: "adSpend.months", label: "label", cols: [["value", "Spend", "usd2"]] } },
      { fields: [["adSpend.ytdPrior", "Same period last year", "usd2"]] }
    ] }
  ];

  const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, path, v) => {
    const keys = path.split("."), last = keys.pop();
    const t = keys.reduce((a, k) => (a == null ? a : a[k]), o);
    if (t) t[last] = v;
  };
  const toInput = (v, type) => {
    if (v === null || v === undefined) return "";
    return type === "pct" ? +(v * 100).toFixed(2) : v;
  };
  const fromInput = (s, type) => {
    if (s === "") return null;
    const n = Number(s);
    if (!isFinite(n)) return null;
    return type === "pct" ? n / 100 : type === "int" ? Math.round(n) : n;
  };
  const unit = (type) => (type === "pct" ? "%" : type === "usd" || type === "usd2" ? "$" : "");
  const step = (type) => (type === "int" ? "1" : type === "pct" ? "1" : "0.01");

  let dirty = false, publisher = null, publisherResolved = false;

  function field(path, label, type) {
    const v = toInput(get(window.AKP_STATE.raw, path), type);
    return `<label class="ed-field">
      <span class="ed-label">${esc(label)}${unit(type) ? ` <em>${unit(type)}</em>` : ""}</span>
      <input type="number" step="${step(type)}" value="${v === "" ? "" : esc(v)}"
             data-path="${esc(path)}" data-type="${type}" inputmode="decimal">
    </label>`;
  }

  function rowsBlock(spec) {
    const list = get(window.AKP_STATE.raw, spec.path) || [];
    return `<div class="ed-rows"><table class="ed-table">
      <thead><tr><th></th>${spec.cols.map((c) => `<th>${esc(c[1])}</th>`).join("")}</tr></thead>
      <tbody>${list.map((row, i) => `<tr>
        <th scope="row">${esc(row[spec.label])}</th>
        ${spec.cols.map(([key, , type]) => {
          const v = toInput(row[key], type);
          return `<td><input type="number" step="${step(type)}" value="${v === "" ? "" : esc(v)}"
                    data-path="${esc(spec.path)}.${i}.${esc(key)}" data-type="${type}"
                    aria-label="${esc(row[spec.label])} ${esc(key)}" inputmode="decimal"></td>`;
        }).join("")}
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function build() {
    $("#ed-body").innerHTML = SECTIONS.map((s, i) => `
      <details class="ed-section"${i === 0 ? " open" : ""}>
        <summary>${esc(s.title)}</summary>
        ${s.blocks.map((b) => b.fields
          ? `<div class="ed-grid">${b.fields.map((f) => field(f[0], f[1], f[2])).join("")}</div>`
          : rowsBlock(b.rows)).join("")}
      </details>`).join("");

    $$("#ed-body input").forEach((input) => {
      input.addEventListener("input", () => {
        set(window.AKP_STATE.raw, input.dataset.path, fromInput(input.value, input.dataset.type));
        dirty = true;
        window.AKP_RENDER();
        status(unsavedMessage(), "warning");
        checkSplit();
      });
    });
    checkSplit();
  }

  // Debt and distributions split what is left after savings; over 100% would be
  // spending the same money twice, so say so rather than producing nonsense.
  function checkSplit() {
    const d = get(window.AKP_STATE.raw, "distributions.split");
    const warn = $("#ed-split-warning");
    if (!d || !warn) return;
    const total = (d.debt || 0) + (d.owners || 0);
    if (total > 1.0001) {
      warn.hidden = false;
      warn.textContent = `Debt and distributions add to ${Math.round(total * 100)}% of what is left after savings. Over 100% is spending the same money twice.`;
    } else if (total < 0.9999) {
      warn.hidden = false;
      warn.textContent = `Debt and distributions add to ${Math.round(total * 100)}% — the other ${Math.round((1 - total) * 100)}% stays in the operating account.`;
    } else warn.hidden = true;
  }

  const unsavedMessage = () => (publisherResolved && publisher
    ? "Unsaved — the board is showing your changes; Save publishes them for everyone."
    : "Unsaved — changes are live in this tab only.");

  function status(text, state = "") {
    const el = $("#ed-status");
    el.textContent = text;
    el.className = "ed-status" + (state ? " " + state : "");
  }

  /* -- rebuilding the page ------------------------------------------------ */
  // Assembled from the page's own static parts — the stylesheet, the pristine
  // markup template and the code — never from the live DOM, which by now is
  // full of rendered charts.
  function buildDocument(raw) {
    const style = document.getElementById("app-style");
    const code = document.getElementById("app-code");
    const tpl = document.getElementById("board-template");
    if (!style || !code || !tpl) return null;
    const json = JSON.stringify(raw).replace(/</g, "\\u003c");
    const fonts = $$('link[rel="stylesheet"], link[rel="preconnect"]')
      .map((l) => l.outerHTML).join("\n");
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(document.title)}</title>
${fonts}
<style id="app-style">
${style.textContent}
</style>
</head>
<body>
<template id="board-template">${tpl.innerHTML}</template>
<div id="app"></div>
<script id="app-data" type="application/json">${json}<\/script>
<script id="app-code">
${code.textContent}
<\/script>
</body>
</html>`;
  }

  async function save() {
    if (!publisher) { status("Saving is only available on the published board.", "warning"); return; }
    const doc = buildDocument(window.AKP_STATE.raw);
    if (!doc) { status("This copy cannot rebuild itself — publish it first.", "warning"); return; }
    status("Saving…");
    $("#ed-save").disabled = true;
    try {
      await publisher.publish(doc);
      dirty = false;
      status("Saved. Every open view reloads to this version.", "good");
    } catch (e) {
      const code = (e && e.code) || "";
      if (code === "conflict") status("Someone saved first. Reload to see their version, then redo your change.", "warning");
      else if (code === "not_writer" || code === "not_granted") status("You have view-only access to this board.", "warning");
      else status("Save failed: " + (e && e.message ? e.message : "unknown error"), "critical");
    } finally {
      $("#ed-save").disabled = false;
    }
  }

  function open() { document.body.classList.add("ed-open"); $("#editor").hidden = false; build(); status(dirty ? unsavedMessage() : "Type a number and the whole board recalculates."); $("#ed-close").focus(); }
  function close() { document.body.classList.remove("ed-open"); $("#editor").hidden = true; $("#edit-toggle").focus(); }

  function init() {
    const btn = $("#edit-toggle");
    if (!btn) return;
    btn.hidden = false;
    btn.addEventListener("click", () => (document.body.classList.contains("ed-open") ? close() : open()));
    $("#ed-close").addEventListener("click", close);
    $("#ed-save").addEventListener("click", save);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("ed-open")) close();
    });
    window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

    // The runtime answers later, never in this first run.
    if (typeof claude !== "undefined" && claude && typeof claude.use === "function") {
      claude.use("artifact").then((ns) => {
        publisher = ns || null; publisherResolved = true;
        $("#ed-save").hidden = !publisher;
        if (!publisher) $("#ed-local").hidden = false;
      }).catch(() => { publisherResolved = true; $("#ed-local").hidden = false; });
    } else {
      publisherResolved = true;
      $("#ed-save").hidden = true;
      $("#ed-local").hidden = false;
    }
  }

  // buildDocument is exposed so the round trip can be tested without publishing.
  return { init, buildDocument };
})();

window.Editor = Editor;

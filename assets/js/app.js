/* =============================================================================
   Amazing Kids PPEC — Operations Board
   Renders the board from the computed model, and — when the page is running as
   a published Artifact — lets an editor change the inputs and save a new
   version that everyone sees.
   ========================================================================== */

(() => {
  "use strict";

  /* Data comes from the JSON island in the published page, or from data.js in
     the working copy. RAW is the inputs; M is everything calculated from them. */
  const island = document.getElementById("app-data");
  let RAW = island ? JSON.parse(island.textContent) : window.AKP_DATA;
  let M = Model.build(RAW);

  const F = Charts.fmt;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const have = (v) => {
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  };
  let AWAITING = [];
  function need(cardId, label, ...values) {
    if (values.every(have)) return true;
    const card = document.getElementById(cardId);
    if (card) card.hidden = true;
    if (label && !AWAITING.includes(label)) AWAITING.push(label);
    return false;
  }

  const AS_OF = new Date("2026-08-31T00:00:00");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chip = (text, state = "", plain = false) =>
    `<span class="chip ${state}${plain ? " plain" : ""}">${esc(text)}</span>`;
  const signed = (v, d = 1) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(d);
  const signedUsd = (v) => (v >= 0 ? "+" : "−") + F.usd(Math.abs(v));
  const pctDelta = (now, was) => (was ? signed(((now - was) / Math.abs(was)) * 100, 0) + "%" : "—");
  const shortDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  const stats = (items) => items.map((s) =>
    `<div class="stat"><span class="v num">${esc(s.v)}</span><span class="k">${esc(s.k)}</span></div>`).join("");
  const usd2 = (v) => "$" + v.toFixed(2);

  function twin(node, headers, rows) {
    $$(".table-wrap", node).forEach((n) => n.remove());
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    wrap.innerHTML =
      `<table class="data"><thead><tr>${headers
        .map((h, i) => `<th${i ? ' class="n"' : ""}>${esc(h)}</th>`).join("")}</tr></thead>` +
      `<tbody>${rows.map((r) => `<tr>${r
        .map((c, i) => `<td${i ? ' class="n"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    node.appendChild(wrap);
  }

  /* ======================= Lead band ==================================== */
  function tiles() {
    const t = [], r = M.roster, tg = RAW.targets, l = M.latest, pr = M.prior,
          lm = M.latestMoney, pm = M.priorMoney, p = M.projection;
    if (r) {
      t.push({ label: "Enrolled now", v: F.int(r.enrolled),
        sub: `current roster · ${l ? l.enrolled + " attended in " + l.label : "—"}`,
        delta: l ? `${signed(r.enrolled - l.enrolled, 0)} vs. ${l.label}` : "",
        good: l ? r.enrolled >= l.enrolled : true,
        target: tg ? `${tg.enrollment} by ${tg.enrollmentHorizon.split("–").pop()}` : "—",
        state: !tg || r.enrolled >= tg.enrollment ? "good" : "warning" });
      t.push({ label: "Medicaid approved", v: F.int(r.medicaidApproved),
        sub: `of ${r.enrolled} enrolled · ${r.awaitingApproval} awaiting approval`,
        delta: `${F.pct0(r.approvedShare)} of the roster`, good: r.awaitingApproval === 0,
        target: "—", state: r.awaitingApproval === 0 ? "good" : "warning" });
      t.push({ label: "Pending enrollment", v: F.int(r.pending),
        sub: p ? `assumed to start in ${p.pendingStartLabel}` : "not yet started",
        delta: p && p.pendingValue ? `+${F.usdk(p.pendingValue)} if all start` : "",
        good: true, target: "—", state: "good" });
    }
    if (l) {
      t.push({ label: "Attendance rate", v: F.pct1(l.attendance),
        sub: `${l.label} · daily census ÷ enrolled`,
        delta: pr ? `${signed((l.attendance - pr.attendance) * 100)} pts vs. ${pr.label}` : "",
        good: pr ? l.attendance >= pr.attendance : true,
        target: p ? F.pct0(p.attendanceRate) + " assumed" : "—", state: "" });
      t.push({ label: "Child-days delivered", v: F.int(l.childDays),
        sub: `${l.label} · the billable unit`,
        delta: pr ? `${signed(l.childDays - pr.childDays, 0)} vs. ${pr.label}` : "",
        good: pr ? l.childDays >= pr.childDays : true, target: "—",
        state: pr && l.childDays < pr.childDays ? "warning" : "" });
    }
    if (lm) {
      t.push({ label: "Revenue", v: F.usd(lm.revenue), sub: `${lm.label} · cash basis`,
        delta: pm ? `${pctDelta(lm.revenue, pm.revenue)} vs. ${pm.label}` : "",
        good: pm ? lm.revenue >= pm.revenue : true, target: "—", state: "" });
      t.push({ label: "Operating cost", v: F.usd(lm.cost), sub: `${lm.label} · total spend`,
        delta: pm ? `${pctDelta(lm.cost, pm.cost)} vs. ${pm.label}` : "",
        good: pm ? lm.cost <= pm.cost : true,
        target: RAW.targets ? "≤ " + F.usdk(RAW.targets.monthlyCost) : "—",
        state: RAW.targets && lm.cost > RAW.targets.monthlyCost ? "critical" : "good" });
      t.push({ label: "Net income", v: F.usd(lm.net),
        sub: `${lm.label} · ${F.pct1(lm.margin)} margin`,
        delta: pm ? `${pctDelta(lm.net, pm.net)} vs. ${pm.label}` : "",
        good: pm ? lm.net >= pm.net : true, target: "—",
        state: lm.net < 0 ? "critical" : lm.margin < 0.10 ? "warning" : "good" });
    }
    if (M.cash) {
      const prior = M.cash.lines.find((x) => x.value > 0);
      t.push({ label: "Cash in bank", v: F.usd(M.cash.inBank), sub: `as of ${M.cash.asOf}`,
        delta: prior && prior.prior ? `${signedUsd(M.cash.inBank - prior.prior)} vs. ${M.cash.priorLabel}` : "",
        good: true, target: "—", state: "good" });
    }
    if (p) {
      t.push({ label: "Operating days left", v: F.int(p.totalOpDays),
        sub: "after assumed closures", delta: `of ${p.totalWeekdays} weekdays`, good: true,
        target: "—", state: "" });
      t.push({ label: "Projected revenue", v: F.usd(p.totalRevenue),
        sub: `at ${F.pct0(p.attendanceRate)} attendance`, delta: `${usd2(RAW.perDiem)} per child-day`,
        good: true, target: "—", state: "good" });
    }
    return t;
  }

  function renderLead() {
    const lead = $("#lead");
    const l = M.latest;
    if (!l) { lead.hidden = true; return; }
    lead.hidden = false;
    const spark = M.months.map((x) => x.adc);
    lead.innerHTML =
      `<article class="card hero-card">
         <div class="card-head"><div class="titles">
           <div class="eyebrow">${esc(l.full)}</div>
           <h3>Average daily census</h3>
         </div></div>
         <div class="hero-figure">${l.adc.toFixed(1)}<span class="unit">children/day</span></div>
         <div class="hero-row">
           <span class="delta ${M.prior && l.adc >= M.prior.adc ? "up" : "down"}">${
             M.prior ? signed(l.adc - M.prior.adc, 2) + " vs. " + M.prior.label : ""}</span>
           ${RAW.targets ? chip("Target " + RAW.targets.enrollment, "", true) : ""}
         </div>
         <div class="chart" id="hero-spark" style="margin:-4px 0 -2px"></div>
         <p class="card-note">${l.childDays} child-days across ${l.opDays} operating days.
           ${l.enrolled} children attended at least once; ${l.dormant} more sit on the report with
           no attendance.</p>
       </article>` +
      tiles().map((k) =>
        `<article class="card tile"${k.state ? ` data-state="${k.state}"` : ""}>
          <div class="eyebrow">${esc(k.label)}</div>
          <div class="tile-value">${esc(k.v)}</div>
          <div class="tile-sub">${esc(k.sub)}</div>
          <div class="tile-foot">
            <span class="delta ${k.good ? "up" : "down"}">${esc(k.delta)}</span>
            ${k.target !== "—" ? chip("Target " + k.target, "", true) : ""}
          </div>
        </article>`).join("");
    if (spark.length > 1) Charts.sparkline($("#hero-spark"), spark, { height: 44 });
  }

  /* ======================= Targets ====================================== */
  function renderTargets() {
    const tg = RAW.targets;
    if (!need("card-targets", "Targets", tg) || !M.roster || !M.latestMoney) return;
    const rows = [
      { name: "Children enrolled", actual: M.roster.enrolled, target: tg.enrollment,
        fmt: F.int, owner: tg.enrollmentOwner, horizon: tg.enrollmentHorizon, dir: "up" },
      { name: "Monthly operating cost", actual: M.latestMoney.cost, target: tg.monthlyCost,
        fmt: F.usd, owner: tg.costOwner, horizon: tg.costHorizon, dir: "down" }
    ];
    let onTarget = 0;
    $("#meters").innerHTML = rows.map((t) => {
      const ratio = t.dir === "up" ? t.actual / t.target : t.target / t.actual;
      if (ratio >= 1) onTarget++;
      const state = ratio >= 1 ? "good" : ratio >= 0.92 ? "warning" : ratio >= 0.6 ? "serious" : "critical";
      const aim = t.dir === "up" ? "≥" : "≤";
      return `<div class="meter-row">
        <div class="meter-head">
          <span class="name">${esc(t.name)}</span>
          <span class="who">${esc(t.owner)} · ${esc(t.horizon)}</span>
          <span class="vals"><span class="actual">${esc(t.fmt(t.actual))}</span> / ${esc(aim + t.fmt(t.target))}</span>
        </div>
        <div class="meter-track" role="img" aria-label="${esc(t.name)}: ${esc(t.fmt(t.actual))} against ${esc(aim + t.fmt(t.target))}">
          <div class="meter-fill ${state}" style="width:${Math.max(3, Math.min(100, ratio * 100)).toFixed(1)}%"></div>
        </div>
      </div>`;
    }).join("");
    if (have(tg.note)) $("#targets-note").textContent = tg.note;
    const el = $("#targets-summary");
    el.textContent = `${onTarget} of ${rows.length} on target`;
    el.className = "chip " + (onTarget === rows.length ? "good" : onTarget ? "warning" : "serious");
  }

  /* ======================= Trends ======================================= */
  const view = { range: 99 };
  const slice = (rows) => (view.range >= rows.length ? rows : rows.slice(-view.range));
  const yearLabels = (rows) => rows.map((x, i) => {
    const yr = x.full.slice(-2);
    return i === 0 || x.label === "Jan" ? `${x.label} '${yr}` : x.label;
  });
  function legend(node, keys) {
    node.innerHTML = keys.map((k) =>
      `<span class="key"><span class="swatch" style="background:var(${k.varName})"></span>${esc(k.name)}</span>`).join("");
  }

  function renderTrends() {
    const pg = $("#proj-group"); if (pg) pg.hidden = true;
    if (M.months.length <= 6) { const c = $("#controls"); if (c) c.hidden = true; }

    if (need("card-census", "Census", M.months)) {
      const rows = slice(M.months), labels = yearLabels(rows);
      legend($("#legend-census"), [
        { name: "Children enrolled", varName: "--series-1" },
        { name: "Average daily census", varName: "--series-2" }
      ]);
      Charts.line($("#chart-census"), {
        labels,
        series: [
          { name: "Enrolled", colorVar: "--series-1", values: rows.map((x) => x.enrolled) },
          { name: "Avg daily census", colorVar: "--series-2", values: rows.map((x) => x.adc),
            endFormat: F.dec1, tipFormat: F.dec1 }
        ],
        format: F.int,
        target: RAW.targets ? { value: RAW.targets.enrollment, label: `TARGET ${RAW.targets.enrollment}` } : null,
        tipTitle: (i) => rows[i].full,
        tipNote: (i) => `${F.pct1(rows[i].attendance)} attendance · ${rows[i].childDays} child-days over ${rows[i].opDays} days`
      });
      twin($("#twin-census"), ["Month", "Enrolled", "On report", "No attendance", "Operating days", "Child-days", "Daily census"],
        rows.map((x) => [x.full, F.int(x.enrolled), F.int(x.onReport), F.int(x.dormant),
          F.int(x.opDays), F.int(x.childDays), F.dec1(x.adc)]));
      const gap = $("#census-gap");
      if (RAW.targets && M.roster) {
        gap.hidden = false;
        gap.textContent = M.roster.shortOfTarget > 0
          ? `${M.roster.enrolled} enrolled today · ${M.roster.shortOfTarget} short of ${RAW.targets.enrollment}`
          : `${M.roster.enrolled} enrolled today · target of ${RAW.targets.enrollment} met`;
      } else gap.hidden = true;
    }

    if (!need("card-finance", "Revenue and cost", M.moneyMonths)) {
      const mg = document.getElementById("card-margin"); if (mg) mg.hidden = true;
      return;
    }
    const rows = slice(M.moneyMonths), labels = yearLabels(rows);
    legend($("#legend-finance"), [
      { name: "Revenue", varName: "--series-1" },
      { name: "Operating cost", varName: "--series-2" }
    ]);
    Charts.line($("#chart-finance"), {
      labels,
      series: [
        { name: "Revenue", colorVar: "--series-1", values: rows.map((x) => x.revenue), endFormat: F.usdk, tipFormat: F.usd },
        { name: "Operating cost", colorVar: "--series-2", values: rows.map((x) => x.cost), endFormat: F.usdk, tipFormat: F.usd }
      ],
      format: F.usdk, yZero: true,
      target: RAW.targets ? { value: RAW.targets.monthlyCost, label: `COST TARGET ${F.usdk(RAW.targets.monthlyCost)}` } : null,
      tipTitle: (i) => rows[i].full,
      tipNote: (i) => `Net ${F.usd(rows[i].net)} · ${F.pct1(rows[i].margin)} margin · ${F.usd(rows[i].revenuePerChildDay)} per child-day`
    });
    twin($("#twin-finance"), ["Month", "Revenue", "Operating cost", "Net", "Margin", "Per child-day"],
      rows.map((x) => [x.full, F.usd(x.revenue), F.usd(x.cost), F.usd(x.net), F.pct1(x.margin), F.usd(x.revenuePerChildDay)]));
    $("#finance-note").textContent =
      `${M.latestMoney.full}: ${F.usdk(M.latestMoney.revenue)} in, ${F.usdk(M.latestMoney.net)} net`;
    if (have(RAW.financeNote)) {
      $("#finance-caveat").textContent = RAW.financeNote +
        ` Year to date, revenue works out to ${F.usd(M.ytd.perChildDay)} per child-day across ${F.int(M.ytd.childDays)} child-days.`;
    }

    Charts.line($("#chart-margin"), {
      labels,
      series: [{ name: "Net margin", colorVar: "--series-1", values: rows.map((x) => x.margin),
                 endFormat: F.pct1, tipFormat: F.pct1 }],
      format: F.pct0, height: 196,
      tipTitle: (i) => rows[i].full,
      tipNote: (i) => `${F.usd(rows[i].net)} on ${F.usd(rows[i].revenue)}`
    });
    twin($("#twin-margin"), ["Month", "Net", "Margin"],
      rows.map((x) => [x.full, F.usd(x.net), F.pct1(x.margin)]));
    const mv = M.latestMoney.margin, pv = M.priorMoney ? M.priorMoney.margin : null;
    const mc = $("#margin-chip");
    mc.textContent = `${F.pct1(mv)} in ${M.latestMoney.label}` +
      (pv === null ? "" : ` · ${signed((mv - pv) * 100)} pts vs. ${M.priorMoney.label}`);
    mc.className = "chip " + (mv >= 0.15 ? "good" : mv >= 0.05 ? "warning" : mv >= 0 ? "serious" : "critical");
  }

  /* ======================= Projection =================================== */
  function renderProjection() {
    const p = M.projection;
    if (!need("card-projection", "Projection", p && p.months)) {
      const a = document.getElementById("card-assumptions"); if (a) a.hidden = true;
      return;
    }
    Charts.columns($("#chart-projection"), {
      labels: p.months.map((x) => x.label),
      sublabels: p.months.map((x) => x.full.slice(-4)),
      values: p.months.map((x) => x.revenue),
      format: F.usd, yFormat: F.usdk, height: 186, seriesName: "Projected revenue",
      tipTitle: (i) => p.months[i].full,
      tipNote: (i) => `${F.dec1(p.months[i].adc)} children/day × ${p.months[i].opDays} days × ${usd2(RAW.perDiem)}`
    });
    $("#tbl-projection tbody").innerHTML = p.months.map((x) =>
      `<tr>
        <td>${esc(x.full)}<span class="sub">${esc(x.closureNote || "")}</span></td>
        <td class="n">${x.weekdays}</td><td class="n">${x.closures || "—"}</td>
        <td class="n">${x.opDays}</td><td class="n">${x.enrolled}</td>
        <td class="n">${esc(F.dec1(x.adc))}</td><td class="n">${esc(F.usd(x.revenue))}</td>
      </tr>`).join("");
    $("#tbl-projection tfoot").innerHTML =
      `<tr><td>Total, ${esc(p.months[0].full)} to ${esc(p.months[p.months.length - 1].full)}</td>
       <td class="n">${p.totalWeekdays}</td><td class="n">${p.totalClosures}</td>
       <td class="n">${p.totalOpDays}</td><td class="n"></td><td class="n"></td>
       <td class="n">${esc(F.usd(p.totalRevenue))}</td></tr>`;
    $("#projection-chip").textContent = `${F.usdk(p.totalRevenue)} over ${p.totalOpDays} operating days`;

    if (!need("card-assumptions", null, p.assumptions)) return;
    $("#projection-stats").innerHTML = stats([
      { v: F.pct0(p.attendanceRate), k: "Attendance assumed" },
      { v: usd2(RAW.perDiem), k: "Per child-day" },
      { v: F.usdk(p.perChildPerMonth), k: "Per child, per month" },
      { v: F.usdk(p.pendingValue), k: `The ${M.roster.pending} pending, ${p.pendingMonthCount} months` }
    ]);
    $("#assumptions").innerHTML = p.assumptions.map((a) => `<li>${esc(a)}</li>`).join("");
    $("#projection-caveat").textContent = p.caveat +
      ` At ${F.usd(M.ytd.perChildDay)} the same projection lands at ${F.usdk(p.atRealizedRate)} instead of ${F.usdk(p.totalRevenue)}.`;
  }

  /* ======================= Distributions ================================ */
  function renderDistributions() {
    const d = M.distributions;
    if (!need("card-distributions", "Distributions", d && d.schedule)) {
      const x = document.getElementById("card-reserve"); if (x) x.hidden = true;
      return;
    }
    $("#dist-policy").innerHTML = stats([
      { v: "First", k: `To savings, until ${F.usdk(d.reserveTarget)} is banked` },
      { v: F.pct0(d.split.debt), k: "Of the rest, to paying down debt" },
      { v: F.pct0(d.split.owners), k: "Of the rest, to owner distributions" }
    ]);
    $("#tbl-distributions tbody").innerHTML = d.schedule.map((x) =>
      `<tr>
        <td>${esc(x.full)}</td>
        <td class="n">${esc(F.usd(x.revenue))}</td>
        <td class="n">${esc(F.usd(x.net))}</td>
        <td class="n">${esc(F.usd(x.toSavings))}</td>
        <td class="n">${esc(F.usd(x.toDebt))}</td>
        <td class="n">${esc(F.usd(x.toOwners))}</td>
        <td class="n">${esc(F.usd(x.reserve))}</td>
      </tr>`).join("");
    $("#tbl-distributions tfoot").innerHTML =
      `<tr><td>Total</td><td class="n">${esc(F.usd(M.projection.totalRevenue))}</td>
       <td class="n">${esc(F.usd(d.totals.net))}</td>
       <td class="n">${esc(F.usd(d.totals.savings))}</td>
       <td class="n">${esc(F.usd(d.totals.debt))}</td>
       <td class="n">${esc(F.usd(d.totals.owners))}</td>
       <td class="n">${esc(F.usd(d.endReserve))}</td></tr>`;
    const chipEl = $("#dist-chip");
    chipEl.textContent = `${F.usdk(d.totals.owners)} to owners over ${d.schedule.length} months`;
    chipEl.className = "chip accent";
    $("#dist-note").textContent = d.note + " " + d.caveat +
      ` At the realized rate the four months net about ${F.usdk(d.downside)} rather than ${F.usdk(d.totals.net)}, which funds the reserve later and leaves less to distribute.`;

    if (!need("card-reserve", null, d.reserveTarget)) return;
    const pctFunded = d.startingReserve / d.reserveTarget;
    $("#reserve-stats").innerHTML = stats([
      { v: F.usdk(d.reserveTarget), k: `Savings target · ${d.monthsCovered.toFixed(1)} months of cost` },
      { v: F.usdk(d.startingReserve), k: `In the bank today · ${F.pct0(pctFunded)} of target` },
      { v: F.usdk(d.endReserve), k: "Projected at year end" },
      { v: F.usdk(d.endDebt), k: "Revolving debt still owed" }
    ]);
    const track = $("#reserve-meter");
    track.innerHTML =
      `<div class="meter-fill ${pctFunded >= 1 ? "good" : pctFunded >= 0.5 ? "warning" : "serious"}"
        style="width:${Math.max(3, Math.min(100, pctFunded * 100)).toFixed(1)}%"></div>`;
    $("#reserve-caption").textContent =
      `${F.usd(d.startingReserve)} of ${F.usd(d.reserveTarget)} today` +
      (d.targetMonth ? ` · reaches the target in ${d.targetMonth} on this schedule` : " · the schedule does not reach the target");
    const rc = $("#reserve-chip");
    rc.textContent = d.targetMonth ? `funded by ${d.targetMonth}` : "target not reached";
    rc.className = "chip " + (d.targetMonth ? "good" : "warning");

    const R = d.required;
    $("#required-stats").innerHTML = stats([
      { v: F.usdk(R.revenue), k: `Revenue needed over ${R.months} months` },
      { v: F.usdk(R.monthlyRevenue), k: "Per month" },
      { v: R.adc.toFixed(1), k: "Children a day it takes" },
      { v: R.enrolled.toFixed(0), k: `Enrolled at ${F.pct0(M.projection.attendanceRate)} attendance` }
    ]);
    $("#required-note").textContent =
      `The gap is ${F.usd(R.gap)}; the rest of that revenue just covers running the months it is earned over. ` +
      (R.surplus >= 0
        ? `The projection makes ${F.usdk(M.projection.totalRevenue)}, ${F.usdk(R.surplus)} more than needed. `
        : `The projection makes ${F.usdk(M.projection.totalRevenue)}, ${F.usdk(-R.surplus)} short. `) +
      `Break-even alone is ${F.usdk(R.breakEvenMonthly)} a month — about ${R.breakEvenAdc.toFixed(1)} children a day.`;

    const members = $("#tbl-members");
    if (d.showMembers && have(d.members)) {
      members.closest(".table-wrap").hidden = false;
      $("#members-head").hidden = false;
      $("#tbl-members tbody").innerHTML = d.members.map((x) =>
        `<tr><td>${esc(x.name)}</td><td class="n">${esc(F.pct1(x.share))}</td>
         <td class="n">${esc(F.usd(x.amount))}</td></tr>`).join("");
      $("#tbl-members tfoot").innerHTML =
        `<tr><td>Distribution pool</td><td class="n">100.0%</td>
         <td class="n">${esc(F.usd(d.totals.owners))}</td></tr>`;
    } else {
      members.closest(".table-wrap").hidden = true;
      $("#members-head").hidden = true;
    }
  }

  /* ======================= Cost structure & mix ========================= */
  function renderCosts() {
    const c = M.costLines;
    if (!need("card-costs", "Cost structure", c && c.lines)) {
      const mix = document.getElementById("card-mix"); if (mix) mix.hidden = true;
      return;
    }
    $("#costs-title").textContent = `Where the cost went — ${c.current}`;
    $("#th-prior").textContent = c.prior;
    $("#th-current").textContent = c.current;
    $("#tbl-costs tbody").innerHTML = c.lines.map((l) => {
      const big = Math.abs(l.change) >= c.totalCurrent * 0.02;
      const sev = !big ? "" : l.change > 0 ? "serious" : "good";
      return `<tr><td>${esc(l.name)}</td>
        <td class="n">${esc(F.usd(l.prior))}</td>
        <td class="n">${esc(F.usd(l.current))}</td>
        <td class="n">${Math.abs(l.change) < 1 ? chip("flat", "", true) : chip(signedUsd(l.change), sev, !big)}</td></tr>`;
    }).join("");
    $("#tbl-costs tfoot").innerHTML =
      `<tr><td>Total operating cost</td><td class="n">${esc(F.usd(c.totalPrior))}</td>
       <td class="n">${esc(F.usd(c.totalCurrent))}</td>
       <td class="n">${chip(signedUsd(c.change), c.change > 0 ? "serious" : "good")}</td></tr>`;
    const cc = $("#costs-chip");
    if (c.overTarget !== null) {
      cc.textContent = c.overTarget > 0
        ? `${F.usdk(c.overTarget)} over the ${F.usdk(RAW.targets.monthlyCost)} target`
        : `${F.usdk(-c.overTarget)} under the ${F.usdk(RAW.targets.monthlyCost)} target`;
      cc.className = "chip " + (c.overTarget > 0 ? "critical" : "good");
      if (c.overTarget > 0) $("#card-costs").dataset.state = "critical";
      else delete $("#card-costs").dataset.state;
    }
    const top = c.lines.slice(0, 8);
    const rest = c.lines.slice(8).reduce((a, l) => a + l.current, 0);
    $("#mix-title").textContent = `Share of ${c.current} cost`;
    Charts.bars($("#chart-mix"), {
      rows: top.map((l) => ({ label: l.name, value: l.share, note: F.usd(l.current) }))
        .concat(rest > 0 ? [{ label: "Everything else", value: rest / c.totalCurrent, note: F.usd(rest) }] : []),
      format: F.pct0, seriesName: "Share of cost"
    });
  }

  /* ======================= Cash ========================================= */
  function renderCash() {
    const c = M.cash;
    if (!need("card-cash", "Cash position", c && c.lines)) return;
    $("#cash-title").textContent = `Cash and obligations — ${c.asOf}`;
    $("#cash-stats").innerHTML = stats([
      { v: F.usdk(c.inBank), k: "Cash in bank" },
      { v: F.usdk(c.obligations), k: "Current obligations" },
      { v: F.usdk(c.net), k: "Cash net of obligations" },
      { v: F.usdk(c.ytdNet), k: "Net income, year to date" },
      { v: F.usdk(c.ytdNetPrior), k: "Same period last year" },
      { v: F.usdk(c.totalEquity), k: "Total equity" }
    ]);
    $("#tbl-cash tbody").innerHTML = c.lines.map((l) =>
      `<tr><td>${esc(l.name)}</td><td class="n">${esc(F.usd(l.value))}</td>
       <td>${l.prior != null ? chip(`${F.usd(l.prior)} ${c.priorLabel}`, "", true) : ""}</td></tr>`).join("");
    $("#tbl-cash tfoot").innerHTML =
      `<tr><td>Cash net of current obligations</td><td class="n">${esc(F.usd(c.net))}</td><td></td></tr>`;
    const chipEl = $("#cash-chip");
    chipEl.textContent = c.net > 0 ? `${F.usdk(c.net)} net of obligations` : `${F.usdk(c.net)} short of obligations`;
    chipEl.className = "chip " + (c.net > 0 ? "good" : "critical");
    if (have(c.note)) $("#cash-note").textContent = c.note;
  }

  /* ======================= Attendance & rooms =========================== */
  function renderAttendance() {
    renderRooms();
    if (!need("card-attendance", "Attendance", M.months)) return;
    const a = M.months;
    Charts.columns($("#chart-attendance"), {
      labels: a.map((x) => x.label), sublabels: a.map((x) => x.full.slice(-4)),
      values: a.map((x) => x.attendance),
      format: F.pct1, yFormat: F.pct0, height: 214,
      target: have(RAW.attendanceTargetRate)
        ? { value: RAW.attendanceTargetRate, label: "TARGET " + F.pct0(RAW.attendanceTargetRate) } : null,
      seriesName: "Attendance",
      tipTitle: (i) => a[i].full,
      tipNote: (i) => `${F.dec1(a[i].adc)} of ${a[i].enrolled} enrolled · ${a[i].childDays} child-days`
    });
    twin($("#twin-attendance"), ["Month", "Enrolled", "Operating days", "Child-days", "Daily census", "Attendance rate"],
      a.map((x) => [x.full, F.int(x.enrolled), F.int(x.opDays), F.int(x.childDays), F.dec1(x.adc), F.pct1(x.attendance)]));
    const cur = M.latest, prev = M.prior;
    const ac = $("#attendance-chip");
    ac.textContent = `${F.pct1(cur.attendance)} in ${cur.label}` +
      (prev ? ` · ${signed((cur.attendance - prev.attendance) * 100)} pts vs. ${prev.label}` : "");
    ac.className = "chip " + (cur.attendance >= 0.85 ? "good" : cur.attendance >= 0.75 ? "warning" : "serious");
  }

  function renderRooms() {
    const r = M.rooms;
    if (!need("card-rooms", null, r && r.list)) return;
    $("#rooms-eyebrow").textContent = r.month;
    Charts.bars($("#chart-rooms"), {
      rows: r.list.map((x) => ({ label: x.name, value: x.adc,
        note: `${x.attending} attending of ${x.onReport} on the report` })),
      format: F.dec1, seriesName: "Daily census"
    });
    $("#rooms-stats").innerHTML = stats([
      { v: F.int(r.attending), k: "Children attending" },
      { v: F.int(r.list.length), k: "Rooms in use" }
    ].concat(have(r.partnerSchool) ? [{ v: F.int(r.partnerSchool.children), k: "At the partner school" }] : []));
    if (have(r.partnerSchool)) {
      $("#rooms-note").textContent =
        `${r.partnerSchool.children} of the children are enrolled at ${r.partnerSchool.name}. ` +
        `Bars are average daily census, so they add to the centre's ${F.dec1(r.adc)}.`;
    }
  }

  /* ======================= Roster movement ============================== */
  function renderRoster() {
    if (need("card-dormant", "Roster hygiene", M.months)) {
      Charts.columns($("#chart-dormant"), {
        labels: M.months.map((x) => x.label), sublabels: M.months.map((x) => x.full.slice(-4)),
        values: M.months.map((x) => x.dormant),
        format: F.int, height: 196, seriesName: "No attendance",
        tipTitle: (i) => M.months[i].full,
        tipNote: (i) => `${M.months[i].onReport} on the report, ${M.months[i].enrolled} attended`
      });
      const dc = $("#dormant-chip");
      dc.textContent = `${M.latest.dormant} of ${M.latest.onReport} on the report in ${M.latest.label}`;
      dc.className = "chip " + (M.latest.dormant <= 2 ? "good" : M.latest.dormant <= 5 ? "warning" : "serious");
    }
    const moved = M.months.filter((x) => x.started != null);
    if (!need("card-movement", null, moved)) return;
    $("#tbl-movement tbody").innerHTML = moved.map((x) => {
      const net = x.started - x.stopped;
      return `<tr><td>${esc(x.full)}</td>
        <td class="n">${x.started || "—"}</td><td class="n">${x.stopped || "—"}</td>
        <td class="n">${net === 0 ? chip("flat", "", true) : chip(signed(net, 0), net > 0 ? "good" : "serious")}</td>
        <td class="n">${F.int(x.enrolled)}</td></tr>`;
    }).join("");
    $("#movement-chip").textContent =
      `${moved.reduce((a, x) => a + x.started, 0)} started, ${moved.reduce((a, x) => a + x.stopped, 0)} stopped since ${moved[0].label}`;
  }

  /* ======================= Staffing ===================================== */
  function renderStaffing() {
    const s = M.staffing;
    if (!need("card-staff", "Staffing", s && s.roles)) {
      const x = document.getElementById("card-staff-model"); if (x) x.hidden = true;
      return;
    }
    if (have(s.asOf)) $("#staff-eyebrow").textContent = "As of " + s.asOf;
    $("#staff-stats").innerHTML = stats([
      { v: F.int(s.fullTime), k: "Full time" }, { v: F.int(s.partTime), k: "Part time" },
      { v: F.int(s.perDiem), k: "Per diem" }, { v: F.int(s.total), k: "On the team" }
    ]);
    Charts.bars($("#chart-staff"), {
      rows: s.roles.map((r) => ({ label: r.role, value: r.count, note: r.type })),
      format: F.int, seriesName: "Staff"
    });
    twin($("#twin-staff"), ["Role", "Employment", "Staff"],
      s.roles.map((r) => [r.role, r.type, F.int(r.count)]));
    $("#staff-chip").textContent = `${s.total} on the team`;
    $("#staff-chip").className = "chip";
    if (have(s.discrepancy)) {
      $("#staff-note").textContent = s.discrepancy;
      $("#card-staff").dataset.state = "warning";
    }
    const dm = s.dailyModel;
    if (!need("card-staff-model", null, dm && dm.lines)) return;
    $("#model-title").textContent = `Daily staffing for ${dm.supports} children`;
    $("#tbl-staff-model tbody").innerHTML = dm.lines.map((l) => {
      const state = l.spare <= 0 ? "critical" : l.spare === 1 ? "warning" : "good";
      const label = l.spare <= 0 ? "no spare" : l.spare === 1 ? "1 spare" : `${l.spare} spare`;
      return `<tr><td>${esc(l.role)}</td><td class="n">${l.perDay}</td>
        <td class="n">${l.roster}<span class="sub">${esc(l.have)}</span></td>
        <td>${chip(label, state)}</td></tr>`;
    }).join("");
    $("#tbl-staff-model tfoot").innerHTML =
      `<tr><td>On the floor each day</td><td class="n">${dm.perDay}</td>
       <td class="n">${dm.scheduled}</td>
       <td>${chip(`1 staff per ${dm.childrenPerStaff.toFixed(1)} children at ${dm.supports}`, "", true)}</td></tr>`;
    $("#model-chip").textContent = `${dm.perDay} on the floor supports ${dm.supports} children`;
    $("#model-note").textContent = [dm.excludes, dm.note].filter(have).join(" ") +
      (dm.atProjected ? ` At the projection's closing census, about ${F.dec1(M.projection.months[M.projection.months.length - 1].adc)} children a day, it is one per ${dm.atProjected.toFixed(1)}.` : "");
  }

  /* ======================= Marketing ==================================== */
  function renderMarketing() {
    const a = M.adSpend;
    if (!need("card-adspend", "Marketing", a && a.months)) return;
    Charts.columns($("#chart-adspend"), {
      labels: a.months.map((x) => x.label), values: a.months.map((x) => x.value),
      format: F.usd, yFormat: F.usdk, height: 190, seriesName: "Spend",
      tipTitle: (i) => a.months[i].label
    });
    $("#adspend-stats").innerHTML = stats([
      { v: F.usdk(a.ytd), k: "Year to date" },
      { v: F.usdk(a.ytdPrior), k: "Same period last year" },
      { v: F.usd(a.latest.value), k: "Latest month" }
    ]);
    const ch = $("#adspend-chip");
    ch.textContent = `${F.pct0(a.vsPrior)} of last year's spend`;
    ch.className = "chip";
    if (have(a.note)) $("#adspend-note").textContent = a.note;
  }

  /* ======================= Task board =================================== */
  const DONE_KEY = "akp.tasks.done";
  const readDone = () => { try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]")); } catch { return new Set(); } };
  const writeDone = (s) => { try { localStorage.setItem(DONE_KEY, JSON.stringify([...s])); } catch { /* private mode */ } };
  let taskFilter = "open";
  const isDone = (t, done) => t.status === "Done" || done.has(t.id);
  const isOverdue = (t, done) => !!t.due && !isDone(t, done) && new Date(t.due + "T00:00:00") < AS_OF;

  function renderTasks() {
    if (!need("card-tasks", "Task board", RAW.tasks)) return;
    const done = readDone();
    const all = RAW.tasks.slice().sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    const rows = all.filter((t) => {
      if (taskFilter === "all") return true;
      if (taskFilter === "open") return !isDone(t, done);
      if (taskFilter === "blocked") return t.status === "Blocked";
      if (taskFilter === "overdue") return isOverdue(t, done);
      return true;
    });
    $("#tbl-tasks tbody").innerHTML = rows.map((t) => {
      const d = isDone(t, done), over = isOverdue(t, done);
      const st = d ? "good" : t.status === "Blocked" ? "critical" : t.status === "In progress" ? "accent" : "";
      return `<tr class="${d ? "is-done" : ""}">
        <td class="check"><input type="checkbox" data-task="${esc(t.id)}" ${d ? "checked" : ""}
             ${t.status === "Done" ? "disabled" : ""} aria-label="Mark ${esc(t.id)} complete"></td>
        <td class="title">${esc(t.title)}${t.note ? `<span class="note">${esc(t.note)}</span>` : ""}</td>
        <td>${esc(t.area)}</td><td>${esc(t.owner)}</td>
        <td><span class="pri ${esc(t.priority)}">${esc(t.priority)}</span></td>
        <td class="n">${t.due ? esc(shortDate(t.due)) : `<span class="chip plain">no date</span>`}${over ? ` ${chip("overdue", "critical")}` : ""}</td>
        <td>${chip(d ? "Done" : t.status, st, !st)}</td></tr>`;
    }).join("") || `<tr><td colspan="7" style="color:var(--ink-3);padding:14px 0">Nothing in this view.</td></tr>`;
    const open = all.filter((t) => !isDone(t, done)).length;
    const overdue = all.filter((t) => isOverdue(t, done)).length;
    const blocked = all.filter((t) => t.status === "Blocked").length;
    const undated = all.filter((t) => !t.due && !isDone(t, done)).length;
    $("#task-count").textContent = `${rows.length} shown · ${open} open · ${overdue} overdue · ${undated} with no date`;
    const tc = $("#tasks-chip");
    tc.textContent = overdue ? `${overdue} overdue` : blocked ? `${blocked} blocked` : `${open} open`;
    tc.className = "chip " + (overdue ? "critical" : blocked || undated ? "warning" : "good");
    if (overdue) $("#card-tasks").dataset.state = "critical"; else delete $("#card-tasks").dataset.state;
    if (have(RAW.tasksNote)) $("#tasks-note").textContent = RAW.tasksNote;
    $$("#tbl-tasks input[type=checkbox]").forEach((box) => {
      box.addEventListener("change", () => {
        const s = readDone();
        box.checked ? s.add(box.dataset.task) : s.delete(box.dataset.task);
        writeDone(s); renderTasks();
      });
    });
  }

  /* ======================= Chrome ======================================= */
  function renderBrand() {
    const img = $("#brand-logo"), mark = $("#brand-mark"), text = $("#facility-name");
    if (!img || !have(RAW.meta.logo)) return;
    img.addEventListener("load", () => { img.hidden = false; if (mark) mark.hidden = true; if (text) text.hidden = true; });
    img.addEventListener("error", () => { img.hidden = true; if (mark) mark.hidden = false; if (text) text.hidden = false; });
    img.alt = RAW.meta.logoAlt || RAW.meta.facility;
    img.src = RAW.meta.logo;
  }

  function renderChrome() {
    $("#facility-name").textContent = RAW.meta.facility;
    $("#foot-facility").textContent = RAW.meta.facility;
    $("#board-name").textContent = RAW.meta.boardName;
    $("#as-of").textContent = RAW.meta.asOf;
    $("#period-label").textContent = RAW.meta.period;
    $("#demo-chip").hidden = !RAW.meta.sampleData;
    if (have(RAW.meta.sourceNote)) $("#foot-source").textContent = RAW.meta.sourceNote;
  }

  function pruneEmptySections() {
    $$("section.section").forEach((sec) => {
      const cards = $$(".card", sec);
      sec.hidden = cards.length > 0 && cards.every((c) => c.hidden);
    });
    const note = $("#coverage-note");
    if (!note) return;
    if (!AWAITING.length) { note.hidden = true; return; }
    note.hidden = false;
    note.innerHTML = "Waiting on data: <strong>" + AWAITING.map(esc).join("</strong>, <strong>") +
      "</strong>. Those sections stay hidden until their numbers are entered.";
  }

  /* Full re-render. Every card is un-hidden first so a card that was hidden for
     want of data comes back the moment the data is entered. */
  function renderAll() {
    M = Model.build(RAW);
    AWAITING = [];
    $$(".card").forEach((c) => { c.hidden = false; });
    $$("section.section").forEach((s) => { s.hidden = false; });
    renderChrome();
    renderLead();
    renderTargets();
    renderTrends();
    renderProjection();
    renderDistributions();
    renderCosts();
    renderCash();
    renderAttendance();
    renderRoster();
    renderStaffing();
    renderMarketing();
    renderTasks();
    pruneEmptySections();
  }
  window.AKP_RENDER = renderAll;
  window.AKP_STATE = { get raw() { return RAW; }, set raw(v) { RAW = v; } };

  /* ======================= Boot ========================================= */
  function boot() {
    const tpl = document.getElementById("board-template");
    const mount = document.getElementById("app");
    if (tpl && mount && !mount.childElementCount) mount.appendChild(tpl.content.cloneNode(true));

    renderBrand();
    renderAll();

    $$(".segmented button[data-range]").forEach((b) => {
      b.addEventListener("click", () => {
        view.range = Number(b.dataset.range);
        $$(".segmented button[data-range]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        renderTrends();
      });
    });
    $$("[data-task-filter]").forEach((b) => {
      b.addEventListener("click", () => {
        taskFilter = b.dataset.taskFilter;
        $$("[data-task-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        renderTasks();
      });
    });

    const root = document.documentElement;
    try { const saved = localStorage.getItem("akp.theme"); if (saved) root.setAttribute("data-theme", saved); } catch { /* private mode */ }
    $("#theme-toggle").addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") === "dark" ||
        (!root.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("akp.theme", next); } catch { /* private mode */ }
      document.dispatchEvent(new Event("akp:theme"));
    });

    if (typeof Editor !== "undefined" && Editor && Editor.init) Editor.init();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => document.dispatchEvent(new Event("akp:theme")));
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();

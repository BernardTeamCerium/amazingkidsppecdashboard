/* =============================================================================
   Amazing Kids PPEC — Operations Board
   Renders every card from window.AKP_DATA. No data is defined in this file.
   ========================================================================== */

(() => {
  "use strict";
  const D = window.AKP_DATA;
  const F = Charts.fmt;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* --- Data availability ---------------------------------------------------
     Any block in data.js may be null or omitted while its source is still being
     wired up. A card whose data is missing hides itself, a section whose cards
     all hid drops out, and the footer lists what is waiting. Nothing is faked
     and nothing renders half-empty. */
  const have = (v) => {
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  };
  const AWAITING = [];
  function need(cardId, label, ...values) {
    if (values.every(have)) return true;
    const card = document.getElementById(cardId);
    if (card) card.hidden = true;
    if (label && !AWAITING.includes(label)) AWAITING.push(label);
    return false;
  }

  const AS_OF = new Date("2026-08-31T00:00:00");
  const MONTHS = have(D.months) ? D.months : [];
  const ACTUALS = MONTHS.filter((m) => !m.projected);
  const PROJECTED = MONTHS.filter((m) => m.projected);
  const CUR = ACTUALS[ACTUALS.length - 1];
  const PREV = ACTUALS[ACTUALS.length - 2];
  const margin = (m) => (m.revenue - m.expenses) / m.revenue;

  const FMT = {
    int: F.int, dec1: F.dec1, pct0: F.pct0, pct1: F.pct1, usd: F.usd, usdk: F.usdk
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chip = (text, state = "", plain = false) =>
    `<span class="chip ${state}${plain ? " plain" : ""}">${esc(text)}</span>`;
  const signed = (v, digits = 1) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(digits);
  const shortDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" });

  /* -- table twin ---------------------------------------------------------- */
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

  /* =======================================================================
     Lead band
     ==================================================================== */
  function renderLead() {
    const lead = $("#lead");
    const h = D.hero;
    if (!have(h) && !have(D.kpis)) { lead.hidden = true; AWAITING.push("Headline numbers"); return; }
    lead.innerHTML = (!have(h) ? "" :
      `<article class="card hero-card">
         <div class="card-head"><div class="titles">
           <div class="eyebrow">Month to date</div>
           <h3>${esc(h.label)}</h3>
         </div></div>
         <div class="hero-figure">${h.value.toFixed(1)}<span class="unit">${esc(h.unit)}</span></div>
         <div class="hero-row">
           <span class="delta ${h.delta >= 0 === h.deltaGood ? "up" : "down"}">${signed(h.delta)} ${esc(h.deltaLabel)}</span>
           ${chip("Target " + h.target, "", true)}
         </div>
         <div class="chart" id="hero-spark" style="margin:-4px 0 -2px"></div>
         <p class="card-note">${esc(h.note)}${ACTUALS.length ? ". Twelve-month trend above" : ""}.</p>
       </article>`) +
      (D.kpis || []).map((k) => {
        const val = FMT[k.format](k.value);
        const good = /^[+−-]?0/.test(k.delta) ? "flat" : k.deltaGood ? "up" : "down";
        return `<article class="card tile" data-state="${k.state}">
          <div class="eyebrow">${esc(k.label)}</div>
          <div class="tile-value">${esc(val)}</div>
          <div class="tile-sub">${esc(k.sub)}</div>
          <div class="tile-foot">
            <span class="delta ${good}">${esc(k.delta)}</span>
            ${k.target !== "—" ? chip("Target " + k.target, "", true) : ""}
          </div>
        </article>`;
      }).join("");
    if (have(h) && ACTUALS.length > 1) {
      Charts.sparkline($("#hero-spark"), ACTUALS.map((m) => m.adc), { height: 44 });
    } else if (have(h)) {
      $("#hero-spark").hidden = true;
    }
  }

  /* =======================================================================
     Targets
     ==================================================================== */
  function renderTargets() {
    if (!need("card-targets", "Targets", D.targets)) return;
    let onTarget = 0;
    $("#meters").innerHTML = D.targets.map((t) => {
      const ratio = t.direction === "up" ? t.actual / t.target : t.target / t.actual;
      if (ratio >= 1) onTarget++;
      const state = ratio >= 1 ? "good" : ratio >= 0.92 ? "warning" : ratio >= 0.6 ? "serious" : "critical";
      const pct = Math.max(3, Math.min(100, ratio * 100));
      const f = FMT[t.format];
      const aim = t.direction === "up" ? "≥" : "≤";
      return `<div class="meter-row">
        <div class="meter-head">
          <span class="name">${esc(t.name)}</span>
          <span class="who">${esc(t.owner)} · ${esc(t.horizon)}</span>
          <span class="vals"><span class="actual">${esc(f(t.actual))}</span> / ${esc(aim + f(t.target))}</span>
        </div>
        <div class="meter-track" role="img" aria-label="${esc(t.name)}: ${esc(f(t.actual))} against a target of ${esc(aim + f(t.target))}">
          <div class="meter-fill ${state}" style="width:${pct.toFixed(1)}%"></div>
        </div>
      </div>`;
    }).join("");
    const el = $("#targets-summary");
    el.textContent = `${onTarget} of ${D.targets.length} on target`;
    el.className = "chip " + (onTarget >= D.targets.length * 0.75 ? "good" : onTarget >= D.targets.length / 2 ? "warning" : "serious");
  }

  /* =======================================================================
     Trend charts (scoped by the control bar)
     ==================================================================== */
  const state = { range: 12, projection: true };

  function slice() {
    const a = ACTUALS.slice(-state.range);
    const rows = state.projection ? a.concat(PROJECTED) : a;
    return { rows, projectFrom: state.projection ? a.length : null };
  }

  function legend(node, keys, withProjection) {
    node.innerHTML = keys.map((k) =>
      `<span class="key"><span class="swatch" style="background:var(${k.varName})"></span>${esc(k.name)}</span>`).join("") +
      (withProjection ? `<span class="key"><span class="swatch dashed"></span>Projected</span>` : "");
  }

  function renderTrends() {
    const hasMonths = need("card-census", "Census and financial trends", ACTUALS);
    if (!hasMonths) {
      ["card-finance", "card-margin", "card-projection"].forEach((id) => {
        const n = document.getElementById(id); if (n) n.hidden = true;
      });
      const ctl = $("#controls"); if (ctl) ctl.hidden = true;
      return;
    }
    if (!PROJECTED.length) {
      const pg = $("#proj-group"); if (pg) pg.hidden = true;
      const pc = document.getElementById("card-projection"); if (pc) pc.hidden = true;
      state.projection = false;
    }
    const { rows, projectFrom } = slice();
    const full = rows.map((m) => m.full);
    const labels = rows.map((m, i) => {
      const yr = m.full.slice(-2);
      return i === 0 || m.label === "Jan" ? `${m.label} '${yr}` : m.label;
    });

    // Census & enrollment — two counts of children, one axis.
    legend($("#legend-census"), [
      { name: "Enrolled", varName: "--series-1" },
      { name: "Average daily census", varName: "--series-2" }
    ], state.projection);
    Charts.line($("#chart-census"), {
      labels,
      series: [
        { name: "Enrolled", colorVar: "--series-1", values: rows.map((m) => m.enrolled) },
        { name: "Avg daily census", colorVar: "--series-2", values: rows.map((m) => m.adc), endFormat: F.dec1, tipFormat: F.dec1 }
      ],
      format: F.int,
      projectFrom,
      target: { value: 45, label: "CENSUS TARGET 45" },
      tipTitle: (i) => full[i] + (rows[i].projected ? " · projected" : ""),
      tipNote: (i) => "Attendance " + F.pct1(rows[i].adc / rows[i].enrolled)
    });
    twin($("#twin-census"), ["Month", "Enrolled", "Avg daily census", "Attendance"],
      rows.map((m) => [m.full + (m.projected ? " (proj.)" : ""), F.int(m.enrolled), F.dec1(m.adc), F.pct1(m.adc / m.enrolled)]));
    $("#census-gap").textContent = `${55 - CUR.enrolled} seats to the December target`;

    // Revenue & expenses — both dollars, one axis.
    legend($("#legend-finance"), [
      { name: "Revenue", varName: "--series-1" },
      { name: "Operating expenses", varName: "--series-2" }
    ], state.projection);
    Charts.line($("#chart-finance"), {
      labels,
      series: [
        { name: "Revenue", colorVar: "--series-1", values: rows.map((m) => m.revenue), endFormat: F.usdk, tipFormat: F.usd },
        { name: "Operating expenses", colorVar: "--series-2", values: rows.map((m) => m.expenses), endFormat: F.usdk, tipFormat: F.usd }
      ],
      format: F.usdk,
      yZero: true,
      projectFrom,
      tipTitle: (i) => full[i] + (rows[i].projected ? " · projected" : ""),
      tipNote: (i) => "Net " + F.usd(rows[i].revenue - rows[i].expenses) + " · " + F.pct1(margin(rows[i]))
    });
    twin($("#twin-finance"), ["Month", "Revenue", "Expenses", "Net", "Margin"],
      rows.map((m) => [m.full + (m.projected ? " (proj.)" : ""), F.usd(m.revenue), F.usd(m.expenses),
        F.usd(m.revenue - m.expenses), F.pct1(margin(m))]));
    $("#finance-note").textContent =
      `${CUR.full}: ${F.usdk(CUR.revenue)} in, ${F.usdk(CUR.revenue - CUR.expenses)} net`;

    // Net margin — a single series, so no legend box.
    Charts.line($("#chart-margin"), {
      labels,
      series: [{ name: "Net margin", colorVar: "--series-1", values: rows.map(margin), endFormat: F.pct1, tipFormat: F.pct1 }],
      format: F.pct0,
      height: 196,
      projectFrom,
      target: { value: 0.15, label: "TARGET 15%" },
      tipTitle: (i) => full[i] + (rows[i].projected ? " · projected" : ""),
      tipNote: (i) => F.usd(rows[i].revenue - rows[i].expenses) + " on " + F.usd(rows[i].revenue)
    });
    twin($("#twin-margin"), ["Month", "Net", "Margin"],
      rows.map((m) => [m.full + (m.projected ? " (proj.)" : ""), F.usd(m.revenue - m.expenses), F.pct1(margin(m))]));
  }

  /* =======================================================================
     Projection table
     ==================================================================== */
  function renderProjection() {
    if (have(CUR) && have(PREV)) {
      const m = margin(CUR), pm = margin(PREV);
      const mc = $("#margin-chip");
      mc.textContent = `${F.pct1(m)} MTD · ${signed((m - pm) * 100)} pts vs. ${PREV.label}`;
      mc.className = "chip " + (m >= 0.15 ? "good" : m >= 0.12 ? "warning" : "serious");
    }
    if (!need("card-projection", null, PROJECTED)) return;
    $("#tbl-projection tbody").innerHTML = PROJECTED.map((m) =>
      `<tr><td>${esc(m.full)}</td><td class="n">${F.int(m.enrolled)}</td><td class="n">${F.dec1(m.adc)}</td>
       <td class="n">${esc(F.usdk(m.revenue))}</td><td class="n">${esc(F.pct1(margin(m)))}</td></tr>`).join("");
    $("#assumptions").innerHTML = (D.projectionAssumptions || []).map((a) => `<li>${esc(a)}</li>`).join("");
  }

  /* =======================================================================
     Budget, expense mix, upcoming expenses
     ==================================================================== */
  function renderMoney() {
    renderUpcoming();
    if (!need("card-budget", "Operating budget", D.budget, D.budget && D.budget.categories)) {
      const mix = document.getElementById("card-expense-mix"); if (mix) mix.hidden = true;
      return;
    }
    const b = D.budget;
    const tb = b.categories.reduce((a, c) => a + c.budget, 0);
    const ta = b.categories.reduce((a, c) => a + c.actual, 0);
    $("#budget-title").textContent = `Budget vs. actual — ${b.month}`;

    $("#budget-stats").innerHTML = [
      { k: "Revenue budget", v: F.usdk(b.revenueBudget) },
      { k: "Revenue actual", v: F.usdk(b.revenueActual) },
      { k: "Expense budget", v: F.usdk(tb) },
      { k: "Expense actual", v: F.usdk(ta) },
      { k: "Net result", v: F.usdk(b.revenueActual - ta) }
    ].map((s) => `<div class="stat"><span class="v num">${esc(s.v)}</span><span class="k">${esc(s.k)}</span></div>`).join("");

    $("#tbl-budget tbody").innerHTML = b.categories.map((c) => {
      const varr = c.budget - c.actual;          // positive = under budget
      const over = varr < 0;
      const sev = !over ? "" : Math.abs(varr) / c.budget > 0.08 ? "critical" : "serious";
      return `<tr>
        <td>${esc(c.name)}</td>
        <td class="n">${esc(F.usd(c.budget))}</td>
        <td class="n">${esc(F.usd(c.actual))}</td>
        <td class="n">${chip((over ? "over " : "under ") + F.usd(Math.abs(varr)), sev, !over)}</td>
        <td class="n">${esc(F.pct0(c.actual / c.budget))}</td>
      </tr>`;
    }).join("");
    $("#tbl-budget tfoot").innerHTML =
      `<tr><td>Total operating expense</td><td class="n">${esc(F.usd(tb))}</td><td class="n">${esc(F.usd(ta))}</td>
       <td class="n">${chip("under " + F.usd(tb - ta), "", true)}</td><td class="n">${esc(F.pct1(ta / tb))}</td></tr>`;
    const bc = $("#budget-chip");
    bc.textContent = `${F.pct1(ta / tb)} of budget used`;
    bc.className = "chip " + (ta <= tb ? "good" : "serious");

    // Expense mix — nominal categories, one color.
    Charts.bars($("#chart-expense-mix"), {
      rows: b.categories.slice().sort((x, y) => y.actual - x.actual)
        .map((c) => ({ label: c.name, value: c.actual / ta, note: F.usd(c.actual) })),
      format: F.pct0,
      seriesName: "Share of spend"
    });

  }

  function renderUpcoming() {
    if (!need("card-upcoming", "Upcoming major expenses", D.upcomingExpenses)) return;
    // Soonest first.
    const parse = (w) => new Date(w.replace(/^(\w+)\s+(\d{4})$/, "$1 1, $2")).getTime();
    const up = D.upcomingExpenses.slice().sort((a, z) => parse(a.when) - parse(z.when));
    const total = up.reduce((a, e) => a + e.amount, 0);
    $("#tbl-upcoming tbody").innerHTML = up.map((e) => {
      const st = e.status === "Board approved" ? "good"
        : e.status === "Budgeted" ? "good"
        : e.status === "Quote pending" ? "warning" : "";
      return `<tr>
        <td>${esc(e.item)}<span class="sub">${esc(e.category)} · ${esc(e.note)}</span></td>
        <td class="mono">${esc(e.when)}</td>
        <td>${chip(e.status, st, !st)}</td>
        <td class="n">${esc(F.usd(e.amount))}</td>
      </tr>`;
    }).join("");
    $("#tbl-upcoming tfoot").innerHTML =
      `<tr><td colspan="3">Committed and planned over the next six months</td><td class="n">${esc(F.usd(total))}</td></tr>`;
    const rc = $("#reserve-chip");
    const cover = D.capitalReserve - total;
    rc.textContent = `${F.usdk(D.capitalReserve)} reserve · ${F.usdk(cover)} left after`;
    rc.className = "chip " + (cover > total * 0.25 ? "good" : cover > 0 ? "warning" : "critical");
    if (cover <= 0) $("#card-upcoming").dataset.state = "critical";
    else if (cover < total * 0.25) $("#card-upcoming").dataset.state = "warning";
    else delete $("#card-upcoming").dataset.state;
  }

  /* =======================================================================
     Attendance
     ==================================================================== */
  function renderAttendance() {
    if (!need("card-absence", null, D.absenceReasons)) { /* card hidden */ }
    else {
      $("#tbl-absence tbody").innerHTML = D.absenceReasons.map((r) =>
        `<tr><td>${esc(r.reason)}${r.note ? `<span class="sub">${esc(r.note)}</span>` : ""}</td>
         <td class="n">${esc(F.pct0(r.share))}</td></tr>`).join("");
    }
    if (!need("card-attendance", "Attendance", D.attendanceDaily)) return;
    const a = D.attendanceDaily;
    const rates = a.map((d) => d.present / d.enrolled);
    const kpi = (D.kpis || []).find((k) => k.key === "attendance");
    const mtd = kpi ? kpi.value : a.reduce((s, d) => s + d.present / d.enrolled, 0) / a.length;
    Charts.columns($("#chart-attendance"), {
      labels: a.map((d) => d.date.replace("Aug ", "")),
      sublabels: a.map((d) => d.dow),
      values: rates,
      format: F.pct1,
      yFormat: F.pct0,
      height: 214,
      target: { value: D.attendanceTargetRate, label: "TARGET 85%" },
      seriesName: "Attendance",
      tipTitle: (i) => a[i].date + " · " + a[i].dow,
      tipNote: (i) => `${a[i].present} of ${a[i].enrolled} children present`
    });
    twin($("#twin-attendance"), ["Day", "Present", "Enrolled", "Rate"],
      a.map((d) => [`${d.date} (${d.dow})`, F.int(d.present), F.int(d.enrolled), F.pct1(d.present / d.enrolled)]));

    const hit = rates.filter((r) => r >= D.attendanceTargetRate).length;
    const ac = $("#attendance-chip");
    ac.textContent = `${F.pct1(mtd)} MTD · ${hit} of ${a.length} days at target`;
    ac.className = "chip " + (mtd >= D.attendanceTargetRate ? "good" : mtd >= 0.8 ? "warning" : "serious");
    if (mtd < D.attendanceTargetRate) $("#card-attendance").dataset.state = "warning";
    else delete $("#card-attendance").dataset.state;

  }

  /* =======================================================================
     Pipeline & removals
     ==================================================================== */
  function renderFlow() {
    renderRemovals();
    if (!need("card-pipeline", "Enrollment pipeline", D.pipeline, D.pipeline && D.pipeline.stages)) return;
    const p = D.pipeline;
    const total = p.stages.reduce((a, s) => a + s.count, 0);
    Charts.bars($("#chart-pipeline"), {
      rows: p.stages.map((s) => ({ label: s.name, value: s.count, note: s.note })),
      format: F.int,
      ramp: ["--ord-1", "--ord-2", "--ord-3", "--ord-4", "--ord-5"],
      seriesName: "Children"
    });
    $("#pipeline-chip").textContent = `${total} pending`;
    $("#pipeline-stats").innerHTML = [
      { v: F.int(p.referrals30), k: "Referrals, last 30 days" },
      { v: F.pct0(p.conversion), k: "Referral to start" },
      { v: F.int(p.avgDaysToStart) + " d", k: "Avg. days to start" },
      { v: F.int(p.stalled), k: "Stalled over 45 days" }
    ].map((s) => `<div class="stat"><span class="v num">${esc(s.v)}</span><span class="k">${esc(s.k)}</span></div>`).join("");

  }

  function renderRemovals() {
    const r = D.removals;
    if (!need("card-removal-reasons", "Removals", r, r && r.reasons90)) {
      if (!need("card-removals", null, r, r && r.recent)) return;
    }
    if (have(r) && have(r.reasons90)) Charts.bars($("#chart-removals"), {
      rows: r.reasons90.map((x) => ({ label: x.reason, value: x.count })),
      format: F.int,
      colorVar: "--series-2",
      seriesName: "Children"
    });
    if (have(r) && have(r.reasons90)) {
      const n90 = r.reasons90.reduce((a, x) => a + x.count, 0);
      const rc = $("#removals-chip");
      rc.textContent = `${n90} in 90 days${r.ytd ? ` · ${r.ytd} YTD` : ""}`;
      rc.className = "chip";
    }
    if (!need("card-removals", null, r, r && r.recent)) return;
    $("#tbl-removals tbody").innerHTML = r.recent.map((x) =>
      `<tr><td class="mono">${esc(x.date)}</td><td class="mono">${esc(x.record)}</td>
       <td>${esc(x.reason)}</td>
       <td>${chip(x.seat, x.seat.startsWith("Filled") ? "good" : x.seat === "Open" ? "serious" : "warning")}</td></tr>`).join("");
  }

  /* =======================================================================
     People
     ==================================================================== */
  function renderPeople() {
    const s = D.staffing || {};
    if (!need("card-workforce", null, s.stats)) { /* hidden */ }
    if (!need("card-credentials", null, s.credentials)) { /* hidden */ }
    if (!need("card-staff", "Staffing", s.roles)) { renderStaffExtras(s); return; }
    const total = s.roles.reduce((a, r) => a + r.count, 0);
    const open = s.roles.reduce((a, r) => a + r.open, 0);
    Charts.bars($("#chart-staff"), {
      rows: s.roles.map((r) => ({ label: r.role, value: r.count, note: r.open ? `${r.open} open` : "fully staffed" })),
      format: F.int,
      seriesName: "On payroll"
    });
    twin($("#twin-staff"), ["Role", "On payroll", "Open"],
      s.roles.map((r) => [r.role, F.int(r.count), r.open ? F.int(r.open) : "—"]));
    const sc = $("#staff-chip");
    sc.textContent = `${total} on payroll · ${open} open`;
    sc.className = "chip " + (open === 0 ? "good" : open <= 2 ? "warning" : "serious");

    renderStaffExtras(s);
  }

  function renderStaffExtras(s) {
    if (have(s.stats)) {
    const st = s.stats;
    $("#staff-stats").innerHTML = [
      { v: F.int(st.overtimeHours), k: `Overtime hours (target ${st.overtimeTarget})` },
      { v: F.int(st.agencyShifts), k: "Agency shifts filled" },
      { v: F.pct1(st.calloutRate), k: "Call-out rate" },
      { v: F.pct0(st.turnover12mo), k: "Turnover, 12 months" },
      { v: st.nurseToChild, k: "Nurse to child ratio" }
    ].map((x) => `<div class="stat"><span class="v num">${esc(x.v)}</span><span class="k">${esc(x.k)}</span></div>`).join("");
    }
    if (!have(s.credentials)) return;
    $("#tbl-credentials tbody").innerHTML = s.credentials.map((c) =>
      `<tr><td>${esc(c.who)}</td><td>${esc(c.item)}</td>
       <td class="n">${chip(c.due, c.state)}</td></tr>`).join("");
    const urgent = s.credentials.filter((c) => c.state === "critical").length;
    const cc = $("#cred-chip");
    cc.textContent = urgent ? `${urgent} expiring within days` : "none urgent";
    cc.className = "chip " + (urgent ? "critical" : "good");
  }

  /* =======================================================================
     Marketing
     ==================================================================== */
  function renderMarketing() {
    const m = D.marketing || {};
    if (!need("card-tours", null, m.tours)) { /* hidden */ }
    if (!need("card-marketing", null, m.updates)) { /* hidden */ }
    if (!need("card-sources", "Marketing", m.sources90)) { renderMarketingExtras(m); return; }
    const total = m.sources90.reduce((a, s) => a + s.count, 0);
    Charts.bars($("#chart-sources"), {
      rows: m.sources90.map((s) => ({ label: s.source, value: s.count, note: F.pct0(s.count / total) + " of referrals" })),
      format: F.int,
      seriesName: "Referrals"
    });
    twin($("#twin-sources"), ["Source", "Referrals", "Share"],
      m.sources90.map((s) => [s.source, F.int(s.count), F.pct0(s.count / total)]));
    $("#sources-chip").textContent = `${total} referrals`;
    renderMarketingExtras(m);
  }

  function renderMarketingExtras(m) {
    if (have(m.tours)) $("#tour-stats").innerHTML = [
      { v: F.int(m.tours.booked), k: "Tours booked" },
      { v: F.int(m.tours.completed), k: "Tours completed" },
      { v: F.int(m.tours.converted), k: "Converted to start" },
      { v: m.tours.completed ? F.pct0(m.tours.converted / m.tours.completed) : "—", k: "Tour conversion" },
      { v: F.usdk(m.spend90), k: "Spend, last 90 days" },
      { v: F.usd(m.costPerStart), k: "Cost per start" }
    ].map((x) => `<div class="stat"><span class="v num">${esc(x.v)}</span><span class="k">${esc(x.k)}</span></div>`).join("");
    if (!have(m.updates)) return;
    $("#marketing-feed").innerHTML = m.updates.map((u) =>
      `<div class="feed-item">
         <div class="when">${esc(u.date)}</div>
         <div class="body">
           <div class="t">${esc(u.title)}</div>
           <div class="d">${esc(u.detail)}</div>
           <div>${chip(u.tag, u.state === "pending" ? "accent" : u.state)}</div>
         </div>
       </div>`).join("");
  }

  /* =======================================================================
     Task board
     ==================================================================== */
  const DONE_KEY = "akp.tasks.done";
  const readDone = () => {
    try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]")); }
    catch { return new Set(); }
  };
  const writeDone = (set) => {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(set))); } catch { /* private mode */ }
  };
  let taskFilter = "open";

  function isDone(t, done) { return t.status === "Done" || done.has(t.id); }
  function isOverdue(t, done) { return !isDone(t, done) && new Date(t.due + "T00:00:00") < AS_OF; }

  function renderTasks() {
    if (!need("card-tasks", "Task board", D.tasks)) return;
    const done = readDone();
    const all = D.tasks.slice().sort((a, b) => a.due.localeCompare(b.due));
    const view = all.filter((t) => {
      if (taskFilter === "all") return true;
      if (taskFilter === "open") return !isDone(t, done);
      if (taskFilter === "blocked") return t.status === "Blocked";
      if (taskFilter === "overdue") return isOverdue(t, done);
      return true;
    });

    $("#tbl-tasks tbody").innerHTML = view.map((t) => {
      const d = isDone(t, done);
      const over = isOverdue(t, done);
      const statusState = d ? "good" : t.status === "Blocked" ? "critical" : t.status === "In progress" ? "accent" : "";
      return `<tr class="${d ? "is-done" : ""}">
        <td class="check"><input type="checkbox" data-task="${esc(t.id)}" ${d ? "checked" : ""}
             ${t.status === "Done" ? "disabled" : ""} aria-label="Mark ${esc(t.id)} complete"></td>
        <td class="title">${esc(t.title)}${t.note ? `<span class="note">${esc(t.note)}</span>` : ""}</td>
        <td>${esc(t.area)}</td>
        <td>${esc(t.owner)}</td>
        <td><span class="pri ${esc(t.priority)}">${esc(t.priority)}</span></td>
        <td class="n">${esc(shortDate(t.due))}${over ? ` ${chip("overdue", "critical")}` : ""}</td>
        <td>${chip(d ? "Done" : t.status, statusState, !statusState)}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="7" style="color:var(--ink-3);padding:14px 0">Nothing in this view.</td></tr>`;

    const openCount = all.filter((t) => !isDone(t, done)).length;
    const overdue = all.filter((t) => isOverdue(t, done)).length;
    const blocked = all.filter((t) => t.status === "Blocked").length;
    $("#task-count").textContent = `${view.length} shown · ${openCount} open · ${overdue} overdue · ${blocked} blocked`;
    const tc = $("#tasks-chip");
    tc.textContent = overdue ? `${overdue} overdue, ${blocked} blocked` : `${openCount} open`;
    tc.className = "chip " + (overdue ? "critical" : blocked ? "warning" : "good");
    if (overdue) $("#card-tasks").dataset.state = "critical";
    else if (blocked) $("#card-tasks").dataset.state = "warning";
    else delete $("#card-tasks").dataset.state;

    $$("#tbl-tasks input[type=checkbox]").forEach((box) => {
      box.addEventListener("change", () => {
        const set = readDone();
        box.checked ? set.add(box.dataset.task) : set.delete(box.dataset.task);
        writeDone(set);
        renderTasks();
      });
    });
  }

  /* =======================================================================
     Chrome: header, controls, theme
     ==================================================================== */
  function renderChrome() {
    $("#facility-name").textContent = D.meta.facility;
    $("#foot-facility").textContent = D.meta.facility;
    $("#board-name").textContent = D.meta.boardName;
    $("#as-of").textContent = D.meta.asOf;
    $("#period-label").textContent = D.meta.period;
    if (D.meta.sampleData) $("#demo-chip").hidden = false;
    $("#foot-note").innerHTML = D.meta.sampleData
      ? "Figures on this board are <strong>illustrative sample data</strong> for a " +
        D.meta.licensedCapacity + "-seat PPEC, not the center's records. Replace them before anyone makes a decision from this page."
      : "";

    $$(".segmented button[data-range]").forEach((b) => {
      b.addEventListener("click", () => {
        state.range = Number(b.dataset.range);
        $$(".segmented button[data-range]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        renderTrends();
      });
    });
    const pt = $("#proj-toggle");
    pt.addEventListener("click", () => {
      state.projection = !state.projection;
      pt.setAttribute("aria-pressed", String(state.projection));
      renderTrends();
    });
    $$("[data-task-filter]").forEach((b) => {
      b.addEventListener("click", () => {
        taskFilter = b.dataset.taskFilter;
        $$("[data-task-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        renderTasks();
      });
    });

    const root = document.documentElement;
    try {
      const saved = localStorage.getItem("akp.theme");
      if (saved) root.setAttribute("data-theme", saved);
    } catch { /* private mode */ }
    $("#theme-toggle").addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") === "dark" ||
        (!root.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("akp.theme", next); } catch { /* private mode */ }
      document.dispatchEvent(new Event("akp:theme"));
    });
  }

  // A section with nothing left in it takes its heading with it.
  function pruneEmptySections() {
    $$("section.section").forEach((sec) => {
      const cards = $$(".card", sec);
      if (cards.length && cards.every((c) => c.hidden)) sec.hidden = true;
    });
    const note = $("#coverage-note");
    if (!note) return;
    if (!AWAITING.length) { note.hidden = true; return; }
    note.innerHTML = "Waiting on data: <strong>" + AWAITING.map(esc).join("</strong>, <strong>") +
      "</strong>. Those sections stay hidden until their numbers land in <code>data.js</code>.";
  }

  function boot() {
    renderChrome();
    renderLead();
    renderTargets();
    renderTrends();
    renderProjection();
    renderMoney();
    renderAttendance();
    renderFlow();
    renderPeople();
    renderMarketing();
    renderTasks();
    pruneEmptySections();
    // Web fonts change text metrics; re-lay the charts once they land.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => document.dispatchEvent(new Event("akp:theme")));
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();

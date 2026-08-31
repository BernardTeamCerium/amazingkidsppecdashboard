/* =============================================================================
   Amazing Kids PPEC — Operations Board
   Renders every card from window.AKP_DATA. No data is defined in this file.

   Any block in data.js may be null while its source is still being wired up:
   the card hides, a section whose cards all hid drops out, and the footer says
   what is waiting. Nothing renders half-empty and nothing is invented.
   ========================================================================== */

(() => {
  "use strict";
  const D = window.AKP_DATA;
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
  const MONEY = MONTHS.filter((m) => m.revenue != null && m.cost != null);
  const CUR = MONTHS[MONTHS.length - 1];
  const CUR_MONEY = MONEY[MONEY.length - 1];
  const PREV_MONEY = MONEY[MONEY.length - 2];
  const margin = (m) => (m.revenue - m.cost) / m.revenue;

  const FMT = { int: F.int, dec1: F.dec1, dec2: F.dec2, pct0: F.pct0, pct1: F.pct1,
                usd: F.usd, usd0: F.usd, usdk: F.usdk };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chip = (text, state = "", plain = false) =>
    `<span class="chip ${state}${plain ? " plain" : ""}">${esc(text)}</span>`;
  const signed = (v, digits = 1) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(digits);
  const signedUsd = (v) => (v >= 0 ? "+" : "−") + F.usd(Math.abs(v));
  const shortDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  const stats = (items) => items.map((s) =>
    `<div class="stat"><span class="v num">${esc(s.v)}</span><span class="k">${esc(s.k)}</span></div>`).join("");

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
  function renderLead() {
    const lead = $("#lead");
    const h = D.hero;
    if (!have(h) && !have(D.kpis)) { lead.hidden = true; return; }
    lead.innerHTML = (!have(h) ? "" :
      `<article class="card hero-card">
         <div class="card-head"><div class="titles">
           <div class="eyebrow">${esc(h.eyebrow || "Latest close")}</div>
           <h3>${esc(h.label)}</h3>
         </div></div>
         <div class="hero-figure">${h.value.toFixed(1)}<span class="unit">${esc(h.unit)}</span></div>
         <div class="hero-row">
           <span class="delta ${h.delta >= 0 === h.deltaGood ? "up" : "down"}">${signed(h.delta, 2)} ${esc(h.deltaLabel)}</span>
           ${chip("Target " + h.target, "", true)}
         </div>
         <div class="chart" id="hero-spark" style="margin:-4px 0 -2px"></div>
         <p class="card-note">${esc(h.note)}.</p>
       </article>`) +
      (D.kpis || []).map((k) => {
        const good = /^same/.test(k.delta) ? "flat" : k.deltaGood ? "up" : "down";
        return `<article class="card tile"${k.state ? ` data-state="${k.state}"` : ""}>
          <div class="eyebrow">${esc(k.label)}</div>
          <div class="tile-value">${esc(FMT[k.format](k.value))}</div>
          <div class="tile-sub">${esc(k.sub)}</div>
          <div class="tile-foot">
            <span class="delta ${good}">${esc(k.delta)}</span>
            ${k.target !== "—" ? chip("Target " + k.target, "", true) : ""}
          </div>
        </article>`;
      }).join("");
    if (have(h) && MONTHS.length > 1) Charts.sparkline($("#hero-spark"), MONTHS.map((m) => m.adc), { height: 44 });
    else if (have(h)) $("#hero-spark").hidden = true;
  }

  /* ======================= Targets ====================================== */
  function renderTargets() {
    if (!need("card-targets", "Targets", D.targets)) return;
    let onTarget = 0;
    $("#meters").innerHTML = D.targets.map((t) => {
      const ratio = t.direction === "up" ? t.actual / t.target : t.target / t.actual;
      if (ratio >= 1) onTarget++;
      const state = ratio >= 1 ? "good" : ratio >= 0.92 ? "warning" : ratio >= 0.6 ? "serious" : "critical";
      const pct = Math.max(3, Math.min(100, ratio * 100));
      const f = FMT[t.format], aim = t.direction === "up" ? "≥" : "≤";
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
    if (have(D.targetsNote)) $("#targets-note").textContent = D.targetsNote;
    const el = $("#targets-summary");
    el.textContent = `${onTarget} of ${D.targets.length} on target`;
    el.className = "chip " + (onTarget === D.targets.length ? "good" : onTarget ? "warning" : "serious");
  }

  /* ======================= Trend charts ================================= */
  const state = { range: 99 };
  const slice = (rows) => (state.range >= rows.length ? rows : rows.slice(-state.range));
  const yearLabels = (rows) => rows.map((m, i) => {
    const yr = m.full.slice(-2);
    return i === 0 || m.label === "Jan" ? `${m.label} '${yr}` : m.label;
  });

  function legend(node, keys) {
    node.innerHTML = keys.map((k) =>
      `<span class="key"><span class="swatch" style="background:var(${k.varName})"></span>${esc(k.name)}</span>`).join("");
  }

  function renderTrends() {
    // The projection control has nothing to project against — no forecast in the data.
    const pg = $("#proj-group"); if (pg) pg.hidden = true;
    if (MONTHS.length <= 6) { const c = $("#controls"); if (c) c.hidden = true; }

    if (need("card-census", "Census", MONTHS)) {
      const rows = slice(MONTHS), labels = yearLabels(rows), full = rows.map((m) => m.full);
      legend($("#legend-census"), [
        { name: "Children enrolled", varName: "--series-1" },
        { name: "Average daily census", varName: "--series-2" }
      ]);
      Charts.line($("#chart-census"), {
        labels,
        series: [
          { name: "Enrolled", colorVar: "--series-1", values: rows.map((m) => m.enrolled) },
          { name: "Avg daily census", colorVar: "--series-2", values: rows.map((m) => m.adc),
            endFormat: F.dec1, tipFormat: F.dec1 }
        ],
        format: F.int,
        target: have(D.censusTarget) ? { value: D.censusTarget, label: `TARGET ${D.censusTarget}` } : null,
        tipTitle: (i) => full[i],
        tipNote: (i) => `${F.pct1(rows[i].adc / rows[i].enrolled)} attendance · ` +
          `${rows[i].childDays} child-days over ${rows[i].opDays} days`
      });
      twin($("#twin-census"), ["Month", "Enrolled", "On report", "No attendance", "Operating days", "Child-days", "Daily census"],
        rows.map((m) => [m.full, F.int(m.enrolled), F.int(m.onReport), F.int(m.dormant),
          F.int(m.opDays), F.int(m.childDays), F.dec1(m.adc)]));
      const gap = $("#census-gap");
      if (have(D.censusTarget)) {
        // Measure the gap against today's roster, not the month's attendance count.
        const now = have(D.roster) ? D.roster.enrolled : CUR.enrolled;
        const short = D.censusTarget - now;
        gap.textContent = short > 0
          ? `${now} enrolled today · ${short} short of ${D.censusTarget}`
          : `${now} enrolled today · target of ${D.censusTarget} met`;
      } else gap.hidden = true;
    }

    if (!need("card-finance", "Revenue and cost", MONEY)) {
      const m = document.getElementById("card-margin"); if (m) m.hidden = true;
      return;
    }
    const rows = slice(MONEY), labels = yearLabels(rows), full = rows.map((m) => m.full);

    legend($("#legend-finance"), [
      { name: "Revenue", varName: "--series-1" },
      { name: "Operating cost", varName: "--series-2" }
    ]);
    Charts.line($("#chart-finance"), {
      labels,
      series: [
        { name: "Revenue", colorVar: "--series-1", values: rows.map((m) => m.revenue), endFormat: F.usdk, tipFormat: F.usd },
        { name: "Operating cost", colorVar: "--series-2", values: rows.map((m) => m.cost), endFormat: F.usdk, tipFormat: F.usd }
      ],
      format: F.usdk,
      yZero: true,
      target: have(D.costTarget) ? { value: D.costTarget, label: `COST TARGET ${F.usdk(D.costTarget)}` } : null,
      tipTitle: (i) => full[i],
      tipNote: (i) => `Net ${F.usd(rows[i].revenue - rows[i].cost)} · ${F.pct1(margin(rows[i]))} margin` +
        (rows[i].childDays ? ` · ${F.usd(rows[i].revenue / rows[i].childDays)} per child-day` : "")
    });
    twin($("#twin-finance"), ["Month", "Revenue", "Operating cost", "Net", "Margin", "Per child-day"],
      rows.map((m) => [m.full, F.usd(m.revenue), F.usd(m.cost), F.usd(m.revenue - m.cost),
        F.pct1(margin(m)), m.childDays ? F.usd(m.revenue / m.childDays) : "—"]));
    $("#finance-note").textContent =
      `${CUR_MONEY.full}: ${F.usdk(CUR_MONEY.revenue)} in, ${F.usdk(CUR_MONEY.revenue - CUR_MONEY.cost)} net`;
    if (have(D.financeNote)) $("#finance-caveat").textContent = D.financeNote;

    Charts.line($("#chart-margin"), {
      labels,
      series: [{ name: "Net margin", colorVar: "--series-1", values: rows.map(margin),
                 endFormat: F.pct1, tipFormat: F.pct1 }],
      format: F.pct0,
      height: 196,
      tipTitle: (i) => full[i],
      tipNote: (i) => `${F.usd(rows[i].revenue - rows[i].cost)} on ${F.usd(rows[i].revenue)}`
    });
    twin($("#twin-margin"), ["Month", "Net", "Margin"],
      rows.map((m) => [m.full, F.usd(m.revenue - m.cost), F.pct1(margin(m))]));

    const mv = margin(CUR_MONEY), pv = PREV_MONEY ? margin(PREV_MONEY) : null;
    const mc = $("#margin-chip");
    mc.textContent = `${F.pct1(mv)} in ${CUR_MONEY.label}` +
      (pv === null ? "" : ` · ${signed((mv - pv) * 100)} pts vs. ${PREV_MONEY.label}`);
    mc.className = "chip " + (mv >= 0.15 ? "good" : mv >= 0.05 ? "warning" : mv >= 0 ? "serious" : "critical");
  }

  /* ======================= Projection =================================== */
  function renderProjection() {
    if (!need("card-projection", "Projection", D.projection, D.projection && D.projection.months)) {
      const a = document.getElementById("card-assumptions"); if (a) a.hidden = true;
      return;
    }
    const p = D.projection, m = p.months;

    Charts.columns($("#chart-projection"), {
      labels: m.map((x) => x.label),
      sublabels: m.map((x) => x.full.slice(-4)),
      values: m.map((x) => x.revenue),
      format: F.usd,
      yFormat: F.usdk,
      height: 186,
      seriesName: "Projected revenue",
      tipTitle: (i) => m[i].full,
      tipNote: (i) => `${F.dec1(m[i].adc)} children/day × ${m[i].opDays} days × ${F.usd(p.perDiem)}`
    });

    $("#tbl-projection tbody").innerHTML = m.map((x) =>
      `<tr>
        <td>${esc(x.full)}<span class="sub">${esc(x.closureNote)}</span></td>
        <td class="n">${x.weekdays}</td>
        <td class="n">${x.closures || "—"}</td>
        <td class="n">${x.opDays}</td>
        <td class="n">${x.enrolled}</td>
        <td class="n">${esc(F.dec1(x.adc))}</td>
        <td class="n">${esc(F.usd(x.revenue))}</td>
      </tr>`).join("");
    $("#tbl-projection tfoot").innerHTML =
      `<tr><td>Total, September to December</td>
       <td class="n">${p.totalWeekdays}</td><td class="n">${p.totalWeekdays - p.totalOpDays}</td>
       <td class="n">${p.totalOpDays}</td><td class="n"></td><td class="n"></td>
       <td class="n">${esc(F.usd(p.totalRevenue))}</td></tr>`;
    $("#projection-chip").textContent =
      `${F.usdk(p.totalRevenue)} over ${p.totalOpDays} operating days`;

    if (!need("card-assumptions", null, p.assumptions)) return;
    $("#projection-stats").innerHTML = stats([
      { v: F.pct0(p.attendanceRate), k: "Attendance assumed" },
      { v: "$" + p.perDiem.toFixed(2), k: "Per child-day" },
      { v: F.usdk(p.perChildPerMonth), k: "Per child, per month" },
      { v: F.usdk(p.pendingValue), k: "The 4 pending, Oct–Dec" }
    ]);
    $("#assumptions").innerHTML = p.assumptions.map((a) => `<li>${esc(a)}</li>`).join("");
    if (have(p.caveat)) $("#projection-caveat").textContent = p.caveat;
  }

  /* ======================= Cost structure & mix ========================= */
  function renderCosts() {
    if (!need("card-costs", "Cost structure", D.costLines, D.costLines && D.costLines.lines)) {
      const mix = document.getElementById("card-mix"); if (mix) mix.hidden = true;
      return;
    }
    const c = D.costLines;
    const lines = c.lines.slice().sort((a, b) => b.current - a.current);
    const totC = lines.reduce((a, l) => a + l.current, 0);
    const totP = lines.reduce((a, l) => a + l.prior, 0);

    $("#costs-title").textContent = `Where the cost went — ${c.current}`;
    $("#th-prior").textContent = c.prior;
    $("#th-current").textContent = c.current;
    $("#tbl-costs tbody").innerHTML = lines.map((l) => {
      const d = l.current - l.prior;
      const big = Math.abs(d) >= totC * 0.02;
      const sev = !big ? "" : d > 0 ? "serious" : "good";
      return `<tr>
        <td>${esc(l.name)}</td>
        <td class="n">${esc(F.usd(l.prior))}</td>
        <td class="n">${esc(F.usd(l.current))}</td>
        <td class="n">${Math.abs(d) < 1 ? chip("flat", "", true) : chip(signedUsd(d), sev, !big)}</td>
      </tr>`;
    }).join("");
    const dt = totC - totP;
    $("#tbl-costs tfoot").innerHTML =
      `<tr><td>Total operating cost</td><td class="n">${esc(F.usd(totP))}</td>
       <td class="n">${esc(F.usd(totC))}</td>
       <td class="n">${chip(signedUsd(dt), dt > 0 ? "serious" : "good")}</td></tr>`;
    const cc = $("#costs-chip");
    const overBy = have(D.costTarget) ? totC - D.costTarget : null;
    cc.textContent = overBy === null ? F.usd(totC)
      : overBy > 0 ? `${F.usdk(overBy)} over the ${F.usdk(D.costTarget)} target`
                   : `${F.usdk(-overBy)} under the ${F.usdk(D.costTarget)} target`;
    cc.className = "chip " + (overBy === null ? "" : overBy > 0 ? "critical" : "good");
    if (overBy !== null && overBy > 0) $("#card-costs").dataset.state = "critical";

    // Composition — nominal lines, one color, small tail folded into Other.
    const top = lines.slice(0, 8);
    const rest = lines.slice(8).reduce((a, l) => a + l.current, 0);
    $("#mix-title").textContent = `Share of ${c.current} cost`;
    Charts.bars($("#chart-mix"), {
      rows: top.map((l) => ({ label: l.name, value: l.current / totC, note: F.usd(l.current) }))
        .concat(rest > 0 ? [{ label: "Everything else", value: rest / totC, note: F.usd(rest) }] : []),
      format: F.pct0,
      seriesName: "Share of cost"
    });
  }

  /* ======================= Cash ========================================= */
  function renderCash() {
    if (!need("card-cash", "Cash position", D.cash, D.cash && D.cash.lines)) return;
    const c = D.cash;
    $("#cash-title").textContent = `Cash and obligations — ${c.asOf}`;
    const obligations = c.lines.filter((l) => l.value < 0).reduce((a, l) => a + l.value, 0);
    const cashLine = c.lines.find((l) => l.value > 0);
    const net = c.lines.reduce((a, l) => a + l.value, 0);

    $("#cash-stats").innerHTML = stats([
      { v: F.usdk(cashLine ? cashLine.value : 0), k: "Cash in bank" },
      { v: F.usdk(-obligations), k: "Current obligations" },
      { v: F.usdk(net), k: "Cash net of obligations" },
      { v: F.usdk(c.ytdNet), k: "Net income, year to date" },
      { v: F.usdk(c.ytdNetPrior), k: "Same period last year" },
      { v: F.usdk(c.totalEquity), k: "Total equity" }
    ]);
    $("#tbl-cash tbody").innerHTML = c.lines.map((l) =>
      `<tr><td>${esc(l.name)}</td>
       <td class="n">${esc(F.usd(l.value))}</td>
       <td>${l.prior != null ? chip(`${F.usd(l.prior)} ${esc(c.priorLabel)}`, "", true) : ""}</td></tr>`).join("");
    $("#tbl-cash tfoot").innerHTML =
      `<tr><td>Cash net of current obligations</td><td class="n">${esc(F.usd(net))}</td><td></td></tr>`;
    const chipEl = $("#cash-chip");
    chipEl.textContent = net > 0 ? `${F.usdk(net)} net of obligations` : `${F.usdk(net)} short of obligations`;
    chipEl.className = "chip " + (net > 0 ? "good" : "critical");
    if (have(c.note)) $("#cash-note").textContent = c.note;
  }

  /* ======================= Attendance & rooms =========================== */
  function renderAttendance() {
    renderRooms();
    if (!need("card-attendance", "Attendance", MONTHS)) return;
    const a = MONTHS;
    const rate = (m) => m.adc / m.enrolled;
    Charts.columns($("#chart-attendance"), {
      labels: a.map((m) => m.label),
      sublabels: a.map((m) => m.full.slice(-4)),
      values: a.map(rate),
      format: F.pct1,
      yFormat: F.pct0,
      height: 214,
      target: have(D.attendanceTargetRate)
        ? { value: D.attendanceTargetRate, label: "TARGET " + F.pct0(D.attendanceTargetRate) } : null,
      seriesName: "Attendance",
      tipTitle: (i) => a[i].full,
      tipNote: (i) => `${F.dec1(a[i].adc)} of ${a[i].enrolled} enrolled · ${a[i].childDays} child-days`
    });
    twin($("#twin-attendance"), ["Month", "Enrolled", "Operating days", "Child-days", "Daily census", "Attendance rate"],
      a.map((m) => [m.full, F.int(m.enrolled), F.int(m.opDays), F.int(m.childDays), F.dec1(m.adc), F.pct1(rate(m))]));

    const cur = a[a.length - 1], prev = a[a.length - 2];
    const ac = $("#attendance-chip");
    ac.textContent = `${F.pct1(rate(cur))} in ${cur.label}` +
      (prev ? ` · ${signed((rate(cur) - rate(prev)) * 100)} pts vs. ${prev.label}` : "");
    ac.className = "chip " + (rate(cur) >= 0.85 ? "good" : rate(cur) >= 0.75 ? "warning" : "serious");
  }

  function renderRooms() {
    if (!need("card-rooms", null, D.rooms, D.rooms && D.rooms.list)) return;
    const r = D.rooms;
    $("#rooms-eyebrow").textContent = r.month;
    Charts.bars($("#chart-rooms"), {
      rows: r.list.map((x) => ({ label: x.name, value: x.adc,
        note: `${x.attending} attending of ${x.onReport} on the report` })),
      format: F.dec1,
      seriesName: "Daily census"
    });
    const totalAttending = r.list.reduce((a, x) => a + x.attending, 0);
    $("#rooms-stats").innerHTML = stats([
      { v: F.int(totalAttending), k: "Children attending" },
      { v: F.int(r.list.length), k: "Rooms in use" }
    ].concat(have(r.partnerSchool)
      ? [{ v: F.int(r.partnerSchool.children), k: "At the partner school" }] : []));
    if (have(r.partnerSchool)) {
      $("#rooms-note").textContent =
        `${r.partnerSchool.children} of the children are enrolled at ${r.partnerSchool.name}. ` +
        `Bars are average daily census, so they add to the centre's ${F.dec1(CUR.adc)}.`;
    }
  }

  /* ======================= Roster movement ============================== */
  function renderRoster() {
    if (need("card-dormant", "Roster hygiene", MONTHS)) {
      Charts.columns($("#chart-dormant"), {
        labels: MONTHS.map((m) => m.label),
        sublabels: MONTHS.map((m) => m.full.slice(-4)),
        values: MONTHS.map((m) => m.dormant),
        format: F.int,
        height: 196,
        seriesName: "No attendance",
        tipTitle: (i) => MONTHS[i].full,
        tipNote: (i) => `${MONTHS[i].onReport} on the report, ${MONTHS[i].enrolled} attended`
      });
      const dc = $("#dormant-chip");
      dc.textContent = `${CUR.dormant} of ${CUR.onReport} on the report in ${CUR.label}`;
      dc.className = "chip " + (CUR.dormant <= 2 ? "good" : CUR.dormant <= 5 ? "warning" : "serious");
    }

    const moved = MONTHS.filter((m) => m.started != null);
    if (!need("card-movement", null, moved)) return;
    $("#tbl-movement tbody").innerHTML = moved.map((m) => {
      const net = m.started - m.stopped;
      return `<tr>
        <td>${esc(m.full)}</td>
        <td class="n">${m.started || "—"}</td>
        <td class="n">${m.stopped || "—"}</td>
        <td class="n">${net === 0 ? chip("flat", "", true) : chip(signed(net, 0), net > 0 ? "good" : "serious")}</td>
        <td class="n">${F.int(m.enrolled)}</td>
      </tr>`;
    }).join("");
    const started = moved.reduce((a, m) => a + m.started, 0);
    const stopped = moved.reduce((a, m) => a + m.stopped, 0);
    $("#movement-chip").textContent = `${started} started, ${stopped} stopped since ${moved[0].label}`;
  }

  /* ======================= Marketing ==================================== */
  function renderMarketing() {
    if (!need("card-adspend", "Marketing", D.adSpend, D.adSpend && D.adSpend.months)) return;
    const a = D.adSpend;
    Charts.columns($("#chart-adspend"), {
      labels: a.months.map((m) => m.label),
      values: a.months.map((m) => m.value),
      format: F.usd,
      yFormat: F.usdk,
      height: 190,
      seriesName: "Spend",
      tipTitle: (i) => a.months[i].label
    });
    $("#adspend-stats").innerHTML = stats([
      { v: F.usdk(a.ytd), k: "Year to date" },
      { v: F.usdk(a.ytdPrior), k: "Same period last year" },
      { v: F.usd(a.months[a.months.length - 1].value), k: "Latest month" }
    ]);
    const ch = $("#adspend-chip");
    ch.textContent = `${F.pct0(a.ytd / a.ytdPrior)} of last year's spend`;
    ch.className = "chip";
    if (have(a.note)) $("#adspend-note").textContent = a.note;
  }

  /* ======================= Task board =================================== */
  const DONE_KEY = "akp.tasks.done";
  const readDone = () => {
    try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]")); } catch { return new Set(); }
  };
  const writeDone = (set) => {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(set))); } catch { /* private mode */ }
  };
  let taskFilter = "open";
  const isDone = (t, done) => t.status === "Done" || done.has(t.id);
  const isOverdue = (t, done) => !!t.due && !isDone(t, done) && new Date(t.due + "T00:00:00") < AS_OF;

  function renderTasks() {
    if (!need("card-tasks", "Task board", D.tasks)) return;
    const done = readDone();
    // Undated work sorts last — it is not late, it is unscheduled.
    const all = D.tasks.slice().sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    const view = all.filter((t) => {
      if (taskFilter === "all") return true;
      if (taskFilter === "open") return !isDone(t, done);
      if (taskFilter === "blocked") return t.status === "Blocked";
      if (taskFilter === "overdue") return isOverdue(t, done);
      return true;
    });

    $("#tbl-tasks tbody").innerHTML = view.map((t) => {
      const d = isDone(t, done), over = isOverdue(t, done);
      const statusState = d ? "good" : t.status === "Blocked" ? "critical" : t.status === "In progress" ? "accent" : "";
      return `<tr class="${d ? "is-done" : ""}">
        <td class="check"><input type="checkbox" data-task="${esc(t.id)}" ${d ? "checked" : ""}
             ${t.status === "Done" ? "disabled" : ""} aria-label="Mark ${esc(t.id)} complete"></td>
        <td class="title">${esc(t.title)}${t.note ? `<span class="note">${esc(t.note)}</span>` : ""}</td>
        <td>${esc(t.area)}</td>
        <td>${esc(t.owner)}</td>
        <td><span class="pri ${esc(t.priority)}">${esc(t.priority)}</span></td>
        <td class="n">${t.due ? esc(shortDate(t.due)) : `<span class="chip plain">no date</span>`}${over ? ` ${chip("overdue", "critical")}` : ""}</td>
        <td>${chip(d ? "Done" : t.status, statusState, !statusState)}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="7" style="color:var(--ink-3);padding:14px 0">Nothing in this view.</td></tr>`;

    const openCount = all.filter((t) => !isDone(t, done)).length;
    const overdue = all.filter((t) => isOverdue(t, done)).length;
    const blocked = all.filter((t) => t.status === "Blocked").length;
    const undated = all.filter((t) => !t.due && !isDone(t, done)).length;
    $("#task-count").textContent =
      `${view.length} shown · ${openCount} open · ${overdue} overdue · ${undated} with no date`;
    const tc = $("#tasks-chip");
    tc.textContent = overdue ? `${overdue} overdue` : blocked ? `${blocked} blocked` : `${openCount} open`;
    tc.className = "chip " + (overdue ? "critical" : blocked ? "warning" : undated ? "warning" : "good");
    if (overdue) $("#card-tasks").dataset.state = "critical";
    else delete $("#card-tasks").dataset.state;
    if (have(D.tasksNote)) $("#tasks-note").textContent = D.tasksNote;

    $$("#tbl-tasks input[type=checkbox]").forEach((box) => {
      box.addEventListener("change", () => {
        const set = readDone();
        box.checked ? set.add(box.dataset.task) : set.delete(box.dataset.task);
        writeDone(set);
        renderTasks();
      });
    });
  }

  /* ======================= Chrome ======================================= */
  function renderChrome() {
    renderBrand();
    $("#facility-name").textContent = D.meta.facility;
    $("#foot-facility").textContent = D.meta.facility;
    $("#board-name").textContent = D.meta.boardName;
    $("#as-of").textContent = D.meta.asOf;
    $("#period-label").textContent = D.meta.period;
    if (D.meta.sampleData) $("#demo-chip").hidden = false;
    if (have(D.meta.sourceNote)) $("#foot-source").textContent = D.meta.sourceNote;

    $$(".segmented button[data-range]").forEach((b) => {
      b.addEventListener("click", () => {
        state.range = Number(b.dataset.range);
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

  // The logo carries the facility name itself, so when it loads the wordmark
  // beside it would be a second copy — drop it and keep the board name.
  // If the file is missing or fails to load we fall back to the monogram.
  function renderBrand() {
    const img = $("#brand-logo"), mark = $("#brand-mark"), text = $("#facility-name");
    if (!img || !have(D.meta.logo)) return;
    img.addEventListener("load", () => {
      img.hidden = false;
      if (mark) mark.hidden = true;
      if (text) text.hidden = true;
    });
    img.addEventListener("error", () => {
      img.hidden = true;
      if (mark) mark.hidden = false;
      if (text) text.hidden = false;
    });
    img.alt = D.meta.logoAlt || D.meta.facility;
    img.src = D.meta.logo;
  }

  function pruneEmptySections() {
    $$("section.section").forEach((sec) => {
      const cards = $$(".card", sec);
      if (cards.length && cards.every((c) => c.hidden)) sec.hidden = true;
    });
    const note = $("#coverage-note");
    if (!note) return;
    if (!AWAITING.length) { note.hidden = true; return; }
    note.hidden = false;
    note.innerHTML = "Waiting on data: <strong>" + AWAITING.map(esc).join("</strong>, <strong>") +
      "</strong>. Those sections stay hidden until their numbers land in <code>data.js</code>.";
  }

  function boot() {
    renderChrome();
    renderLead();
    renderTargets();
    renderTrends();
    renderProjection();
    renderCosts();
    renderCash();
    renderAttendance();
    renderRoster();
    renderMarketing();
    renderTasks();
    pruneEmptySections();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => document.dispatchEvent(new Event("akp:theme")));
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();

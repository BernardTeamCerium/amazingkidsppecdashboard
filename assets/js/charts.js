/* =============================================================================
   Chart primitives — hand-rolled SVG. No charting library.
   Four forms only: line (with projection), column, horizontal bar, sparkline.
   Shared rules: 2px lines, ≤24px bars with 4px rounded data-ends, 2px surface
   gaps and rings, hairline solid grid, selective direct labels, one y-axis.
   ========================================================================== */

const Charts = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs = {}) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    return n;
  };
  const css = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* -- number formatting -------------------------------------------------- */
  const fmt = {
    int:   (v) => Math.round(v).toLocaleString("en-US"),
    dec1:  (v) => v.toFixed(1),
    pct0:  (v) => Math.round(v * 100) + "%",
    pct1:  (v) => (v * 100).toFixed(1) + "%",
    usd:   (v) => "$" + Math.round(v).toLocaleString("en-US"),
    usdk:  (v) => (Math.abs(v) >= 1000 ? "$" + (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "K" : "$" + Math.round(v)),
    usdk0: (v) => "$" + Math.round(v / 1000) + "K"
  };

  /* -- rounded data-end paths --------------------------------------------- */
  // Column: square at the baseline, 4px rounded cap on top.
  function columnPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h));
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
  }
  // Horizontal bar: square at the baseline (left), 4px rounded tip on the right.
  function barPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w, h / 2));
    return `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`;
  }

  /* -- nice axis ticks ----------------------------------------------------- */
  function ticks(min, max, count = 4) {
    if (max === min) max = min + 1;
    const raw = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const out = [];
    for (let v = lo; v <= hi + step / 1000; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }

  /* -- tooltip ------------------------------------------------------------- */
  function makeTip(host) {
    let tip = host.querySelector(".chart-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "chart-tip";
      host.appendChild(tip);
    }
    return {
      show(x, y, html) {
        tip.innerHTML = html;
        const w = host.clientWidth;
        tip.style.left = Math.max(70, Math.min(w - 70, x)) + "px";
        tip.style.top = Math.max(34, y - 10) + "px";
        tip.dataset.show = "1";
      },
      hide() { tip.dataset.show = "0"; }
    };
  }

  const tipRows = (rows) =>
    rows.map((r) =>
      `<div class="tip-row">${r.color ? `<span class="sw" style="background:${r.color}"></span>` : ""}` +
      `<span>${r.label}</span><span class="v">${r.value}</span></div>`).join("");

  /* -- responsive host ----------------------------------------------------- */
  function mount(host, draw) {
    const render = () => {
      const w = host.clientWidth;
      if (!w) return;
      const old = host.querySelector("svg");
      if (old) old.remove();
      host.insertBefore(draw(w), host.firstChild);
    };
    render();
    // Re-mounting the same host (a filter change) must not stack observers.
    if (host.__akpRO) host.__akpRO.disconnect();
    if (window.ResizeObserver) {
      let last = host.clientWidth;
      const ro = new ResizeObserver(() => {
        if (Math.abs(host.clientWidth - last) > 1) { last = host.clientWidth; render(); }
      });
      ro.observe(host);
      host.__akpRO = ro;
    }
    if (host.__akpTheme) document.removeEventListener("akp:theme", host.__akpTheme);
    host.__akpTheme = render;
    document.addEventListener("akp:theme", render);
    return render;
  }

  /* =========================================================================
     LINE — 1..2 series on one axis, optional projected tail, optional target
     reference line. Crosshair tooltip + arrow-key navigation.
     ====================================================================== */
  function line(host, opts) {
    const {
      labels, series, format = fmt.int, height = 224,
      projectFrom = null, target = null, yZero = false, tipTitle = (i) => labels[i]
    } = opts;
    const tip = makeTip(host);
    let focus = -1;

    const draw = (W) => {
      const surface = css("--chart-bg") || "#fff";
      const M = { t: 16, r: 54, b: 26, l: 46 };
      const H = height, iw = Math.max(60, W - M.l - M.r), ih = H - M.t - M.b;

      const all = series.flatMap((s) => s.values).concat(target ? [target.value] : []);
      let lo = Math.min(...all), hi = Math.max(...all);
      if (yZero) lo = 0;
      const pad = (hi - lo) * 0.12 || 1;
      const tk = ticks(yZero ? 0 : lo - pad, hi + pad, 4);
      const yMin = tk[0], yMax = tk[tk.length - 1];
      const X = (i) => M.l + (labels.length === 1 ? iw / 2 : (i * iw) / (labels.length - 1));
      const Y = (v) => M.t + ih - ((v - yMin) / (yMax - yMin)) * ih;

      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });

      // projected region wash + label
      if (projectFrom !== null && projectFrom < labels.length) {
        const x0 = X(projectFrom - 0.5 < 0 ? 0 : projectFrom) - (iw / (labels.length - 1)) / 2;
        svg.appendChild(el("rect", {
          x: x0, y: M.t, width: M.l + iw - x0, height: ih,
          fill: css("--surface-3"), opacity: .55
        }));
        const pl = el("text", { x: x0 + 6, y: M.t + ih - 6, class: "ref-label" });
        pl.textContent = "PROJECTED";
        svg.appendChild(pl);
      }

      // gridlines + y ticks
      tk.forEach((v) => {
        svg.appendChild(el("line", { x1: M.l, x2: M.l + iw, y1: Y(v), y2: Y(v), class: "grid-line" }));
        const t = el("text", { x: M.l - 8, y: Y(v) + 3.5, class: "tick", "text-anchor": "end" });
        t.textContent = format(v);
        svg.appendChild(t);
      });
      svg.appendChild(el("line", { x1: M.l, x2: M.l + iw, y1: M.t + ih, y2: M.t + ih, class: "axis-line" }));

      // target reference
      if (target) {
        svg.appendChild(el("line", { x1: M.l, x2: M.l + iw, y1: Y(target.value), y2: Y(target.value), class: "ref-line" }));
        const t = el("text", { x: M.l + iw, y: Y(target.value) - 5, class: "ref-label", "text-anchor": "end" });
        t.textContent = target.label;
        svg.appendChild(t);
      }

      // x labels — thinned so they never collide
      const every = Math.ceil((labels.length * 34) / iw);
      let lastX = -Infinity;
      labels.forEach((l, i) => {
        const forced = i === labels.length - 1;
        if (i % every !== 0 && !forced) return;
        if (X(i) - lastX < 30) return;          // no crowding at the tail
        lastX = X(i);
        const t = el("text", { x: X(i), y: H - 8, class: "tick", "text-anchor": "middle" });
        t.textContent = l;
        svg.appendChild(t);
      });

      // series
      series.forEach((s) => {
        const color = css(s.colorVar);
        const solidEnd = projectFrom === null ? s.values.length : Math.min(projectFrom, s.values.length);
        const d = (from, to) => s.values.slice(from, to)
          .map((v, k) => `${k === 0 ? "M" : "L"}${X(from + k)},${Y(v)}`).join(" ");
        svg.appendChild(el("path", {
          d: d(0, solidEnd), fill: "none", stroke: color,
          "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round"
        }));
        if (projectFrom !== null && projectFrom < s.values.length) {
          svg.appendChild(el("path", {
            d: d(Math.max(0, projectFrom - 1), s.values.length), fill: "none", stroke: color,
            "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round",
            "stroke-dasharray": "2 5", opacity: .85
          }));
        }
        // endpoint marker with a 2px surface ring
        const last = s.values.length - 1;
        svg.appendChild(el("circle", {
          cx: X(last), cy: Y(s.values[last]), r: 4.5,
          fill: color, stroke: surface, "stroke-width": 2
        }));
        // one direct label per series, at the end
        const lab = el("text", {
          x: X(last) + 9, y: Y(s.values[last]) + 4, class: "dlabel"
        });
        lab.textContent = (s.endFormat || format)(s.values[last]);
        svg.appendChild(lab);
      });

      // hover layer
      const cross = el("line", { x1: 0, x2: 0, y1: M.t, y2: M.t + ih, class: "ref-line", opacity: 0 });
      svg.appendChild(cross);
      const dots = series.map((s) => {
        const c = el("circle", { r: 4.5, fill: css(s.colorVar), stroke: surface, "stroke-width": 2, opacity: 0 });
        svg.appendChild(c);
        return c;
      });

      const at = (i) => {
        cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i)); cross.setAttribute("opacity", .8);
        series.forEach((s, k) => {
          dots[k].setAttribute("cx", X(i)); dots[k].setAttribute("cy", Y(s.values[i]));
          dots[k].setAttribute("opacity", 1);
        });
        tip.show(X(i), Y(Math.max(...series.map((s) => s.values[i]))), 
          `<div class="tip-title">${tipTitle(i)}</div>` +
          tipRows(series.map((s) => ({ color: css(s.colorVar), label: s.name, value: (s.tipFormat || format)(s.values[i]) }))) +
          (opts.tipNote ? `<div class="tip-note">${opts.tipNote(i)}</div>` : ""));
        focus = i;
      };
      const off = () => { cross.setAttribute("opacity", 0); dots.forEach((d) => d.setAttribute("opacity", 0)); tip.hide(); focus = -1; };

      const slot = iw / Math.max(1, labels.length - 1);
      labels.forEach((_, i) => {
        const r = el("rect", {
          x: X(i) - slot / 2, y: M.t, width: slot, height: ih, fill: "transparent"
        });
        r.addEventListener("mouseenter", () => at(i));
        svg.appendChild(r);
      });
      svg.addEventListener("mouseleave", off);
      host.tabIndex = 0;
      host.onkeydown = (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const n = focus < 0 ? 0 : focus + (e.key === "ArrowRight" ? 1 : -1);
          at(Math.max(0, Math.min(labels.length - 1, n)));
        } else if (e.key === "Escape") off();
      };
      host.onblur = off;
      return svg;
    };
    return mount(host, draw);
  }

  /* =========================================================================
     COLUMN — one series, optional target hairline. Per-mark hover.
     ====================================================================== */
  function columns(host, opts) {
    const {
      labels, values, colorVar = "--series-1", format = fmt.int, height = 200,
      target = null, yFormat = null, tipTitle = (i) => labels[i], states = null
    } = opts;
    const tip = makeTip(host);

    const draw = (W) => {
      const M = { t: 14, r: 12, b: 30, l: 42 };
      const H = height, iw = Math.max(60, W - M.l - M.r), ih = H - M.t - M.b;
      // Columns always grow from zero — a truncated baseline misstates bar length.
      const hi = Math.max(...values, target ? target.value : 0);
      const tk = ticks(0, hi * 1.08, 4);
      const yMin = tk[0], yMax = tk[tk.length - 1];
      const Y = (v) => M.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
      const band = iw / values.length;
      const bw = Math.min(24, Math.max(4, band - 6));      // ≤24px, air in the band
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });

      tk.forEach((v) => {
        svg.appendChild(el("line", { x1: M.l, x2: M.l + iw, y1: Y(v), y2: Y(v), class: "grid-line" }));
        const t = el("text", { x: M.l - 8, y: Y(v) + 3.5, class: "tick", "text-anchor": "end" });
        t.textContent = (yFormat || format)(v);
        svg.appendChild(t);
      });
      svg.appendChild(el("line", { x1: M.l, x2: M.l + iw, y1: M.t + ih, y2: M.t + ih, class: "axis-line" }));

      if (target) {
        svg.appendChild(el("line", { x1: M.l, x2: M.l + iw, y1: Y(target.value), y2: Y(target.value), class: "ref-line" }));
        const t = el("text", { x: M.l + iw, y: Y(target.value) - 5, class: "ref-label", "text-anchor": "end" });
        t.textContent = target.label;
        svg.appendChild(t);
      }

      values.forEach((v, i) => {
        const x = M.l + band * i + (band - bw) / 2;
        const y = Y(v), h = M.t + ih - y;
        const color = states ? css(states[i]) : css(colorVar);
        const p = el("path", { d: columnPath(x, y, bw, Math.max(1, h), 4), fill: color });
        svg.appendChild(p);
        const hit = el("rect", { x: M.l + band * i, y: M.t, width: band, height: ih, fill: "transparent" });
        hit.addEventListener("mouseenter", () => {
          tip.show(x + bw / 2, y, `<div class="tip-title">${tipTitle(i)}</div>` +
            tipRows([{ color, label: opts.seriesName || "Value", value: format(v) }]) +
            (opts.tipNote ? `<div class="tip-note">${opts.tipNote(i)}</div>` : ""));
        });
        svg.appendChild(hit);
      });
      svg.addEventListener("mouseleave", () => tip.hide());

      const every = Math.ceil((labels.length * 40) / iw);
      labels.forEach((l, i) => {
        if (i % every !== 0 && i !== labels.length - 1) return;
        const t = el("text", { x: M.l + band * i + band / 2, y: H - 14, class: "tick", "text-anchor": "middle" });
        t.textContent = l;
        svg.appendChild(t);
        if (opts.sublabels) {
          const s = el("text", { x: M.l + band * i + band / 2, y: H - 3, class: "tick", "text-anchor": "middle", opacity: .75 });
          s.textContent = opts.sublabels[i];
          svg.appendChild(s);
        }
      });
      return svg;
    };
    return mount(host, draw);
  }

  /* =========================================================================
     BAR — horizontal, one color per set (or an ordinal ramp for ordered
     stages). Value labels ride the tip; labels sit above each bar.
     ====================================================================== */
  function bars(host, opts) {
    const { rows, format = fmt.int, colorVar = "--series-1", ramp = null, height = null } = opts;
    const tip = makeTip(host);

    const draw = (W) => {
      const rowH = 32, barH = 14, labelH = 15;
      const M = { t: 4, r: 4, b: 4, l: 0 };
      const H = height || M.t + rows.length * rowH + M.b;
      const maxV = Math.max(...rows.map((r) => r.value), 1);
      const valW = 58;
      const iw = Math.max(40, W - valW - 4);
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });

      rows.forEach((r, i) => {
        const top = M.t + i * rowH;
        const name = el("text", { x: 0, y: top + 10, class: "bar-name" });
        name.textContent = r.label;
        svg.appendChild(name);

        const w = Math.max(2, (r.value / maxV) * iw);
        const color = ramp ? css(ramp[Math.min(i, ramp.length - 1)]) : css(r.colorVar || colorVar);
        svg.appendChild(el("path", { d: barPath(0, top + labelH, w, barH, 4), fill: color }));

        const v = el("text", { x: w + 8, y: top + labelH + barH - 2.5, class: "dlabel" });
        v.textContent = format(r.value);
        svg.appendChild(v);

        const hit = el("rect", { x: 0, y: top, width: W, height: rowH, fill: "transparent" });
        hit.addEventListener("mouseenter", () => {
          tip.show(Math.min(w, iw * .8), top + labelH,
            `<div class="tip-title">${r.label}</div>` +
            tipRows([{ color, label: opts.seriesName || "Value", value: format(r.value) }]) +
            (r.note ? `<div class="tip-note">${r.note}</div>` : ""));
        });
        svg.appendChild(hit);
      });
      svg.addEventListener("mouseleave", () => tip.hide());
      return svg;
    };
    return mount(host, draw);
  }

  /* =========================================================================
     SPARKLINE — 12 points, de-emphasised, current period accented.
     ====================================================================== */
  function sparkline(host, values, opts = {}) {
    const draw = (W) => {
      const H = opts.height || 40, P = 6;
      const lo = Math.min(...values), hi = Math.max(...values);
      const X = (i) => P + (i * (W - P * 2 - 8)) / (values.length - 1);
      const Y = (v) => H - P - ((v - lo) / (hi - lo || 1)) * (H - P * 2);
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-hidden": "true" });
      const d = values.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
      const area = `${d} L${X(values.length - 1)},${H - P} L${X(0)},${H - P} Z`;
      svg.appendChild(el("path", { d: area, fill: css("--series-1"), opacity: .10 }));
      svg.appendChild(el("path", {
        d, fill: "none", stroke: css("--series-1"), "stroke-width": 2,
        "stroke-linejoin": "round", "stroke-linecap": "round", opacity: .55
      }));
      svg.appendChild(el("circle", {
        cx: X(values.length - 1), cy: Y(values[values.length - 1]), r: 4,
        fill: css("--series-1"), stroke: css("--chart-bg"), "stroke-width": 2
      }));
      return svg;
    };
    return mount(host, draw);
  }

  return { line, columns, bars, sparkline, fmt, ticks };
})();

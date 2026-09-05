/* =============================================================================
   The calculation layer. Takes the raw inputs from data.js and returns the
   figures the board draws. Nothing here is stored — change an input and every
   number that depends on it moves. This is what makes the edit panel work.
   ========================================================================== */

const Model = (() => {
  const sum = (xs, f) => xs.reduce((a, x) => a + (f ? f(x) : x), 0);
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const div = (a, b) => (b ? a / b : null);

  /* Runs a set of months through the distribution policy: savings takes
     whatever is still needed to reach the target, then the split divides what
     is left. Used for the live projection and for any what-if scenario, so the
     two can never drift apart. */
  function allocate(months, opts) {
    const { adcFor, revenueFor, monthlyCost, reserveTarget, startingReserve, startingDebt,
            split, perDiem, ongoingSavings } = opts;
    let reserve = startingReserve, debt = startingDebt;
    return months.map((x) => {
      const adc = adcFor ? adcFor(x) : x.adc;
      const revenue = revenueFor ? revenueFor(x) : adc * x.opDays * perDiem;
      const net = revenue - monthlyCost;
      let toSavings = 0, toDebt = 0, toOwners = 0;
      if (net <= 0) {
        toSavings = net;                                  // a loss comes out of the reserve
      } else {
        // Close any remaining gap to the target first, then keep putting the
        // ongoing share of whatever is left into savings.
        const gap = Math.max(0, reserveTarget - reserve);
        const toClose = Math.min(net, gap);
        const afterGap = net - toClose;
        toSavings = toClose + afterGap * (ongoingSavings || 0);
        const rest = net - toSavings;
        toDebt = Math.min(rest * (split.debt || 0), Math.max(0, debt));
        toOwners = rest - toDebt;                         // the rest is distributed
      }
      reserve += toSavings;
      debt -= toDebt;
      return { ...x, adc, revenue, net, toSavings, toDebt, toOwners, reserve, debt };
    });
  }

  function build(raw) {
    const m = { raw };

    /* -- monthly actuals -------------------------------------------------- */
    m.months = (raw.months || []).map((x) => {
      const adc = div(x.childDays, x.opDays);
      const net = num(x.revenue) !== null && num(x.cost) !== null ? x.revenue - x.cost : null;
      return {
        ...x,
        adc,
        dormant: x.onReport - x.enrolled,
        attendance: div(adc, x.enrolled),
        net,
        margin: net === null ? null : div(net, x.revenue),
        revenuePerChildDay: num(x.revenue) === null ? null : div(x.revenue, x.childDays)
      };
    });
    m.moneyMonths = m.months.filter((x) => x.net !== null);
    m.latest = m.months[m.months.length - 1] || null;
    m.prior = m.months[m.months.length - 2] || null;
    m.latestMoney = m.moneyMonths[m.moneyMonths.length - 1] || null;
    m.priorMoney = m.moneyMonths[m.moneyMonths.length - 2] || null;

    /* Realized rate: what the centre has actually collected per child-day.
       Calculated, never typed in — it is the honest check on the day rate. */
    const ytdRev = sum(m.moneyMonths, (x) => x.revenue);
    const ytdDays = sum(m.moneyMonths, (x) => x.childDays);
    m.ytd = {
      revenue: ytdRev, childDays: ytdDays, cost: sum(m.moneyMonths, (x) => x.cost),
      net: sum(m.moneyMonths, (x) => x.net),
      perChildDay: div(ytdRev, ytdDays)
    };
    m.ytd.realization = div(m.ytd.perChildDay, raw.perDiem);

    /* -- projection ------------------------------------------------------- */
    const p = raw.projection;
    if (p && p.months && p.months.length) {
      const rate = p.attendanceRate, perDiem = raw.perDiem;
      const months = p.months.map((x) => {
        const opDays = x.weekdays - x.closures;
        const adc = x.enrolled * rate;
        return { ...x, opDays, adc, revenue: adc * opDays * perDiem };
      });
      const totalOpDays = sum(months, (x) => x.opDays);
      const pendingMonths = months.filter((x) => x.enrolled > (raw.roster ? raw.roster.enrolled : 0));
      m.projection = {
        ...p, months, totalOpDays,
        totalWeekdays: sum(months, (x) => x.weekdays),
        totalClosures: sum(months, (x) => x.closures),
        totalRevenue: sum(months, (x) => x.revenue),
        avgOpDays: Math.round(totalOpDays / months.length),
        perChildPerMonth: rate * Math.round(totalOpDays / months.length) * perDiem,
        pendingValue: raw.roster
          ? raw.roster.pending * rate * sum(pendingMonths, (x) => x.opDays) * perDiem : null,
        pendingMonthCount: pendingMonths.length
      };
      m.projection.atRealizedRate = m.ytd.realization
        ? m.projection.totalRevenue * m.ytd.realization : null;
    }

    /* -- rooms ------------------------------------------------------------ */
    if (raw.rooms && raw.rooms.list) {
      const opDays = m.latest ? m.latest.opDays : null;
      m.rooms = {
        ...raw.rooms,
        list: raw.rooms.list.map((r) => ({ ...r, adc: div(r.childDays, opDays) })),
        attending: sum(raw.rooms.list, (r) => r.attending),
        onReport: sum(raw.rooms.list, (r) => r.onReport)
      };
      m.rooms.adc = sum(m.rooms.list, (r) => r.adc || 0);
    }

    /* -- cost structure --------------------------------------------------- */
    if (raw.costLines && raw.costLines.lines) {
      const lines = raw.costLines.lines.slice().sort((a, b) => b.current - a.current);
      const totalCurrent = sum(lines, (l) => l.current);
      m.costLines = {
        ...raw.costLines,
        lines: lines.map((l) => ({ ...l, change: l.current - l.prior, share: div(l.current, totalCurrent) })),
        totalCurrent, totalPrior: sum(lines, (l) => l.prior),
        overTarget: raw.targets ? totalCurrent - raw.targets.monthlyCost : null
      };
      m.costLines.change = m.costLines.totalCurrent - m.costLines.totalPrior;
    }

    /* -- cash ------------------------------------------------------------- */
    if (raw.cash && raw.cash.lines) {
      const cashLine = raw.cash.lines.find((l) => l.value > 0);
      m.cash = {
        ...raw.cash,
        inBank: cashLine ? cashLine.value : 0,
        obligations: -sum(raw.cash.lines.filter((l) => l.value < 0), (l) => l.value),
        net: sum(raw.cash.lines, (l) => l.value)
      };
    }

    /* -- staffing --------------------------------------------------------- */
    if (raw.staffing && raw.staffing.roles) {
      const byType = (t) => sum(raw.staffing.roles.filter((r) => r.type === t), (r) => r.count);
      const dm = raw.staffing.dailyModel;
      m.staffing = {
        ...raw.staffing,
        fullTime: byType("Full time"), partTime: byType("Part time"), perDiem: byType("Per diem"),
        total: sum(raw.staffing.roles, (r) => r.count)
      };
      if (dm && dm.lines) {
        const perDay = sum(dm.lines, (l) => l.perDay);
        m.staffing.dailyModel = {
          ...dm, perDay,
          lines: dm.lines.map((l) => ({ ...l, spare: l.roster - l.perDay })),
          scheduled: m.staffing.fullTime + m.staffing.partTime,
          childrenPerStaff: div(dm.supports, perDay),
          atProjected: m.projection && m.projection.months.length
            ? div(m.projection.months[m.projection.months.length - 1].adc, perDay) : null
        };
      }
    }

    /* -- marketing -------------------------------------------------------- */
    if (raw.adSpend && raw.adSpend.months) {
      const ytd = sum(raw.adSpend.months, (x) => x.value);
      m.adSpend = { ...raw.adSpend, ytd, vsPrior: div(ytd, raw.adSpend.ytdPrior),
                    latest: raw.adSpend.months[raw.adSpend.months.length - 1] };
    }

    /* -- roster ----------------------------------------------------------- */
    if (raw.roster) {
      m.roster = {
        ...raw.roster,
        awaitingApproval: raw.roster.enrolled - raw.roster.medicaidApproved,
        approvedShare: div(raw.roster.medicaidApproved, raw.roster.enrolled),
        shortOfTarget: raw.targets ? raw.targets.enrollment - raw.roster.enrolled : null,
        withPending: raw.roster.enrolled + raw.roster.pending
      };
    }


    /* -- distributions & reserve ------------------------------------------
       Reserve first: each month savings takes whatever is still needed to reach
       the target, then the split applies to what is left. A loss draws the
       reserve down rather than being distributed. */
    const d = raw.distributions;
    if (d && m.projection) {
      const split = d.split || { debt: 0, owners: 1 };
      const schedule = allocate(m.projection.months, {
        revenueFor: (x) => x.revenue, monthlyCost: d.assumedMonthlyCost,
        reserveTarget: d.reserveTarget, startingReserve: d.startingReserve,
        startingDebt: d.startingDebt, split, perDiem: raw.perDiem,
        ongoingSavings: d.ongoingSavings
      }).map((x) => ({
        ...x,
        // "Building" while the month still closes part of the gap; "funded"
        // once savings is only taking its ongoing share.
        stage: x.reserve - x.toSavings < d.reserveTarget ? "Building the reserve" : "Reserve funded"
      }));

      const tot = (k) => sum(schedule, (x) => x[k]);
      const owners = tot("toOwners");
      const equity = sum(d.members || [], (x) => x.equity);
      const funded = schedule.find((x) => x.reserve >= d.reserveTarget);

      /* What it takes to fund the reserve, in money and then in children.
         The gap is the only thing savings has to cover, so the revenue needed
         is that gap plus the cost of running the months it is earned over. */
      const gap = Math.max(0, d.reserveTarget - d.startingReserve);
      const n = m.projection.months.length;
      const requiredRevenue = gap + n * d.assumedMonthlyCost;
      const perDiem = raw.perDiem, rate = m.projection.attendanceRate;
      const requiredChildDays = div(requiredRevenue, perDiem);
      const requiredAdc = div(requiredChildDays, m.projection.totalOpDays);
      const breakEvenRevenue = n * d.assumedMonthlyCost;
      const breakEvenAdc = div(div(breakEvenRevenue, perDiem), m.projection.totalOpDays);

      m.distributions = {
        ...d, schedule, split,
        totals: { net: tot("net"), savings: tot("toSavings"), debt: tot("toDebt"), owners },
        endReserve: schedule.length ? schedule[schedule.length - 1].reserve : d.startingReserve,
        endDebt: schedule.length ? schedule[schedule.length - 1].debt : d.startingDebt,
        targetMonth: funded ? funded.full : null,
        equity,
        members: (d.members || []).map((x) => ({
          ...x, share: div(x.equity, equity), amount: owners * div(x.equity, equity)
        })),
        stages: ["Building the reserve", "Reserve funded"].map((name) => {
          const rows = schedule.filter((x) => x.stage === name);
          const t = (k) => sum(rows, (x) => x[k]);
          return rows.length ? {
            name, months: rows.length,
            from: rows[0].label, to: rows[rows.length - 1].label,
            net: t("net"), savings: t("toSavings"), debt: t("toDebt"), owners: t("toOwners"),
            endReserve: rows[rows.length - 1].reserve
          } : null;
        }).filter(Boolean),
        monthsCovered: div(d.reserveTarget, d.assumedMonthlyCost),
        ongoingSavings: d.ongoingSavings,
        /* Where the ongoing contribution takes the reserve after the target:
           two months of cost was the original rule of thumb. */
        growth: (() => {
          const funded = schedule.filter((x) => x.reserve >= d.reserveTarget && x.toSavings > 0
            && x.reserve - x.toSavings >= d.reserveTarget);
          const perMonth = funded.length ? sum(funded, (x) => x.toSavings) / funded.length : null;
          const twoMonths = 2 * d.assumedMonthlyCost;
          const end = schedule.length ? schedule[schedule.length - 1].reserve : d.startingReserve;
          return { perMonth, twoMonths,
                   monthsToTwoMonths: perMonth && end < twoMonths
                     ? Math.ceil((twoMonths - end) / perMonth) : (end >= twoMonths ? 0 : null) };
        })(),
        required: {
          gap, months: n,
          revenue: requiredRevenue,
          monthlyRevenue: div(requiredRevenue, n),
          childDays: requiredChildDays,
          adc: requiredAdc,
          enrolled: div(requiredAdc, rate),
          surplus: m.projection.totalRevenue - requiredRevenue,
          breakEvenRevenue,
          breakEvenMonthly: d.assumedMonthlyCost,
          breakEvenAdc,
          breakEvenEnrolled: div(breakEvenAdc, rate)
        },
        downside: m.ytd.realization
          ? sum(m.projection.months, (x) => x.revenue * m.ytd.realization - d.assumedMonthlyCost) : null
      };
    }


    /* -- what-if scenario -------------------------------------------------- */
    const sc = raw.scenario;
    if (sc && m.projection && d) {
      const split = d.split || { debt: 0, owners: 1 };
      const base = {
        monthlyCost: sc.monthlyCost, reserveTarget: d.reserveTarget,
        startingReserve: d.startingReserve, startingDebt: d.startingDebt,
        split, perDiem: raw.perDiem, ongoingSavings: d.ongoingSavings
      };
      const run = (perDay) => {
        const rows = allocate(m.projection.months, { ...base, adcFor: () => perDay });
        const t = (k) => sum(rows, (x) => x[k]);
        const funded = rows.find((x) => x.reserve >= d.reserveTarget);
        return {
          perDay, rows,
          revenue: t("revenue"), net: t("net"), savings: t("toSavings"),
          debt: t("toDebt"), owners: t("toOwners"),
          endReserve: rows.length ? rows[rows.length - 1].reserve : d.startingReserve,
          fundedMonth: funded ? funded.full : null,
          worstMonth: rows.reduce((a, x) => (a === null || x.net < a.net ? x : a), null)
        };
      };
      const main = run(sc.childrenPerDay);
      m.scenario = {
        ...sc, ...main,
        equity: m.distributions ? m.distributions.equity : null,
        members: m.distributions
          ? m.distributions.members.map((x) => ({ ...x, amount: main.owners * x.share })) : [],
        // Children a day needed to cover cost, and to cover cost plus the gap.
        breakEvenPerDay: div(sc.monthlyCost, m.projection.avgOpDays * raw.perDiem),
        sensitivity: (sc.sensitivity || []).map((n) => {
          const r = run(n);
          return { perDay: n, revenue: r.revenue, net: r.net, owners: r.owners, fundedMonth: r.fundedMonth };
        })
      };
    }

    return m;
  }

  return { build };
})();

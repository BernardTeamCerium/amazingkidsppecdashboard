/* =============================================================================
   The calculation layer. Takes the raw inputs from data.js and returns the
   figures the board draws. Nothing here is stored — change an input and every
   number that depends on it moves. This is what makes the edit panel work.
   ========================================================================== */

const Model = (() => {
  const sum = (xs, f) => xs.reduce((a, x) => a + (f ? f(x) : x), 0);
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const div = (a, b) => (b ? a / b : null);

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


    /* -- distributions & reserve ------------------------------------------ */
    const d = raw.distributions;
    if (d && m.projection) {
      let reserve = d.startingReserve, debt = d.startingDebt;
      const schedule = m.projection.months.map((x) => {
        const funded = reserve >= d.reserveTarget && debt <= 0;
        const split = funded ? d.onceFunded : d.whileBuilding;
        const net = x.revenue - d.assumedMonthlyCost;
        // A loss is not distributed — it comes out of the reserve.
        const toSavings = net > 0 ? net * (split.savings || 0) : net;
        const toDebt = net > 0 ? Math.min(net * (split.debt || 0), debt) : 0;
        const toOwners = net > 0 ? net * (split.owners || 0) : 0;
        const toReinvest = net > 0 ? net * (split.reinvest || 0) : 0;
        reserve += toSavings;
        debt -= toDebt;
        return { ...x, net, toSavings, toDebt, toOwners, toReinvest,
                 reserve, debt, phase: funded ? "funded" : "building" };
      });
      const tot = (k) => sum(schedule, (x) => x[k]);
      const owners = tot("toOwners");
      const equity = sum(d.members || [], (x) => x.equity);
      const hitsTarget = schedule.find((x) => x.reserve >= d.reserveTarget);
      m.distributions = {
        ...d, schedule,
        totals: { net: tot("net"), savings: tot("toSavings"), debt: tot("toDebt"),
                  owners, reinvest: tot("toReinvest") },
        endReserve: schedule.length ? schedule[schedule.length - 1].reserve : d.startingReserve,
        endDebt: schedule.length ? schedule[schedule.length - 1].debt : d.startingDebt,
        reserveNow: div(d.startingReserve, d.reserveTarget),
        targetMonth: hitsTarget ? hitsTarget.full : null,
        equity,
        members: (d.members || []).map((x) => ({
          ...x, share: div(x.equity, equity), amount: owners * div(x.equity, equity)
        })),
        // What the reserve target is worth in months at the assumed cost
        monthsCovered: div(d.reserveTarget, d.assumedMonthlyCost),
        downside: m.ytd.realization
          ? sum(m.projection.months, (x) => x.revenue * m.ytd.realization - d.assumedMonthlyCost) : null
      };
      m.distributions.downsideOwners = m.distributions.downside === null ? null
        : Math.max(0, m.distributions.downside) * d.whileBuilding.owners;
    }

    return m;
  }

  return { build };
})();

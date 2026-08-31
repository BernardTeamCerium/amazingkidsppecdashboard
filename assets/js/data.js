/* =============================================================================
   Amazing Kids PPEC — Operations Board
   SINGLE SOURCE OF TRUTH FOR EVERY NUMBER ON THE BOARD.
   Edit this file to update the dashboard. Nothing else needs to change.

   SOURCES WIRED UP SO FAR
     • Census, attendance and roster counts
         Drive → "Amazing Kids PPEC - Monthly Attendance Report" (Jan–May 2026)
         Aggregated per month. Child-level rows are deliberately NOT stored here.
     • Targets
         Drive → "Amazing Kids PPEC - Growth Plan" ("20 Kids - Quarter 1")

   STILL UNSOURCED — set to null, so those cards and sections stay hidden:
     financials, operating budget, upcoming expenses, enrollment pipeline,
     removals, staffing, marketing, task board.

   PRIVACY: the attendance report names every child. Nothing at child level
   belongs in this file — it is a static page, and everything here ships to
   anyone who can open it. Aggregate first, then paste the aggregates.
   ========================================================================== */

window.AKP_DATA = {
  meta: {
    facility: "Amazing Kids PPEC",
    boardName: "Operations Board",
    asOf: "May 31, 2026",
    period: "May 2026 · monthly attendance close",
    sampleData: false,
    sourceNote: "Census and attendance are aggregated from the Monthly Attendance Report " +
      "in Drive (Jan–May 2026); targets come from the Growth Plan. No child-level detail is " +
      "stored on this page. Sections without a wired-up source stay hidden."
  },

  /* ---- Lead band --------------------------------------------------------- */
  hero: {
    eyebrow: "May 2026 close",
    label: "Average daily census",
    value: 16.1,
    unit: "children/day",
    deltaLabel: "vs. April",
    delta: 1.2,
    deltaGood: true,
    target: 20,
    note: "322 child-days across 20 operating days; 18 of the 19 children on the roster attended at least once"
  },

  kpis: [
    { key: "roster", label: "Children on roster", value: 19, format: "int",
      sub: "on the May attendance report", delta: "−7 vs. January", deltaGood: false,
      target: "20 in Q1", state: "warning" },
    { key: "attending", label: "Children attending", value: 18, format: "int",
      sub: "attended at least one day in May", delta: "+1 vs. April", deltaGood: true,
      target: "—", state: "good" },
    { key: "attendance", label: "Attendance rate", value: 0.847, format: "pct1",
      sub: "daily census ÷ roster", delta: "+6.5 pts vs. April", deltaGood: true,
      target: "—", state: "good" },
    { key: "childdays", label: "Child-days delivered", value: 322, format: "int",
      sub: "the billable unit", delta: "−5 vs. April", deltaGood: false,
      target: "—", state: "warning" },
    { key: "opdays", label: "Operating days", value: 20, format: "int",
      sub: "in May", delta: "−2 vs. April", deltaGood: false,
      target: "—", state: "" }
  ],

  /* ---- Targets ----------------------------------------------------------- */
  targets: [
    { name: "Children on roster", actual: 19, target: 20, format: "int",
      owner: "Growth plan", horizon: "Quarter 1", direction: "up" },
    { name: "Average daily census", actual: 16.1, target: 20, format: "dec1",
      owner: "Growth plan", horizon: "Quarter 1", direction: "up" }
  ],
  targetsNote: "The growth plan states one goal — \"20 Kids, Quarter 1\". It is shown against " +
    "both the roster and the daily census, because the two differ by about three children. " +
    "Confirm which one the goal means and the other row comes out. The plan's $60–65K budget " +
    "target needs actual spend before it can be tracked here.",

  /* ---- Monthly census ---------------------------------------------------- */
  months: [
    { label: "Jan", full: "Jan 2026", enrolled: 26, attending: 19, adc: 13.9, opDays: 20, childDays: 278, revenue: null, expenses: null, projected: false },
    { label: "Feb", full: "Feb 2026", enrolled: 22, attending: 16, adc: 14.2, opDays: 20, childDays: 284, revenue: null, expenses: null, projected: false },
    { label: "Mar", full: "Mar 2026", enrolled: 22, attending: 19, adc: 13.7, opDays: 22, childDays: 302, revenue: null, expenses: null, projected: false },
    { label: "Apr", full: "Apr 2026", enrolled: 19, attending: 17, adc: 14.9, opDays: 22, childDays: 327, revenue: null, expenses: null, projected: false },
    { label: "May", full: "May 2026", enrolled: 19, attending: 18, adc: 16.1, opDays: 20, childDays: 322, revenue: null, expenses: null, projected: false }
  ],
  censusTarget: 20,
  projectionAssumptions: null,

  /* ---- Attendance by month ---------------------------------------------- */
  attendanceTargetRate: null,
  attendancePeriods: [
    { label: "Jan", sub: "2026", adc: 13.9, roster: 26, attending: 19, opDays: 20, childDays: 278 },
    { label: "Feb", sub: "2026", adc: 14.2, roster: 22, attending: 16, opDays: 20, childDays: 284 },
    { label: "Mar", sub: "2026", adc: 13.7, roster: 22, attending: 19, opDays: 22, childDays: 302 },
    { label: "Apr", sub: "2026", adc: 14.9, roster: 19, attending: 17, opDays: 22, childDays: 327 },
    { label: "May", sub: "2026", adc: 16.1, roster: 19, attending: 18, opDays: 20, childDays: 322 }
  ],
  absenceReasons: null,

  /* ---- Everything below is waiting on a source --------------------------- */
  budget: null,
  upcomingExpenses: null,
  capitalReserve: null,
  pipeline: null,
  removals: null,
  staffing: null,
  marketing: null,
  tasks: null
};

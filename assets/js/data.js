/* =============================================================================
   Amazing Kids PPEC — Operations Board
   SINGLE SOURCE OF TRUTH FOR EVERY NUMBER ON THE BOARD.
   Edit this file to update the dashboard. Nothing else needs to change.

   SOURCES — file ids given because two attendance exports exist and only one
   of them is authoritative.
     • Census, attendance, rooms, roster movement
         "Monthly Student Attendance: Amazing Kids PPEC", Jan–Aug 2026
         17wAFP-TfpzM9ZXLyaJlB8ZbGTwvWIH2RZnaQMFSImIs  ← THE ONE TO USE
         An older export (1po06YEzox_wHUPulB8OpWsCRgHtTUC-K6EqZzrzqyXc) covers
         Jan–May only and disagrees on some May figures. Ignore it.
         Aggregated per month. Child-level rows are deliberately NOT stored here.
     • Revenue, cost, margin, cash position
         "AMAZING KIDS PPEC LLC — Management Report", period ended 7/31/2026,
         prepared 8/28/2026. Cash basis. August is not published yet, so the
         August row below carries census only and the money charts stop at July.
     • Targets
         "Amazing Kids PPEC - Growth Plan": 20 kids in Q1, $60–65K budget.
         15jqBuvEtEQ75yp3g-_rDxsuo0LbROgcydpaK05xDoaU
     • Task board
         "Amazing Kids PPEC - Task Board" (owners and due dates live there)
         1pF-bVz0iMmPji9RTBhIlO7EH5bVhCp5ArkfumYKcwjU
         Seeded from the August operations discussion list
         186Td_8En4t52zyVAcgqMEpNemzwCX12MC446jyJIB5E
     • Partner school count
         1bKX9PH-WdZ6UgVb5BRSRYoAlAZqpoKRcs9zJ-wTnRTM

   STILL UNSOURCED — null, so those cards stay hidden: staffing headcount,
   referral pipeline, removal reasons, campaign updates, per-category budget.

   ENROLLED means a child who attended at least one day that month. Children
   listed on the attendance report with zero days are counted separately as
   dormant records, not as enrollment.

   PRIVACY: the attendance report and the school list name every child, and the
   balance sheet names every member. None of that belongs in this file — it is a
   static page, and everything here ships to anyone who can open it.
   ========================================================================== */

window.AKP_DATA = {
  meta: {
    facility: "Amazing Kids PPEC",
    boardName: "Operations Board",
    asOf: "August 31, 2026",
    period: "Census through Aug · financials through Jul",
    sampleData: false,
    /* Drop the logo file at assets/img/logo.png (PNG or SVG, transparent
       background, roughly 3:1). The masthead swaps to it automatically and
       build.js inlines it into dist/dashboard.html as a data URI. Until the
       file exists the board falls back to the AK monogram. */
    logo: "assets/img/logo.png",
    logoAlt: "Amazing Kids PPEC — Prescribed Pediatric Extended Care",
    sourceNote: "Census and attendance are aggregated from the monthly attendance report " +
      "(Jan–Aug 2026). Revenue, cost and cash come from the management report for the period " +
      "ended 7/31/2026, prepared 8/28/2026, on a cash basis. Targets come from the growth plan. " +
      "No child-level or member-level detail is stored on this page."
  },

  /* ---- Lead band --------------------------------------------------------- */
  hero: {
    eyebrow: "August 2026",
    label: "Average daily census",
    value: 16.35,
    unit: "children/day",
    deltaLabel: "vs. July",
    delta: 0.18,
    deltaGood: true,
    target: 25,
    note: "327 child-days across 20 operating days. 20 children attended at least once; 4 more sit on the report with no attendance"
  },

  kpis: [
    { key: "enrolled", label: "Enrolled now", value: 19, format: "int",
      sub: "current roster · 20 attended in August", delta: "−1 vs. August", deltaGood: false,
      target: "25 by Q4", state: "warning" },
    { key: "medicaid", label: "Medicaid approved", value: 16, format: "int",
      sub: "of 19 enrolled · 3 awaiting approval", delta: "84% of the roster", deltaGood: false,
      target: "—", state: "warning" },
    { key: "pending", label: "Pending enrollment", value: 4, format: "int",
      sub: "assumed to start in October", delta: "+$55.9K if all four start", deltaGood: true,
      target: "—", state: "good" },
    { key: "attendance", label: "Attendance rate", value: 0.818, format: "pct1",
      sub: "August · daily census ÷ enrolled", delta: "+0.9 pts vs. July", deltaGood: true,
      target: "80% assumed", state: "" },
    { key: "childdays", label: "Child-days delivered", value: 327, format: "int",
      sub: "August · the billable unit", delta: "−45 vs. July", deltaGood: false,
      target: "—", state: "warning" },
    { key: "revenue", label: "Revenue", value: 90630, format: "usd0",
      sub: "July · cash basis", delta: "+19% vs. June", deltaGood: true,
      target: "—", state: "" },
    { key: "cost", label: "Operating cost", value: 83920, format: "usd0",
      sub: "July · wages ran $57.4K", delta: "+30% vs. June", deltaGood: false,
      target: "≤ $65K", state: "critical" },
    { key: "net", label: "Net income", value: 6710, format: "usd0",
      sub: "July · 7.4% margin", delta: "−42% vs. June", deltaGood: false,
      target: "—", state: "warning" },
    { key: "cash", label: "Cash in bank", value: 71116, format: "usd0",
      sub: "as of Jul 31", delta: "+$62.1K vs. a year ago", deltaGood: true,
      target: "—", state: "good" },
    { key: "opdays", label: "Operating days left", value: 83, format: "int",
      sub: "Sep–Dec, after assumed closures", delta: "of 88 weekdays", deltaGood: true,
      target: "—", state: "" },
    { key: "projrev", label: "Projected revenue", value: 411253, format: "usd0",
      sub: "Sep–Dec at 80% attendance", delta: "$281.68 per child-day", deltaGood: true,
      target: "—", state: "good" }
  ],

  /* ---- Targets ----------------------------------------------------------- */
  targets: [
    { name: "Children enrolled", actual: 19, target: 25, format: "int",
      owner: "Growth plan", horizon: "Q3–Q4 2026", direction: "up" },
    { name: "Monthly operating cost", actual: 83920, target: 65000, format: "usd0",
      owner: "Growth plan", horizon: "Monthly", direction: "down" }
  ],
  targetsNote: "The enrolment goal is 25 children through Q3 and Q4. The roster stands at 19, " +
    "with 4 more pending — so even with every pending child starting, the centre lands at 23 and " +
    "needs two more beyond the current pipeline. Operating cost has cleared the $65K budget in " +
    "three of seven months; July's $83.9K was almost entirely wages, $57.4K against a $38K run rate.",

  /* ---- Roster today ------------------------------------------------------ */
  roster: {
    asOf: "September 1, 2026",
    enrolled: 19,
    medicaidApproved: 16,
    pending: 4
  },

  /* ---- Monthly census + financials --------------------------------------- */
  /* revenue/cost are null for months the management report does not cover. */
  months: [
    { label: "Jan", full: "Jan 2026", enrolled: 19, onReport: 31, dormant: 12, adc: 13.90, opDays: 20, childDays: 278, started: null, stopped: null, revenue: 59997.84,  cost: 82893.64, projected: false },
    { label: "Feb", full: "Feb 2026", enrolled: 16, onReport: 28, dormant: 12, adc: 14.20, opDays: 20, childDays: 284, started: 0, stopped: 3, revenue: 66239.53,  cost: 65676.48, projected: false },
    { label: "Mar", full: "Mar 2026", enrolled: 19, onReport: 28, dormant:  9, adc: 13.73, opDays: 22, childDays: 302, started: 3, stopped: 0, revenue: 73420.75,  cost: 64117.55, projected: false },
    { label: "Apr", full: "Apr 2026", enrolled: 17, onReport: 25, dormant:  8, adc: 14.86, opDays: 22, childDays: 327, started: 1, stopped: 3, revenue: 70211.97,  cost: 61677.26, projected: false },
    { label: "May", full: "May 2026", enrolled: 18, onReport: 25, dormant:  7, adc: 16.20, opDays: 20, childDays: 324, started: 1, stopped: 0, revenue: 96294.66,  cost: 59424.22, projected: false },
    { label: "Jun", full: "Jun 2026", enrolled: 20, onReport: 25, dormant:  5, adc: 15.73, opDays: 22, childDays: 346, started: 2, stopped: 0, revenue: 76100.84,  cost: 64527.16, projected: false },
    { label: "Jul", full: "Jul 2026", enrolled: 20, onReport: 25, dormant:  5, adc: 16.17, opDays: 23, childDays: 372, started: 2, stopped: 2, revenue: 90629.63,  cost: 83919.86, projected: false },
    { label: "Aug", full: "Aug 2026", enrolled: 20, onReport: 24, dormant:  4, adc: 16.35, opDays: 20, childDays: 327, started: 1, stopped: 1, revenue: null,       cost: null,     projected: false }
  ],
  censusTarget: 25,
  costTarget: 65000,
  /* ---- Projection to year end -------------------------------------------
     Operating days are the weekdays in each month less the closures named
     below. The closure pattern follows the attendance report: this centre
     closes for major holidays only — it stayed open on Jul 3, and lost a day
     around New Year, Memorial Day and in August.
     Revenue = enrolled × 80% attendance × operating days × the $281.68 rate. */
  projection: {
    perDiem: 281.68,
    attendanceRate: 0.80,
    pendingStart: "October 2026",
    realizedPerChildDay: 238.65,
    months: [
      { label: "Sep", full: "Sep 2026", weekdays: 22, closures: 1, opDays: 21, enrolled: 19, adc: 15.2, revenue: 89912.26,
        closureNote: "Labor Day, Mon Sep 7" },
      { label: "Oct", full: "Oct 2026", weekdays: 22, closures: 0, opDays: 22, enrolled: 23, adc: 18.4, revenue: 114024.06,
        closureNote: "no closure assumed" },
      { label: "Nov", full: "Nov 2026", weekdays: 21, closures: 2, opDays: 19, enrolled: 23, adc: 18.4, revenue: 98475.33,
        closureNote: "Thanksgiving, Thu Nov 26 and Fri Nov 27" },
      { label: "Dec", full: "Dec 2026", weekdays: 23, closures: 2, opDays: 21, enrolled: 23, adc: 18.4, revenue: 108841.15,
        closureNote: "Christmas Eve and Christmas Day, Thu Dec 24 and Fri Dec 25" }
    ],
    totalOpDays: 83,
    totalWeekdays: 88,
    totalRevenue: 411252.80,
    perChildPerMonth: 4732.22,
    pendingValue: 55885.31,
    atRealizedRate: 348422.31,
    assumptions: [
      "19 children enrolled today, and the 4 pending children all start in October — 23 from October on.",
      "80% attendance, applied to enrolment. August ran 81.8%, so this is close to the recent run rate.",
      "$281.68 per child-day, billed for every day a child attends.",
      "Operating days are weekdays less the closures named in the table. Adjust them there if the calendar differs.",
      "No stops, no rate change, and no cost projection — the management report gives no basis for forecasting cost."
    ],
    caveat: "Year to date the centre has realized $238.65 per child-day — 85% of the $281.68 posted rate. " +
      "If that gap is denials, partial days or billing lag rather than a recent rate increase, the same " +
      "projection lands at $348.4K instead of $411.3K. Worth settling before this number is used for planning."
  },

  projectionAssumptions: null,

  financeNote: "Cash basis: income lands when the payment arrives, not when the care was " +
    "delivered, so a heavy claims batch inflates one month and starves the next. May's $96.3K " +
    "and January's $60.0K are the same operation. Year to date, revenue works out to $239 per " +
    "child-day across 2,233 child-days.",

  /* ---- Rooms (latest month) ---------------------------------------------- */
  rooms: {
    month: "August 2026",
    list: [
      { name: "Main Room",       attending: 13, onReport: 15, adc: 10.95 },
      { name: "Total Care Room", attending:  5, onReport:  5, adc:  3.55 },
      { name: "Infant Room",     attending:  2, onReport:  4, adc:  1.85 }
    ],
    partnerSchool: { name: "Sunflower Christian Academy", children: 14 }
  },

  /* ---- Cost structure ---------------------------------------------------- */
  costLines: {
    current: "July 2026",
    prior: "June 2026",
    lines: [
      { name: "Payroll, taxes & benefits",     prior: 40952.03, current: 61613.44 },
      { name: "Rent",                          prior: 11767.09, current: 11767.09 },
      { name: "Contract labor & supplies",     prior:  2809.60, current:  4128.71 },
      { name: "Dues & subscriptions",          prior:  1075.60, current:  1075.60 },
      { name: "Bank service charges",          prior:   811.94, current:   788.00 },
      { name: "Internet & telephone",          prior:  1250.58, current:   764.32 },
      { name: "Direct care supplies",          prior:   729.56, current:   762.61 },
      { name: "Advertising & promotion",       prior:   537.92, current:   689.46 },
      { name: "Licenses & permits",            prior:     0.00, current:   663.59 },
      { name: "Electricity",                   prior:   572.95, current:   560.76 },
      { name: "Insurance",                     prior:   426.33, current:   445.70 },
      { name: "Meals & entertainment",         prior:  1288.95, current:   365.63 },
      { name: "Repairs & maintenance",         prior:  2014.21, current:   160.00 },
      { name: "Office expenses",               prior:   105.42, current:   104.96 },
      { name: "Janitorial",                    prior:    59.98, current:    29.99 },
      { name: "Professional fees",             prior:   125.00, current:     0.00 }
    ]
  },

  /* ---- Cash position ----------------------------------------------------- */
  cash: {
    asOf: "July 31, 2026",
    priorLabel: "a year earlier",
    lines: [
      { name: "Cash in bank",           value:  71116.36, prior: 8998.70, good: true },
      { name: "Accounts payable",       value:  -1091.51, prior: null, good: false },
      { name: "Credit card balance",    value: -19172.01, prior: null, good: false },
      { name: "Line of credit drawn",   value: -33962.98, prior: null, good: false }
    ],
    ytdNet: 50659.05,
    ytdNetPrior: -242951.91,
    totalAssets: 373325.57,
    totalEquity: 319099.07,
    note: "Cash net of every current obligation is $16,890. The year-to-date swing is the " +
      "headline: $50.7K of net income against a $243.0K loss over the same seven months last year."
  },

  /* ---- Marketing --------------------------------------------------------- */
  adSpend: {
    months: [
      { label: "Jan", value: 1749.00 }, { label: "Feb", value: 2129.00 },
      { label: "Mar", value:  386.41 }, { label: "Apr", value:  566.17 },
      { label: "May", value:  856.45 }, { label: "Jun", value:  537.92 },
      { label: "Jul", value:  689.46 }
    ],
    ytd: 6914.41,
    ytdPrior: 20795.07,
    note: "Advertising and promotion is running at about a quarter of last year's pace — " +
      "$6.9K year to date against $20.8K — while enrollment climbed from 19 to 20 and dormant " +
      "records fell from 12 to 4. Referral sources and campaign results are not tracked in any " +
      "file shared yet, so what is working is not visible here."
  },

  /* ---- Task board -------------------------------------------------------- */
  /* TASKS:BEGIN — `node tools/import-tasks.js <file.csv>` rewrites everything
     between these two markers from the task sheet. Edit the sheet, not this. */
  tasks: [
    { id: "T-01", title: "Generator servicing", owner: "Unassigned", due: "2026-09-30",
      status: "Not started", priority: "High", area: "Facilities",
      note: "Scheduled for September 2026" },
    { id: "T-02", title: "Hire a respiratory therapist or an RN with vent experience",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Staffing" },
    { id: "T-03", title: "Hire EMTs for the transportation routes",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Staffing" },
    { id: "T-04", title: "Add teaching staff for the total care room",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Staffing",
      note: "For the children with higher support needs" },
    { id: "T-05", title: "Move to the new accounting arrangement",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Finance" },
    { id: "T-06", title: "Settle member distributions",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Finance" },
    { id: "T-07", title: "Spring cleaning — clear unused items and repaint the walls",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities" },
    { id: "T-08", title: "Mock up the indoor playground and section off the floor areas",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities" },
    { id: "T-09", title: "Finish the fence and the outside area",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities" },
    { id: "T-10", title: "Install blinds in the second total care room",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities" },
    { id: "T-11", title: "Order branded promo material — blankets, onesies and the rest",
      owner: "Unassigned", due: null, status: "Not started", priority: "Low", area: "Marketing" },
    { id: "T-12", title: "Run more marketing campaigns, including video footage and local exposure",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Marketing" }
  ],
  /* TASKS:END */
  tasksNote: "Owners and due dates are maintained in the \u201cAmazing Kids PPEC - Task Board\u201d " +
    "sheet in Drive, not in this file. Fill them in there, download the sheet as CSV, and run the " +
    "importer in tools/ — the board picks up the dates and starts flagging what is overdue. " +
    "Until a task has a date it counts as unscheduled, never as late.",

  /* ---- Waiting on a source ----------------------------------------------- */
  budget: null,
  upcomingExpenses: null,
  capitalReserve: null,
  pipeline: null,
  removals: null,
  staffing: null,
  marketing: null,
  absenceReasons: null,
  attendanceTargetRate: null
};

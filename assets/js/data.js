/* =============================================================================
   Amazing Kids PPEC — Operations Board
   INPUTS ONLY. Everything the board shows that can be calculated, is — average
   daily census, attendance rate, margin, the whole projection, staffing spare
   capacity, cost shares, totals. Type a number here (or in the board's own edit
   panel) and every figure that depends on it moves with it.

   SOURCES — file ids given because two attendance exports exist and only one
   of them is authoritative.
     • Census, attendance, rooms, roster movement
         "Monthly Student Attendance: Amazing Kids PPEC", Jan–Aug 2026
         17wAFP-TfpzM9ZXLyaJlB8ZbGTwvWIH2RZnaQMFSImIs  ← THE ONE TO USE
         An older export (1po06YEzox_wHUPulB8OpWsCRgHtTUC-K6EqZzrzqyXc) covers
         Jan–May only and disagrees on some May figures. Ignore it.
     • Revenue, cost, cash
         "AMAZING KIDS PPEC LLC — Management Report", period ended 7/31/2026,
         prepared 8/28/2026. Cash basis. August is not published yet.
     • Targets, day rate, roster, staffing — reported directly, Sep 1 2026.
     • Task board — "Amazing Kids PPEC - Task Board" sheet
         1pF-bVz0iMmPji9RTBhIlO7EH5bVhCp5ArkfumYKcwjU

   ENROLLED means a child who attended at least one day that month. Children on
   the report with zero days are counted separately as records with no
   attendance.

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
    logo: "assets/img/logo.png",
    logoAlt: "Amazing Kids PPEC — Prescribed Pediatric Extended Care",
    sourceNote: "Census and attendance are aggregated from the monthly attendance report " +
      "(Jan–Aug 2026). Revenue, cost and cash come from the management report for the period " +
      "ended 7/31/2026, prepared 8/28/2026, on a cash basis. Roster, day rate and staffing are " +
      "as reported on September 1. No child-level or member-level detail is stored on this page."
  },

  /* ---- The roster today -------------------------------------------------- */
  roster: {
    asOf: "September 1, 2026",
    enrolled: 19,
    medicaidApproved: 16,
    pending: 4
  },

  /* ---- Targets ----------------------------------------------------------- */
  targets: {
    enrollment: 25,
    enrollmentOwner: "Growth plan",
    enrollmentHorizon: "Q3–Q4 2026",
    monthlyCost: 65000,
    costOwner: "Growth plan",
    costHorizon: "Monthly",
    note: "The enrolment goal is 25 children through Q3 and Q4. The roster stands at 19, with 4 " +
      "more pending — so even with every pending child starting, the centre lands at 23 and needs " +
      "two more beyond the current pipeline. Operating cost has cleared the $65K budget in three " +
      "of seven months; July's was almost entirely wages, $57.4K against a $38K run rate."
  },

  /* ---- The day rate ------------------------------------------------------ */
  perDiem: 281.68,

  /* ---- Monthly actuals ---------------------------------------------------
     enrolled  = children who attended at least one day
     onReport  = children listed on the attendance report
     revenue/cost = null for months the management report does not cover.
     Average daily census, attendance rate, dormant records and margin are all
     calculated from these. */
  months: [
    { label: "Jan", full: "Jan 2026", enrolled: 19, onReport: 31, opDays: 20, childDays: 278, started: null, stopped: null, revenue: 59997.84, cost: 82893.64 },
    { label: "Feb", full: "Feb 2026", enrolled: 16, onReport: 28, opDays: 20, childDays: 284, started: 0, stopped: 3, revenue: 66239.53, cost: 65676.48 },
    { label: "Mar", full: "Mar 2026", enrolled: 19, onReport: 28, opDays: 22, childDays: 302, started: 3, stopped: 0, revenue: 73420.75, cost: 64117.55 },
    { label: "Apr", full: "Apr 2026", enrolled: 17, onReport: 25, opDays: 22, childDays: 327, started: 1, stopped: 3, revenue: 70211.97, cost: 61677.26 },
    { label: "May", full: "May 2026", enrolled: 18, onReport: 25, opDays: 20, childDays: 324, started: 1, stopped: 0, revenue: 96294.66, cost: 59424.22 },
    { label: "Jun", full: "Jun 2026", enrolled: 20, onReport: 25, opDays: 22, childDays: 346, started: 2, stopped: 0, revenue: 76100.84, cost: 64527.16 },
    { label: "Jul", full: "Jul 2026", enrolled: 20, onReport: 25, opDays: 23, childDays: 372, started: 2, stopped: 2, revenue: 90629.63, cost: 83919.86 },
    { label: "Aug", full: "Aug 2026", enrolled: 20, onReport: 24, opDays: 20, childDays: 327, started: 1, stopped: 1, revenue: null, cost: null }
  ],
  financeNote: "Cash basis: income lands when the payment arrives, not when the care was " +
    "delivered, so a heavy claims batch inflates one month and starves the next. May's $96.3K " +
    "and January's $60.0K are the same operation.",

  /* ---- Rooms, latest month ----------------------------------------------- */
  rooms: {
    month: "August 2026",
    /* childDays per room; the daily census for each is calculated from the
       operating days of the matching month. */
    list: [
      { name: "Main Room",       attending: 13, onReport: 15, childDays: 219 },
      { name: "Total Care Room", attending:  5, onReport:  5, childDays:  71 },
      { name: "Infant Room",     attending:  2, onReport:  4, childDays:  37 }
    ],
    partnerSchool: { name: "Sunflower Christian Academy", children: 14 }
  },

  /* ---- Projection --------------------------------------------------------
     Operating days = weekdays − closures. Daily census = enrolled × the
     attendance rate. Revenue = daily census × operating days × the day rate.
     Change any input and the table, the chart and the totals follow. */
  projection: {
    attendanceRate: 0.80,
    pendingStartLabel: "October 2026",
    realizedPerChildDay: 238.65,
    months: [
      { label: "Sep", full: "Sep 2026", weekdays: 22, closures: 1, enrolled: 19, closureNote: "Labor Day, Mon Sep 7" },
      { label: "Oct", full: "Oct 2026", weekdays: 22, closures: 0, enrolled: 23, closureNote: "no closure assumed" },
      { label: "Nov", full: "Nov 2026", weekdays: 21, closures: 2, enrolled: 23, closureNote: "Thanksgiving, Thu Nov 26 and Fri Nov 27" },
      { label: "Dec", full: "Dec 2026", weekdays: 23, closures: 2, enrolled: 23, closureNote: "Christmas Eve and Christmas Day, Thu Dec 24 and Fri Dec 25" }
    ],
    assumptions: [
      "19 children enrolled today, and the 4 pending children all start in October — 23 from October on.",
      "80% attendance, applied to enrolment. August ran close to that, so it matches the recent run rate.",
      "The day rate is billed for every day a child attends.",
      "Operating days are weekdays less the closures named in the table. Adjust them there if the calendar differs.",
      "No stops, no rate change, and no cost projection — the management report gives no basis for forecasting cost."
    ],
    caveat: "Year to date the centre has realized $238.65 per child-day against the posted rate. " +
      "If that gap is denials, partial days or billing lag rather than a recent rate increase, the " +
      "projection should be read at the realized rate instead. Worth settling before this number " +
      "is used for planning."
  },


  /* ---- Distributions & the company reserve -------------------------------
     A policy, not a forecast. Net income each month is split three ways while
     the reserve is short and the revolving debt is outstanding; once both are
     settled the split moves to the second set of percentages. Change any
     percentage and the whole schedule re-runs.

     assumedMonthlyCost is a target rather than an observation: $70,000 a month
     is what the centre intends to hold cost to. For reference the year-to-date
     average is $68,891 and July ran $83,920, so it is achievable but not
     automatic — the gap is almost entirely wages. */
  distributions: {
    reserveTarget: 100000,
    /* Once the target is reached, savings keeps taking this share of net income
       every period rather than stopping. */
    ongoingSavings: 0.15,
    assumedMonthlyCost: 70000,
    startingReserve: 71116.36,          /* cash in bank at Jul 31 */
    startingDebt: 53134.99,             /* credit card + line of credit drawn */
    /* Reserve first: savings takes whatever is still needed to reach the target,
       then 15% of what is left pays down debt and the rest is distributed. */
    reserveFirst: true,
    split: { debt: 0.15, owners: 0.85 },
    /* The one place member-level detail appears. Set showMembers to false and
       the split collapses to a single distribution pool. */
    showMembers: true,
    members: [
      { name: "Eliecer Vallejo", equity: 166000 },
      { name: "Juan Labrador",   equity: 166000 },
      { name: "Miguel Montes",   equity: 166000 },
      { name: "Ivan Velasquez",  equity: 161000 },
      { name: "Matt Klynsmith",  equity:  99000 },
      { name: "Bernard Frazier", equity:  91300 }
    ],
    note: "Distributions are paid from cash actually collected, not from projected revenue, and " +
      "never below one month of operating cost left in the bank.",
    caveat: "Two things would change this materially. Cost is held at the $70,000 target; July " +
      "ran $83,920, and at that level the distributable net nearly disappears. And revenue is the " +
      "projection at the posted day rate; at the rate actually realized year to date, net over the " +
      "four months is roughly half."
  },


  /* ---- What-if -----------------------------------------------------------
     A flat children-per-day figure and a flat monthly cost, run through the
     same operating-day calendar and the same distribution policy as the live
     projection. Both numbers are editable on the card. */
  scenario: {
    childrenPerDay: 15,
    monthlyCost: 70000,
    sensitivity: [14, 15, 16, 17, 18, 19]
  },

  /* ---- Cost structure ---------------------------------------------------- */
  costLines: {
    current: "July 2026",
    prior: "June 2026",
    lines: [
      { name: "Payroll, taxes & benefits", prior: 40952.03, current: 61613.44 },
      { name: "Rent",                      prior: 11767.09, current: 11767.09 },
      { name: "Contract labor & supplies", prior:  2809.60, current:  4128.71 },
      { name: "Dues & subscriptions",      prior:  1075.60, current:  1075.60 },
      { name: "Bank service charges",      prior:   811.94, current:   788.00 },
      { name: "Internet & telephone",      prior:  1250.58, current:   764.32 },
      { name: "Direct care supplies",      prior:   729.56, current:   762.61 },
      { name: "Advertising & promotion",   prior:   537.92, current:   689.46 },
      { name: "Licenses & permits",        prior:     0.00, current:   663.59 },
      { name: "Electricity",               prior:   572.95, current:   560.76 },
      { name: "Insurance",                 prior:   426.33, current:   445.70 },
      { name: "Meals & entertainment",     prior:  1288.95, current:   365.63 },
      { name: "Repairs & maintenance",     prior:  2014.21, current:   160.00 },
      { name: "Office expenses",           prior:   105.42, current:   104.96 },
      { name: "Janitorial",                prior:    59.98, current:    29.99 },
      { name: "Professional fees",         prior:   125.00, current:     0.00 }
    ]
  },

  /* ---- Cash -------------------------------------------------------------- */
  cash: {
    asOf: "July 31, 2026",
    priorLabel: "a year earlier",
    lines: [
      { name: "Cash in bank",         value:  71116.36, prior: 8998.70 },
      { name: "Accounts payable",     value:  -1091.51, prior: null },
      { name: "Credit card balance",  value: -19172.01, prior: null },
      { name: "Line of credit drawn", value: -33962.98, prior: null }
    ],
    ytdNet: 50659.05,
    ytdNetPrior: -242951.91,
    totalEquity: 319099.07,
    note: "The year-to-date swing is the headline: net income against a substantial loss over the " +
      "same seven months last year."
  },

  /* ---- Staffing ---------------------------------------------------------- */
  staffing: {
    asOf: "September 1, 2026",
    /* Listed in skill order, not by size — the mix is what matters here.
       Full time / part time / per diem totals are counted from `type`. */
    roles: [
      { role: "RN",                  count: 2, type: "Full time" },
      { role: "LPN",                 count: 2, type: "Full time" },
      { role: "CNA",                 count: 4, type: "Full time" },
      { role: "HHA",                 count: 1, type: "Part time" },
      { role: "Per diem, all roles", count: 5, type: "Per diem" }
    ],
    discrepancy: "Recorded as 7 full-time staff, but the roles given — 2 RN, 2 LPN, 4 CNA — " +
      "sum to 8. The board counts what is listed. Confirm which is right and correct it here.",
    dailyModel: {
      supports: 25,
      lines: [
        { role: "RN", perDay: 1, roster: 2, have: "2 full time" },
        { role: "LPN", perDay: 2, roster: 2, have: "2 full time" },
        { role: "Techs (CNA / HHA)", perDay: 4, roster: 5, have: "4 full-time CNAs, 1 part-time HHA" }
      ],
      excludes: "Children in the total care room are not in this model — they are staffed separately.",
      note: "The LPN line is the pinch: two are needed on the floor every day and two are on the " +
        "roster, so a single absence has to be covered by a per diem."
    }
  },

  /* ---- Marketing --------------------------------------------------------- */
  adSpend: {
    months: [
      { label: "Jan", value: 1749.00 }, { label: "Feb", value: 2129.00 },
      { label: "Mar", value:  386.41 }, { label: "Apr", value:  566.17 },
      { label: "May", value:  856.45 }, { label: "Jun", value:  537.92 },
      { label: "Jul", value:  689.46 }
    ],
    ytdPrior: 20795.07,
    note: "Advertising is running at a fraction of last year's pace while enrolment climbed and " +
      "dormant records fell. Referral sources and campaign results are not tracked in any file " +
      "shared yet, so what is working is not visible here."
  },

  /* ---- Task board -------------------------------------------------------- */
  /* TASKS:BEGIN — `node tools/import-tasks.js <file.csv>` rewrites everything
     between these two markers from the task sheet. Edit the sheet, not this. */
  tasks: [
    { id: "T-01", title: "Generator servicing",
      owner: "Unassigned", due: "2026-09-30", status: "Not started", priority: "High", area: "Facilities",
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
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Marketing" },
    { id: "T-13", title: "Create the Amazing Kids PPEC software",
      owner: "Unassigned", due: null, status: "In progress", priority: "High", area: "Software",
      note: "Operations board is the first piece and is live on a shared link; remaining scope to be defined" }
  ],
  /* TASKS:END */
  tasksNote: "Owners and due dates are maintained in the “Amazing Kids PPEC - Task Board” sheet " +
    "in Drive. Fill them in there, download the sheet as CSV, and run the importer in tools/. " +
    "Until a task has a date it counts as unscheduled, never as late.",

  /* ---- Waiting on a source ----------------------------------------------- */
  budget: null,
  upcomingExpenses: null,
  pipeline: null,
  removals: null,
  absenceReasons: null,
  attendanceTargetRate: null
};

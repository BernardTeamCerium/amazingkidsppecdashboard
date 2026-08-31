/* =============================================================================
   Amazing Kids PPEC — Operations Board
   SINGLE SOURCE OF TRUTH FOR EVERY NUMBER ON THE BOARD.

   Edit this file to update the dashboard. Nothing else needs to change.
   All figures below are ILLUSTRATIVE SAMPLE DATA modeled on a 60-seat PPEC.
   Replace them with real operational values before using this for decisions.

   Privacy note: children are referenced by internal record ID only. Do not put
   names, DOBs, diagnoses, or any other PHI in this file — the dashboard is a
   static page and anything here ships to whoever can open it.
   ========================================================================== */

window.AKP_DATA = {
  meta: {
    facility: "Amazing Kids PPEC",
    boardName: "Operations Board",
    asOf: "August 31, 2026",
    period: "August 2026 (month-to-date close)",
    licensedCapacity: 60,
    billableDaysThisMonth: 21,
    blendedPerDiem: 158,
    sampleData: true
  },

  /* ---- Lead band --------------------------------------------------------- */
  hero: {
    label: "Average daily census",
    value: 38.4,
    unit: "children/day",
    deltaLabel: "vs. July",
    delta: 1.3,
    deltaGood: true,
    target: 45,
    note: "64% of 60 licensed seats in use"
  },

  kpis: [
    { key: "enrollment", label: "Active enrollment", value: 47, format: "int",
      sub: "of 60 licensed seats", delta: "+1 vs. July", deltaGood: true,
      target: "55 by Dec 31", state: "warning" },
    { key: "attendance", label: "Attendance rate", value: 0.817, format: "pct1",
      sub: "MTD, census ÷ enrollment", delta: "+0.9 pts vs. July", deltaGood: true,
      target: "85%", state: "warning" },
    { key: "margin", label: "Net margin", value: 0.133, format: "pct1",
      sub: "$17.5K on $131.4K revenue", delta: "+0.6 pts vs. July", deltaGood: true,
      target: "15%", state: "warning" },
    { key: "staff", label: "Staff on payroll", value: 28, format: "int",
      sub: "3 positions open", delta: "+2 vs. July", deltaGood: true,
      target: "31 budgeted", state: "serious" },
    { key: "pending", label: "Pending enrollments", value: 15, format: "int",
      sub: "eligible, not yet started", delta: "+4 vs. July", deltaGood: true,
      target: "—", state: "good" },
    { key: "removals", label: "Removals this month", value: 3, format: "int",
      sub: "21 year-to-date", delta: "−1 vs. July", deltaGood: true,
      target: "≤ 3/mo", state: "good" },
    { key: "budget", label: "Operating budget used", value: 0.944, format: "pct1",
      sub: "$113.9K of $120.7K", delta: "−1.8 pts vs. July", deltaGood: true,
      target: "≤ 100%", state: "good" }
  ],

  /* ---- Targets ----------------------------------------------------------- */
  targets: [
    { name: "Average daily census", actual: 38.4, target: 45, format: "dec1",
      owner: "Administrator", horizon: "Dec 2026", direction: "up" },
    { name: "Active enrollment", actual: 47, target: 55, format: "int",
      owner: "Intake", horizon: "Dec 2026", direction: "up" },
    { name: "Attendance rate", actual: 0.817, target: 0.85, format: "pct1",
      owner: "Nursing", horizon: "Monthly", direction: "up" },
    { name: "Net margin", actual: 0.133, target: 0.15, format: "pct1",
      owner: "Administrator", horizon: "Monthly", direction: "up" },
    { name: "Clean-claim rate", actual: 0.946, target: 0.97, format: "pct1",
      owner: "Billing", horizon: "Monthly", direction: "up" },
    { name: "Days in A/R", actual: 38, target: 30, format: "int",
      owner: "Billing", horizon: "Monthly", direction: "down" },
    { name: "Open clinical positions", actual: 3, target: 1, format: "int",
      owner: "HR", horizon: "Oct 2026", direction: "down" },
    { name: "Overtime hours / month", actual: 218, target: 150, format: "int",
      owner: "Dir. of Nursing", horizon: "Monthly", direction: "down" }
  ],

  /* ---- 12 actual months + 4 projected ------------------------------------ */
  months: [
    { label: "Sep",  full: "Sep 2025", enrolled: 38, adc: 30.1, revenue: 100200, expenses:  94100, projected: false },
    { label: "Oct",  full: "Oct 2025", enrolled: 39, adc: 31.4, revenue: 104900, expenses:  96300, projected: false },
    { label: "Nov",  full: "Nov 2025", enrolled: 40, adc: 31.0, revenue:  98700, expenses:  95800, projected: false },
    { label: "Dec",  full: "Dec 2025", enrolled: 41, adc: 30.2, revenue:  95400, expenses:  97200, projected: false },
    { label: "Jan",  full: "Jan 2026", enrolled: 42, adc: 33.6, revenue: 112800, expenses: 101400, projected: false },
    { label: "Feb",  full: "Feb 2026", enrolled: 43, adc: 34.1, revenue: 108600, expenses: 100200, projected: false },
    { label: "Mar",  full: "Mar 2026", enrolled: 44, adc: 35.2, revenue: 118500, expenses: 104300, projected: false },
    { label: "Apr",  full: "Apr 2026", enrolled: 45, adc: 35.8, revenue: 119100, expenses: 105600, projected: false },
    { label: "May",  full: "May 2026", enrolled: 45, adc: 36.4, revenue: 122300, expenses: 107100, projected: false },
    { label: "Jun",  full: "Jun 2026", enrolled: 46, adc: 36.9, revenue: 123900, expenses: 109800, projected: false },
    { label: "Jul",  full: "Jul 2026", enrolled: 46, adc: 37.1, revenue: 124600, expenses: 111200, projected: false },
    { label: "Aug",  full: "Aug 2026", enrolled: 47, adc: 38.4, revenue: 131400, expenses: 113900, projected: false },
    { label: "Sep",  full: "Sep 2026", enrolled: 49, adc: 40.2, revenue: 137500, expenses: 116400, projected: true },
    { label: "Oct",  full: "Oct 2026", enrolled: 51, adc: 41.8, revenue: 143000, expenses: 118900, projected: true },
    { label: "Nov",  full: "Nov 2026", enrolled: 52, adc: 41.5, revenue: 136800, expenses: 119400, projected: true },
    { label: "Dec",  full: "Dec 2026", enrolled: 55, adc: 42.6, revenue: 138900, expenses: 122700, projected: true }
  ],

  projectionAssumptions: [
    "Blended per-diem of $158 across full-day authorizations; 21 billable days in an average month.",
    "9 of the 15 pending children start by Oct 31; remaining 6 slip to Nov–Dec or fall out.",
    "Removals continue at 3 per month; November and December carry holiday closure days.",
    "Two LPN hires close in September, moving agency shifts back to staff wages by October.",
    "No rate change from the Medicaid plans; a rate action would reset every figure here."
  ],

  /* ---- Attendance -------------------------------------------------------- */
  attendanceTargetRate: 0.85,
  attendanceDaily: [
    { date: "Aug 12", dow: "Wed", present: 39, enrolled: 47 },
    { date: "Aug 13", dow: "Thu", present: 41, enrolled: 47 },
    { date: "Aug 14", dow: "Fri", present: 37, enrolled: 47 },
    { date: "Aug 17", dow: "Mon", present: 40, enrolled: 47 },
    { date: "Aug 18", dow: "Tue", present: 42, enrolled: 47 },
    { date: "Aug 19", dow: "Wed", present: 38, enrolled: 47 },
    { date: "Aug 20", dow: "Thu", present: 41, enrolled: 47 },
    { date: "Aug 21", dow: "Fri", present: 36, enrolled: 47 },
    { date: "Aug 24", dow: "Mon", present: 40, enrolled: 47 },
    { date: "Aug 25", dow: "Tue", present: 43, enrolled: 47 },
    { date: "Aug 26", dow: "Wed", present: 39, enrolled: 47 },
    { date: "Aug 27", dow: "Thu", present: 37, enrolled: 47 },
    { date: "Aug 28", dow: "Fri", present: 35, enrolled: 47 },
    { date: "Aug 31", dow: "Mon", present: 38, enrolled: 47 }
  ],
  absenceReasons: [
    { reason: "Inpatient hospitalization", share: 0.31, note: "4 children, 2 long-stay" },
    { reason: "Acute illness at home",     share: 0.27, note: "seasonal RSV uptick" },
    { reason: "Family transport gap",      share: 0.18, note: "route 2 capacity" },
    { reason: "Specialist appointments",   share: 0.15, note: "mostly half-days" },
    { reason: "Unexcused / no contact",    share: 0.09, note: "3 families, outreach open" }
  ],

  /* ---- Budget & expenses ------------------------------------------------- */
  budget: {
    month: "August 2026",
    revenueBudget: 128000,
    revenueActual: 131400,
    categories: [
      { name: "Clinical payroll & benefits", budget: 77500, actual: 71200 },
      { name: "Facility, rent & utilities",  budget: 13200, actual: 12800 },
      { name: "Administrative payroll",      budget: 10300, actual:  9800 },
      { name: "Transportation",              budget:  6000, actual:  6400 },
      { name: "Medical supplies & DME",      budget:  5400, actual:  5900 },
      { name: "Food & nutrition",            budget:  3200, actual:  2900 },
      { name: "Insurance & licensing",       budget:  2700, actual:  2600 },
      { name: "Software & billing services", budget:  2400, actual:  2300 }
    ]
  },

  upcomingExpenses: [
    { item: "Wheelchair-accessible van (replaces unit #2)", when: "Oct 2026", amount: 68500,
      category: "Capital", status: "Board approved", note: "Quoted; 10-week build slot held" },
    { item: "Rooftop HVAC replacement, 2 units", when: "Nov 2026", amount: 23400,
      category: "Facilities", status: "Bids out", note: "2 of 3 bids received" },
    { item: "General & professional liability renewal", when: "Dec 2026", amount: 27600,
      category: "Insurance", status: "Market check", note: "Quoted +9% at current limits" },
    { item: "EMR annual renewal", when: "Dec 2026", amount: 18900,
      category: "Technology", status: "Notice received", note: "Per-seat increase of 8%" },
    { item: "Playground resurfacing (poured-in-place)", when: "Jan 2027", amount: 31000,
      category: "Facilities", status: "Quote pending", note: "Required before spring survey" },
    { item: "AHCA license renewal & inspection fees", when: "Sep 2026", amount: 4200,
      category: "Compliance", status: "Budgeted", note: "Packet due Sep 15" }
  ],
  capitalReserve: 210000,

  /* ---- Enrollment pipeline ---------------------------------------------- */
  pipeline: {
    stages: [
      { name: "Screening in progress",   count: 3, note: "records requested" },
      { name: "Auth submitted to plan",  count: 5, note: "avg 12 days out" },
      { name: "Auth approved",           count: 4, note: "ready to schedule" },
      { name: "Intake & tour scheduled", count: 2, note: "week of Sep 8" },
      { name: "Start date confirmed",    count: 1, note: "Sep 3" }
    ],
    referrals30: 19,
    conversion: 0.63,
    avgDaysToStart: 34,
    stalled: 2
  },

  /* ---- Removals ---------------------------------------------------------- */
  removals: {
    mtd: 3,
    ytd: 21,
    reasons90: [
      { reason: "Aged out (turned 21)",              count: 4 },
      { reason: "Moved out of service area",         count: 3 },
      { reason: "Transitioned to school / home health", count: 2 },
      { reason: "Extended hospitalization",          count: 2 },
      { reason: "Lost Medicaid eligibility",         count: 1 },
      { reason: "Disenrolled for non-attendance",    count: 1 }
    ],
    recent: [
      { date: "Aug 26", record: "AK-1183", reason: "Aged out (turned 21)", seat: "Filled Sep 3" },
      { date: "Aug 19", record: "AK-1094", reason: "Moved out of service area", seat: "Open" },
      { date: "Aug 07", record: "AK-1147", reason: "Extended hospitalization", seat: "Held 30 days" },
      { date: "Jul 29", record: "AK-1052", reason: "Lost Medicaid eligibility", seat: "Filled Aug 11" },
      { date: "Jul 15", record: "AK-1121", reason: "Disenrolled for non-attendance", seat: "Filled Aug 4" }
    ]
  },

  /* ---- Staffing ---------------------------------------------------------- */
  staffing: {
    roles: [
      { role: "LPN",                 count: 10, open: 2 },
      { role: "CNA / child care aide", count: 6, open: 1 },
      { role: "RN",                    count: 5, open: 0 },
      { role: "Therapy (PT/OT/SLP)",   count: 3, open: 0 },
      { role: "Transportation",        count: 2, open: 0 },
      { role: "Administration",        count: 2, open: 0 }
    ],
    stats: {
      overtimeHours: 218,
      overtimeTarget: 150,
      agencyShifts: 26,
      calloutRate: 0.042,
      turnover12mo: 0.19,
      nurseToChild: "1 : 3.4"
    },
    credentials: [
      { who: "RN — 2 staff",  item: "BLS/CPR card",        due: "Sep 14", state: "warning" },
      { who: "LPN — 1 staff", item: "Florida LPN license", due: "Sep 30", state: "warning" },
      { who: "All clinical",  item: "Annual TB screening", due: "Oct 15", state: "good" },
      { who: "Drivers — 2",   item: "DOT physical",        due: "Oct 22", state: "good" },
      { who: "LPN — 1 staff", item: "Ventilator competency", due: "Sep 05", state: "critical" }
    ]
  },

  /* ---- Marketing --------------------------------------------------------- */
  marketing: {
    sources90: [
      { source: "Hospital discharge / NICU", count: 24 },
      { source: "Pediatric practices",       count: 18 },
      { source: "Medicaid plan case managers", count: 11 },
      { source: "Family & word of mouth",    count: 9 },
      { source: "Digital (website & search)", count: 7 },
      { source: "Community events",          count: 4 }
    ],
    tours: { booked: 14, completed: 11, converted: 6 },
    spend90: 7800,
    costPerStart: 650,
    updates: [
      { date: "Aug 19", title: "NICU discharge planner lunch-and-learn", tag: "6 referrals",
        detail: "Held at Wolfson Children's. 6 referrals attributed in the 12 days since.", state: "good" },
      { date: "Aug 08", title: "Spanish-language landing page live", tag: "Needs attention",
        detail: "31% of web inquiries since launch came through it. Intake packet still English-only.", state: "warning" },
      { date: "Aug 01", title: "Parent referral incentive launched", tag: "1 start so far",
        detail: "4 referrals, 1 converted. Reassess at 90 days against the $650 cost per start.", state: "good" },
      { date: "Aug 01", title: "Google Business profile refresh", tag: "+18% calls",
        detail: "42 calls in August, up 18% month over month. Photos and hours updated.", state: "good" },
      { date: "Sep 26", title: "Fall open house — scheduled", tag: "Sep 26 · 12 RSVPs",
        detail: "12 RSVPs so far. Flyers out to 9 pediatric practices; need 2 staff volunteers.", state: "pending" }
    ]
  },

  /* ---- Task board -------------------------------------------------------- */
  tasks: [
    { id: "T-101", title: "Clear the 30+ day A/R backlog ($42K across 61 claims)",
      owner: "Billing", due: "2026-09-12", status: "In progress", priority: "Critical", area: "Revenue cycle" },
    { id: "T-102", title: "Submit AHCA license renewal packet",
      owner: "Administrator", due: "2026-09-15", status: "In progress", priority: "High", area: "Compliance" },
    { id: "T-103", title: "Close fire inspection remediation items",
      owner: "Facilities", due: "2026-09-08", status: "Blocked", priority: "High", area: "Compliance",
      note: "Waiting on sprinkler vendor to schedule" },
    { id: "T-104", title: "Onboard 2 LPN hires — badges, EMR access, competencies",
      owner: "HR", due: "2026-09-05", status: "In progress", priority: "High", area: "Staffing" },
    { id: "T-105", title: "Update 14 care plans due for 6-month review",
      owner: "Dir. of Nursing", due: "2026-09-20", status: "In progress", priority: "High", area: "Clinical" },
    { id: "T-106", title: "Run Q3 emergency evacuation drill and file documentation",
      owner: "Dir. of Nursing", due: "2026-09-30", status: "Not started", priority: "Medium", area: "Compliance" },
    { id: "T-107", title: "Launch NICU discharge planner outreach series",
      owner: "Marketing", due: "2026-09-22", status: "Not started", priority: "Medium", area: "Growth" },
    { id: "T-108", title: "Rebid transportation insurance ahead of renewal",
      owner: "Administrator", due: "2026-10-01", status: "Not started", priority: "Medium", area: "Finance" },
    { id: "T-109", title: "Annual OSHA and bloodborne pathogen training",
      owner: "HR", due: "2026-09-29", status: "Not started", priority: "Medium", area: "Compliance" },
    { id: "T-110", title: "Replace playground shade sails before survey",
      owner: "Facilities", due: "2026-10-15", status: "Not started", priority: "Low", area: "Facilities" },
    { id: "T-111", title: "Reconcile August per-diem units against attendance log",
      owner: "Billing", due: "2026-09-04", status: "Done", priority: "High", area: "Revenue cycle" },
    { id: "T-113", title: "Rework 3 denied claims from the July remittance ($6.1K)",
      owner: "Billing", due: "2026-08-22", status: "In progress", priority: "Critical", area: "Revenue cycle",
      note: "Denials: missing auth span on 2, units mismatch on 1" },
    { id: "T-112", title: "Post two LPN openings to state and job boards",
      owner: "HR", due: "2026-08-25", status: "Done", priority: "High", area: "Staffing" }
  ]
};

/* =============================================================================
   Amazing Kids PPEC — Operations Board
   INPUTS ONLY. Everything the board shows that can be calculated, is — average
   daily census, attendance rate, margin, the whole projection, staffing spare
   capacity, cost shares, totals. Type a number here (or in the board's own edit
   panel) and every figure that depends on it moves with it.

   SOURCES — file ids given because two attendance exports exist and only one
   of them is authoritative.
     • Census, attendance, rooms, roster movement
         "Monthly Student Attendance: Amazing Kids PPEC", Jan–Sep 2026
         17wAFP-TfpzM9ZXLyaJlB8ZbGTwvWIH2RZnaQMFSImIs  ← THE ONE TO USE
         An older export (1po06YEzox_wHUPulB8OpWsCRgHtTUC-K6EqZzrzqyXc) covers
         Jan–May only and disagrees on some May figures. Ignore it.
     • Revenue, cost, cash
         "AMAZING KIDS PPEC LLC — Management Report", period ended 7/31/2026,
         prepared 8/28/2026. Cash basis. August is not published yet.
     • Targets, day rate, roster, staffing — reported directly, Sep 1 2026.
     • Task board — two files in Drive, and BOTH are behind this board.
         "Amazing Kids PPEC - Task Board" sheet, the importer's source
           1pF-bVz0iMmPji9RTBhIlO7EH5bVhCp5ArkfumYKcwjU   (T-01..T-12 only)
         "Tasks and Topics @ Amazing Kids PPEC" doc, a prose discussion list
           186Td_8En4t52zyVAcgqMEpNemzwCX12MC446jyJIB5E   (9 items, a subset)
         Importing the sheet as it stands would delete T-13..T-20, so the
         importer refuses and names them. tools/tasks-current.csv is this
         board in the importer's own format — paste it into the sheet to
         bring the two level.

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
    asOf: "September 30, 2026",
    period: "Census through Sep · P&L through Jul · bank through Sep",
    sampleData: false,
    logo: "assets/img/logo.png",
    logoAlt: "Amazing Kids PPEC — Prescribed Pediatric Extended Care",
    sourceNote: "Census and attendance are aggregated from the monthly attendance report " +
      "(Jan–Sep 2026). Revenue, cost and cash come from the management report for the period " +
      "ended 7/31/2026, prepared 8/28/2026, on a cash basis; the bank statements run through " +
      "30 September 2026. Roster, day rate and staffing are as reported on September 1. No " +
      "child-level or member-level detail is stored on this page."
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
  /* The full-day rate, for an attendance of 5–12 hours. A shorter day bills a
     lower tier, which is one candidate for the gap between what is billed and
     what is collected. A month that was billed at a different rate carries its
     own `rate` in projection.months, so a change never rewrites history. */
  perDiem: 300.73,
  perDiemPrior: 281.68,
  perDiemNote: "Full day, 5–12 hours. Raised from $281.68; the earlier rate still applies to " +
    "everything billed before the change.",

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
    { label: "Aug", full: "Aug 2026", enrolled: 20, onReport: 24, opDays: 20, childDays: 327, started: 1, stopped: 1, revenue: 80931.62, cost: 69410.54 },
    { label: "Sep", full: "Sep 2026", enrolled: 21, onReport: 22, opDays: 21, childDays: 362, started: 2, stopped: 1, revenue: 75490.24, cost: 61774.21 }
  ],
  financeNote: "Cash basis: income lands when the payment arrives, not when the care was " +
    "delivered, so a heavy claims batch inflates one month and starves the next. May's $96.3K " +
    "and January's $60.0K are the same operation.",

  /* ---- Rooms, latest month ----------------------------------------------- */
  rooms: {
    month: "September 2026",
    /* childDays per room; the daily census for each is calculated from the
       operating days of the matching month. Pending Admission is a room on the
       attendance report, and the children in it are attending — see
       billingMix for why that matters to revenue. */
    list: [
      { name: "Main Room",         attending: 12, onReport: 12, childDays: 211 },
      { name: "Total Care Room",   attending:  4, onReport:  4, childDays:  66 },
      { name: "Pending Admission", attending:  4, onReport:  5, childDays:  66 },
      { name: "Infant Room",       attending:  1, onReport:  1, childDays:  19 }
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
    realizedPerChildDay: 235.91,
    months: [
      /* September is closed. It keeps its projection inputs so the plan can still
         be recomputed and compared, and carries what the bank actually did. */
      { label: "Sep", full: "Sep 2026", weekdays: 22, closures: 1, enrolled: 19, closureNote: "Labor Day, Mon Sep 7",
        rate: 281.68,   /* billed before the rate change */
        closed: true,
        actual: {
          moneyIn: 75490.24,       /* four Medicaid remittances — every deposit in the month */
          moneyOut: 62928.32,
          closingCash: 93943.45,   /* both Truist accounts at 30 Sep */
          closingDebt: 51234.97,   /* card 19,293.91 + line of credit 31,941.06 at 30 Sep */
          toOwners: 0,
          source: "Truist consolidated statement, 30 September 2026"
        } },
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
    caveat: "Year to date the centre has realized $238.65 per child-day against the $281.68 rate it " +
      "was billing then — about 85%. The projection applies that same realization to the new rate, " +
      "so the rate rise carries the gap forward with it rather than assuming it closes. Partial days " +
      "bill a lower tier than the 5–12 hour full day, so some of that gap may be attendance length " +
      "rather than denials or lag. Worth settling before this number is used for planning."
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
    startingReserve: 81381.53,          /* cash in bank at Aug 31 */
    startingDebt: 52389.08,   /* card + line of credit at 31 Aug, per the balance sheet */             /* credit card + line of credit drawn */
    /* Reserve first: savings takes whatever is still needed to reach the target,
       then 15% of what is left pays down debt and the rest is distributed. */
    reserveFirst: true,
    split: { debt: 0.15, owners: 0.85 },
    /* The one place member-level detail appears. Set showMembers to false and
       the split collapses to a single distribution pool. */
    showMembers: true,
    /* Ownership is an agreed percentage, not a ratio of the capital accounts on
       the balance sheet — those record what each member put in, which is a
       different thing. Four members hold 20% each and the other two hold 10%
       each. The shares must add to 100%; the board flags it if they do not. */
    members: [
      { name: "Eliecer Vallejo", share: 0.20 },
      { name: "Juan Labrador",   share: 0.20 },
      { name: "Miguel Montes",   share: 0.20 },
      { name: "Ivan Velasquez",  share: 0.20 },
      { name: "Matt Klynsmith",  share: 0.10 },
      { name: "Bernard Frazier", share: 0.10 }
    ],
    note: "Distributions are paid from cash actually collected, not from projected revenue, and " +
      "never below one month of operating cost left in the bank.",
    caveat: "Two things would change this materially. Cost is held at the $70,000 target; July " +
      "ran $83,920, and at that level the distributable net nearly disappears. And revenue is the " +
      "projection at the posted day rate; at the rate actually realized year to date, net over the " +
      "remaining months is roughly half."
  },


  /* ---- What-if -----------------------------------------------------------
     A flat children-per-day figure and a flat monthly cost, run through the
     same operating-day calendar and the same distribution policy as the live
     projection. Both numbers are editable on the card. */
  scenario: {
    childrenPerDay: 15,
    monthlyCost: 70000,
    sensitivity: [14, 15, 16, 17, 18, 19, 20, 21, 22]
  },


  /* ---- Other ventures ----------------------------------------------------
     The volume side of each line is real: it comes from the census. The RATE
     side is deliberately null. Medicaid transport rates, Step Up scholarship
     amounts and therapy reimbursement rates are published figures that change
     annually, and none of them are in any file shared here — so nothing is
     guessed. Enter a rate and that line, its tab and the totals all populate.

     Ages are the other gap: no file shared carries a date of birth, so the
     count of children aged 4 and up is unknown. */
  ventures: {
    ppecAnnualBasis: "year-to-date revenue, annualized",
    list: [
      {
        id: "transportation",
        name: "Transportation",
        basis: "Medicaid non-emergency transport, billed per one-way trip",
        lines: [
          { name: "Daily routes", children: 19, childrenBasis: "every enrolled child — a ceiling, not a count of riders",
            unitsPerPeriod: 2, unitLabel: "one-way trips a day",
            periodsPerYear: 250, periodLabel: "operating days", rate: null, assumed: true }
        ],
        needs: [
          "The Florida Medicaid rate, and whether it pays per one-way trip, per round trip or per loaded mile.",
          "How many children would actually ride, rather than the 19 ceiling used here.",
          "Whether the two transportation staff already cover the routes, or this needs the EMT hires on the task board."
        ]
      },
      {
        id: "education",
        name: "Education",
        basis: "Step Up For Students, an annual scholarship per eligible student aged 4 and up",
        lines: [
          { name: "Scholarships", children: null, childrenBasis: "children aged 4 and up — no ages are on file",
            unitsPerPeriod: 1, unitLabel: "scholarship",
            periodsPerYear: 1, periodLabel: "a year", rate: null }
        ],
        needs: [
          "How many children are 4 or older. No file shared carries a date of birth, so this cannot be derived.",
          "Which scholarship applies and its current annual amount per student.",
          "Whether the 14 children already at Sunflower Christian Academy are claimed there, which would leave fewer to claim here."
        ]
      },
      {
        id: "therapy",
        name: "Therapy",
        basis: "Billed per session by discipline",
        lines: [
          { name: "Respiratory", children: 5, childrenBasis: "the total care room", unitsPerPeriod: null,
            unitLabel: "sessions a week", periodsPerYear: 52, periodLabel: "weeks", rate: null, assumed: true },
          { name: "Physical", children: 19, childrenBasis: "every enrolled child — a ceiling", unitsPerPeriod: null,
            unitLabel: "sessions a week", periodsPerYear: 52, periodLabel: "weeks", rate: null, assumed: true },
          { name: "Occupational", children: 19, childrenBasis: "every enrolled child — a ceiling", unitsPerPeriod: null,
            unitLabel: "sessions a week", periodsPerYear: 52, periodLabel: "weeks", rate: null, assumed: true },
          { name: "Speech", children: 19, childrenBasis: "every enrolled child — a ceiling", unitsPerPeriod: null,
            unitLabel: "sessions a week", periodsPerYear: 52, periodLabel: "weeks", rate: null, assumed: true }
        ],
        needs: [
          "The reimbursement rate for each discipline, and whether it pays per session or per 15-minute unit.",
          "How many children are authorized for each therapy, and how many sessions a week each receives.",
          "No therapists are on the staffing list, so each discipline also needs a hire or a contract before it bills."
        ]
      }
    ]
  },

  /* ---- Cost structure ---------------------------------------------------- */
  /* Straight off the Jan–Sep P&L (cash basis). Cost on this board is cost of
     goods sold plus total expenses, which is what nets against income. */
  costLines: {
    current: "September 2026",
    prior: "August 2026",
    lines: [
      { name: "Payroll, taxes & benefits", prior: 42480.07, current: 41964.90 },
      { name: "Rent",                      prior: 11767.09, current: 11767.09 },
      { name: "Contract labor & supplies", prior:  2839.71, current:  2090.60 },
      { name: "Janitorial",                prior:  3285.40, current:   968.79 },
      { name: "Direct care supplies",      prior:  1402.67, current:   730.72 },
      { name: "Internet & telephone",      prior:   682.47, current:   682.47 },
      { name: "Electricity",               prior:   587.81, current:   525.77 },
      { name: "Dues & subscriptions",      prior:  1730.78, current:   522.26 },
      { name: "Professional fees",         prior:     0.00, current:   500.00 },
      { name: "Bank service charges",      prior:   442.80, current:   442.80 },
      { name: "Advertising & promotion",   prior:   942.36, current:   412.16 },
      { name: "Insurance",                 prior:     0.00, current:   401.13 },
      { name: "Interest",                  prior:   358.11, current:   356.85 },
      { name: "Office expenses",           prior:   176.88, current:   191.14 },
      { name: "Repairs & maintenance",     prior:   302.00, current:   160.00 },
      { name: "Meals & entertainment",     prior:   334.64, current:    31.33 },
      { name: "Children meals",            prior:     0.00, current:    26.20 },
      { name: "Licenses & permits",        prior:  2077.75, current:     0.00 }
    ]
  },

  /* ---- Cash -------------------------------------------------------------- */
  cash: {
    asOf: "September 30, 2026",
    priorLabel: "a year earlier",
    /* Every line is now from the same balance sheet, so the net figure no
       longer mixes dates. */
    lines: [
      { name: "Cash in bank",         value:  93943.45, prior: 8998.70, asOf: "Sep 30" },
      { name: "Accounts payable",     value:  -1091.51, prior: null, asOf: "Sep 30" },
      { name: "Credit card balance",  value: -19293.91, prior: null, asOf: "Sep 30" },
      { name: "Line of credit drawn", value: -31941.06, prior: null, asOf: "Sep 30" }
    ],
    ytdNet: 75896.16,
    ytdNetPrior: -242951.91,
    totalEquity: 344336.18,
    note: "Cash, payables and borrowings are all from the balance sheet at 30 September 2026, and " +
      "the cash line agrees with the bank statement to the cent. Year-to-date net income is " +
      "through September on a cash basis."
  },

  /* ---- August, from the bank statement -----------------------------------
     A bank statement is not a profit and loss. Money in is what Medicaid
     actually paid; money out is what left the accounts, which excludes
     anything bought on the credit card and includes items that are not
     operating expenses. It answers the cash question, not the margin one. */
  /* The most recent bank statement. Rename nothing here when a new month lands —
     replace the figures and move the old month into `prior`. */
  bankMonth: {
    period: "September 2026",
    source: "Truist consolidated statement, 30 September 2026",
    opening: 81381.53,
    closing: 93943.45,
    moneyIn: 75490.24,
    moneyInNote: "four Medicaid claim payments — every deposit in the month",
    moneyOut: 62928.32,
    largest: [
      { name: "Payroll", amount: 41964.90, note: "two semi-monthly ACH settlements" },
      { name: "Rent", amount: 11767.09, note: "matches the rent line on the July P&L exactly" },
      { name: "Contract labour, by Zelle", amount: 1950.60, note: "six payments" },
      { name: "Debt service", amount: 1559.96, note: "Truist instalment and a credit card payment" },
      { name: "Utilities", amount: 1108.24, note: "power, cable and mobile" },
      { name: "Everything else", amount: 4577.53, note: "supplies, software, insurance, accounting, ads, fees" }
    ],
    prior: { period: "August 2026", moneyIn: 80931.62, moneyOut: 70666.45, closing: 81381.53 },
    caveat: "Cash out and the P&L's operating cost are different numbers and should not agree: " +
      "only $549 of credit card payment cleared the bank in September, while the card balance " +
      "fell by $143, and the P&L counts the spending rather than the repayment."
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
  /* Why billed and collected differ. The attendance report carries hours as well
     as days, so the day-length question can be answered rather than guessed; and
     it names a Pending Admission room, whose children attend before approval.
     Day length is each child's average across the month — the report gives no
     day-by-day detail, so a child who is usually full day and occasionally short
     counts as full day. Treat both as the size of a question, not a conclusion. */
  billingMix: {
    month: "September 2026",
    childDays: 362,
    fullDay: { childDays: 329, children: 19, label: "Average day of 5–12 hours" },
    shortDay: { childDays: 33, children: 2, label: "Average day under 5 hours" },
    pendingAdmission: { childDays: 66, children: 4, label: "In the Pending Admission room" },
    avgHoursPerDay: 7.77,
    note: "Revenue on the P&L is cash collected, and it runs well below the posted rate times " +
      "child-days. Two things on this report could explain the difference. Some child-days are " +
      "children whose average day is under five hours, which bills a lower tier than the full day. " +
      "And some are children in Pending Admission, who attend before approval — those days bill " +
      "late, or not at all. The two groups may overlap. A remittance showing units by tier would " +
      "settle it, and it is the largest number on the board that nobody is working on."
  },

  adSpend: {
    months: [
      { label: "Jan", value: 1749.00 }, { label: "Feb", value: 2129.00 },
      { label: "Mar", value:  386.41 }, { label: "Apr", value:  566.17 },
      { label: "May", value:  856.45 }, { label: "Jun", value:  537.92 },
      { label: "Jul", value:  689.46 }, { label: "Aug", value:  942.36 },
      { label: "Sep", value:  412.16 }
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
    { id: "T-08", title: "Settle the divider layout and mock up the indoor playground",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Facilities",
      note: "How the floor is sectioned off decides room capacity, so it gates the 25-child staffing model" },
    { id: "T-09", title: "Follow up with the fence company and finish the outside area",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities",
      note: "Waiting on the contractor" },
    { id: "T-10", title: "Install blinds in the second total care room",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities" },
    { id: "T-11", title: "Order branded promo material — blankets, onesies and the rest",
      owner: "Unassigned", due: null, status: "Not started", priority: "Low", area: "Marketing" },
    { id: "T-12", title: "Raise the marketing budget and run more campaigns",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Marketing",
      note: "Includes video footage and local exposure. Spend is running far below last year — $6.9K year to date against $20.8K — and the new monthly figure is not set yet" },
    { id: "T-13", title: "Create the Amazing Kids PPEC software",
      owner: "Unassigned", due: null, status: "In progress", priority: "High", area: "Software",
      note: "Operations board is the first piece and is live on a shared link; remaining scope to be defined" },
    { id: "T-14", title: "Put the operations board on a password-protected subdomain",
      owner: "Bernard Frazier", due: null, status: "In progress", priority: "High", area: "Software",
      note: "Deploy scaffolding is committed — see deploy/README.md. Remaining: connect the host, set the password in its environment, and point the subdomain's DNS record" },
    { id: "T-15", title: "Get ready for the annual AHCA inspection",
      owner: "Unassigned", due: null, status: "Not started", priority: "Critical", area: "Compliance",
      note: "No date set on this board yet. Everything else competes with this one — the licence does not" },
    { id: "T-16", title: "Set up the company structure for Amazing Kids Therapy",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Ventures",
      note: "The entity and licensing behind the therapy lines on the Ventures tab — respiratory, physical, occupational and speech" },
    { id: "T-17", title: "Rebuild the staffing structure and the schedule",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Staffing",
      note: "The daily model on this board is the target: 1 RN, 2 LPNs and 4 techs to carry 25 children, excluding the total care children" },
    { id: "T-18", title: "Build out the school program",
      owner: "Unassigned", due: null, status: "Not started", priority: "High", area: "Programs",
      note: "Feeds the Education tab — Step Up funding applies to children aged 4 and up, and how many of those are enrolled has not been shared yet" },
    { id: "T-19", title: "Update the flooring",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities",
      note: "Sequence against the divider layout so the floor is not cut twice" },
    { id: "T-20", title: "Find a new cleaning company",
      owner: "Unassigned", due: null, status: "Not started", priority: "Medium", area: "Facilities",
      note: "Janitorial ran $29.99 in July; whatever replaces it will cost more than the line carries" }
  ],
  /* TASKS:END */
  tasksNote: "This board is the current list; the task sheet and the topics doc in Drive both hold " +
    "less than it does. Owners and due dates belong in the sheet — fill them in, download it as " +
    "CSV, and run the importer in tools/, which refuses an import that would delete a task rather " +
    "than doing it quietly. Until a task has a date it counts as unscheduled, never as late.",

  /* ---- Waiting on a source ----------------------------------------------- */
  budget: null,
  upcomingExpenses: null,
  pipeline: null,
  removals: null,
  absenceReasons: null,
  attendanceTargetRate: null
};

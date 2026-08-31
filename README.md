# Amazing Kids PPEC — Operations Board

A single-page operations dashboard for Amazing Kids PPEC: census and attendance,
revenue, cost, margin and cash, room mix, roster movement, marketing spend, and
the open task list — on one screen, with the growth plan's targets on top.

Open `index.html` in a browser. No build step, no server, no dependencies. The
only network request is the Google Fonts stylesheet; the page falls back to
system fonts without it.

## Where the numbers come from

| Section | Source | Covers |
|---|---|---|
| Census, attendance, rooms, roster movement | "Monthly Student Attendance: Amazing Kids PPEC" (Drive) | Jan–Aug 2026 |
| Revenue, operating cost, margin, cash position | "AMAZING KIDS PPEC LLC — Management Report", period ended 7/31/2026 | Jan–Jul 2026 |
| Targets | "Amazing Kids PPEC - Growth Plan" | 20 children in Q1; $60–65K monthly budget |
| Task board | August operations discussion list (Drive) | 12 items |

Still unsourced, so those cards stay hidden: staffing headcount, referral
pipeline, removal reasons, campaign results, and a per-category budget.

### Two definitions worth knowing

- **Enrolled** means a child who attended at least one day that month. Children
  carried on the attendance report with zero days are counted separately as
  *records with no attendance* — twelve of them in January, four in August.
- **Financials are cash basis.** Income lands when the payment arrives, not when
  the care was delivered, so a heavy claims batch inflates one month and starves
  the next. Compare months with that in mind; the per-child-day figure in the
  chart's table view is the steadier read.

## Updating the board

Every figure lives in **`assets/js/data.js`**. Edit that one file and reload —
nothing else needs to change. The file is organized in the same order as the
board, with a comment over each block.

| Section on the board | Key in `data.js` |
|---|---|
| Hero figure and KPI tiles | `hero`, `kpis` |
| Targets scorecard | `targets`, `censusTarget`, `costTarget` |
| Census, revenue, cost and margin charts | `months` |
| Cost structure and composition | `costLines` |
| Cash and obligations | `cash` |
| Attendance and room mix | `months`, `rooms` |
| Roster movement | `months` (`dormant`, `started`, `stopped`) |
| Marketing spend | `adSpend` |
| Task board | `tasks` |

A few rules the file expects:

- `months` carries census for every month and `revenue`/`cost` only for the
  months the management report covers. Months without money are simply left out
  of the financial charts.
- Task `due` dates are ISO (`2026-09-30`) or `null` for unscheduled work.
  "Overdue" is computed against `meta.asOf`, so keep that current.
- `rooms.list` should add up to the latest month's census and enrollment; the
  board does not check this for you.

### Sections hide themselves when there is no data

Set any top-level block to `null` (or delete it) and the board drops it cleanly:
the card hides, a section whose cards have all hidden takes its heading with it,
and the footer lists what is still waiting. Nothing renders half-empty and no
number is invented to fill a gap.

```js
staffing: null,    // the People section disappears until headcount is wired up
marketing: null,   // so does the referral breakdown
```

### Keep PHI and member detail off this page

The attendance report names every child, the school list names them again, and
the balance sheet names every member with their equity. **None of that belongs
in `data.js`** — this is a static page, and everything in that file ships to
anyone who can open it. Aggregate first, then paste the aggregates. The board is
built so that nothing below the monthly total is ever needed.

## Files

```
index.html               page structure — cards, headings, mount points
assets/css/dashboard.css design tokens and every component style
assets/js/data.js        ALL data — the only file you normally edit
assets/js/charts.js      SVG chart primitives (line, column, bar, sparkline)
assets/js/app.js         renders the cards from data.js
build.js                 inlines everything into dist/dashboard.html
dist/dashboard.html      one self-contained file, for sharing or publishing
```

Rebuild the single-file version after editing data:

```sh
node build.js
```

## How the board reads

- **Left edge stripes** flag cards and tiles that need attention — amber for
  watch, orange for slipping, red for act now. No stripe means fine.
- **Chips** carry state next to a label, never color alone.
- **Every chart has a "Table view"** toggle underneath with the same numbers, and
  charts respond to hover and to arrow keys when focused.
- **The trend window control** scopes the census, revenue and margin charts and
  nothing else.
- **Ticking a task** stores that in your browser only. It is a personal working
  view, not a shared record — the task list itself lives in `data.js`.

Colors are a validated palette: the two chart series clear colorblind-safe
separation in both light and dark themes, status colors are reserved for state
and never reused as a series, and every column grows from zero. The board
follows the viewer's system theme, and the **Theme** button overrides it.

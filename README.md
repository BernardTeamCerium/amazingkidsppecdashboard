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
| Task board | "Amazing Kids PPEC - Task Board" sheet (Drive) | 12 items |
| Roster, day rate, staffing | Reported directly | as of Sep 1, 2026 |

Two attendance exports exist in Drive. The authoritative one is the Jan–Aug 2026
export (`17wAFP-TfpzM9ZXLyaJlB8ZbGTwvWIH2RZnaQMFSImIs`); an older Jan–May export
disagrees on some May figures and is not used. The file ids for every source are
recorded at the top of `data.js`.

Still unsourced, so those cards stay hidden: referral pipeline, removal reasons,
campaign results, and a per-category budget.

### Three definitions worth knowing

- **Enrolled** means a child who attended at least one day that month. Children
  carried on the attendance report with zero days are counted separately as
  *records with no attendance* — twelve of them in January, four in August.
- **The projection is a model, not a forecast from history.** It multiplies
  enrollment by an assumed 80% attendance, by operating days (weekdays less
  named closures), by the $281.68 day rate. Every input is visible on the card
  and editable in `projection`. Note the realization gap: year to date the
  centre has collected $238.65 per child-day, 85% of the posted rate.
- **Financials are cash basis.** Income lands when the payment arrives, not when
  the care was delivered, so a heavy claims batch inflates one month and starves
  the next. Compare months with that in mind; the per-child-day figure in the
  chart's table view is the steadier read.

## Updating the board

Two ways in.

**On the published board — the Edit button.** It opens a panel of the inputs.
Type a number and every figure that depends on it moves immediately: change the
day rate and the projection, the distribution schedule and the reserve date all
follow. **Save** publishes a new version of the page, and every open view
reloads to it. Saving needs the artifact runtime, so it works on the published
board and not on a copy opened from a file — there the edits are live but local
to the tab.

**In the repo — `assets/js/data.js`.** Same inputs, same effect, and the right
place for a bulk update. The file is organized in the same order as the board.

Either way the file holds **inputs only**. Average daily census, attendance
rate, margin, the whole projection, staffing spare capacity, cost shares, the
reserve schedule and the owner split are all calculated in
`assets/js/model.js` — never stored, so they cannot drift out of step with the
numbers they come from.

| Section on the board | Key in `data.js` |
|---|---|
| Hero figure and KPI tiles | `hero`, `kpis` |
| Targets scorecard | `targets`, `censusTarget`, `costTarget` |
| Roster tiles (enrolled / Medicaid / pending) | `roster` |
| Projection to year end | `projection` |
| Census, revenue, cost and margin charts | `months` |
| Cost structure and composition | `costLines` |
| Cash and obligations | `cash` |
| Attendance and room mix | `months`, `rooms` |
| Roster movement | `months` (`dormant`, `started`, `stopped`) |
| Staffing and the daily model | `staffing` |
| Distributions and the reserve | `distributions` |
| Marketing spend | `adSpend` |
| Task board | `tasks` |

A few rules the file expects:

- `months` carries census for every month and `revenue`/`cost` only for the
  months the management report covers. Months without money are simply left out
  of the financial charts.
- Task `due` dates are ISO (`2026-09-30`) or `null` for unscheduled work.
  "Overdue" is computed against `meta.asOf`, so keep that current. Do not edit
  the task list by hand — see below.
- `rooms.list` should add up to the latest month's census and enrollment; the
  board does not check this for you.
- `projection.months` rows carry only `weekdays`, `closures` and `enrolled`.
  Operating days, daily census and revenue are calculated from them.
- `distributions` is a policy, not a forecast. The three shares split each
  month's net income; the panel warns if they add to more or less than 100%.
  `assumedMonthlyCost` is the one figure with no source — the management report
  gives no basis for forecasting cost, so the schedule holds it at the
  year-to-date average.

## The task board is maintained in a sheet

Owners and due dates live in the **"Amazing Kids PPEC - Task Board"** sheet in
Drive, not in this repo. Fill in the blanks there, then:

```sh
# Sheet → File → Download → Comma-separated values (.csv)
node tools/import-tasks.js ~/Downloads/tasks.csv
node build.js
```

The importer rewrites everything between the `TASKS:BEGIN` / `TASKS:END` markers
in `data.js`. Columns it reads: **ID, Task, Area, Owner, Due date, Priority,
Status, Note** — in any order, extra columns ignored.

| Column | What it accepts |
|---|---|
| ID | Anything unique (`T-01`). Required, and the key the board tracks. |
| Due date | `2026-09-30` or `9/30/2026`. Leave blank for unscheduled work. |
| Priority | `Critical`, `High`, `Medium`, `Low`. Blank becomes `Medium`. |
| Status | `Not started`, `In progress`, `Blocked`, `Done`. Blank becomes `Not started`. |
| Owner | Any name. Blank becomes `Unassigned`. |

Add rows for new work and delete rows for work that is gone — the sheet is the
list, and the import replaces the board wholesale. If any row is malformed the
importer prints the line numbers and **writes nothing**, so a bad export cannot
land half-parsed data on the board.

### Sections hide themselves when there is no data

Set any top-level block to `null` (or delete it) and the board drops it cleanly:
the card hides, a section whose cards have all hidden takes its heading with it,
and the footer lists what is still waiting. Nothing renders half-empty and no
number is invented to fill a gap.

```js
staffing: null,    // the People section disappears until headcount is wired up
marketing: null,   // so does the referral breakdown
```

## Who can see this board

The published artifact is **private to your Claude account** unless you share
it. That is the real access control: a link nobody has cannot be opened. Share
it deliberately, and remove access from the artifact's share menu when someone
should no longer have it.

A password box drawn on the page itself would not add to that. Everything the
board displays travels inside the page, so anyone who can open the page can read
the numbers whether or not a passcode is drawn on top — it would look like
protection without being any.

`distributions.showMembers` is the one switch that changes what a viewer can
see: set it to `false` and the owner split collapses to a single pool with no
names or shares.

### Keep PHI and member detail off this page

The attendance report names every child, the school list names them again, and
the balance sheet names every member with their equity. **None of that belongs
in `data.js`** — this is a static page, and everything in that file ships to
anyone who can open it. Aggregate first, then paste the aggregates. The board is
built so that nothing below the monthly total is ever needed.

## The logo

Drop the logo at **`assets/img/logo.png`** (PNG or SVG, transparent background,
roughly 3:1). The masthead swaps to it on load and drops the "Amazing Kids PPEC"
wordmark beside it, since the logo carries the name itself; `build.js` inlines
the file into `dist/dashboard.html` as a data URI, which the published page
needs because its CSP blocks external images. If the file is missing or fails to
load, the board falls back to the navy-and-gold "AK" monogram — nothing breaks.

The logo is navy line art, so in dark mode it sits on a white plate
(`--logo-plate`). In light mode that plate is the masthead surface and
disappears.

Page colors are drawn from the logo: navy `#0b2c42` does the work of near-black
for text, the neutrals are pulled toward it rather than a default grey, and gold
`#ffc20e` appears exactly once, as the rule under the masthead. Gold is
deliberately *not* used for controls or state — at that size it is hard to tell
from the amber warning status, and status colors are reserved.

## Files

```
index.html               page structure — cards, headings, mount points
assets/css/dashboard.css design tokens and every component style
assets/js/data.js        ALL inputs — the only file you normally edit
assets/js/model.js       the calculation layer — everything derived lives here
assets/js/charts.js      SVG chart primitives (line, column, bar, sparkline)
assets/js/editor.js      the edit panel, and rebuilding the page to publish it
assets/js/app.js         renders the cards from the computed model
build.js                 inlines everything into dist/dashboard.html
tools/import-tasks.js    pulls the task board in from the task sheet's CSV
assets/img/logo.png      the logo (drop it in; not in the repo yet)
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

# Amazing Kids PPEC — Operations Board

A single-page operations dashboard for a Prescribed Pediatric Extended Care
center: census and enrollment, attendance, staffing, budget and margin, the
enrollment pipeline, removals, upcoming major expenses, marketing, and the open
task list — on one screen, with targets and a projection to year end.

Open `index.html` in a browser. There is no build step, no server, no
dependencies. The only network request is the Google Fonts stylesheet; the page
falls back to system fonts without it.

> **The numbers shipped here are illustrative sample data** modeled on a 60-seat
> PPEC — not the center's records. Replace them before anyone makes a decision
> from this page. The "Sample data" badge in the header disappears on its own
> once you set `meta.sampleData` to `false`.

## Updating the board

Every figure lives in **`assets/js/data.js`**. Edit that one file and reload —
nothing else needs to change. The file is organized in the same order as the
board, with a comment over each block.

| Section on the board | Key in `data.js` |
|---|---|
| Hero figure and KPI tiles | `hero`, `kpis` |
| Targets scorecard | `targets` |
| Census, revenue, margin trends and the year-end projection | `months`, `projectionAssumptions` |
| Daily attendance and absence reasons | `attendanceDaily`, `absenceReasons`, `attendanceTargetRate` |
| Budget vs. actual and expense mix | `budget` |
| Upcoming major expenses | `upcomingExpenses`, `capitalReserve` |
| Pending enrollments by stage | `pipeline` |
| Removals | `removals` |
| Staffing, workforce load, credentials | `staffing` |
| Referral sources, tours, campaign updates | `marketing` |
| Task board | `tasks` |

A few rules the file expects:

- `months` holds actuals followed by projected months; a month is projected when
  `projected: true`. The trend charts draw actuals solid and projections dashed
  under a shaded band, and the projection table reads the projected months.
- `pipeline.stages` is a *current* distribution — every pending child sits in
  exactly one stage, so the counts sum to the pending total.
- Task `due` dates are ISO (`2026-09-12`). "Overdue" is computed against the
  as-of date, so keep `meta.asOf` current.
- Attendance rate is average daily census ÷ enrollment. Enrollment is
  authorization; attendance is what actually bills.

### Keep PHI off this page

Children are referenced by internal record ID only (`AK-1183`). No names, dates
of birth, diagnoses, or clinical detail belong in `data.js` — this is a static
page, and everything in that file ships to anyone who can open it.

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
  watch, orange for slipping, red for act now. A card with no stripe is fine.
- **Chips** carry state next to a label, never color alone.
- **Every chart has a "Table view"** toggle underneath with the same numbers, and
  charts respond to hover and to arrow keys when focused.
- **The trend window control** in the header scopes the three time-series charts
  (census, revenue/expenses, margin) and nothing else. Everything else on the
  board is month-to-date as of `meta.asOf`.
- **Ticking a task** stores that in your browser only. It is a personal working
  view, not a shared record — the task list itself lives in `data.js`.

Colors are a validated palette: the two chart series clear colorblind-safe
separation in both light and dark themes, status colors are reserved for state
and never reused as a series, and the pipeline ramp is a single hue stepped
light to dark. The board follows the viewer's system theme, and the **Theme**
button overrides it.

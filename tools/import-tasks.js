#!/usr/bin/env node
/* Rewrites the task board in assets/js/data.js from a CSV export of the task
   sheet, so due dates and owners are maintained in the sheet rather than here.

   Usage:  node tools/import-tasks.js path/to/tasks.csv
   Get the CSV from the sheet: File → Download → Comma-separated values.

   Expected columns (header row, any order, extra columns ignored):
     ID, Task, Area, Owner, Due date, Priority, Status, Note

   It refuses to write anything if a row looks wrong, so a bad export can never
   quietly land half-parsed data on the board. */

const fs = require("fs");
const path = require("path");

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Not started", "In progress", "Blocked", "Done"];

/* --- CSV parsing: quoted fields, embedded commas, doubled quotes ---------- */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const norm = (s) => String(s || "").trim();
const key = (s) => norm(s).toLowerCase().replace(/[^a-z]/g, "");

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: node tools/import-tasks.js path/to/tasks.csv");
    process.exit(1);
  }
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  if (rows.length < 2) { console.error("That CSV has no task rows."); process.exit(1); }

  const header = rows[0].map(key);
  const col = (...names) => {
    for (const n of names) { const i = header.indexOf(n); if (i !== -1) return i; }
    return -1;
  };
  const idx = {
    id: col("id"), title: col("task", "title"), area: col("area"),
    owner: col("owner"), due: col("duedate", "due"),
    priority: col("priority"), status: col("status"), note: col("note", "notes")
  };
  for (const req of ["id", "title"]) {
    if (idx[req] === -1) { console.error(`Missing a "${req}" column in the CSV header.`); process.exit(1); }
  }

  const problems = [];
  const seen = new Set();
  const tasks = rows.slice(1).map((r, n) => {
    const at = (i) => (i === -1 ? "" : norm(r[i]));
    const line = n + 2;                       // header is line 1
    const id = at(idx.id), title = at(idx.title);
    if (!id) problems.push(`line ${line}: no ID`);
    if (seen.has(id)) problems.push(`line ${line}: duplicate ID ${id}`);
    seen.add(id);
    if (!title) problems.push(`line ${line}: no task text`);

    let due = at(idx.due);
    if (due) {
      // Accept 2026-09-30 and the 9/30/2026 that a sheet export often produces.
      const us = due.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (us) due = `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || isNaN(Date.parse(due + "T00:00:00"))) {
        problems.push(`line ${line}: due date "${at(idx.due)}" is not a real date (use 2026-09-30)`);
      }
    }
    const priority = at(idx.priority) || "Medium";
    if (!PRIORITIES.includes(priority)) {
      problems.push(`line ${line}: priority "${priority}" — use one of ${PRIORITIES.join(", ")}`);
    }
    const status = at(idx.status) || "Not started";
    if (!STATUSES.includes(status)) {
      problems.push(`line ${line}: status "${status}" — use one of ${STATUSES.join(", ")}`);
    }
    return {
      id, title, owner: at(idx.owner) || "Unassigned", due: due || null,
      status, priority, area: at(idx.area) || "Operations", note: at(idx.note) || undefined
    };
  });

  if (problems.length) {
    console.error("Nothing was written. Fix these rows in the sheet and export again:\n  " +
      problems.join("\n  "));
    process.exit(1);
  }

  const q = (s) => JSON.stringify(s);
  const body = tasks.map((t) =>
    `    { id: ${q(t.id)}, title: ${q(t.title)},\n` +
    `      owner: ${q(t.owner)}, due: ${t.due ? q(t.due) : "null"}, ` +
    `status: ${q(t.status)}, priority: ${q(t.priority)}, area: ${q(t.area)}` +
    (t.note ? `,\n      note: ${q(t.note)}` : "") + " }"
  ).join(",\n");

  const dataPath = path.join(__dirname, "..", "assets", "js", "data.js");
  const src = fs.readFileSync(dataPath, "utf8");
  const begin = src.indexOf("/* TASKS:BEGIN");
  const end = src.indexOf("/* TASKS:END */");
  if (begin === -1 || end === -1) {
    console.error("Could not find the TASKS:BEGIN / TASKS:END markers in data.js.");
    process.exit(1);
  }
  const head = src.slice(0, begin);
  const tail = src.slice(end);
  const block =
    "/* TASKS:BEGIN — `node tools/import-tasks.js <file.csv>` rewrites everything\n" +
    "     between these two markers from the task sheet. Edit the sheet, not this. */\n" +
    "  tasks: [\n" + body + "\n  ],\n  ";
  fs.writeFileSync(dataPath, head + block + tail);

  const dated = tasks.filter((t) => t.due).length;
  const owned = tasks.filter((t) => t.owner !== "Unassigned").length;
  console.log(`Imported ${tasks.length} tasks — ${dated} with a due date, ${owned} with an owner.`);
  console.log("Now run: node build.js");
}

main();

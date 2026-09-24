/**
 * PDF export for the Accounts section.
 *
 * Deliberately dependency-free: it opens a print window with an A4 stylesheet
 * and calls window.print(), which every browser offers as "Save as PDF".
 * Adding jsPDF/pdfmake would mean a new package in a live product, which is
 * out of scope here.
 */
import dayjs from "dayjs";
import { inr, num } from "./format";

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const esc = (v) =>
  v === null || v === undefined
    ? ""
    : String(v).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

const STYLES = `
  @page { size: A4 landscape; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    color: #1f2937;
    font-size: 11px;
    margin: 0;
  }
  .doc-head { border-bottom: 2px solid #b45309; padding-bottom: 8px; margin-bottom: 10px; }
  .org { font-size: 16px; font-weight: 700; color: #92400e; }
  .title { font-size: 13px; font-weight: 600; margin-top: 2px; }
  .meta { font-size: 10px; color: #6b7280; margin-top: 4px; }
  .meta span { margin-right: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  thead { display: table-header-group; }
  th {
    background: #fffbeb;
    color: #92400e;
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid #fcd34d;
    padding: 5px 6px;
    font-size: 10px;
  }
  td { padding: 4px 6px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  tr { page-break-inside: avoid; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tfoot td {
    border-top: 2px solid #b45309;
    border-bottom: none;
    font-weight: 700;
    background: #fffbeb;
    color: #92400e;
  }
  .section-title {
    font-size: 12px; font-weight: 700; color: #92400e;
    margin: 14px 0 2px; padding-bottom: 3px; border-bottom: 1px solid #fcd34d;
  }
  .kv { display: flex; flex-wrap: wrap; gap: 6px 26px; margin: 8px 0; }
  .kv div { font-size: 10.5px; }
  .kv b { color: #92400e; font-weight: 600; }
  .note {
    margin-top: 14px; padding: 6px 8px; background: #fffbeb;
    border-left: 3px solid #f59e0b; font-size: 9.5px; color: #78350f;
  }
  .foot {
    margin-top: 18px; display: flex; justify-content: space-between;
    font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 5px;
  }
`;

const renderTable = ({ columns = [], rows = [], totals = null }) => {
  const head = columns
    .map((c) => `<th class="${c.numeric ? "num" : ""}">${esc(c.title)}</th>`)
    .join("");

  const body = rows
    .map((r) => {
      const tds = columns
        .map((c) => {
          const raw = typeof c.value === "function" ? c.value(r) : r[c.key];
          const text = c.numeric ? inr(raw, { blankZero: true }) : raw;
          return `<td class="${c.numeric ? "num" : ""}">${esc(text)}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");

  let foot = "";
  if (totals) {
    const tds = columns
      .map((c, i) => {
        if (i === 0) return `<td>${esc(totals.label || "Total")}</td>`;
        const v = totals[c.key];
        if (v === undefined || v === null) return "<td></td>";
        return `<td class="num">${esc(inr(v))}</td>`;
      })
      .join("");
    foot = `<tfoot><tr>${tds}</tr></tfoot>`;
  }

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table>`;
};

/**
 * Open a print-ready document.
 *
 * @param {object} opts
 * @param {string} opts.title        Report name, e.g. "Sales Register"
 * @param {string} opts.orgName      Company name printed at the top
 * @param {string} opts.period       "01-04-2025 to 31-03-2026"
 * @param {object[]} opts.meta       [{ label, value }] extra header facts
 * @param {object[]} opts.sections   [{ heading, columns, rows, totals, kv }]
 * @param {string} opts.note         Derivation note printed at the bottom
 * @param {boolean} opts.portrait    Use portrait orientation
 */
export const printReport = ({
  title = "Report",
  orgName = "",
  period = "",
  meta = [],
  sections = [],
  note = "",
  portrait = false,
} = {}) => {
  const win = window.open("", "_blank", "width=1200,height=800");
  if (!win) {
    // Popup blocked — the caller surfaces a message.
    return false;
  }

  const metaHtml = [
    period ? `<span><b>Period:</b> ${esc(period)}</span>` : "",
    ...meta.map((m) => `<span><b>${esc(m.label)}:</b> ${esc(m.value)}</span>`),
  ]
    .filter(Boolean)
    .join("");

  const sectionsHtml = sections
    .map((s) => {
      const heading = s.heading
        ? `<div class="section-title">${esc(s.heading)}</div>`
        : "";
      const kv = s.kv?.length
        ? `<div class="kv">${s.kv
            .map((k) => `<div><b>${esc(k.label)}:</b> ${esc(k.value)}</div>`)
            .join("")}</div>`
        : "";
      const table = s.columns?.length ? renderTable(s) : "";
      return heading + kv + table;
    })
    .join("");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${esc(title)}</title>
    <style>${STYLES}${portrait ? "@page { size: A4 portrait; }" : ""}</style>
  </head>
  <body>
    <div class="doc-head">
      <div class="org">${esc(orgName || "Organisation")}</div>
      <div class="title">${esc(title)}</div>
      <div class="meta">${metaHtml}</div>
    </div>
    ${sectionsHtml}
    ${note ? `<div class="note">${esc(note)}</div>` : ""}
    <div class="foot">
      <span>Generated on ${esc(dayjs().format("DD-MM-YYYY HH:mm"))}</span>
      <span>Distribution Management System — Accounts</span>
    </div>
  </body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the browser a tick to lay the document out before printing.
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* user can still print manually */
    }
  }, 350);
  return true;
};

/** Convenience wrapper for a single-table report. */
export const printTable = ({ columns, rows, totals, ...rest }) =>
  printReport({ ...rest, sections: [{ columns, rows, totals }] });

/** Build a totals object from rows for the given numeric column keys. */
export const buildTotals = (rows, keys, label = "Total") => {
  const t = { label };
  keys.forEach((k) => {
    t[k] = rows.reduce((a, r) => a + num(r[k]), 0);
  });
  return t;
};

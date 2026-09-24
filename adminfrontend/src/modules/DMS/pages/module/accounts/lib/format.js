/**
 * Accounts formatting helpers.
 * Indian numbering, Dr/Cr presentation and safe numeric coercion.
 * No external dependencies beyond dayjs (already used across the app).
 */
import dayjs from "dayjs";

/** Coerce anything the API sends (string, null, "-", undefined) to a number. */
export const num = (v) => {
  if (v === null || v === undefined || v === "" || v === "-") return 0;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Round to 2 decimals without float drift. */
export const round2 = (v) => Math.round((num(v) + Number.EPSILON) * 100) / 100;

/** 1234567.5 -> "12,34,567.50" (Indian grouping). */
export const inr = (v, { decimals = 2, blankZero = false } = {}) => {
  const n = num(v);
  if (blankZero && n === 0) return "";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/** "₹12,34,567.50" */
export const inrSymbol = (v, opts) => {
  const s = inr(v, opts);
  return s === "" ? "" : `₹${s}`;
};

/** Quantity formatting — 3 decimals, trailing zeros trimmed. */
export const qty = (v) => {
  const n = num(v);
  if (n === 0) return "0";
  return n
    .toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
};

/**
 * Tally-style signed balance.
 * Positive => Dr, negative => Cr. Returns { text, amount, side }.
 */
export const drcr = (v) => {
  const n = round2(v);
  if (n === 0) return { text: "0.00", amount: 0, side: "" };
  const side = n > 0 ? "Dr" : "Cr";
  return { text: `${inr(Math.abs(n))} ${side}`, amount: Math.abs(n), side };
};

export const DATE_FMT = "DD-MM-YYYY";

/** Parse the several date shapes this backend returns. */
export const toDate = (v) => {
  if (!v) return null;
  if (dayjs.isDayjs(v)) return v;
  // DD-MM-YYYY is used by freight/LR rows; ISO everywhere else.
  const s = String(v);
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return dayjs(s, "DD-MM-YYYY");
  const d = dayjs(s);
  return d.isValid() ? d : null;
};

export const fmtDate = (v) => {
  const d = toDate(v);
  return d ? d.format(DATE_FMT) : "-";
};

/** "Apr 2025" bucket key used by the month-wise registers. */
export const monthKey = (v) => {
  const d = toDate(v);
  return d ? d.format("YYYY-MM") : "";
};

export const monthLabel = (key) => {
  if (!key) return "-";
  const d = dayjs(`${key}-01`);
  return d.isValid() ? d.format("MMM YYYY") : key;
};

/** Sum a numeric field across rows. */
export const sumBy = (rows = [], key) =>
  round2(rows.reduce((a, r) => a + num(typeof key === "function" ? key(r) : r[key]), 0));

/** First non-empty value among several candidate keys. */
export const pick = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

/** Normalise a state name for intra/inter-state comparison. */
export const normState = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

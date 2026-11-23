/**
 * Turns a failed API call (axios error) into text an end user can read.
 *
 * Backend error bodies come in several shapes (DRF / hand written views):
 *   { "detail": "Not found." }                         { "message": "Vendor is inactive" }
 *   { "error": "..." }                                 { "status": false, "message": "..." }
 *   { "vendor": ["This field is required."] }          { "non_field_errors": ["..."] }
 *   { "items": [ {}, { "qty": ["Must be > 0"] } ] }    ["plain list"]        "plain string"
 */

// Keys that carry no text for the user
const SKIP_KEYS = new Set(["status", "success", "code", "status_code", "statusCode"]);
// Keys whose value is the message itself, so they are not shown as a "Label: " prefix
const NO_LABEL_KEYS = new Set([
  "detail",
  "message",
  "msg",
  "error",
  "errors",
  "non_field_errors",
  "non_field_error",
]);

const MAX_LINES = 4;
const MAX_TEXT_LENGTH = 300;

// "supplier_gst" -> "Supplier gst"
const humanizeKey = (key) => {
  const text = String(key).replace(/[_-]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const isUsableText = (text) => {
  const t = String(text).trim();
  // HTML error pages (Django debug / nginx) and huge blobs are not meant for users
  return t.length > 0 && t.length <= MAX_TEXT_LENGTH && !/^\s*</.test(t);
};

/**
 * Flattens an error body into [{ label, text }] (label is "" for message-only keys).
 */
const collect = (value, labelParts, out) => {
  if (value === null || value === undefined) return;

  if (typeof value === "string") {
    if (isUsableText(value)) {
      out.push({ label: labelParts.join(" › "), text: value.trim() });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      // Row-level errors (e.g. items[2].qty): keep the row number so the user can find it
      const isRow = entry && typeof entry === "object" && !Array.isArray(entry);
      if (isRow && value.length > 1 && labelParts.length) {
        const parts = [...labelParts];
        parts[parts.length - 1] = `${parts[parts.length - 1]} #${index + 1}`;
        collect(entry, parts, out);
      } else {
        collect(entry, labelParts, out);
      }
    });
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, nested]) => {
      if (SKIP_KEYS.has(key)) return;
      collect(nested, NO_LABEL_KEYS.has(key) ? labelParts : [...labelParts, humanizeKey(key)], out);
    });
  }
};

/**
 * Readable lines from the response body, or [] when the body holds nothing usable.
 * Each line is { label, text } so callers can compare on the message part alone.
 */
export const getApiErrorLines = (error) => {
  const data = error?.response?.data;
  if (data === null || data === undefined) return [];
  if (typeof Blob !== "undefined" && data instanceof Blob) return [];

  const lines = [];
  collect(data, [], lines);

  // Same text twice (e.g. "detail" repeated per field) adds nothing
  const seen = new Set();
  return lines.filter(({ label, text }) => {
    const k = `${label}|${text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/** Message for failures where the server gave nothing usable (or must not be shown raw). */
export const getStatusFallbackMessage = (error) => {
  if (!error?.response) {
    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
      return "The request timed out. Please try again.";
    }
    return "Network error. Please check your internet connection and try again.";
  }

  const status = error.response.status;
  if (status >= 500) {
    return `Server error (${status}). Please try again, or contact support if it continues.`;
  }
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested record was not found.";
  if (status === 413) return "The file or data you are sending is too large.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  return "The server could not process this request. Please check the details you entered.";
};

/**
 * The text to show the user for a failed request, one issue per line.
 * Server errors (5xx) never show the raw body: it is a stack trace or HTML page, not guidance.
 */
export const getApiErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  if (!error?.response || status >= 500) {
    return fallback || getStatusFallbackMessage(error);
  }

  const lines = getApiErrorLines(error);
  if (lines.length === 0) return fallback || getStatusFallbackMessage(error);

  const shown = lines
    .slice(0, MAX_LINES)
    .map(({ label, text }) => (label ? `${label}: ${text}` : text));
  if (lines.length > MAX_LINES) {
    shown.push(`...and ${lines.length - MAX_LINES} more`);
  }
  return shown.join("\n");
};

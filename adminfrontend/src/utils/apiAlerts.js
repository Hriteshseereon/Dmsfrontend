import { isValidElement } from "react";
import { message } from "antd";

import { getApiErrorLines, getApiErrorMessage } from "./apiError";

/**
 * One place that tells the end user when a save / update / delete request fails.
 *
 * Called from the axios response interceptor (api/axios.js) for every failed POST / PUT / PATCH / DELETE,
 * so a form never fails silently - whether its catch block shows a message, logs to the console only,
 * or has no catch at all.
 *
 * Many screens already show their own generic toast ("Failed to update asset"). To avoid a second,
 * stacked toast, `message.error` is wrapped once to remember the latest toast. A moment after a request
 * fails:
 *   - no toast was shown by the screen          -> show the server's reason
 *   - the screen showed a plain-text toast       -> add the reason to that same toast (updated in place)
 *   - the toast already contains the reason      -> leave it alone
 *   - the screen showed a custom (JSX) toast     -> leave it alone
 */

const ALERT_KEY = "api-error-alert";
const ALERT_DURATION = 6; // seconds - longer than the default 3s because it carries the reason
// Wait for the screen's own catch / onError handler, which may run a tick or two after the rejection
const SETTLE_MS = 50;
const ALERT_STYLE = { whiteSpace: "pre-line", textAlign: "left" };

/* State lives on the antd `message` object so it survives hot-reloads of this file */
const getTracker = () => {
  if (!message.__errorToastTracker) {
    message.__errorToastTracker = { last: null, seq: 0, original: null };
  }
  return message.__errorToastTracker;
};

const installLocalErrorToastTracker = () => {
  const tracker = getTracker();
  if (tracker.original) return;

  tracker.original = message.error;
  message.error = (...args) => {
    const [first, duration, onClose] = args;
    const isConfigObject =
      first && typeof first === "object" && !isValidElement(first) && "content" in first;

    // Always give the toast a key so it can be updated in place later
    const config = isConfigObject ? { ...first } : { content: first };
    if (!isConfigObject && duration !== undefined) config.duration = duration;
    if (!isConfigObject && onClose !== undefined) config.onClose = onClose;
    if (config.key === undefined) config.key = `local-error-${++tracker.seq}`;

    tracker.last = { key: config.key, config, at: Date.now() };
    return tracker.original.call(message, config);
  };
};

installLocalErrorToastTracker();

const normalise = (text) => String(text).toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Shows (or merges into an existing toast) the reason a write request failed.
 * Safe to call more than once for the same error.
 */
export const showApiErrorAlert = (error) => {
  if (!error || error.__apiAlerted) return;
  error.__apiAlerted = true;

  const failedAt = Date.now();
  const text = getApiErrorMessage(error);
  // Compare on the message part only, so "Vendor: Already exists" matches a screen that shows "Already exists"
  const firstLine = getApiErrorLines(error)[0]?.text || text;

  setTimeout(() => {
    const tracker = getTracker();
    const local = tracker.last && tracker.last.at >= failedAt ? tracker.last : null;
    // The screen's own toast goes through the wrapper; ours must not be mistaken for one
    const show = (config) => tracker.original.call(message, config);

    if (!local) {
      show({ content: text, key: ALERT_KEY, duration: ALERT_DURATION, style: ALERT_STYLE });
      return;
    }

    if (typeof local.config.content !== "string") return; // custom toast: not ours to edit
    if (normalise(local.config.content).includes(normalise(firstLine))) return; // already says why

    show({
      ...local.config,
      content: `${local.config.content}\n${text}`,
      key: local.key, // same key -> the existing toast is updated, not duplicated
      duration: Math.max(Number(local.config.duration) || 0, ALERT_DURATION),
      style: { ...ALERT_STYLE, ...local.config.style },
    });
  }, SETTLE_MS);
};

// Login / token refresh show their own inline errors
const SELF_HANDLED_URL = /\/(auth|users)\/(login|refresh)\/?(\?|$)/;
const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

/**
 * Interceptor entry point: alerts for failed write requests only.
 * Opt out per request with `api.post(url, body, { skipErrorAlert: true })`
 * (use it when the caller retries, or deliberately expects the request to fail).
 */
export const notifyWriteRequestFailure = (error) => {
  const config = error?.config;
  if (!config) return;
  if (error.code === "ERR_CANCELED") return; // aborted on purpose, not a failure
  if (config.skipErrorAlert) return;
  if (!WRITE_METHODS.has(String(config.method || "").toLowerCase())) return;
  if (SELF_HANDLED_URL.test(String(config.url || ""))) return;

  showApiErrorAlert(error);
};

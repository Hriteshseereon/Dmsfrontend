// ─────────────────────────────────────────────────────────────────────────────
// customerDraftUtils.js
// Utility helpers for customer form draft persistence (localStorage).
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_PREFIX = "customer-form-draft-";

// ── Serialise / deserialise ──────────────────────────────────────────────────

/**
 * Convert form values so they can be stored in localStorage.
 * - dayjs objects → ISO string
 * - Upload fileList → only metadata (no originFileObj, which is a File binary)
 */
export const serialiseDraftValues = (values) => {
  const out = {};

  for (const [key, val] of Object.entries(values)) {
    if (!val && val !== 0 && val !== false) {
      out[key] = val;
      continue;
    }

    // dayjs instance
    if (val && typeof val === "object" && typeof val.isValid === "function") {
      out[key] = val.isValid() ? val.toISOString() : null;
      continue;
    }

    // Upload fileList array  (each item has uid, name, status, url …)
    if (Array.isArray(val) && val.length && val[0]?.uid !== undefined) {
      out[key] = val.map(({ uid, name, status, url, thumbUrl }) => ({
        uid,
        name,
        status,
        url,
        thumbUrl,
        // originFileObj is a File — cannot be serialised; mark it absent
        _fromDraft: true,
      }));
      continue;
    }

    out[key] = val;
  }

  return out;
};

/**
 * Restore form values from a draft object.
 * - ISO strings that look like dates → dayjs
 * - File arrays are returned as-is (no originFileObj; the server URL is kept)
 */
export const deserialiseDraftValues = (draft, dayjs) => {
  const out = {};

  for (const [key, val] of Object.entries(draft)) {
    if (val === null || val === undefined) {
      out[key] = val;
      continue;
    }

    // ISO date string
    if (
      typeof val === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)
    ) {
      const d = dayjs(val);
      out[key] = d.isValid() ? d : null;
      continue;
    }

    // File meta array
    if (Array.isArray(val) && val.length && val[0]?._fromDraft) {
      out[key] = val; // keep as-is; Upload shows them via `url`
      continue;
    }

    out[key] = val;
  }

  return out;
};

// ── CRUD helpers ─────────────────────────────────────────────────────────────

/** Save (create or update) a draft. Returns the draft id. */
export const saveDraft = (id, values, meta = {}) => {
  const payload = {
    id,
    savedAt: new Date().toISOString(),
    meta, // { name, email, mobileNo } – for the draft table display
    values: serialiseDraftValues(values),
  };
  localStorage.setItem(id, JSON.stringify(payload));
  return id;
};

/** Create a brand-new draft id and persist it. */
export const createDraft = (values, meta = {}) => {
  const id = `${DRAFT_PREFIX}${Date.now()}`;
  return saveDraft(id, values, meta);
};

/** Load a single draft by id. Returns { id, savedAt, meta, values } | null */
export const loadDraft = (id) => {
  try {
    const raw = localStorage.getItem(id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/** Delete a draft by id. */
export const deleteDraft = (id) => localStorage.removeItem(id);

/** Return all customer drafts as an array sorted newest-first. */
export const getAllCustomerDrafts = () => {
  const result = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DRAFT_PREFIX)) continue;

    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed?.values) {
        result.push({
          id: key,
          savedAt: parsed.savedAt,
          name: parsed.meta?.name || parsed.values?.name || "—",
          email: parsed.meta?.email || parsed.values?.email || "—",
          mobile: parsed.meta?.mobileNo || parsed.values?.mobileNo || "—",
        });
      }
    } catch {
      // corrupt entry – skip
    }
  }

  return result.sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt),
  );
};
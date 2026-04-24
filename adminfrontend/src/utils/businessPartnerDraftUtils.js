// ─────────────────────────────────────────────────────────────────────────────
// businessPartnerDraftUtils.js
// Unified draft utility for all business partner modules (Customer, Transport, Vendor, Broker)
// ─────────────────────────────────────────────────────────────────────────────

// Draft prefixes for different modules
export const DRAFT_PREFIXES = {
  customer: "customer-form-draft-",
  transport: "transport-form-draft-",
  vendor: "vendor-form-draft-",
  broker: "broker-form-draft-"
};

// ── Serialise / deserialise ──────────────────────────────────────────────────

/**
 * Convert form values so they can be stored in localStorage.
 * - dayjs objects → ISO string
 * - Upload fileList → only metadata (no originFileObj, which is a File binary)
 * - Nested objects (like plants array) → recursively processed
 */
export const serialiseDraftValues = (values) => {
  const out = {};
  const processValue = (val) => {
    if (!val && val !== 0 && val !== false) {
      return val;
    }

    // dayjs instance
    if (val && typeof val === "object" && typeof val.isValid === "function") {
      return val.isValid() ? val.toISOString() : null;
    }

    // Upload fileList array
    if (Array.isArray(val) && val.length && val[0]?.uid !== undefined) {
      return val.map(({ uid, name, status, url, thumbUrl }) => ({
        uid,
        name,
        status,
        url,
        thumbUrl,
        _fromDraft: true,
      }));
    }

    // Array of objects (like plants) - process recursively
    if (Array.isArray(val)) {
      return val.map(item => {
        if (item && typeof item === "object") {
          const processed = {};
          for (const [key, innerVal] of Object.entries(item)) {
            processed[key] = processValue(innerVal);
          }
          return processed;
        }
        return item;
      });
    }

    // Plain object - process recursively
    if (val && typeof val === "object") {
      const processed = {};
      for (const [key, innerVal] of Object.entries(val)) {
        processed[key] = processValue(innerVal);
      }
      return processed;
    }

    return val;
  };

  for (const [key, val] of Object.entries(values)) {
    out[key] = processValue(val);
  }

  return out;
};

/**
 * Restore form values from a draft object.
 * - ISO strings that look like dates → dayjs
 * - File arrays are returned as-is (no originFileObj; the server URL is kept)
 */
export const deserialiseDraftValues = (draft, dayjs) => {
  if (!draft || typeof draft !== 'object') {
    console.error('[Draft] Invalid draft data provided to deserialiseDraftValues:', draft);
    return {};
  }

  const out = {};
  const restoreValue = (val, keyPath = '') => {
    if (val === null || val === undefined) {
      return val;
    }

    // ISO date string
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      const d = dayjs(val);
      if (d.isValid()) {
        return d;
      } else {
        console.warn(`[Draft] Invalid date string at ${keyPath}:`, val);
        return null;
      }
    }

    // File meta array
    if (Array.isArray(val) && val.length && val[0]?._fromDraft) {
      return val;
    }

    // Array of objects - restore recursively
    if (Array.isArray(val)) {
      return val.map((item, index) => {
        if (item && typeof item === "object") {
          const restored = {};
          for (const [key, innerVal] of Object.entries(item)) {
            restored[key] = restoreValue(innerVal, `${keyPath}[${index}].${key}`);
          }
          return restored;
        }
        return item;
      });
    }

    // Plain object - restore recursively
    if (val && typeof val === "object") {
      const restored = {};
      for (const [key, innerVal] of Object.entries(val)) {
        restored[key] = restoreValue(innerVal, keyPath ? `${keyPath}.${key}` : key);
      }
      return restored;
    }

    return val;
  };

  try {
    for (const [key, val] of Object.entries(draft)) {
      out[key] = restoreValue(val, key);
    }

    console.log('[Draft] Successfully deserialized draft values:', {
      totalKeys: Object.keys(draft).length,
      restoredKeys: Object.keys(out),
      sampleData: Object.keys(out).slice(0, 3).reduce((acc, key) => {
        acc[key] = out[key];
        return acc;
      }, {})
    });

    return out;
  } catch (error) {
    console.error('[Draft] Error during deserialization:', error);
    return {};
  }
};

// ── CRUD helpers ─────────────────────────────────────────────────────────────

/**
 * Save (create or update) a draft. Returns the draft id.
 */
export const saveDraft = (id, values, meta = {}) => {
  try {
    // Check localStorage availability
    if (typeof localStorage === 'undefined') {
      console.error('[Draft] localStorage is not available');
      return id;
    }

    const serializedValues = serialiseDraftValues(values);

    const payload = {
      id,
      savedAt: new Date().toISOString(),
      meta,
      values: serializedValues,
    };

    const jsonString = JSON.stringify(payload);

    // Check if localStorage quota might be exceeded
    if (jsonString.length > 5 * 1024 * 1024) { // 5MB limit
      console.warn('[Draft] Draft data is very large, might exceed localStorage quota:', {
        size: jsonString.length,
        draftId: id
      });
    }

    localStorage.setItem(id, jsonString);

    console.log('[Draft] Successfully saved draft:', {
      draftId: id,
      hasValues: !!payload.values,
      valuesKeys: Object.keys(payload.values || {}),
      savedAt: payload.savedAt,
      dataSize: jsonString.length
    });

    return id;
  } catch (error) {
    console.error('[Draft] Error saving draft:', error);
    // Return id anyway so the UI doesn't break, but the save failed
    return id;
  }
};

/**
 * Create a brand-new draft id and persist it.
 */
export const createDraft = (moduleType, values, meta = {}) => {
  const prefix = DRAFT_PREFIXES[moduleType];
  if (!prefix) {
    throw new Error(`Invalid module type: ${moduleType}`);
  }
  const id = `${prefix}${Date.now()}`;
  return saveDraft(id, values, meta);
};

/**
 * Load a single draft by id. Returns { id, savedAt, meta, values } | null
 */
export const loadDraft = (id) => {
  try {
    const raw = localStorage.getItem(id);
    if (!raw) {
      console.warn(`[Draft] No data found for draft ID: ${id}`);
      return null;
    }

    const parsed = JSON.parse(raw);

    // Validate draft structure
    if (!parsed || typeof parsed !== 'object') {
      console.error(`[Draft] Invalid draft structure for ID: ${id}`, parsed);
      return null;
    }

    if (!parsed.values) {
      console.error(`[Draft] Draft missing values data for ID: ${id}`, parsed);
      return null;
    }

    console.log(`[Draft] Successfully loaded draft: ${id}`, {
      hasValues: !!parsed.values,
      valuesKeys: Object.keys(parsed.values || {}),
      savedAt: parsed.savedAt
    });

    return parsed;
  } catch (error) {
    console.error(`[Draft] Error loading draft ${id}:`, error);
    return null;
  }
};

/**
 * Delete a draft by id.
 */
export const deleteDraft = (id) => localStorage.removeItem(id);

/**
 * Return all drafts for a specific module type as an array sorted newest-first.
 */
export const getAllDrafts = (moduleType) => {
  const prefix = DRAFT_PREFIXES[moduleType];
  if (!prefix) {
    throw new Error(`Invalid module type: ${moduleType}`);
  }

  const result = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;

    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed?.values) {
        result.push({
          id: key,
          savedAt: parsed.savedAt,
          name: parsed.meta?.name || parsed.values?.name || parsed.values?.agencyName || parsed.values?.vendorName || parsed.values?.brokerName || "—",
          email: parsed.meta?.email || parsed.values?.email || "—",
          mobile: parsed.meta?.mobileNo || parsed.meta?.phoneNo || parsed.values?.mobileNo || parsed.values?.phoneNo || "—",
        });
      }
    } catch {
      // corrupt entry – skip
    }
  }

  return result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
};

/**
 * Check if any drafts exist for a module type
 */
export const hasDrafts = (moduleType) => {
  const drafts = getAllDrafts(moduleType);
  return drafts.length > 0;
};

// ── localStorage debugging utility ─────────────────────────────────────────────

/**
 * Debug localStorage availability and contents
 */
export const debugLocalStorage = () => {
  const info = {
    available: typeof localStorage !== 'undefined',
    totalKeys: 0,
    draftKeys: [],
    quotaUsed: 0,
    errors: []
  };

  try {
    if (!info.available) {
      info.errors.push('localStorage is not available');
      return info;
    }

    // Count total keys and find draft keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        info.totalKeys++;
        if (key.includes('draft') || key.includes('form')) {
          info.draftKeys.push(key);
        }

        // Estimate quota usage
        const value = localStorage.getItem(key);
        if (value) {
          info.quotaUsed += key.length + value.length;
        }
      }
    }

    console.log('[Draft] localStorage debug info:', info);
    return info;
  } catch (error) {
    info.errors.push(error.message);
    console.error('[Draft] localStorage debug error:', error);
    return info;
  }
};

// ── Module-specific getters for backward compatibility ────────────────────────

export const getAllCustomerDrafts = () => getAllDrafts('customer');
export const getAllTransportDrafts = () => getAllDrafts('transport');
export const getAllVendorDrafts = () => getAllDrafts('vendor');
export const getAllBrokerDrafts = () => getAllDrafts('broker');

// ── Auto-save helper ───────────────────────────────────────────────────────────

/**
 * Auto-save handler with debounce - prevents duplicate draft creation
 */
export const createAutoSaveHandler = (moduleType, form, activeDraftId, setActiveDraftId, setDraftSavedAt, setDraftTableKey, selected, viewMode) => {
  return (values) => {
    // No auto-save when editing an existing record or in view mode
    if (selected || viewMode) return;

    const meta = {
      name: values.name || values.agencyName || values.vendorName || values.brokerName,
      email: values.email,
      mobileNo: values.mobileNo || values.phoneNo,
    };

    setActiveDraftId((prevId) => {
      // Use existing draft ID or create new one
      const draftId = prevId || createDraft(moduleType, values, meta);

      // Save the draft (this updates existing draft if prevId existed)
      saveDraft(draftId, values, meta);
      setDraftSavedAt(new Date());
      setDraftTableKey((k) => k + 1);

      return draftId;
    });
  };
};

// ── Manual save helper ─────────────────────────────────────────────────────────

/**
 * Manual save handler - creates draft if needed and saves
 */
export const createManualSaveHandler = (moduleType, form, activeDraftId, setActiveDraftId, setDraftSavedAt, setDraftTableKey, selected, viewMode, message) => {
  return () => {
    if (selected || viewMode) return;

    const values = form.getFieldsValue(true);
    const meta = {
      name: values.name || values.agencyName || values.vendorName || values.brokerName,
      email: values.email,
      mobileNo: values.mobileNo || values.phoneNo,
    };

    setActiveDraftId((prevId) => {
      const draftId = prevId || createDraft(moduleType, values, meta);
      saveDraft(draftId, values, meta);
      setDraftSavedAt(new Date());
      setDraftTableKey((k) => k + 1);
      message.success("Draft saved");
      return draftId;
    });
  };
};

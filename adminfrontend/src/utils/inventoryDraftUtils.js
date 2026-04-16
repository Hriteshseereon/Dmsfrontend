// Inventory Draft Utilities
const DRAFT_PREFIX = "inventory-draft-";
const AUTOSAVE_MS = 1500;

// Serialise form values for localStorage
export const serialiseInventoryDraft = (values) => {
  const out = {};
  for (const [key, val] of Object.entries(values)) {
    if (val === null || val === undefined) {
      out[key] = val;
      continue;
    }
    out[key] = val;
  }
  return out;
};

// Deserialise draft values back into form-compatible shape
export const deserialiseInventoryDraft = (draft) => {
  const out = {};
  for (const [key, val] of Object.entries(draft)) {
    out[key] = val;
  }
  return out;
};

// Save draft to localStorage
export const saveInventoryDraft = (id, values, meta = {}) => {
  const payload = {
    id,
    savedAt: new Date().toISOString(),
    meta,
    values: serialiseInventoryDraft(values),
  };
  localStorage.setItem(id, JSON.stringify(payload));
  return id;
};

// Create new draft
export const createInventoryDraft = (values, meta = {}) => {
  const id = `${DRAFT_PREFIX}${Date.now()}`;
  return saveInventoryDraft(id, values, meta);
};

// Load draft by id
export const loadInventoryDraft = (id) => {
  try {
    const raw = localStorage.getItem(id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Delete draft
export const deleteInventoryDraft = (id) => localStorage.removeItem(id);

// Get all drafts
export const getAllInventoryDrafts = () => {
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
          vendorName: parsed.meta?.vendorName || parsed.values?.vendor || "Unknown Vendor",
          productName: parsed.meta?.productName || parsed.values?.product || "Unknown Product",
          productType: parsed.meta?.productType || parsed.values?.productType || "Unknown",
        });
      }
    } catch {
      /* skip corrupt */
    }
  }
  return result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
};

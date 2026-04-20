// Item Master Draft Utilities
const DRAFT_PREFIX = "item-master-draft-";
const AUTOSAVE_MS = 1500;

// Serialise form values for localStorage
export const serialiseItemMasterDraft = (values) => {
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
export const deserialiseItemMasterDraft = (draft) => {
  const out = {};
  for (const [key, val] of Object.entries(draft)) {
    out[key] = val;
  }
  return out;
};

// Save draft to localStorage
export const saveItemMasterDraft = (id, values, meta = {}) => {
  const payload = {
    id,
    savedAt: new Date().toISOString(),
    meta,
    values: serialiseItemMasterDraft(values),
  };
  localStorage.setItem(id, JSON.stringify(payload));
  return id;
};

// Create new draft
export const createItemMasterDraft = (values, meta = {}) => {
  const id = `${DRAFT_PREFIX}${Date.now()}`;
  return saveItemMasterDraft(id, values, meta);
};

// Load draft by id
export const loadItemMasterDraft = (id) => {
  try {
    const raw = localStorage.getItem(id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Delete draft
export const deleteItemMasterDraft = (id) => localStorage.removeItem(id);

// Get all drafts
export const getAllItemMasterDrafts = () => {
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
          name: parsed.meta?.itemName || parsed.values?.itemName || "Unnamed Item",
          type: parsed.meta?.itemType || parsed.values?.itemType || "Unknown",
          company: parsed.meta?.company || parsed.values?.company || "Unknown Company",
        });
      }
    } catch {
      /* skip corrupt */
    }
  }
  return result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
};

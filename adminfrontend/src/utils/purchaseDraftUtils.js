import dayjs from 'dayjs';

// Draft prefixes
const DRAFT_PREFIX = 'purchase-draft-';

// Serialize form values for draft storage
export const serializePurchaseDraft = (values) => {
  const safeDate = (date) => {
    if (!date) return null;
    if (date && typeof date === 'object' && typeof date.format === 'function') {
      return date.isValid() ? date.format('YYYY-MM-DD') : null;
    }
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
  };

  return {
    ...values,
    // Handle dayjs objects and string dates safely
    soudaDate: safeDate(values.soudaDate),
    from_date: safeDate(values.from_date),
    to_date: safeDate(values.to_date),
    order_date: safeDate(values.order_date),
    expected_receiving_date: safeDate(values.expected_receiving_date),
    // Store timestamp
    savedAt: new Date().toISOString(),
  };
};

// Deserialize draft values for form restoration
export const deserializePurchaseDraft = (draft) => {
  return {
    ...draft,
    // Restore dayjs objects
    soudaDate: draft.soudaDate ? dayjs(draft.soudaDate) : null,
    from_date: draft.from_date ? dayjs(draft.from_date) : null,
    to_date: draft.to_date ? dayjs(draft.to_date) : null,
    order_date: draft.order_date ? dayjs(draft.order_date) : null,
    expected_receiving_date: draft.expected_receiving_date
      ? dayjs(draft.expected_receiving_date)
      : null,
  };
};

// Save draft to localStorage
export const savePurchaseDraft = (draftId, values, component = 'default') => {
  try {
    const serialized = serializePurchaseDraft(values);
    localStorage.setItem(`${DRAFT_PREFIX}${component}-${draftId}`, JSON.stringify(serialized));
    return true;
  } catch (error) {
    console.error('Failed to save purchase draft:', error);
    return false;
  }
};

// Load draft from localStorage
export const loadPurchaseDraft = (draftId, component = 'default') => {
  try {
    const scopedKey = `${DRAFT_PREFIX}${component}-${draftId}`;
    const legacyKey = `${DRAFT_PREFIX}${draftId}`;
    const draftData = localStorage.getItem(scopedKey) || localStorage.getItem(legacyKey);
    if (!draftData) return null;
    
    const draft = JSON.parse(draftData);
    return deserializePurchaseDraft(draft);
  } catch (error) {
    console.error('Failed to load purchase draft:', error);
    return null;
  }
};

// Delete specific draft
export const deletePurchaseDraft = (draftId, component = 'default') => {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${component}-${draftId}`);
    // Remove legacy key if present
    localStorage.removeItem(`${DRAFT_PREFIX}${draftId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete purchase draft:', error);
    return false;
  }
};

// Get all purchase drafts
export const getAllPurchaseDrafts = (component = 'default') => {
  try {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith(DRAFT_PREFIX) &&
        (component === 'default' || key.startsWith(`${DRAFT_PREFIX}${component}-`))
      ) {
        try {
          const draftData = JSON.parse(localStorage.getItem(key));
          let draftId = key.replace(DRAFT_PREFIX, '');
          if (component !== 'default') {
            draftId = key.replace(`${DRAFT_PREFIX}${component}-`, '');
          }
          drafts.push({
            id: draftId,
            component,
            ...deserializePurchaseDraft(draftData),
            savedAt: draftData.savedAt,
          });
        } catch (parseError) {
          console.error('Failed to parse draft:', key, parseError);
        }
      }
    }
    return drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch (error) {
    console.error('Failed to get all purchase drafts:', error);
    return [];
  }
};

// Clear all purchase drafts
export const clearAllPurchaseDrafts = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear all purchase drafts:', error);
    return false;
  }
};

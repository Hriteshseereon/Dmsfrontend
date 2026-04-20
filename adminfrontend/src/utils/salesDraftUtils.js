import dayjs from 'dayjs';

// Draft prefixes
const DRAFT_PREFIX = 'sales-draft-';

// Serialize form values for draft storage
export const serializeSalesDraft = (values) => {
  const safeDate = (date) => {
    if (!date) return null;
    // Handle dayjs objects
    if (date && typeof date === 'object' && typeof date.format === 'function') {
      return date.isValid() ? date.format('YYYY-MM-DD') : null;
    }
    // Handle strings/other
    const d = dayjs(date);
    return d.isValid() ? d.format('YYYY-MM-DD') : null;
  };

  return {
    ...values,
    soudaDate: safeDate(values.soudaDate),
    startDate: safeDate(values.startDate),
    endDate: safeDate(values.endDate),
    orderDate: safeDate(values.orderDate),
    deliveryDate: safeDate(values.deliveryDate),
    savedAt: new Date().toISOString(),
  };
};

// Deserialize draft values for form restoration
export const deserializeSalesDraft = (draft) => {
  return {
    ...draft,
    // Restore dayjs objects for all components
    soudaDate: draft.soudaDate ? dayjs(draft.soudaDate) : null,
    startDate: draft.startDate ? dayjs(draft.startDate) : null,
    endDate: draft.endDate ? dayjs(draft.endDate) : null,
    orderDate: draft.orderDate ? dayjs(draft.orderDate) : null,
    deliveryDate: draft.deliveryDate ? dayjs(draft.deliveryDate) : null,
  };
};

// Save draft to localStorage with component-specific keys
export const saveSalesDraft = (draftId, values, component = 'default') => {
  try {
    const serialized = serializeSalesDraft(values);
    localStorage.setItem(`${DRAFT_PREFIX}${component}-${draftId}`, JSON.stringify(serialized));
    return true;
  } catch (error) {
    console.error('Failed to save sales draft:', error);
    return false;
  }
};

// Load draft from localStorage
export const loadSalesDraft = (draftId, component = 'default') => {
  try {
    const draftData = localStorage.getItem(`${DRAFT_PREFIX}${component}-${draftId}`);
    if (!draftData) return null;

    const draft = JSON.parse(draftData);
    return deserializeSalesDraft(draft);
  } catch (error) {
    console.error('Failed to load sales draft:', error);
    return null;
  }
};

// Delete specific draft
export const deleteSalesDraft = (draftId, component = 'default') => {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${component}-${draftId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete sales draft:', error);
    return false;
  }
};

// Get all sales drafts
export const getAllSalesDrafts = (component = 'default') => {
  try {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX) && key.includes(`-${component}-`)) {
        try {
          const draftData = JSON.parse(localStorage.getItem(key));
          const draftId = key.replace(`${DRAFT_PREFIX}${component}-`, '');
          drafts.push({
            id: draftId,
            component,
            ...deserializeSalesDraft(draftData),
            savedAt: draftData.savedAt,
          });
        } catch (parseError) {
          console.error('Failed to parse draft:', key, parseError);
        }
      }
    }
    return drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  } catch (error) {
    console.error('Failed to get all sales drafts:', error);
    return [];
  }
};

// Clear all sales drafts
export const clearAllSalesDrafts = () => {
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
    console.error('Failed to clear all sales drafts:', error);
    return false;
  }
};

import dayjs from 'dayjs';

// Draft prefixes
const DRAFT_PREFIX = 'purchase-draft-';

// Serialize form values for draft storage
export const serializePurchaseDraft = (values) => {
  return {
    ...values,
    // Handle dayjs objects
    soudaDate: values.soudaDate ? values.soudaDate.format('YYYY-MM-DD') : null,
    from_date: values.from_date ? values.from_date.format('YYYY-MM-DD') : null,
    to_date: values.to_date ? values.to_date.format('YYYY-MM-DD') : null,
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
  };
};

// Save draft to localStorage
export const savePurchaseDraft = (draftId, values) => {
  try {
    const serialized = serializePurchaseDraft(values);
    localStorage.setItem(`${DRAFT_PREFIX}${draftId}`, JSON.stringify(serialized));
    return true;
  } catch (error) {
    console.error('Failed to save purchase draft:', error);
    return false;
  }
};

// Load draft from localStorage
export const loadPurchaseDraft = (draftId) => {
  try {
    const draftData = localStorage.getItem(`${DRAFT_PREFIX}${draftId}`);
    if (!draftData) return null;
    
    const draft = JSON.parse(draftData);
    return deserializePurchaseDraft(draft);
  } catch (error) {
    console.error('Failed to load purchase draft:', error);
    return null;
  }
};

// Delete specific draft
export const deletePurchaseDraft = (draftId) => {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${draftId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete purchase draft:', error);
    return false;
  }
};

// Get all purchase drafts
export const getAllPurchaseDrafts = () => {
  try {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        try {
          const draftData = JSON.parse(localStorage.getItem(key));
          const draftId = key.replace(DRAFT_PREFIX, '');
          drafts.push({
            id: draftId,
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

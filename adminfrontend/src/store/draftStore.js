import { create } from "zustand";
import { nanoid } from "nanoid";

export const useDraftStore = create((set, get) => ({
  draftId: null,
  values: {},

  createDraft: (prefix) => {
    const id = `${prefix}-${nanoid()}`;
    set({ draftId: id, values: {} });
    return id;
  },

  loadDraft: (id) => {
    const saved = localStorage.getItem(id);
    let parsed = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    set({ draftId: id, values: parsed });
    return parsed;
  },

  setDraftValues: (values) => {
    const { draftId } = get();
    if (!draftId) return;
    set({ values });
    localStorage.setItem(draftId, JSON.stringify(values));
  },

  resetDraft: () => {
    const { draftId } = get();
    if (!draftId) return;
    localStorage.removeItem(draftId);
    set({ draftId: null, values: {} });
  },
}));
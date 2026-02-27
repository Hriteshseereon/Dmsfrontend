import { create } from "zustand";
import { nanoid } from "nanoid";

export const useFormStore = create((set, get) => ({
  formId: null,
  values: {},
  createForm: () => {
    const id = nanoid();
    set({ formId: id, values: {} });
    return id;
  },
  loadValues: (id) => {
    const saved = localStorage.getItem(`form-${id}`);
    let parsed = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved form values", e);
      }
    }
    set({ formId: id, values: parsed });
    return parsed;
  },
  setValues: (values) => {
    const { formId } = get();
    if (!formId) return;
    set({ values });
    localStorage.setItem(`form-${formId}`, JSON.stringify(values));
  },
  reset: () => {
    const { formId } = get();
    if (!formId) return;
    set({ values: {} });
    localStorage.removeItem(`form-${formId}`);
  },
}));

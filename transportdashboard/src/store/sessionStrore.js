import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useSessionStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      transporterId: null,
      transportId: null,
      registeredName: null,
      organisationIds: [],
      currentOrgId: null,

      setSession: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          transporterId: data.transporterId,
          transportId: data.transportId,
          registeredName: data.registeredName,
          organisationIds: data.organisationIds,
          currentOrgId: data.organisationIds?.[0] || null,
        }),

      setCurrentOrgId: (id) => set({ currentOrgId: id }),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          transporterId: null,
          transportId: null,
          registeredName: null,
          organisationIds: [],
          currentOrgId: null,
        }),
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSessionStore;

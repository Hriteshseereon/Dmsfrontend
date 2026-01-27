import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useSessionStore = create(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            currentOrgId: null,

            setSession: ({ accessToken, refreshToken, user, currentOrgId }) =>
                set({ accessToken, refreshToken, user, currentOrgId }),

            setAccessToken: (accessToken) => set({ accessToken }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setUser: (user) => set({ user }),
            setCurrentOrgId: (currentOrgId) => set({ currentOrgId }),

            clearSession: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    currentOrgId: null,
                }),
        }),
        {
            name: "session",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export default useSessionStore;
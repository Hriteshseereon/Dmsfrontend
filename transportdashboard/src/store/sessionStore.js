import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useSessionStore = create(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            currentOrgId: null,
            currentTransporterId: null,

            setSession: ({
                accessToken,
                refreshToken,
                user,
                currentOrgId,
                currentTransporterId, }) =>
                set({
                    accessToken,
                    refreshToken,
                    user,
                    currentOrgId,
                    currentTransporterId,
                }),

            setCurrentTransporterId: (id) =>
                set({ currentTransporterId: id }),
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
                    currentTransporterId: null,
                }),
        }),
        {
            name: "session",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export default useSessionStore;
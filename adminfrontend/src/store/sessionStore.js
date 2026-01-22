import { create } from "zustand"
import { persist } from "zustand/middleware"

const useSessionStore = create(
  persist(
    (set, get) => ({
      // state
      accessToken: null,
      refreshToken: null,
      user: null,
      currentOrgId: null,

      // setters
      setSession: ({ accessToken, refreshToken, user, currentOrgId }) =>
        set({ accessToken, refreshToken, user, currentOrgId }),

      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      setCurrentOrgId: (currentOrgId) => set({ currentOrgId }),

      // getters (sync, safe anywhere)
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      getUser: () => get().user,
      getCurrentOrgId: () => get().currentOrgId,

      // clear
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
      storage: {
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    }
  )
)

export default useSessionStore

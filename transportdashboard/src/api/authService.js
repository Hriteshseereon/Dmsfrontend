import api from "./axios";

export const login = async (email, password) => {
    const res = await api.post("/transport/auth/login/", { email, password });
    return res.data;
}

export const logout = () => {
    // Clear session and redirect to login page
    const { clearSession } = useSessionStore.getState();
    clearSession();
    window.location.replace("/");
}
export const signup = async (data) => {
    const res = await api.post("/transport/auth/signup/", data);
    return res.data;
}


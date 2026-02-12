import axios from "axios";
import useSessionStore from "../store/sessionStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    // Skip token for login and signup
    if (config.url.endsWith("/auth/login/") || config.url.endsWith("/auth/signup/")) {
        return config;
    }

    const { accessToken } = useSessionStore.getState();

    // Add authorization token
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401) {
            const { clearSession } = useSessionStore.getState();
            clearSession();

            if (window.location.pathname !== "/") {
                window.location.replace("/");
            }
        }

        return Promise.reject(error);
    },
);

export default api;

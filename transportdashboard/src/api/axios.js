import axios from "axios";
import useSessionStore from "../store/sessionStrore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      useSessionStore.getState().clearSession();
      window.location.replace("/");
    }

    return Promise.reject(error);
  }
);

export default api;

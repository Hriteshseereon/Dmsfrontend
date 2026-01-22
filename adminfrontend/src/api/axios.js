import axios from "axios";
import TokenStore from "../utils/tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning": "true", // TODO: remove later, only use for ngrok backend tunneling
  },
});

api.interceptors.request.use((config) => {
  // return config if url is login
  if (config.url.endsWith("/auth/login/")) {
    return config;
  }
  const token = TokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default api;

import axios from "axios";
import TokenStore from "../utils/tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
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

export default api;

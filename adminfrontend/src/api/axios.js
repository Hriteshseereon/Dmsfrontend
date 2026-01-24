import axios from "axios";
import useSessionStore from "../store/sessionStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // TODO: remove later, only use for ngrok backend tunneling
  },
});

api.interceptors.request.use((config) => {
  // Skip token for login
  if (config.url.endsWith("/auth/login/")) {
    return config;
  }
  
  const { accessToken, currentOrgId } = useSessionStore.getState();
  
  // Add authorization token
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // Add organization parameter to GET requests
  if (config.method === 'get' && currentOrgId) {
    config.params = {
      ...config.params,
      organisation: currentOrgId
    };
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

      // prevent redirect loop
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  },
);

export default api;

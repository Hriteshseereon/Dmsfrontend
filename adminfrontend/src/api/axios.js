import axios from "axios";
import useSessionStore from "../store/sessionStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    // Skip token for login & refresh
    if (
      config.url?.endsWith("/auth/login/") ||
      config.url?.endsWith("/users/login/") ||
      config.url?.endsWith("/auth/refresh/")
    ) {
      return config;
    }

    const { accessToken, currentOrgId } = useSessionStore.getState();

    // Add authorization token
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add organization parameter to GET requests if not explicitly specified
    if (config.method === "get" && currentOrgId && !config.params?.organisation) {
      config.params = {
        ...config.params,
        organisation: currentOrgId,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle 401 Unauthorized
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/auth/login/") &&
      !originalRequest.url?.endsWith("/users/login/") &&
      !originalRequest.url?.endsWith("/auth/refresh/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setAccessToken, clearSession } =
        useSessionStore.getState();

      if (!refreshToken) {
        clearSession();
        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = refreshResponse.data?.access;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearSession();
        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

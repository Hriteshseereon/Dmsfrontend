import api from "./axios";

/**
 * User Login
 * POST /auth/login/ (or /users/login/)
 * Payload: { username, password }
 */
export const login = async (username, password) => {
  const res = await api.post("/auth/login/", { username, password });
  return res.data;
};

/**
 * Token Refresh
 * POST /auth/refresh/
 * Payload: { refresh: "<refresh_token>" }
 */
export const refreshToken = async (refresh) => {
  const res = await api.post("/auth/refresh/", { refresh });
  return res.data;
};

/**
 * Fetch effective permissions, validity status, and user profile for current user
 * GET /users/me/permissions/
 * Headers: Authorization: Bearer <access_token>
 */
export const getMyPermissions = async () => {
  const res = await api.get("/users/me/permissions/");
  return res.data;
};
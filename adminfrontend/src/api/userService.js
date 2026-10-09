import api from "./axios";

/**
 * List Users
 * GET /users/
 * Query Params: ?organisation=<uuid>&search=<term>&privilege=<type>&role=<preset>&page=<num>
 */
export const getUsers = async (params = {}) => {
  const res = await api.get("/users/", { params });
  return res.data;
};

/**
 * Get User by ID
 * GET /users/{id}/
 */
export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}/`);
  return res.data;
};

/**
 * Create User
 * POST /users/
 * Payload: { organisation, userName, email, password, phone, address, privilegeType, rolePreset, startDate, endDate, isActive, permissions }
 */
export const createUser = async (payload, organisationId) => {
  const org = organisationId || payload?.organisation;
  const params = org ? { organisation: org } : {};
  // Pass standard JSON payload and standard organisation query parameter without custom non-standard headers
  const res = await api.post("/users/", payload, { params });
  return res.data;
};

/**
 * Update User (Partial)
 * PATCH /users/{id}/
 */
export const updateUser = async (id, payload) => {
  const res = await api.patch(`/users/${id}/`, payload);
  return res.data;
};

/**
 * Update User (Full)
 * PUT /users/{id}/
 */
export const replaceUser = async (id, payload) => {
  const res = await api.put(`/users/${id}/`, payload);
  return res.data;
};

/**
 * Delete User
 * DELETE /users/{id}/
 */
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}/`);
  return res.data;
};

/**
 * List Roles
 * GET /users/roles/
 */
export const getRoles = async () => {
  const res = await api.get("/users/roles/");
  return res.data;
};

/**
 * Create Role
 * POST /users/roles/
 */
export const createRole = async (payload) => {
  const res = await api.post("/users/roles/", payload);
  return res.data;
};

/**
 * Assign User Role
 * POST /users/user-roles/
 */
export const assignUserRole = async (payload) => {
  const res = await api.post("/users/user-roles/", payload);
  return res.data;
};

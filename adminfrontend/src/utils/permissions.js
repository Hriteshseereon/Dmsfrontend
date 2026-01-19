import dmsRoutes from "../data/dmsRoutes.json";

const STORAGE_KEY = "rolePermissions";

export function getAllRoles() {
  const stored = getPermissionsStore();
  return Object.keys(stored);
}

export function getPermissionsStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...defaultPermissions };
  } catch {
    return { ...defaultPermissions };
  }
}

export function savePermissionsStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function upsertRolePermissions(roleName, allowedDmsRouteIds) {
  const store = getPermissionsStore();
  store[roleName] = {
    dms: Array.from(
      new Set(
        allowedDmsRouteIds.filter((r) => dmsRoutes.some((dr) => dr.id === r))
      )
    ),
  };
  savePermissionsStore(store);
  return store[roleName];
}

export function getAllowedDmsRoutesForRole(roleName) {
  if (roleName === "admin") {
    return dmsRoutes.map((r) => r.id);
  }
  const store = getPermissionsStore();
  return store[roleName]?.dms || [];
}

export function getDmsRoutes() {
  return dmsRoutes;
}

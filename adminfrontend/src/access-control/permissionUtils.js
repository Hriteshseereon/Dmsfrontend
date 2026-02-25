import { APP_MODULES } from "./modules.js";

export const MODULE_TREE = APP_MODULES.filter(
  (m) => m.children && m.children.length
);

export const makePermission = (moduleId, subId, action) =>
  `${moduleId}.${subId}.${action}`;
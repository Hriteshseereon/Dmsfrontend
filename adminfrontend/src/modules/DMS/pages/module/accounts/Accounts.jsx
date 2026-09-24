/**
 * Accounts section entry point + permission gate.
 *
 * The backend login response has no "accounts" submodule yet, and adding one
 * is a backend change. So access falls back to the Reports permission: anyone
 * who may see Reports & Analytics may see Accounts, which is the right bar for
 * a read-only reporting section. Admins always have access.
 */
import React from "react";
import AccountsRoutes from "./index";
import { useAuth } from "../../../../../context/AuthContext";

const AccessRestricted = () => (
  <div className="p-6 bg-white border border-amber-200 rounded-lg text-center">
    <h2 className="text-xl font-semibold text-amber-800 mb-2">
      Accounts access is restricted
    </h2>
    <p className="text-amber-700">
      Please contact your administrator if you believe this is a mistake.
    </p>
  </div>
);

export default function Accounts() {
  const { user } = useAuth();

  const dms = user?.permissions?.DMS;
  const hasExplicitPermissions = Boolean(dms);
  const subs = dms?.submodules || {};

  const isAllowed =
    user?.role === "admin" ||
    user?.is_admin ||
    !hasExplicitPermissions ||
    // A dedicated permission, once the backend starts sending one.
    Boolean(subs.accounts) ||
    // Until then, Reports access is the equivalent bar.
    subs.reports?.tabs?.length > 0 ||
    Boolean(subs.reports);

  if (!isAllowed) return <AccessRestricted />;

  return <AccountsRoutes />;
}

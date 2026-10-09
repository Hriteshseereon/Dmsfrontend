import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RestrictedAccess from "../../pages/RestrictedAccess";

/**
 * Route protection guard based on user permissions
 * @param {string} submoduleKey - The submodule key (e.g. 'sales_contract', 'purchase_invoice')
 * @param {string} moduleKey - The parent module key (e.g. 'purchase', 'sales', 'accounts')
 * @param {string} action - Action required (default: 'view')
 * @param {boolean} fallbackToRestrictedPage - Whether to render RestrictedAccess component instead of redirecting
 */
export function ProtectedRoute({
  submoduleKey,
  moduleKey,
  action = "view",
  children,
  fallbackToRestrictedPage = true,
}) {
  const { user, hasPermission, hasModuleAccess, isAdmin, sessionExpired } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (sessionExpired || user.isValid === false) {
    return <RestrictedAccess isExpired={true} />;
  }

  if (isAdmin) {
    return children;
  }

  // Check specific submodule permission
  if (submoduleKey) {
    const isAllowed = hasPermission(submoduleKey, action);
    if (!isAllowed) {
      return fallbackToRestrictedPage ? (
        <RestrictedAccess submoduleKey={submoduleKey} action={action} />
      ) : (
        <Navigate to="/unauthorized" replace />
      );
    }
  }

  // Check general module access
  if (moduleKey) {
    const isAllowed = hasModuleAccess(moduleKey);
    if (!isAllowed) {
      return fallbackToRestrictedPage ? (
        <RestrictedAccess moduleKey={moduleKey} action="view" />
      ) : (
        <Navigate to="/unauthorized" replace />
      );
    }
  }

  return children;
}

export default ProtectedRoute;

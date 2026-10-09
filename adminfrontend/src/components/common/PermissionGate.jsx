import React from "react";
import { Tooltip } from "antd";
import { useAuth } from "../../context/AuthContext";

/**
 * PermissionGate / ActionGuard component
 * Conditionally renders or disables buttons/actions based on granular permissions
 *
 * @param {string} submoduleKey - e.g. 'sales_contract', 'purchase_invoice'
 * @param {'view'|'add'|'edit'|'delete'} action - The CRUD action
 * @param {boolean} disableInsteadOfHide - If true, renders children disabled with tooltip instead of hiding
 * @param {string} tooltipText - Custom tooltip message when disabled
 */
export function PermissionGate({
  submoduleKey,
  action = "view",
  children,
  disableInsteadOfHide = false,
  tooltipText = "You do not have permission to perform this action",
}) {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(submoduleKey, action);

  if (allowed) {
    return <>{children}</>;
  }

  if (disableInsteadOfHide) {
    return (
      <Tooltip title={tooltipText}>
        <span className="inline-block cursor-not-allowed opacity-60 pointer-events-none">
          {React.cloneElement(React.Children.only(children), {
            disabled: true,
          })}
        </span>
      </Tooltip>
    );
  }

  return null;
}

export default PermissionGate;

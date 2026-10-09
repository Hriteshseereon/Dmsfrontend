import React from "react";
import AccountsRoutes from "./index";
import { useAuth } from "../../../../../context/AuthContext";
import RestrictedAccess from "../../../../../pages/RestrictedAccess";

export default function Accounts() {
  const { hasModuleAccess, isAdmin } = useAuth();
  const isAllowed = isAdmin || hasModuleAccess("accounts");

  if (!isAllowed) {
    return <RestrictedAccess moduleKey="accounts" />;
  }

  return <AccountsRoutes />;
}

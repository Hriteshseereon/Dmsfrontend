import React from "react";
import PurchaseRoutes from "./index";
import PurchaseTabs from "./PurchaseTabs";
import { useAuth } from "../../../../../context/AuthContext";
import RestrictedAccess from "../../../../../pages/RestrictedAccess";

export default function Purchase() {
  const { hasModuleAccess, isAdmin } = useAuth();
  const isAllowed = isAdmin || hasModuleAccess("purchase");

  if (!isAllowed) {
    return <RestrictedAccess moduleKey="purchase" />;
  }

  return (
    <>
      <PurchaseTabs />
      <PurchaseRoutes />
    </>
  );
}
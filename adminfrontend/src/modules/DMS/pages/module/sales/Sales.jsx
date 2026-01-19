import React from "react";
import SaleTabs from "./SaleTabs";
import { useAuth } from "../../../../../context/AuthContext";

const AccessRestricted = () => (
  <div className="p-6 bg-white border border-amber-200 rounded-lg text-center">
    <h2 className="text-xl font-semibold text-amber-800 mb-2">
      Sales module access is restricted
    </h2>
    <p className="text-amber-700">
      Please contact your administrator if you believe this is a mistake.
    </p>
  </div>
);

const Sales = () => {
  const { user } = useAuth();
  const salesAccess = user?.permissions?.DMS?.submodules?.sales;
  const hasExplicitPermissions = Boolean(user?.permissions?.DMS);
  const isAllowed =
    user?.role === "admin" ||
    !hasExplicitPermissions ||
    salesAccess?.tabs?.length > 0;

  if (!isAllowed) {
    return <AccessRestricted />;
  }

  return <SaleTabs allowedTabs={salesAccess?.tabs} />;
};

export default Sales;

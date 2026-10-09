import React from "react";
import SaleTabs from "./SaleTabs";
import { useAuth } from "../../../../../context/AuthContext";
import RestrictedAccess from "../../../../../pages/RestrictedAccess";

const Sales = () => {
  const { hasModuleAccess, isAdmin } = useAuth();
  const isAllowed = isAdmin || hasModuleAccess("sales");

  if (!isAllowed) {
    return <RestrictedAccess moduleKey="sales" />;
  }

  return <SaleTabs />;
};

export default Sales;

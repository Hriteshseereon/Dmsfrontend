import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Purchase from "./pages/module/purchase/Purchase";
import Sales from "./pages/module/sales/Sales";
import MasterTable from "./pages/module/MasterTable/MasterTables";
import MasterModule from "./pages/module/Master/MasterModule";
import ReportAnaytics from "./pages/module/reports/ReportAnaytics";
import Accounts from "./pages/module/accounts/Accounts";
import Organisation from "./pages/Organisation";
import ProfileSetings from "./pages/ProfileSetings";
import RestrictedAccess from "../../pages/RestrictedAccess";

export default function DMS() {
  const { user, hasModuleAccess, isAdmin, sessionExpired } = useAuth();

  if (sessionExpired || user?.isValid === false) {
    return <RestrictedAccess isExpired={true} />;
  }

  const hasAnyDMSAccess =
    isAdmin ||
    hasModuleAccess("purchase") ||
    hasModuleAccess("sales") ||
    hasModuleAccess("accounts") ||
    hasModuleAccess("master") ||
    hasModuleAccess("reports");

  if (!hasAnyDMSAccess) {
    return <RestrictedAccess moduleKey="DMS" />;
  }

  return (
    <Routes>
      <Route path="/">
        <Route index element={<Dashboard />} />
        <Route path="purchase/*" element={<Purchase />} />
        <Route path="sales/*" element={<Sales />} />
        <Route path="accounts/*" element={<Accounts />} />
        <Route path="master/*" element={<MasterTable />} />
        <Route path="mastermodule/*" element={<MasterModule />} />
        <Route path="reports/*" element={<ReportAnaytics />} />
        <Route path="organisation" element={<Organisation />} />
        <Route path="settings" element={<ProfileSetings />} />
      </Route>
    </Routes>
  );
}

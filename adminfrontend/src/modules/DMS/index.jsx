import React, { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllowedDmsRoutesForRole } from "../../utils/permissions";

// import LayoutDMS from "./pages/LayoutDMS";
import Dashboard from "./pages/Dashboard";
import Purchase from "./pages/module/purchase/Purchase";
import Sales from "./pages/module/sales/Sales";
import PurchaseDashboard from "./pages/module/purchase/PurchaseDashboard";
import MasterTable from "./pages/module/MasterTable/MasterTables";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import Organisation from "./pages/Organisation";
import ProfileSetings from "./pages/ProfileSetings";
import MasterModule from "./pages/module/Master/MasterModule";
import ReportAnaytics from "./pages/module/reports/ReportAnaytics";
// import AssetModuleRoutes from "./pages/module/assetmodule";
// import AssetModule from "./pages/module/assetmodule/AssetModule";
// import WealthModule from "./pages/module/wealthmodule/WealthModule";
export default function DMS() {
  const { user } = useAuth();

  const hasDMSAccess = user?.permissions?.DMS;
  const isAdmin = user?.role === "admin";

  if (!isAdmin && !hasDMSAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Routes>
      {/* All routes under DMS share the same layout */}
      <Route path="/">
        {/* Nested routes inside the Layout */}
        <Route index element={<Dashboard />} />
        {/* module routes */}
        <Route path="purchase/*" element={<Purchase />} />
        <Route path="sales/*" element={<Sales />} />
        <Route path="master/*" element={<MasterTable />} />
        <Route path="mastermodule/*" element={<MasterModule />} />
        <Route path="reports/*" element={<ReportAnaytics />} />
        <Route path="organisation" element={<Organisation />} />
        <Route path="/settings" element={<ProfileSetings />} />

        {/* <Route path="purchase" element={<Purchase />} /> */}
        {/* <Route path="purchasedashboard" elemelnt={<PurchaseDashboard />} />   */}
        {/* assset module routes   */}
        {/* <Route path="assetmodule/*" element={<AssetModule />} /> */}
        {/* welath routes */}
        {/* <Route path="wealthmodule/*" element = {<WealthModule />} />  */}
      </Route>
    </Routes>
  );
}

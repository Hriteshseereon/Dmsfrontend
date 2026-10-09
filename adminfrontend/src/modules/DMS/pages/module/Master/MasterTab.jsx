// MasterTabs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import { FaDatabase, FaBarcode, FaTags, FaUsers, FaList } from "react-icons/fa";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";

export const MASTER_TAB_DEFINITIONS = [
  {
    id: "business-partner",
    submoduleKey: "business_master",
    label: "Business Partner",
    path: "business-partner",
    Icon: FaUsers,
  },
  {
    id: "groupmaster",
    submoduleKey: "product_group_master",
    label: "Group Master",
    path: "groupmaster",
    Icon: FaTags,
  },
  {
    id: "itemsprice",
    submoduleKey: "product_master",
    label: "Product Master",
    path: "itemsprice",
    Icon: FaTags,
  },
  {
    id: "price-management",
    submoduleKey: "product_master",
    label: "Price Management",
    path: "price-management",
    Icon: FaTags,
  },
  {
    id: "inventory",
    submoduleKey: "inventory_master",
    label: "Inventory Management",
    path: "inventory",
    Icon: FaList,
  },
];

export default function MasterTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();

  const visibleTabs = useMemo(() => {
    return MASTER_TAB_DEFINITIONS.filter(
      (tab) => isAdmin || hasPermission(tab.submoduleKey, "view")
    );
  }, [hasPermission, isAdmin]);

  const defaultTab = visibleTabs[0] || MASTER_TAB_DEFINITIONS[0];

  const currentSegment = useMemo(() => {
    const cleaned = location.pathname.replace(/\/+$/, "");
    const last = cleaned.split("/").pop() || "";
    return last === "mastermodule" ? "" : last;
  }, [location.pathname]);

  const allowedSegments = useMemo(
    () =>
      new Set(
        visibleTabs.map((t) => (t.path === "" ? "" : t.path.toLowerCase()))
      ),
    [visibleTabs]
  );

  const derivedActiveTab = useMemo(() => {
    const match =
      visibleTabs.find(
        (t) =>
          (t.path === "" && currentSegment === "") ||
          t.path.toLowerCase() === currentSegment
      ) || defaultTab;
    return match?.id || "";
  }, [currentSegment, defaultTab, visibleTabs]);

  const [activeKey, setActiveKey] = useState(derivedActiveTab);

  useEffect(() => {
    if (derivedActiveTab && derivedActiveTab !== activeKey)
      setActiveKey(derivedActiveTab);
  }, [derivedActiveTab, activeKey]);

  useEffect(() => {
    if (visibleTabs.length > 0 && !allowedSegments.has(currentSegment) && defaultTab) {
      const redirect =
        defaultTab.path === ""
          ? "/dms/mastermodule"
          : `/dms/mastermodule/${defaultTab.path}`;
      navigate(redirect, { replace: true });
    }
  }, [allowedSegments, currentSegment, defaultTab, navigate, visibleTabs.length]);

  const handleChange = (key) => {
    const selected = visibleTabs.find((t) => t.id === key);
    if (!selected) return;
    setActiveKey(key);
    const dest =
      selected.path === ""
        ? "/dms/mastermodule"
        : `/dms/mastermodule/${selected.path}`;
    navigate(dest);
  };

  const tabItems = visibleTabs.map((t) => {
    const Icon = t.Icon;
    return {
      key: t.id,
      label: (
        <>
          <Icon className="inline mr-2 text-amber-500" />
          <span className="text-amber-500">{t.label}</span>
        </>
      ),
    };
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl text-amber-800 font-bold mb-1">Master Data</h1>
      <p className="text-amber-700 mb-4">Manage all master data</p>

      {visibleTabs.length > 0 ? (
        <div className="mb-2">
          <Tabs activeKey={activeKey} onChange={handleChange} items={tabItems} />
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          No master data submodules are permitted for your account.
        </div>
      )}

      <Outlet />
    </div>
  );
}

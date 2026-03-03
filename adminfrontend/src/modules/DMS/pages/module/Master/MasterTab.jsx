// MasterTabs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import { FaDatabase, FaBarcode, FaTags, FaUsers, FaList } from "react-icons/fa";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

/*
  NOTE:
  - tab ids are used by allowedTabs (case-insensitive)
  - path is used as the URL segment
*/
export const MASTER_TAB_DEFINITIONS = [
  // { id: "product", label: "Product", path: "product", Icon: FaTags },
  // { id: "unit-conversion", label: "Unit Conversion", path: "unit-conversion", Icon: FaTags },
  {
    id: "business-partner",
    label: "Business Partner",
    path: "business-partner",
    Icon: FaUsers,
  },
  { id: "reason", label: "Product Group", path: "reason", Icon: FaTags },
  {
    id: "hsn_sac",
    label: "HSN & SAC Manager",
    path: "hsn_sac",
    Icon: FaBarcode,
  },
  { id: "itemsprice", label: "Items Master", path: "itemsprice", Icon: FaTags },
  // { id: "price", label: "Price Manager", path: "price", Icon: FaTags },

  { id: "inventory", label: "Inventory", path: "inventory", Icon: FaList },

  // add more if needed
];

const normalize = (values = []) =>
  values.map((v) => v?.toLowerCase()).filter(Boolean);

export const getVisibleMasterTabs = (allowedTabs) => {
  const normalized = new Set(normalize(allowedTabs));
  const filtered =
    normalized.size > 0
      ? MASTER_TAB_DEFINITIONS.filter((tab) => normalized.has(tab.id))
      : MASTER_TAB_DEFINITIONS;
  // preserve your previous behavior: if nothing matched fallback to all tabs
  return filtered.length > 0 ? filtered : MASTER_TAB_DEFINITIONS;
};

export default function MasterTab({ allowedTabs }) {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleTabs = useMemo(
    () => getVisibleMasterTabs(allowedTabs),
    [allowedTabs],
  );
  const defaultTab = visibleTabs[0];

  // last segment logic; treat /dms/master as base ""
  const currentSegment = useMemo(() => {
    const cleaned = location.pathname.replace(/\/+$/, "");
    const last = cleaned.split("/").pop() || "";
    return last === "master" ? "" : last;
  }, [location.pathname]);

  const allowedSegments = useMemo(
    () =>
      new Set(
        visibleTabs.map((t) => (t.path === "" ? "" : t.path.toLowerCase())),
      ),
    [visibleTabs],
  );

  const derivedActiveTab = useMemo(() => {
    const match =
      visibleTabs.find(
        (t) =>
          (t.path === "" && currentSegment === "") ||
          t.path.toLowerCase() === currentSegment,
      ) || defaultTab;
    return match?.id || "";
  }, [currentSegment, defaultTab, visibleTabs]);

  const [activeKey, setActiveKey] = useState(derivedActiveTab);

  // keep activeKey in sync
  useEffect(() => {
    if (derivedActiveTab && derivedActiveTab !== activeKey)
      setActiveKey(derivedActiveTab);
  }, [derivedActiveTab, activeKey]);

  // redirect to default if URL segment not allowed
  useEffect(() => {
    if (!allowedSegments.has(currentSegment) && defaultTab) {
      const redirect =
        defaultTab.path === ""
          ? "/dms/mastermodule"
          : `/dms/mastermodule/${defaultTab.path}`;
      navigate(redirect, { replace: true });
    }
  }, [allowedSegments, currentSegment, defaultTab, navigate]);

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

      <div className="mb-2">
        <Tabs activeKey={activeKey} onChange={handleChange} items={tabItems} />
      </div>

      {/* nested route target — renders the selected tab's component */}
      <Outlet />
    </div>
  );
}

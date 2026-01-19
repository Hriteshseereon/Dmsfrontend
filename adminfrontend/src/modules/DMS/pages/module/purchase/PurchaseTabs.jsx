import React, { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import {
  FaBoxOpen,
  FaFileInvoice,
  FaShoppingCart,
  FaUndo,
  FaTachometerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export const PURCHASE_TAB_DEFINITIONS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "",
    Icon: FaTachometerAlt,
  },
  {
    id: "souda",
    label: "Purchase Contract",
    path: "souda",
    Icon: FaBoxOpen,
  },
  {
    id: "indent",
    label: "Purchase Indent",
    path: "indent",
    Icon: FaShoppingCart,
  },
  {
    id: "invoice",
    label: "Purchase Invoice",
    path: "invoice",
    Icon: FaFileInvoice,
  },
  {
    id: "loading",
    label: "Loading Advice",
    path: "loading",
    Icon: FaPaperPlane,
  },
  // {
  //   id: "status",
  //   label: "Delivery Status",
  //   path: "status",
  //   Icon: FaTruck,
  // },
  {
    id: "return",
    label: "Return",
    path: "return",
    Icon: FaUndo,
  },
];

const normalize = (values = []) =>
  values
    .map((value) => value?.toLowerCase())
    .filter(Boolean);

export const getVisiblePurchaseTabs = (allowedTabs) => {
  const normalized = new Set(normalize(allowedTabs));
  const filtered =
    normalized.size > 0
      ? PURCHASE_TAB_DEFINITIONS.filter((tab) => normalized.has(tab.id))
      : PURCHASE_TAB_DEFINITIONS;

  return filtered.length > 0 ? filtered : PURCHASE_TAB_DEFINITIONS;
};

export default function PurchaseTabs({ allowedTabs }) {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleTabs = useMemo(
    () => getVisiblePurchaseTabs(allowedTabs),
    [allowedTabs]
  );
  const defaultTab = visibleTabs[0];

  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const lastPart = parts[parts.length - 1] || "";
    return lastPart === "purchase" ? "" : lastPart;
  }, [location.pathname]);

  const allowedSegments = useMemo(
    () =>
      new Set(
        visibleTabs.map((tab) => (tab.path === "" ? "" : tab.path.toLowerCase()))
      ),
    [visibleTabs]
  );

  const derivedActiveTab = useMemo(() => {
    const match =
      visibleTabs.find(
        (tab) =>
          (tab.path === "" && currentSegment === "") ||
          tab.path === currentSegment
      ) || defaultTab;
    return match?.id || "";
  }, [currentSegment, defaultTab, visibleTabs]);

  const [activeKey, setActiveKey] = useState(derivedActiveTab);

  useEffect(() => {
    if (derivedActiveTab && derivedActiveTab !== activeKey) {
      setActiveKey(derivedActiveTab);
    }
  }, [derivedActiveTab, activeKey]);

  useEffect(() => {
    if (!allowedSegments.has(currentSegment) && defaultTab) {
      const redirectPath =
        defaultTab.path === "" ? "/dms/purchase" : `/dms/purchase/${defaultTab.path}`;
      navigate(redirectPath, { replace: true });
    }
  }, [allowedSegments, currentSegment, defaultTab, navigate]);

  const handleChange = (key) => {
    const selected = visibleTabs.find((tab) => tab.id === key);
    if (!selected) return;
    setActiveKey(key);
    const destination =
      selected.path === "" ? "/dms/purchase" : `/dms/purchase/${selected.path}`;
    navigate(destination);
  };

  const tabItems = visibleTabs.map((tab) => {
    const Icon = tab.Icon;
    return {
      key: tab.id,
      label: (
        <>
          <Icon className="inline mr-2 text-amber-500" />
          <span className="text-amber-500">{tab.label}</span>
        </>
      ),
    };
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl text-amber-800 font-bold mb-1">
        Purchase Module
      </h1>
      <p className="text-amber-700 mb-4">
        Manage purchase contracts, indents, transit, invoices and returns
      </p>

      <div className="mb-6">
        <Tabs activeKey={activeKey} onChange={handleChange} items={tabItems} />
      </div>

      {/* 👉 This renders the component from PurchaseRoutes */}
      <Outlet />
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import {
  FaBoxOpen,
  FaFileInvoice,
  FaShoppingCart,
  FaUndo,
  FaTachometerAlt,
  FaPaperPlane,
  FaShippingFast,
  FaBoxes,
} from "react-icons/fa";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";

export const PURCHASE_TAB_DEFINITIONS = [
  {
    id: "dashboard",
    submoduleKey: "purchase_dashboard",
    label: "Dashboard",
    path: "",
    Icon: FaTachometerAlt,
  },
  {
    id: "souda",
    submoduleKey: "purchase_contract",
    label: "Purchase Contract",
    path: "souda",
    Icon: FaBoxOpen,
  },
  {
    id: "indent",
    submoduleKey: "purchase_indent",
    label: "Purchase Order",
    path: "indent",
    Icon: FaShoppingCart,
  },
  {
    id: "assign",
    submoduleKey: "vehicle_placement",
    label: "Vehicle Placement",
    path: "assign",
    Icon: FaPaperPlane,
  },
  {
    id: "loading",
    submoduleKey: "transport_freight",
    label: "Transport Freight Details",
    path: "loading",
    Icon: FaShippingFast,
  },
  {
    id: "invoice",
    submoduleKey: "purchase_invoice",
    label: "Purchase Invoice Entry",
    path: "invoice",
    Icon: FaFileInvoice,
  },
  {
    id: "return",
    submoduleKey: "purchase_intransit",
    label: "Purchase In-Transit",
    path: "return",
    Icon: FaUndo,
  },
  {
    id: "stock",
    submoduleKey: "stock_status",
    label: "Stock Status",
    path: "stock",
    Icon: FaBoxes,
  },
];

export default function PurchaseTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();

  // Filter tabs where user has 'view' permission
  const visibleTabs = useMemo(() => {
    return PURCHASE_TAB_DEFINITIONS.filter(
      (tab) => isAdmin || hasPermission(tab.submoduleKey, "view")
    );
  }, [hasPermission, isAdmin]);

  const defaultTab = visibleTabs[0] || PURCHASE_TAB_DEFINITIONS[0];

  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const lastPart = parts[parts.length - 1] || "";
    return lastPart === "purchase" ? "" : lastPart;
  }, [location.pathname]);

  const allowedSegments = useMemo(
    () =>
      new Set(
        visibleTabs.map((tab) =>
          tab.path === "" ? "" : tab.path.toLowerCase()
        )
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
    if (visibleTabs.length > 0 && !allowedSegments.has(currentSegment) && defaultTab) {
      const redirectPath =
        defaultTab.path === ""
          ? "/dms/purchase"
          : `/dms/purchase/${defaultTab.path}`;
      navigate(redirectPath, { replace: true });
    }
  }, [allowedSegments, currentSegment, defaultTab, navigate, visibleTabs.length]);

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
      <p className="text-amber-700 mb-2">
        Manage purchase contracts, indents, transit, invoices and returns
      </p>

      {visibleTabs.length > 0 ? (
        <div className="mb-0">
          <Tabs activeKey={activeKey} onChange={handleChange} items={tabItems} />
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          No submodules are permitted for your account in Purchase Module.
        </div>
      )}

      <Outlet />
    </div>
  );
}

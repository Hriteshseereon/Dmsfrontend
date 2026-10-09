import React, { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import { FaBoxOpen, FaFileInvoice } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import SaleSouda from "./SaleSouda";
import SaleInvoice from "./SaleInvoice";
import { useAuth } from "../../../../../context/AuthContext";

export const SALES_TAB_DEFINITIONS = [
  {
    id: "souda",
    submoduleKey: "sales_contract",
    label: "Sale Contracts",
    path: "souda",
    Icon: FaBoxOpen,
    Component: SaleSouda,
  },
  {
    id: "saleinvoice",
    submoduleKey: "sales_invoice",
    label: "Sale Invoice",
    path: "saleinvoice",
    Icon: FaFileInvoice,
    Component: SaleInvoice,
  },
];

export default function SaleTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();

  // Filter tabs where user has 'view' permission
  const visibleTabs = useMemo(() => {
    return SALES_TAB_DEFINITIONS.filter(
      (tab) => isAdmin || hasPermission(tab.submoduleKey, "view")
    );
  }, [hasPermission, isAdmin]);

  const defaultTab = visibleTabs[0] || SALES_TAB_DEFINITIONS[0];

  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const lastPart = parts[parts.length - 1] || "";
    return lastPart === "sales" ? "" : lastPart;
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
        defaultTab.path === "" ? "/dms/sales" : `/dms/sales/${defaultTab.path}`;
      navigate(redirectPath, { replace: true });
    }
  }, [allowedSegments, currentSegment, defaultTab, navigate, visibleTabs.length]);

  const handleChange = (key) => {
    const selected = visibleTabs.find((tab) => tab.id === key);
    if (!selected) return;
    setActiveKey(key);
    const destination =
      selected.path === "" ? "/dms/sales" : `/dms/sales/${selected.path}`;
    navigate(destination);
  };

  const tabItems = visibleTabs.map((tab) => {
    const Icon = tab.Icon;
    const Content = tab.Component;
    return {
      key: tab.id,
      label: (
        <>
          <Icon className="inline mr-2 text-amber-500" />{" "}
          <span className="text-amber-500">{tab.label}</span>
        </>
      ),
      children: <Content />,
    };
  });

  return (
    <div className="p-2 mt-4 h-[625px] w-full overflow-auto rounded">
      <h1 className="text-2xl font-bold text-amber-800 mb-0">Sales Module</h1>
      <p className="text-amber-700 mb-3">Manage your sales operations and contracts</p>
      {visibleTabs.length > 0 ? (
        <div className="overflow-auto">
          <Tabs
            activeKey={activeKey}
            onChange={handleChange}
            items={tabItems}
            destroyInactiveTabPane={false}
          />
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          No submodules are permitted for your account in Sales Module.
        </div>
      )}
    </div>
  );
}

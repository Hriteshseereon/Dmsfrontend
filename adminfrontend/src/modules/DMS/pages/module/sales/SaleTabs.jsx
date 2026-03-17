import React, { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import {
  FaBoxOpen,
  FaFileInvoice,
  FaTruck,
  FaUndo,
  FaShoppingCart,
  FaTachometerAlt,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import SaleSouda from "./SaleSouda";
import SaleOrders from "./SaleOrdersInvoice";
import SaleReturn from "./SaleReturn";
import DeliveryStatus from "./DeliveryStatus";
import SaleDashboard from "./SaleDashboard";
import SalesDispute from "./SalesDispute";
import LoadingDetails from "./LoadingDetails";
import SaleInvoice from "./SaleInvoice";

export const SALES_TAB_DEFINITIONS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "",
    Icon: FaTachometerAlt,
    Component: SaleDashboard,
  },
  {
    id: "souda",
    label: "Sale Contracts",
    path: "souda",
    Icon: FaBoxOpen,
    Component: SaleSouda,
  },
  {
    id: "orders",
    label: "Sale Orders",
    path: "orders",
    Icon: FaShoppingCart,
    Component: SaleOrders,
  },
 
  {
    id: "saleinvoice",
    label: "Sale Invoice",
    path: "saleinvoice",
    Icon: FaFileInvoice,
    Component: SaleInvoice,
  },
  // {
  //   id: "loadingdetails",
  //   label: "Loading Details",
  //   path: "loadingdetails",
  //   Icon: FaTruck,
  //   Component: LoadingDetails,
  // },
 
  {
    id: "dispute",
    label: "Sale Dispute",
    path: "dispute",
    Icon: FaUndo,
    Component: SalesDispute,

  },
];

const normalize = (values = []) =>
  values
    .map((value) => value?.toLowerCase())
    .filter(Boolean);

export const getVisibleSalesTabs = (allowedTabs) => {
  const normalized = new Set(normalize(allowedTabs));
  const filtered =
    normalized.size > 0
      ? SALES_TAB_DEFINITIONS.filter((tab) => normalized.has(tab.id))
      : SALES_TAB_DEFINITIONS;

  return filtered.length > 0 ? filtered : SALES_TAB_DEFINITIONS;
};

export default function SaleTabs({ allowedTabs }) {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleTabs = useMemo(
    () => getVisibleSalesTabs(allowedTabs),
    [allowedTabs]
  );
  const defaultTab = visibleTabs[0];

  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const lastPart = parts[parts.length - 1] || "";
    return lastPart === "sales" ? "" : lastPart;
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
        defaultTab.path === "" ? "/dms/sales" : `/dms/sales/${defaultTab.path}`;
      navigate(redirectPath, { replace: true });
    }
  }, [allowedSegments, currentSegment, defaultTab, navigate]);

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
      <p className="text-amber-700 mb-3">Manage your sales data</p>
      <div className="overflow-auto">
        <Tabs
          activeKey={activeKey}
          onChange={handleChange}
          items={tabItems}
          destroyInactiveTabPane={false}
        />
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import {  FaTachometerAlt,
  FaBoxes,
  FaPlusSquare,
  FaUserCheck,
  FaTools,
  FaChartLine,
  FaTimesCircle,
  FaBox
} from "react-icons/fa";
import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import AssetDashboard from "./AssetDashboard";
import AssetCategory from "./AssetCategory";
import AssetAdd from "./AssetAdd";
import AssetAllocation from "./AssetAllocation";
import AssetMaintenance from "./AssetMaintenance";
import AssetDepreciation from "./AssetDepreciation";
import AssetDisposal from "./AssetDisposal";

export const ASSET_TAB_DEFINITIONS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "dashboard",
    Icon: FaTachometerAlt,
    Component: AssetDashboard,
  },
  {
    id: "assetcategory",
    label: "Category",
    path: "assetcategory",
    Icon: FaBoxes,
    Component: AssetCategory,
  },
  {
    id: "assetadd",
    label: "Add",
    path: "assetadd",
    Icon: FaBox,
    Component: AssetAdd,
  },
  {
    id: "assetallocation",
    label: "Allocation",
    path: "assetallocation",
    Icon: FaUserCheck,
    Component: AssetAllocation,
  },
   {
    id: "assetmaintenance",
    label: "Maintenance",
    path: "assetmaintenance",
    Icon: FaTools,
    Component: AssetMaintenance,
  },
   {
    id: "assetdepreciation",
    label: "Depreciation",
    path: "assetdepreciation",
    Icon: FaChartLine,
    Component: AssetDepreciation,
  },
  {
    id: "assetdisposal",
    label: "Disposal",
    path: "assetdisposal",
    Icon: FaTimesCircle,
    Component: AssetDisposal,
  },
];

const normalize = (values = []) =>
  values.map((value) => value?.toLowerCase()).filter(Boolean);

export const getVisibleAssetTabs = (allowedTabs) => {
  const normalized = new Set(normalize(allowedTabs));
  const filtered =
    normalized.size > 0
      ? ASSET_TAB_DEFINITIONS.filter((tab) => normalized.has(tab.id))
      : ASSET_TAB_DEFINITIONS;

  return filtered.length > 0 ? filtered : ASSET_TAB_DEFINITIONS;
};

const AssetModule = ({ allowedTabs }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleTabs = useMemo(() => getVisibleAssetTabs(allowedTabs), [allowedTabs]);

  const defaultTab = visibleTabs[0];

  // Get last path segment and treat module base 'assetmodule' as the empty segment
  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const lastPart = parts[parts.length - 1] || "";
    // if the route is /dms/assetmodule treat it as the base tab ("")
    return lastPart === "assetmodule" ? "" : lastPart;
  }, [location.pathname]);

  const derivedActiveTab = useMemo(() => {
    const match =
      visibleTabs.find(
        (tab) =>
          (tab.path === "" && currentSegment === "") ||
          tab.path.toLowerCase() === currentSegment
      ) || defaultTab;
    return match.id;
  }, [currentSegment, defaultTab, visibleTabs]);

  // controlled Tabs active key
  const [activeKey, setActiveKey] = useState(derivedActiveTab);

  // Keep activeKey in sync with route-derived tab
  useEffect(() => {
    if (derivedActiveTab !== activeKey) {
      setActiveKey(derivedActiveTab);
    }

    // ensure the URL reflects the derivedActiveTab (only navigate when different)
    const tabObj = visibleTabs.find((t) => t.id === derivedActiveTab) ?? defaultTab;
    const destination = tabObj.path === "" ? "/ams/dashboard" : `/ams/${tabObj.path}`;

    if (location.pathname !== destination) {
      // use replace on initial sync to avoid extra history entry if you prefer:
      navigate(destination, { replace: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedActiveTab, visibleTabs, defaultTab, navigate, location.pathname]);

  const handleChange = (key) => {
    const selected = visibleTabs.find((tab) => tab.id === key);
    if (!selected) return;
    setActiveKey(key);
    const destination = selected.path === "" ? "/ams/dashboard" : `/ams/${selected.path}`;
    // navigate on user click
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
      <h1 className="text-2xl font-bold text-amber-800 mb-0">Asset Module</h1>
      <p className="text-amber-700 mb-3">Manage your asset data</p>
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
};

export default AssetModule;

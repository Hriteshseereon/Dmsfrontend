// WealthModule.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./WealthTab.css";
import {
  FaTachometerAlt,
  FaGem,
  FaCrown,
  FaHome,
   FaChartLine,      // Stocks
  FaChartPie,       // Mutual Funds
  FaUniversity,     // Bank
  FaShieldAlt,      // ULIP / Insurance
  FaHandshake,      // Private Equity
  FaPiggyBank,      // PPF / EPF / Deposits
  FaLandmark,       // NPS
  FaCoins,          // Gold / Silver / Platinum 
  FaBoxOpen,        // ETF
  FaFileInvoiceDollar, // FD
  FaEnvelopeOpenText,  // Post Office
  FaBuilding,       // Property
  FaPalette,        // Art
  FaLayerGroup
} from "react-icons/fa";
import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import WealthDashboard from "./WealthDashboard";
import Stock from "./Stock";
import MutualFunds from "./MutualFunds";
import Bank from "./Bank";
import Nps from "./Nps";
import Privatequity from "./Privatequity";
import Deposits from "./Deposits";
import Gold from "./Gold";
import Silver from "./Silver";
import Property from "./Property";
import Art from "./Art";
import Platinum from "./Platinum";
import Ppf from "./Ppf";
import Epf from "./Epf";
import Fd from "./Fd";
import PostOffice from "./PostOffice";
import Etf from "./Etf";
import Ulip from "./Ulip";
import Aif from "./Aif";


export const WEALTH_TAB_DEFINITIONS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "dashboard",
    Icon: FaTachometerAlt,
    Component: WealthDashboard,
  },
  {
    id: "stock",
    label: "Stock",
    path: "stock",
    Icon: FaChartLine, // market / growth
    Component: Stock,
  },
  {
    id: "etf",
    label: "ETF",
    path: "etf",
    Icon: FaBoxOpen, // market / growth
    Component: Etf,
  },
  {
    id: "mutualfunds",
    label: "Mutual Funds",
    path: "mutualfunds",
    Icon: FaHandshake, // pooled investment
    Component: MutualFunds,
  },
  {
    id: "bank",
    label: "Bank",
    path: "bank",
    Icon: FaUniversity, // bank/institution
    Component: Bank,
  },
  {
    id: "nps",
    label: "NPS",
    path: "nps",
    Icon:     FaChartPie,       // Mutual Funds
       // NPS
    Component: Nps,
  },
  {
    id: "ulip",
    label: "ULIP",
    path: "ulip",
    Icon: FaShieldAlt, // long-term secure investment
    Component: Ulip,
  },
  {
    id: "privatequity",
    label: "Private Equity",
    path: "privatequity",
    Icon: FaBuilding, // corporate/private investment
    Component: Privatequity,
  },
  {
    id: "deposits",
    label: "Deposits",
    path: "deposits",
    Icon: FaPiggyBank, // savings
    Component: Deposits,
  },
  {
    id: "ppf",
    label: "PPF",
    path: "ppf",
    Icon: FaPiggyBank, // savings
    Component: Ppf,
  },
  {
    id: "epf",
    label: "EPF",
    path: "epf",
    Icon: FaPiggyBank, // savings
    Component: Epf,
  },
  {
    id: "aif",
    label: "AIF",
    path: "aif",
    Icon: FaLayerGroup, // pooled investment
    Component: Aif,
  },
  {
    id: "fd",
    label: "FD",
    path: "fd",
    Icon: FaFileInvoiceDollar,
    Component: Fd,
  },
  {
    id: "postoffice",
    label: "Post Office",
    path: "postoffice",
    Icon: FaEnvelopeOpenText,
    Component: PostOffice,
  },
  {
    id: "gold",
    label: "Gold",
    path: "gold",
    Icon: FaCoins,
    Component: Gold,
  },
  {
    id: "silver",
    label: "Silver",
    path: "silver",
    Icon: FaGem,
    Component: Silver,
  },
  {
    id: "platinum",
    label: "Platinum",
    path: "platinum",
    Icon: FaCrown, // premium metal
    Component: Platinum,
  },
  {
    id: "property",
    label: "Property",
    path: "property",
    Icon: FaHome, // real estate
    Component: Property,
  },
  {
    id: "art",
    label: "Art",
    path: "art",
    Icon: FaPalette, // artwork/collectibles
    Component: Art,
  },
];

// normalize takes an array of strings and returns lowercased truthy values
const normalize = (values = []) => values.map((v) => v?.toLowerCase()).filter(Boolean);


export const getVisibleWealthTabs = (allowedTabs) => {
  const normalized = new Set(normalize(allowedTabs));
  const filtered = normalized.size > 0
    ? WEALTH_TAB_DEFINITIONS.filter((tab) => normalized.has(tab.id))
    : WEALTH_TAB_DEFINITIONS;

  return filtered.length > 0 ? filtered : WEALTH_TAB_DEFINITIONS;
};

/*
  WealthModule props:
    - allowedTabs: array of tab ids (strings) e.g. ['dashboard','bank','gold']
*/
const WealthModule = ({ allowedTabs }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // visibleTabs updates when allowedTabs changes
  const visibleTabs = useMemo(() => getVisibleWealthTabs(allowedTabs), [allowedTabs]);

  // default tab (first visible)
  const defaultTab = visibleTabs[0];

  // derive last path segment and treat '/dms/wealthmodule' (ending in wealthmodule) as base ""
  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const lastPart = parts[parts.length - 1] || "";
    return lastPart === "wealthmodule" ? "" : lastPart;
  }, [location.pathname]);

  // determine which tab should be active based on current URL segment
  const derivedActiveTab = useMemo(() => {
    const match = visibleTabs.find(
      (tab) =>
        (tab.path === "" && currentSegment === "") ||
        tab.path.toLowerCase() === currentSegment
    ) || defaultTab;
    return match.id;
  }, [currentSegment, defaultTab, visibleTabs]);

  // controlled activeKey
  const [activeKey, setActiveKey] = useState(derivedActiveTab);

  // keep activeKey in sync with derivedActiveTab and ensure URL matches
  useEffect(() => {
    if (derivedActiveTab !== activeKey) {
      setActiveKey(derivedActiveTab);
    }

    const tabObj = visibleTabs.find((t) => t.id === derivedActiveTab) ?? defaultTab;
    const destination = tabObj.path === "" ? "/wms/dashboard" : `/wms/${tabObj.path}`;

    if (location.pathname !== destination) {
      navigate(destination, { replace: false });
    }
    // NOTE: we intentionally mirror the AssetModule dependency choices
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedActiveTab, visibleTabs, defaultTab, navigate, location.pathname]);

  // user clicks tabs -> navigate
  const handleChange = (key) => {
    const selected = visibleTabs.find((tab) => tab.id === key);
    if (!selected) return;
    setActiveKey(key);
    const destination = selected.path === "" ? "/wms/dashboard" : `/wms/${selected.path}`;
    navigate(destination);
  };

  // create antd tab items
  const tabItems = visibleTabs.map((tab) => {
    const Icon = tab.Icon;
    const Content = tab.Component;
    return {
      key: tab.id,
      label: (
        <>
          <Icon className="inline mr-2 text-amber-500" />
          <span className="text-amber-500">{tab.label}</span>
        </>
      ),
      children: <Content />,
    };
  });

  return (
    <div className="p-2 mt-4 h-[550px] w-full overflow-auto rounded">
      <h1 className="text-2xl font-bold text-amber-800 mb-0">Wealth Module</h1>
      <p className="text-amber-700 mb-3">Manage your wealth data</p>

      <div className="wealth-tabs-wrapper">
  <Tabs
    activeKey={activeKey}
    onChange={handleChange}
    items={tabItems}
     
  />
</div>

    </div>
  );
};

export default WealthModule;

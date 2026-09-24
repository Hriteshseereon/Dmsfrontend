import React, { useMemo } from "react";
import { Tabs, Tag } from "antd";
import {
  PieChartOutlined,
  BookOutlined,
  TeamOutlined,
  InboxOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  TagsOutlined,
  ShoppingOutlined,
  WalletOutlined,
  BankOutlined,
  SolutionOutlined,
  FundOutlined,
  PercentageOutlined,
  SwapOutlined,
  GoldOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useFinancialPeriod } from "./hooks/useAccountsData";
import "./AccountsTabs.css";

export const ACCOUNTS_MAIN_TABS = [
  {
    id: "overview",
    label: "Dashboard Overview",
    icon: PieChartOutlined,
    defaultPath: "",
    subTabs: [],
  },
  {
    id: "books",
    label: "Books of Account",
    icon: BookOutlined,
    defaultPath: "day-book",
    subTabs: [
      { id: "day-book", label: "Day Book", path: "day-book", icon: ScheduleOutlined },
      { id: "sales-register", label: "Sales Register", path: "sales-register", icon: TagsOutlined },
      { id: "purchase-register", label: "Purchase Register", path: "purchase-register", icon: ShoppingOutlined },
      { id: "receipts-payments", label: "Receipts & Payments", path: "receipts-payments", icon: WalletOutlined },
      { id: "cash-bank-book", label: "Cash & Bank Book", path: "cash-bank-book", icon: BankOutlined },
    ],
  },
  {
    id: "parties",
    label: "Parties & Outstanding",
    icon: TeamOutlined,
    defaultPath: "customer-ledger",
    subTabs: [
      { id: "customer-ledger", label: "Customer Ledger", path: "customer-ledger", icon: SolutionOutlined },
      { id: "receivables", label: "Receivables & Ageing", path: "receivables", icon: FundOutlined },
      { id: "broker-commission", label: "Broker Commission", path: "broker-commission", icon: PercentageOutlined },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: InboxOutlined,
    defaultPath: "stock-summary",
    subTabs: [
      { id: "stock-summary", label: "Stock Summary", path: "stock-summary", icon: InboxOutlined },
      { id: "stock-movement", label: "Stock Movement", path: "stock-movement", icon: SwapOutlined },
    ],
  },
  {
    id: "statutory",
    label: "Statutory & Statements",
    icon: FileTextOutlined,
    defaultPath: "gst-summary",
    subTabs: [
      { id: "gst-summary", label: "GST Summary", path: "gst-summary", icon: PercentageOutlined },
      { id: "balance-sheet", label: "Balance Sheet", path: "balance-sheet", icon: PieChartOutlined },
      { id: "asset-register", label: "Fixed Asset Register", path: "asset-register", icon: GoldOutlined },
    ],
  },
];

export default function AccountsTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fy } = useFinancialPeriod();

  // Extract current segment after /dms/accounts/
  const currentSegment = useMemo(() => {
    const cleanedPath = location.pathname.replace(/\/+$/, "");
    const parts = cleanedPath.split("/");
    const idx = parts.indexOf("accounts");
    if (idx === -1 || idx === parts.length - 1) return "";
    return parts.slice(idx + 1).join("/");
  }, [location.pathname]);

  // Determine active main tab and active sub-tab
  const { activeMainTab, activeSubTab } = useMemo(() => {
    if (!currentSegment || currentSegment === "overview") {
      return { activeMainTab: "overview", activeSubTab: "" };
    }

    for (const mainTab of ACCOUNTS_MAIN_TABS) {
      if (mainTab.id === currentSegment) {
        return { activeMainTab: mainTab.id, activeSubTab: mainTab.defaultPath };
      }
      const matchedSub = mainTab.subTabs.find(
        (sub) => sub.path === currentSegment || sub.id === currentSegment
      );
      if (matchedSub) {
        return { activeMainTab: mainTab.id, activeSubTab: matchedSub.id };
      }
    }

    return { activeMainTab: "overview", activeSubTab: "" };
  }, [currentSegment]);

  const currentMainTabObj = useMemo(
    () => ACCOUNTS_MAIN_TABS.find((t) => t.id === activeMainTab) || ACCOUNTS_MAIN_TABS[0],
    [activeMainTab]
  );

  const handleMainTabChange = (key) => {
    const target = ACCOUNTS_MAIN_TABS.find((t) => t.id === key);
    if (!target) return;
    const dest = target.defaultPath
      ? `/dms/accounts/${target.defaultPath}`
      : `/dms/accounts`;
    navigate(dest);
  };

  const handleSubTabChange = (key) => {
    const target = currentMainTabObj.subTabs.find((s) => s.id === key);
    if (!target) return;
    navigate(`/dms/accounts/${target.path}`);
  };

  const mainTabItems = ACCOUNTS_MAIN_TABS.map((tab) => {
    const Icon = tab.icon;
    return {
      key: tab.id,
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <Icon className="text-amber-600 text-base" />
          <span className="text-amber-900">{tab.label}</span>
        </span>
      ),
    };
  });

  const subTabItems = (currentMainTabObj.subTabs || []).map((sub) => {
    const Icon = sub.icon;
    return {
      key: sub.id,
      label: (
        <span className="flex items-center gap-1.5 px-2 py-1 font-semibold text-xs">
          <Icon className="text-amber-700" />
          <span>{sub.label}</span>
        </span>
      ),
    };
  });

  return (
    <div className="p-4 space-y-3">
      {/* Module Title & Financial Year Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-amber-800 mb-0">
            Accounting Module
          </h1>
          <p className="text-amber-700 text-sm mb-0">
            Manage books of account, party ledgers, registers, inventory, and statutory financial statements
          </p>
        </div>
        {fy && (
          <div>
            <Tag color="orange" className="px-3 py-1 text-xs font-bold border-amber-300 bg-amber-50 text-amber-900 flex items-center gap-1.5 shadow-xs">
              <CalendarOutlined className="text-amber-700" />
              <span>Financial Year: {fy}</span>
            </Tag>
          </div>
        )}
      </div>

      {/* Main Category Tabs */}
      <div className="accounts-main-tabs mb-0">
        <Tabs
          activeKey={activeMainTab}
          onChange={handleMainTabChange}
          items={mainTabItems}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </div>

      {/* Secondary Sub-Tabs */}
      {currentMainTabObj.subTabs && currentMainTabObj.subTabs.length > 0 && (
        <div className="accounts-sub-tabs bg-amber-50/60 border border-amber-200 rounded-lg p-1.5 shadow-xs">
          <Tabs
            size="small"
            type="card"
            activeKey={activeSubTab}
            onChange={handleSubTabChange}
            items={subTabItems}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
      )}

      {/* Active Report Screen */}
      <div className="pt-1">
        <Outlet />
      </div>
    </div>
  );
}

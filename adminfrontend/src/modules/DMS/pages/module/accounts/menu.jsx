/* eslint-disable react-refresh/only-export-components */
/**
 * Single source of truth for the Accounts navigation.
 *
 * The sidebar dropdowns, the routes and the overview cards all read this,
 * so a new report is added in exactly one place.
 */
import React from "react";
import {
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  InboxOutlined,
  PercentageOutlined,
  BankOutlined,
  GoldOutlined,
  SolutionOutlined,
  FundOutlined,
  ShoppingOutlined,
  TagsOutlined,
  ScheduleOutlined,
  WalletOutlined,
  SwapOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

export const ACCOUNTS_BASE = "/dms/accounts";

export const ACCOUNTS_MENU = [
  {
    key: "acc-books",
    label: "Books of Account",
    icon: <BookOutlined />,
    children: [
      {
        key: "day-book",
        label: "Day Book",
        path: `${ACCOUNTS_BASE}/day-book`,
        icon: <ScheduleOutlined />,
        description:
          "Every voucher in date order with its ledger effect — sales, purchases, receipts, credit notes and freight.",
      },
      {
        key: "sales-register",
        label: "Sales Register",
        path: `${ACCOUNTS_BASE}/sales-register`,
        icon: <TagsOutlined />,
        description:
          "Month-wise and voucher-wise outward supplies, with tax back-calculated from the invoice rate.",
        derived: true,
      },
      {
        key: "purchase-register",
        label: "Purchase Register",
        path: `${ACCOUNTS_BASE}/purchase-register`,
        icon: <ShoppingOutlined />,
        description:
          "Month-wise and bill-wise inward supplies, with taxable value and GST exactly as posted.",
      },
      {
        key: "receipts-payments",
        label: "Receipts & Payments",
        path: `${ACCOUNTS_BASE}/receipts-payments`,
        icon: <WalletOutlined />,
        description:
          "Customer collections from the wallet, plus freight recoveries and advances paid to transporters.",
      },
      {
        key: "cash-bank-book",
        label: "Cash & Bank Book",
        path: `${ACCOUNTS_BASE}/cash-bank-book`,
        icon: <BankOutlined />,
        description:
          "Money in and out with a running balance, from bank transactions and customer collections.",
        derived: true,
      },
    ],
  },
  {
    key: "acc-parties",
    label: "Parties & Outstanding",
    icon: <TeamOutlined />,
    children: [
      {
        key: "customer-ledger",
        label: "Customer Ledger",
        path: `${ACCOUNTS_BASE}/customer-ledger`,
        icon: <SolutionOutlined />,
        description:
          "Party account with running balance — invoices debit, receipts and credit notes credit.",
      },
      {
        key: "receivables",
        label: "Receivables & Ageing",
        path: `${ACCOUNTS_BASE}/receivables`,
        icon: <FundOutlined />,
        description:
          "Outstanding by party with 30/60/90-day buckets, credit limits and overdue flags.",
        derived: true,
      },
      {
        key: "broker-commission",
        label: "Broker Commission",
        path: `${ACCOUNTS_BASE}/broker-commission`,
        icon: <PercentageOutlined />,
        description:
          "Commission computed by applying each broker's configured rule to their sales contracts.",
        derived: true,
      },
    ],
  },
  {
    key: "acc-inventory",
    label: "Inventory",
    icon: <InboxOutlined />,
    children: [
      {
        key: "stock-summary",
        label: "Stock Summary",
        path: `${ACCOUNTS_BASE}/stock-summary`,
        icon: <InboxOutlined />,
        description:
          "Closing quantity and value by item, valued at the last purchase rate.",
        derived: true,
      },
      {
        key: "stock-movement",
        label: "Stock Movement",
        path: `${ACCOUNTS_BASE}/stock-movement`,
        icon: <SwapOutlined />,
        description:
          "Inward, outward and closing position per item, drillable to the voucher.",
        derived: true,
      },
    ],
  },
  {
    key: "acc-statutory",
    label: "Statutory & Statements",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "gst-summary",
        label: "GST Summary",
        path: `${ACCOUNTS_BASE}/gst-summary`,
        icon: <PercentageOutlined />,
        description:
          "Output tax against input tax, with HSN-wise and rate-wise breakups.",
        derived: true,
      },
      {
        key: "balance-sheet",
        label: "Balance Sheet (Derived)",
        path: `${ACCOUNTS_BASE}/balance-sheet`,
        icon: <PieChartOutlined />,
        description:
          "Working-capital position and trading summary assembled from trading data.",
        derived: true,
      },
      {
        key: "asset-register",
        label: "Fixed Asset Register",
        path: `${ACCOUNTS_BASE}/asset-register`,
        icon: <GoldOutlined />,
        description:
          "Asset cost, accumulated depreciation, book value and disposals.",
      },
    ],
  },
];

/** Flat list of every report, for routing and lookups. */
export const ACCOUNTS_REPORTS = ACCOUNTS_MENU.flatMap((g) => g.children || []);

/** Sidebar active-key resolution for a given pathname. */
export const resolveAccountsKey = (pathname = "") => {
  const hit = ACCOUNTS_REPORTS.find((r) => pathname.startsWith(r.path));
  return hit?.key || (pathname.startsWith(ACCOUNTS_BASE) ? "accounts-overview" : "");
};

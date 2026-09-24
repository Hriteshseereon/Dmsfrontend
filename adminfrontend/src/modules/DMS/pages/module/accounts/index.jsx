/**
 * Accounts routes.
 * Mounted at /dms/accounts/* from modules/DMS/index.jsx.
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AccountsTabs from "./AccountsTabs";
import AccountsOverview from "./reports/AccountsOverview";
import DayBook from "./reports/DayBook";
import SalesRegister from "./reports/SalesRegister";
import PurchaseRegister from "./reports/PurchaseRegister";
import ReceiptsPayments from "./reports/ReceiptsPayments";
import CashBankBook from "./reports/CashBankBook";
import CustomerLedger from "./reports/CustomerLedger";
import ReceivablesAgeing from "./reports/ReceivablesAgeing";
import BrokerCommission from "./reports/BrokerCommission";
import StockSummary from "./reports/StockSummary";
import StockMovement from "./reports/StockMovement";
import GstSummary from "./reports/GstSummary";
import BalanceSheet from "./reports/BalanceSheet";
import AssetRegister from "./reports/AssetRegister";

const AccountsRoutes = () => (
  <Routes>
    <Route element={<AccountsTabs />}>
      {/* Overview */}
      <Route index element={<AccountsOverview />} />
      <Route path="overview" element={<AccountsOverview />} />

      {/* Category Shortcut Redirects */}
      <Route path="books" element={<Navigate to="/dms/accounts/day-book" replace />} />
      <Route path="parties" element={<Navigate to="/dms/accounts/customer-ledger" replace />} />
      <Route path="inventory" element={<Navigate to="/dms/accounts/stock-summary" replace />} />
      <Route path="statutory" element={<Navigate to="/dms/accounts/gst-summary" replace />} />

      {/* Books of Account Sub-tabs */}
      <Route path="day-book" element={<DayBook />} />
      <Route path="sales-register" element={<SalesRegister />} />
      <Route path="purchase-register" element={<PurchaseRegister />} />
      <Route path="receipts-payments" element={<ReceiptsPayments />} />
      <Route path="cash-bank-book" element={<CashBankBook />} />

      {/* Parties & Outstanding Sub-tabs */}
      <Route path="customer-ledger" element={<CustomerLedger />} />
      <Route path="receivables" element={<ReceivablesAgeing />} />
      <Route path="broker-commission" element={<BrokerCommission />} />

      {/* Inventory Sub-tabs */}
      <Route path="stock-summary" element={<StockSummary />} />
      <Route path="stock-movement" element={<StockMovement />} />

      {/* Statutory & Statements Sub-tabs */}
      <Route path="gst-summary" element={<GstSummary />} />
      <Route path="balance-sheet" element={<BalanceSheet />} />
      <Route path="asset-register" element={<AssetRegister />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dms/accounts" replace />} />
    </Route>
  </Routes>
);

export default AccountsRoutes;

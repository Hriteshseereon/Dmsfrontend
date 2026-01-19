import { Route, Routes, Navigate } from "react-router-dom";
import PurchaseDashboard from "./PurchaseDashboard";
import DeliveryStatus from "./DeliveryStatus";
import LoadingAdvice from "./LoadingAdvice";
import PurchaseIndent from "./PurchaseIndent";
import PurchaseInvoice from "./PurchaseInvoice";
import PurchaseReturn from "./PurchaseReturn";
import PurchaseSouda from "./PurchaseSouda";
import {
  getVisiblePurchaseTabs,
  PURCHASE_TAB_DEFINITIONS,
} from "./PurchaseTabs";

const tabComponentMap = {
  dashboard: <PurchaseDashboard />,
  souda: <PurchaseSouda />,
  indent: <PurchaseIndent />,
  invoice: <PurchaseInvoice />,
  loading: <LoadingAdvice />,
  status: <DeliveryStatus />,
  return: <PurchaseReturn />,
};

export default function PurchaseRoutes({ allowedTabs }) {
  const visibleTabs = getVisiblePurchaseTabs(allowedTabs);
  const allowedIds = new Set(visibleTabs.map((tab) => tab.id));
  const fallbackTab = visibleTabs[0] || PURCHASE_TAB_DEFINITIONS[0];

  const redirectTarget =
    fallbackTab.path === ""
      ? "/dms/purchase"
      : `/dms/purchase/${fallbackTab.path}`;

  const guard = (tabId, element) =>
    allowedIds.has(tabId) ? element : <Navigate to={redirectTarget} replace />;

  return (
    <Routes>
      <Route index element={guard("dashboard", tabComponentMap.dashboard)} />
      <Route path="souda" element={guard("souda", tabComponentMap.souda)} />
      <Route path="indent" element={guard("indent", tabComponentMap.indent)} />
      <Route
        path="invoice"
        element={guard("invoice", tabComponentMap.invoice)}
      />
      <Route path="return" element={guard("return", tabComponentMap.return)} />
      <Route
        path="loading"
        element={guard("loading", tabComponentMap.loading)}
      />
      <Route path="status" element={guard("status", tabComponentMap.status)} />
    </Routes>
  );
}
//

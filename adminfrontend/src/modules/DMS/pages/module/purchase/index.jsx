import { Route, Routes, Navigate } from "react-router-dom";
import PurchaseDashboard from "./PurchaseDashboard";
import Invoice from "./Invoice";
import LoadingAdvice from "./LoadingAdvice";
import PurchaseIndent from "./PurchaseIndent";
import PurchaseInvoice from "./PurchaseInvoice";
import PurchaseReturn from "./PurchaseReturn";
import PurchaseSouda from "./PurchaseSouda";
import StockReport from "./StockReport";
import { PURCHASE_TAB_DEFINITIONS } from "./PurchaseTabs";
import { useAuth } from "../../../../../context/AuthContext";
import RestrictedAccess from "../../../../../pages/RestrictedAccess";

const tabComponentMap = {
  purchase_dashboard: <PurchaseDashboard />,
  purchase_contract: <PurchaseSouda />,
  purchase_indent: <PurchaseIndent />,
  vehicle_placement: <PurchaseInvoice />,
  transport_freight: <LoadingAdvice />,
  purchase_invoice: <Invoice />,
  purchase_intransit: <PurchaseReturn />,
  stock_status: <StockReport />,
};

export default function PurchaseRoutes() {
  const { hasPermission, isAdmin } = useAuth();

  const guard = (submoduleKey, element) => {
    if (isAdmin || hasPermission(submoduleKey, "view")) {
      return element;
    }
    return <RestrictedAccess submoduleKey={submoduleKey} />;
  };

  return (
    <Routes>
      <Route index element={guard("purchase_dashboard", tabComponentMap.purchase_dashboard)} />
      <Route path="souda" element={guard("purchase_contract", tabComponentMap.purchase_contract)} />
      <Route path="indent" element={guard("purchase_indent", tabComponentMap.purchase_indent)} />
      <Route path="assign" element={guard("vehicle_placement", tabComponentMap.vehicle_placement)} />
      <Route path="loading" element={guard("transport_freight", tabComponentMap.transport_freight)} />
      <Route path="invoice" element={guard("purchase_invoice", tabComponentMap.purchase_invoice)} />
      <Route path="return" element={guard("purchase_intransit", tabComponentMap.purchase_intransit)} />
      <Route path="stock" element={guard("stock_status", tabComponentMap.stock_status)} />
    </Routes>
  );
}
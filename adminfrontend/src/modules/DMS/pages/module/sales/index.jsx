import { Route, Routes } from "react-router-dom";
import SaleDashboard from "./SaleDashboard";
import SalesSouda from "./SaleSouda";
import SaleOrdersInvoice from "./SaleOrdersInvoice";
import DeliveryStatus from "./DeliveryStatus";
import SaleReturn from "./SaleReturn";
import SalesDispute from "./SalesDispute";

export default SalesRoutes = () => {
  return (
    <Routes>
      <Route index element={<SaleDashboard />} />
      {/* children component path here */}
      <Route path="souda" element={<SalesSouda />} />
      <Route path="orders" element={<SaleOrdersInvoice />} />
      <Route path="status" element={<DeliveryStatus />} />
      <Route path="return" element={<SaleReturn />} />
      <Route path="dispute" element={<SalesDispute />} />

    </Routes>
  );
};

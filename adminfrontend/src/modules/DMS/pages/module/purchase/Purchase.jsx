import PurchaseRoutes from "./index";
import PurchaseTabs from "./PurchaseTabs";
import { useAuth } from "../../../../../context/AuthContext";

const AccessRestricted = () => (
  <div className="p-6 bg-white border border-amber-200 rounded-lg text-center">
    <h2 className="text-xl font-semibold text-amber-800 mb-2">
      Purchase module access is restricted
    </h2>
    <p className="text-amber-700">
      Please contact your administrator if you believe this is a mistake.
    </p>
  </div>
);

export default function Purchase() {
  const { user } = useAuth();
  const purchaseAccess = user?.permissions?.DMS?.submodules?.purchase;
  const hasExplicitPermissions = Boolean(user?.permissions?.DMS);
  const isAllowed =
    user?.role === "admin" ||
    !hasExplicitPermissions ||
    purchaseAccess?.tabs.length > 0;

  if (!isAllowed) {
    return <AccessRestricted />;
  }

  return (
    <>
      <PurchaseTabs allowedTabs={purchaseAccess?.tabs} />
      <PurchaseRoutes allowedTabs={purchaseAccess?.tabs} />
    </>
  );
}

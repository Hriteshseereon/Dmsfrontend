import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadScript } from "@react-google-maps/api";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import DMS from "../modules/DMS";
import AMS from "../modules/AMS";
import WMS from "../modules/WMS";
import OrganizationDashboard from "../pages/OrganizationDashboard";
import OrganizationList from "../pages/OrganizationList";
import AddOrganisation from "../pages/AddOrganisation";
import AppLayout from "../pages/AppLayout";
import AssetModule from "../modules/AMS/AssetModule";
import WealthModule from "../modules/WMS/WealthModule";
import OrgTabs from "../pages/OrgTabs";
const LIBRARIES = ["places"];
export default function AppRouter() {
  const { user } = useAuth();

  return (
     <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={LIBRARIES}
    >
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login />
            ) : (
              <Navigate
                to={user.is_admin ? "/organizations" : "/dashboard"}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        {/* Admin gets list of organizations */}
       <Route path="/organizations/*" element={user ? <OrgTabs user={user} /> : <Navigate to="/" />} />
        <Route path="/organizations/customer" element={user ? <OrgTabs user={user} /> : <Navigate to="/" />} />
        <Route path="/organizations/transport" element={user ? <OrgTabs user={user} /> : <Navigate to="/" />} />

        <Route path="/organisation/add" element={<AddOrganisation />} />
        <Route path="/organisation/edit/:orgId" element={<AddOrganisation />} />

        {/* Organization specific dashboard */}
        <Route
          path="/organization/:orgId"
          element={user ? <OrganizationDashboard /> : <Navigate to="/" />}
        />
        <Route path="/organization" element={<OrganizationDashboard />} />

        {/* DMS (protected) */}

        <Route path="/" element={<AppLayout />}>
          <Route path="/dms/*" element={user ? <DMS /> : <Navigate to="/" />} />
          {/* ams module - currently imported assetmodule,
           AMS/index.jsx is path based but we are using tab based
          for using path based use <AMS /> */}
          <Route path="/ams/*" element={user ? <AssetModule /> : <Navigate to="/" />} />
          <Route path="/wms/*" element={user ? <WealthModule /> : <Navigate to="/" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </LoadScript>
  );
}

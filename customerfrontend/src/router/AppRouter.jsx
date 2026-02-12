import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrivateRoute from "../components/PrivateRoute";
import Login from "../components/Login";
import Signup from "../components/Signup";
import Dashboard from "../pages/Dashboard";
import ProfileSettings from "../pages/ProfileSettings";
import Layout from "../pages/Layout";
import Contract from "../pages/Contract"
import Order from "../pages/Order"
import RaiseDispute from "../pages/RaiseDispute"
import DeliveryStatus from "../pages/DelivereyStatus"
import Wallet from "../pages/Wallet"
import PendingTransaction from "../pages/PendingTransactions";
import ApprovedDeliveries from "../pages/Approved";
import ReportAnalytic from "../pages/reports/ReportAnaytics";

export default function AppRouter() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contract" element={<Contract />} />
                <Route path="/order" element={<Order />} />
                <Route path="/rise-dispute" element={<RaiseDispute />} />
                <Route path="/deliverey-status" element={<DeliveryStatus />} />
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/reports" element={<ReportAnalytic />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/pending-transaction" element={<PendingTransaction />} />
                <Route path="/approved-deliveries" element={<ApprovedDeliveries />} />
            </Route>
        </Routes>
    );
}

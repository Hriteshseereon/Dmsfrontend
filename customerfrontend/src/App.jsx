import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import Layout from "./pages/Layout";
import Contract from "./pages/Contract"
import Order from "./pages/Order"
import RaiseDispute from "./pages/RaiseDispute"
import DeliveryStatus from "./pages/DelivereyStatus"
import Reports from "./pages/reports/ReportAnaytics"
import Wallet from "./pages/Wallet"
import PendingTransaction from "./pages/PendingTransactions";
import ApprovedDeliveries from "./pages/Approved";
import ReportAnalytic from "./pages/reports/ReportAnaytics";
//import BrokerSignup from "./components/BrokerSignup";
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
         {/* <Route path="/broker-signup" element={<BrokerSignup />} /> */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/order"element={<Order/>}/> 
            <Route path="/rise-dispute" element={<RaiseDispute />} />
            <Route path="/deliverey-status" element={<DeliveryStatus/>} />
            <Route path="/profile-settings"element={<ProfileSettings/>}/>  
            <Route path="/reports" element={<ReportAnalytic />} />
            <Route path="/wallet"element={<Wallet/>}/>
            <Route path="/pending-transaction" element={<PendingTransaction />} />
            <Route path="/approved-deliveries" element={<ApprovedDeliveries />} />
             </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

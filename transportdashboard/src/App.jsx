import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import Layout from "./pages/Layout";
import RisedStatus from "./pages/RisedStatus";
import LoadingAdvice from "./pages/LoadingAdvice";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
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
          <Route path="/status" element={<RisedStatus />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/loading-advice" element={<LoadingAdvice />} />
        </Route>
      </Routes>
    </Router>
  );
}

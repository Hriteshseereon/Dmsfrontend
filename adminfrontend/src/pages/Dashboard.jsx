// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import DashboardLayout from "../layouts/DashboardLayout";
// import DMS from "../modules/DMS";
// import AMS from "../modules/AMS";
// import WMS from "../modules/WMS";
// import HRMS from "../modules/HRMS";

// export default function Dashboard() {
//   const { orgModules } = useAuth();

//   // const availableRoutes = {
//   //   DMS: <DMS />,
//   //   AMS: <AMS />,
//   //   WMS: <WMS />,
//   //   HRMS: <HRMS />,
//   // };

//   return (
//     <DashboardLayout>
//       {orgModules.map((x) => (
//         <p>{x}</p>
//       ))}
//       {/* <Routes>
//         {orgModules.map((m) => (
//           <Route key={m} path={m.toLowerCase()} element={availableRoutes[m]} />
//         ))}
//         <Route
//           path="*"
//           element={<Navigate to={orgModules[0]?.toLowerCase() || "/"} />}
//         />
//       </Routes> */}
//     </DashboardLayout>
//   );
// }
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  Plus,
  Building2,
  FileText,
  Package,
  Warehouse,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import moduleData from "../data/modules.json";
// Module icon mapping
const moduleIcons = {
  DMS: FileText,
  AMS: Building2,
  WMS: Warehouse,
  HRMS: Users,
};

// Module descriptions
const moduleDescriptions = {
  DMS: "Document Management System",
  AMS: "Asset Management System",
  WMS: "Warehouse Management System",
  HRMS: "Human Resource Management System",
};

export default function Dashboard() {
  const { orgModules, user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [availableModules, setAvailableModules] = useState({});
  const [formData, setFormData] = useState({
    orgId: "",
    orgName: "",
    modules: [],
  });

  const isAdmin = user?.role === "admin";

  const handleModuleToggle = (module) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  const handleSubmit = () => {
    if (!formData.orgId || !formData.orgName || formData.modules.length === 0) {
      alert("Please fill all required fields");
      return;
    }
    console.log("New Organization:", formData);
    // Add your API call here
    setShowModal(false);
    setFormData({ orgId: "", orgName: "", modules: [] });
  };

  const handleModuleClick = (module) => {
    navigate(`/${module.toLowerCase()}`);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white flex justify-between items-center px-6 py-3 shadow-md">
        <div className="flex flex-col">
          <h1 className="font-bold text-lg text-amber-800">Admin Dashboard</h1>
          <p className="text-amber-800 text-sm -mt-1">
            Welcome back, {user?.email?.split("@")[0]} 👋
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-amber-800 font-medium">{user?.email}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Your Modules</h2>
            <p className="text-gray-600 mt-1">
              Access your organization's systems
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Organization
            </button>
          )}
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgModules.map((module) => {
            const Icon = moduleIcons[module];
            return (
              <div
                key={module}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 hover:border-amber-400"
              >
                <div className="p-6">
                  {/* Icon with leaf decoration */}
                  <div className="relative mb-4">
                    <div className="absolute -top-2 -right-2 text-amber-400 opacity-20 transform rotate-12">
                      <svg
                        className="w-20 h-20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.67C7.89 17.38 9.4 12.33 17 10.67V8z" />
                        <path d="M3.82 21.34C5.9 16.17 8 10 17 8v2.67C9.4 12.33 7.89 17.38 5.71 22.01l-1.89-.67z" />
                      </svg>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                      <Icon className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* Module Name */}
                  <h3 className="text-2xl font-bold text-amber-800 mb-2">
                    {module}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {moduleDescriptions[module]}
                  </p>

                  {/* Access Button */}
                  <button
                    onClick={() => handleModuleClick(module)}
                    className="w-full py-2 px-4 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-500 hover:text-white transition-colors border border-amber-200 group-hover:border-amber-500"
                  >
                    Access {module}
                  </button>
                </div>

                {/* Bottom accent */}
                <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              </div>
            );
          })}
        </div>

        {orgModules.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No modules available</p>
            <p className="text-gray-400 text-sm">Contact your administrator</p>
          </div>
        )}
      </div>

      {/* Add Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-amber-800">
                    Add Organization
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Create a new organization profile
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                {/* Organization ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization ID *
                  </label>
                  <input
                    type="text"
                    value={formData.orgId}
                    onChange={(e) =>
                      setFormData({ ...formData, orgId: e.target.value })
                    }
                    placeholder="e.g., Org12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formData.orgName}
                    onChange={(e) =>
                      setFormData({ ...formData, orgName: e.target.value })
                    }
                    placeholder="e.g., Aum Agro Associates"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Email *
                  </label>
                  <input
                    type="text"
                    value={formData.orgEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, orgEmail: e.target.value })
                    }
                    placeholder="e.g., Aum Agro Associates"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Password *
                  </label>
                  <input
                    type="text"
                    value={formData.orgPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, orgPassword: e.target.value })
                    }
                    placeholder="e.g., Aum Agro Associates"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                {/* Modules Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Modules *
                  </label>
                  <div className="space-y-2">
                    {Object.keys(moduleDescriptions).map((module) => {
                      const Icon = moduleIcons[module];
                      return (
                        <label
                          key={module}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.modules.includes(module)}
                            onChange={() => handleModuleToggle(module)}
                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                          />
                          <Icon className="w-5 h-5 text-amber-600 mx-3" />
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">
                              {module}
                            </span>
                            <p className="text-xs text-gray-500">
                              {moduleDescriptions[module]}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-md"
                >
                  Add Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

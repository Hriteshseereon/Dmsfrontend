import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";

export default function OrganizationList() {
  const { organisations, user, setOrgModules } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    password: "",
    modules: [],
  });

  const availableModules = ["DMS", "AMS", "WMS", "HRMS"];

  const handleModuleToggle = (module) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      companyName: "",
      companyEmail: "",
      password: "",
      modules: [],
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <nav className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-2xl text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user.email}
            </p>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Organizations</h2>
          {/* <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add Company
          </button> */}
          <button
          onClick={() => navigate("/organisation/add")}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add Company
        </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organisations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-1">
                      {org.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      ID: {org.id}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-amber-600" size={24} />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Active Modules
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {org.modules?.length ? (
                      org.modules.map((module) => (
                        <span
                          key={module}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200"
                        >
                          {module}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No modules assigned
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const firstModule = org.modules?.[0];
                    setOrgModules(org.modules || []);
                    if (firstModule) {
                      navigate(`/${firstModule.toLowerCase()}`);
                    } else {
                      navigate(`/organization/${encodeURIComponent(org.id)}`);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all group-hover:shadow-md"
                >
                  Open Dashboard
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                Add New Company
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, companyEmail: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="company@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Modules */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Modules
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableModules.map((module) => (
                    <label
                      key={module}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.modules.includes(module)
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.modules.includes(module)}
                        onChange={() => handleModuleToggle(module)}
                        className="w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                      />
                      <span
                        className={`font-medium ${
                          formData.modules.includes(module)
                            ? "text-amber-700"
                            : "text-gray-700"
                        }`}
                      >
                        {module}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
import { useOrganizations } from "../queries/useOrganizations";
import useSessionStore from "../store/sessionStore";

export default function OrganizationList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: organizations, isLoading } = useOrganizations();
  const { setCurrentOrgId } = useSessionStore();

  if (isLoading) {
    return <div>Loading organizations...</div>;
  }

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
          <button
          onClick={() => navigate("/organisation/add")}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add Company
        </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations?.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-1">
                      {org.registered_name}
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
                    // const firstModule = org.modules?.[0];
                    // setOrgModules(org.modules || []);
                    // if (firstModule) {
                    //   navigate(`/${firstModule.toLowerCase()}`);
                    // } else {
                    //   navigate(`/organization/${encodeURIComponent(org.id)}`);
                    // }
                    setCurrentOrgId(org.id);
                    navigate(`/dashboard`);
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
    </div>
  );
}

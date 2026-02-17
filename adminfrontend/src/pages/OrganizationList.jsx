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
  Edit,
  Download,
} from "lucide-react";
import { useOrganizations } from "../queries/useOrganizations";
import useSessionStore from "../store/sessionStore";
import { getOrganization } from "../api/organizations";
import { exportOrganisationExcel } from "../utils/exportOrganisationExcel";
export default function OrganizationList() {
  const { user, setOrgModules } = useAuth();
  const navigate = useNavigate();
  const { data: organizations, isLoading } = useOrganizations();
  const { setCurrentOrgId } = useSessionStore();

  if (isLoading) {
    return <div>Loading organizations...</div>;
  }

  return (
    <div className="min-h-screen mb-0 pb-0 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-2 ">
          <h2 className="text-3xl font-bold text-gray-800"></h2>
          <button
            onClick={() => navigate("/organisation/add")}
            className="flex  items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
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
                  <div className="flex gap-2">
                    {/* ✅ DOWNLOAD BUTTON */}
                    <button
                      onClick={async () => {
                        try {
                          const fullOrg = await getOrganization(org.id);
                          exportOrganisationExcel(fullOrg);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors"
                      title="Download Excel"
                    >
                      <Download className="text-green-600" size={22} />
                    </button>

                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => navigate(`/organisation/edit/${org.id}`)}
                      className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors"
                    >
                      <Edit className="text-amber-600" size={24} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Active Modules
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {org.modules_data?.length ? (
                      org.modules_data
                        .filter((m) => m.is_enabled && m.module !== "HRMS")
                        .map((m) => (
                          <span
                            key={m.module}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200"
                          >
                            {m.module}
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
                    setCurrentOrgId(org.id);
                    setOrgModules(org.modules_data || []);
                    const firstModule = org.modules_data.find(
                      (m) => m.is_enabled,
                    )?.module;
                    if (firstModule) {
                      navigate(`/${firstModule.toLowerCase()}`);
                    } else {
                      navigate(`/organisation/${encodeURIComponent(org.id)}`);
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
    </div>
  );
}

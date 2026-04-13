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
  Trash2,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { useOrganizations } from "../queries/useOrganizations";
import useSessionStore from "../store/sessionStore";
import { getOrganization } from "../api/organizations";
import { exportOrganisationExcel } from "../utils/exportOrganisationExcel";
import { getAllDraftOrganizations } from "../utils/savedForms";
import { Divider } from "antd";
const FY_OPTIONS = ["2025-26", "2024-25", "2023-24"];
export default function OrganizationList() {
  const { user, setOrgModules } = useAuth();
  const navigate = useNavigate();
  const { data: organizations, isLoading } = useOrganizations();
  const { setCurrentOrgId } = useSessionStore();

  if (isLoading) {
    return <div>Loading organizations...</div>;
  }

  const handleDownload = async (orgId) => {
    try {
      const fullOrg = await getOrganization(orgId);
      exportOrganisationExcel(fullOrg);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (orgId) => {
    navigate(`/organisation/edit/${orgId}`);
  };

  const handleOpen = (org) => {
    setCurrentOrgId(org.id);
    setOrgModules(org.modules_data || []);
    const firstModule = org.modules_data.find((m) => m.is_enabled)?.module;
    if (firstModule) {
      navigate(`/${firstModule.toLowerCase()}`);
    } else {
      navigate(`/organisation/${encodeURIComponent(org.id)}`);
    }
  };

  const handleDraftEdit = (draftFormId) => {
    navigate(`/organisation/add?draft=${draftFormId}`);
  };

  const handleDraftDelete = (draftFormId) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      localStorage.removeItem(`form-${draftFormId}`);
      setCurrentOrgId((prev) => prev); // Trigger re-render
    }
  };

  const draftOrganizations = getAllDraftOrganizations();

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

        {draftOrganizations.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {draftOrganizations?.map((org, index) => (
                <OrganizationCard
                  key={org.id}
                  org={org}
                  isDraft={true}
                  onEdit={handleDraftEdit}
                  onDelete={handleDraftDelete}
                />
              ))}
            </div>
            <Divider className="my-8" />
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations?.map((org, index) => (
            <OrganizationCard
              key={org.id}
              org={org}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const OrganizationCard = ({
  org,
  isDraft,
  onDownload,
  onEdit,
  onOpen,
  onDelete,
}) => {
  const [selectedFY, setSelectedFY] = useState("2024-25");
  const [fyOpen, setFyOpen] = useState(false);
  const headerStyles = isDraft
    ? "bg-gradient-to-r from-gray-400 to-gray-600 h-2"
    : "bg-gradient-to-r from-amber-500 to-orange-500 h-2";

  return (
    <div
      key={org.id}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
    >
      <div className={headerStyles}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-800 mb-1">
              {org.registered_name}
            </h3>
            <p className="text-xs text-gray-400 font-mono">ID: {org.id}</p>
          </div>
          {isDraft ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(org.id)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Edit className="text-gray-600" size={24} />
                </button>
                <button
                  onClick={() => onDelete(org.id)}
                  className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="text-red-600" size={24} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                {/* ✅ DOWNLOAD BUTTON */}
                <button
                  onClick={() => onDownload(org.id)}
                  className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors cursor-pointer"
                  title="Download Excel"
                >
                  <Download className="text-green-600" size={22} />
                </button>

                {/* EDIT BUTTON */}
                <button
                  onClick={() => onEdit(org.id)}
                  className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  <Edit className="text-amber-600" size={24} />
                </button>
              </div>
            </>
          )}
        </div>

        {!isDraft && (
          <>
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
            {/* ✅ NEW: Financial Year Selector */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <CalendarDays size={14} className="text-amber-500" />
                Financial Year
              </p>
              <div className="relative">
                <button
                  onClick={() => setFyOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm font-semibold text-amber-700 transition-colors cursor-pointer"
                >
                  <span>FY {selectedFY}</span>
                  <ChevronDown
                    size={15}
                    className={`text-amber-500 transition-transform duration-200 ${fyOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {fyOpen && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {FY_OPTIONS.map((fy) => (
                      <button
                        key={fy}
                        onClick={() => {
                          setSelectedFY(fy);
                          setFyOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between
                          ${
                            fy === selectedFY
                              ? "bg-amber-50 text-amber-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50 font-normal"
                          }`}
                      >
                        FY {fy}
                        {fy === selectedFY && (
                          <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px]">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onOpen(org)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all group-hover:shadow-md"
            >
              Open Dashboard
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

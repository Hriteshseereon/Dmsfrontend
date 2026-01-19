import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OrganizationDashboard() {
  const { orgId } = useParams();
  const { user, organisations } = useAuth();
  const navigate = useNavigate();

  // find org (admin navigates here)
  const org = organisations.find((o) => String(o.id) === String(orgId));

  // if admin page but org not found
  if (user?.role === "admin" && !org) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Organization not found</h1>
        <p className="mt-2">Check the organizations listing.</p>
      </div>
    );
  }

  // if normal user (not admin), show their org
  if (user?.role !== "admin") {
    const myOrg = organisations.find((o) => String(o.id) === String(user?.org));
    // but in AuthContext we set organisations empty for non-admins; so fallback:
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Your Organization</h1>
        <p className="mt-2">Org: {user?.org}</p>
        <div className="mt-4">
          <strong>Modules:</strong>
          <div className="mt-2">
            {/* you can reuse org.modules rendering if you want */}
          </div>
        </div>
      </div>
    );
  }

  // Admin view for a found org
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <nav className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">{org?.name} — Dashboard</h1>
            <p className="text-sm text-gray-600">Org ID: {org?.id}</p>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {org?.modules?.length ? (
            org.modules.map((m) => (
              <div key={m} className="bg-white rounded-lg p-4 shadow border">
                <h3 className="font-bold">{m}</h3>
                <p className="text-sm text-gray-500 mb-3">Open {m} module</p>
                <div>
                  <button
                    onClick={() => navigate(`/${m.toLowerCase()}`)}
                    className="px-3 py-2 bg-amber-500 text-white rounded"
                  >
                    Go to {m}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-white rounded shadow">
              No modules for this org.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

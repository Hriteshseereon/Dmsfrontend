import { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getAllRoles,
  getDmsRoutes,
  getPermissionsStore,
  upsertRolePermissions,
} from "../../../utils/permissions";
import {
  addCustomUser,
  getCustomUsers,
} from "../../../utils/customUsers";

export default function RoleAccess() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [roleName, setRoleName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState(null);

  const dmsRoutes = useMemo(() => getDmsRoutes(), []);
  const roles = useMemo(() => getAllRoles(), [refreshKey]);
  const store = useMemo(() => getPermissionsStore(), [refreshKey]);
  const customUsers = useMemo(() => getCustomUsers(), [refreshKey]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const onSave = (e) => {
    e.preventDefault();
    setStatus(null);

    const trimmedRole = roleName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedRole) {
      setStatus({ type: "error", message: "Role name is required." });
      return;
    }
    if (!trimmedEmail) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }
    if (!trimmedPassword) {
      setStatus({ type: "error", message: "Password is required." });
      return;
    }
    if (selected.length === 0) {
      setStatus({
        type: "error",
        message: "Select at least one DMS route to grant access.",
      });
      return;
    }

    try {
      upsertRolePermissions(trimmedRole, selected);
      addCustomUser({
        name: fullName.trim(),
        email: trimmedEmail,
        password: trimmedPassword,
        role: trimmedRole,
        modules: ["DMS"],
      });
      setStatus({
        type: "success",
        message: "Role and user created successfully.",
      });
      setRoleName("");
      setFullName("");
      setEmail("");
      setPassword("");
      setSelected([]);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Failed to save." });
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-4 rounded shadow">
        You do not have permission to manage roles.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-6">
      <h3 className="font-semibold text-lg">🔐 Role Access Management (DMS)</h3>

      <form onSubmit={onSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Role name</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. dms_viewer"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="User full name"
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a password"
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            DMS route access
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {dmsRoutes.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-2 border rounded px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggle(r.id)}
                />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Only DMS routes can be granted here. Other modules are not affected.
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save role
        </button>
      </form>

      {status && (
        <div
          className={`rounded border px-4 py-2 text-sm ${
            status.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Existing roles</h4>
        {roles.length === 0 ? (
          <div className="text-sm text-gray-600">No roles created yet.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[480px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2">DMS access</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r} className="border-t">
                    <td className="py-2 pr-4 font-mono">{r}</td>
                    <td className="py-2">
                      {(store[r]?.dms || []).length === 0
                        ? "—"
                        : (store[r]?.dms || []).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Provisioned users</h4>
        {customUsers.length === 0 ? (
          <div className="text-sm text-gray-600">
            No custom users created yet.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[520px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2">Modules</th>
                </tr>
              </thead>
              <tbody>
                {customUsers.map((u) => (
                  <tr key={u.email} className="border-t">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4 font-mono">{u.email}</td>
                    <td className="py-2 pr-4 font-mono">{u.role}</td>
                    <td className="py-2">{u.modules.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

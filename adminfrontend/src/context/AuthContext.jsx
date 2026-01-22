import { createContext, useState, useContext, useEffect } from "react";
import users from "../data/users.json";
import orgs from "../data/organisations.json";
import { login as authLogin } from "../api/authService";
import modules from "../data/modules.json";
import { getCustomUsers } from "../utils/customUsers";
import TokenStore from "../utils/tokenStore";
import useSessionStore from "../store/sessionStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const user = useSessionStore((s) => s.user);
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [orgModules, setOrgModules] = useState([]);
  const [organisations, setOrganisations] = useState([]);

  // helper: normalize org lookup (org.id may be string)
  const findOrgByIdOrName = (idOrName) =>
    orgs.find(
      (o) =>
        String(o.id).toLowerCase() === String(idOrName).toLowerCase() ||
        o.name.toLowerCase() === String(idOrName).toLowerCase(),
    );

  useEffect(() => {
    if (!user) return;

    if (user.is_super_admin || user.admin) {
      setOrgModules(modules.map((m) => m.id));
      setOrganisations(orgs);
    } else if (user.org) {
      const org = findOrgByIdOrName(user.org);
      setOrgModules(org?.modules || []);
      setOrganisations([]);
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const authResponse = await authLogin(username, password);
      const { access, refresh, ...userData } = authResponse;
      setSession({
        accessToken: authResponse.access,
        refreshToken: authResponse.refresh,
        user: {
          ...userData,
        },
        currentOrgId: userData.organisation_id,
      });
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed";
      throw new Error(message);
    }
  };
  const isAdmin = user?.role === "admin";
  const logout = () => {
    clearSession();
    window.location.reload();
  };

  const hasModuleAccess = (module) => {
    return orgModules.includes(module);
  };
  // create a isadmin for check the role of the user as admin
  const hasSubmoduleAccess = (module, submodule) => {
    const modulePermission = user?.permissions.find((p) => p.module === module);
    return modulePermission?.submodues.hasOwnProperty(submodule);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        orgModules,
        isAdmin,
        organisations,
        setOrgModules,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

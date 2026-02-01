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
  const [accessToken, setAccessToken] = useState(null);

  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  const setCurrentOrgId = useSessionStore((s) => s.setCurrentOrgId);



  // helper: normalize org lookup (org.id may be string)
  const findOrgByIdOrName = (idOrName) =>
    orgs.find(
      (o) =>
        String(o.id).toLowerCase() === String(idOrName).toLowerCase() ||
        o.name.toLowerCase() === String(idOrName).toLowerCase(),
    );

  useEffect(() => {
    if (!user) return;

    if (user.is_super_admin || user.is_admin) {
      setOrgModules(modules.map((m) => m.id));
      setOrganisations(orgs);
    } else if (user.org) {
      const org = findOrgByIdOrName(user.org);
      setOrgModules(org?.modules_data || []);
      setOrganisations([]);
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const authResponse = await authLogin(username, password);

      const {
        access,
        refresh,
        organisation_id,
        is_super_admin,
        is_admin,
        ...rest
      } = authResponse;

      const userPayload = {
        ...rest,
        is_super_admin,
        is_admin,
        role: is_super_admin || is_admin ? "admin" : "user",
      };

      setSession({
        accessToken: access,
        refreshToken: refresh,
        user: userPayload,
        currentOrgId: organisation_id,
      });

      setCurrentOrgId(organisation_id);

    } catch (err) {
      const message = err.response?.data?.detail || "Login failed";
      throw new Error(message);
    }
  };

  const isAdmin = user?.role === "admin";

  const logout = () => {
    // setUser(null);
    // setOrgModules([]);
    // setOrganisations([]);
    clearSession();
    localStorage.removeItem("currentOrgId");
    window.location.reload();
  };

  const hasModuleAccess = (module) => {
    return orgModules.includes(module);
  };
  // create a isadmin for check the role of the user as admin
  const hasSubmoduleAccess = (module, submodule) => {
    const modulePermission = user?.permissions.find((p) => p.module === module);
    return modulePermission?.submodules?.hasOwnProperty(submodule);
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
        currentOrgId,
        setCurrentOrgId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

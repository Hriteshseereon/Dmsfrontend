import { createContext, useState, useContext } from "react";
import users from "../data/users.json";
import orgs from "../data/organisations.json";
import modules from "../data/modules.json";
import { getCustomUsers } from "../utils/customUsers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orgModules, setOrgModules] = useState([]);
  const [organisations, setOrganisations] = useState([]);

  // helper: normalize org lookup (org.id may be string)
  const findOrgByIdOrName = (idOrName) =>
    orgs.find(
      (o) =>
        String(o.id).toLowerCase() === String(idOrName).toLowerCase() ||
        o.name.toLowerCase() === String(idOrName).toLowerCase()
    );
  // const login = (email, password) => {
  //   const combinedUsers = [...users, ...getCustomUsers()];

  //   const found = combinedUsers.find(
  //     (u) => u.email === email && u.password === password
  //   );
  //   if (found) {
  //     setUser(found);
  //     if (found.role === "admin") {
  //       setOrgModules(modules.map((m) => m.id));
  //       setOrganisations(orgs);
  //     } else if (found.modules) {
  //       setOrgModules(found.modules);
  //     } else {
  //       const org = orgs.find((o) => o.id === found.org);
  //       setOrgModules(org?.modules || []);
  //     }
  //     return true;
  //   }
  //   return false;
  // };
  const login = (email, password) => {
    const combinedUsers = [...users, ...getCustomUsers()];

    const found = combinedUsers.find(
      (u) =>
        u.email?.toLowerCase() === email?.toLowerCase() &&
        u.password === password
    );

    if (!found) return false;

    setUser(found);

    if (found.role === "admin") {
      setOrganisations(orgs);
    } else {
      // if user has explicit modules array (rare)
      if (found.modules && Array.isArray(found.modules)) {
        setOrgModules(found.modules);
      } else if (found.org) {
        // lookup organization by id/name from organisations.json
        const org = findOrgByIdOrName(found.org);
        setOrgModules(org?.modules || []);
      } else {
        setOrgModules([]);
      }
      setOrganisations([]); // non-admins don't need full org list
    }

    return true;
  };
  const isAdmin = user?.role === "admin";
  const logout = () => {
    setUser(null);
    setOrgModules([]);
    setOrganisations([]);
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
      value={{ user, login, logout, orgModules, isAdmin, organisations, setOrgModules }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

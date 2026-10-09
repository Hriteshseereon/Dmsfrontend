import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { login as authLogin, getMyPermissions } from "../api/authService";
import useSessionStore from "../store/sessionStore";
import {
  hasPermission as checkHasPermission,
  hasModuleAccess as checkHasModuleAccess,
  buildFullPermissions,
} from "../utils/permissions";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const user = useSessionStore((s) => s.user);
  const accessToken = useSessionStore((s) => s.accessToken);
  const setSession = useSessionStore((s) => s.setSession);
  const setUser = useSessionStore((s) => s.setUser);
  const clearSession = useSessionStore((s) => s.clearSession);

  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  const setCurrentOrgId = useSessionStore((s) => s.setCurrentOrgId);
  const orgModules = useSessionStore((s) => s.orgModules);
  const setOrgModules = useSessionStore((s) => s.setOrgModules);

  const [isValidating, setIsValidating] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const isAdmin = Boolean(
    user?.is_admin ||
      user?.is_super_admin ||
      user?.rolePreset === "admin" ||
      user?.role === "admin"
  );

  /**
   * Sync user permissions and validity from GET /users/me/permissions/
   */
  const fetchMyPermissions = useCallback(async () => {
    try {
      setIsValidating(true);
      const res = await getMyPermissions();
      const data = res?.data || res;

      if (data) {
        // Check validity status
        if (data.isValid === false || data.isActive === false) {
          setSessionExpired(true);
        }

        const isUserAdmin =
          data.rolePreset === "admin" ||
          user?.is_admin ||
          user?.is_super_admin ||
          user?.role === "admin";

        // Admin automatically gets all permissions across 47 submodules
        const effectivePermissions = isUserAdmin
          ? buildFullPermissions()
          : data.permissions || user?.permissions || {};

        const updatedUser = {
          ...user,
          ...data,
          user_id: data.userId || user?.user_id,
          username: data.userName || user?.username,
          userName: data.userName || user?.userName,
          rolePreset: data.rolePreset || user?.rolePreset || (isUserAdmin ? "admin" : "custom"),
          role: isUserAdmin ? "admin" : "user",
          is_admin: isUserAdmin,
          is_super_admin: Boolean(user?.is_super_admin),
          permissions: effectivePermissions,
          permissionsSummary: data.permissionsSummary || user?.permissionsSummary,
          privilegeType: data.privilegeType || user?.privilegeType || "Permanent",
          startDate: data.startDate || user?.startDate || null,
          endDate: data.endDate || user?.endDate || null,
          isValid: data.isValid !== false,
          isActive: data.isActive !== false,
        };

        setUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.warn("Could not fetch user permissions on mount:", err.message);
      if (err.response?.status === 403 && err.response?.data?.detail?.includes("expired")) {
        setSessionExpired(true);
      }
    } finally {
      setIsValidating(false);
    }
  }, [user, setUser]);

  /**
   * User Login Flow
   */
  const login = async (username, password) => {
    try {
      const authResponse = await authLogin(username, password);

      const {
        access,
        refresh,
        organisation_id,
        organisation_name,
        is_super_admin,
        is_admin,
        user_id,
        permissions,
        ...rest
      } = authResponse;

      const isUserAdmin = Boolean(is_super_admin || is_admin);

      // Admin automatically gets all 47 submodules
      const effectivePermissions = isUserAdmin
        ? buildFullPermissions()
        : permissions || {};

      const initialUser = {
        ...rest,
        user_id,
        userId: user_id,
        is_super_admin: Boolean(is_super_admin),
        is_admin: isUserAdmin,
        role: isUserAdmin ? "admin" : "user",
        rolePreset: isUserAdmin ? "admin" : "custom",
        organisation_id,
        organisation_name,
        permissions: effectivePermissions,
        isValid: true,
        isActive: true,
      };

      setSession({
        accessToken: access,
        refreshToken: refresh,
        user: initialUser,
        currentOrgId: organisation_id,
      });

      setCurrentOrgId(organisation_id);

      // Immediately enrich with /users/me/permissions/ profile details
      try {
        const permRes = await getMyPermissions();
        const permData = permRes?.data || permRes;
        if (permData) {
          if (permData.isValid === false) {
            throw new Error("User account privilege has expired or is restricted.");
          }
          const enrichedUser = {
            ...initialUser,
            ...permData,
            user_id: permData.userId || user_id,
            userName: permData.userName || initialUser.username,
            permissions: isUserAdmin
              ? buildFullPermissions()
              : permData.permissions || effectivePermissions,
          };
          setUser(enrichedUser);
        }
      } catch (permErr) {
        // If /users/me/permissions fails, we still have initial login permissions
        console.warn("Permissions enrichment note:", permErr.message);
      }

      setSessionExpired(false);
      return initialUser;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please verify credentials.";
      throw new Error(message);
    }
  };

  /**
   * User Logout
   */
  const logout = () => {
    clearSession();
    setSessionExpired(false);
    window.location.replace("/");
  };

  /**
   * Submodule & Module permission checking helpers
   */
  const hasPermission = useCallback(
    (submoduleKey, action = "view") => {
      return checkHasPermission(user?.permissions, submoduleKey, action, isAdmin);
    },
    [user?.permissions, isAdmin]
  );

  const hasModuleAccess = useCallback(
    (moduleKey) => {
      return checkHasModuleAccess(user?.permissions, moduleKey, isAdmin);
    },
    [user?.permissions, isAdmin]
  );

  // Sync permissions on initial mount if logged in
  useEffect(() => {
    if (accessToken) {
      fetchMyPermissions();
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        fetchMyPermissions,
        hasPermission,
        hasModuleAccess,
        isAdmin,
        isValidating,
        sessionExpired,
        setSessionExpired,
        orgModules,
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

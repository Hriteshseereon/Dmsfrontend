import React, { createContext, useContext, useState, useEffect } from "react";
import usersData from "../data/user.json";

import { signup as apiSignup, login as apiLogin } from "../api/authService";
import useSessionStore from "../store/sessionStore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { setSession, clearSession, user } = useSessionStore();
  const [currentUser, setCurrentUser] = useState(user);
  const [users, setUsers] = useState(usersData);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // LOGIN
  const login = async ({ email, password }) => {
    try {
      const response = await apiLogin(email, password);

      const userData = response.user || { email: response.email || email, ...response };
      const accessToken = response.access || response.token || response.accessToken;
      const refreshToken = response.refresh || response.refreshToken;
      const orgId = response.organisation_id || response.org_id || response.currentOrgId;

      setSession({
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: userData,
        currentOrgId: orgId,
      });

      setCurrentUser(userData);
      return { success: true, message: "Login successful", data: response };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.detail || error.message || "Login failed";
      return { success: false, message: errorMessage };
    }
  };

  // SIGNUP
  const signup = async (userData) => {
    try {
      const response = await apiSignup(userData);
      // Depending on your API response structure, you might need to adjust this
      // Assuming the API returns something successful
      return { success: true, message: "Signup successful! Wait for admin approval.", data: response };
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Signup failed";
      return { success: false, message: errorMessage };
    }
  };


  // LOGOUT
  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const approveUser = (email) => {
    setUsers(users.map(u => u.email === email ? { ...u, status: "approved" } : u));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, approveUser }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState } from "react";
import usersData from "../data/user.json";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(usersData);

  // LOGIN
  const login = ({ email, password }) => {
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return { success: false, message: "Invalid credentials" };
    }
    if (user.status !== "approved") {
      return { success: false, message: "Your account is not approved yet" };
    }
    setCurrentUser(user);
    return { success: true, message: "Login successful" };
  };

  // SIGNUP
  const signup = ({ name, email, password }) => {
    if (users.find(u => u.email === email)) {
      return { success: false, message: "User already exists" };
    }
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      status: "pending", 
    };
    setUsers([...users, newUser]);
    return { success: true, message: "Signup successful! Wait for admin approval." };
  };

  // LOGOUT
  const logout = () => setCurrentUser(null);

  const approveUser = (email) => {
    setUsers(users.map(u => u.email === email ? { ...u, status: "approved" } : u));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, approveUser }}>
      {children}
    </AuthContext.Provider>
  );
};

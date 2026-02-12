import api from "./axios";

export const login = async (email, password) => {
    const res = await api.post("/customers/auth/login/", { email, password });
    return res.data;
};

export const signup = async (userData) => {
    const res = await api.post("/customers/auth/signup/", userData);
    return res.data;
};

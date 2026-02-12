import api from "./axios";

export const signup = async (userData) => {
    const res = await api.post("/customers/auth/signup/", userData);
    return res.data;
};

import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const addAdminCustomer = async (payload) => {
    const { currentOrgId } = useSessionStore.getState();
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
    });

    const res = await api.post("/customers/admin/add-customer/", formData, {
        params: { organisation: currentOrgId },
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const getAdminCustomers = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/customers/customers/", {
        params: { organisation: currentOrgId },
    });
    return res.data;
};

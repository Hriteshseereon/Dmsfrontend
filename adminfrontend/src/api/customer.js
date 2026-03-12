import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const addAdminCustomer = async (formData) => {
    const { currentOrgId } = useSessionStore.getState();

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

export const getAllAdminCustomers = async () => {
    const res = await api.get("/customers/admin/customers/all/");
    return res.data;
};

export const getAdminCustomerDetails = async (customerId) => {
    const res = await api.get(`/customers/admin/customers/${customerId}/details/`);
    return res.data;
};

export const assignAdminCustomerOrganisations = async (customerId, payload) => {
    const res = await api.post(`/customers/admin/customers/${customerId}/assign-organisations/`, payload);
    return res.data;
};

export const updateAdminCustomer = async (customerId, formData) => {
    const { currentOrgId } = useSessionStore.getState();
   

    const res = await api.patch(`/customers/admin/customers/${customerId}/edit/`, formData, {
        params: { organisation: currentOrgId },
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};


// mail sending api 
export const sendCustomerCredential = async (payload) => {
    const res = await api.post('/api/send-credentials/',payload)
    return res;
}
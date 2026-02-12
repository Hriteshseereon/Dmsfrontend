import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const getContracts = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/sales/customer/contracts/", {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getContractById = async (contractId) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get(`/sales/customer/contracts/${contractId}/`, {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const createContract = async (contractData) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.post("/sales/customer/contracts/", contractData, {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const updateContract = async (contractId, contractData) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.put(`/sales/customer/contracts/${contractId}/`, contractData, {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getVendors = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/sales/customer/vendors/", {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getProductsByVendor = async (vendorId) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get(`/sales/customer/vendors/${vendorId}/items/`, {
        params: {
            organisation: currentOrgId
        }
    });
    return res.data;
};

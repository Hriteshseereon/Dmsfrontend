import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const getContracts = async () => {
    const res = await api.get("/sales/customer/contracts/");
    return res.data;
};

export const createContract = async (contractData) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.post("/sales/customer/contracts/", contractData, {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getVendors = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/vendors/vendors/", {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getProductsByVendor = async (vendorId) => {
    const res = await api.get(`/product/products/by-vendor`, {
        params: { vendor: vendorId }
    });
    return res.data;
};

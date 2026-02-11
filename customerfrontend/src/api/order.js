import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const getOrders = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/sales/customer/orders/", {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getContracts = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/sales/customer/contracts/", {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const getContractById = async (id) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get(`/sales/customer/contracts/${id}/`, {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

export const createOrder = async (orderData) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.post("/sales/customers/orders/", orderData, {
        params: { organisation: currentOrgId }
    });
    return res.data;
};

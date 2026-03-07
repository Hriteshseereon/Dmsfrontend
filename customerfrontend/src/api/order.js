
// ------------------------------------------------ sales order api section ------------------------------------------------
import api from "./axios";
import useSessionStore from "../store/sessionStore";
export const getAllSalesContracts = async () => {
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

export const salesContractItems = async (contractId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/contracts/${contractId}/items/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const createSalesOrder = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post(`/sales/customer/orders/`, payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const getSalesOrders = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/sales/customer/orders/", {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const getSalesOrderById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/customer/orders/${id}/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const updateSalesOrder = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(`/sales/customer/orders/${id}/`, payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}


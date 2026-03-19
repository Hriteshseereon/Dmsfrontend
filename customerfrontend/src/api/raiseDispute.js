
import api from "./axios";
import useSessionStore from "../store/sessionStore";
//Sale Disputes API

export const getRiseDisputes = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/sales/customer/dispute/invoices/", {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getSaleDisputeById = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/customer/disputes/preview/`, {
    params: { organisation: currentOrgId  ,sale_invoice_id: invoiceId },
  });
  return res.data;
};

export const createSaleDispute = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/sales/customer/disputes/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};


 
export const getDisputeById = async (disputeId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/customer/disputes/${disputeId}/`, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};
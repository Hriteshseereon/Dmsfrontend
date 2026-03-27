import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const getWalletData = async () => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/customers/my-credit/summary/", {
    params: { organisation_id: currentOrgId },
  });

  return res.data;
};


export const getCustomerLedger = async (customer_id) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/customers/my-credit/ledger/", {
    params: {
      organisation_id: currentOrgId,
      customer_id,
    },
  });

  return res.data;
};
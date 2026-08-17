import api from "./axios";
import useSessionStore from "../store/sessionStore";

export const getAllFreightRates = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/transport/freight-masters/", {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const addFreightRate = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/transport/freight-masters/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const updateFreightRate = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/transport/freight-masters/${id}/`, payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const deleteFreightRate = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.delete(`/transport/freight-masters/${id}/`, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

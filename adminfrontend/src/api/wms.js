import api from "./axios";
import useSessionStore from "../store/sessionStore";
// WMS API 
// stoks related api
export const createWms = async (data) => {
    const {currentOrgId} = useSessionStore.getState();
  const res = await api.post("/wealth/wealth-entries/", data , {params: {organisation: currentOrgId}});
  return res.data;
};
export const getWms = async () => {
    const {currentOrgId} = useSessionStore.getState();
  const res = await api.get("wealth/wealth-entries/", {params: {organisation: currentOrgId}});
  return res.data;
};
export const updateWms = async (id, data) => {
    const {currentOrgId} = useSessionStore.getState();
  const res = await api.put(`/wealth/wealth-entries/${id}/`, data , {params: {organisation: currentOrgId}});
  return res.data;
}
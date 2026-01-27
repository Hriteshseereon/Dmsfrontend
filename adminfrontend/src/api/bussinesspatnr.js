import api from "./axios";
import useSessionStore from "../store/sessionStore";
// BUSINESS PARTNER CATEGORIES
// add vendor partner details
export const addvendor = async (data) => {
    const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/vendors/vendors/", data ,{params: {organisation: currentOrgId}});
  return res.data;
}

// get vendor partner details
export const getVendors = async () => {
    const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/vendors/", {params: {organisation: currentOrgId}});
  return res.data;
}
//  update vendor partner details
export const updateVendor = async (id, data) => {   
    const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/vendors/vendors/${id}/`, data, {params: {organisation: currentOrgId}});
  return res.data;
}
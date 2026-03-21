import api from "./axios";

import useSessionStore from "../store/sessionStrore";
//  orderAssign
//fetch all Assigned order
export const getAllAssignedOrder = async () => {
  const res = await api.get("/transport/portal/assignments/");
  return res.data;
}

//fetch assigned order by id
export const getAssignedOrderById = async (assignedId) => {
  const res = await api.get(`/transport/portal/assignments/${assignedId}/`);
  return res.data;
}

 //update assigned order
export const updateAssignedOrder = async (assignedId, payload) => {
   const currentOrgId = useSessionStore.getState().currentOrgId;
 
  const res = await api.patch(`/transport/assignments/${assignedId}/vehicle-details/`,payload, {
     params: { organisation: currentOrgId }
  });
  return res.data;
};
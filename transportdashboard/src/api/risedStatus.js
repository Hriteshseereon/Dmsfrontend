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
  const res = await api.get(`/transport/assignments/${assignedId}/`);
  return res.data;
}

 //update assigned order
export const updateAssignedOrder = async (assignedId, payload) => {
  const res = await api.patch(`/transport/portal/assignments/${assignedId}/update_vehicle/`,payload, {
  });
  return res.data;
};
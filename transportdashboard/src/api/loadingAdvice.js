import api from "./axios";

import useSessionStore from "../store/sessionStrore";
//  orderAssign
//fetch all loading advice
export const getLoadingAdvice = async () => {
  const res = await api.get("/transport/portal/loading-advices/");
  return res.data;
}
//fetch Loading Advice order by id
export const getLoadingAdviceById = async (loadingdId) => {
  const res = await api.get(`/transport/portal/loading-advices/${loadingdId}/`);
  return res.data;
}

 //update assigned order
export const updateLoadingAdvice = async (loadingAdviceId, payload) => {
  const res = await api.patch(`/transport/portal/loading-advices/${loadingAdviceId}/reached_plant/`,payload, {
  });
  return res.data;
};
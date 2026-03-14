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
  const currentOrgId = useSessionStore.getState().currentOrgId;
 
  const res = await api.patch(`/transport/loading-advices/${loadingAdviceId}/`,payload, {
     params: { organisation: currentOrgId }
  });
  return res.data;
};
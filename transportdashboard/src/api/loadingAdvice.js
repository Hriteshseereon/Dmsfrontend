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

//download loading advice pdf
export const downloadLoadingAdvicePDF = async (loadingAdviceId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    `/transport/loading-advices/${loadingAdviceId}/print-details/`,
    {
      params: { organisation: currentOrgId },
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: "application/pdf" })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = `loading_advice_${loadingAdviceId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

//print loading advice
export const printLoadingAdvice = async (loadingAdviceId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    `/transport/loading-advices/${loadingAdviceId}/print-details/`,
    {
      params: { organisation: currentOrgId },
      responseType: "blob",
    }
  );

  const file = new Blob([res.data], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(file);

  const newWindow = window.open(fileURL);
  newWindow.onload = () => {
    newWindow.print();
  };
};
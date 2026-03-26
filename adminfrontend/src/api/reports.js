import api from "./axios";
import useSessionStore from "../store/sessionStore";


export const getAllReport = async () => {
   const res = await api.get(`/reports/common-report/`, {
  });
  return res.data;
};

export const getCommonReport = async ({ type }) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/reports/common-report/`, {
    params: {
      organisation: currentOrgId,
      type: type, 
    },
  });

  return res.data;
};

export const getDashboardData = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/reports/dashboard/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data.data; // directly return "data"
};

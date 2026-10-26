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

export const getAveragePendingContractReport = async (filters = {}) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const params = {
    organisation: currentOrgId,
    ...filters,
  };

  // Strip empty/null filter entries
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null || params[key] === "") {
      delete params[key];
    }
  });

  try {
    const res = await api.get(`/reports/average-pending-contract-report/`, {
      params,
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallbackRes = await api.get(`/reports/average-pending-contracts/`, {
        params,
      });
      return fallbackRes.data;
    }
    throw err;
  }
};


import api from "./axios";

import useSessionStore from "../store/sessionStore";

//Dashboard
export const getDashboardData = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
    const res = await api.get(`/customers/dashboard/`, {
    params: {
        organisation: currentOrgId,
    },
  });
  return res.data;
};
//Profile Settings
export const getProfileData = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/customers/profile/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data; 
};
//update profile settings
export const updateProfileData = async (profileData) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
    const res = await api.put(`/customers/profile/`, profileData, {
    params: {
        organisation: currentOrgId,
    },
  });
  return res.data;
};
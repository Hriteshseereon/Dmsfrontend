import api from "./axios";
import useSessionStore from "../store/sessionStrore";

//Profile Settings
export const getProfileData = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
    const res = await api.get(`/transport/profile/update/`, {
    params: {
        organisation: currentOrgId,
    },
  });
  return res.data; 
};
//update profile settings
export const updateProfileData = async (profileData) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
    const res = await api.put(`/transport/profile/update/`, profileData, {
    params: {
        organisation: currentOrgId,
    },
  });
  return res.data;
};
//dashboard
export const getDashboardData = async () => {
    const currentOrgId = useSessionStore.getState().currentOrgId;
    const res = await api.get(`/transport/dashboard/${currentOrgId}`, {
    });
    return res.data;
};

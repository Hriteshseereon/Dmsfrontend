import api from "./axios";

import useSessionStore from "../store/sessionStrore";

//dashboard
export const getDashboardData = async () => {
    const currentOrgId = useSessionStore.getState().currentOrgId;

    const res = await api.get(`/transport/dashboard/${currentOrgId}`, {

    });

    return res.data;
};

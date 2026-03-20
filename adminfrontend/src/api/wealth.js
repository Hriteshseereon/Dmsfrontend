import api from "./axios";
import useSessionStore from "../store/sessionStore";

// Add Wealth Entry
export const addWealthEntry = async (payload) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.post("/wealth/wealth-entries/", payload, {
        params: {
            organisation: currentOrgId,
        },
    });
    return res.data;
};

// Get Wealth Entries
export const getWealthEntries = async (params = {}) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/wealth/wealth-entries/", {
        params: {
            organisation: currentOrgId,
            ...params,
        },
    });
    return res.data;
};


// Get Wealth Entry by ID
export const getWealthEntryById = async (id) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get(`/wealth/wealth-entries/${id}/`, {
        params: {
            organisation: currentOrgId,
        },
    });
    return res.data;
};

// Update Wealth Entry
export const updateWealthEntry = async (id, payload) => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.patch(`/wealth/wealth-entries/${id}/`, payload, {
        params: {
            organisation: currentOrgId,
        },
    });
    return res.data;
};

// wealth dashboard api 

export const dashboardData = async () => {
    const {currentOrgId} =  useSessionStore.getState();
    const res =  await api.get('/wealth/dashboard/',{
        params: {
            organisation: currentOrgId,
        },
    }
    )
    return res.data;
}
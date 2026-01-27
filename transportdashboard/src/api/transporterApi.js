import api from "./axios";

// CREATE
export const createTransporter = async (orgId, payload) => {
    const res = await api.post(
        `/transport/transporters/?organisation=${orgId}`,
        payload
    );
    return res.data;
}

// LIST
export const listTransporters = async (orgId) => {
    const res = await api.get(
        `/transport/transporters/?organisation=${orgId}`
    );
    return res.data;
};

// GET BY ID
export const getTransporterById = async (transporterId, orgId) => {
    const res = await api.get(
        `/transport/transporters/${transporterId}/?organisation=${orgId}`
    );
    return res.data;
};

// UPDATE (PATCH)
export const updateTransporter = async (
    transporterId,
    orgId,
    payload
) => {
    const res = await api.patch(
        `/transport/transporters/${transporterId}/?organisation=${orgId}`,
        payload
    );
    return res.data;
};

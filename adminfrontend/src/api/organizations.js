import api from "./axios";

export const getOrganizations = async () => {
    const res = await api.get("/organisation/organisations/");
    return res.data;
}
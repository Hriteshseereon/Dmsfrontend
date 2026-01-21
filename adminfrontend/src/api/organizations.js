import api from "./axios";

export const getOrganizations = async () => {
    const res = await api.get("/organisation/organisations/");
    return res.data;
}

export const createOrganization = async (data) => {
  const res = await api.post("/organisation/organisations/", data);
  return res.data;
};
import api from "./axios";

export const getOrganizations = async () => {
  const res = await api.get("/organisation/organisations/");
  return res.data;
};

export const createOrganization = async (data) => {
  const res = await api.post("/organisation/organisations/", data);
  return res.data;
};

export const updateOrganization = async (id, data) => {
  const res = await api.put(`/organisation/organisations/${id}/`, data);
  return res.data;
};

export const getOrganization = async (id) => {
  const res = await api.get(`/organisation/organisations/${id}/`);
  return res.data;
};

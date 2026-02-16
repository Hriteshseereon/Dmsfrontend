import api from "./axios";

export const getOrganizations = async () => {
  const res = await api.get("/organisation/organisations/");
  return res.data;
};

export const createOrganization = async (data) => {
  const res = await api.post("/organisation/organisations/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateOrganization = async (id, data) => {
  const res = await api.put(`/organisation/organisations/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getOrganization = async (id) => {
  const res = await api.get(`/organisation/organisations/${id}/`);
  return res.data;
};
// this comment is i write for create a backup integeation 
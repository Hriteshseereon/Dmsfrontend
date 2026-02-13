import api from "./axios";

export const getAllpendingTransporters = async () => {
    const res = await api.get("/transport/admin/pending-transporters/");
    return res.data;
}

export const approveTransporter = async (data) => {
    const res = await api.post("/transport/admin/approve-transporter/", data);
    return res.data;
}
export const getOrganizations = async () => {
  const res = await api.get("/organisation/organisations/");
  return res.data;
};
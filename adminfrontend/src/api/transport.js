import api from "./axios";
import useSessionStore from "../store/sessionStore";

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


// taransport add view edit delete in the byssiness patnr

// transport.api.js

export const createTransport = async (formData) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.post(
    `/transport/transporters/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { organisation: currentOrgId },
    }
  );

  return res.data;
};

export const getAllTransport = async () => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(`/transport/transporters/`, {
    params: { organisation: currentOrgId },
  });

  return res.data;
};

export const getTransportById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    `/transport/transporters/${id}/`,
    { params: { organisation: currentOrgId } }
  );

  return res.data;
};

export const updateTransport = async (id, formData) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.patch(
    `/transport/transporters/${id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { organisation: currentOrgId },
    }
  );

  return res.data;
};

// api for sending the credential through mail

export const sendTransportCredential =   async (payload) =>{
  const res = await api.post('/credentials/send-credentials/',payload)
  return res;
}
import api from "./axios";
import useSessionStore from "../store/sessionStore";
// BUSINESS PARTNER CATEGORIES
// add vendor partner details
export const addvendor = async (data) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/vendors/vendors/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const createVendor = async (data) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/vendors/vendors/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: { organisation: currentOrgId }
  });
  return res.data;
}

// get vendor partner details
export const getVendors = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/vendors/", { params: { organisation: currentOrgId } });
  return res.data;
}
//  update vendor partner details
export const updateVendor = async (id, data) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/vendors/vendors/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: { organisation: currentOrgId }
  });
  return res.data;
}
// get vedor details by id
export const getVendorDetailsByid = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/vendors/vendors/${id}/`, { params: { organisation: currentOrgId } });
  return res.data;
}
// working api on create and get the customer api
export const addcustomer = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/customers/full/", payload, { params: { organisation: currentOrgId } });
  return res.data;
}

export const getCustomers = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/customers/", { params: { organisation: currentOrgId } });
  return res.data;
}
const updateCustomer = async (id, data) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/customer/customers/full/${id}/`, data, { params: { organisation: currentOrgId } });
  return res.data;
}


// company group name apis
export const addCompanyGroup = async (data) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/vendors/company-groups/", data, { params: { organisation: currentOrgId } });
  return res.data;
}

export const getCompanyGroups = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/company-groups/", { params: { organisation: currentOrgId } });
  return res.data;
}

export const updateCompanyGroup = async (id, data) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/vendors/company-groups/${id}/`, data, { params: { organisation: currentOrgId } });
  return res.data;
}

export const getCompanyGroupById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/vendors/company-groups/${id}/`, { params: { organisation: currentOrgId } });
  return res.data;
}

// commpany group name   dropdown api
export const getCompanyGroupDropdown = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/company-group-dropdown/", { params: { organisation: currentOrgId } });
  return res.data;
}
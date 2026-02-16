import api from "./axios";
import useSessionStore from "../store/sessionStore";
// add assset category
export const addAssetCategory = async (data) => {
  const res = await api.post("/assets/categories/", data);
  return res.data;
}
export const getAssetCategories = async () => {
  const res = await api.get("/assets/categories/");
  return res.data;
}


// ASSET MASTER

// LIST
export const getAssets = async (orgId) => {
  const res = await api.get(`/assets/assets/?organisation=${orgId}`);
  return res.data;
};
export const getAllAssets = async () => {
  const res = await api.get(`/assets/assets/`);
  return res.data;
};
// CREATE
export const addAsset = async (payload) => {
  const res = await api.post("/assets/assets/", payload);
  return res.data;
};
// get asset by id
export const getAssetById = async (id) => {
  const res = await api.get(`/assets/assets/${id}/`);
  return res.data;
}
// UPDATE
export const updateAsset = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/assets/assets/${id}/`, payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

// DELETE
export const deleteAsset = async (id) => {
  const res = await api.delete(`/assets/${id}/`);
  return res.data;
};


// Asset Allocations
export const getAssetAllocationById = async (id) => {
  const res = await api.get(`/assets/allocations/${id}/`);
  return res.data;
}
// LIST
export const getAssetAllocations = async () => {
  const res = await api.get(
    `/assets/allocations/`
  );
  return res.data;
};

// CREATE
export const addAssetAllocation = async ( payload) => {
  const res = await api.post("/assets/allocations/", payload);
  return res.data;
};

// UPDATE
export const updateAssetAllocation = async (id, payload) => {
  return api.patch(`/assets/allocations/${id}/`, payload);
};


// ASSET MAINTENANCE

// LIST
export const getAssetMaintenances = async () => {
  const res = await api.get(`/assets/maintenance/`);
  return res.data;
};

// get all asset maintenance by 
export const getAssetMaintenanceById = async (id) => {
  const res = await api.get(`/assets/maintenance/${id}/`);
  return res.data;
}
// CREATE
export const addAssetMaintenance = async (payload) => {
  const res = await api.post("/assets/maintenance/", payload);
  return res.data;
};

// UPDATE
export const updateAssetMaintenance = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/assets/maintenance/${id}/`, payload,
   {params: {organisation: currentOrgId}}
  )
  return res.data;
};

// DELETE
export const deleteAssetMaintenance = async (id) => {
  return api.delete(`/assets/maintenance/${id}/`);
};


// ASSET DEPRECIATION

// CREATE
export const addAssetDepreciation = async (payload) => {
  const res = await api.post("/assets/depreciation/", payload);
  return res.data;
};

// LIST
export const getAssetDepreciations = async () => {
  const res = await api.get("/assets/depreciation/");
  return res.data;
};
// get depriciation by id
export const getAssetdepriciationByID = async (id) =>{
  const res = await api.get(`/assets/depreciation/${id}/`)
  return res.data;
} 
// UPDATE
export const updateAssetDepreciation = async (id, payload) => {
    const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/assets/depreciation/${id}/`, payload, {params: {organisation: currentOrgId}});    
  return res.data;
};

// DELETE
export const deleteAssetDepreciation = async (id) => {
  const res = await api.delete(`/assets/depreciation/${id}/`);
  return res.data;
};


// ASSET DISPOSAL

// LIST
export const getAssetDisposals = async () => {
  const res = await api.get(`/assets/disposals/`);
  return res.data;
};

// GET BY IDy
export const getAssetDisposalById = async (id) => {
  const res = await api.get(`/assets/disposals/${id}/`);
  return res.data;
};

// CREATE
export const addAssetDisposal = async (payload) => {
  const res = await api.post("/assets/disposals/", payload);
  return res.data;
};

// UPDATE
export const updateAssetDisposal = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/assets/disposals/${id}/`, payload, {params: {organisation: currentOrgId}});
  return res.data;
};

// DELETE
export const deleteAssetDisposal = async (id) => {
  const res = await api.delete(`/assets/disposals/${id}/`);
  return res.data;
};
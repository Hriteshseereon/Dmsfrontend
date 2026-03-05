import api from "./axios";
import useSessionStore from "../store/sessionStore";
//get all inventory
export const getAllInventory = async () => {
  const response = await api.get("/inventory/inventory/");
  return response.data;
};

//fetch all vendor
export const getAllVendor = async () => {
  const res = await api.get("/vendors/vendors/");
  return res.data;
}

//fetch all Product
export const getproductbyVendor = async (vendorId) => {
  const res = await api.get(`/product/products/by-vendor`, {
    params: { vendor: vendorId }
  });
  return res.data;
}

//add inventory
 
export const addInventory = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post(`/inventory/inventory/`, payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

//inventory get by id 
export const getInventoryById = async (inventoryId) => {
  const res = await api.get(`/inventory/inventory/${inventoryId}/`);
  return res.data;
}
//edit inventory

export const updateInventory = async (inventoryId, payload) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
  const res = await api.put(`/inventory/inventory/${inventoryId}/`,payload, {
    
    params: { organisation: currentOrgId }  
  });

  return res.data;
};
import api from "./axios";

import useSessionStore from "../store/sessionStore";
//  PURCHASE CONTRACTS
//fetch all purchase contracts
export const getPurchaseContract = async () => {
  const res = await api.get("/purchase/contracts/");
  return res.data;
}
//fetch all vendor
export const getAllVendor = async () => {
  const res = await api.get("/vendors/vendors/");
  return res.data;
}

// fetch plants for a specific vendor
export const getPlantsByVendor = async (vendorId) => {
  const res = await api.get("vendors/vendor-plants-by-vendor/", {
    params: { vendor_id: vendorId },
  });
  return res.data; // expected: array of plants for this vendor
};

//fetch all Product
export const getproductbyVendor = async (vendorId) => {
  const res = await api.get(`/product/products/by-vendor`, {
    params: { vendor: vendorId }
  });
  return res.data;
}
// add purchase contract
export const addPurchaseContract = async (payload) => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.post("/purchase/contracts/", payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
};

// PURCHASE ORDERS
//fetch all purchase orders
export const getPurchaseOrder = async () => {
  const res = await api.get("/purchase/orders/");
  return res.data;
}
//fetch all purchase souda
export const getSoudaByContractId = async (contractId) => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.get(`/purchase/orders/fetch-souda-details/${contractId}/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

//add purchase order
export const addPurchaseOrder = async (payload) => {
  const { currentOrgId } = useSessionStore.getState(); // ✅ destructure

  const res = await api.post(
    "/purchase/orders/",
    payload,
    {
      params: {
        organisation: currentOrgId, // ✅ real UUID
      },
    }
  );

  return res.data;
};


// PURCHASE INVOICES
//fetch all purchase invoices
export const getPurchaseInvoice = async () => {
  const res = await api.get("/purchase/invoices/");
  return res.data;
};
// PURCHASE RETURNS
//fetch all purchase returns
export const getPurchaseReturn = async () => {
  const res = await api.get("purchase/returns/");
  return res.data;
}
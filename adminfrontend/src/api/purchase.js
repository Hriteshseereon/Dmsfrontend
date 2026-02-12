import api from "./axios";

import useSessionStore from "../store/sessionStore";
//  PURCHASE CONTRACTS
//fetch all purchase contracts
export const getPurchaseContract = async () => {
  const res = await api.get("/purchase/contracts/");
  return res.data;
}
//fetch purchase contract by id
export const getPurchaseContractById = async (contractId) => {
  const res = await api.get(`/purchase/contracts/${contractId}/`);
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
  const currentOrgId = useSessionStore.getState().currentOrgId;
  const res = await api.post("/purchase/contracts/", payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
};

 //update purchase contract
export const updatePurchaseContract = async (contractId, payload) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
  const res = await api.put(`/purchase/contracts/${contractId}/`,payload, {
    
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

//get purchase order by id
export const getPurchaseOrderById = async (orderId) => {
  const res = await api.get(`/purchase/orders/${orderId}/`);
  return res.data;
};

//update purchase order
export const updatePurchaseOrder = async (orderId, payload) => {
  const { currentOrgId } = useSessionStore.getState(); 
  const res = await api.put(
    `/purchase/orders/${orderId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId, 
      },
    }
  );
  return res.data;
}

// PURCHASE INVOICES
//fetch all purchase invoices
export const getPurchaseInvoice = async () => {
  const res = await api.get("/purchase/invoices/");
  return res.data;
};
//add purchase invoice
export const addPurchaseInvoice = async (payload) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
  const res = await api.post("/purchase/invoices/", payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}
//fetch purchase invoice by id
export const getPurchaseInvoiceById = async (invoiceId) => {
  const res = await api.get(`/purchase/invoices/${invoiceId}/`);
  return res.data;
};
//update purchase invoice
export const updatePurchaseInvoice = async (invoiceId, payload) => {
  const { currentOrgId } = useSessionStore.getState(); 
  const res = await api.put(
    `/purchase/invoices/${invoiceId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId, 
      },
    }
  );
  return res.data;
}
// PURCHASE RETURNS
//fetch all purchase returns
export const getPurchaseReturn = async () => {
  const res = await api.get("purchase/returns/");
  return res.data;
}
//add purchase return
export const addPurchaseReturn = async (payload) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
  const res = await api.post("/purchase/returns/", payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}
//fetch purchase return by id
export const getPurchaseReturnById = async (returnId) => {
  const res = await api.get(`/purchase/returns/${returnId}/`);
  return res.data;
};
//update purchase return
export const updatePurchaseReturn = async (returnId, payload) => {
  const { currentOrgId } = useSessionStore.getState(); 
  const res = await api.put(
    `/purchase/returns/${returnId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId, 
      },
    }
  );
  return res.data;
}

//get all loading Advices
export const getLoadingAdvice = async () => 
  {const res = await api.get("/transport/loading-advices/"); 
    return res.data; 
  }
//get loading advice by id
export const getLoadingAdviceById = async (adviceId) => {
  const res = await api.get(`/transport/loading-advices/${adviceId}/`);
  return res.data;
}
//update loading advice
export const updateLoadingAdvice = async (adviceId, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(
    `/transport/loading-advices/${adviceId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );
  return res.data;
}
import api from "./axios";

import useSessionStore from "../store/sessionStore";

//dashboard
export const getDashboardData = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/purchase/dashboard/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data.data; // directly return "data"
};

//  PURCHASE CONTRACTS
//fetch all purchase contracts
export const getPurchaseContract = async () => {
  const {currentOrgId,selectedFY} = useSessionStore.getState();

  const res = await api.get("/purchase/contracts/", {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}

export const getPurchaseValidContractGroups = async () => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.get("/purchase/contracts/approved-dropdown/", {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
};

//fetch purchase contract by id
export const getPurchaseContractById = async (contractId) => {
  const {currentOrgId,selectedFY} = useSessionStore.getState();

  const res = await api.get(`/purchase/contracts/${contractId}/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
//fetch all vendor
export const getAllVendor = async () => {
  const res = await api.get("/vendors/vendors/");
  return res.data;
}

// fetch plants for a specific vendor
export const getPlantsByVendor = async (vendorId) => {
  const res = await api.get("vendors/vendor-plants/", {
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
  const {currentOrgId,selectedFY} = useSessionStore.getState();
  const res = await api.post("/purchase/contracts/", payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
};

 //update purchase contract
export const updatePurchaseContract = async (contractId, payload) => {
  const {currentOrgId,selectedFY} = useSessionStore.getState();
  const res = await api.put(`/purchase/contracts/${contractId}/`,payload, {
    
    params: { organisation: currentOrgId, financial_year: selectedFY }  
  });

  return res.data;
};

// PURCHASE ORDERS
//fetch all purchase orders
export const getPurchaseOrder = async () => {
  const {currentOrgId,selectedFY} = useSessionStore.getState();
  const res = await api.get("/purchase/orders/", {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
//fetch all purchase souda
export const getSoudaByContractId = async (contractId) => {
  const {currentOrgId,selectedFY} = useSessionStore.getState();
  const res = await api.get(`/purchase/contracts/${contractId}/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}

//add purchase order
export const addPurchaseOrder = async (payload) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState(); // ✅ destructure

  const res = await api.post(
    "/purchase/orders/",
    payload,
    {
      params: {
        organisation: currentOrgId,
        
        // ✅ real UUID
        financial_year: selectedFY,
      },
    }
  );

  return res.data;
};

//get purchase order by id
export const getPurchaseOrderById = async (orderId) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState(); // ✅ destructure
  const res = await api.get(`/purchase/orders/${orderId}/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
};

//update purchase order
export const updatePurchaseOrder = async (orderId, payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState(); 
  const res = await api.put(
    `/purchase/orders/${orderId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId, 
        financial_year: selectedFY,
      },
    }
  );
  return res.data;
}
// fetch all sales orders for dropdown (by vendor)
export const getAllSalesOrder = async (vendorId) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();

  const res = await api.get("/sales/orders/by-vendor/", {
    params: {
      organisation: currentOrgId,
      vendor_id: vendorId,
      financial_year: selectedFY,
    },
  });

  return res.data;
};


// PURCHASE INVOICES
//fetch all purchase invoices
export const getPurchaseInvoice = async () => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get("/purchase/invoices/", {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
};
//Transport Assignments
//add Transport Assignments
export const addPurchaseInvoice = async (payload) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;
  const res = await api.post("/purchase/invoices/", payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}
//fetch Transport Assignments by id
export const getPurchaseInvoiceById = async (invoiceId) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(`/purchase/invoices/${invoiceId}/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
};
//update Transport Assignments
export const updatePurchaseInvoice = async (invoiceId, payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState(); 
  const res = await api.put(
    `/purchase/invoices/${invoiceId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId, 
        financial_year: selectedFY,
      },
    }
  );
  return res.data;
}

//Assign dropdown
export const getAllTransport = async () => {
  const res = await api.get("transport/dropdown/transporters/");
  return res.data;
}

//Assign to transport
export const addAssignment= async (payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.post("/transport/assignments/", payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
///Purchase Invoice 

//fetch purchase invoice by id
export const getInvoiceById = async (invoiceId) => {
  const res = await api.get(`/purchase/vendor-purchase-invoices/${invoiceId}/`);
  return res.data;
};
//fetch all purchase invoice 
export const getAllInvoice = async () => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(`/purchase/vendor-purchase-invoices/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY },
  });
  return res.data;
};
//add purchase invoice

export const addInvoice = async (payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();

  const res = await api.post(
    `purchase/vendor-purchase-invoices/`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { organisation: currentOrgId, financial_year: selectedFY },
    }
  );

  return res.data;
};
//update purchase invoice
export const updateInvoice = async (invoiceId, payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.put(
    `purchase/vendor-purchase-invoices/${invoiceId}/`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { organisation: currentOrgId, financial_year: selectedFY },
    }
  );
  return res.data;
};

// PURCHASE RETURNS
//fetch deliverd advices for dropdown
export const getDeliveredAdvice = async () => {
  const res = await api.get("/purchase/returns/delivered-loading-advice-dropdown/");
  return res.data;
}

//fetch deliverd advices for dropdown data by id
export const getDeliveredAdviceById = async (loadingAdviceId) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(
    `/purchase/returns/loading-advice-prefill/`,
    {
      params: {
        loading_advice_id: loadingAdviceId,
        organisation: currentOrgId,
        financial_year: selectedFY,
      },
    }
  );
  return res.data;
};

//fetch all purchase returns
export const getPurchaseReturn = async () => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get("purchase/returns/", {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
//add purchase return
export const addPurchaseReturn = async (payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.post("/purchase/returns/", payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
//fetch purchase return by id
export const getPurchaseReturnById = async (returnId) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(`/purchase/returns/${returnId}/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
};
//update purchase return
export const updatePurchaseReturn = async (returnId, payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState(); 
  const res = await api.put(
    `/purchase/returns/${returnId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId, 
        financial_year: selectedFY,
      },
    }
  );
  return res.data;
}
//loding advice
//get all loading Advices
export const getLoadingAdvice = async () => 

  {
    const { currentOrgId,selectedFY } = useSessionStore.getState();
    const res = await api.get("/transport/loading-advices/", {
      params: { organisation: currentOrgId, financial_year: selectedFY }
    }); 
    return res.data; 
  }
//get loading advice by id
export const getLoadingAdviceById = async (adviceId) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(`/transport/loading-advices/${adviceId}/`,
    {
      params: { organisation: currentOrgId, financial_year: selectedFY }
    }
  );
  return res.data;
}
//update loading advice
export const updateLoadingAdvice = async (adviceId, payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.put(
    `/transport/loading-advices/${adviceId}/`,
    payload,
    {
      params: {
        organisation: currentOrgId,
        financial_year: selectedFY,

      },
    }
  );
  return res.data;
}

import api from './axios';
import useSessionStore from '../store/sessionStore';

//dashboard
export const getDashboardData = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/sales/dashboard/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data.data; // directly return "data"
};
// section work on sales group
export const getSalescontractGroups = async () => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();

  const res = await api.get(`/sales/contracts/`, { params: { organisation: currentOrgId.currentOrgId,financial_year: selectedFY, } });
  return res.data;
}

export const getunusedSaleContractGroup = async () => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/unused/`, { params: { organisation: currentOrgId, financial_year: selectedFY } });
  return res.data;
}

getunusedSaleContractGroup()
export const getSalesValidContractGroups = async () => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/active-dropdown/`, { params: { organisation: currentOrgId, financial_year: selectedFY } });
  return res.data;
}
export const getAllSalesContracts = async () => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}

export const createsalesContract = async (payload) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.post(`/sales/contracts/`, payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
// delete the sales contract
export const deleteSalesContract =  async (id) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
const res = await api.delete(`/sales/contracts/${id}`,{
    params: { organisation: currentOrgId, financial_year: selectedFY }

});
return res.data;
}
export const updateSalesContract = async (id, payload) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.patch(`/sales/contracts/${id}/`, payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}

export const getSalesContractById = async (contractId) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/${contractId}`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}
// get all broker name 

export const getAllBrokerName  =  async () => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get('/sales/contracts/all-brokers/',{
        params: { organisation: currentOrgId }
  });
  return res.data;
}


// get all  plants 
  export const getAllPlantsName = async () =>{
  const { currentOrgId } = useSessionStore.getState();

    const res  = await api.get('/sales/contracts/all-plants/',{
      params: { organisation: currentOrgId }
    });
    return res.data;
  }


// get all product by plan id
export const getProductByplant = async (plantId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    "/sales/contracts/plant-all-products/",
    {
      params: {
        organisation: currentOrgId,
        plant_id: plantId,
      },
    }
  );

  return res.data;
};
  // get product group
export const getproductbyVendor = async (vendorId) => {
  const res = await api.get(`/product/products/by-vendor`, {
    params: { vendor: vendorId }
  });
  return res.data;
}
export const getCustomers = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/sales/orders/customers/", { params: { organisation: currentOrgId } });
  return res.data;
}

export const getCustomersByOrganisation = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/customers/admin/by-organisation/", {
    params: { organisation: currentOrgId }
  });
  return res.data;
}
export const getVendors = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/vendors/", { params: { organisation: currentOrgId } });
  return res.data;
}


export const getCompanies = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/company-groups/", {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getProductsByCompany = async (companyId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/product/products/by-company-group/", {
    params: {
      organisation: currentOrgId,
      company_group: companyId,
    },
  });
  return res.data;
};
export const approvedSalesContract = async (contractId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post(`/sales/contracts/${contractId}/approve/`, null, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}
// ------------------------------------------------ sales order api section ------------------------------------------------
export const getContractpersonName = async (cu) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/customers/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const getContractDetailsbyPerson = async (contractId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/contracts`, {
    params: { organisation: currentOrgId, customer_id: contractId }
  });
  return res.data;
}

export const salesContractItems = async (contractId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/contracts/${contractId}/items/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const createSalesOrder = async (payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.post(`/sales/orders/`, payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}

export const getSalesOrders = async () => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
  return res.data;
}

export const getSalesOrderById = async (id) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/${id}/`, {
    params: { organisation: currentOrgId, financial_year: selectedFY, }
  });
  return res.data;
}

export const updateSalesOrder = async (id, payload) => {
  const { currentOrgId,selectedFY } = useSessionStore.getState();
  const res = await api.put(`/sales/orders/${id}/`, payload, {
    params: { organisation: currentOrgId, financial_year: selectedFY }
  });
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

// Invoice API

// Get Order dropdown data for invoice creation
export const getEligibleOrders = async () => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/sales/invoice/eligible-orders/", {
    params: { organisation: currentOrgId },
  });

  return res.data;
};

export const getItemByOrderId = async (sales_order_id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/invoices/order-items-dropdown/`, {
    params: { organisation: currentOrgId
      ,sales_order_id: sales_order_id
     },
  });
  return res.data;
};

export const getInvoiceDropdownData = async (sales_order_id, product_ids) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(`/sales/invoices/preview/`, {
    params: {
      organisation: currentOrgId,
      sales_order_id: sales_order_id,
      product_ids: product_ids, // axios will send multiple params
    },
    paramsSerializer: (params) => {
      const query = new URLSearchParams();
      query.append("organisation", params.organisation);
      query.append("sales_order_id", params.sales_order_id);

      params.product_ids.forEach((id) => {
        query.append("product_ids", id);
      });

      return query.toString();
    },
  });

  return res.data;
};

export const createInvoice = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/sales/invoices/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getInvoices = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/sales/invoices/", {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getInvoiceById = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/invoices/${invoiceId}/`, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const updateInvoice = async (invoiceId, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(`/sales/invoices/${invoiceId}/`, payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

// ---------------- DOWNLOAD INVOICE PDF ----------------
export const downloadInvoicePDF = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(`/sales/invoices/${invoiceId}/download-pdf/`, {
    params: { organisation: currentOrgId },
    responseType: "blob", // Important: tells Axios we want binary data
  });

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice_${invoiceId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const fetchInvoicePDF = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(`/sales/invoices/${invoiceId}/download-pdf/`, {
    params: { organisation: currentOrgId },
    responseType: "blob", // get binary PDF data
  });

  return res.data; // returns Blob
};

// Helper for executing GET requests across fallback URLs
const safeApiGet = async (urlList, params = {}) => {
  let lastError = null;
  for (const url of urlList) {
    try {
      const res = await api.get(url, { params });
      if (res && (res.data !== undefined || Array.isArray(res))) {
        return res.data !== undefined ? res.data : res;
      }
    } catch (err) {
      lastError = err;
    }
  }
  console.warn(`[safeApiGet] All fallback URLs failed for: ${urlList.join(", ")}`, lastError);
  return [];
};

// ---------------- SALE INVOICE (CREDIT INVOICE) API SECTION ----------------
export const getNextSaleInvoiceNumber = async (params = {}) => {
  const { currentOrgId } = useSessionStore.getState();
  const queryParams = typeof params === "object" ? params : { plant_name: params };
  try {
    const res = await api.get("/sales/invoices/next-invoice-number/", {
      params: { organisation: currentOrgId, ...queryParams },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.get("/sales/sales-invoices/next-invoice-number/", {
        params: { organisation: currentOrgId, ...queryParams },
      });
      return res2.data;
    }
    throw err;
  }
};

export const getSaleInvoiceCustomers = async (vehicleNo = null) => {
  const { currentOrgId } = useSessionStore.getState();
  const params = { organisation: currentOrgId };
  if (vehicleNo) params.vehicle_no = vehicleNo;
  return await safeApiGet([
    "/sales/invoices/customers/",
    "/sales/sales-invoices/customers/",
    "/sales/orders/customers/",
    "/customers/admin/by-organisation/",
    "/customers/customers/",
    "/customers/",
  ], params);
};

export const getSaleInvoicePlants = async () => {
  const { currentOrgId } = useSessionStore.getState();
  return await safeApiGet([
    "/sales/invoices/all-plants/",
    "/sales/sales-invoices/all-plants/",
    "/sales/contracts/all-plants/",
    "/vendors/vendor-dropdown/",
    "/vendors/company-groups/",
    "/vendors/vendors/",
  ], { organisation: currentOrgId });
};

export const getSaleInvoiceBrokers = async () => {
  const { currentOrgId } = useSessionStore.getState();
  return await safeApiGet([
    "/sales/invoices/all-brokers/",
    "/sales/sales-invoices/all-brokers/",
    "/sales/contracts/all-brokers/",
    "/brokers/broker/",
  ], { organisation: currentOrgId });
};

export const getSaleInvoiceIntransitVehicles = async (params = {}) => {
  const { currentOrgId } = useSessionStore.getState();
  const queryParams = typeof params === "object" ? params : { customer_id: params };
  return await safeApiGet([
    "/sales/invoices/intransit-vehicles/",
    "/sales/sales-invoices/intransit-vehicles/",
    "/purchase/invoices/available-vehicles/",
    "/transport/vehicle-masters/",
  ], {
    organisation: currentOrgId,
    ...queryParams,
  });
};

export const getSaleInvoiceCustomerContractItems = async (customerId, vehicleNo = null) => {
  const { currentOrgId } = useSessionStore.getState();
  const cId = typeof customerId === "object" ? customerId?.customer_id : customerId;
  const vNo = typeof customerId === "object" ? customerId?.vehicle_no : vehicleNo;

  const params = {
    organisation: currentOrgId,
    customer_id: cId,
  };
  if (vNo) params.vehicle_no = vNo;

  try {
    const res = await api.get("/sales/invoices/customer-contract-items/", { params });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.get("/sales/sales-invoices/customer-contract-items/", { params });
      return res2.data;
    }
    throw err;
  }
};

export const createSaleInvoice = async (payload) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const isFormData = payload instanceof FormData;
  const config = {
    params: { organisation: currentOrgId, financial_year: selectedFY },
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  };
  try {
    const res = await api.post("/sales/invoices/", payload, config);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.post("/sales/sales-invoices/", payload, config);
      return res2.data;
    }
    throw err;
  }
};

export const getSaleInvoices = async () => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  return await safeApiGet([
    "/sales/invoices/",
    "/sales/sales-invoices/",
  ], { organisation: currentOrgId, financial_year: selectedFY });
};

export const getSaleInvoiceById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  return await safeApiGet([
    `/sales/invoices/${id}/`,
    `/sales/sales-invoices/${id}/`,
  ], { organisation: currentOrgId });
};

export const updateSaleInvoice = async (id, payload) => {
  const { currentOrgId, selectedFY } = useSessionStore.getState();
  const isFormData = payload instanceof FormData;
  const config = {
    params: { organisation: currentOrgId, financial_year: selectedFY },
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  };
  try {
    const res = await api.patch(`/sales/invoices/${id}/`, payload, config);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.patch(`/sales/sales-invoices/${id}/`, payload, config);
      return res2.data;
    }
    throw err;
  }
};

export const deleteSaleInvoice = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  try {
    const res = await api.delete(`/sales/invoices/${id}/`, {
      params: { organisation: currentOrgId },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.delete(`/sales/sales-invoices/${id}/`, {
        params: { organisation: currentOrgId },
      });
      return res2.data;
    }
    throw err;
  }
};

export const downloadSaleInvoicePDF = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();
  try {
    const res = await api.get(`/sales/invoices/${invoiceId}/download-pdf/`, {
      params: { organisation: currentOrgId },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sale_invoice_${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.get(`/sales/sales-invoices/${invoiceId}/download-pdf/`, {
        params: { organisation: currentOrgId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res2.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `sale_invoice_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
    throw err;
  }
};

export const fetchSaleInvoicePDF = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();
  try {
    const res = await api.get(`/sales/invoices/${invoiceId}/download-pdf/`, {
      params: { organisation: currentOrgId },
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const res2 = await api.get(`/sales/sales-invoices/${invoiceId}/download-pdf/`, {
        params: { organisation: currentOrgId },
        responseType: "blob",
      });
      return res2.data;
    }
    throw err;
  }
};

//Sale Disputes API

export const getSaleDisputes = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/sales/dispute/invoices/", {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getSaleDisputeById = async (invoiceId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/disputes/preview/`, {
    params: { organisation: currentOrgId  ,sale_invoice_id: invoiceId },
  });
  return res.data;
};

export const createSaleDispute = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/sales/disputes/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const updateSaleDispute = async (disputeId, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(`/sales/disputes/${disputeId}/`, payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};
 
export const getDisputeById = async (disputeId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/disputes/${disputeId}/`, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

//wallet

export const getWalletData = async () => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/customers/admin-credit/summary/", {
    params: { organisation_id: currentOrgId },
  });

  return res.data;
};

export const deductCreditNote = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("customers/admin-credit/add/", payload, {
    params: { organisation_id: currentOrgId },
  });
  return res.data;
};
export const getCustomerLedger = async (customer_id) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/customers/admin-credit/ledger/", {
    params: {
      organisation_id: currentOrgId,
      customer_id,
    },
  });

  return res.data;
};


// get all passing weight 

export const getAllPassingWeight = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("transport/vehicle-masters/unique-passing-weights/", {
    params: { organisation: currentOrgId },
  });

  return res.data;
};

// ---------------- STOCK STATUS & SUMMARY STOCK STATEMENT API SECTION ----------------
export const getStockStatusSuppliers = async () => {
  const { currentOrgId } = useSessionStore.getState();
  return await safeApiGet([
    "/sales/invoices/stock-status-suppliers/",
    "/sales/sales-invoices/stock-status-suppliers/",
    "/vendors/vendor-dropdown/",
    "/vendors/vendors/",
    "/vendors/company-groups/",
  ], { organisation: currentOrgId });
};

export const getStockStatusReport = async (params = {}) => {
  const { currentOrgId } = useSessionStore.getState();
  return await safeApiGet([
    "/sales/invoices/stock-status/",
    "/sales/sales-invoices/stock-status/",
  ], { organisation: currentOrgId, ...params });
};

export const getSummaryStockStatementReport = async (params = {}) => {
  const { currentOrgId } = useSessionStore.getState();
  return await safeApiGet([
    "/sales/invoices/summary-stock-statement/",
    "/sales/sales-invoices/summary-stock-statement/",
  ], { organisation: currentOrgId, ...params });
};


import api from './axios';
import useSessionStore from '../store/sessionStore';
// section work on sales group
export const getSalescontractGroups = async () => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/`, { params: { organisation: currentOrgId.currentOrgId } });
  return res.data;
}

export const getAllSalesContracts = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const createsalesContract = async (payload) => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.post(`/sales/contracts/`, payload, {
    params: { organisation: currentOrgId.currentOrgId }
  });
  return res.data;
}

export const updateSalesContract = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.patch(`/sales/contracts/${id}/`, payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const getSalesContractById = async (contractId) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/${contractId}`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

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
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post(`/sales/orders/`, payload, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const getSalesOrders = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const getSalesOrderById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get(`/sales/orders/${id}/`, {
    params: { organisation: currentOrgId }
  });
  return res.data;
}

export const updateSalesOrder = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(`/sales/orders/${id}/`, payload, {
    params: { organisation: currentOrgId }
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
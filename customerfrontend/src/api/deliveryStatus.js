import api from "./axios";
import useSessionStore from "../store/sessionStore";
export const getAllDeliveryStatus = async () => {
    const { currentOrgId } = useSessionStore.getState();
    const res = await api.get("/sales/customer/invoices/", {
        params: { organisation: currentOrgId }
    });
    return res.data;
};
 
export const getDeliveryStatusByOrderNo = async ({ sale_invoice_id }) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    `/sales/customer/invoices/${sale_invoice_id}/`,
    {
      params: { organisation: currentOrgId },
    }
  );

  return res.data;
};

// ✅ Download Invoice PDF
export const downloadInvoice = async ({ sale_invoice_id }) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    `/sales/customer/invoices/${sale_invoice_id}/download-pdf/`,
    {
      params: { organisation: currentOrgId },
      responseType: "blob", // 🔥 IMPORTANT
    }
  );

  return res.data;
};

// ✅ Print Invoice (same API, just open in new tab)
export const getInvoicePrintUrl = ({ sale_invoice_id }) => {
  const { currentOrgId } = useSessionStore.getState();

  return `${api.defaults.baseURL}/sales/customer/invoices/${sale_invoice_id}/download-pdf/?organisation=${currentOrgId}`;
};

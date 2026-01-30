import api from './axios';
import useSessionStore from '../store/sessionStore';
// section work on sales group
export const getSalescontractGroups = async () => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.get(`/sales/contracts/`, { params: { organisation: currentOrgId.currentOrgId } });
  return res.data;
}
// export const createSalesGroup = async (data) => {
//   const currentOrgId = useSessionStore.getState();
//   const res = await api.post(`/sales/contracts/`, data, {   
//     params: { organization: currentOrgId.organizationId }
//   });
//   return res.data;
// }  
export const createsalesContract = async (payload) => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.post(`/sales/contracts/`, payload, {   
    params: { organisation: currentOrgId.currentOrgId }
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
  const res = await api.get("/sales/orders/customers/", {params: {organisation: currentOrgId}});
  return res.data;
}
export const getVendors = async () => {
    const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/vendors/", {params: {organisation: currentOrgId}});
  return res.data;
}
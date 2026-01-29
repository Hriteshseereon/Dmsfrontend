import api from './axios';
import useSessionStore from '../store/sessionStore';
// section work on sales group
export const getSalesGroups = async () => {
  const res = await api.get(`/sales/contracts/`);
  return res.data;
}
// export const createSalesGroup = async (data) => {
//   const currentOrgId = useSessionStore.getState();
//   const res = await api.post(`/sales/contracts/`, data, {   
//     params: { organization: currentOrgId.organizationId }
//   });
//   return res.data;
// }  
export const createsalesGroup = async (payload) => {
  const currentOrgId = useSessionStore.getState();
  const res = await api.post(`/sales/contracts/`, payload);
  return res.data;
}  
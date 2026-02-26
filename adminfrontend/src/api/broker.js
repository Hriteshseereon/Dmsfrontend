import api from './axios'
import useSessionStore from "../store/sessionStore";

//fetch all vendor
export const getAllVendor = async () => {
  const res = await api.get("/vendors/vendors/");
  return res.data;
}
// get product by vendor
export const getproductbyVendor = async (vendorId) => {
  const res = await api.get(`/product/products/by-vendor`, {
    params: { vendor: vendorId }
  });
  return res.data;
}
export const addBrokerPtnr = async (payload) =>{
        const { currentOrgId } = useSessionStore.getState();

    const res =  await api.post('/brokers/broker/',payload,{
      params: { organisation: currentOrgId },
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}


export const getBrokerAll = async () =>{
    const {currentOrgId} = useSessionStore.getState();

    const res =  await api.get(`/brokers/broker/`,
        {
            params: { organisation: currentOrgId }, 
        }
    );
    return res.data;
}

export const getBrokerById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(`/brokers/broker/${id}/`, {
    params: { organisation: currentOrgId },
  });

  return res.data;
};

export const updateBrokerById = async (id, payload) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.patch(
    `/brokers/broker/${id}/`,
    payload,
    {
      params: { organisation: currentOrgId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};
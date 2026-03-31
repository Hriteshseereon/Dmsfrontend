import api from "./axios";
import useSessionStore from "../store/sessionStore";
// section work on product  group
export const getProductGroups = async () => {
  const res = await api.get(`/product/product-groups/`);
  return res.data;
};
export const addProductGroup = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("product/product-groups/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getProductGroupById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(`/product/product-groups/${id}/`, {
    params: { organisation: currentOrgId },
  });
  return res.data;
}

export const updateProductGroupById = async (payload, id) => {
  const { currentOrgId } = useSessionStore.getState();  
  const res = await api.put(`/product/product-groups/${id}/`, payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};
// get all the HSN SAC code list
export const getHSNSACCodes = async () => {
  const res = await api.get("/product/hsn/");
  return res.data;
};
export const getSACCodes = async () => {
  const res = await api.get("/product/sac/");
  return res.data;
};
// add more product related api here
export const addproduct = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/product/products/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

export const getProducts = async () => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/product/products/", {
    params: { organisation: currentOrgId },
  });

  return Array.isArray(res.data) ? res.data : res.data?.results || [];
};

export const getProductById = async (id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res =  await api.get(`/product/products/${id}`,{
    params: { organisation: currentOrgId },
  })
  return res.data;
}


export const updateProductById = async (payload,id) =>{
    const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(`/product/products/${id}/`,payload,{
    params: { organisation: currentOrgId },
  })
}
export const getVendors = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/vendors/vendors/", {
    params: { organisation: currentOrgId },
  });
  return res.data;
};
// product unit conversion api
export const getProductUnitConversions = async (productId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get("/product/product-unit-conversions/", {
    params: {
      organisation: currentOrgId,
      product: productId,
    },
  });

  return res.data;
};

export const addProductUnitConversion = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/product/product-unit-conversions/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
};

// product unit conversion reference units
export const getProductReferenceUnits = async (productId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    "/product/product-unit-conversions/reference-units/",
    {
      params: {
        organisation: currentOrgId,
        product: productId,
      },
    },
  );

  return res.data;
};

export const setDisplayUnit = async (conversionId) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.post(
    `/product/product-unit-conversions/${conversionId}/set-display/`,
    {},
    {
      params: {
        organisation: currentOrgId,
      },
    },
  );

  return res.data;
};


// product price update api 

export const productPriceUpdate = async (payload) =>{
  const { currentOrgId } = useSessionStore.getState();
  const res = await  api.post(`/price-update/price-updates/update-by-product/`,payload , {
     params: { organisation: currentOrgId },
  })
 return res.data;

}

// get the product price 

export const getProductPrice = async (id) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.get(
    "price-update/price-updates/by-product/",
    {
      params: {
        product: id,          // ?product={{product_id}}
        org: currentOrgId     // optional (only if your API needs it)
      }
    }
  );

  return res.data;
};



// unit master api
export const getUnits = async () => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.get("/product/unit-groups/", {  
    params: { organisation: currentOrgId },
  });
  return res.data;
}

export const addUnit = async (payload) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.post("/product/unit-groups/", payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
}

export const updateUnitById = async (payload, id) => {
  const { currentOrgId } = useSessionStore.getState();
  const res = await api.put(`/product/unit-groups/${id}/`, payload, {
    params: { organisation: currentOrgId },
  });
  return res.data;
}


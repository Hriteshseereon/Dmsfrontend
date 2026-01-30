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

// get all the HSN SAC code list
export const getHSNSACCodes = async () => {
  const res = await api.get("/product/hsn/");
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

  return Array.isArray(res.data)
    ? res.data
    : res.data?.results || [];
};

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

  // ✅ ALWAYS return an array
  return Array.isArray(res.data)
    ? res.data
    : res.data?.results || [];
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

import api from "./axios";
// add purchase contract
export const getPurchaseContract = async () => {
  const res = await api.get("/purchase/contracts/");
  return res.data;
}
//fetch all vendor
export const getAllVendor = async () => {
  const res = await api.get("/vendors/vendors/");
  return res.data;
}
//fetch all company
export const getAllCompany = async () => {
  const res = await api.get("/organisation/organisation-list/");
  return res.data;
}
//fetch all Product
export const getAllProduct = async () => {
  const res = await api.get("/product/products/");
  return res.data;
}
// CREATE
export const addPurchaseContract = async (orgId, payload) => {
  const res = await api.post("/purchase/contracts/", {
    ...payload,
    organisation: orgId,
  });
  return res.data;
};

export const getPurchaseOrder = async()=>{
    const res =await api.get("/purchase/orders/");
    return res.data;
}

export const getPurchaseInvoice = async () => {
  const res = await api.get("/purchase/invoices/");
  return res.data;
};


export const getPurchaseReturn = async()=>{
    const res =await api.get("purchase/returns/");
    return res.data;
}
import useSessionStore from "../store/sessionStore";
import api from "./axios";


// get vendors
export const getVendors = async () => {
    const res = await api.get("/vendors/vendors/");
    return res.data;
};

// get products
export const getProducts = async () => {
    const res = await api.get("/product/products/");
    return res.data;
};

// get product group
export const getProductGroups = async () => {
    const res = await api.get("/product/product-groups/");
    return res.data;
};


// Purchase Contract

// Create contract
export const createPurchaseContract = async (payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.post("/purchase/contracts/", payload, {
        params: { organisation: currentOrgId },
    });

    return res.data;
};

// LIST contracts
export const getPurchaseContracts = async () => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.get("/purchase/contracts/", {
        params: { organisation: currentOrgId },
    });

    return res.data;
};

// UPDATE contract
export const updatePurchaseContract = async (contractId, payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.patch(
        `/purchase/contracts/${contractId}/`,
        payload,
        {
            params: { organisation: currentOrgId },
        }
    );

    return res.data;
};


// Purchase Indent

// CREATE Purchase Order
export const createPurchaseOrder = async (payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.post(
        "/purchase/orders/",
        payload,
        {
            params: { organisation: currentOrgId },
        }
    );

    return res.data;
};

// LIST Purchase Orders
export const getPurchaseOrders = async () => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.get("/purchase/orders/", {
        params: { organisation: currentOrgId },
    });

    return res.data;
};

// UPDATE Purchase Order
export const updatePurchaseOrder = async (orderId, payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.patch(
        `/purchase/orders/${orderId}/`,
        payload,
        {
            params: { organisation: currentOrgId },
        }
    );

    return res.data;
};


// Purchase Invoice

// CREATE invoice
export const createPurchaseInvoice = async (payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.post(
        "/purchase/invoices/",
        payload,
        { params: { organisation: currentOrgId } }
    );

    return res.data;
};

// LIST invoices
export const getPurchaseInvoices = async () => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.get(
        "/purchase/invoices/",
        { params: { organisation: currentOrgId } }
    );

    return res.data;
};

// UPDATE invoice
export const updatePurchaseInvoice = async (invoiceId, payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.patch(
        `/purchase/invoices/${invoiceId}/`,
        payload,
        { params: { organisation: currentOrgId } }
    );

    return res.data;
};


// Purchase Return

// CREATE return
export const createPurchaseReturn = async (payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.post(
        "/purchase/returns/",
        payload,
        { params: { organisation: currentOrgId } }
    );

    return res.data;
};

// LIST returns
export const getPurchaseReturns = async () => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.get(
        "/purchase/returns/",
        { params: { organisation: currentOrgId } }
    );

    return res.data;
};

// UPDATE return
export const updatePurchaseReturn = async (returnId, payload) => {
    const { currentOrgId } = useSessionStore.getState();

    const res = await api.patch(
        `/purchase/returns/${returnId}/`,
        payload,
        { params: { organisation: currentOrgId } }
    );

    return res.data;
};


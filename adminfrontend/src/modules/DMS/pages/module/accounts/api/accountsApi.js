/**
 * Accounts data layer.
 *
 * This file adds NO new backend endpoints. Every call below already exists and
 * is already used elsewhere in the product — the Accounts section only reads
 * the same data and re-shapes it into accounting views.
 *
 * Everything is failure-tolerant: one dead endpoint degrades a single report
 * rather than blanking the whole section.
 */
import {
  getInvoices,
  getInvoiceById,
  getAllSalesContracts,
  getSalesOrders,
  getSaleDisputes,
  getDisputeById,
  getWalletData,
  getCustomerLedger,
  getCustomersByOrganisation,
  getAllBrokerName,
} from "../../../../../../api/sales";

import {
  getPurchaseInvoices,
  getPurchaseContract,
  getPurchaseSalesContractOrders,
  getFreightDetails,
  getStockInTransit,
  getVendors as getPurchaseVendors,
} from "../../../../../../api/purchase";

import { getProducts } from "../../../../../../api/product";
import { getAllInventory } from "../../../../../../api/masterinventory";
import { getBrokerAll } from "../../../../../../api/broker";
import { getOrganization } from "../../../../../../api/organizations";
import { getWealthEntries } from "../../../../../../api/wealth";
import {
  getAssets,
  getAssetDepreciations,
  getAssetDisposals,
} from "../../../../../../api/assets";
import useSessionStore from "../../../../../../store/sessionStore";

/** Unwrap the various envelopes this backend uses ({data:[]}, {results:[]}, []). */
export const unwrap = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data?.results)) return res.data.results;
  return [];
};

/** Never throw — an empty list is a better outcome than a blank screen. */
const safe = async (fn, fallback = []) => {
  try {
    return unwrap(await fn());
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[accounts] source unavailable:", err?.config?.url || err);
    }
    return fallback;
  }
};

const safeObj = async (fn) => {
  try {
    const res = await fn();
    return res?.data ?? res ?? null;
  } catch {
    return null;
  }
};

/** Run promises with a concurrency cap so detail fetches don't flood the API. */
export const mapLimit = async (items, limit, worker) => {
  const out = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        out[i] = await worker(items[i], i);
      } catch {
        out[i] = null;
      }
    }
  });
  await Promise.all(runners);
  return out.filter(Boolean);
};

/* ------------------------------------------------------------------ */
/* Source loaders                                                      */
/* ------------------------------------------------------------------ */

export const loadSalesInvoices = () => safe(getInvoices);
export const loadSalesContracts = () => safe(getAllSalesContracts);
export const loadSalesOrders = () => safe(getSalesOrders);
export const loadDisputes = () => safe(getSaleDisputes);
export const loadCustomers = () => safe(getCustomersByOrganisation);
export const loadWalletSummary = () => safe(getWalletData);
export const loadPurchaseInvoices = () => safe(() => getPurchaseInvoices({}));
export const loadPurchaseContracts = () => safe(getPurchaseContract);
export const loadPurchaseOrders = () => safe(getPurchaseSalesContractOrders);
export const loadFreight = () => safe(getFreightDetails);
export const loadStockInTransit = () => safe(() => getStockInTransit({}));
export const loadVendors = () => safe(getPurchaseVendors);
export const loadProducts = () => safe(getProducts);
export const loadInventory = () => safe(getAllInventory);
export const loadBrokers = () => safe(getBrokerAll);
export const loadSalesBrokers = () => safe(getAllBrokerName);
export const loadAssets = () => {
  const { currentOrgId } = useSessionStore.getState();
  return safe(() => getAssets(currentOrgId));
};
export const loadDepreciation = () => safe(getAssetDepreciations);
export const loadDisposals = () => safe(getAssetDisposals);

/** Bank transactions already captured in the Wealth module (asset_category=BANK). */
export const loadBankEntries = () =>
  safe(() => getWealthEntries({ asset_category: "BANK" }));

/** Company master — used for the company's own state (intra vs inter-state GST). */
export const loadOrganisation = async () => {
  const { currentOrgId } = useSessionStore.getState();
  if (!currentOrgId) return null;
  return safeObj(() => getOrganization(currentOrgId));
};

/** Per-customer wallet ledger rows, fetched for the customers supplied. */
export const loadCustomerLedgers = async (customerIds = []) => {
  const rows = await mapLimit(customerIds, 5, async (id) => {
    const res = await getCustomerLedger(id);
    return { customerId: id, rows: unwrap(res) };
  });
  return rows;
};

/** Full sales invoice documents (item lines) — needed for GST and stock views. */
export const loadSalesInvoiceDetails = async (ids = []) =>
  mapLimit(ids, 6, async (id) => {
    const res = await getInvoiceById(id);
    return res?.data ?? res;
  });

/** Full dispute documents (return lines with rate). */
export const loadDisputeDetails = async (ids = []) =>
  mapLimit(ids, 6, async (id) => {
    const res = await getDisputeById(id);
    return res?.data ?? res;
  });

/* ------------------------------------------------------------------ */
/* Bundles                                                             */
/* ------------------------------------------------------------------ */

/**
 * The common bundle every report builds on. One round of parallel reads,
 * cached by react-query for the whole Accounts session.
 */
export const loadAccountsCore = async () => {
  const [
    salesInvoices,
    purchaseInvoices,
    salesContracts,
    purchaseContracts,
    salesOrders,
    purchaseOrders,
    disputes,
    freight,
    stockInTransit,
    customers,
    vendors,
    products,
    inventory,
    brokers,
    walletSummary,
    bankEntries,
    organisation,
  ] = await Promise.all([
    loadSalesInvoices(),
    loadPurchaseInvoices(),
    loadSalesContracts(),
    loadPurchaseContracts(),
    loadSalesOrders(),
    loadPurchaseOrders(),
    loadDisputes(),
    loadFreight(),
    loadStockInTransit(),
    loadCustomers(),
    loadVendors(),
    loadProducts(),
    loadInventory(),
    loadBrokers(),
    loadWalletSummary(),
    loadBankEntries(),
    loadOrganisation(),
  ]);

  return {
    salesInvoices,
    purchaseInvoices,
    salesContracts,
    purchaseContracts,
    salesOrders,
    purchaseOrders,
    disputes,
    freight,
    stockInTransit,
    customers,
    vendors,
    products,
    inventory,
    brokers,
    walletSummary,
    bankEntries,
    organisation,
  };
};

/** Fixed asset sources, loaded only by the Asset Register. */
export const loadAssetCore = async () => {
  const [assets, depreciation, disposals] = await Promise.all([
    loadAssets(),
    loadDepreciation(),
    loadDisposals(),
  ]);
  return { assets, depreciation, disposals };
};

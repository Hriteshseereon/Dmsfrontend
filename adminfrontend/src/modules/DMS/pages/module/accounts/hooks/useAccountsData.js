/**
 * Shared data hooks for the Accounts section.
 *
 * One cached core bundle feeds every report, so switching between reports
 * costs nothing. Detail-level fetches (invoice line items, dispute lines,
 * wallet ledgers) are opt-in per report because they are N+1 calls.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import useSessionStore from "../../../../../../store/sessionStore";
import {
  loadAccountsCore,
  loadAssetCore,
  loadSalesInvoiceDetails,
  loadDisputeDetails,
  loadCustomerLedgers,
} from "../api/accountsApi";
import {
  buildContext,
  buildSalesVouchers,
  buildPurchaseVouchers,
  buildCreditNotes,
  buildFreightVouchers,
  buildWalletVouchers,
} from "../lib/accounting";
import { pick } from "../lib/format";
import { getFYDateRange, getCurrentFinancialYear } from "../../../../../../utils/financialYear";

const FIVE_MIN = 1000 * 60 * 5;

/** The financial-year range currently selected for the organisation. */
export const useFinancialPeriod = () => {
  const selectedFY = useSessionStore((s) => s.selectedFY);
  return useMemo(() => {
    const fy = selectedFY || getCurrentFinancialYear();
    const { start, end } = getFYDateRange(fy);
    return { fy, start: dayjs(start), end: dayjs(end) };
  }, [selectedFY]);
};

/** Core bundle — every list endpoint the Accounts section reads. */
export const useAccountsCore = () => {
  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  return useQuery({
    queryKey: ["accounts", "core", currentOrgId],
    queryFn: loadAccountsCore,
    staleTime: FIVE_MIN,
    enabled: Boolean(currentOrgId),
  });
};

/** Sales invoice line items — required for GST, stock movement and voucher view. */
export const useSalesInvoiceDetails = (invoices = [], enabled = true) => {
  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  const ids = useMemo(
    () => invoices.map((i) => pick(i, "id", "sale_invoice_id")).filter(Boolean),
    [invoices],
  );
  return useQuery({
    queryKey: ["accounts", "sales-details", currentOrgId, ids.length, ids[0], ids[ids.length - 1]],
    queryFn: () => loadSalesInvoiceDetails(ids),
    staleTime: FIVE_MIN,
    enabled: enabled && ids.length > 0,
  });
};

/** Dispute line items — required to value credit notes. */
export const useDisputeDetails = (disputes = [], enabled = true) => {
  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  const ids = useMemo(
    () =>
      disputes
        .filter((d) => {
          const s = String(pick(d, "status") || "").toLowerCase();
          return s === "approved" || s === "credited";
        })
        .map((d) => pick(d, "dispute_id", "id"))
        .filter(Boolean),
    [disputes],
  );
  return useQuery({
    queryKey: ["accounts", "dispute-details", currentOrgId, ids.length, ids[0]],
    queryFn: () => loadDisputeDetails(ids),
    staleTime: FIVE_MIN,
    enabled: enabled && ids.length > 0,
  });
};

/** Wallet ledgers per customer — the only record of money received. */
export const useCustomerLedgers = (customers = [], enabled = true) => {
  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  const ids = useMemo(
    () => customers.map((c) => pick(c, "customer_id", "id")).filter(Boolean),
    [customers],
  );
  return useQuery({
    queryKey: ["accounts", "wallet-ledgers", currentOrgId, ids.length],
    queryFn: () => loadCustomerLedgers(ids),
    staleTime: FIVE_MIN,
    enabled: enabled && ids.length > 0,
  });
};

export const useAssetCore = () => {
  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  return useQuery({
    queryKey: ["accounts", "assets", currentOrgId],
    queryFn: loadAssetCore,
    staleTime: FIVE_MIN,
    enabled: Boolean(currentOrgId),
  });
};

/**
 * The full voucher book.
 *
 * @param {object} opts
 * @param {boolean} opts.withSalesDetail  fetch sales invoice line items
 * @param {boolean} opts.withDisputes     fetch dispute line items
 * @param {boolean} opts.withWallet       fetch customer wallet ledgers
 */
export const useVoucherBook = ({
  withSalesDetail = false,
  withDisputes = false,
  withWallet = false,
} = {}) => {
  const core = useAccountsCore();
  const data = core.data;

  const salesDetail = useSalesInvoiceDetails(
    data?.salesInvoices || [],
    withSalesDetail && Boolean(data),
  );
  const disputeDetail = useDisputeDetails(
    data?.disputes || [],
    withDisputes && Boolean(data),
  );
  const walletLedgers = useCustomerLedgers(
    data?.customers || [],
    withWallet && Boolean(data),
  );

  const ctx = useMemo(() => (data ? buildContext(data) : null), [data]);

  const salesVouchers = useMemo(
    () => (ctx ? buildSalesVouchers(data.salesInvoices, salesDetail.data || [], ctx) : []),
    [ctx, data, salesDetail.data],
  );

  const purchaseVouchers = useMemo(
    () => (ctx ? buildPurchaseVouchers(data.purchaseInvoices, ctx) : []),
    [ctx, data],
  );

  const creditNotes = useMemo(
    () => (ctx ? buildCreditNotes(data.disputes, disputeDetail.data || [], ctx) : []),
    [ctx, data, disputeDetail.data],
  );

  const freightVouchers = useMemo(
    () => (data ? buildFreightVouchers(data.freight) : []),
    [data],
  );

  const walletVouchers = useMemo(
    () => (ctx ? buildWalletVouchers(walletLedgers.data || [], ctx) : []),
    [ctx, walletLedgers.data],
  );

  return {
    core,
    ctx,
    data,
    salesVouchers,
    purchaseVouchers,
    creditNotes,
    freightVouchers,
    walletVouchers,
    isLoading: core.isLoading,
    isError: core.isError,
    error: core.error,
    // Detail fetches run after the core resolves; report headers show this.
    detailLoading:
      (withSalesDetail && salesDetail.isFetching) ||
      (withDisputes && disputeDetail.isFetching) ||
      (withWallet && walletLedgers.isFetching),
    refetch: core.refetch,
  };
};

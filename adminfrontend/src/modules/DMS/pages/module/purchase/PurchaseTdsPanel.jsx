import React, { useEffect, useState } from "react";
import { Card, Form, Spin, Tag } from "antd";
import dayjs from "dayjs";

import { calculatePurchaseInvoiceTds } from "../../../../../api/purchase";

const inr = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const round2 = (n) => Number(Number(n || 0).toFixed(2));

function Metric({ label, value, strong = false, tone = "text-gray-900" }) {
  return (
    <div>
      <div className="text-[11px] text-amber-700 font-semibold leading-tight">
        {label}
      </div>
      <div
        className={`${tone} ${strong ? "font-extrabold text-base" : "font-bold text-sm"}`}
      >
        {value}
      </div>
    </div>
  );
}

// The server returns the numbers only, so the "where is this supplier against the threshold" status is
// derived here with the same three cases the server applies.
const getThresholdStatus = ({ prior, next, threshold }) => {
  if (prior >= threshold) {
    return {
      color: "red",
      text: "Threshold already crossed - TDS on the full invoice",
    };
  }
  if (next > threshold) {
    return {
      color: "orange",
      text: "This invoice crosses the threshold - TDS only on the excess",
    };
  }
  return { color: "green", text: "Within threshold - no TDS on this invoice" };
};

/**
 * TDS panel for the Purchase Invoice entry form (must be rendered inside the <Form>).
 *
 * Whenever the supplier, invoice date or Grand Total changes, asks the backend how much of this invoice is
 * liable for TDS: the supplier's cumulative purchases in the financial year versus the TDS Master threshold.
 *
 * The server computes TDS on the invoice Grand Total (and sums earlier invoices' Grand Totals), so the
 * preview sends the Grand Total too - that keeps it identical to what is saved. It is informational: the
 * server recalculates and stores TDS when the invoice is created / updated.
 *
 * `invoiceId` is set when editing, so the invoice being edited is not counted among the prior purchases.
 */
export default function PurchaseTdsPanel({ form, invoiceId }) {
  const vendor = Form.useWatch("vendor", form);
  const supplierName = Form.useWatch("supplier_name", form);
  const supplierGst = Form.useWatch("supplier_gst", form);
  const grandTotal = Form.useWatch("grand_total", form);
  const invoiceDate = Form.useWatch("invoice_date", form);

  const amount = round2(grandTotal);
  const dateStr =
    dayjs.isDayjs(invoiceDate) && invoiceDate.isValid()
      ? invoiceDate.format("DD-MM-YYYY")
      : undefined;
  const gst = String(supplierGst || "").trim();
  const name = String(supplierName || "").trim();

  const canCalculate = Boolean(vendor) && amount > 0;
  const requestKey = [vendor, name, gst, amount, dateStr || "", invoiceId || ""].join("|");

  // The result remembers which request it answers, so a stale answer is never shown for new inputs
  const [result, setResult] = useState({ key: null, res: null, error: null });

  useEffect(() => {
    if (!canCalculate) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await calculatePurchaseInvoiceTds(
          {
            vendorId: vendor,
            supplierName: name,
            supplierGst: gst,
            amount,
            invoiceDate: dateStr,
            invoiceId,
          },
          { signal: controller.signal },
        );
        setResult({ key: requestKey, res, error: null });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("TDS preview failed", err);
        const data = err?.response?.data;
        setResult({
          key: requestKey,
          res: null,
          error:
            data?.message ||
            data?.detail ||
            "TDS preview is unavailable right now. TDS will still be calculated when the invoice is saved.",
        });
      }
    }, 400); // debounce while rows / GST are being typed

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [canCalculate, requestKey, vendor, name, gst, amount, dateStr, invoiceId]);

  const shell = ({ tag, body }) => (
    <Card
      size="small"
      style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
      styles={{ body: { padding: "10px 14px" } }}
    >
      <div className="flex items-center gap-2 mb-2">
        <h6 className="text-amber-600 font-bold m-0">TDS (Tax Deducted at Source)</h6>
        {tag}
      </div>
      {body}
    </Card>
  );

  if (!canCalculate) {
    return shell({
      tag: null,
      body: (
        <div className="text-xs text-gray-500">
          Select a supplier and add items to see the TDS calculation.
        </div>
      ),
    });
  }

  if (result.key !== requestKey) {
    return shell({
      tag: <Spin size="small" />,
      body: (
        <div className="text-xs text-gray-500">Calculating TDS for the supplier...</div>
      ),
    });
  }

  if (result.error || result.res?.status === false || !result.res?.data) {
    return shell({
      tag: <Tag color="error">Unavailable</Tag>,
      body: (
        <div className="text-xs text-red-600">
          {result.error ||
            result.res?.message ||
            "TDS could not be calculated for this supplier."}
        </div>
      ),
    });
  }

  const d = result.res.data;

  // No active TDS Master for this financial year -> the server returns zeros and no master id
  if (!d.tds_master_id) {
    return shell({
      tag: <Tag color="gold">No TDS policy</Tag>,
      body: (
        <div className="text-xs text-amber-800">
          No active TDS policy found for FY {d.financial_year || "-"}. TDS will
          be {inr(0)}.
        </div>
      ),
    });
  }

  const threshold = Number(d.threshold_amount || 0);
  const prior = Number(d.prior_cumulative_amount || 0);
  const next = Number(d.new_cumulative_amount || 0);
  const tdsAmount = Number(d.tds_amount || 0);
  const status = getThresholdStatus({ prior, next, threshold });

  return shell({
    tag: <Tag color={status.color}>{status.text}</Tag>,
    body: (
      <>
        <div className="grid gap-x-6 gap-y-2 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          <Metric
            label={`Supplier Purchases in FY ${d.financial_year || ""} (before this invoice)`}
            value={inr(prior)}
          />
          <Metric label="This Invoice (Grand Total)" value={inr(amount)} />
          <Metric label="New Cumulative Total" value={inr(next)} />
          <Metric label="TDS Threshold Limit" value={inr(threshold)} />
          <Metric
            label="TDS Applicable Amount"
            value={inr(d.tds_applicable_amount)}
          />
          <Metric
            label="TDS Rate"
            value={`${Number(d.tds_percentage || 0).toFixed(2)}%`}
          />
          <Metric
            label="TDS Deducted"
            value={`- ${inr(tdsAmount)}`}
            tone={tdsAmount > 0 ? "text-red-600" : "text-gray-900"}
          />
          <Metric
            label="Net Payable (Grand Total - TDS)"
            value={inr(d.net_payable_amount)}
            strong
            tone="text-amber-900"
          />
        </div>
        <div className="text-[11px] text-gray-500 mt-2">
          TDS is calculated on the invoice Grand Total together with this
          supplier's earlier invoices in the financial year. The server
          recalculates it when the invoice is saved.
        </div>
      </>
    ),
  });
}

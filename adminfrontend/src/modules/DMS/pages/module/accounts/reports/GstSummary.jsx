/**
 * GST Summary — output tax on sales against input tax on purchases, with
 * HSN-wise and rate-wise breakups in the shape GSTR-1 and GSTR-3B expect.
 *
 * This is a management view, not a filing-ready return: sales tax is derived
 * rather than posted, and the system holds no place-of-supply on the document.
 */
import React, { useCallback, useMemo, useState } from "react";
import { Tabs, Tag, Alert } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import VoucherDrawer from "../components/VoucherDrawer";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  qtyCol,
  viewCol,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { buildGstSummary } from "../lib/accounting";
import { inr, sumBy, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const GstSummary = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("summary");
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({ withSalesDetail: true });

  const gst = useMemo(
    () =>
      buildGstSummary({
        salesVouchers: book.salesVouchers,
        purchaseVouchers: book.purchaseVouchers,
        range,
      }),
    [book.salesVouchers, book.purchaseVouchers, range],
  );

  const match = useCallback(
    (v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        String(v.party || v.hsn || "").toLowerCase().includes(q) ||
        String(v.voucherNo || "").toLowerCase().includes(q)
      );
    },
    [search],
  );

  const outwardRows = useMemo(() => gst.sales.filter(match), [gst.sales, match]);
  const inwardRows = useMemo(() => gst.purchases.filter(match), [gst.purchases, match]);
  const hsnRows = useMemo(() => gst.hsn.filter(match), [gst.hsn, match]);

  /* --------------------------- 3B-style summary -------------------------- */
  const summaryRows = [
    {
      key: "out",
      particulars: "Outward supplies (Sales)",
      taxable: gst.outward.taxable,
      cgst: gst.outward.cgst,
      sgst: gst.outward.sgst,
      igst: gst.outward.igst,
      total: gst.outward.tax,
      docs: gst.outward.count,
    },
    {
      key: "in",
      particulars: "Inward supplies (Purchases) — Input Tax Credit",
      taxable: gst.inward.taxable,
      cgst: gst.inward.cgst,
      sgst: gst.inward.sgst,
      igst: gst.inward.igst,
      total: gst.inward.tax,
      docs: gst.inward.count,
    },
    {
      key: "net",
      particulars:
        gst.net.total >= 0 ? "Net GST Payable" : "Net Input Credit Carried Forward",
      taxable: null,
      cgst: Math.abs(gst.net.cgst),
      sgst: Math.abs(gst.net.sgst),
      igst: Math.abs(gst.net.igst),
      total: Math.abs(gst.net.total),
      docs: null,
      isNet: true,
    },
  ];

  const summaryColumns = [
    textCol("Particulars", "particulars", {
      width: 320,
      render: (v, r) => (
        <span className={r.isNet ? "font-bold text-amber-900" : "text-amber-800"}>{v}</span>
      ),
    }),
    { ...textCol("Documents", "docs"), width: 110, align: "right" },
    amountCol("Taxable Value", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Total Tax", "total", {
      render: (v, r) => (
        <span className={r.isNet ? "font-bold text-amber-900 tabular-nums" : "text-amber-800 tabular-nums"}>
          {inr(v)}
        </span>
      ),
    }),
  ];

  const supplyColumns = (isOutward) => [
    dateCol("Date", "date"),
    textCol(isOutward ? "Invoice No" : "Bill No", "voucherNo", { width: 150 }),
    textCol(isOutward ? "Customer" : "Supplier", "party", { width: 200 }),
    textCol("GSTIN", "partyGstin", { width: 150 }),
    textCol("Place of Supply", "partyState", { width: 150 }),
    {
      ...textCol("Type", "intra"),
      width: 120,
      render: (v) => (
        <Tag color={v ? "blue" : "purple"}>{v ? "Intra-state" : "Inter-state"}</Tag>
      ),
    },
    amountCol("Taxable", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Total", "total"),
    viewCol(setVoucher),
  ];

  const hsnColumns = [
    {
      ...textCol("Direction", "direction"),
      width: 110,
      render: (v) => <Tag color={v === "Outward" ? "gold" : "blue"}>{v}</Tag>,
    },
    textCol("HSN / SAC", "hsn", { width: 130 }),
    textCol("UOM", "uom", { width: 90 }),
    qtyCol("Quantity", "qty"),
    amountCol("Taxable Value", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Total Value", "total"),
  ];

  const rateColumns = [
    {
      ...textCol("Direction", "direction"),
      width: 110,
      render: (v) => <Tag color={v === "Outward" ? "gold" : "blue"}>{v}</Tag>,
    },
    {
      ...amountCol("GST Rate", "rate"),
      width: 110,
      render: (v) => <span className="text-amber-800">{num(v)}%</span>,
    },
    amountCol("Taxable Value", "taxable"),
    amountCol("Tax Amount", "tax"),
  ];

  const outwardTotals = {
    taxable: sumBy(outwardRows, "taxable"),
    cgst: sumBy(outwardRows, "cgst"),
    sgst: sumBy(outwardRows, "sgst"),
    igst: sumBy(outwardRows, "igst"),
    total: sumBy(outwardRows, "total"),
  };
  const inwardTotals = {
    taxable: sumBy(inwardRows, "taxable"),
    cgst: sumBy(inwardRows, "cgst"),
    sgst: sumBy(inwardRows, "sgst"),
    igst: sumBy(inwardRows, "igst"),
    total: sumBy(inwardRows, "total"),
  };
  const hsnTotals = {
    qty: sumBy(hsnRows, "qty"),
    taxable: sumBy(hsnRows, "taxable"),
    cgst: sumBy(hsnRows, "cgst"),
    sgst: sumBy(hsnRows, "sgst"),
    igst: sumBy(hsnRows, "igst"),
    total: sumBy(hsnRows, "total"),
  };

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () =>
    printReport({
      title: "GST Summary",
      orgName: book.ctx?.orgName,
      period,
      meta: [{ label: "Company GSTIN", value: book.ctx?.orgGstin || "-" }],
      sections: [
        {
          heading: "Tax position",
          columns: [
            { title: "Particulars", key: "particulars" },
            { title: "Taxable Value", key: "taxable", numeric: true },
            { title: "CGST", key: "cgst", numeric: true },
            { title: "SGST", key: "sgst", numeric: true },
            { title: "IGST", key: "igst", numeric: true },
            { title: "Total Tax", key: "total", numeric: true },
          ],
          rows: summaryRows,
        },
        {
          heading: "HSN / SAC summary",
          columns: [
            { title: "Direction", key: "direction" },
            { title: "HSN", key: "hsn" },
            { title: "UOM", key: "uom" },
            { title: "Qty", key: "qty", numeric: true },
            { title: "Taxable", key: "taxable", numeric: true },
            { title: "CGST", key: "cgst", numeric: true },
            { title: "SGST", key: "sgst", numeric: true },
            { title: "IGST", key: "igst", numeric: true },
          ],
          rows: hsnRows,
          totals: { label: "Total", ...hsnTotals },
        },
        {
          heading: "Registered vs unregistered (outward)",
          kv: [
            { label: "B2B invoices", value: `${gst.b2b.count} — ${inr(gst.b2b.taxable)} taxable` },
            { label: "B2C invoices", value: `${gst.b2c.count} — ${inr(gst.b2c.taxable)} taxable` },
          ],
        },
      ],
      note:
        "MANAGEMENT VIEW, NOT A FILING RETURN. Output tax is derived from GST-inclusive sales rates and the product master's GST rate; input tax is as posted on purchase invoices. The CGST/SGST vs IGST split is inferred from party state versus company state, because the documents do not store a place of supply. Reconcile against your filed returns before use.",
    });

  const handleExcel = () => {
    const map = {
      summary: () =>
        exportToExcel(
          summaryRows.map((r) => ({
            Particulars: r.particulars,
            Documents: r.docs,
            "Taxable Value": r.taxable,
            CGST: r.cgst,
            SGST: r.sgst,
            IGST: r.igst,
            "Total Tax": r.total,
          })),
          "gst-summary",
          "GST Summary",
        ),
      outward: () =>
        exportToExcel(
          outwardRows.map((r) => ({
            Date: fmtDate(r.date),
            "Invoice No": r.voucherNo,
            Customer: r.party,
            GSTIN: r.partyGstin,
            "Place of Supply": r.partyState,
            Type: r.intra ? "Intra-state" : "Inter-state",
            Taxable: num(r.taxable),
            CGST: num(r.cgst),
            SGST: num(r.sgst),
            IGST: num(r.igst),
            Total: num(r.total),
          })),
          "gst-outward",
          "Outward",
        ),
      inward: () =>
        exportToExcel(
          inwardRows.map((r) => ({
            Date: fmtDate(r.date),
            "Bill No": r.voucherNo,
            Supplier: r.party,
            GSTIN: r.partyGstin,
            Taxable: num(r.taxable),
            CGST: num(r.cgst),
            SGST: num(r.sgst),
            IGST: num(r.igst),
            Total: num(r.total),
          })),
          "gst-inward",
          "Inward",
        ),
      hsn: () =>
        exportToExcel(
          hsnRows.map((r) => ({
            Direction: r.direction,
            HSN: r.hsn,
            UOM: r.uom,
            Quantity: num(r.qty),
            "Taxable Value": num(r.taxable),
            CGST: num(r.cgst),
            SGST: num(r.sgst),
            IGST: num(r.igst),
            Total: num(r.total),
          })),
          "gst-hsn-summary",
          "HSN",
        ),
      rates: () =>
        exportToExcel(
          gst.rates.map((r) => ({
            Direction: r.direction,
            "GST Rate": `${r.rate}%`,
            "Taxable Value": r.taxable,
            "Tax Amount": r.tax,
          })),
          "gst-rate-summary",
          "Rates",
        ),
    };
    (map[tab] || map.summary)();
  };

  return (
    <>
      <ReportShell
        title="GST Summary"
        subtitle="Output tax on sales against input tax on purchases"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Party, invoice, HSN"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        summary={
          <>
            <Alert
              type="warning"
              showIcon
              className="mb-4"
              message="Management view — not a filing return"
              description="Output tax is derived from GST-inclusive sales rates and the product master's GST rate, since sales invoices store no tax breakup. Input tax is as posted on purchase invoices. The CGST/SGST vs IGST split is inferred from party state against company state. Reconcile with your filed GSTR-1 and GSTR-3B before relying on these figures."
            />
            <SummaryCards
              items={[
                { label: "Output Tax", value: inr(gst.outward.tax), sub: `${gst.outward.count} invoices`, tone: "amber" },
                { label: "Input Tax Credit", value: inr(gst.inward.tax), sub: `${gst.inward.count} bills`, tone: "blue" },
                {
                  label: gst.net.total >= 0 ? "Net Payable" : "Credit Carried Fwd",
                  value: inr(Math.abs(gst.net.total)),
                  tone: gst.net.total >= 0 ? "red" : "green",
                },
                { label: "Outward Taxable", value: inr(gst.outward.taxable) },
                { label: "B2B / B2C", value: `${gst.b2b.count} / ${gst.b2c.count}`, tone: "slate", hint: "Split by whether the customer has a GSTIN on file" },
              ]}
            />
          </>
        }
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: "summary",
              label: "Tax Position",
              children: (
                <ReportTable
                  columns={summaryColumns}
                  dataSource={summaryRows}
                  scrollX={1100}
                  pageSize={10}
                />
              ),
            },
            {
              key: "outward",
              label: `Outward (${outwardRows.length})`,
              children: (
                <ReportTable
                  columns={supplyColumns(true)}
                  dataSource={outwardRows}
                  totals={outwardTotals}
                  scrollX={1700}
                />
              ),
            },
            {
              key: "inward",
              label: `Inward (${inwardRows.length})`,
              children: (
                <ReportTable
                  columns={supplyColumns(false)}
                  dataSource={inwardRows}
                  totals={inwardTotals}
                  scrollX={1700}
                />
              ),
            },
            {
              key: "hsn",
              label: "HSN Summary",
              children: (
                <ReportTable
                  columns={hsnColumns}
                  dataSource={hsnRows}
                  totals={hsnTotals}
                  scrollX={1250}
                />
              ),
            },
            {
              key: "rates",
              label: "Rate-wise",
              children: (
                <ReportTable
                  columns={rateColumns}
                  dataSource={gst.rates}
                  totals={{
                    taxable: sumBy(gst.rates, "taxable"),
                    tax: sumBy(gst.rates, "tax"),
                  }}
                  scrollX={700}
                />
              ),
            },
          ]}
        />
      </ReportShell>

      <VoucherDrawer
        voucher={voucher}
        open={Boolean(voucher)}
        onClose={() => setVoucher(null)}
        orgName={book.ctx?.orgName}
      />
    </>
  );
};

export default GstSummary;

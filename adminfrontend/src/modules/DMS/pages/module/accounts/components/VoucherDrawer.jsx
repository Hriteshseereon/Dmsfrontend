/**
 * Tally-style voucher display.
 * Opens from the "View" action on any register, shows the accounting effect,
 * tax breakup, item lines, and offers a PDF of the voucher.
 */
import React from "react";
import { Drawer, Descriptions, Button, Tag, Empty, Divider, Space } from "antd";
import { FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import ReportTable, {
  textCol,
  amountCol,
  qtyCol,
  VoucherTypeTag,
} from "./ReportTable";
import { inr, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";

const LedgerEffect = ({ voucher }) => {
  const amount = num(voucher.net ?? voucher.total ?? voucher.amount);
  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden mb-4 shadow-2xs">
      <div className="bg-amber-50/80 px-3.5 py-2 text-amber-900 font-bold text-xs uppercase tracking-wide border-b border-amber-200">
        Accounting Ledger Effect
      </div>
      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-amber-100/60 hover:bg-amber-50/30">
            <td className="px-3.5 py-2 text-gray-900 font-bold">
              Dr &nbsp; <span className="text-amber-900">{voucher.debitLedger}</span>
            </td>
            <td className="px-3.5 py-2 text-right tabular-nums font-bold text-gray-900">
              {inr(amount)}
            </td>
            <td className="px-3.5 py-2 text-right w-16 font-bold text-volcano-600">Dr</td>
          </tr>
          <tr className="hover:bg-amber-50/30">
            <td className="px-3.5 py-2 pl-8 text-gray-900 font-semibold">
              Cr &nbsp; <span className="text-amber-900">{voucher.creditLedger}</span>
            </td>
            <td className="px-3.5 py-2 text-right tabular-nums font-bold text-gray-900">
              {inr(amount)}
            </td>
            <td className="px-3.5 py-2 text-right font-bold text-green-700">Cr</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const TaxBlock = ({ voucher }) => {
  const rows = [
    ["Taxable Value", voucher.taxable],
    ["CGST", voucher.cgst],
    ["SGST", voucher.sgst],
    ["IGST", voucher.igst],
    ["Round Off", voucher.roundOff],
    voucher.adjustment ? ["Less: Wallet Adjustment", -num(voucher.adjustment)] : null,
  ].filter(Boolean);

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="bg-amber-50/80 px-3.5 py-2 text-amber-900 font-bold text-xs uppercase tracking-wide flex justify-between items-center border-b border-amber-200">
        <span>Tax &amp; Invoice Breakup</span>
        <Tag color={voucher.taxBasis === "posted" ? "success" : "orange"} className="font-bold">
          {voucher.taxBasis === "posted" ? "As Posted" : "Derived"}
        </Tag>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-amber-100/60 last:border-0 hover:bg-amber-50/30">
              <td className="px-3.5 py-2 text-gray-700 font-medium">{label}</td>
              <td className="px-3.5 py-2 text-right tabular-nums font-semibold text-gray-900">
                {inr(value)}
              </td>
            </tr>
          ))}
          <tr className="bg-amber-50/90 border-t border-amber-200">
            <td className="px-3.5 py-2.5 text-amber-950 font-black text-sm">Invoice Net Total</td>
            <td className="px-3.5 py-2.5 text-right tabular-nums text-amber-950 font-black text-base">
              {inr(voucher.net ?? voucher.total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ITEM_COLUMNS = [
  textCol("Item Description", "product", { width: 220 }),
  textCol("HSN Code", "hsn", { width: 100 }),
  textCol("UOM", "uom", { width: 80 }),
  qtyCol("Qty", "qty"),
  amountCol("Rate (₹)", "rate"),
  amountCol("Taxable (₹)", "taxable"),
  {
    ...amountCol("GST %", "gstPct"),
    width: 80,
    render: (v) => <span className="font-semibold text-gray-800">{num(v) ? `${num(v)}%` : "-"}</span>,
  },
  amountCol("GST (₹)", "gst"),
  amountCol("Total (₹)", "amount"),
];

const VoucherDrawer = ({ voucher, open, onClose, orgName }) => {
  if (!voucher) return null;

  const handlePdf = () => {
    printReport({
      title: `${voucher.type} Voucher — ${voucher.voucherNo}`,
      orgName,
      portrait: true,
      meta: [
        { label: "Date", value: fmtDate(voucher.date) },
        { label: "Party", value: voucher.party },
        voucher.refNo && voucher.refNo !== "-"
          ? { label: "Reference", value: voucher.refNo }
          : null,
      ].filter(Boolean),
      sections: [
        {
          heading: "Voucher details",
          kv: [
            { label: "Voucher No", value: voucher.voucherNo },
            { label: "Voucher Type", value: voucher.type },
            { label: "Date", value: fmtDate(voucher.date) },
            { label: "Party", value: voucher.party },
            { label: "Party GSTIN", value: voucher.partyGstin || "-" },
            { label: "Place of Supply", value: voucher.partyState || "-" },
            { label: "Dr", value: voucher.debitLedger },
            { label: "Cr", value: voucher.creditLedger },
          ],
        },
        voucher.items?.length
          ? {
              heading: "Items",
              columns: [
                { title: "Item", key: "product" },
                { title: "HSN", key: "hsn" },
                { title: "UOM", key: "uom" },
                { title: "Qty", key: "qty", numeric: true },
                { title: "Rate", key: "rate", numeric: true },
                { title: "Taxable", key: "taxable", numeric: true },
                { title: "GST", key: "gst", numeric: true },
                { title: "Amount", key: "amount", numeric: true },
              ],
              rows: voucher.items.map((i) => ({
                product: i.product,
                hsn: i.hsn,
                uom: i.uom,
                qty: i.qty,
                rate: i.rate,
                taxable: i.taxable,
                gst: i.gst,
                amount: i.amount,
              })),
            }
          : null,
      ].filter(Boolean),
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={780}
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-amber-600 text-xl" />
          <span className="text-amber-900 font-bold text-lg">
            {voucher.type} Voucher: {voucher.voucherNo}
          </span>
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handlePdf}
          className="bg-amber-700! border-amber-700! hover:bg-amber-800! text-white! font-semibold"
        >
          Print PDF
        </Button>
      }
    >
      <Descriptions
        column={2}
        size="small"
        bordered
        className="mb-4"
        labelStyle={{ color: "#78350f", fontWeight: 700, width: 140, backgroundColor: "#fef3c7" }}
        contentStyle={{ fontWeight: 600, color: "#111827" }}
      >
        <Descriptions.Item label="Party">{voucher.party}</Descriptions.Item>
        <Descriptions.Item label="Party Type">{voucher.partyType}</Descriptions.Item>
        <Descriptions.Item label="GSTIN">{voucher.partyGstin || "-"}</Descriptions.Item>
        <Descriptions.Item label="Place of Supply">
          {voucher.partyState || "-"}{" "}
          {voucher.intra !== undefined && (
            <Tag color={voucher.intra ? "blue" : "purple"} className="ml-1 font-bold">
              {voucher.intra ? "Intra-state" : "Inter-state"}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Reference">{voucher.refNo || "-"}</Descriptions.Item>
        <Descriptions.Item label="Due Date">
          {voucher.dueDate ? fmtDate(voucher.dueDate) : "-"}
        </Descriptions.Item>
        {voucher.ewayBill && (
          <Descriptions.Item label="E-Way Bill">{voucher.ewayBill}</Descriptions.Item>
        )}
        {voucher.vehicleNo && (
          <Descriptions.Item label="Vehicle">{voucher.vehicleNo}</Descriptions.Item>
        )}
        <Descriptions.Item label="Narration" span={2}>
          {voucher.narration || "-"}
        </Descriptions.Item>
      </Descriptions>

      <LedgerEffect voucher={voucher} />

      <div className="text-amber-900 font-bold text-sm mb-2 uppercase tracking-wide">
        Document Line Items
      </div>
      {voucher.items?.length ? (
        <div className="border border-amber-200 rounded-lg overflow-hidden shadow-2xs mb-4">
          <ReportTable
            columns={ITEM_COLUMNS}
            dataSource={voucher.items}
            scrollX={850}
            pageSize={50}
            size="small"
            totals={{
              qty: voucher.items.reduce((a, i) => a + num(i.qty), 0),
              taxable: voucher.taxable,
              gst: voucher.gst,
              amount: voucher.total,
            }}
          />
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4 text-center">
          <Empty
            description={
              voucher.hasDetail === false
                ? "Line items are not loaded for this document"
                : "This document carries no item lines"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      <TaxBlock voucher={voucher} />
    </Drawer>
  );
};

export default VoucherDrawer;

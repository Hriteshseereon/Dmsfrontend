/**
 * Sales Register — Tally's "Display > Account Books > Sales Register".
 *
 * Opens month-wise (as Tally does), drills into the vouchers of a month,
 * and each voucher opens as a full voucher view.
 */
import React, { useMemo, useState } from "react";
import { Button, Segmented } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import VoucherDrawer from "../components/VoucherDrawer";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  viewCol,
  th,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { filterPeriod, groupByMonth } from "../lib/accounting";
import { inr, monthLabel, sumBy, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const SalesRegister = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Month-wise");
  const [openMonth, setOpenMonth] = useState(null);
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({ withSalesDetail: true });
  const { salesVouchers, ctx } = book;

  const periodRows = useMemo(
    () => filterPeriod(salesVouchers, range),
    [salesVouchers, range],
  );

  const searched = useMemo(() => {
    if (!search.trim()) return periodRows;
    const q = search.toLowerCase();
    return periodRows.filter(
      (r) =>
        String(r.voucherNo).toLowerCase().includes(q) ||
        String(r.party).toLowerCase().includes(q) ||
        String(r.refNo).toLowerCase().includes(q),
    );
  }, [periodRows, search]);

  const months = useMemo(
    () => groupByMonth(searched, ["taxable", "cgst", "sgst", "igst", "gst", "total"]),
    [searched],
  );

  const monthRows = useMemo(
    () => months.find((m) => m.month === openMonth)?.rows || [],
    [months, openMonth],
  );

  const showingVouchers = view === "Voucher-wise" || openMonth;
  const voucherRows = openMonth ? monthRows : searched;

  const totals = useMemo(
    () => ({
      taxable: sumBy(voucherRows, "taxable"),
      cgst: sumBy(voucherRows, "cgst"),
      sgst: sumBy(voucherRows, "sgst"),
      igst: sumBy(voucherRows, "igst"),
      total: sumBy(voucherRows, "total"),
      adjustment: sumBy(voucherRows, "adjustment"),
      net: sumBy(voucherRows, "net"),
    }),
    [voucherRows],
  );

  const monthColumns = [
    {
      ...textCol("Month", "month"),
      width: 140,
      render: (v) => (
        <Button
          type="link"
          className="text-amber-800! font-semibold p-0!"
          onClick={() => setOpenMonth(v)}
        >
          {monthLabel(v)}
        </Button>
      ),
    },
    { ...textCol("Vouchers", "count"), width: 100, align: "right" },
    amountCol("Taxable Value", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Invoice Total", "total"),
    {
      title: th("Action"),
      key: "act",
      width: 90,
      render: (_, r) => (
        <Button
          size="small"
          type="link"
          className="text-amber-700! p-0!"
          onClick={() => setOpenMonth(r.month)}
        >
          View
        </Button>
      ),
    },
  ];

  const voucherColumns = [
    dateCol("Date", "date"),
    textCol("Invoice No", "voucherNo", { width: 150 }),
    textCol("Order Ref", "refNo", { width: 130 }),
    textCol("Party", "party", { width: 200 }),
    textCol("GSTIN", "partyGstin", { width: 150 }),
    amountCol("Taxable", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Invoice Total", "total"),
    amountCol("Adjustment", "adjustment"),
    amountCol("Net Receivable", "net"),
    viewCol(setVoucher),
  ];

  const monthTotals = useMemo(
    () => ({
      count: months.reduce((a, m) => a + m.count, 0),
      taxable: sumBy(months, "taxable"),
      cgst: sumBy(months, "cgst"),
      sgst: sumBy(months, "sgst"),
      igst: sumBy(months, "igst"),
      total: sumBy(months, "total"),
    }),
    [months],
  );

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () => {
    if (showingVouchers) {
      printReport({
        title: `Sales Register — Voucher-wise${
          openMonth ? ` (${monthLabel(openMonth)})` : ""
        }`,
        orgName: ctx?.orgName,
        period,
        sections: [
          {
            columns: [
              { title: "Date", value: (r) => fmtDate(r.date) },
              { title: "Invoice No", key: "voucherNo" },
              { title: "Party", key: "party" },
              { title: "GSTIN", key: "partyGstin" },
              { title: "Taxable", key: "taxable", numeric: true },
              { title: "CGST", key: "cgst", numeric: true },
              { title: "SGST", key: "sgst", numeric: true },
              { title: "IGST", key: "igst", numeric: true },
              { title: "Total", key: "total", numeric: true },
            ],
            rows: voucherRows,
            totals: { label: "Total", ...totals },
          },
        ],
        note:
          "Sales tax is derived: sales invoices do not store a tax breakup, so taxable value and GST are back-calculated from the GST-inclusive invoice rate and the product master's GST rate.",
      });
    } else {
      printReport({
        title: "Sales Register — Month-wise",
        orgName: ctx?.orgName,
        period,
        sections: [
          {
            columns: [
              { title: "Month", value: (r) => monthLabel(r.month) },
              { title: "Vouchers", key: "count", numeric: true },
              { title: "Taxable", key: "taxable", numeric: true },
              { title: "CGST", key: "cgst", numeric: true },
              { title: "SGST", key: "sgst", numeric: true },
              { title: "IGST", key: "igst", numeric: true },
              { title: "Total", key: "total", numeric: true },
            ],
            rows: months,
            totals: { label: "Total", ...monthTotals },
          },
        ],
        note:
          "Sales tax is derived from the GST-inclusive invoice rate and the product master's GST rate.",
      });
    }
  };

  const handleExcel = () => {
    const rows = showingVouchers
      ? voucherRows.map((r) => ({
          Date: fmtDate(r.date),
          "Invoice No": r.voucherNo,
          "Order Ref": r.refNo,
          Party: r.party,
          GSTIN: r.partyGstin,
          "Taxable Value": num(r.taxable),
          CGST: num(r.cgst),
          SGST: num(r.sgst),
          IGST: num(r.igst),
          "Invoice Total": num(r.total),
          Adjustment: num(r.adjustment),
          "Net Receivable": num(r.net),
        }))
      : months.map((m) => ({
          Month: monthLabel(m.month),
          Vouchers: m.count,
          "Taxable Value": m.taxable,
          CGST: m.cgst,
          SGST: m.sgst,
          IGST: m.igst,
          "Invoice Total": m.total,
        }));
    exportToExcel(rows, "sales-register", "Sales Register");
  };

  return (
    <>
      <ReportShell
        title="Sales Register"
        subtitle="Outward supplies booked from sales invoices"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Invoice no, party, order ref"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        basisNote="Sales invoices do not store a tax breakup. Taxable value and GST here are back-calculated from the GST-inclusive invoice rate and each product's GST rate, and split into CGST/SGST or IGST by comparing the customer's state with the company's state."
        extra={
          openMonth ? (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setOpenMonth(null)}
              className="border-amber-400! text-amber-700!"
            >
              {monthLabel(openMonth)}
            </Button>
          ) : (
            <Segmented
              options={["Month-wise", "Voucher-wise"]}
              value={view}
              onChange={setView}
            />
          )
        }
        summary={
          <SummaryCards
            items={[
              { label: "Invoices", value: voucherRows.length, tone: "slate" },
              { label: "Taxable Value", value: inr(totals.taxable) },
              { label: "Total GST", value: inr(totals.cgst + totals.sgst + totals.igst), tone: "blue" },
              { label: "Invoice Total", value: inr(totals.total), tone: "green" },
              { label: "Net Receivable", value: inr(totals.net), tone: "amber" },
            ]}
          />
        }
      >
        {showingVouchers ? (
          <ReportTable
            columns={voucherColumns}
            dataSource={voucherRows}
            totals={totals}
            scrollX={1700}
          />
        ) : (
          <ReportTable
            columns={monthColumns}
            dataSource={months}
            rowKey="month"
            totals={monthTotals}
            scrollX={1000}
          />
        )}
      </ReportShell>

      <VoucherDrawer
        voucher={voucher}
        open={Boolean(voucher)}
        onClose={() => setVoucher(null)}
        orgName={ctx?.orgName}
      />
    </>
  );
};

export default SalesRegister;

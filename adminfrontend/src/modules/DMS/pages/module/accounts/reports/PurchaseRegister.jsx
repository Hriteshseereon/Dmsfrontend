/**
 * Purchase Register — Tally's "Display > Account Books > Purchase Register".
 *
 * This is the strongest data in the section: purchase invoices genuinely
 * store taxable value, GST and grand total, so nothing is derived except the
 * CGST/SGST split for in-state vendors.
 */
import React, { useMemo, useState } from "react";
import { Button, Segmented, Tag } from "antd";
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
import { inr, monthLabel, sumBy, fmtDate, num, toDate } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";
import dayjs from "dayjs";

const PurchaseRegister = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Month-wise");
  const [openMonth, setOpenMonth] = useState(null);
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook();
  const { purchaseVouchers, ctx } = book;

  const periodRows = useMemo(
    () => filterPeriod(purchaseVouchers, range),
    [purchaseVouchers, range],
  );

  const searched = useMemo(() => {
    if (!search.trim()) return periodRows;
    const q = search.toLowerCase();
    return periodRows.filter(
      (r) =>
        String(r.voucherNo).toLowerCase().includes(q) ||
        String(r.party).toLowerCase().includes(q) ||
        String(r.ewayBill).toLowerCase().includes(q) ||
        String(r.vehicleNo).toLowerCase().includes(q),
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
      roundOff: sumBy(voucherRows, "roundOff"),
      total: sumBy(voucherRows, "total"),
    }),
    [voucherRows],
  );

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

  const today = dayjs();

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
    { ...textCol("Bills", "count"), width: 90, align: "right" },
    amountCol("Taxable Value", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Bill Total", "total"),
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
    dateCol("Bill Date", "date"),
    textCol("Bill No", "voucherNo", { width: 150 }),
    textCol("Supplier", "party", { width: 200 }),
    textCol("GSTIN", "partyGstin", { width: 150 }),
    textCol("E-Way Bill", "ewayBill", { width: 130 }),
    textCol("Vehicle", "vehicleNo", { width: 120 }),
    amountCol("Taxable", "taxable"),
    amountCol("CGST", "cgst"),
    amountCol("SGST", "sgst"),
    amountCol("IGST", "igst"),
    amountCol("Round Off", "roundOff"),
    amountCol("Bill Total", "total"),
    {
      ...dateCol("Due Date", "dueDate"),
      width: 140,
      render: (v) => {
        const d = toDate(v);
        if (!d) return <span className="text-amber-800">-</span>;
        const overdue = d.isBefore(today, "day");
        return (
          <span className="text-amber-800">
            {fmtDate(v)}{" "}
            {overdue && (
              <Tag color="red" className="ml-1">
                {today.diff(d, "day")}d
              </Tag>
            )}
          </span>
        );
      },
    },
    viewCol(setVoucher),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () =>
    printReport({
      title: showingVouchers
        ? `Purchase Register — Voucher-wise${
            openMonth ? ` (${monthLabel(openMonth)})` : ""
          }`
        : "Purchase Register — Month-wise",
      orgName: ctx?.orgName,
      period,
      sections: [
        showingVouchers
          ? {
              columns: [
                { title: "Date", value: (r) => fmtDate(r.date) },
                { title: "Bill No", key: "voucherNo" },
                { title: "Supplier", key: "party" },
                { title: "GSTIN", key: "partyGstin" },
                { title: "Taxable", key: "taxable", numeric: true },
                { title: "CGST", key: "cgst", numeric: true },
                { title: "SGST", key: "sgst", numeric: true },
                { title: "IGST", key: "igst", numeric: true },
                { title: "Bill Total", key: "total", numeric: true },
                { title: "Due Date", value: (r) => fmtDate(r.dueDate) },
              ],
              rows: voucherRows,
              totals: { label: "Total", ...totals },
            }
          : {
              columns: [
                { title: "Month", value: (r) => monthLabel(r.month) },
                { title: "Bills", key: "count", numeric: true },
                { title: "Taxable", key: "taxable", numeric: true },
                { title: "CGST", key: "cgst", numeric: true },
                { title: "SGST", key: "sgst", numeric: true },
                { title: "IGST", key: "igst", numeric: true },
                { title: "Bill Total", key: "total", numeric: true },
              ],
              rows: months,
              totals: { label: "Total", ...monthTotals },
            },
      ],
      note:
        "Taxable value and GST are taken as posted by the purchase invoice. Where the supplier is in the same state as the company, the posted IGST is presented as CGST + SGST.",
    });

  const handleExcel = () => {
    const rows = showingVouchers
      ? voucherRows.map((r) => ({
          "Bill Date": fmtDate(r.date),
          "Bill No": r.voucherNo,
          Supplier: r.party,
          GSTIN: r.partyGstin,
          "E-Way Bill": r.ewayBill,
          Vehicle: r.vehicleNo,
          "Taxable Value": num(r.taxable),
          CGST: num(r.cgst),
          SGST: num(r.sgst),
          IGST: num(r.igst),
          "Round Off": num(r.roundOff),
          "Bill Total": num(r.total),
          "Due Date": fmtDate(r.dueDate),
        }))
      : months.map((m) => ({
          Month: monthLabel(m.month),
          Bills: m.count,
          "Taxable Value": m.taxable,
          CGST: m.cgst,
          SGST: m.sgst,
          IGST: m.igst,
          "Bill Total": m.total,
        }));
    exportToExcel(rows, "purchase-register", "Purchase Register");
  };

  return (
    <>
      <ReportShell
        title="Purchase Register"
        subtitle="Inward supplies booked from purchase invoices"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Bill no, supplier, e-way bill"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        error={book.isError ? book.error : null}
        basisNote="Taxable value and GST are taken exactly as posted on the purchase invoice. Only the CGST/SGST split is derived, by comparing the supplier's state with the company's state."
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
              { label: "Bills", value: voucherRows.length, tone: "slate" },
              { label: "Taxable Value", value: inr(totals.taxable) },
              { label: "Input GST", value: inr(totals.cgst + totals.sgst + totals.igst), tone: "blue" },
              { label: "Bill Total", value: inr(totals.total), tone: "red" },
            ]}
          />
        }
      >
        {showingVouchers ? (
          <ReportTable
            columns={voucherColumns}
            dataSource={voucherRows}
            totals={totals}
            scrollX={1900}
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

export default PurchaseRegister;

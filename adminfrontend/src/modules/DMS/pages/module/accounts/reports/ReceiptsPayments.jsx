/**
 * Receipts & Payments.
 *
 * Two money streams exist in the DMS and both land here:
 *   - Customer wallet entries (collections and adjustments)
 *   - Freight rows: shortage claims recovered from transporters are receipts,
 *     advances and balance settlements are payments.
 */
import React, { useMemo, useState } from "react";
import { Segmented, Tabs, Tag } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import VoucherDrawer from "../components/VoucherDrawer";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  qtyCol,
  viewCol,
  typeCol,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { filterPeriod, VOUCHER_TYPES } from "../lib/accounting";
import { inr, sumBy, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const ReceiptsPayments = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("customer");
  const [direction, setDirection] = useState("All");
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({ withWallet: true });

  /* ---------------- Customer collections ---------------- */
  const customerRows = useMemo(() => {
    let rows = filterPeriod(book.walletVouchers, range);
    if (direction === "Receipts")
      rows = rows.filter((r) => r.type === VOUCHER_TYPES.RECEIPT);
    if (direction === "Payments")
      rows = rows.filter((r) => r.type === VOUCHER_TYPES.PAYMENT);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          String(r.party).toLowerCase().includes(q) ||
          String(r.narration).toLowerCase().includes(q) ||
          String(r.entryType).toLowerCase().includes(q),
      );
    }
    return rows;
  }, [book.walletVouchers, range, direction, search]);

  const customerTotals = useMemo(
    () => ({
      receipt: sumBy(customerRows, "receipt"),
      payment: sumBy(customerRows, "payment"),
    }),
    [customerRows],
  );

  const customerColumns = [
    dateCol("Date", "date"),
    typeCol("Type", "type"),
    {
      ...textCol("Entry", "entryType"),
      width: 130,
      render: (v) => <Tag color="gold">{v}</Tag>,
    },
    textCol("Customer", "party", { width: 220 }),
    textCol("Vch No", "voucherNo", { width: 150 }),
    amountCol("Receipt", "receipt"),
    amountCol("Payment", "payment"),
    amountCol("Credit Bal", "creditBalance"),
    amountCol("Debit Bal", "debitBalance"),
    textCol("Narration", "narration", { width: 250, ellipsis: true }),
    viewCol(setVoucher),
  ];

  /* ---------------- Freight recoveries ---------------- */
  const freightRows = useMemo(() => {
    let rows = filterPeriod(book.freightVouchers, range);
    if (direction === "Receipts") rows = rows.filter((r) => r.receipt > 0);
    if (direction === "Payments") rows = rows.filter((r) => r.payment > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          String(r.party).toLowerCase().includes(q) ||
          String(r.voucherNo).toLowerCase().includes(q) ||
          String(r.vehicle).toLowerCase().includes(q),
      );
    }
    return rows;
  }, [book.freightVouchers, range, direction, search]);

  const freightTotals = useMemo(
    () => ({
      freightAmount: sumBy(freightRows, "freightAmount"),
      advance: sumBy(freightRows, "advance"),
      claim: sumBy(freightRows, "claim"),
      other: sumBy(freightRows, "other"),
      commission: sumBy(freightRows, "commission"),
      balancePayable: sumBy(freightRows, "balancePayable"),
      balancePaid: sumBy(freightRows, "balancePaid"),
    }),
    [freightRows],
  );

  const freightColumns = [
    dateCol("LR Date", "date"),
    textCol("LR No", "voucherNo", { width: 140 }),
    textCol("Transporter", "party", { width: 190 }),
    textCol("Vehicle", "vehicle", { width: 130 }),
    textCol("PO Ref", "refNo", { width: 140 }),
    qtyCol("Gross Wt", "grossWeight"),
    amountCol("Freight Amt", "freightAmount"),
    amountCol("Advance Paid", "advance"),
    amountCol("Shortage Claim", "claim"),
    amountCol("Other Charges", "other"),
    amountCol("Commission", "commission"),
    amountCol("Balance Payable", "balancePayable"),
    amountCol("Balance Paid", "balancePaid"),
    viewCol(setVoucher),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;
  const isCustomer = tab === "customer";

  const handlePdf = () =>
    printReport({
      title: isCustomer
        ? "Receipts & Payments — Customer Collections"
        : "Receipts & Payments — Transporter Freight",
      orgName: book.ctx?.orgName,
      period,
      sections: [
        isCustomer
          ? {
              columns: [
                { title: "Date", value: (r) => fmtDate(r.date) },
                { title: "Type", key: "type" },
                { title: "Entry", key: "entryType" },
                { title: "Customer", key: "party" },
                { title: "Receipt", key: "receipt", numeric: true },
                { title: "Payment", key: "payment", numeric: true },
                { title: "Narration", key: "narration" },
              ],
              rows: customerRows,
              totals: { label: "Total", ...customerTotals },
            }
          : {
              columns: [
                { title: "LR Date", value: (r) => fmtDate(r.date) },
                { title: "LR No", key: "voucherNo" },
                { title: "Transporter", key: "party" },
                { title: "Vehicle", key: "vehicle" },
                { title: "Freight", key: "freightAmount", numeric: true },
                { title: "Advance", key: "advance", numeric: true },
                { title: "Shortage Claim", key: "claim", numeric: true },
                { title: "Other Charges", key: "other", numeric: true },
                { title: "Balance Payable", key: "balancePayable", numeric: true },
              ],
              rows: freightRows,
              totals: { label: "Total", ...freightTotals },
            },
      ],
      note: isCustomer
        ? "Customer collections come from the wallet ledger, the only record of money received. Entries carry no payment mode, instrument number or bank reference."
        : "Shortage claims are money recovered from the transporter (receipt side). Advances and balance settlements are money paid out. No payment date or mode is recorded against these.",
    });

  const handleExcel = () => {
    if (isCustomer) {
      exportToExcel(
        customerRows.map((r) => ({
          Date: fmtDate(r.date),
          Type: r.type,
          Entry: r.entryType,
          Customer: r.party,
          "Vch No": r.voucherNo,
          Receipt: num(r.receipt),
          Payment: num(r.payment),
          "Credit Balance": num(r.creditBalance),
          "Debit Balance": num(r.debitBalance),
          Narration: r.narration,
        })),
        "customer-collections",
        "Collections",
      );
    } else {
      exportToExcel(
        freightRows.map((r) => ({
          "LR Date": fmtDate(r.date),
          "LR No": r.voucherNo,
          Transporter: r.party,
          Vehicle: r.vehicle,
          "PO Ref": r.refNo,
          "Gross Weight": num(r.grossWeight),
          "Freight Amount": num(r.freightAmount),
          "Advance Paid": num(r.advance),
          "Shortage Claim": num(r.claim),
          "Other Charges": num(r.other),
          Commission: num(r.commission),
          "Balance Payable": num(r.balancePayable),
          "Balance Paid": num(r.balancePaid),
        })),
        "freight-receipts-payments",
        "Freight",
      );
    }
  };

  return (
    <>
      <ReportShell
        title="Receipts & Payments"
        subtitle="Customer collections and transporter freight settlements"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Party, voucher, vehicle"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        basisNote="Customer wallet entries are the only record of money received; freight shortage claims are treated as recoveries from the transporter and advances as payments out. None of these carry a payment mode, instrument number or bank reference."
        extra={
          <Segmented
            options={["All", "Receipts", "Payments"]}
            value={direction}
            onChange={setDirection}
          />
        }
        summary={
          isCustomer ? (
            <SummaryCards
              items={[
                { label: "Entries", value: customerRows.length, tone: "slate" },
                { label: "Total Received", value: inr(customerTotals.receipt), tone: "green" },
                { label: "Adjustments Out", value: inr(customerTotals.payment), tone: "red" },
                {
                  label: "Net Collection",
                  value: inr(customerTotals.receipt - customerTotals.payment),
                  tone: "blue",
                },
              ]}
            />
          ) : (
            <SummaryCards
              items={[
                { label: "LR Entries", value: freightRows.length, tone: "slate" },
                { label: "Freight Value", value: inr(freightTotals.freightAmount) },
                { label: "Shortage Recovered", value: inr(freightTotals.claim), tone: "green" },
                { label: "Advance Paid", value: inr(freightTotals.advance), tone: "red" },
                { label: "Balance Payable", value: inr(freightTotals.balancePayable), tone: "blue" },
              ]}
            />
          )
        }
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: "customer",
              label: "Customer Collections",
              children: (
                <ReportTable
                  columns={customerColumns}
                  dataSource={customerRows}
                  totals={customerTotals}
                  scrollX={1650}
                />
              ),
            },
            {
              key: "freight",
              label: "Transporter Freight",
              children: (
                <ReportTable
                  columns={freightColumns}
                  dataSource={freightRows}
                  totals={freightTotals}
                  scrollX={1850}
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

export default ReceiptsPayments;

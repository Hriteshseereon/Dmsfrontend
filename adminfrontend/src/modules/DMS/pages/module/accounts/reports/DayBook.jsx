/**
 * Day Book — Tally's "Display > Day Book".
 *
 * Every voucher the system produces, in date order, with the ledger effect
 * spelled out: sales credit the Sales account, purchases debit Purchases,
 * receipts debit Cash/Bank, credit notes debit Sales Return, freight debits
 * Freight & Carriage.
 */
import React, { useMemo, useState } from "react";
import { Select, Space } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import VoucherDrawer from "../components/VoucherDrawer";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  viewCol,
  typeCol,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { buildDayBook, filterPeriod, VOUCHER_TYPES } from "../lib/accounting";
import { inr, sumBy, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const ALL_TYPES = [
  VOUCHER_TYPES.SALES,
  VOUCHER_TYPES.PURCHASE,
  VOUCHER_TYPES.CREDIT_NOTE,
  VOUCHER_TYPES.RECEIPT,
  VOUCHER_TYPES.PAYMENT,
  VOUCHER_TYPES.FREIGHT,
];

const DayBook = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState(ALL_TYPES);
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({
    withSalesDetail: true,
    withDisputes: true,
    withWallet: true,
  });

  const all = useMemo(
    () =>
      buildDayBook([
        book.salesVouchers,
        book.purchaseVouchers,
        book.creditNotes,
        book.freightVouchers,
        book.walletVouchers,
      ]),
    [
      book.salesVouchers,
      book.purchaseVouchers,
      book.creditNotes,
      book.freightVouchers,
      book.walletVouchers,
    ],
  );

  const rows = useMemo(() => {
    let out = filterPeriod(all, range).filter((r) => types.includes(r.type));
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          String(r.voucherNo).toLowerCase().includes(q) ||
          String(r.party).toLowerCase().includes(q) ||
          String(r.narration).toLowerCase().includes(q),
      );
    }
    return out;
  }, [all, range, types, search]);

  const totals = useMemo(
    () => ({
      debit: sumBy(rows, "debit"),
      credit: sumBy(rows, "credit"),
    }),
    [rows],
  );

  const byType = useMemo(() => {
    const m = {};
    ALL_TYPES.forEach((t) => {
      const r = rows.filter((x) => x.type === t);
      m[t] = { count: r.length, value: sumBy(r, "debit") };
    });
    return m;
  }, [rows]);

  const columns = [
    dateCol("Date", "date"),
    typeCol(),
    textCol("Vch No", "voucherNo", { width: 150 }),
    textCol("Party / Particulars", "party", { width: 200 }),
    textCol("Debit Ledger", "debitLedger", { width: 190 }),
    textCol("Credit Ledger", "creditLedger", { width: 190 }),
    amountCol("Debit", "debit"),
    amountCol("Credit", "credit"),
    textCol("Narration", "narration", { width: 250, ellipsis: true }),
    viewCol(setVoucher),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () =>
    printReport({
      title: "Day Book",
      orgName: book.ctx?.orgName,
      period,
      meta: [{ label: "Voucher types", value: types.join(", ") }],
      sections: [
        {
          columns: [
            { title: "Date", value: (r) => fmtDate(r.date) },
            { title: "Vch Type", key: "type" },
            { title: "Vch No", key: "voucherNo" },
            { title: "Party", key: "party" },
            { title: "Dr Ledger", key: "debitLedger" },
            { title: "Cr Ledger", key: "creditLedger" },
            { title: "Debit", key: "debit", numeric: true },
            { title: "Credit", key: "credit", numeric: true },
          ],
          rows,
          totals: { label: "Total", ...totals },
        },
      ],
      note:
        "The Day Book covers every voucher the DMS produces: sales, purchases, credit notes, customer receipts and freight. Payment vouchers to suppliers are absent because the system records no vendor payments.",
    });

  const handleExcel = () =>
    exportToExcel(
      rows.map((r) => ({
        Date: fmtDate(r.date),
        "Vch Type": r.type,
        "Vch No": r.voucherNo,
        Party: r.party,
        "Debit Ledger": r.debitLedger,
        "Credit Ledger": r.creditLedger,
        Debit: num(r.debit),
        Credit: num(r.credit),
        Narration: r.narration,
      })),
      "day-book",
      "Day Book",
    );

  return (
    <>
      <ReportShell
        title="Day Book"
        subtitle="All vouchers in date order, with their ledger effect"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Voucher no, party, narration"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        basisNote="Sales invoices credit the Sales account and debit the customer. Purchases debit the Purchase account. Customer wallet entries appear as receipts, approved disputes as credit notes, and freight rows as carriage. Supplier payment vouchers do not appear because the system does not record vendor payments."
        extra={
          <Space>
            <Select
              mode="multiple"
              maxTagCount="responsive"
              value={types}
              onChange={setTypes}
              options={ALL_TYPES.map((t) => ({ label: t, value: t }))}
              style={{ minWidth: 220 }}
              placeholder="Voucher types"
            />
          </Space>
        }
        summary={
          <SummaryCards
            items={[
              { label: "Vouchers", value: rows.length, tone: "slate" },
              { label: "Sales", value: inr(byType[VOUCHER_TYPES.SALES].value), sub: `${byType[VOUCHER_TYPES.SALES].count} vch` },
              { label: "Purchases", value: inr(byType[VOUCHER_TYPES.PURCHASE].value), sub: `${byType[VOUCHER_TYPES.PURCHASE].count} vch`, tone: "blue" },
              { label: "Receipts", value: inr(byType[VOUCHER_TYPES.RECEIPT].value), sub: `${byType[VOUCHER_TYPES.RECEIPT].count} vch`, tone: "green" },
              { label: "Credit Notes", value: inr(byType[VOUCHER_TYPES.CREDIT_NOTE].value), sub: `${byType[VOUCHER_TYPES.CREDIT_NOTE].count} vch`, tone: "red" },
              { label: "Freight", value: inr(byType[VOUCHER_TYPES.FREIGHT].value), sub: `${byType[VOUCHER_TYPES.FREIGHT].count} vch` },
            ]}
          />
        }
      >
        <ReportTable
          columns={columns}
          dataSource={rows}
          totals={totals}
          scrollX={1750}
          pageSize={20}
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

export default DayBook;

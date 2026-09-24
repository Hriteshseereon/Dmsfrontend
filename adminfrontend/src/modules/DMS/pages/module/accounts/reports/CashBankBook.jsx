/**
 * Cash & Bank Book.
 *
 * Built from the two money-movement sources the system holds:
 *   - bank transactions recorded in the Wealth module (deposit / withdrawal / OD)
 *   - customer wallet collections
 *
 * There is no opening bank balance anywhere in the system, so the book opens
 * at nil and reports movement rather than a true bank position.
 */
import React, { useMemo, useState } from "react";
import { Select, Tag, Alert } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  balanceCol,
  typeCol,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { buildCashBankBook } from "../lib/accounting";
import { inr, sumBy, fmtDate, num, drcr } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const CashBankBook = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [account, setAccount] = useState("All accounts");

  const book = useVoucherBook({ withWallet: true });

  const full = useMemo(
    () =>
      buildCashBankBook({
        bankEntries: book.data?.bankEntries || [],
        walletVouchers: book.walletVouchers,
        range,
      }),
    [book.data, book.walletVouchers, range],
  );

  const accounts = useMemo(
    () => ["All accounts", ...new Set(full.rows.map((r) => r.account))],
    [full.rows],
  );

  const rows = useMemo(() => {
    let out = full.rows;
    if (account !== "All accounts") out = out.filter((r) => r.account === account);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          String(r.particulars).toLowerCase().includes(q) ||
          String(r.ref).toLowerCase().includes(q) ||
          String(r.account).toLowerCase().includes(q),
      );
    }
    // Re-run the running balance over the filtered view.
    let running = 0;
    return out.map((r) => {
      running = num(running) + num(r.receipt) - num(r.payment);
      return { ...r, balance: Math.round(running * 100) / 100 };
    });
  }, [full.rows, account, search]);

  const totals = useMemo(
    () => ({
      receipt: sumBy(rows, "receipt"),
      payment: sumBy(rows, "payment"),
    }),
    [rows],
  );

  const closing = rows.length ? rows[rows.length - 1].balance : 0;

  const columns = [
    dateCol("Date", "date"),
    textCol("Account", "account", { width: 200 }),
    textCol("Particulars", "particulars", { width: 280, ellipsis: true }),
    typeCol("Vch Type", "vchType"),
    textCol("Instrument / Ref", "ref", { width: 150 }),
    {
      ...textCol("Source", "sourceName"),
      width: 170,
      render: (v) => <Tag color={v === "Bank transactions" ? "blue" : "gold"}>{v}</Tag>,
    },
    amountCol("Receipt", "receipt"),
    amountCol("Payment", "payment"),
    balanceCol("Balance", "balance"),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;
  const bal = drcr(closing);

  const handlePdf = () =>
    printReport({
      title: "Cash & Bank Book",
      orgName: book.ctx?.orgName,
      period,
      meta: [{ label: "Account", value: account }],
      sections: [
        {
          columns: [
            { title: "Date", value: (r) => fmtDate(r.date) },
            { title: "Account", key: "account" },
            { title: "Particulars", key: "particulars" },
            { title: "Vch Type", key: "vchType" },
            { title: "Ref", key: "ref" },
            { title: "Receipt", key: "receipt", numeric: true },
            { title: "Payment", key: "payment", numeric: true },
            { title: "Balance", value: (r) => `${inr(Math.abs(r.balance))} ${r.balance >= 0 ? "Dr" : "Cr"}` },
          ],
          rows,
          totals: { label: "Total", ...totals },
        },
        {
          heading: "Position",
          kv: [
            { label: "Total Receipts", value: inr(totals.receipt) },
            { label: "Total Payments", value: inr(totals.payment) },
            { label: "Net Movement", value: bal.text },
          ],
        },
      ],
      note:
        "MOVEMENT ONLY, NOT A BANK BALANCE. The system holds no opening bank balance, so this book opens at nil. Entries come from bank transactions recorded in the Wealth module and from customer wallet collections. Supplier payments are absent because the system does not record them, so this will not reconcile to a bank statement.",
    });

  const handleExcel = () =>
    exportToExcel(
      rows.map((r) => ({
        Date: fmtDate(r.date),
        Account: r.account,
        Particulars: r.particulars,
        "Vch Type": r.vchType,
        "Instrument / Ref": r.ref,
        Source: r.sourceName,
        Receipt: num(r.receipt),
        Payment: num(r.payment),
        Balance: num(r.balance),
      })),
      "cash-bank-book",
      "Cash & Bank",
    );

  return (
    <ReportShell
      title="Cash & Bank Book"
      subtitle="Money in and out, in date order"
      range={range}
      onRangeChange={setRange}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Particulars, reference, account"
      onPdf={handlePdf}
      onExcel={handleExcel}
      onRefresh={book.refetch}
      loading={book.isLoading}
      detailLoading={book.detailLoading}
      error={book.isError ? book.error : null}
      extra={
        <Select
          value={account}
          onChange={setAccount}
          style={{ minWidth: 200 }}
          options={accounts.map((a) => ({ label: a, value: a }))}
        />
      }
      summary={
        <>
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="Movement only — this is not a bank balance"
            description="The system holds no opening bank balance, so this book opens at nil. It draws on bank transactions recorded in the Wealth module and customer wallet collections. Supplier payments are absent because the system does not record them, so this will not reconcile to a bank statement."
          />
          <SummaryCards
            items={[
              { label: "Entries", value: rows.length, tone: "slate" },
              { label: "Total Receipts", value: inr(totals.receipt), tone: "green" },
              { label: "Total Payments", value: inr(totals.payment), tone: "red" },
              {
                label: "Net Movement",
                value: bal.text,
                tone: closing >= 0 ? "green" : "red",
              },
            ]}
          />
        </>
      }
    >
      <ReportTable
        columns={columns}
        dataSource={rows}
        totals={{
          ...totals,
          balance: `${inr(bal.amount)} ${bal.side}`,
        }}
        scrollX={1500}
        pageSize={20}
      />
    </ReportShell>
  );
};

export default CashBankBook;

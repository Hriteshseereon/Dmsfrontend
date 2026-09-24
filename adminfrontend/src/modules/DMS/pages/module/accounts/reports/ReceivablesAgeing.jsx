/**
 * Receivables & Ageing — Tally's "Bills Receivable" / ageing analysis.
 *
 * Because the source data has no bill-by-bill allocation, receipts and credit
 * notes are applied oldest-invoice-first, which is Tally's own behaviour for a
 * receipt entered without an "against reference".
 */
import React, { useMemo, useState } from "react";
import { Button, Tag, Drawer, Progress, DatePicker } from "antd";
import dayjs from "dayjs";

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

import { useVoucherBook } from "../hooks/useAccountsData";
import { buildReceivables } from "../lib/accounting";
import { inr, sumBy, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const ReceivablesAgeing = () => {
  const [search, setSearch] = useState("");
  const [asOn, setAsOn] = useState(dayjs());
  const [openParty, setOpenParty] = useState(null);
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({
    withSalesDetail: true,
    withDisputes: true,
    withWallet: true,
  });

  const rows = useMemo(
    () =>
      buildReceivables({
        salesVouchers: book.salesVouchers,
        creditNotes: book.creditNotes,
        walletVouchers: book.walletVouchers,
        customers: book.data?.customers || [],
        asOn,
      }),
    [book.salesVouchers, book.creditNotes, book.walletVouchers, book.data, asOn],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => String(r.party).toLowerCase().includes(q));
  }, [rows, search]);

  const totals = useMemo(
    () => ({
      billed: sumBy(filtered, "billed"),
      received: sumBy(filtered, "received"),
      outstanding: sumBy(filtered, "outstanding"),
      b0: sumBy(filtered, "b0"),
      b1: sumBy(filtered, "b1"),
      b2: sumBy(filtered, "b2"),
      b3: sumBy(filtered, "b3"),
    }),
    [filtered],
  );

  const overLimit = filtered.filter((r) => r.overLimit);

  const columns = [
    {
      ...textCol("Party", "party", { width: 230 }),
      fixed: "left",
      render: (v, r) => (
        <div>
          <Button
            type="link"
            className="text-amber-800! font-semibold p-0! text-left"
            onClick={() => setOpenParty(r)}
          >
            {v}
          </Button>
          {r.overLimit && (
            <Tag color="red" className="ml-1">
              Over limit
            </Tag>
          )}
        </div>
      ),
    },
    textCol("GSTIN", "gstin", { width: 150 }),
    { ...textCol("Credit Days", "creditDays"), width: 110, align: "right" },
    amountCol("Credit Limit", "creditLimit"),
    amountCol("Billed", "billed"),
    amountCol("Received", "received"),
    amountCol("Outstanding", "outstanding", {
      render: (v) => (
        <span className="text-amber-900 font-semibold tabular-nums">{inr(v)}</span>
      ),
    }),
    { ...textCol("Open Bills", "billCount"), width: 100, align: "right" },
    amountCol("0-30 days", "b0"),
    amountCol("31-60 days", "b1"),
    amountCol("61-90 days", "b2"),
    amountCol("Over 90 days", "b3", {
      render: (v) => (
        <span className={num(v) > 0 ? "text-rose-700 font-semibold tabular-nums" : "text-amber-800 tabular-nums"}>
          {inr(v, { blankZero: true })}
        </span>
      ),
    }),
    {
      title: th("Action"),
      key: "act",
      width: 90,
      fixed: "right",
      render: (_, r) => (
        <Button
          size="small"
          type="link"
          className="text-amber-700! p-0!"
          onClick={() => setOpenParty(r)}
        >
          View
        </Button>
      ),
    },
  ];

  const billColumns = [
    dateCol("Invoice Date", "date"),
    textCol("Invoice No", "voucherNo", { width: 160 }),
    amountCol("Invoice Amount", "amount"),
    amountCol("Adjusted", "applied"),
    amountCol("Outstanding", "outstanding"),
    { ...textCol("Age (days)", "ageDays"), width: 110, align: "right" },
    {
      ...textCol("Overdue", "overdueDays"),
      width: 110,
      align: "right",
      render: (v) =>
        num(v) > 0 ? (
          <Tag color="red">{num(v)} days</Tag>
        ) : (
          <Tag color="green">Within terms</Tag>
        ),
    },
    viewCol((r) => setVoucher(r.voucher)),
  ];

  const handlePdf = () =>
    printReport({
      title: "Receivables & Ageing",
      orgName: book.ctx?.orgName,
      period: `As on ${fmtDate(asOn)}`,
      sections: [
        {
          columns: [
            { title: "Party", key: "party" },
            { title: "GSTIN", key: "gstin" },
            { title: "Credit Days", key: "creditDays", numeric: true },
            { title: "Billed", key: "billed", numeric: true },
            { title: "Received", key: "received", numeric: true },
            { title: "Outstanding", key: "outstanding", numeric: true },
            { title: "0-30", key: "b0", numeric: true },
            { title: "31-60", key: "b1", numeric: true },
            { title: "61-90", key: "b2", numeric: true },
            { title: "Over 90", key: "b3", numeric: true },
          ],
          rows: filtered,
          totals: { label: "Total", ...totals },
        },
      ],
      note:
        "Receipts and credit notes are applied oldest-invoice-first, because the source data has no bill-by-bill allocation. Ageing is measured from the invoice date; the overdue flag uses each customer's credit days from the customer master.",
    });

  const handleExcel = () =>
    exportToExcel(
      filtered.map((r) => ({
        Party: r.party,
        GSTIN: r.gstin,
        "Credit Days": r.creditDays,
        "Credit Limit": num(r.creditLimit),
        Billed: num(r.billed),
        Received: num(r.received),
        Outstanding: num(r.outstanding),
        "Open Bills": r.billCount,
        "0-30": num(r.b0),
        "31-60": num(r.b1),
        "61-90": num(r.b2),
        "Over 90": num(r.b3),
        "Over Limit": r.overLimit ? "Yes" : "No",
      })),
      "receivables-ageing",
      "Receivables",
    );

  const pctOver90 =
    totals.outstanding > 0 ? Math.round((totals.b3 / totals.outstanding) * 100) : 0;

  return (
    <>
      <ReportShell
        title="Receivables & Ageing"
        subtitle={`Outstanding from customers as on ${fmtDate(asOn)}`}
        showRange={false}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Customer name"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        basisNote="The system has no bill-by-bill allocation, so receipts and credit notes are applied to the oldest open invoice first. Ageing runs from the invoice date, and the overdue flag uses each customer's credit days from the customer master."
        extra={
          <DatePicker
            value={asOn}
            onChange={(d) => setAsOn(d || dayjs())}
            allowClear={false}
            format="DD-MM-YYYY"
            className="border-amber-400! text-amber-700!"
            style={{ width: 170 }}
            placeholder="As on date"
          />
        }
        summary={
          <>
            <SummaryCards
              items={[
                { label: "Parties", value: filtered.length, tone: "slate" },
                { label: "Total Billed", value: inr(totals.billed) },
                { label: "Total Received", value: inr(totals.received), tone: "green" },
                { label: "Outstanding", value: inr(totals.outstanding), tone: "red" },
                { label: "Over 90 days", value: inr(totals.b3), tone: "red", sub: `${pctOver90}% of dues` },
                { label: "Over Credit Limit", value: overLimit.length, tone: overLimit.length ? "red" : "green" },
              ]}
            />
            {totals.outstanding > 0 && (
              <div className="mb-4">
                <div className="text-xs text-amber-700 mb-1 font-medium">
                  Ageing spread
                </div>
                <Progress
                  percent={100}
                  showInfo={false}
                  strokeColor={{ from: "#10b981", to: "#e11d48" }}
                  success={{
                    percent: Math.round((totals.b0 / totals.outstanding) * 100),
                    strokeColor: "#10b981",
                  }}
                />
                <div className="flex gap-4 text-xs text-amber-700 mt-1 flex-wrap">
                  <span>0-30: {inr(totals.b0)}</span>
                  <span>31-60: {inr(totals.b1)}</span>
                  <span>61-90: {inr(totals.b2)}</span>
                  <span className="text-rose-700 font-semibold">
                    90+: {inr(totals.b3)}
                  </span>
                </div>
              </div>
            )}
          </>
        }
      >
        <ReportTable
          columns={columns}
          dataSource={filtered}
          totals={totals}
          scrollX={1800}
        />
      </ReportShell>

      <Drawer
        open={Boolean(openParty)}
        onClose={() => setOpenParty(null)}
        width={950}
        title={
          <span className="text-amber-800 font-semibold">
            Open bills — {openParty?.party}
          </span>
        }
      >
        {openParty && (
          <>
            <SummaryCards
              items={[
                { label: "Billed", value: inr(openParty.billed) },
                { label: "Received", value: inr(openParty.received), tone: "green" },
                { label: "Outstanding", value: inr(openParty.outstanding), tone: "red" },
                {
                  label: "Unapplied Credit",
                  value: inr(openParty.unapplied),
                  tone: "blue",
                  hint: "Receipts beyond the billed amount",
                },
              ]}
            />
            <ReportTable
              columns={billColumns}
              dataSource={openParty.bills}
              totals={{
                amount: sumBy(openParty.bills, "amount"),
                applied: sumBy(openParty.bills, "applied"),
                outstanding: sumBy(openParty.bills, "outstanding"),
              }}
              scrollX={1000}
              pageSize={20}
            />
          </>
        )}
      </Drawer>

      <VoucherDrawer
        voucher={voucher}
        open={Boolean(voucher)}
        onClose={() => setVoucher(null)}
        orgName={book.ctx?.orgName}
      />
    </>
  );
};

export default ReceivablesAgeing;

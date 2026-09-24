/**
 * Customer Ledger — Tally's "Display > Account Books > Ledger" for a party.
 *
 * Invoices debit the customer, receipts and credit notes credit them, and a
 * running balance is carried down the page. Pending sales orders are shown
 * separately as order commitments, not as ledger entries.
 */
import React, { useMemo, useState } from "react";
import { Select, Empty, Tag, Tabs, Descriptions } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import VoucherDrawer from "../components/VoucherDrawer";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  balanceCol,
  viewCol,
  typeCol,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { buildCustomerLedger } from "../lib/accounting";
import { inr, fmtDate, num, drcr, pick } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const CustomerLedger = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [party, setParty] = useState(null);
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({
    withSalesDetail: true,
    withDisputes: true,
    withWallet: true,
  });

  // Party list built from whoever actually has transactions, plus the master.
  const parties = useMemo(() => {
    const names = new Set();
    book.salesVouchers.forEach((v) => v.party && names.add(v.party));
    book.creditNotes.forEach((v) => v.party && names.add(v.party));
    book.walletVouchers.forEach((v) => v.party && names.add(v.party));
    (book.data?.customers || []).forEach((c) => {
      const n = pick(c, "business_name", "customer_name", "name");
      if (n) names.add(n);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [book.salesVouchers, book.creditNotes, book.walletVouchers, book.data]);

  const selected = party || parties[0] || null;

  const customerMaster = useMemo(
    () =>
      (book.data?.customers || []).find(
        (c) =>
          String(pick(c, "business_name", "customer_name", "name") || "")
            .trim()
            .toLowerCase() === String(selected || "").trim().toLowerCase(),
      ) || null,
    [book.data, selected],
  );

  const ledger = useMemo(
    () =>
      selected
        ? buildCustomerLedger({
            customerName: selected,
            salesVouchers: book.salesVouchers,
            creditNotes: book.creditNotes,
            walletVouchers: book.walletVouchers,
            salesOrders: book.data?.salesOrders || [],
            range,
          })
        : null,
    [selected, book.salesVouchers, book.creditNotes, book.walletVouchers, book.data, range],
  );

  const columns = [
    dateCol("Date", "date"),
    {
      ...textCol("Particulars", "particulars", { width: 260 }),
      render: (v, r) => (
        <span className="text-amber-800">
          {v || "-"}
          {r.memo && (
            <Tag color="default" className="ml-2">
              Memo · {inr(r.memoAmount)}
            </Tag>
          )}
        </span>
      ),
    },
    typeCol("Vch Type", "vchType"),
    textCol("Vch No", "vchNo", { width: 150 }),
    textCol("Reference", "ref", { width: 130 }),
    amountCol("Debit", "debit"),
    amountCol("Credit", "credit"),
    balanceCol("Balance", "balance"),
    {
      ...viewCol((r) => r.voucher && setVoucher(r.voucher)),
      render: (_, r) =>
        r.voucher ? (
          <button
            type="button"
            className="text-amber-700 text-xs underline bg-transparent border-0 cursor-pointer p-0"
            onClick={() => setVoucher(r.voucher)}
          >
            View
          </button>
        ) : null,
    },
  ];

  const orderColumns = [
    dateCol("Order Date", "order_date"),
    textCol("Order No", "order_number", { width: 160 }),
    textCol("Status", "status", {
      width: 130,
      render: (v) => <Tag color="gold">{v || "-"}</Tag>,
    }),
    amountCol("Order Value", "grand_total"),
    amountCol("Taxable", "total_amount"),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;
  const closing = drcr(ledger?.closing || 0);

  const handlePdf = () => {
    if (!ledger) return;
    printReport({
      title: `Ledger Account — ${selected}`,
      orgName: book.ctx?.orgName,
      period,
      portrait: false,
      meta: [
        { label: "GSTIN", value: pick(customerMaster || {}, "gst_number", "gstin") || "-" },
        { label: "State", value: pick(customerMaster || {}, "state") || "-" },
        { label: "Credit Days", value: num(pick(customerMaster || {}, "days_limit")) || "-" },
      ],
      sections: [
        {
          columns: [
            { title: "Date", value: (r) => fmtDate(r.date) },
            { title: "Particulars", key: "particulars" },
            { title: "Vch Type", key: "vchType" },
            { title: "Vch No", key: "vchNo" },
            { title: "Debit", key: "debit", numeric: true },
            { title: "Credit", key: "credit", numeric: true },
            { title: "Balance", value: (r) => `${inr(Math.abs(r.balance))} ${r.balance >= 0 ? "Dr" : "Cr"}` },
          ],
          rows: ledger.entries,
          totals: {
            label: "Total",
            debit: ledger.totalDebit,
            credit: ledger.totalCredit,
          },
        },
        {
          heading: "Closing position",
          kv: [
            { label: "Total Debit", value: inr(ledger.totalDebit) },
            { label: "Total Credit", value: inr(ledger.totalCredit) },
            { label: "Closing Balance", value: closing.text },
          ],
        },
      ],
      note:
        "Opening balance is nil: the DMS holds no opening-balance master, so this ledger starts from the first transaction recorded in the system. Receipts are applied to the account as a whole, not bill by bill.",
    });
  };

  const handleExcel = () => {
    if (!ledger) return;
    exportToExcel(
      ledger.entries.map((r) => ({
        Date: fmtDate(r.date),
        Particulars: r.particulars,
        "Vch Type": r.vchType,
        "Vch No": r.vchNo,
        Reference: r.ref,
        Debit: num(r.debit),
        Credit: num(r.credit),
        Balance: num(r.balance),
        "Dr/Cr": r.balance >= 0 ? "Dr" : "Cr",
      })),
      `ledger-${String(selected).replace(/\W+/g, "-").toLowerCase()}`,
      "Ledger",
    );
  };

  return (
    <>
      <ReportShell
        title="Customer Ledger"
        subtitle="Party account with running balance"
        range={range}
        onRangeChange={setRange}
        showSearch={false}
        onPdf={ledger ? handlePdf : null}
        onExcel={ledger ? handleExcel : null}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        basisNote="Opening balance is nil — the system has no opening-balance master, so the ledger begins at the first recorded transaction. Receipts credit the account as a whole; there is no bill-by-bill allocation in the source data. Wallet DEBIT / DEBIT_USAGE entries are shown as memo rows and do not move the balance, because their direction is ambiguous in the source system; this ledger's closing balance therefore always agrees with Receivables & Ageing."
        extra={
          <Select
            showSearch
            value={selected}
            onChange={setParty}
            placeholder="Select customer"
            style={{ minWidth: 260 }}
            options={parties.map((p) => ({ label: p, value: p }))}
            filterOption={(input, option) =>
              String(option?.label).toLowerCase().includes(input.toLowerCase())
            }
          />
        }
        summary={
          ledger && (
            <>
              <Descriptions
                size="small"
                bordered
                column={4}
                className="mb-4"
                labelStyle={{ color: "#92400e", fontWeight: 600 }}
              >
                <Descriptions.Item label="GSTIN">
                  {pick(customerMaster || {}, "gst_number", "gstin") || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {pick(customerMaster || {}, "state") || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Credit Days">
                  {num(pick(customerMaster || {}, "days_limit")) || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Credit Limit">
                  {num(pick(customerMaster || {}, "amount_limit"))
                    ? inr(pick(customerMaster || {}, "amount_limit"))
                    : "-"}
                </Descriptions.Item>
              </Descriptions>

              <SummaryCards
                items={[
                  { label: "Entries", value: ledger.entries.length, tone: "slate" },
                  { label: "Total Debit", value: inr(ledger.totalDebit) },
                  { label: "Total Credit", value: inr(ledger.totalCredit), tone: "green" },
                  {
                    label: "Closing Balance",
                    value: closing.text,
                    tone: ledger.closing > 0 ? "red" : "green",
                    hint: "Debit balance means the customer owes you",
                  },
                ]}
              />
            </>
          )
        }
      >
        {!selected ? (
          <Empty description="No customers with transactions" />
        ) : (
          <Tabs
            items={[
              {
                key: "ledger",
                label: "Ledger",
                children: (
                  <ReportTable
                    columns={columns}
                    dataSource={ledger.entries}
                    totals={{
                      debit: ledger.totalDebit,
                      credit: ledger.totalCredit,
                      balance: `${inr(closing.amount)} ${closing.side}`,
                    }}
                    scrollX={1400}
                    pageSize={25}
                  />
                ),
              },
              {
                key: "orders",
                label: `Sales Orders (${ledger.pendingOrders.length})`,
                children: ledger.pendingOrders.length ? (
                  <ReportTable
                    columns={orderColumns}
                    dataSource={ledger.pendingOrders}
                    rowKey={(r) => pick(r, "sales_order_id", "id")}
                    scrollX={800}
                  />
                ) : (
                  <Empty
                    description="No sales orders for this customer"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              },
            ]}
          />
        )}
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

export default CustomerLedger;

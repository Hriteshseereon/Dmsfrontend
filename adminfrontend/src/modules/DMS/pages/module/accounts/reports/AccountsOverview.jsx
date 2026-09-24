/**
 * Accounts landing page — the section's own dashboard.
 * Headline figures plus a card per report, matching DMS card aesthetics.
 */
import React, { useMemo } from "react";
import { Row, Col, Alert, Spin, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";

import SummaryCards from "../components/SummaryCards";
import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import {
  buildReceivables,
  buildGstSummary,
  buildStockSummary,
  filterPeriod,
} from "../lib/accounting";
import { inr, sumBy, fmtDate } from "../lib/format";
import { ACCOUNTS_MENU } from "../menu";

const ReportCard = ({ item, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left border border-amber-200/80 hover:border-amber-400 hover:shadow-md bg-white rounded-lg p-4 transition-all cursor-pointer h-full flex flex-col justify-between"
  >
    <div>
      <div className="flex items-start gap-3">
        <div className="bg-amber-50 p-2.5 rounded-lg text-amber-700 text-xl border border-amber-100 shrink-0 group-hover:bg-amber-100 transition-colors">
          {item.icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-amber-900 text-sm group-hover:text-amber-700 transition-colors">
            {item.label}
          </div>
          <div className="text-xs text-gray-600 mt-1 leading-snug">
            {item.description}
          </div>
        </div>
      </div>
    </div>
    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
      {item.derived ? (
        <Tag color="orange" className="font-semibold text-[10px]">
          Derived figures
        </Tag>
      ) : (
        <Tag color="default" className="text-[10px] text-gray-500">
          Voucher ledger
        </Tag>
      )}
      <span className="text-amber-600 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
        Open <ArrowRightOutlined className="text-[10px]" />
      </span>
    </div>
  </button>
);

const AccountsOverview = () => {
  const navigate = useNavigate();
  const { fy, start, end } = useFinancialPeriod();
  const range = useMemo(() => [start, end], [start, end]);

  const book = useVoucherBook({
    withSalesDetail: true,
    withDisputes: true,
    withWallet: true,
  });

  const sales = useMemo(
    () => filterPeriod(book.salesVouchers, range),
    [book.salesVouchers, range],
  );
  const purchases = useMemo(
    () => filterPeriod(book.purchaseVouchers, range),
    [book.purchaseVouchers, range],
  );

  const receivables = useMemo(
    () =>
      buildReceivables({
        salesVouchers: book.salesVouchers,
        creditNotes: book.creditNotes,
        walletVouchers: book.walletVouchers,
        customers: book.data?.customers || [],
      }),
    [book.salesVouchers, book.creditNotes, book.walletVouchers, book.data],
  );

  const gst = useMemo(
    () =>
      buildGstSummary({
        salesVouchers: book.salesVouchers,
        purchaseVouchers: book.purchaseVouchers,
        range,
      }),
    [book.salesVouchers, book.purchaseVouchers, range],
  );

  const stock = useMemo(
    () =>
      book.ctx
        ? buildStockSummary({
            inventory: book.data?.inventory || [],
            purchaseVouchers: book.purchaseVouchers,
            products: book.data?.products || [],
            ctx: book.ctx,
          })
        : [],
    [book.ctx, book.data, book.purchaseVouchers],
  );

  const outstanding = sumBy(receivables, "outstanding");
  const over90 = sumBy(receivables, "b3");

  const groups = ACCOUNTS_MENU.filter((g) => g.children?.length);

  return (
    <div className="space-y-4">
      <Alert
        type="info"
        showIcon
        className="border-amber-300! bg-amber-50/70! text-amber-900!"
        message={<span className="font-bold text-amber-900">How to read this accounting section</span>}
        description="Every figure here is derived from documents the DMS already records (Purchase invoices, Sales invoices, Receipts, Disputes & Inventory) — nothing new is captured and no existing workflow changes."
      />

      <Spin spinning={book.isLoading}>
        <SummaryCards
          items={[
            { label: "Sales (Taxable)", value: inr(sumBy(sales, "taxable")), sub: `${sales.length} invoices posted`, tone: "amber" },
            { label: "Purchases (Taxable)", value: inr(sumBy(purchases, "taxable")), sub: `${purchases.length} inward bills`, tone: "blue" },
            { label: "Total Receivables", value: inr(outstanding), sub: `${receivables.filter((r) => r.outstanding > 0).length} active parties`, tone: "red" },
            { label: "Over 90 Days", value: inr(over90), tone: over90 > 0 ? "red" : "green", sub: over90 > 0 ? "Action required" : "Healthy ageing" },
            {
              label: gst.net.total >= 0 ? "Net GST Payable" : "GST Credit",
              value: inr(Math.abs(gst.net.total)),
              tone: gst.net.total >= 0 ? "amber" : "green",
              sub: gst.net.total >= 0 ? "Payable for period" : "Input tax credit",
            },
            { label: "Stock Valuation", value: inr(sumBy(stock, "value")), tone: "green", sub: "At latest purchase rate" },
          ]}
        />
      </Spin>

      {groups.map((group) => (
        <div key={group.key} className="mb-5 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-2xs">
          <h2 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2 uppercase tracking-wide border-b border-amber-100 pb-2">
            <span className="text-amber-600">{group.icon}</span>
            <span>{group.label}</span>
          </h2>
          <Row gutter={[12, 12]}>
            {group.children.map((child) => (
              <Col key={child.key} xs={24} sm={12} lg={8} xl={6}>
                <ReportCard item={child} onClick={() => navigate(child.path)} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default AccountsOverview;

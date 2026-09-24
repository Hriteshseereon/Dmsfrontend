/**
 * Statement of Financial Position (Derived) + Trading Summary.
 *
 * Honest framing, because it matters: the DMS records no capital, loans,
 * vendor payments, salaries or overheads, so this cannot be a general-ledger
 * balance sheet. Everything here is assembled from trading data, and the two
 * sides are made to agree by a single clearly-labelled residual.
 *
 * Read it as a working-capital position, not a statutory balance sheet.
 */
import React, { useMemo, useState } from "react";
import { Row, Col, Alert, Tag, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import ReportTable, { textCol, amountCol } from "../components/ReportTable";

import {
  useVoucherBook,
  useFinancialPeriod,
  useAssetCore,
} from "../hooks/useAccountsData";
import {
  buildReceivables,
  buildStockSummary,
  buildGstSummary,
  buildCashBankBook,
  buildBrokerCommission,
  buildBalanceSheet,
  buildTradingSummary,
} from "../lib/accounting";
import { inr, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const StatementTable = ({ title, lines, total, totalLabel, tone }) => (
  <div className="border border-amber-200 rounded-lg overflow-hidden h-full">
    <div className="bg-amber-50 px-3 py-2 text-amber-800 font-semibold border-b border-amber-200">
      {title}
    </div>
    <table className="w-full text-sm">
      <tbody>
        {lines.length === 0 && (
          <tr>
            <td className="px-3 py-3 text-amber-600 italic" colSpan={2}>
              Nothing to report
            </td>
          </tr>
        )}
        {lines.map((l) => (
          <tr key={l.key} className="border-b border-amber-100">
            <td className="px-3 py-2 text-amber-900">
              {l.particulars}
              {l.isResidual && (
                <Tag color="orange" className="ml-2">
                  Balancing figure
                </Tag>
              )}
              {l.note && (
                <Tooltip title={l.note}>
                  <InfoCircleOutlined className="ml-2 text-amber-400" />
                </Tooltip>
              )}
              {l.note && (
                <div className="text-[11px] text-amber-500 leading-tight mt-0.5">
                  {l.note}
                </div>
              )}
            </td>
            <td className="px-3 py-2 text-right tabular-nums text-amber-900 whitespace-nowrap align-top">
              {inr(l.amount)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className={tone === "green" ? "bg-emerald-50" : "bg-amber-100"}>
          <td className="px-3 py-2 font-bold text-amber-900">{totalLabel}</td>
          <td className="px-3 py-2 text-right font-bold tabular-nums text-amber-900">
            {inr(total)}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const BalanceSheet = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);

  const book = useVoucherBook({
    withSalesDetail: true,
    withDisputes: true,
    withWallet: true,
  });
  const assetQuery = useAssetCore();

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

  const stockSummary = useMemo(
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

  const gst = useMemo(
    () =>
      buildGstSummary({
        salesVouchers: book.salesVouchers,
        purchaseVouchers: book.purchaseVouchers,
        range,
      }),
    [book.salesVouchers, book.purchaseVouchers, range],
  );

  const cashBank = useMemo(
    () =>
      buildCashBankBook({
        bankEntries: book.data?.bankEntries || [],
        walletVouchers: book.walletVouchers,
        range,
      }),
    [book.data, book.walletVouchers, range],
  );

  const brokerRows = useMemo(
    () =>
      buildBrokerCommission({
        brokers: book.data?.brokers || [],
        salesContracts: book.data?.salesContracts || [],
        range,
      }),
    [book.data, range],
  );

  const sheet = useMemo(
    () =>
      buildBalanceSheet({
        receivables,
        purchaseVouchers: book.purchaseVouchers,
        stockSummary,
        assets: assetQuery.data?.assets || [],
        depreciation: assetQuery.data?.depreciation || [],
        disposals: assetQuery.data?.disposals || [],
        freightVouchers: book.freightVouchers,
        gst,
        cashBank,
        brokerRows,
        range,
      }),
    [
      receivables,
      book.purchaseVouchers,
      book.freightVouchers,
      stockSummary,
      assetQuery.data,
      gst,
      cashBank,
      brokerRows,
      range,
    ],
  );

  const trading = useMemo(
    () =>
      buildTradingSummary({
        salesVouchers: book.salesVouchers,
        purchaseVouchers: book.purchaseVouchers,
        creditNotes: book.creditNotes,
        freightVouchers: book.freightVouchers,
        stockSummary,
        range,
      }),
    [
      book.salesVouchers,
      book.purchaseVouchers,
      book.creditNotes,
      book.freightVouchers,
      stockSummary,
      range,
    ],
  );

  const tradingRows = [
    { key: "sales", particulars: "Sales (taxable value)", amount: trading.sales },
    { key: "returns", particulars: "Less: Sales Returns", amount: -trading.returns },
    { key: "net", particulars: "Net Sales", amount: trading.netSales, bold: true },
    { key: "purch", particulars: "Purchases (taxable value)", amount: -trading.purchases },
    { key: "freight", particulars: "Freight & Carriage (net of recoveries)", amount: -trading.freight },
    { key: "cogs", particulars: "Cost of Goods & Carriage", amount: -trading.costOfGoods, bold: true },
    { key: "margin", particulars: "Gross Margin", amount: trading.grossMargin, bold: true },
    { key: "stock", particulars: "Closing Stock (memo)", amount: trading.closingStock, memo: true },
  ];

  const tradingColumns = [
    textCol("Particulars", "particulars", {
      width: 340,
      render: (v, r) => (
        <span
          className={
            r.bold ? "font-bold text-amber-900" : r.memo ? "italic text-amber-600" : "text-amber-800"
          }
        >
          {v}
        </span>
      ),
    }),
    amountCol("Amount", "amount", {
      render: (v, r) => (
        <span
          className={`tabular-nums ${
            r.bold ? "font-bold text-amber-900" : "text-amber-800"
          } ${num(v) < 0 ? "text-rose-700" : ""}`}
        >
          {inr(v)}
        </span>
      ),
    }),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () =>
    printReport({
      title: "Statement of Financial Position (Derived)",
      orgName: book.ctx?.orgName,
      period,
      portrait: true,
      sections: [
        {
          heading: "Assets",
          columns: [
            { title: "Particulars", key: "particulars" },
            { title: "Amount", key: "amount", numeric: true },
          ],
          rows: sheet.assetLines,
          totals: { label: "Total Assets", amount: sheet.totalAssets },
        },
        {
          heading: "Liabilities & Reserves",
          columns: [
            { title: "Particulars", key: "particulars" },
            { title: "Amount", key: "amount", numeric: true },
          ],
          rows: sheet.liabilityLines,
          totals: { label: "Total Liabilities & Reserves", amount: sheet.totalLiabilities },
        },
        {
          heading: "Trading Summary",
          columns: [
            { title: "Particulars", key: "particulars" },
            { title: "Amount", key: "amount", numeric: true },
          ],
          rows: tradingRows,
        },
      ],
      note:
        "DERIVED STATEMENT — NOT A STATUTORY BALANCE SHEET. The DMS records no capital, loans, vendor payments, salaries or overheads, so this is assembled from trading data alone and the two sides are made to agree by the residual line 'Capital & Reserves (derived residual)'. Sundry Creditors shows every purchase bill because no vendor payments are recorded. Read this as a working-capital position and reconcile it against your books of account.",
    });

  const handleExcel = () =>
    exportToExcel(
      [
        ...sheet.assetLines.map((l) => ({ Side: "Assets", Particulars: l.particulars, Amount: l.amount })),
        { Side: "Assets", Particulars: "TOTAL ASSETS", Amount: sheet.totalAssets },
        ...sheet.liabilityLines.map((l) => ({ Side: "Liabilities", Particulars: l.particulars, Amount: l.amount })),
        { Side: "Liabilities", Particulars: "TOTAL LIABILITIES & RESERVES", Amount: sheet.totalLiabilities },
        ...tradingRows.map((l) => ({ Side: "Trading", Particulars: l.particulars, Amount: l.amount })),
      ],
      "balance-sheet-derived",
      "Balance Sheet",
    );

  return (
    <ReportShell
      title="Balance Sheet (Derived)"
      subtitle="Working-capital position assembled from trading data"
      range={range}
      onRangeChange={setRange}
      showSearch={false}
      onPdf={handlePdf}
      onExcel={handleExcel}
      onRefresh={book.refetch}
      loading={book.isLoading || assetQuery.isLoading}
      detailLoading={book.detailLoading}
      error={book.isError ? book.error : null}
      summary={
        <>
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="Derived statement — not a statutory balance sheet"
            description={
              <span>
                The DMS records no capital, loans, vendor payments, salaries or
                overheads, so this is assembled from trading data alone and the
                two sides are made to agree by a single residual line. Sundry
                Creditors shows <b>every</b> purchase bill, because the system
                records no vendor payments. Treat this as a working-capital
                position and reconcile it against your books of account.
              </span>
            }
          />
          <SummaryCards
            items={[
              { label: "Total Assets", value: inr(sheet.totalAssets), tone: "green" },
              { label: "Known Liabilities", value: inr(sheet.totalLiabilities - sheet.residual), tone: "red" },
              {
                label: "Derived Residual",
                value: inr(sheet.residual),
                tone: "amber",
                hint: "Balancing figure standing in for capital and reserves",
              },
              { label: "Net Sales", value: inr(trading.netSales), tone: "blue" },
              {
                label: "Gross Margin",
                value: `${inr(trading.grossMargin)} (${trading.marginPct}%)`,
                tone: trading.grossMargin >= 0 ? "green" : "red",
              },
            ]}
          />
        </>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <StatementTable
            title="Assets"
            lines={sheet.assetLines}
            total={sheet.totalAssets}
            totalLabel="Total Assets"
            tone="green"
          />
        </Col>
        <Col xs={24} lg={12}>
          <StatementTable
            title="Liabilities & Reserves"
            lines={sheet.liabilityLines}
            total={sheet.totalLiabilities}
            totalLabel="Total Liabilities & Reserves"
          />
        </Col>
      </Row>

      <div className="mt-6">
        <h3 className="text-amber-700 font-semibold mb-2">Trading Summary</h3>
        <p className="text-amber-600 text-xs mb-3">
          The closest equivalent of a Trading Account this data supports. It
          covers goods and carriage only — salaries, rent, power and other
          overheads are not recorded anywhere in the system, so this is a gross
          margin, not a profit.
        </p>
        <ReportTable
          columns={tradingColumns}
          dataSource={tradingRows}
          scrollX={600}
          pageSize={20}
        />
      </div>
    </ReportShell>
  );
};

export default BalanceSheet;

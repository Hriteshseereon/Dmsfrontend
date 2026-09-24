/**
 * Stock Movement — Tally's "Stock Item Monthly Summary" / movement analysis.
 *
 * Inward comes from purchase invoice quantities and sales returns, outward
 * from sales invoice delivered quantities. Closing stock is known from the
 * inventory master, so opening is derived by reversing the period's movement.
 */
import React, { useMemo, useState } from "react";
import { Drawer, Empty, Tag } from "antd";

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
import { buildStockSummary, buildStockMovement } from "../lib/accounting";
import { inr, sumBy, fmtDate, num, qty as fmtQty } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const StockMovement = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const [voucher, setVoucher] = useState(null);

  const book = useVoucherBook({ withSalesDetail: true, withDisputes: true });

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

  const rows = useMemo(
    () =>
      buildStockMovement({
        purchaseVouchers: book.purchaseVouchers,
        salesVouchers: book.salesVouchers,
        creditNotes: book.creditNotes,
        stockSummary,
        range,
      }),
    [book.purchaseVouchers, book.salesVouchers, book.creditNotes, stockSummary, range],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        String(r.product).toLowerCase().includes(q) ||
        String(r.hsn).toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totals = useMemo(
    () => ({
      openingQty: sumBy(filtered, "openingQty"),
      openingValue: sumBy(filtered, "openingValue"),
      inwardQty: sumBy(filtered, "inwardQty"),
      inwardValue: sumBy(filtered, "inwardValue"),
      outwardQty: sumBy(filtered, "outwardQty"),
      outwardValue: sumBy(filtered, "outwardValue"),
      returnQty: sumBy(filtered, "returnQty"),
      returnValue: sumBy(filtered, "returnValue"),
      closingQty: sumBy(filtered, "closingQty"),
      closingValue: sumBy(filtered, "closingValue"),
    }),
    [filtered],
  );

  const columns = [
    textCol("Item", "product", { width: 230, fixed: "left" }),
    textCol("HSN", "hsn", { width: 110 }),
    textCol("UOM", "uom", { width: 85 }),
    qtyCol("Opening", "openingQty", {
      render: (v) =>
        v === null ? (
          <Tag color="default">n/a</Tag>
        ) : (
          <span className="text-amber-800 tabular-nums">{fmtQty(v)}</span>
        ),
    }),
    qtyCol("Inward", "inwardQty"),
    amountCol("Inward Value", "inwardValue"),
    qtyCol("Returns In", "returnQty"),
    qtyCol("Outward", "outwardQty"),
    amountCol("Outward Value", "outwardValue"),
    qtyCol("Net Movement", "netQty", {
      render: (v) => (
        <span
          className={
            num(v) < 0
              ? "text-rose-700 tabular-nums font-medium"
              : "text-emerald-700 tabular-nums font-medium"
          }
        >
          {num(v) > 0 ? "+" : ""}
          {fmtQty(v)}
        </span>
      ),
    }),
    qtyCol("Closing", "closingQty", {
      render: (v) =>
        v === null ? (
          <Tag color="default">n/a</Tag>
        ) : (
          <span className="text-amber-900 font-semibold tabular-nums">{fmtQty(v)}</span>
        ),
    }),
    amountCol("Closing Value", "closingValue"),
    viewCol(setOpenItem),
  ];

  const movementColumns = [
    dateCol("Date", "date"),
    typeCol("Vch Type", "vchType"),
    textCol("Vch No", "vchNo", { width: 150 }),
    textCol("Party", "party", { width: 200 }),
    qtyCol("Inward", "inQty"),
    qtyCol("Outward", "outQty"),
    amountCol("Rate", "rate"),
    amountCol("Value", "value"),
    viewCol((r) => setVoucher(r.voucher)),
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () =>
    printReport({
      title: "Stock Movement",
      orgName: book.ctx?.orgName,
      period,
      sections: [
        {
          columns: [
            { title: "Item", key: "product" },
            { title: "HSN", key: "hsn" },
            { title: "UOM", key: "uom" },
            { title: "Opening", key: "openingQty", numeric: true },
            { title: "Inward", key: "inwardQty", numeric: true },
            { title: "Returns In", key: "returnQty", numeric: true },
            { title: "Outward", key: "outwardQty", numeric: true },
            { title: "Closing", key: "closingQty", numeric: true },
            { title: "Closing Value", key: "closingValue", numeric: true },
          ],
          rows: filtered,
          totals: { label: "Total", ...totals },
        },
      ],
      note:
        "Inward is taken from purchase invoice quantities and sales returns; outward from sales invoice delivered quantities. Closing stock is the live inventory figure, so opening is derived by reversing this period's movement.",
    });

  const handleExcel = () =>
    exportToExcel(
      filtered.map((r) => ({
        Item: r.product,
        HSN: r.hsn,
        UOM: r.uom,
        Opening: r.openingQty,
        Inward: num(r.inwardQty),
        "Inward Value": num(r.inwardValue),
        "Returns In": num(r.returnQty),
        Outward: num(r.outwardQty),
        "Outward Value": num(r.outwardValue),
        "Net Movement": num(r.netQty),
        Closing: r.closingQty,
        "Closing Value": r.closingValue,
      })),
      "stock-movement",
      "Stock Movement",
    );

  return (
    <>
      <ReportShell
        title="Stock Movement"
        subtitle="Inward, outward and closing position by item"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Item or HSN"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        detailLoading={book.detailLoading}
        error={book.isError ? book.error : null}
        basisNote="Inward is purchase invoice quantities plus sales returns; outward is sales invoice delivered quantities. Closing stock is the live inventory figure, so opening is back-calculated by reversing the period's movement rather than read from an opening-stock master."
        summary={
          <SummaryCards
            items={[
              { label: "Items Moved", value: filtered.length, tone: "slate" },
              { label: "Inward Qty", value: fmtQty(totals.inwardQty), tone: "green" },
              { label: "Outward Qty", value: fmtQty(totals.outwardQty), tone: "red" },
              { label: "Inward Value", value: inr(totals.inwardValue) },
              { label: "Outward Value", value: inr(totals.outwardValue) },
              { label: "Closing Value", value: inr(totals.closingValue), tone: "blue" },
            ]}
          />
        }
      >
        <ReportTable
          columns={columns}
          dataSource={filtered}
          totals={totals}
          scrollX={1850}
          pageSize={20}
        />
      </ReportShell>

      <Drawer
        open={Boolean(openItem)}
        onClose={() => setOpenItem(null)}
        width={950}
        title={
          <span className="text-amber-800 font-semibold">
            Movement — {openItem?.product}
          </span>
        }
      >
        {openItem ? (
          <>
            <SummaryCards
              items={[
                { label: "Opening", value: fmtQty(openItem.openingQty ?? 0), tone: "slate" },
                { label: "Inward", value: fmtQty(openItem.inwardQty), tone: "green" },
                { label: "Outward", value: fmtQty(openItem.outwardQty), tone: "red" },
                { label: "Closing", value: fmtQty(openItem.closingQty ?? 0), tone: "blue" },
              ]}
            />
            <ReportTable
              columns={movementColumns}
              dataSource={openItem.movements}
              totals={{
                inQty: sumBy(openItem.movements, "inQty"),
                outQty: sumBy(openItem.movements, "outQty"),
                value: sumBy(openItem.movements, "value"),
              }}
              scrollX={1000}
              pageSize={20}
            />
          </>
        ) : (
          <Empty />
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

export default StockMovement;

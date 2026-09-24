/**
 * Stock Summary — Tally's "Stock Summary" with closing quantity and value.
 *
 * Valuation is at LAST PURCHASE RATE, which is a standard Tally valuation
 * method and the only one this data supports (no cost layers are stored).
 * Items with no purchase history fall back to MRP and are flagged as such.
 */
import React, { useMemo, useState } from "react";
import { Tag, Drawer, Descriptions, Empty, Segmented } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import ReportTable, {
  textCol,
  amountCol,
  qtyCol,
  viewCol,
} from "../components/ReportTable";

import { useVoucherBook } from "../hooks/useAccountsData";
import { buildStockSummary } from "../lib/accounting";
import { inr, sumBy, num, qty as fmtQty } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const StockSummary = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All items");
  const [item, setItem] = useState(null);

  const book = useVoucherBook();

  const rows = useMemo(
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

  const filtered = useMemo(() => {
    let out = rows;
    if (filter === "Below minimum") out = out.filter((r) => r.belowMin);
    if (filter === "Not valued") out = out.filter((r) => r.rate === 0);
    if (filter === "In stock") out = out.filter((r) => r.closingQty > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          String(r.product).toLowerCase().includes(q) ||
          String(r.hsn).toLowerCase().includes(q) ||
          String(r.group).toLowerCase().includes(q),
      );
    }
    return out;
  }, [rows, filter, search]);

  const totals = useMemo(
    () => ({
      closingQty: sumBy(filtered, "closingQty"),
      value: sumBy(filtered, "value"),
    }),
    [filtered],
  );

  const notValued = rows.filter((r) => r.rate === 0 && r.closingQty > 0);
  const belowMin = rows.filter((r) => r.belowMin);

  const columns = [
    textCol("Item", "product", { width: 240, fixed: "left" }),
    textCol("Stock Group", "group", { width: 160 }),
    textCol("HSN", "hsn", { width: 110 }),
    textCol("UOM", "uom", { width: 90 }),
    {
      ...amountCol("GST %", "gstPct"),
      width: 90,
      render: (v) => (
        <span className="text-amber-800">{num(v) ? `${num(v)}%` : "-"}</span>
      ),
    },
    qtyCol("Closing Qty", "closingQty", {
      render: (v, r) => (
        <span
          className={
            r.belowMin
              ? "text-rose-700 font-semibold tabular-nums"
              : "text-amber-800 tabular-nums"
          }
        >
          {fmtQty(v)}
        </span>
      ),
    }),
    qtyCol("Min Level", "minStock"),
    amountCol("Rate", "rate"),
    {
      ...textCol("Rate Basis", "rateSource"),
      width: 170,
      render: (v) => (
        <Tag color={v === "Last purchase" ? "green" : v === "Not valued" ? "red" : "orange"}>
          {v}
        </Tag>
      ),
    },
    amountCol("Stock Value", "value", {
      render: (v) => (
        <span className="text-amber-900 font-semibold tabular-nums">{inr(v)}</span>
      ),
    }),
    viewCol(setItem),
  ];

  const handlePdf = () =>
    printReport({
      title: "Stock Summary",
      orgName: book.ctx?.orgName,
      period: `As on today`,
      meta: [{ label: "Valuation", value: "Last purchase rate" }],
      sections: [
        {
          columns: [
            { title: "Item", key: "product" },
            { title: "Group", key: "group" },
            { title: "HSN", key: "hsn" },
            { title: "UOM", key: "uom" },
            { title: "Closing Qty", key: "closingQty", numeric: true },
            { title: "Rate", key: "rate", numeric: true },
            { title: "Rate Basis", key: "rateSource" },
            { title: "Value", key: "value", numeric: true },
          ],
          rows: filtered,
          totals: { label: "Total", closingQty: totals.closingQty, value: totals.value },
        },
      ],
      note:
        "Closing stock is the current stock held in the inventory master. Valuation uses the last purchase rate for each item; items never purchased fall back to MRP, and items with neither are shown as not valued.",
    });

  const handleExcel = () =>
    exportToExcel(
      filtered.map((r) => ({
        Item: r.product,
        "Stock Group": r.group,
        HSN: r.hsn,
        UOM: r.uom,
        "GST %": r.gstPct,
        "Closing Qty": num(r.closingQty),
        "Minimum Level": num(r.minStock),
        Rate: num(r.rate),
        "Rate Basis": r.rateSource,
        "Last Purchase Rate": num(r.lastPurchaseRate),
        MRP: num(r.mrp),
        "Stock Value": num(r.value),
      })),
      "stock-summary",
      "Stock Summary",
    );

  return (
    <>
      <ReportShell
        title="Stock Summary"
        subtitle="Closing quantity and value by item"
        showRange={false}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Item, HSN, group"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        error={book.isError ? book.error : null}
        basisNote="Quantities are the live stock held in the inventory master. Value uses the last purchase rate for each item — a standard Tally valuation method and the only one this data supports, since no cost layers are stored. Items with no purchase history fall back to MRP and are flagged."
        extra={
          <Segmented
            options={["All items", "In stock", "Below minimum", "Not valued"]}
            value={filter}
            onChange={setFilter}
          />
        }
        summary={
          <SummaryCards
            items={[
              { label: "Items", value: filtered.length, tone: "slate" },
              { label: "Total Quantity", value: fmtQty(totals.closingQty) },
              { label: "Stock Value", value: inr(totals.value), tone: "green" },
              { label: "Below Minimum", value: belowMin.length, tone: belowMin.length ? "red" : "green" },
              {
                label: "Unvalued Items",
                value: notValued.length,
                tone: notValued.length ? "red" : "green",
                hint: "In stock but with no purchase rate or MRP",
              },
            ]}
          />
        }
      >
        <ReportTable
          columns={columns}
          dataSource={filtered}
          totals={totals}
          scrollX={1650}
          pageSize={20}
        />
      </ReportShell>

      <Drawer
        open={Boolean(item)}
        onClose={() => setItem(null)}
        width={620}
        title={<span className="text-amber-800 font-semibold">{item?.product}</span>}
      >
        {item ? (
          <Descriptions
            column={1}
            bordered
            size="small"
            labelStyle={{ color: "#92400e", fontWeight: 600, width: 200 }}
          >
            <Descriptions.Item label="Stock Group">{item.group}</Descriptions.Item>
            <Descriptions.Item label="HSN / SAC">{item.hsn}</Descriptions.Item>
            <Descriptions.Item label="Unit">{item.uom}</Descriptions.Item>
            <Descriptions.Item label="GST Rate">
              {item.gstPct ? `${item.gstPct}%` : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Closing Quantity">
              {fmtQty(item.closingQty)}
            </Descriptions.Item>
            <Descriptions.Item label="Minimum Level">
              {fmtQty(item.minStock)}
              {item.belowMin && <Tag color="red" className="ml-2">Below minimum</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Last Purchase Rate">
              {item.lastPurchaseRate ? inr(item.lastPurchaseRate) : "Never purchased"}
            </Descriptions.Item>
            <Descriptions.Item label="Last Purchase Voucher">
              {item.lastPurchaseVch}
            </Descriptions.Item>
            <Descriptions.Item label="MRP">
              {item.mrp ? inr(item.mrp) : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Valuation Rate">
              {inr(item.rate)} <Tag color="gold" className="ml-2">{item.rateSource}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Stock Value">
              <span className="font-bold text-amber-900">{inr(item.value)}</span>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty />
        )}
      </Drawer>
    </>
  );
};

export default StockSummary;

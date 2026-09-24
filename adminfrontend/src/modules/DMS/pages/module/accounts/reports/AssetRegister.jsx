/**
 * Fixed Asset Register — asset cost, depreciation and disposals.
 * This is the one area where the source data needs no derivation at all.
 */
import React, { useMemo, useState } from "react";
import { Tabs, Tag, Drawer, Descriptions, Empty } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  viewCol,
} from "../components/ReportTable";

import { useAssetCore, useAccountsCore } from "../hooks/useAccountsData";
import { buildContext } from "../lib/accounting";
import { inr, sumBy, fmtDate, num, pick, round2 } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const AssetRegister = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("assets");
  const [openAsset, setOpenAsset] = useState(null);

  const core = useAccountsCore();
  const assetQuery = useAssetCore();
  const ctx = useMemo(
    () => (core.data ? buildContext(core.data) : null),
    [core.data],
  );

  const { assets = [], depreciation = [], disposals = [] } = assetQuery.data || {};

  const assetRows = useMemo(
    () =>
      assets.map((a, idx) => {
        const cost = num(pick(a, "cost_price", "purchase_value"));
        const current = num(pick(a, "current_value"));
        return {
          key: pick(a, "id") ?? idx,
          code: pick(a, "asset_code", "code") || "-",
          name: pick(a, "name", "asset_name") || "-",
          category:
            pick(a, "category_name", "category") ||
            pick(a.category || {}, "name") ||
            "-",
          type: pick(a, "asset_type", "type") || "-",
          purchaseDate: pick(a, "purchase_date"),
          vendor: pick(a, "purchase_vendor", "vendor") || "-",
          invoice: pick(a, "purchase_invoice") || "-",
          gst: num(pick(a, "purchase_gst")),
          cost,
          current,
          depreciated: round2(Math.max(0, cost - current)),
          method: pick(a, "depreciation_method") || "-",
          rate: num(pick(a, "depreciation_rate", "depreciation_percent")),
          location: pick(a, "location") || "-",
          status: pick(a, "status") || "-",
          raw: a,
        };
      }),
    [assets],
  );

  const depRows = useMemo(
    () =>
      depreciation.map((d, idx) => {
        const pv = num(pick(d, "purchase_value"));
        const cv = num(pick(d, "current_value"));
        return {
          key: pick(d, "id") ?? idx,
          asset: pick(d, "asset_name", "asset") || "-",
          fiscalYear: pick(d, "fiscal_year") || "-",
          method: pick(d, "depreciation_method", "method") || "-",
          rate: num(pick(d, "depreciation_rate")),
          purchaseValue: pv,
          currentValue: cv,
          charge: round2(Math.max(0, pv - cv)),
          startDate: pick(d, "start_date"),
          endDate: pick(d, "end_date"),
        };
      }),
    [depreciation],
  );

  const disposalRows = useMemo(
    () =>
      disposals.map((d, idx) => ({
        key: pick(d, "id") ?? idx,
        asset: pick(d, "asset_name", "asset") || "-",
        type: pick(d, "disposal_type") || "-",
        buyer: pick(d, "buyer_name") || "-",
        date: pick(d, "disposal_date"),
        saleValue: num(pick(d, "sale_value")),
        remarks: pick(d, "remarks", "narration") || "-",
      })),
    [disposals],
  );

  const match = (r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(r).some((v) => String(v).toLowerCase().includes(q));
  };

  const filteredAssets = assetRows.filter(match);
  const filteredDep = depRows.filter(match);
  const filteredDisposals = disposalRows.filter(match);

  const totals = {
    cost: sumBy(filteredAssets, "cost"),
    current: sumBy(filteredAssets, "current"),
    depreciated: sumBy(filteredAssets, "depreciated"),
  };

  const assetColumns = [
    textCol("Asset Code", "code", { width: 130, fixed: "left" }),
    textCol("Asset Name", "name", { width: 210 }),
    textCol("Category", "category", { width: 150 }),
    {
      ...textCol("Type", "type"),
      width: 110,
      render: (v) => <Tag color={v === "Fixed" ? "blue" : "gold"}>{v}</Tag>,
    },
    dateCol("Purchase Date", "purchaseDate"),
    textCol("Vendor", "vendor", { width: 170 }),
    textCol("Invoice", "invoice", { width: 140 }),
    amountCol("Cost", "cost"),
    amountCol("Depreciated", "depreciated"),
    amountCol("Book Value", "current", {
      render: (v) => (
        <span className="text-amber-900 font-semibold tabular-nums">{inr(v)}</span>
      ),
    }),
    textCol("Method", "method", { width: 140 }),
    {
      ...textCol("Status", "status"),
      width: 120,
      render: (v) => <Tag color="gold">{v}</Tag>,
    },
    viewCol(setOpenAsset),
  ];

  const depColumns = [
    textCol("Asset", "asset", { width: 210 }),
    textCol("Fiscal Year", "fiscalYear", { width: 130 }),
    textCol("Method", "method", { width: 160 }),
    {
      ...amountCol("Rate", "rate"),
      width: 90,
      render: (v) => <span className="text-amber-800">{num(v) ? `${num(v)}%` : "-"}</span>,
    },
    dateCol("Start", "startDate"),
    dateCol("End", "endDate"),
    amountCol("Purchase Value", "purchaseValue"),
    amountCol("Depreciation", "charge"),
    amountCol("Current Value", "currentValue"),
  ];

  const disposalColumns = [
    textCol("Asset", "asset", { width: 220 }),
    textCol("Disposal Type", "type", { width: 150 }),
    textCol("Buyer", "buyer", { width: 180 }),
    dateCol("Disposal Date", "date"),
    amountCol("Sale Value", "saleValue"),
    textCol("Remarks", "remarks", { width: 220, ellipsis: true }),
  ];

  const handlePdf = () =>
    printReport({
      title: "Fixed Asset Register",
      orgName: ctx?.orgName,
      period: "As on today",
      sections: [
        {
          heading: "Assets",
          columns: [
            { title: "Code", key: "code" },
            { title: "Asset", key: "name" },
            { title: "Category", key: "category" },
            { title: "Purchase Date", value: (r) => fmtDate(r.purchaseDate) },
            { title: "Vendor", key: "vendor" },
            { title: "Cost", key: "cost", numeric: true },
            { title: "Depreciated", key: "depreciated", numeric: true },
            { title: "Book Value", key: "current", numeric: true },
          ],
          rows: filteredAssets,
          totals: { label: "Total", ...totals },
        },
        filteredDisposals.length
          ? {
              heading: "Disposals",
              columns: [
                { title: "Asset", key: "asset" },
                { title: "Type", key: "type" },
                { title: "Buyer", key: "buyer" },
                { title: "Date", value: (r) => fmtDate(r.date) },
                { title: "Sale Value", key: "saleValue", numeric: true },
              ],
              rows: filteredDisposals,
              totals: { label: "Total", saleValue: sumBy(filteredDisposals, "saleValue") },
            }
          : null,
      ].filter(Boolean),
      note:
        "Book values are those recorded in the asset module. Depreciation there is entered rather than computed, so this register reflects what was keyed in, not a recalculated schedule.",
    });

  const handleExcel = () => {
    if (tab === "assets") {
      exportToExcel(
        filteredAssets.map((r) => ({
          "Asset Code": r.code,
          "Asset Name": r.name,
          Category: r.category,
          Type: r.type,
          "Purchase Date": fmtDate(r.purchaseDate),
          Vendor: r.vendor,
          Invoice: r.invoice,
          "Purchase GST": num(r.gst),
          Cost: num(r.cost),
          Depreciated: num(r.depreciated),
          "Book Value": num(r.current),
          Method: r.method,
          "Rate %": num(r.rate),
          Location: r.location,
          Status: r.status,
        })),
        "asset-register",
        "Assets",
      );
    } else if (tab === "depreciation") {
      exportToExcel(
        filteredDep.map((r) => ({
          Asset: r.asset,
          "Fiscal Year": r.fiscalYear,
          Method: r.method,
          "Rate %": num(r.rate),
          Start: fmtDate(r.startDate),
          End: fmtDate(r.endDate),
          "Purchase Value": num(r.purchaseValue),
          Depreciation: num(r.charge),
          "Current Value": num(r.currentValue),
        })),
        "asset-depreciation",
        "Depreciation",
      );
    } else {
      exportToExcel(
        filteredDisposals.map((r) => ({
          Asset: r.asset,
          "Disposal Type": r.type,
          Buyer: r.buyer,
          Date: fmtDate(r.date),
          "Sale Value": num(r.saleValue),
          Remarks: r.remarks,
        })),
        "asset-disposals",
        "Disposals",
      );
    }
  };

  return (
    <>
      <ReportShell
        title="Fixed Asset Register"
        subtitle="Asset cost, depreciation and disposals"
        showRange={false}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Asset, code, category, vendor"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={assetQuery.refetch}
        loading={assetQuery.isLoading || core.isLoading}
        error={assetQuery.isError ? assetQuery.error : null}
        basisNote="Figures are as recorded in the asset module. Depreciation there is entered by hand rather than computed, so this register reports the values keyed in — it does not recalculate a depreciation schedule."
        summary={
          <SummaryCards
            items={[
              { label: "Assets", value: filteredAssets.length, tone: "slate" },
              { label: "Gross Cost", value: inr(totals.cost) },
              { label: "Accumulated Depreciation", value: inr(totals.depreciated), tone: "red" },
              { label: "Net Book Value", value: inr(totals.current), tone: "green" },
              { label: "Disposals", value: inr(sumBy(filteredDisposals, "saleValue")), sub: `${filteredDisposals.length} assets`, tone: "blue" },
            ]}
          />
        }
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: "assets",
              label: `Assets (${filteredAssets.length})`,
              children: (
                <ReportTable
                  columns={assetColumns}
                  dataSource={filteredAssets}
                  totals={totals}
                  scrollX={1850}
                />
              ),
            },
            {
              key: "depreciation",
              label: `Depreciation (${filteredDep.length})`,
              children: (
                <ReportTable
                  columns={depColumns}
                  dataSource={filteredDep}
                  totals={{
                    purchaseValue: sumBy(filteredDep, "purchaseValue"),
                    charge: sumBy(filteredDep, "charge"),
                    currentValue: sumBy(filteredDep, "currentValue"),
                  }}
                  scrollX={1300}
                />
              ),
            },
            {
              key: "disposals",
              label: `Disposals (${filteredDisposals.length})`,
              children: (
                <ReportTable
                  columns={disposalColumns}
                  dataSource={filteredDisposals}
                  totals={{ saleValue: sumBy(filteredDisposals, "saleValue") }}
                  scrollX={1000}
                />
              ),
            },
          ]}
        />
      </ReportShell>

      <Drawer
        open={Boolean(openAsset)}
        onClose={() => setOpenAsset(null)}
        width={620}
        title={<span className="text-amber-800 font-semibold">{openAsset?.name}</span>}
      >
        {openAsset ? (
          <Descriptions
            column={1}
            bordered
            size="small"
            labelStyle={{ color: "#92400e", fontWeight: 600, width: 200 }}
          >
            <Descriptions.Item label="Asset Code">{openAsset.code}</Descriptions.Item>
            <Descriptions.Item label="Category">{openAsset.category}</Descriptions.Item>
            <Descriptions.Item label="Type">{openAsset.type}</Descriptions.Item>
            <Descriptions.Item label="Purchase Date">
              {fmtDate(openAsset.purchaseDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Vendor">{openAsset.vendor}</Descriptions.Item>
            <Descriptions.Item label="Purchase Invoice">
              {openAsset.invoice}
            </Descriptions.Item>
            <Descriptions.Item label="Purchase GST">
              {openAsset.gst ? inr(openAsset.gst) : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cost">{inr(openAsset.cost)}</Descriptions.Item>
            <Descriptions.Item label="Accumulated Depreciation">
              {inr(openAsset.depreciated)}
            </Descriptions.Item>
            <Descriptions.Item label="Net Book Value">
              <span className="font-bold text-amber-900">{inr(openAsset.current)}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Depreciation Method">
              {openAsset.method}
              {openAsset.rate ? ` @ ${openAsset.rate}%` : ""}
            </Descriptions.Item>
            <Descriptions.Item label="Location">{openAsset.location}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="gold">{openAsset.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty />
        )}
      </Drawer>
    </>
  );
};

export default AssetRegister;

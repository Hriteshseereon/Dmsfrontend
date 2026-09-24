/**
 * Broker Commission.
 *
 * The broker master stores commission RULES (percentage or fixed, per unit /
 * per value / per transaction). The system never computes or records the
 * payable, so this report applies each broker's rule to the sales contracts
 * booked through them.
 */
import React, { useMemo, useState } from "react";
import { Drawer, Tag, Empty } from "antd";

import ReportShell from "../components/ReportShell";
import SummaryCards from "../components/SummaryCards";
import ReportTable, {
  textCol,
  dateCol,
  amountCol,
  qtyCol,
  viewCol,
} from "../components/ReportTable";

import { useVoucherBook, useFinancialPeriod } from "../hooks/useAccountsData";
import { buildBrokerCommission } from "../lib/accounting";
import { inr, sumBy, fmtDate, num } from "../lib/format";
import { printReport } from "../lib/pdf";
import { exportToExcel } from "../../../../../../utils/exportToExcel";

const BrokerCommission = () => {
  const { start, end } = useFinancialPeriod();
  const [range, setRange] = useState([start, end]);
  const [search, setSearch] = useState("");
  const [openBroker, setOpenBroker] = useState(null);

  const book = useVoucherBook();

  const rows = useMemo(
    () =>
      buildBrokerCommission({
        brokers: book.data?.brokers || [],
        salesContracts: book.data?.salesContracts || [],
        range,
      }),
    [book.data, range],
  );

  const filtered = useMemo(() => {
    let out = rows.filter((r) => r.contracts > 0 || r.setupCount > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          String(r.broker).toLowerCase().includes(q) ||
          String(r.gstin).toLowerCase().includes(q),
      );
    }
    return out.sort((a, b) => b.commission - a.commission);
  }, [rows, search]);

  const totals = useMemo(
    () => ({
      contractValue: sumBy(filtered, "contractValue"),
      commission: sumBy(filtered, "commission"),
      contracts: filtered.reduce((a, r) => a + r.contracts, 0),
    }),
    [filtered],
  );

  const noRule = filtered.filter((r) => r.setupCount === 0 && r.contracts > 0);

  const columns = [
    textCol("Broker", "broker", { width: 220, fixed: "left" }),
    textCol("GSTIN", "gstin", { width: 150 }),
    textCol("PAN", "pan", { width: 130 }),
    textCol("State", "state", { width: 140 }),
    {
      ...textCol("Rules", "setupCount"),
      width: 100,
      align: "right",
      render: (v) =>
        num(v) > 0 ? (
          <Tag color="green">{v} configured</Tag>
        ) : (
          <Tag color="red">None</Tag>
        ),
    },
    { ...textCol("Contracts", "contracts"), width: 110, align: "right" },
    amountCol("Contract Value", "contractValue"),
    amountCol("Commission Payable", "commission", {
      render: (v) => (
        <span className="text-amber-900 font-semibold tabular-nums">{inr(v)}</span>
      ),
    }),
    viewCol(setOpenBroker),
  ];

  const lineColumns = [
    dateCol("Date", "date"),
    textCol("Contract No", "contractNo", { width: 170 }),
    textCol("Customer", "customer", { width: 200 }),
    textCol("Plant", "plant", { width: 150 }),
    qtyCol("Quantity", "qty"),
    amountCol("Contract Value", "contractValue"),
    textCol("Commission Basis", "basis", { width: 200 }),
    amountCol("Commission", "commission"),
    {
      ...textCol("Status", "status"),
      width: 120,
      render: (v) => <Tag color="gold">{v}</Tag>,
    },
  ];

  const period = `${fmtDate(range?.[0])} to ${fmtDate(range?.[1])}`;

  const handlePdf = () =>
    printReport({
      title: "Broker Commission",
      orgName: book.ctx?.orgName,
      period,
      sections: [
        {
          columns: [
            { title: "Broker", key: "broker" },
            { title: "GSTIN", key: "gstin" },
            { title: "State", key: "state" },
            { title: "Contracts", key: "contracts", numeric: true },
            { title: "Contract Value", key: "contractValue", numeric: true },
            { title: "Commission", key: "commission", numeric: true },
          ],
          rows: filtered,
          totals: { label: "Total", ...totals },
        },
      ],
      note:
        "Commission is COMPUTED here by applying each broker's configured commission rule to the sales contracts booked through them. The system records the rule and the contract but never the payable, so nothing here has been posted or paid. Brokers with no rule configured show a nil commission.",
    });

  const handleExcel = () =>
    exportToExcel(
      filtered.map((r) => ({
        Broker: r.broker,
        GSTIN: r.gstin,
        PAN: r.pan,
        State: r.state,
        "Rules Configured": r.setupCount,
        Contracts: r.contracts,
        "Contract Value": num(r.contractValue),
        "Commission Payable": num(r.commission),
      })),
      "broker-commission",
      "Broker Commission",
    );

  return (
    <>
      <ReportShell
        title="Broker Commission"
        subtitle="Commission computed from each broker's configured rules"
        range={range}
        onRangeChange={setRange}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Broker or GSTIN"
        onPdf={handlePdf}
        onExcel={handleExcel}
        onRefresh={book.refetch}
        loading={book.isLoading}
        error={book.isError ? book.error : null}
        basisNote="The broker master stores commission rules; the system never computes or records a payable. This report applies each broker's rule to the sales contracts booked through them — nothing here has been posted or paid, so treat it as a liability estimate."
        summary={
          <SummaryCards
            items={[
              { label: "Brokers", value: filtered.length, tone: "slate" },
              { label: "Contracts", value: totals.contracts },
              { label: "Contract Value", value: inr(totals.contractValue) },
              { label: "Commission Payable", value: inr(totals.commission), tone: "red" },
              {
                label: "Missing Rules",
                value: noRule.length,
                tone: noRule.length ? "red" : "green",
                hint: "Brokers with contracts but no commission rule configured",
              },
            ]}
          />
        }
      >
        <ReportTable
          columns={columns}
          dataSource={filtered}
          totals={totals}
          scrollX={1400}
        />
      </ReportShell>

      <Drawer
        open={Boolean(openBroker)}
        onClose={() => setOpenBroker(null)}
        width={1000}
        title={
          <span className="text-amber-800 font-semibold">
            Commission workings — {openBroker?.broker}
          </span>
        }
      >
        {openBroker ? (
          <>
            <SummaryCards
              items={[
                { label: "Contracts", value: openBroker.contracts, tone: "slate" },
                { label: "Contract Value", value: inr(openBroker.contractValue) },
                { label: "Commission", value: inr(openBroker.commission), tone: "red" },
                { label: "Rules", value: openBroker.setupCount, tone: openBroker.setupCount ? "green" : "red" },
              ]}
            />
            {openBroker.setupCount === 0 && (
              <div className="mb-4 text-xs text-rose-700 bg-rose-50 border-l-4 border-rose-400 px-3 py-2 rounded">
                No commission rule is configured for this broker, so the
                commission is nil. Add a rule in the Broker master to value it.
              </div>
            )}
            {openBroker.lines.length ? (
              <ReportTable
                columns={lineColumns}
                dataSource={openBroker.lines}
                totals={{
                  contractValue: sumBy(openBroker.lines, "contractValue"),
                  commission: sumBy(openBroker.lines, "commission"),
                  qty: sumBy(openBroker.lines, "qty"),
                }}
                scrollX={1350}
                pageSize={20}
              />
            ) : (
              <Empty
                description="No sales contracts booked through this broker in the period"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </>
        ) : (
          <Empty />
        )}
      </Drawer>
    </>
  );
};

export default BrokerCommission;

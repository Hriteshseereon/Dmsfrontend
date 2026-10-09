import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Space,
  Spin,
  Empty,
  message,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getStockStatusSuppliers,
  getStockStatusReport,
  getSummaryStockStatementReport,
  getSaleInvoicePlants,
} from "../../../../../api/sales";
import AppDatePicker from "../../../../../components/AppDatePicker";
import useSessionStore from "../../../../../store/sessionStore";
import { useSelectedFinancialYear } from "../../../../../utils/financialYearValidation";

const { Option } = Select;
const { Text, Title } = Typography;

const extractArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.results)) return res.results;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const formatNum = (val, decimals = 3) => {
  if (val === null || val === undefined || val === "") return "-";
  const n = Number(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const n = Number(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function StockReport() {
  const currentOrgId = useSessionStore((state) => state.currentOrgId);
  const selectedFY = useSelectedFinancialYear();

  // Active Tab: "status" (Stock Status as on Date) | "summary" (Summary Stock Statement)
  const [activeTab, setActiveTab] = useState("status");

  // Master Dropdown State
  const [suppliers, setSuppliers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Common Filter State
  const [selectedSupplier, setSelectedSupplier] = useState(undefined);
  const [selectedPlant, setSelectedPlant] = useState("direct");

  // Tab 1 (Stock Status) Filters & Data
  const [asOnDate, setAsOnDate] = useState(dayjs());
  const [statusData, setStatusData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Tab 2 (Summary Statement) Filters & Data
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  /* ---------------- LOAD MASTER DROPDOWNS ---------------- */
  useEffect(() => {
    loadMasters();
  }, [currentOrgId]);

  const loadMasters = async () => {
    setLoadingMasters(true);
    try {
      const [supRes, plantRes] = await Promise.allSettled([
        getStockStatusSuppliers(),
        getSaleInvoicePlants(),
      ]);

      if (supRes.status === "fulfilled" && supRes.value) {
        const supList = extractArray(supRes.value);
        setSuppliers(supList);
        if (supList.length > 0 && !selectedSupplier) {
          const firstSup = supList[0];
          const supName =
            firstSup.supplier_name ||
            firstSup.name ||
            firstSup.business_name ||
            firstSup.company_name;
          setSelectedSupplier(supName);
        }
      }

      if (plantRes.status === "fulfilled" && plantRes.value) {
        const pList = extractArray(plantRes.value);
        const hasDirect = pList.some(
          (p) =>
            String(p.id).toLowerCase() === "direct" ||
            String(p.name).toLowerCase() === "direct" ||
            p.is_direct === true
        );
        const formattedPlants = hasDirect
          ? pList
          : [
              {
                id: "direct",
                name: "Direct",
                code: "INV",
                short_name: "Direct",
                is_direct: true,
                type: "DIRECT",
              },
              ...pList,
            ];
        setPlants(formattedPlants);
      }
    } catch (err) {
      console.error("Error loading stock report masters:", err);
    } finally {
      setLoadingMasters(false);
    }
  };

  /* ---------------- FETCH STOCK STATUS DATA (TAB 1) ---------------- */
  const fetchStockStatus = async () => {
    if (!selectedSupplier) {
      message.warning("Please select a Company / Supplier Name");
      return;
    }

    setLoadingStatus(true);
    try {
      const isDirect =
        String(selectedPlant).toLowerCase() === "direct" ||
        selectedPlant === undefined;
      const plantObj = plants.find(
        (p) => String(p.id || p.name) === String(selectedPlant)
      );
      const plantName = isDirect
        ? "Direct"
        : plantObj?.name || selectedPlant || "Depo";

      const params = {
        supplier_name: selectedSupplier,
        plant_name: plantName,
        is_direct: isDirect,
        as_on_date: asOnDate ? asOnDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      };

      const res = await getStockStatusReport(params);
      const data = res?.data !== undefined ? res.data : res;
      setStatusData(data);
    } catch (err) {
      console.error("Error fetching stock status:", err);
      message.error("Failed to load stock status data");
      setStatusData(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  /* ---------------- FETCH SUMMARY STOCK STATEMENT (TAB 2) ---------------- */
  const fetchSummaryStatement = async () => {
    if (!selectedSupplier) {
      message.warning("Please select a Company / Supplier Name");
      return;
    }
    if (!fromDate || !toDate) {
      message.warning("Please select From Date and To Date");
      return;
    }

    setLoadingSummary(true);
    try {
      const isDirect =
        String(selectedPlant).toLowerCase() === "direct" ||
        selectedPlant === undefined;
      const plantObj = plants.find(
        (p) => String(p.id || p.name) === String(selectedPlant)
      );
      const plantName = isDirect
        ? "Direct"
        : plantObj?.name || selectedPlant || "Depo";

      const params = {
        supplier_name: selectedSupplier,
        plant_name: plantName,
        is_direct: isDirect,
        from_date: fromDate.format("YYYY-MM-DD"),
        to_date: toDate.format("YYYY-MM-DD"),
      };

      const res = await getSummaryStockStatementReport(params);
      const data = res?.data !== undefined ? res.data : res;
      setSummaryData(data);
    } catch (err) {
      console.error("Error fetching summary stock statement:", err);
      message.error("Failed to load summary stock statement");
      setSummaryData(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Auto-fetch when supplier or active tab is ready
  useEffect(() => {
    if (selectedSupplier) {
      if (activeTab === "status") {
        fetchStockStatus();
      } else {
        fetchSummaryStatement();
      }
    }
  }, [activeTab, selectedSupplier, selectedPlant]);

  /* ---------------- EXCEL EXPORT HANDLERS ---------------- */
  const exportStockStatusExcel = () => {
    if (!statusData || !Array.isArray(statusData.groups)) {
      message.info("No data available to export");
      return;
    }

    const rows = [];
    statusData.groups.forEach((grp) => {
      // Group Header row
      rows.push({
        "SL. NO.": `[ GROUP: ${grp.group_name} ]`,
        "ITEM NAME / FLAVOUR": "",
        UNIT: "",
        "QTY.": "",
        AMOUNT: "",
        "NET WT PER UNIT": "",
        "TOTAL NET WT": "",
        "GROSS WT PER UNIT": "",
        "TOTAL GROSS WT": "",
      });

      (grp.items || []).forEach((it) => {
        rows.push({
          "SL. NO.": it.sl_no,
          "ITEM NAME / FLAVOUR": it.item_name,
          UNIT: it.unit,
          "QTY.": Number(it.qty || 0),
          AMOUNT: Number(it.amount || 0),
          "NET WT PER UNIT": Number(it.net_wt_per_unit || 0),
          "TOTAL NET WT": Number(it.total_net_wt || 0),
          "GROSS WT PER UNIT": Number(it.gross_wt_per_unit || 0),
          "TOTAL GROSS WT": Number(it.total_gross_wt || 0),
        });
      });

      if (grp.subtotal) {
        rows.push({
          "SL. NO.": "",
          "ITEM NAME / FLAVOUR": `SUBTOTAL (${grp.group_name})`,
          UNIT: "",
          "QTY.": Number(grp.subtotal.qty || 0),
          AMOUNT: Number(grp.subtotal.amount || 0),
          "NET WT PER UNIT": "",
          "TOTAL NET WT": Number(grp.subtotal.total_net_wt || 0),
          "GROSS WT PER UNIT": "",
          "TOTAL GROSS WT": Number(grp.subtotal.total_gross_wt || 0),
        });
      }
    });

    exportToExcel(
      rows,
      `Stock_Status_${asOnDate.format("DD_MM_YYYY")}`,
      "StockStatus"
    );
  };

  const exportSummaryStatementExcel = () => {
    if (!summaryData || !Array.isArray(summaryData.groups)) {
      message.info("No data available to export");
      return;
    }

    const rows = [];
    summaryData.groups.forEach((grp) => {
      rows.push({
        "SL. NO.": `[ GROUP: ${grp.group_name} ]`,
        "ITEM NAME / FLAVOUR": "",
        UNIT: "",
        "OB QTY": "",
        "RECEIPT QTY": "",
        "ISSUED QTY": "",
        "BALANCE QTY.": "",
        "NET WT": "",
        "GROSS WT": "",
        "STOCK VALUE": "",
      });

      (grp.items || []).forEach((it) => {
        rows.push({
          "SL. NO.": it.sl_no,
          "ITEM NAME / FLAVOUR": it.item_name,
          UNIT: it.unit,
          "OB QTY": Number(it.ob_qty || 0),
          "RECEIPT QTY": Number(it.receipt_qty || 0),
          "ISSUED QTY": Number(it.issued_qty || 0),
          "BALANCE QTY.": Number(it.balance_qty || 0),
          "NET WT": Number(it.net_wt || 0),
          "GROSS WT": Number(it.gross_wt || 0),
          "STOCK VALUE": Number(it.stock_value || 0),
        });
      });

      if (grp.subtotal) {
        rows.push({
          "SL. NO.": "",
          "ITEM NAME / FLAVOUR": `SUBTOTAL (${grp.group_name})`,
          UNIT: "",
          "OB QTY": Number(grp.subtotal.ob_qty || 0),
          "RECEIPT QTY": Number(grp.subtotal.receipt_qty || 0),
          "ISSUED QTY": Number(grp.subtotal.issued_qty || 0),
          "BALANCE QTY.": Number(grp.subtotal.balance_qty || 0),
          "NET WT": Number(grp.subtotal.net_wt || 0),
          "GROSS WT": Number(grp.subtotal.gross_wt || 0),
          "STOCK VALUE": Number(grp.subtotal.stock_value || 0),
        });
      }
    });

    if (summaryData.grand_total) {
      rows.push({
        "SL. NO.": "TOTAL",
        "ITEM NAME / FLAVOUR": "GRAND TOTAL",
        UNIT: "",
        "OB QTY": Number(summaryData.grand_total.ob_qty || 0),
        "RECEIPT QTY": Number(summaryData.grand_total.receipt_qty || 0),
        "ISSUED QTY": Number(summaryData.grand_total.issued_qty || 0),
        "BALANCE QTY.": Number(summaryData.grand_total.balance_qty || 0),
        "NET WT": Number(summaryData.grand_total.net_wt || 0),
        "GROSS WT": Number(summaryData.grand_total.gross_wt || 0),
        "STOCK VALUE": Number(summaryData.grand_total.stock_value || 0),
      });
    }

    exportToExcel(
      rows,
      `Summary_Stock_Statement_${fromDate.format("DD_MM_YYYY")}_to_${toDate.format("DD_MM_YYYY")}`,
      "SummaryStock"
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-1 space-y-3">
      {/* TOP TABS NAVIGATION */}
      <Card
        size="small"
        className="border-amber-200 shadow-sm bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40"
        styles={{ body: { padding: "8px 16px" } }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-900 text-base flex items-center gap-2">
              <FileTextOutlined className="text-amber-600" />
              IN-TRANSIT STOCK REPORTS
            </span>
            <Tag color="orange" className="font-bold text-xs uppercase px-2 py-0.5 border-amber-400">
              Live Balance
            </Tag>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k)}
            type="card"
            className="stock-report-tabs mb-[-8px]"
            items={[
              {
                key: "status",
                label: (
                  <span className="font-bold flex items-center gap-1.5 px-1">
                    <CalendarOutlined />
                    Stock Status as on Date
                  </span>
                ),
              },
              {
                key: "summary",
                label: (
                  <span className="font-bold flex items-center gap-1.5 px-1">
                    <FileTextOutlined />
                    Summary Stock Statement
                  </span>
                ),
              },
            ]}
          />
        </div>
      </Card>

      {/* FILTER CONTROLS CARD */}
      <Card
        size="small"
        className="border-amber-300 shadow-sm bg-white"
        styles={{ body: { padding: "14px 18px" } }}
      >
        <Row gutter={[14, 14]} align="bottom">
          {/* 1. Company Name / Supplier */}
          <Col xs={24} sm={12} md={7}>
            <div>
              <label className="text-amber-900 font-bold text-xs block mb-1.5 flex items-center gap-1">
                <ShopOutlined className="text-amber-600" />
                COMPANY NAME (SUPPLIER) <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="-- Select Company / Supplier --"
                showSearch
                optionFilterProp="children"
                className="w-full font-semibold"
                style={{ height: "38px" }}
                value={selectedSupplier}
                onChange={(val) => setSelectedSupplier(val)}
                loading={loadingMasters}
              >
                {suppliers.map((s, idx) => {
                  const sName =
                    s.supplier_name ||
                    s.name ||
                    s.business_name ||
                    s.company_name ||
                    `Supplier #${idx + 1}`;
                  const sId = s.id || s.vendor_id || sName || idx;
                  return (
                    <Option key={String(sId)} value={sName}>
                      {sName}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>

          {/* 2. Depo / Direct */}
          <Col xs={24} sm={12} md={5}>
            <div>
              <label className="text-amber-900 font-bold text-xs block mb-1.5 flex items-center gap-1">
                <ApartmentOutlined className="text-amber-600" />
                DEPO / DIRECT <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Select Depo / Direct"
                showSearch
                optionFilterProp="children"
                className="w-full font-semibold"
                style={{ height: "38px" }}
                value={selectedPlant}
                onChange={(val) => setSelectedPlant(val)}
              >
                {plants.map((p, idx) => {
                  const pId = p.id || p.plant_id || p.pk || idx;
                  const pName =
                    p.name ||
                    p.plant_name ||
                    p.short_name ||
                    (p.is_direct ? "Direct" : `Plant #${pId}`);
                  return (
                    <Option key={String(pId)} value={String(pId)}>
                      {pName}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>

          {/* 3. Date Selection (Single date for Tab 1 vs Date Range for Tab 2) */}
          {activeTab === "status" ? (
            <Col xs={24} sm={12} md={5}>
              <div>
                <label className="text-amber-900 font-bold text-xs block mb-1.5 flex items-center gap-1">
                  <CalendarOutlined className="text-amber-600" />
                  AS ON DT. (DATE)
                </label>
                <AppDatePicker
                  className="w-full font-semibold"
                  style={{ height: "38px", fontSize: "13px" }}
                  value={asOnDate}
                  onChange={(d) => setAsOnDate(d || dayjs())}
                  allowClear={false}
                />
              </div>
            </Col>
          ) : (
            <>
              <Col xs={24} sm={12} md={3}>
                <div>
                  <label className="text-amber-900 font-bold text-xs block mb-1.5 flex items-center gap-1">
                    <CalendarOutlined className="text-amber-600" />
                    FROM DATE
                  </label>
                  <AppDatePicker
                    className="w-full font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    value={fromDate}
                    onChange={(d) => setFromDate(d || dayjs().subtract(7, "day"))}
                    allowClear={false}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <div>
                  <label className="text-amber-900 font-bold text-xs block mb-1.5 flex items-center gap-1">
                    <CalendarOutlined className="text-amber-600" />
                    TO DATE
                  </label>
                  <AppDatePicker
                    className="w-full font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    value={toDate}
                    onChange={(d) => setToDate(d || dayjs())}
                    allowClear={false}
                  />
                </div>
              </Col>
            </>
          )}

          {/* Action Buttons */}
          <Col xs={24} sm={12} md={activeTab === "status" ? 7 : 6} className="text-right">
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                className="bg-amber-500! hover:bg-amber-600! border-none! font-semibold"
                style={{ height: "38px" }}
                loading={activeTab === "status" ? loadingStatus : loadingSummary}
                onClick={activeTab === "status" ? fetchStockStatus : fetchSummaryStatement}
              >
                {activeTab === "status" ? "Generate Report" : "Generate Statement"}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                className="border-amber-400! text-amber-700! hover:bg-amber-100! font-semibold"
                style={{ height: "38px" }}
                onClick={activeTab === "status" ? exportStockStatusExcel : exportSummaryStatementExcel}
              >
                Export
              </Button>
              <Button
                icon={<PrinterOutlined />}
                className="border-amber-300! text-amber-800! hover:bg-amber-50!"
                style={{ height: "38px" }}
                onClick={handlePrint}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: STOCK STATUS AS ON DATE TABLE VIEW (MATCHING IMAGE 1) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "status" && (
        <Card
          size="small"
          className="border-2 border-amber-400 shadow-md bg-white print-container overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          {loadingStatus ? (
            <div className="py-20 text-center">
              <Spin size="large" tip="Loading in-transit stock status..." />
            </div>
          ) : !statusData || !Array.isArray(statusData.groups) || statusData.groups.length === 0 ? (
            <div className="py-16 text-center">
              <Empty
                description={
                  <div className="text-gray-600 font-medium">
                    No stock in transit found for{" "}
                    <strong className="text-amber-800">{selectedSupplier || "selected company"}</strong>{" "}
                    on {asOnDate ? asOnDate.format("DD-MM-YYYY") : "selected date"}.
                  </div>
                }
              />
            </div>
          ) : (
            <div>
              {/* Top Banner (Matching Image 1: Yellow Header) */}
              <div
                style={{
                  backgroundColor: "#FEF08A",
                  textAlign: "center",
                  padding: "10px",
                  borderBottom: "2px solid #CA8A04",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    fontWeight: 900,
                    fontSize: "17px",
                    color: "#78350F",
                    letterSpacing: "0.5px",
                  }}
                >
                  AUM AGRO ASSOCIATES PRIVATE LIMITED
                </h3>
              </div>

              {/* Sub-Header 1: Company Name */}
              <div
                style={{
                  backgroundColor: "#FED7AA",
                  padding: "8px 14px",
                  borderBottom: "1px solid #D97706",
                  fontWeight: 800,
                  fontSize: "13px",
                  color: "#7C2D12",
                }}
              >
                COMPANY NAME :{" "}
                <span style={{ color: "#431407", fontWeight: 900 }}>
                  {statusData.company_name || selectedSupplier}
                </span>
                {statusData.depo_name && (
                  <span className="ml-4 text-amber-900 font-bold">
                    | DEPO / DIRECT: {statusData.depo_name}
                  </span>
                )}
              </div>

              {/* Sub-Header 2: Title & As On Date */}
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  padding: "8px 14px",
                  borderBottom: "2px solid #CA8A04",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: 800,
                  fontSize: "13px",
                  color: "#92400E",
                }}
              >
                <span>STOCK STATUS AS ON DT.</span>
                <span className="font-mono font-extrabold text-amber-950">
                  DATE: {asOnDate ? asOnDate.format("DD-MM-YYYY") : statusData.as_on_date || "-"}
                </span>
              </div>

              {/* Table Grid */}
              <div className="overflow-x-auto">
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#FACC15",
                        borderBottom: "2px solid #A16207",
                        textAlign: "center",
                        fontWeight: 900,
                        color: "#713F12",
                      }}
                    >
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 6px", width: "55px" }}>
                        SL. NO.
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 10px", textAlign: "left" }}>
                        ITEM NAME / FLAVOUR
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 6px", width: "80px" }}>
                        UNIT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "100px", textAlign: "right" }}>
                        QTY.
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "120px", textAlign: "right" }}>
                        AMOUNT (₹)
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "110px", textAlign: "right" }}>
                        NET WT PER UNIT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "115px", textAlign: "right" }}>
                        TOTAL NET WT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "115px", textAlign: "right" }}>
                        GROSS WT PER UNIT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "120px", textAlign: "right" }}>
                        TOTAL GROSS WT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusData.groups.map((grp, gIdx) => (
                      <React.Fragment key={grp.group_name || gIdx}>
                        {/* Group Header Row (Light Green Background matching Image 1) */}
                        <tr style={{ backgroundColor: "#BBF7D0", fontWeight: 900, color: "#14532D" }}>
                          <td
                            colSpan={9}
                            style={{
                              border: "1px solid #86EFAC",
                              padding: "6px 12px",
                              textAlign: "center",
                              fontSize: "13px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {grp.group_name}
                          </td>
                        </tr>

                        {/* Group Items */}
                        {(grp.items || []).map((it) => (
                          <tr
                            key={`${it.sl_no}-${it.item_name}`}
                            className="hover:bg-amber-50/50 transition-colors"
                          >
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 4px",
                                textAlign: "center",
                                fontWeight: 700,
                                color: "#374151",
                              }}
                            >
                              {it.sl_no}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 10px",
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {it.item_name}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px",
                                textAlign: "center",
                                fontWeight: 700,
                                color: "#4B5563",
                              }}
                            >
                              {it.unit}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 800,
                                color: "#111827",
                              }}
                            >
                              {formatNum(it.qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 800,
                                color: "#92400E",
                              }}
                            >
                              {formatCurrency(it.amount)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                color: "#4B5563",
                                fontWeight: 600,
                              }}
                            >
                              {formatNum(it.net_wt_per_unit, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 700,
                                color: "#1F2937",
                              }}
                            >
                              {formatNum(it.total_net_wt, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                color: "#4B5563",
                                fontWeight: 600,
                              }}
                            >
                              {formatNum(it.gross_wt_per_unit, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 700,
                                color: "#1F2937",
                              }}
                            >
                              {formatNum(it.total_gross_wt, 3)}
                            </td>
                          </tr>
                        ))}

                        {/* Group Subtotal Row (Matching Image 1: Light Green with Red/Bold values) */}
                        {grp.subtotal && (
                          <tr
                            style={{
                              backgroundColor: "#F0FDF4",
                              fontWeight: 900,
                              color: "#B91C1C",
                              borderTop: "1.5px solid #86EFAC",
                              borderBottom: "1.5px solid #86EFAC",
                            }}
                          >
                            <td
                              colSpan={3}
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 10px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              GROUP SUBTOTAL:
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              {formatNum(grp.subtotal.qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              {formatCurrency(grp.subtotal.amount)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              -
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              {formatNum(grp.subtotal.total_net_wt, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              -
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              {formatNum(grp.subtotal.total_gross_wt, 3)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: SUMMARY STOCK STATEMENT TABLE VIEW (MATCHING IMAGE 2)     */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "summary" && (
        <Card
          size="small"
          className="border-2 border-amber-400 shadow-md bg-white print-container overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          {loadingSummary ? (
            <div className="py-20 text-center">
              <Spin size="large" tip="Generating summary stock statement..." />
            </div>
          ) : !summaryData || !Array.isArray(summaryData.groups) || summaryData.groups.length === 0 ? (
            <div className="py-16 text-center">
              <Empty
                description={
                  <div className="text-gray-600 font-medium">
                    No summary stock movements found for{" "}
                    <strong className="text-amber-800">{selectedSupplier || "selected company"}</strong>{" "}
                    between {fromDate ? fromDate.format("DD-MM-YYYY") : "-"} and{" "}
                    {toDate ? toDate.format("DD-MM-YYYY") : "-"}.
                  </div>
                }
              />
            </div>
          ) : (
            <div>
              {/* Top Banner (Yellow Header) */}
              <div
                style={{
                  backgroundColor: "#FEF08A",
                  textAlign: "center",
                  padding: "10px",
                  borderBottom: "2px solid #CA8A04",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    fontWeight: 900,
                    fontSize: "17px",
                    color: "#78350F",
                    letterSpacing: "0.5px",
                  }}
                >
                  AUM AGRO ASSOCIATES PRIVATE LIMITED
                </h3>
              </div>

              {/* Sub-Header 1: Company Name */}
              <div
                style={{
                  backgroundColor: "#FED7AA",
                  padding: "8px 14px",
                  borderBottom: "1px solid #D97706",
                  fontWeight: 800,
                  fontSize: "13px",
                  color: "#7C2D12",
                }}
              >
                COMPANY NAME :{" "}
                <span style={{ color: "#431407", fontWeight: 900 }}>
                  {summaryData.company_name || selectedSupplier}
                </span>
                {summaryData.depo_name && (
                  <span className="ml-4 text-amber-900 font-bold">
                    | DEPO / DIRECT: {summaryData.depo_name}
                  </span>
                )}
              </div>

              {/* Sub-Header 2: Period */}
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  padding: "8px 14px",
                  borderBottom: "2px solid #CA8A04",
                  fontWeight: 800,
                  fontSize: "13px",
                  color: "#92400E",
                  textTransform: "uppercase",
                }}
              >
                SUMMERY STOCK STATEMENT FOR THE PERIOD FROM :{" "}
                <span className="font-mono font-extrabold text-amber-950">
                  {summaryData.period ||
                    `DT ${fromDate ? fromDate.format("DD/MM/YYYY") : "-"} TO DT ${
                      toDate ? toDate.format("DD/MM/YYYY") : "-"
                    }`}
                </span>
              </div>

              {/* Table Grid (10 Columns matching Image 2) */}
              <div className="overflow-x-auto">
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#FACC15",
                        borderBottom: "2px solid #A16207",
                        textAlign: "center",
                        fontWeight: 900,
                        color: "#713F12",
                      }}
                    >
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 6px", width: "55px" }}>
                        SL. NO.
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 10px", textAlign: "left" }}>
                        ITEM NAME / FLAVOUR
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 6px", width: "75px" }}>
                        UNIT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "95px", textAlign: "right" }}>
                        OB QTY
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "100px", textAlign: "right" }}>
                        RECEIPT QTY
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "95px", textAlign: "right" }}>
                        ISSUED QTY
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "105px", textAlign: "right" }}>
                        BALANCE QTY.
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "100px", textAlign: "right" }}>
                        NET WT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "100px", textAlign: "right" }}>
                        GROSS WT
                      </th>
                      <th style={{ border: "1px solid #CA8A04", padding: "7px 8px", width: "125px", textAlign: "right" }}>
                        STOCK VALUE (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.groups.map((grp, gIdx) => (
                      <React.Fragment key={grp.group_name || gIdx}>
                        {/* Group Header Row */}
                        <tr style={{ backgroundColor: "#BBF7D0", fontWeight: 900, color: "#14532D" }}>
                          <td
                            colSpan={10}
                            style={{
                              border: "1px solid #86EFAC",
                              padding: "6px 12px",
                              textAlign: "center",
                              fontSize: "13px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {grp.group_name}
                          </td>
                        </tr>

                        {/* Items Rows */}
                        {(grp.items || []).map((it) => (
                          <tr
                            key={`${it.sl_no}-${it.item_name}`}
                            className="hover:bg-amber-50/50 transition-colors"
                          >
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 4px",
                                textAlign: "center",
                                fontWeight: 700,
                                color: "#374151",
                              }}
                            >
                              {it.sl_no}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 10px",
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {it.item_name}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px",
                                textAlign: "center",
                                fontWeight: 700,
                                color: "#4B5563",
                              }}
                            >
                              {it.unit}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                color: "#4B5563",
                              }}
                            >
                              {formatNum(it.ob_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 700,
                                color: "#065F46",
                              }}
                            >
                              {formatNum(it.receipt_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 700,
                                color: "#991B1B",
                              }}
                            >
                              {formatNum(it.issued_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                                color: "#111827",
                              }}
                            >
                              {formatNum(it.balance_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 600,
                                color: "#1F2937",
                              }}
                            >
                              {formatNum(it.net_wt, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 600,
                                color: "#1F2937",
                              }}
                            >
                              {formatNum(it.gross_wt, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #E5E7EB",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                                color: "#92400E",
                              }}
                            >
                              {formatCurrency(it.stock_value)}
                            </td>
                          </tr>
                        ))}

                        {/* Group Subtotal Row */}
                        {grp.subtotal && (
                          <tr
                            style={{
                              backgroundColor: "#F0FDF4",
                              fontWeight: 900,
                              color: "#B91C1C",
                              borderTop: "1.5px solid #86EFAC",
                              borderBottom: "1.5px solid #86EFAC",
                            }}
                          >
                            <td
                              colSpan={3}
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 10px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              Sub Total:
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              {formatNum(grp.subtotal.ob_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              {formatNum(grp.subtotal.receipt_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              {formatNum(grp.subtotal.issued_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              {formatNum(grp.subtotal.balance_qty, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              {formatNum(grp.subtotal.net_wt, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                              }}
                            >
                              {formatNum(grp.subtotal.gross_wt, 3)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #86EFAC",
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: 900,
                              }}
                            >
                              {formatCurrency(grp.subtotal.stock_value)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    {/* GRAND TOTAL ROW (Matching Image 2: Pink/Red Highlight) */}
                    {summaryData.grand_total && (
                      <tr
                        style={{
                          backgroundColor: "#FEE2E2",
                          fontWeight: 900,
                          color: "#991B1B",
                          fontSize: "13.5px",
                          borderTop: "2px solid #DC2626",
                          borderBottom: "2px solid #DC2626",
                        }}
                      >
                        <td
                          colSpan={3}
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px 10px",
                            textAlign: "center",
                            fontWeight: 900,
                            letterSpacing: "1px",
                          }}
                        >
                          TOTAL
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatNum(summaryData.grand_total.ob_qty, 3)}
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatNum(summaryData.grand_total.receipt_qty, 3)}
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatNum(summaryData.grand_total.issued_qty, 3)}
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatNum(summaryData.grand_total.balance_qty, 3)}
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatNum(summaryData.grand_total.net_wt, 3)}
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatNum(summaryData.grand_total.gross_wt, 3)}
                        </td>
                        <td
                          style={{
                            border: "1.5px solid #F87171",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: 900,
                          }}
                        >
                          {formatCurrency(summaryData.grand_total.stock_value)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

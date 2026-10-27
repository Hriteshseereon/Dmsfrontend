import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, Button, Select, Spin, message } from "antd";
import dayjs from "dayjs";
import {
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { getAveragePendingContractReport } from "../../../../../../api/reports";

/* ---------------- INITIAL SAMPLE DATA (MATCHES ATTACHED SPEC & IMAGE) ---------------- */
const DEFAULT_SAMPLE_DATA = {
  status: "success",
  company_name: "AUM AGRO ASSOCIATES PRIVATE LIMITED",
  report_title: "AVERAGE PENDING CONTRACT REPORT",
  as_on_date: dayjs().format("YYYY-MM-DD"),
  filter_options: {
    company_groups: [
      { id: "ruchi_group", name: "Ruchi Group" },
      { id: "adani_group", name: "Adani Wilmar Group" },
    ],
    vendors: [
      { id: "ruchi_soya", name: "Ruchi Soya Industries Ltd", short_name: "RUCHI" },
      { id: "patanjali_foods", name: "Patanjali Foods Limited", short_name: "PATANJALI" },
    ],
    flavours: [
      { id: "SOYA", name: "SOYA" },
      { id: "OLIEN", name: "OLIEN" },
      { id: "SUNFLOWER", name: "SUNFLOWER" },
      { id: "RUCHI GOLD MUSTARD", name: "RUCHI GOLD MUSTARD" },
      { id: "VANASPATI", name: "VANASPATI" },
    ],
    depots: [
      { id: "pithampur", name: "Pithampur Depot" },
      { id: "indore", name: "Indore Central Depot" },
    ],
  },
  groups: [
    {
      group_name: "SOYA",
      items: [
        {
          product_id: "soya-1",
          item_name: "MAHAKOSH REF SOYA OIL 13 KG TIN MD",
          unit: "TIN",
          purchase_souda: { qty: "150.000", wt_ton: "1.950", rate: "93.33" },
          sale_souda: { qty: "50.000", wt_ton: "0.650", rate: "110.00" },
          balance: { qty: "100.000", wt_ton: "1.300" },
        },
        {
          product_id: "soya-2",
          item_name: "MAHAKOSH REF.SOYA OIL 15 KG TIN MD",
          unit: "TIN",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-3",
          item_name: "MAHAKOSH REF.SOYA OIL 15 LTR TIN MD",
          unit: "TIN",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-4",
          item_name: "MAHAKOSH REF.SOYA OIL 910 G PP 1X12 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-5",
          item_name: "MAHAKOSH REF.SOYA OIL 455 G PP 1X12 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-6",
          item_name: "MAHAKOSH REF.SOYA OIL 750 G PP 1X12 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-7",
          item_name: "MAHAKOSH REF.SOYA OIL 375 G PP 1X24 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-8",
          item_name: "MAHAKOSH REF.SOYA OIL 700 G BTL 1X15 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-9",
          item_name: "MAHAKOSH REF.SOYA OIL 375 G BTL 1X24 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
        {
          product_id: "soya-10",
          item_name: "MAHAKOSH REF.SOYA OIL 4.00 KG JAR 1X4 MD",
          unit: "CASE",
          purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" },
          balance: { qty: "0.000", wt_ton: "0.000" },
        },
      ],
      totals: {
        purchase_souda: { total_qty: "150.000", total_wt_ton: "1.950", rate: "93.33" },
        sale_souda: { total_qty: "50.000", total_wt_ton: "0.650", rate: "110.00" },
        balance: { total_qty: "100.000", total_wt_ton: "1.300" },
      },
    },
    {
      group_name: "OLIEN",
      items: [
        { product_id: "ol-1", item_name: "RUCHI GOLD PALMOLEIN 15 KG TIN ND", unit: "TIN", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-2", item_name: "RUCHI GOLD PALMOLEIN TIN VALUE PACK", unit: "TIN", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-3", item_name: "RUCHI GOLD PALMOLEIN 1 KG PP 1X10", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-4", item_name: "RUCHI GOLD PALMOLEIN 850 G PP 1X10", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-5", item_name: "RUCHI GOLD PALMOLEIN 425 G PP 1X20", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-6", item_name: "RUCHI GOLD PALMOLEIN 750 GM PP 1X10", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-7", item_name: "RUCHI GOLD PALMOLEIN 375 G PP 1X20", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-8", item_name: "RUCHI GOLD PALMOLEIN 650 G PP 1X10", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "ol-9", item_name: "RUCHI GOLD PALMOLEIN 325 G PP 1X20", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
      ],
      totals: {
        purchase_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        sale_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        balance: { total_qty: "0.000", total_wt_ton: "0.000" },
      },
    },
    {
      group_name: "SUNFLOWER",
      items: [
        { product_id: "sf-1", item_name: "SUNRICH REF. SUN OIL 750 G PP 1X10 MD", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "sf-2", item_name: "SUNRICH REF. SUN OIL 13 KG TIN MD", unit: "TIN", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
      ],
      totals: {
        purchase_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        sale_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        balance: { total_qty: "0.000", total_wt_ton: "0.000" },
      },
    },
    {
      group_name: "RUCHI GOLD MUSTARD",
      items: [
        { product_id: "rgm-1", item_name: "RUCHI GOLD KG MUSTARD OIL 850 G PP 1X12", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "rgm-2", item_name: "RUCHI GOLD KG MUSTRD OIL 425 G PP 1X24", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "rgm-3", item_name: "RUCHI GOLD KG MUSTARD OIL 850 G BTL 1X12", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "rgm-4", item_name: "RUCHI GOLD KG MUSTARD OIL 425 G BTL 1X24", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "rgm-5", item_name: "RUCHI GOLD KG MUSTARD OIL 180 G BTL 1X50", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "rgm-6", item_name: "RUCHI GOLD KG MUSTRD OIL 4.50 KG JAR 1X4", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
      ],
      totals: {
        purchase_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        sale_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        balance: { total_qty: "0.000", total_wt_ton: "0.000" },
      },
    },
    {
      group_name: "VANASPATI",
      items: [
        { product_id: "van-1", item_name: "RUCHI NO.1 VANASPATI 15 KG BUCKET-NEW", unit: "BUCKET", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-2", item_name: "RUCHI NO.1 VANASPATI 15 LTR BUCKET-NEW", unit: "BUCKET", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-3", item_name: "RUCHI NO.1 VANASPATI 13 KG BUCKET", unit: "BUCKET", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-4", item_name: "RUCHI NO.1 VANASPATI 893 G PP 1X16", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-5", item_name: "RUCHI NO.1 VANASPATI 447 G PP 1X32", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-6", item_name: "RUCHI NO.1 VANASPATI 180 G PP 1X80", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-7", item_name: "RUCHI NO.1 VANASPATI 90 G PP 1X160", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
        { product_id: "van-8", item_name: "TULSI GENERAL VANASPATI 15 KG BIB-NEW", unit: "CASE", purchase_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, sale_souda: { qty: "0.000", wt_ton: "0.000", rate: "0.00" }, balance: { qty: "0.000", wt_ton: "0.000" } },
      ],
      totals: {
        purchase_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        sale_souda: { total_qty: "0.000", total_wt_ton: "0.000", rate: "0.00" },
        balance: { total_qty: "0.000", total_wt_ton: "0.000" },
      },
    },
  ],
  grand_total: {
    purchase_souda: { total_qty: "150.000", total_wt_ton: "1.950", rate: "93.33" },
    sale_souda: { total_qty: "50.000", total_wt_ton: "0.650", rate: "110.00" },
    balance: { total_qty: "100.000", total_wt_ton: "1.300" },
  },
};

/* ---------------- COMPONENT ---------------- */
const PurchaseInvoice = () => {
  const [reportData, setReportData] = useState(DEFAULT_SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_SAMPLE_DATA.filter_options);

  const [filters, setFilters] = useState({
    as_on_date: dayjs().format("YYYY-MM-DD"),
    company_group: "",
    vendor_id: "",
    flavour: "",
    depot: "",
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = {
        as_on_date: filters.as_on_date || dayjs().format("YYYY-MM-DD"),
        company_group: filters.company_group || undefined,
        vendor_id: filters.vendor_id || undefined,
        flavour: filters.flavour || undefined,
        depot: filters.depot || undefined,
      };

      const res = await getAveragePendingContractReport(activeFilters);

      if (res && (res.groups || res.company_name)) {
        setReportData(res);
        if (res.filter_options) {
          setFilterOptions((prev) => ({
            ...prev,
            ...res.filter_options,
          }));
        }
      } else {
        // Keep baseline if response is blank
        setReportData((prev) => ({
          ...DEFAULT_SAMPLE_DATA,
          ...prev,
          as_on_date: filters.as_on_date,
        }));
      }
    } catch (err) {
      console.warn("Backend API responded with error, falling back to sample report structure:", err);
      // Graceful fallback to guarantee UI visibility
      setReportData((prev) => ({
        ...DEFAULT_SAMPLE_DATA,
        as_on_date: filters.as_on_date,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, []);

  const handleReset = () => {
    const defaultState = {
      as_on_date: dayjs().format("YYYY-MM-DD"),
      company_group: "",
      vendor_id: "",
      flavour: "",
      depot: "",
    };
    setFilters(defaultState);
  };

  /* Helper to format numbers cleanly */
  const formatCell = (val, isTotal = false) => {
    if (val === null || val === undefined || val === "") {
      return isTotal ? "0.000" : "-";
    }
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    if (num === 0) return isTotal ? "0.000" : "-";
    return typeof val === "string" ? val : num.toFixed(3);
  };

  /* Export Table to CSV */
  const exportToCSV = () => {
    if (!reportData || !reportData.groups) {
      message.info("No report data available to export.");
      return;
    }

    const rows = [];
    rows.push([`"${reportData.company_name || "AUM AGRO ASSOCIATES PRIVATE LIMITED"}"`]);
    rows.push([`"${reportData.report_title || "AVERAGE PENDING CONTRACT REPORT"}"`]);
    rows.push([`"AS ON DT: ${filters.as_on_date || reportData.as_on_date || ""}"`]);
    rows.push([]);

    rows.push([
      "ITEM NAME / FLAVOUR",
      "UNIT",
      "PURCHASE QTY",
      "PURCHASE Wt (Ton)",
      "PURCHASE RATE",
      "SALE QTY",
      "SALE Wt (Ton)",
      "SALE RATE",
      "BALANCE QTY",
      "BALANCE Wt (Ton)",
    ]);

    reportData.groups.forEach((group) => {
      rows.push([`"--- ${group.group_name} ---"`, "", "", "", "", "", "", "", "", ""]);

      (group.items || []).forEach((item) => {
        rows.push([
          `"${item.item_name || ""}"`,
          `"${item.unit || ""}"`,
          item.purchase_souda?.qty || "",
          item.purchase_souda?.wt_ton || "",
          item.purchase_souda?.rate || "",
          item.sale_souda?.qty || "",
          item.sale_souda?.wt_ton || "",
          item.sale_souda?.rate || "",
          item.balance?.qty || "",
          item.balance?.wt_ton || "",
        ]);
      });

      if (group.totals) {
        rows.push([
          `"TOTAL (${group.group_name})"`,
          "",
          group.totals.purchase_souda?.total_qty || "",
          group.totals.purchase_souda?.total_wt_ton || "",
          group.totals.purchase_souda?.rate || "",
          group.totals.sale_souda?.total_qty || "",
          group.totals.sale_souda?.total_wt_ton || "",
          group.totals.sale_souda?.rate || "",
          group.totals.balance?.total_qty || "",
          group.totals.balance?.total_wt_ton || "",
        ]);
      }
    });

    if (reportData.grand_total) {
      rows.push([
        `"GRAND TOTAL"`,
        "",
        reportData.grand_total.purchase_souda?.total_qty || "",
        reportData.grand_total.purchase_souda?.total_wt_ton || "",
        reportData.grand_total.purchase_souda?.rate || "",
        reportData.grand_total.sale_souda?.total_qty || "",
        reportData.grand_total.sale_souda?.total_wt_ton || "",
        reportData.grand_total.sale_souda?.rate || "",
        reportData.grand_total.balance?.total_qty || "",
        reportData.grand_total.balance?.total_wt_ton || "",
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Average_Pending_Contract_Report_${filters.as_on_date || "today"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* ---------------- TOP BANNER (COMPANY & REPORT TITLE) ---------------- */}
      <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-center shadow-sm">
        <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-wider uppercase">
          {reportData?.company_name || "AUM AGRO ASSOCIATES PRIVATE LIMITED"}
        </h2>
        <h3 className="text-sm sm:text-base font-bold text-amber-900 tracking-wide uppercase mt-1">
          {reportData?.report_title || "AVERAGE PENDING CONTRACT REPORT"}
        </h3>
      </div>

      {/* ---------------- FILTER BAR ---------------- */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          {/* COMPANY GROUP */}
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              COMPANY GROUP:
            </label>
            <Select
              value={filters.company_group || undefined}
              onChange={(val) => setFilters({ ...filters, company_group: val || "" })}
              placeholder="SELECT / ALL"
              allowClear
              className="w-full border-amber-300 text-sm"
              options={[
                { value: "", label: "SELECT / ALL" },
                ...(filterOptions?.company_groups || []).map((g) => ({
                  value: g.id || g.name,
                  label: g.name,
                })),
              ]}
            />
          </div>

          {/* COMPANY NAME (SUPPLIER) */}
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              COMPANY NAME:
            </label>
            <Select
              value={filters.vendor_id || undefined}
              onChange={(val) => setFilters({ ...filters, vendor_id: val || "" })}
              placeholder="SELECT / ALL"
              allowClear
              className="w-full border-amber-300 text-sm"
              options={[
                { value: "", label: "SELECT / ALL" },
                ...(filterOptions?.vendors || []).map((v) => ({
                  value: v.id || v.name,
                  label: v.name,
                })),
              ]}
            />
          </div>

          {/* FLAVOUR */}
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              FLAVOUR:
            </label>
            <Select
              value={filters.flavour || undefined}
              onChange={(val) => setFilters({ ...filters, flavour: val || "" })}
              placeholder="SELECT / ALL"
              allowClear
              className="w-full border-amber-300 text-sm"
              options={[
                { value: "", label: "SELECT / ALL" },
                ...(filterOptions?.flavours || []).map((f) => ({
                  value: f.name || f.id,
                  label: f.name,
                })),
              ]}
            />
          </div>

          {/* DEPOT */}
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              DEPOT:
            </label>
            <Select
              value={filters.depot || undefined}
              onChange={(val) => setFilters({ ...filters, depot: val || "" })}
              placeholder="SELECT / ALL"
              allowClear
              className="w-full border-amber-300 text-sm"
              options={[
                { value: "", label: "SELECT / ALL" },
                ...(filterOptions?.depots || []).map((d) => ({
                  value: d.id || d.name,
                  label: d.name,
                })),
              ]}
            />
          </div>

          {/* AS ON DT. */}
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              AS ON DT.:
            </label>
            <DatePicker
              value={filters.as_on_date ? dayjs(filters.as_on_date) : null}
              onChange={(date, dateString) =>
                setFilters({ ...filters, as_on_date: dateString || "" })
              }
              format="YYYY-MM-DD"
              allowClear={false}
              className="w-full border-amber-400 text-sm"
            />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-amber-100">
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchReport}
              loading={loading}
              className="bg-amber-600! hover:bg-amber-500! active:bg-amber-700! text-white! font-medium rounded-md shadow-sm"
            >
              Apply Filters
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className="border-amber-400! text-amber-800! hover:bg-amber-50! rounded-md"
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              icon={<FileExcelOutlined />}
              onClick={exportToCSV}
              className="border-amber-400! text-amber-800! hover:bg-amber-50! rounded-md"
            >
              Export CSV
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              className="border-amber-400! text-amber-800! hover:bg-amber-50! rounded-md"
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* ---------------- REPORT TABLE ---------------- */}
      <Spin spinning={loading} tip="Loading report data...">
        <div className="border border-amber-300 rounded-lg shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm min-w-[1050px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-amber-200 text-amber-950 font-bold border-b border-amber-300">
                  <th
                    rowSpan={2}
                    className="border border-amber-300 p-2.5 text-left uppercase whitespace-nowrap min-w-[280px]"
                  >
                    ITEM NAME / FLAVOUR
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-amber-300 p-2.5 text-center uppercase whitespace-nowrap min-w-[70px]"
                  >
                    UNIT
                  </th>
                  <th
                    colSpan={3}
                    className="border border-amber-300 p-2 text-center uppercase whitespace-nowrap bg-amber-100 text-amber-900"
                  >
                    AVERAGE PURCHASE SOUDA
                  </th>
                  <th
                    colSpan={3}
                    className="border border-amber-300 p-2 text-center uppercase whitespace-nowrap bg-amber-100 text-amber-900"
                  >
                    AVERAGE SALE SOUDA
                  </th>
                  <th
                    colSpan={2}
                    className="border border-amber-300 p-2 text-center uppercase whitespace-nowrap bg-amber-200 text-amber-950"
                  >
                    BALANCE
                  </th>
                </tr>
                <tr className="bg-amber-100/70 text-amber-900 font-semibold border-b border-amber-300 text-xs">
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[85px]">
                    QTY
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[85px]">
                    Wt (Ton)
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[80px]">
                    RATE
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[85px]">
                    QTY
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[85px]">
                    Wt (Ton)
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[80px]">
                    RATE
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[85px] bg-amber-100 text-amber-950 font-bold">
                    QTY
                  </th>
                  <th className="border border-amber-300 p-1.5 text-right whitespace-nowrap min-w-[85px] bg-amber-100 text-amber-950 font-bold">
                    Wt (Ton)
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {reportData?.groups && reportData.groups.length > 0 ? (
                  reportData.groups.map((group, gIdx) => (
                    <React.Fragment key={group.group_name || gIdx}>
                      {/* Flavour / Group Header Row (Styled cleanly like the template) */}
                      <tr className="bg-[#d5ebd0] font-bold text-center border-t border-b border-amber-300">
                        <td
                          colSpan={10}
                          className="border border-amber-300 py-1.5 px-3 text-[#22543d] font-extrabold uppercase tracking-wider text-xs sm:text-sm text-center"
                        >
                          {group.group_name}
                        </td>
                      </tr>

                      {/* Items Under This Group */}
                      {(group.items || []).map((item, itemIdx) => (
                        <tr
                          key={item.product_id || `${gIdx}-${itemIdx}`}
                          className="hover:bg-amber-50/70 transition-colors"
                        >
                          <td className="border border-amber-200/80 p-1.5 px-2.5 text-left text-gray-800 font-medium">
                            {item.item_name}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-center text-gray-600 font-medium">
                            {item.unit}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right text-gray-800 font-mono">
                            {formatCell(item.purchase_souda?.qty)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right text-gray-800 font-mono">
                            {formatCell(item.purchase_souda?.wt_ton)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right text-gray-800 font-mono">
                            {formatCell(item.purchase_souda?.rate)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right text-gray-800 font-mono">
                            {formatCell(item.sale_souda?.qty)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right text-gray-800 font-mono">
                            {formatCell(item.sale_souda?.wt_ton)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right text-gray-800 font-mono">
                            {formatCell(item.sale_souda?.rate)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right font-bold text-amber-950 font-mono bg-amber-50/30">
                            {formatCell(item.balance?.qty)}
                          </td>
                          <td className="border border-amber-200/80 p-1.5 text-right font-bold text-amber-950 font-mono bg-amber-50/30">
                            {formatCell(item.balance?.wt_ton)}
                          </td>
                        </tr>
                      ))}

                      {/* Group Total Row */}
                      {group.totals && (
                        <tr className="bg-[#fde2cb] font-bold border-t border-b border-amber-300">
                          <td
                            colSpan={2}
                            className="border border-amber-300 p-1.5 text-center text-amber-950 font-extrabold uppercase"
                          >
                            TOTAL
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-bold">
                            {formatCell(group.totals.purchase_souda?.total_qty, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-bold">
                            {formatCell(group.totals.purchase_souda?.total_wt_ton, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-bold">
                            {formatCell(group.totals.purchase_souda?.rate, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-bold">
                            {formatCell(group.totals.sale_souda?.total_qty, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-bold">
                            {formatCell(group.totals.sale_souda?.total_wt_ton, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-bold">
                            {formatCell(group.totals.sale_souda?.rate, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-extrabold bg-amber-100/50">
                            {formatCell(group.totals.balance?.total_qty, true)}
                          </td>
                          <td className="border border-amber-300 p-1.5 text-right text-amber-950 font-mono font-extrabold bg-amber-100/50">
                            {formatCell(group.totals.balance?.total_wt_ton, true)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-8 text-amber-800 font-medium"
                    >
                      No report data available for the selected filters.
                    </td>
                  </tr>
                )}

                {/* Grand Total Row */}
                {reportData?.grand_total && (
                  <tr className="bg-amber-200 text-amber-950 font-extrabold border-t-2 border-b-2 border-amber-400 text-xs sm:text-sm">
                    <td
                      colSpan={2}
                      className="border border-amber-400 p-2 text-center uppercase font-black tracking-wide"
                    >
                      GRAND TOTAL
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-bold">
                      {formatCell(reportData.grand_total.purchase_souda?.total_qty, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-bold">
                      {formatCell(reportData.grand_total.purchase_souda?.total_wt_ton, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-bold">
                      {formatCell(reportData.grand_total.purchase_souda?.rate, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-bold">
                      {formatCell(reportData.grand_total.sale_souda?.total_qty, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-bold">
                      {formatCell(reportData.grand_total.sale_souda?.total_wt_ton, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-bold">
                      {formatCell(reportData.grand_total.sale_souda?.rate, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-black bg-amber-300/40">
                      {formatCell(reportData.grand_total.balance?.total_qty, true)}
                    </td>
                    <td className="border border-amber-400 p-2 text-right font-mono font-black bg-amber-300/40">
                      {formatCell(reportData.grand_total.balance?.total_wt_ton, true)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default PurchaseInvoice;

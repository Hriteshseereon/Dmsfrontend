import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Divider,
  Space,
  Tooltip,
  message,
  Badge,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  CarOutlined,
  ShopOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getStockInTransit,
  getVehicleInvoices,
  getDepoDetails,
  createStockInTransit,
  updateStockInTransit,
} from "../../../../../api/purchase";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import AppDatePicker from "../../../../../components/AppDatePicker";

dayjs.extend(customParseFormat);

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

const CLAIM_REASONS = ["None", "Shortage", "Leakage", "Damage", "Others"];

const RECEIVED_AT_OPTIONS = [
  { label: "Direct (Plant / Place)", value: "direct" },
  { label: "Depot", value: "depo" },
  // { label: "Both (Split Direct & Depot)", value: "both" },
];

const FALLBACK_DEPOS = [
  { id: "depo-1", name: "Bhubaneswar Depo", code: "BBS-01" },
  { id: "depo-2", name: "Cuttack Depo", code: "CTC-01" },
  { id: "depo-3", name: "Sambalpur Depo", code: "SBP-01" },
  { id: "depo-4", name: "Rourkela Depo", code: "RKL-01" },
  { id: "depo-5", name: "Balasore Depo", code: "BLS-01" },
  { id: "depo-6", name: "Berhampur Depo", code: "BAM-01" },
  { id: "depo-7", name: "Jajpur Depo", code: "JJP-01" },
  { id: "depo-8", name: "Angul Depo", code: "ANG-01" },
];

const parseApiDate = (value) => {
  if (!value) return null;

  let d = dayjs(value, "DD-MM-YYYY", true);
  if (d.isValid()) return d;

  d = dayjs(value, "DD-MM-YYYY HH:mm:ss", true);
  if (d.isValid()) return d;

  d = dayjs(value, "YYYY-MM-DD", true);
  if (d.isValid()) return d;

  d = dayjs(value);
  return d.isValid() ? d : null;
};

const fmtDate = (d) => {
  const parsed = parseApiDate(d);
  return parsed ? parsed.format("DD-MM-YYYY") : "-";
};

export default function StockInTransit() {
  const [rawData, setRawData] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Step 2: Vehicle Invoices Drill-down Modal State
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicleInvoices, setLoadingVehicleInvoices] = useState(false);

  // Step 3: Stock Receiving Modal State (Per Invoice)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toReceiveAtValue, setToReceiveAtValue] = useState("direct");
  const [form] = Form.useForm();

  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);

  const selectedFY = useSelectedFinancialYear();

  useEffect(() => {
    fetchTransitData();
  }, [selectedFY]);

  // 1. Fetch Aggregated Supplier & Vehicle Data
  const fetchTransitData = async () => {
    try {
      setLoading(true);
      const res = await getStockInTransit();
      const list = Array.isArray(res) ? res : res?.data || [];
      setRawData(list);

      // Process hierarchical or flat response into unified Vehicle rows (grouped by vehicle_no + lr_no)
      const processedVehicles = [];

      list.forEach((supplier, sIdx) => {
        const supplierName =
          supplier.supplier_name || supplier.vendor_name || "";
        const vendorId = supplier.vendor_id;
        const place = supplier.place || "";

        if (Array.isArray(supplier.vehicles) && supplier.vehicles.length > 0) {
          // Standard hierarchical format from endpoint 1
          supplier.vehicles.forEach((veh, vIdx) => {
            const vehicleKey = `${supplierName}_${veh.vehicle_no || "V"}_${veh.lr_no || "LR"}_${sIdx}_${vIdx}`;

            // Calculate invoices and status if not given
            const invoices = (veh.invoices || []).map((inv, iIdx) => {
              const invStatus =
                inv.status || (inv.stock_received_on ? "Received" : "Pending");
              return {
                ...inv,
                status: invStatus,
                items: (inv.items || []).map((item, itIdx) => ({
                  ...item,
                  id:
                    item.purchase_invoice_item_id ||
                    item.item_id ||
                    item.id ||
                    `item_${iIdx}_${itIdx}`,
                  purchase_invoice_item_id:
                    item.purchase_invoice_item_id || item.item_id || item.id,
                  invoiced_qty: Number(item.invoiced_qty || item.qty || 0),
                  rate: Number(item.rate || 0),
                  direct_qty:
                    item.direct_qty !== "" && item.direct_qty !== undefined
                      ? Number(item.direct_qty)
                      : null,
                  depo_qty:
                    item.depo_qty !== "" && item.depo_qty !== undefined
                      ? Number(item.depo_qty)
                      : null,
                  claim_qty: Number(item.claim_qty || 0),
                  claim_amount: Number(item.claim_amount || 0),
                  claim_reason: item.claim_reason || "None",
                  narration: item.narration || "",
                })),
              };
            });

            // Derive outer vehicle status from its invoices
            const allReceived =
              invoices.length > 0 &&
              invoices.every((i) => i.status === "Received");
            const anyReceived = invoices.some((i) => i.status === "Received");
            const derivedStatus =
              veh.status ||
              (allReceived
                ? "Received"
                : anyReceived
                  ? "Partially Received"
                  : "Intransit");

            processedVehicles.push({
              key: vehicleKey,
              supplier_name: supplierName,
              vendor_id: vendorId,
              place: veh.place || place,
              vehicle_no: veh.vehicle_no || "-",
              lr_no: veh.lr_no || "-",
              lr_date: veh.lr_date,
              transport_name: veh.transport_name || "-",
              total_qty: Number(veh.total_qty || 0),
              total_amount: Number(veh.total_amount || 0),
              total_amount_display: veh.total_amount_display,
              invoices_count: veh.invoices_count || invoices.length,
              status: derivedStatus,
              invoices: invoices,
            });
          });
        } else if (
          supplier.vehicle_no ||
          supplier.purchase_invoice_id ||
          supplier.invoice_no
        ) {
          // Flat invoice item fallback: group by vehicle_no + lr_no
          const vehicleNo = supplier.vehicle_no || "-";
          const lrNo = supplier.lr_no || "-";
          const vehicleKey = `${supplierName}_${vehicleNo}_${lrNo}`;

          const existing = processedVehicles.find((v) => v.key === vehicleKey);

          const invoiceObj = {
            purchase_invoice_id: supplier.purchase_invoice_id,
            invoice_no:
              supplier.invoice_no || supplier.purchase_invoice_number || "-",
            invoice_date: supplier.invoice_date,
            invoice_amount: Number(
              supplier.invoice_amount || supplier.total_amount || 0,
            ),
            total_qty: Number(supplier.total_qty || supplier.invoiced_qty || 0),
            ewaybill_no: supplier.ewaybill_no || "-",
            ewaybill_date: supplier.ewaybill_date,
            transit_days: supplier.transit_days ?? "",
            stock_received_on: supplier.stock_received_on || "",
            to_be_received_at: supplier.to_be_received_at || "",
            received_place: supplier.received_place || supplier.place || "",
            depo_id: supplier.depo_id || supplier.depo,
            depo_name: supplier.depo_name || "",
            status:
              supplier.status ||
              (supplier.stock_received_on ? "Received" : "Pending"),
            items: Array.isArray(supplier.items)
              ? supplier.items
              : [
                  {
                    id:
                      supplier.purchase_invoice_item_id ||
                      supplier.item_id ||
                      "item_0",
                    purchase_invoice_item_id:
                      supplier.purchase_invoice_item_id || supplier.item_id,
                    item_name:
                      supplier.item_name || supplier.product_name || "-",
                    item_code: supplier.item_code || "",
                    unit: supplier.unit || "TIN",
                    invoiced_qty: Number(
                      supplier.invoiced_qty || supplier.qty || 0,
                    ),
                    rate: Number(supplier.rate || 0),
                    claim_reason: supplier.claim_reason || "None",
                    claim_qty: Number(supplier.claim_qty || 0),
                    claim_amount: Number(supplier.claim_amount || 0),
                    direct_qty: supplier.direct_qty,
                    depo_qty: supplier.depo_qty,
                    narration: supplier.narration || "",
                    status: supplier.status || "Pending",
                  },
                ],
          };

          if (existing) {
            existing.invoices.push(invoiceObj);
            existing.total_qty += Number(supplier.invoiced_qty || 0);
            existing.total_amount += Number(supplier.invoice_amount || 0);
            existing.invoices_count = existing.invoices.length;

            const allRec = existing.invoices.every(
              (i) => i.status === "Received",
            );
            const anyRec = existing.invoices.some(
              (i) => i.status === "Received",
            );
            existing.status = allRec
              ? "Received"
              : anyRec
                ? "Partially Received"
                : "Intransit";
          } else {
            processedVehicles.push({
              key: vehicleKey,
              supplier_name: supplierName,
              vendor_id: vendorId,
              place: place,
              vehicle_no: vehicleNo,
              lr_no: lrNo,
              lr_date: supplier.lr_date,
              transport_name: supplier.transport_name || "-",
              total_qty: Number(
                supplier.total_qty || supplier.invoiced_qty || 0,
              ),
              total_amount: Number(
                supplier.invoice_amount || supplier.total_amount || 0,
              ),
              invoices_count: 1,
              status:
                supplier.status ||
                (supplier.stock_received_on ? "Received" : "Intransit"),
              invoices: [invoiceObj],
            });
          }
        }
      });

      setVehicleList(processedVehicles);
    } catch (error) {
      console.error("Error loading stock in transit vehicles:", error);
      message.error("Failed to load Stock In Transit vehicles list");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Open Vehicle Invoices Modal on Vehicle Click
  const handleOpenVehicleModal = async (vehicleRecord) => {
    setSelectedVehicle(vehicleRecord);
    setVehicleModalOpen(true);

    // If needed, fetch fresh vehicle-invoices specifically from backend
    if (
      vehicleRecord.vehicle_no &&
      vehicleRecord.lr_no &&
      vehicleRecord.vehicle_no !== "-"
    ) {
      try {
        setLoadingVehicleInvoices(true);
        const res = await getVehicleInvoices(
          vehicleRecord.vehicle_no,
          vehicleRecord.lr_no,
        );
        if (res && res.invoices) {
          const freshInvoices = res.invoices.map((inv) => ({
            ...inv,
            status:
              inv.status || (inv.stock_received_on ? "Received" : "Pending"),
          }));
          setSelectedVehicle((prev) => ({
            ...prev,
            ...res,
            invoices: freshInvoices,
            status: res.vehicle_status || res.status || prev.status,
          }));
        }
      } catch (err) {
        console.warn(
          "Could not fetch fresh vehicle invoices, using cached:",
          err,
        );
      } finally {
        setLoadingVehicleInvoices(false);
      }
    }
  };

  // Step 3: Open Stock Receiving Modal for a Specific Invoice
  const handleOpenReceiveModal = (invoiceRecord, parentVehicle) => {
    setEditingInvoice(invoiceRecord);
    form.resetFields();

    const initialReceivedOn = invoiceRecord.stock_received_on
      ? parseApiDate(invoiceRecord.stock_received_on)
      : dayjs();

    const invDate = invoiceRecord.invoice_date
      ? parseApiDate(invoiceRecord.invoice_date)
      : null;
    const computedTransitDays =
      invoiceRecord.transit_days !== "" &&
      invoiceRecord.transit_days !== null &&
      invoiceRecord.transit_days !== undefined
        ? invoiceRecord.transit_days
        : invDate && initialReceivedOn
          ? Math.max(0, initialReceivedOn.diff(invDate, "day"))
          : 0;

    const initialReceivedAt =
      invoiceRecord.to_be_received_at?.toLowerCase() || "direct";
    setToReceiveAtValue(initialReceivedAt);

    const defaultPlace =
      invoiceRecord.received_place ||
      parentVehicle?.place ||
      invoiceRecord.place ||
      "Bhadrak";
    const defaultDepo = invoiceRecord.depo_name || invoiceRecord.depo || "";

    const formattedItems = (invoiceRecord.items || []).map((item) => {
      const invQty = Number(item.invoiced_qty || item.qty || 0);
      const rate = Number(item.rate || 0);
      const claimQty = Number(item.claim_qty || 0);
      const claimAmount = Number(
        item.claim_amount !== undefined &&
          item.claim_amount !== "" &&
          Number(item.claim_amount) > 0
          ? item.claim_amount
          : claimQty * rate,
      );

      let directQty =
        item.direct_qty !== null &&
        item.direct_qty !== undefined &&
        item.direct_qty !== ""
          ? Number(item.direct_qty)
          : initialReceivedAt === "direct"
            ? Math.max(0, invQty - claimQty)
            : initialReceivedAt === "both"
              ? Number((invQty / 2).toFixed(2))
              : 0;

      let depoQty =
        item.depo_qty !== null &&
        item.depo_qty !== undefined &&
        item.depo_qty !== ""
          ? Number(item.depo_qty)
          : initialReceivedAt === "depo"
            ? Math.max(0, invQty - claimQty)
            : initialReceivedAt === "both"
              ? Math.max(0, Number((invQty - directQty - claimQty).toFixed(2)))
              : 0;

      return {
        purchase_invoice_item_id:
          item.purchase_invoice_item_id || item.item_id || item.id,
        item_name: item.item_name || "-",
        item_code: item.item_code || "",
        unit: item.unit || "TIN",
        invoiced_qty: invQty,
        rate: rate,
        direct_qty: directQty,
        depo_qty: depoQty,
        claim_reason: item.claim_reason || "None",
        claim_qty: claimQty,
        claim_amount: Number(claimAmount.toFixed(2)),
        narration: item.narration || "",
      };
    });

    form.setFieldsValue({
      supplier_name: parentVehicle?.supplier_name || "",
      vehicle_no: parentVehicle?.vehicle_no || "",
      lr_no: parentVehicle?.lr_no || "",
      lr_date: parseApiDate(parentVehicle?.lr_date),
      transport_name: parentVehicle?.transport_name || "",
      invoice_no: invoiceRecord.invoice_no,
      invoice_date: parseApiDate(invoiceRecord.invoice_date),
      invoice_amount: invoiceRecord.invoice_amount,
      stock_received_on: initialReceivedOn,
      transit_days: computedTransitDays,
      to_be_received_at: initialReceivedAt,
      received_place: defaultPlace,
      depo: defaultDepo,
      status: "Received",
      items: formattedItems,
    });

    setReceiveModalOpen(true);
  };

  // Transit Days Live Calculation
  const handleReceivedDateChange = (date) => {
    if (editingInvoice && date) {
      const invDate = parseApiDate(editingInvoice.invoice_date);
      if (invDate && invDate.isValid()) {
        const days = Math.max(0, date.diff(invDate, "day"));
        form.setFieldsValue({ transit_days: days });
      }
    }
  };

  // Handle To Be Received At dropdown change
  const handleReceiveLocationTypeChange = (value) => {
    setToReceiveAtValue(value);
    const items = form.getFieldValue("items") || [];

    const updated = items.map((i) => {
      const invQty = Number(i.invoiced_qty || 0);
      const claimQty = Number(i.claim_qty || 0);
      const netQty = Math.max(0, invQty - claimQty);

      if (value === "direct") {
        return { ...i, direct_qty: netQty, depo_qty: 0 };
      } else if (value === "depo") {
        return { ...i, direct_qty: 0, depo_qty: netQty };
      } else {
        const half = Number((netQty / 2).toFixed(2));
        const rem = Number((netQty - half).toFixed(2));
        return { ...i, direct_qty: half, depo_qty: rem };
      }
    });

    form.setFieldsValue({
      to_be_received_at: value,
      items: updated,
      depo: value !== "direct" ? form.getFieldValue("depo") || "" : null,
      received_place:
        value !== "depo"
          ? form.getFieldValue("received_place") ||
            selectedVehicle?.place ||
            "Bhadrak"
          : null,
    });
  };

  // Recalculate Claim Amount or Split Quantities
  const handleItemFieldChange = (index, field, value) => {
    const items = form.getFieldValue("items") || [];
    if (!items[index]) return;

    const currentItem = { ...items[index], [field]: value };
    const invQty = Number(currentItem.invoiced_qty || 0);

    if (field === "claim_qty" || field === "rate") {
      const qty = Number(currentItem.claim_qty || 0);
      const rate = Number(currentItem.rate || 0);
      currentItem.claim_amount = Number((qty * rate).toFixed(2));

      const netAvailable = Math.max(0, invQty - qty);
      if (toReceiveAtValue === "direct") {
        currentItem.direct_qty = netAvailable;
        currentItem.depo_qty = 0;
      } else if (toReceiveAtValue === "depo") {
        currentItem.direct_qty = 0;
        currentItem.depo_qty = netAvailable;
      } else if (toReceiveAtValue === "both") {
        const curDirect = Number(currentItem.direct_qty || 0);
        currentItem.depo_qty = Math.max(
          0,
          Number((netAvailable - curDirect).toFixed(2)),
        );
      }
    }

    if (field === "direct_qty" && toReceiveAtValue === "both") {
      const dir = Math.min(invQty, Math.max(0, Number(value || 0)));
      const claim = Number(currentItem.claim_qty || 0);
      currentItem.direct_qty = dir;
      currentItem.depo_qty = Math.max(
        0,
        Number((invQty - dir - claim).toFixed(2)),
      );
    }

    if (field === "depo_qty" && toReceiveAtValue === "both") {
      const dep = Math.min(invQty, Math.max(0, Number(value || 0)));
      const claim = Number(currentItem.claim_qty || 0);
      currentItem.depo_qty = dep;
      currentItem.direct_qty = Math.max(
        0,
        Number((invQty - dep - claim).toFixed(2)),
      );
    }

    if (
      field === "claim_qty" &&
      Number(value) > 0 &&
      currentItem.claim_reason === "None"
    ) {
      currentItem.claim_reason = "Shortage";
    }

    const updated = [...items];
    updated[index] = currentItem;
    form.setFieldsValue({ items: updated });
  };

  // Apply batch claim reason to all items
  const handleApplyBatchClaimReason = (reason) => {
    const items = form.getFieldValue("items") || [];
    const updated = items.map((i) => ({
      ...i,
      claim_reason: reason,
      claim_qty: reason === "None" ? 0 : i.claim_qty,
      claim_amount: reason === "None" ? 0 : i.claim_amount,
    }));
    form.setFieldsValue({ items: updated });
  };

  // Submit Stock Receiving Entry (POST /purchase/stock-in-transit/)
  const handleSubmitReceive = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formattedPayload = {
        purchase_invoice_id: editingInvoice.purchase_invoice_id,
        stock_received_on: values.stock_received_on
          ? dayjs(values.stock_received_on).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        transit_days: Number(values.transit_days || 0),
        to_be_received_at: values.to_be_received_at || "direct",
        received_place:
          values.to_be_received_at !== "depo"
            ? values.received_place || selectedVehicle?.place || "Bhadrak"
            : null,
        depo: values.to_be_received_at !== "direct" ? values.depo : null,
        status: "Received",
        items: (values.items || []).map((item) => ({
          purchase_invoice_item_id: item.purchase_invoice_item_id,
          direct_qty: String(Number(item.direct_qty || 0).toFixed(2)),
          depo_qty: String(Number(item.depo_qty || 0).toFixed(2)),
          claim_reason: item.claim_reason || "None",
          claim_qty: String(Number(item.claim_qty || 0).toFixed(2)),
          claim_amount: String(Number(item.claim_amount || 0).toFixed(2)),
          narration: item.narration || "",
          status: "Received",
        })),
      };

      const res = await createStockInTransit(formattedPayload);
      message.success(
        res?.message || "Stock in transit details recorded successfully!",
      );

      setReceiveModalOpen(false);

      // Refresh both Vehicle Modal invoices and Main Vehicle List
      if (selectedVehicle) {
        handleOpenVehicleModal(selectedVehicle);
      }
      fetchTransitData();
    } catch (error) {
      console.error("Submit Stock In Transit Error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to record Stock In Transit receipt",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open View Modal for an Invoice
  const handleOpenViewModal = (invoiceRecord) => {
    setViewInvoice(invoiceRecord);
    setViewModalOpen(true);
  };

  // Filtered Vehicles for Main Screen
  const filteredVehicles = useMemo(() => {
    let list = vehicleList;

    if (statusFilter !== "ALL") {
      list = list.filter((v) => v.status === statusFilter);
    }

    if (searchText && searchText.trim() !== "") {
      const q = searchText.trim().toLowerCase();
      list = list.filter(
        (v) =>
          (v.supplier_name && v.supplier_name.toLowerCase().includes(q)) ||
          (v.vehicle_no && v.vehicle_no.toLowerCase().includes(q)) ||
          (v.lr_no && v.lr_no.toLowerCase().includes(q)) ||
          (v.transport_name && v.transport_name.toLowerCase().includes(q)) ||
          (v.place && v.place.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [vehicleList, searchText, statusFilter]);

  // Overall KPI Statistics
  const stats = useMemo(() => {
    const totalVehicles = vehicleList.length;
    const intransitCount = vehicleList.filter(
      (v) => v.status === "Intransit",
    ).length;
    const partialCount = vehicleList.filter(
      (v) => v.status === "Partially Received",
    ).length;
    const receivedCount = vehicleList.filter(
      (v) => v.status === "Received",
    ).length;
    const totalAmount = vehicleList.reduce(
      (acc, v) => acc + Number(v.total_amount || 0),
      0,
    );

    return {
      totalVehicles,
      intransitCount,
      partialCount,
      receivedCount,
      totalAmount,
    };
  }, [vehicleList]);

  // Export List to Excel
  const handleExport = () => {
    const rows = filteredVehicles.map((v, idx) => ({
      "#": idx + 1,
      "Supplier Name": v.supplier_name,
      Place: v.place,
      "Vehicle No": v.vehicle_no,
      "LR No": v.lr_no,
      "LR Date": fmtDate(v.lr_date),
      "Transport Name": v.transport_name,
      "Invoices Count": v.invoices_count,
      "Total Qty": v.total_qty,
      "Total Amount": v.total_amount,
      "Vehicle Status": v.status,
    }));
    exportToExcel(rows, "Stock_In_Transit_Vehicles", "Vehicles");
  };

  // MAIN SCREEN COLUMNS: Supplier & Connected Vehicle List
  const vehicleColumns = [
    {
      title: <span className="text-amber-900 font-bold">#</span>,
      key: "index",
      width: 50,
      render: (_, __, index) => (
        <span className="font-semibold text-gray-500">{index + 1}</span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Supplier Name</span>,
      dataIndex: "supplier_name",
      width: 170,
      render: (text) => {
        const firstName =
          String(text || "")
            .trim()
            .split(/\s+/)[0] || "-";
        return (
          <Tooltip title={text}>
            <span className="text-amber-900 font-bold text-sm cursor-pointer hover:underline">
              {firstName}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: <span className="text-amber-900 font-bold">Place</span>,
      dataIndex: "place",
      width: 130,
      render: (text) => (
        <span className="font-medium text-gray-700">{text || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Vehicle No</span>,
      dataIndex: "vehicle_no",
      width: 140,
      render: (text) => (
        <Tag color="warning" className="font-bold text-xs px-2">
          {text}
        </Tag>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">LR No</span>,
      dataIndex: "lr_no",
      width: 120,
    },
    {
      title: <span className="text-amber-900 font-bold">LR Date</span>,
      dataIndex: "lr_date",
      width: 110,
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-900 font-bold">Transport</span>,
      dataIndex: "transport_name",
      width: 130,
      render: (text) => (text ? String(text).trim().split(/\s+/)[0] : "-"),
    },
    {
      title: (
        <span className="text-amber-900 font-bold">Connected Invoices</span>
      ),
      dataIndex: "invoices_count",
      width: 140,
      align: "center",
      render: (count) => (
        <Tag
          color="purple"
          className="font-semibold px-2 py-0.5 cursor-pointer"
        >
          {count || 0} Invoices
        </Tag>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Total Qty</span>,
      dataIndex: "total_qty",
      width: 120,
      align: "right",
      render: (qty) => (
        <span className="font-bold text-amber-950">
          {Number(qty || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Total Amount</span>,
      dataIndex: "total_amount",
      width: 140,
      align: "right",
      render: (amt, r) => (
        <span className="font-bold text-gray-900">
          {r.total_amount_display ||
            `₹${Number(amt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        </span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Vehicle Status</span>,
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (status) => {
        if (status === "Received") {
          return (
            <Tag
              color="success"
              icon={<CheckCircleOutlined />}
              className="font-bold px-2 py-0.5"
            >
              Received
            </Tag>
          );
        }
        if (status === "Partially Received") {
          return (
            <Tag
              color="processing"
              icon={<ClockCircleOutlined />}
              className="font-bold px-2 py-0.5"
            >
              Partially Received
            </Tag>
          );
        }
        return (
          <Tag
            color="warning"
            icon={<ExclamationCircleOutlined />}
            className="font-bold px-2 py-0.5"
          >
            Intransit
          </Tag>
        );
      },
    },
    {
      title: <span className="text-amber-900 font-bold">Actions</span>,
      key: "actions",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none! text-white! font-semibold"
          onClick={() => handleOpenVehicleModal(record)}
        >
          View Invoices
        </Button>
      ),
    },
  ];

  // INVOICES TABLE COLUMNS (Inside Vehicle Drill-down Modal)
  const invoiceColumns = [
    {
      title: <span className="text-amber-900 font-bold">#</span>,
      key: "index",
      width: 45,
      render: (_, __, index) => (
        <span className="font-medium text-gray-500">{index + 1}</span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice No</span>,
      dataIndex: "invoice_no",
      render: (text) => (
        <span className="font-bold text-amber-900">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice Date</span>,
      dataIndex: "invoice_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-900 font-bold">E-waybill No</span>,
      dataIndex: "ewaybill_no",
      render: (text) =>
        text && text !== "-" ? (
          <span className="font-medium text-gray-800">{text}</span>
        ) : (
          <Tag color="default">Pending</Tag>
        ),
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice Amount</span>,
      dataIndex: "invoice_amount",
      align: "right",
      render: (amt, r) => (
        <span className="font-bold text-gray-900">
          {r.invoice_amount_display ||
            `₹${Number(amt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        </span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Total Qty</span>,
      dataIndex: "total_qty",
      align: "right",
      render: (qty) => (
        <span className="font-semibold text-amber-900">
          {Number(qty || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Transit Days</span>,
      dataIndex: "transit_days",
      align: "center",
      render: (days) =>
        days !== "" && days !== null && days !== undefined ? (
          <Tag color="geekblue" className="font-bold">
            {days} Days
          </Tag>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: (
        <span className="text-amber-900 font-bold">Stock Received On</span>
      ),
      dataIndex: "stock_received_on",
      render: (val) =>
        val ? (
          <span className="font-medium text-green-700">{fmtDate(val)}</span>
        ) : (
          <Tag color="error">Pending</Tag>
        ),
    },
    {
      title: <span className="text-amber-900 font-bold">Destination</span>,
      dataIndex: "to_be_received_at",
      render: (dest, record) => {
        if (dest === "depo")
          return <Tag color="purple">Depot: {record.depo_name || "Depot"}</Tag>;
        if (dest === "both")
          return <Tag color="cyan">Both (Direct + Depot)</Tag>;
        if (dest === "direct")
          return (
            <Tag color="gold">Direct ({record.received_place || "Plant"})</Tag>
          );
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice Status</span>,
      dataIndex: "status",
      align: "center",
      render: (status) =>
        status === "Received" ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Received
          </Tag>
        ) : (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Pending
          </Tag>
        ),
    },
    {
      title: <span className="text-amber-900 font-bold">Actions</span>,
      key: "actions",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={
              record.status === "Received" ? (
                <EditOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            className="bg-amber-500! hover:bg-amber-600! border-none! text-white! font-semibold"
            onClick={() => handleOpenReceiveModal(record, selectedVehicle)}
          >
            {record.status === "Received" ? "Edit" : "Receive"}
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            className="text-amber-700 hover:text-amber-900 border-amber-300!"
            onClick={() => handleOpenViewModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* TOP KPI METRICS BAR */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            className="border-amber-200 bg-amber-50/40 shadow-xs rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Total Transit Vehicles
                </div>
                <div className="text-2xl font-black text-amber-950 mt-1">
                  {stats.totalVehicles}
                </div>
              </div>
              <CarOutlined className="text-3xl text-amber-500 opacity-80" />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            className="border-orange-200 bg-orange-50/40 shadow-xs rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-orange-800 uppercase tracking-wider">
                  Intransit Vehicles
                </div>
                <div className="text-2xl font-black text-orange-950 mt-1">
                  {stats.intransitCount}
                </div>
              </div>
              <InboxOutlined className="text-3xl text-orange-500 opacity-80" />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            className="border-blue-200 bg-blue-50/40 shadow-xs rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Partially Received
                </div>
                <div className="text-2xl font-black text-blue-950 mt-1">
                  {stats.partialCount}
                </div>
              </div>
              <ClockCircleOutlined className="text-3xl text-blue-500 opacity-80" />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            className="border-green-200 bg-green-50/40 shadow-xs rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-green-800 uppercase tracking-wider">
                  Fully Received Vehicles
                </div>
                <div className="text-2xl font-black text-green-950 mt-1">
                  {stats.receivedCount}
                </div>
              </div>
              <CheckCircleOutlined className="text-3xl text-green-500 opacity-80" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* FILTER & ACTIONS BAR */}
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Space wrap size="middle">
            <Input
              placeholder="Search supplier, vehicle, LR..."
              value={searchText}
              prefix={<SearchOutlined className="text-amber-600!" />}
              style={{ width: 300 }}
              className="border-amber-300! focus:border-amber-500!"
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 170 }}
              className="border-amber-300!"
            >
              <Option value="ALL">All Vehicle Status</Option>
              <Option value="Intransit">Intransit</Option>
              <Option value="Partially Received">Partially Received</Option>
              <Option value="Received">Received</Option>
            </Select>

            <Button
              icon={<ReloadOutlined />}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={fetchTransitData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Col>

        <Col>
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={handleExport}
          >
            Export Excel
          </Button>
        </Col>
      </Row>

      {/* STEP 1: MAIN SUPPLIER & VEHICLE AGGREGATED TABLE */}
      <div className="border border-amber-300 rounded-lg shadow-md bg-white overflow-hidden">
        <Table
          columns={vehicleColumns}
          dataSource={filteredVehicles}
          loading={loading}
          rowKey="key"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          scroll={{ x: 1400 }}
          onRow={(record) => ({
            onDoubleClick: () => handleOpenVehicleModal(record),
            className: "cursor-pointer hover:bg-amber-50/40 transition-colors",
          })}
        />
      </div>

      {/* STEP 2: VEHICLE INVOICES DRILL-DOWN MODAL */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-amber-600 text-2xl" />
              <div>
                <span className="text-amber-800 text-2xl font-bold">
                  Vehicle: {selectedVehicle?.vehicle_no}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  (LR No: <strong>{selectedVehicle?.lr_no}</strong> | Date:{" "}
                  <strong>{fmtDate(selectedVehicle?.lr_date)}</strong>)
                </span>
              </div>
            </div>
            <Space>
              {selectedVehicle?.status === "Received" ? (
                <Tag color="success" className="font-bold text-sm px-3 py-1">
                  All Invoices Received
                </Tag>
              ) : selectedVehicle?.status === "Partially Received" ? (
                <Tag color="processing" className="font-bold text-sm px-3 py-1">
                  Partially Received
                </Tag>
              ) : (
                <Tag color="warning" className="font-bold text-sm px-3 py-1">
                  Intransit
                </Tag>
              )}
            </Space>
          </div>
        }
        open={vehicleModalOpen}
        onCancel={() => setVehicleModalOpen(false)}
        footer={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() =>
              selectedVehicle && handleOpenVehicleModal(selectedVehicle)
            }
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Refresh Invoices
          </Button>,
          <Button
            key="close"
            onClick={() => setVehicleModalOpen(false)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Close
          </Button>,
        ]}
        width="90vw"
        style={{ maxWidth: 1450 }}
        destroyOnClose
      >
        <div className="space-y-4">
          {/* Header Summary for this Vehicle */}
          <Card size="small" className="border-amber-200 bg-amber-50/30">
            <Row gutter={[16, 12]}>
              <Col span={6}>
                <div className="text-xs text-gray-500 font-semibold">
                  Supplier Name
                </div>
                <div className="font-bold text-amber-900 text-base">
                  {selectedVehicle?.supplier_name}
                </div>
              </Col>
              <Col span={4}>
                <div className="text-xs text-gray-500 font-semibold">Place</div>
                <div className="font-semibold text-gray-800">
                  {selectedVehicle?.place || "-"}
                </div>
              </Col>
              <Col span={5}>
                <div className="text-xs text-gray-500 font-semibold">
                  Transport
                </div>
                <div className="font-semibold text-gray-800">
                  {selectedVehicle?.transport_name || "-"}
                </div>
              </Col>
              <Col span={3}>
                <div className="text-xs text-gray-500 font-semibold">
                  Invoices Count
                </div>
                <div className="font-bold text-purple-900">
                  {selectedVehicle?.invoices_count ||
                    selectedVehicle?.invoices?.length ||
                    0}
                </div>
              </Col>
              <Col span={3}>
                <div className="text-xs text-gray-500 font-semibold">
                  Total Qty
                </div>
                <div className="font-bold text-amber-900">
                  {Number(selectedVehicle?.total_qty || 0).toFixed(2)}
                </div>
              </Col>
              <Col span={3}>
                <div className="text-xs text-gray-500 font-semibold">
                  Total Amount
                </div>
                <div className="font-bold text-gray-900">
                  {selectedVehicle?.total_amount_display ||
                    `₹${Number(selectedVehicle?.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Connected Invoices Table */}
          <div className="border border-amber-200 rounded-lg shadow-sm bg-white overflow-hidden">
            <Table
              columns={invoiceColumns}
              dataSource={selectedVehicle?.invoices || []}
              loading={loadingVehicleInvoices}
              rowKey={(inv) => inv.purchase_invoice_id || inv.invoice_no}
              pagination={false}
              size="middle"
              scroll={{ x: 1300 }}
              onRow={(record) => ({
                onDoubleClick: () =>
                  handleOpenReceiveModal(record, selectedVehicle),
                className:
                  "cursor-pointer hover:bg-amber-50/40 transition-colors",
              })}
            />
          </div>
        </div>
      </Modal>

      {/* STEP 3: STOCK RECEIVING MODAL (PER INVOICE) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-amber-600 text-xl" />
            <span className="text-amber-800 text-2xl font-bold">
              Record / Edit Stock Receipt: {editingInvoice?.invoice_no}
            </span>
          </div>
        }
        open={receiveModalOpen}
        onCancel={() => setReceiveModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setReceiveModalOpen(false)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={submitting}
            onClick={handleSubmitReceive}
            className="bg-amber-500! hover:bg-amber-600! border-none! font-bold text-white!"
          >
            Mark Invoice as Received
          </Button>,
        ]}
        width={1350}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {/* Overview Card */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <h6 className="text-amber-700 font-bold mb-3 text-sm">
              Invoice & Vehicle Header Info
            </h6>
            <Row gutter={[12, 12]}>
              <Col span={6}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      Supplier Name
                    </span>
                  }
                  name="supplier_name"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      Vehicle No
                    </span>
                  }
                  name="vehicle_no"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">LR No</span>
                  }
                  name="lr_no"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      LR Date
                    </span>
                  }
                  name="lr_date"
                >
                  <AppDatePicker disabled className="bg-gray-50! w-full" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      Transport Name
                    </span>
                  }
                  name="transport_name"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      Invoice No
                    </span>
                  }
                  name="invoice_no"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      Invoice Date
                    </span>
                  }
                  name="invoice_date"
                >
                  <AppDatePicker disabled className="bg-gray-50! w-full" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">
                      Invoice Amount
                    </span>
                  }
                  name="invoice_amount"
                >
                  <InputNumber
                    disabled
                    className="w-full bg-gray-50! font-semibold"
                    formatter={(val) =>
                      `₹${Number(val || 0).toLocaleString("en-IN")}`
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Receiving Settings Card */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              border: "1px solid #FDE68A",
              background: "#FFFBEB",
            }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <h6 className="text-amber-900 font-bold mb-3 text-sm">
              Stock Receipt & Receiving Destination
            </h6>
            <Row gutter={[12, 12]}>
              <Col span={5}>
                <Form.Item
                  label={
                    <span className="text-amber-900 font-bold">
                      Stock Received On
                    </span>
                  }
                  name="stock_received_on"
                  rules={[
                    { required: true, message: "Receipt date is required" },
                  ]}
                >
                  <AppDatePicker
                    className="w-full border-amber-400!"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onChange={handleReceivedDateChange}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-900 font-bold">
                      Transit Days
                    </span>
                  }
                  name="transit_days"
                >
                  <InputNumber
                    disabled
                    className="w-full bg-blue-50! font-bold text-blue-900"
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={
                    <span className="text-amber-900 font-bold">
                      To Be Received At
                    </span>
                  }
                  name="to_be_received_at"
                  rules={[
                    {
                      required: true,
                      message: "Receiving destination is required",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select Location"
                    className="w-full font-semibold"
                    onChange={handleReceiveLocationTypeChange}
                  >
                    {RECEIVED_AT_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Direct Place (shown when direct or both) */}
              {(toReceiveAtValue === "direct" ||
                toReceiveAtValue === "both") && (
                <Col span={toReceiveAtValue === "both" ? 5 : 11}>
                  <Form.Item
                    label={
                      <span className="text-amber-900 font-bold">
                        Direct Receiving Place
                      </span>
                    }
                    name="received_place"
                    rules={[{ required: true, message: "Place is required" }]}
                  >
                    <Input
                      placeholder="e.g. Bhadrak / Haldia"
                      className="w-full font-medium"
                    />
                  </Form.Item>
                </Col>
              )}

              {/* Depot Input (shown when depo or both) */}
              {(toReceiveAtValue === "depo" || toReceiveAtValue === "both") && (
                <Col span={toReceiveAtValue === "both" ? 6 : 11}>
                  <Form.Item
                    label={
                      <span className="text-purple-900 font-bold">
                        Depot Name / Location
                      </span>
                    }
                    name="depo"
                    rules={[
                      { required: true, message: "Depot name is required" },
                    ]}
                  >
                    <Input
                      placeholder="Enter Depot Name (e.g. Bhubaneswar Depo)"
                      className="w-full font-medium"
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Card>

          {/* Items & Claim Details Card */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h6 className="text-amber-700 font-bold text-sm mb-0">
                  Items, Split Receiving & Claim Details
                </h6>
                {toReceiveAtValue === "both" && (
                  <span className="text-xs text-purple-700 font-medium">
                    💡 Both Mode Active: Split quantity into Direct Qty (Place)
                    and Depot Qty.
                  </span>
                )}
              </div>
              <Space align="center">
                <span className="text-xs font-semibold text-amber-800">
                  Quick Batch Claim:
                </span>
                <Select
                  size="small"
                  placeholder="Set all claim reasons"
                  style={{ width: 140 }}
                  onChange={handleApplyBatchClaimReason}
                >
                  {CLAIM_REASONS.map((r) => (
                    <Option key={r} value={r}>
                      {r}
                    </Option>
                  ))}
                </Select>
              </Space>
            </div>

            {/* Table Header based on Destination Mode */}
            <Row
              gutter={8}
              className="pb-2 mb-2 text-amber-900 font-bold text-xs border-b border-amber-200"
            >
              <Col span={toReceiveAtValue === "both" ? 5 : 7}>Item Name</Col>
              <Col span={toReceiveAtValue === "both" ? 2 : 3}>Invoiced Qty</Col>
              <Col span={1}>Unit</Col>
              <Col span={2}>Rate (₹)</Col>
              {toReceiveAtValue === "both" && (
                <>
                  <Col span={2} className="text-amber-900">
                    Direct Qty
                  </Col>
                  <Col span={2} className="text-purple-900">
                    Depo Qty
                  </Col>
                </>
              )}
              <Col span={toReceiveAtValue === "both" ? 3 : 4}>Claim Reason</Col>
              <Col span={2}>Claim Qty</Col>
              <Col span={toReceiveAtValue === "both" ? 2 : 3}>
                Claim Amt (₹)
              </Col>
              <Col span={toReceiveAtValue === "both" ? 3 : 2}>
                Item Narration
              </Col>
            </Row>

            <Form.List name="items">
              {(fields) =>
                fields.map((field) => {
                  const itemsValues = form.getFieldValue("items") || [];
                  const currentItem = itemsValues[field.name] || {};
                  const maxQty = Number(currentItem.invoiced_qty || 0);

                  return (
                    <Row
                      key={field.key}
                      gutter={8}
                      align="middle"
                      className="mb-2.5"
                    >
                      <Col span={toReceiveAtValue === "both" ? 5 : 7}>
                        <Form.Item
                          name={[field.name, "item_name"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input disabled className="bg-gray-50! font-medium" />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "purchase_invoice_item_id"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={toReceiveAtValue === "both" ? 2 : 3}>
                        <Form.Item
                          name={[field.name, "invoiced_qty"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            disabled
                            className="w-full bg-gray-50! font-semibold"
                            precision={2}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={1}>
                        <Form.Item
                          name={[field.name, "unit"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            disabled
                            className="bg-gray-50! text-center p-0 text-xs"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          name={[field.name, "rate"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            disabled
                            className="w-full bg-gray-50!"
                            precision={2}
                          />
                        </Form.Item>
                      </Col>

                      {/* Both Mode: Direct Qty & Depo Qty */}
                      {toReceiveAtValue === "both" && (
                        <>
                          <Col span={2}>
                            <Form.Item
                              name={[field.name, "direct_qty"]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                min={0}
                                max={maxQty}
                                precision={2}
                                className="w-full border-amber-400! font-semibold text-amber-900"
                                placeholder="Direct"
                                onChange={(val) =>
                                  handleItemFieldChange(
                                    field.name,
                                    "direct_qty",
                                    val,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>

                          <Col span={2}>
                            <Form.Item
                              name={[field.name, "depo_qty"]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                min={0}
                                max={maxQty}
                                precision={2}
                                className="w-full border-purple-400! font-semibold text-purple-900"
                                placeholder="Depo"
                                onChange={(val) =>
                                  handleItemFieldChange(
                                    field.name,
                                    "depo_qty",
                                    val,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </>
                      )}

                      <Col span={toReceiveAtValue === "both" ? 3 : 4}>
                        <Form.Item
                          name={[field.name, "claim_reason"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            className="w-full"
                            onChange={(val) =>
                              handleItemFieldChange(
                                field.name,
                                "claim_reason",
                                val,
                              )
                            }
                          >
                            {CLAIM_REASONS.map((r) => (
                              <Option key={r} value={r}>
                                {r}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          name={[field.name, "claim_qty"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={0}
                            max={maxQty > 0 ? maxQty : undefined}
                            precision={2}
                            className="w-full border-amber-300!"
                            placeholder="0"
                            onChange={(val) =>
                              handleItemFieldChange(
                                field.name,
                                "claim_qty",
                                val,
                              )
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col span={toReceiveAtValue === "both" ? 2 : 3}>
                        <Form.Item
                          name={[field.name, "claim_amount"]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            disabled
                            className="w-full bg-amber-50! font-bold text-amber-900"
                            precision={2}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={toReceiveAtValue === "both" ? 3 : 2}>
                        <Form.Item
                          name={[field.name, "narration"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder="Item note"
                            className="w-full text-xs"
                            onChange={(e) =>
                              handleItemFieldChange(
                                field.name,
                                "narration",
                                e.target.value,
                              )
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                })
              }
            </Form.List>
          </Card>
        </Form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-amber-600 text-xl" />
            <span className="text-amber-800 text-2xl font-bold">
              Invoice Stock Details: {viewInvoice?.invoice_no}
            </span>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button
            key="receive"
            type="primary"
            icon={<CheckCircleOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none! font-semibold text-white!"
            onClick={() => {
              const rec = viewInvoice;
              setViewModalOpen(false);
              if (rec) handleOpenReceiveModal(rec, selectedVehicle);
            }}
          >
            {viewInvoice?.status === "Received"
              ? "Edit Receipt"
              : "Record Receipt"}
          </Button>,
          <Button
            key="close"
            onClick={() => setViewModalOpen(false)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Close
          </Button>,
        ]}
        width={1000}
        destroyOnClose
      >
        {viewInvoice && (
          <div className="space-y-4">
            <Card size="small" className="border-amber-200 bg-amber-50/30">
              <Row gutter={[16, 12]}>
                <Col span={6}>
                  <div className="text-xs text-gray-500">Invoice No & Date</div>
                  <div className="font-bold text-amber-900 text-base">
                    {viewInvoice.invoice_no} (
                    {fmtDate(viewInvoice.invoice_date)})
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-xs text-gray-500">Invoice Amount</div>
                  <div className="font-bold text-gray-900">
                    {viewInvoice.invoice_amount_display ||
                      `₹${Number(viewInvoice.invoice_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                  </div>
                </Col>
                <Col span={4}>
                  <div className="text-xs text-gray-500">Transit Days</div>
                  <div className="font-bold text-blue-700">
                    {viewInvoice.transit_days !== "" &&
                    viewInvoice.transit_days !== null &&
                    viewInvoice.transit_days !== undefined
                      ? `${viewInvoice.transit_days} Days`
                      : "-"}
                  </div>
                </Col>
                <Col span={4}>
                  <div className="text-xs text-gray-500">Stock Received On</div>
                  <div className="font-bold text-green-700">
                    {fmtDate(viewInvoice.stock_received_on)}
                  </div>
                </Col>
                <Col span={4}>
                  <div className="text-xs text-gray-500">Destination</div>
                  <div>
                    <Tag color="cyan">
                      {viewInvoice.to_be_received_at || "Direct"}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={viewInvoice.items || []}
              rowKey="id"
              columns={[
                {
                  title: "Item Name",
                  dataIndex: "item_name",
                  render: (t) => <span className="font-semibold">{t}</span>,
                },
                {
                  title: "Invoiced Qty",
                  dataIndex: "invoiced_qty",
                  render: (q, r) => `${q} ${r.unit || ""}`,
                },
                {
                  title: "Rate",
                  dataIndex: "rate",
                  render: (rt) => `₹${rt}`,
                },
                {
                  title: "Direct Qty",
                  dataIndex: "direct_qty",
                  render: (dq) =>
                    dq !== null && dq !== undefined && dq !== "" ? dq : "-",
                },
                {
                  title: "Depo Qty",
                  dataIndex: "depo_qty",
                  render: (dpq) =>
                    dpq !== null && dpq !== undefined && dpq !== "" ? dpq : "-",
                },
                {
                  title: "Claim Reason",
                  dataIndex: "claim_reason",
                  render: (cr) => (
                    <Tag color={cr && cr !== "None" ? "volcano" : "default"}>
                      {cr || "None"}
                    </Tag>
                  ),
                },
                {
                  title: "Claim Qty",
                  dataIndex: "claim_qty",
                  render: (cq, r) =>
                    Number(cq) > 0 ? `${cq} ${r.unit || ""}` : "-",
                },
                {
                  title: "Claim Amount",
                  dataIndex: "claim_amount",
                  render: (ca) =>
                    Number(ca) > 0 ? (
                      <span className="font-bold text-red-600">
                        ₹
                        {Number(ca).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      "-"
                    ),
                },
                {
                  title: "Narration",
                  dataIndex: "narration",
                  render: (n) => n || "-",
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

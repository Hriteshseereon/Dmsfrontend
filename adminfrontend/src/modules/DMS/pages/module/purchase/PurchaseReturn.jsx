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
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getTransitSuppliers,
  getTransitPendingItems,
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
const RECEIVED_AT_OPTIONS = ["Direct", "Depo", "Both"];

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
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Supplier Drill-down Modal State
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierItems, setSupplierItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Receive / Edit Modal State
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const selectedFY = useSelectedFinancialYear();

  useEffect(() => {
    fetchSuppliersList();
  }, []);

  // 1. Fetch Suppliers who have items in transit
  const fetchSuppliersList = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await getTransitSuppliers();
      const list = Array.isArray(res) ? res : res?.data || [];
      setSuppliers(list);
    } catch (error) {
      console.error("Error loading transit suppliers:", error);
      message.error("Failed to load transit suppliers list");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // 2. Fetch Pending and Recorded Transit Items for a Selected Supplier and group by Invoice
  const fetchSupplierTransitItems = async (supplier) => {
    if (!supplier) return;
    const supplierName = supplier.supplier_name || supplier.vendor_name;
    if (!supplierName) {
      message.warning("Supplier name is missing");
      return;
    }

    try {
      setLoadingItems(true);

      // Fetch pending / transit items for this supplier
      const resPending = await getTransitPendingItems(supplierName);
      const rawRecords = Array.isArray(resPending)
        ? resPending
        : resPending?.data || [];

      // Group records by purchase_invoice_id (or invoice_no / lr_no) to prevent duplicate invoice rows
      const invoiceMap = new Map();

      rawRecords.forEach((item, idx) => {
        const invKey =
          item.purchase_invoice_id ||
          item.invoice_no ||
          item.lr_no ||
          `inv_${idx}`;

        const itemObj = {
          id:
            item.purchase_invoice_item_id ||
            item.item_id ||
            item.id ||
            `item_${idx}`,
          purchase_invoice_item_id:
            item.purchase_invoice_item_id || item.item_id || item.id,
          stock_in_transit_id: item.stock_in_transit_id,
          item_name: item.item_name || item.product_name || "-",
          item_code: item.item_code || "",
          unit: item.unit || "TIN",
          invoiced_qty: Number(item.invoiced_qty || 0),
          rate: Number(item.rate || 0),
          claim_reason: item.claim_reason || "None",
          claim_qty: Number(item.claim_qty || 0),
          claim_amount: Number(item.claim_amount || 0),
        };

        if (invoiceMap.has(invKey)) {
          const existing = invoiceMap.get(invKey);
          existing.items.push(itemObj);

          if (!existing.stock_in_transit_id && item.stock_in_transit_id) {
            existing.stock_in_transit_id = item.stock_in_transit_id;
          }
          if (!existing.stock_received_on && item.stock_received_on) {
            existing.stock_received_on = item.stock_received_on;
          }
          if (
            existing.transit_days === null &&
            item.transit_days !== null &&
            item.transit_days !== undefined
          ) {
            existing.transit_days = item.transit_days;
          }
          if (!existing.narration && item.narration) {
            existing.narration = item.narration;
          }
          if (item.status === "Pending") {
            existing.hasPendingItems = true;
          }
        } else {
          invoiceMap.set(invKey, {
            key: invKey,
            id: item.stock_in_transit_id || invKey,
            stock_in_transit_id: item.stock_in_transit_id,
            purchase_invoice_id: item.purchase_invoice_id,
            supplier_name:
              item.supplier_name ||
              item.vendor_name ||
              supplier.supplier_name ||
              supplier.vendor_name ||
              "",
            vendor_id: item.vendor_id || supplier.vendor_id,
            place: item.place || "",
            lr_no: item.lr_no || "-",
            lr_date: item.lr_date,
            transport_name: item.transport_name || "-",
            vehicle_no: item.vehicle_no || "-",
            ewaybill_no: item.ewaybill_no || "-",
            ewaybill_date: item.ewaybill_date,
            invoice_no: item.invoice_no || item.purchase_invoice_number || "-",
            invoice_date: item.invoice_date,
            invoice_amount: Number(
              item.invoice_amount || item.total_amount || 0,
            ),
            transit_days: item.transit_days ?? null,
            stock_received_on: item.stock_received_on || null,
            to_be_received_at: item.to_be_received_at || "Direct",
            narration: item.narration || "",
            status:
              item.status || (item.stock_received_on ? "Received" : "Pending"),
            hasPendingItems: item.status === "Pending",
            items: [itemObj],
          });
        }
      });

      const groupedList = Array.from(invoiceMap.values()).map((inv) => ({
        ...inv,
        status: inv.hasPendingItems
          ? "Pending"
          : inv.stock_received_on
            ? "Received"
            : inv.status,
      }));

      setSupplierItems(groupedList);
    } catch (error) {
      console.error("Error fetching supplier transit items:", error);
      message.error("Failed to load transit items for supplier");
    } finally {
      setLoadingItems(false);
    }
  };

  // Open Supplier Drill-down Modal on click / double click
  const handleOpenSupplierModal = (record) => {
    setSelectedSupplier(record);
    setSupplierModalOpen(true);
    fetchSupplierTransitItems(record);
  };

  // Live Transit Days calculation: stock_received_on - invoice_date
  const calculateTransitDays = (receivedDate, invDate) => {
    if (!receivedDate || !invDate) return 0;
    const dRecv = parseApiDate(receivedDate);
    const dInv = parseApiDate(invDate);
    if (dRecv && dInv && dRecv.isValid() && dInv.isValid()) {
      const diff = dRecv.diff(dInv, "day");
      return diff >= 0 ? diff : 0;
    }
    return 0;
  };

  // Open Receive / Edit Modal for an entry
  const handleOpenReceive = (record) => {
    setEditingRecord(record);
    form.resetFields();

    const initialReceivedOn = record.stock_received_on
      ? parseApiDate(record.stock_received_on)
      : dayjs();

    const invDate = record.invoice_date
      ? parseApiDate(record.invoice_date)
      : null;
    const computedDays =
      record.transit_days !== null && record.transit_days !== undefined
        ? record.transit_days
        : calculateTransitDays(initialReceivedOn, invDate);

    const formattedItems = (record.items || []).map((item) => {
      const invQty = Number(item.invoiced_qty || item.qty || 0);
      const rate = Number(item.rate || 0);
      const claimQty = Number(item.claim_qty || 0);
      const claimAmount = Number(
        item.claim_amount !== undefined ? item.claim_amount : claimQty * rate,
      );

      return {
        purchase_invoice_item_id:
          item.purchase_invoice_item_id || item.item_id || item.id,
        item_name: item.item_name,
        item_code: item.item_code || "",
        unit: item.unit || "TIN",
        invoiced_qty: invQty,
        rate: rate,
        claim_reason: item.claim_reason || "None",
        claim_qty: claimQty,
        claim_amount: Number(claimAmount.toFixed(2)),
      };
    });

    form.setFieldsValue({
      supplier_name: record.supplier_name,
      place: record.place,
      lr_no: record.lr_no,
      lr_date: parseApiDate(record.lr_date),
      transport_name: record.transport_name,
      vehicle_no: record.vehicle_no,
      invoice_no: record.invoice_no,
      invoice_date: parseApiDate(record.invoice_date),
      invoice_amount: record.invoice_amount,
      stock_received_on: initialReceivedOn,
      to_be_received_at: record.to_be_received_at || "Direct",
      transit_days: computedDays,
      narration: record.narration || "",
      items: formattedItems,
    });

    setReceiveModalOpen(true);
  };

  // When Stock Received On changes, update transit_days live
  const handleReceivedDateChange = (date) => {
    if (editingRecord && date) {
      const days = calculateTransitDays(date, editingRecord.invoice_date);
      form.setFieldsValue({ transit_days: days });
    }
  };

  // Recalculate Claim Amount when Claim Qty or Rate changes
  const handleItemClaimChange = (index, field, value) => {
    const items = form.getFieldValue("items") || [];
    if (!items[index]) return;

    const currentItem = { ...items[index], [field]: value };
    if (field === "claim_qty" || field === "rate") {
      const qty = Number(currentItem.claim_qty || 0);
      const rate = Number(currentItem.rate || 0);
      currentItem.claim_amount = Number((qty * rate).toFixed(2));
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

  // Submit Receive / Claim Entry
  const handleSubmitReceive = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formattedPayload = {
        stock_received_on: values.stock_received_on
          ? dayjs(values.stock_received_on).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        to_be_received_at: values.to_be_received_at || "Direct",
        transit_days: Number(values.transit_days || 0),
        narration: values.narration || "",
        items: (values.items || []).map((item) => ({
          purchase_invoice_item_id:
            item.purchase_invoice_item_id || item.item_id || item.id,
          claim_reason: item.claim_reason || "None",
          claim_qty: Number(item.claim_qty || 0),
          claim_amount: Number(item.claim_amount || 0),
        })),
      };

      if (editingRecord?.stock_in_transit_id) {
        await updateStockInTransit(
          editingRecord.stock_in_transit_id,
          formattedPayload,
        );
      } else {
        await createStockInTransit(formattedPayload);
      }

      message.success("Stock In Transit entry recorded successfully!");
      setReceiveModalOpen(false);

      // Refresh data inside the drill-down modal and supplier summary list
      if (selectedSupplier) {
        fetchSupplierTransitItems(selectedSupplier);
      }
      fetchSuppliersList();
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

  // Open View Modal
  const handleOpenView = (record) => {
    setViewRecord(record);
    setViewModalOpen(true);
  };

  // Filtered Suppliers on Main Screen
  const filteredSuppliers = useMemo(() => {
    if (!searchText || searchText.trim() === "") return suppliers;
    const q = searchText.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        (s.supplier_name && s.supplier_name.toLowerCase().includes(q)) ||
        (s.vendor_name && s.vendor_name.toLowerCase().includes(q)) ||
        (s.vendor_id && String(s.vendor_id).toLowerCase().includes(q)),
    );
  }, [suppliers, searchText]);

  // Export Suppliers to Excel
  const handleExport = () => {
    const rows = suppliers.map((s) => ({
      "Supplier Name": s.supplier_name || s.vendor_name,
      "Vendor ID": s.vendor_id,
      "Invoice Count": s.invoice_count || 0,
      "Total Items": s.total_items || 0,
    }));
    exportToExcel(rows, "Transit_Suppliers_List", "Suppliers");
  };

  // MAIN SCREEN COLUMNS: Supplier List
  const supplierColumns = [
    {
      title: <span className="text-amber-900 font-bold">#</span>,
      key: "index",
      width: 60,
      render: (_, __, index) => (
        <span className="font-semibold text-gray-500">{index + 1}</span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Supplier Name</span>,
      dataIndex: "supplier_name",
      render: (text, record) => {
        const fullName = text || record.vendor_name || "-";
        const firstName = String(fullName).trim().split(" ")[0] || "-";
        return (
          <Tooltip
            title={`Supplier: ${fullName} (Double-click to view transit invoices)`}
          >
            <span
              className="cursor-pointer font-bold text-amber-900 hover:text-amber-600 transition-colors text-base"
              onClick={() => handleOpenSupplierModal(record)}
            >
              {firstName}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: <span className="text-amber-900 font-bold">Full Name</span>,
      dataIndex: "vendor_name",
      render: (text, record) => (
        <span className="font-medium text-gray-800">
          {text || record.supplier_name || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-900 font-bold">Invoices in Transit</span>
      ),
      dataIndex: "invoice_count",
      render: (count) => (
        <Tag color="purple" className="font-semibold text-xs px-2.5 py-0.5">
          {count || 0} Invoices
        </Tag>
      ),
    },
    {
      title: (
        <span className="text-amber-900 font-bold">Total Transit Items</span>
      ),
      dataIndex: "total_items",
      render: (count) => (
        <Tag color="blue" className="font-semibold text-xs px-2.5 py-0.5">
          {count || 0} Items
        </Tag>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Status</span>,
      key: "status",
      render: () => <Tag color="warning">Pending Receipt</Tag>,
    },
    {
      title: <span className="text-amber-900 font-bold">Actions</span>,
      key: "actions",
      fixed: "right",
      width: 220,
      render: (_, record) => (
        <Button
          type="primary"
          size="middle"
          icon={<EyeOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none! text-white! font-semibold shadow-sm"
          onClick={() => handleOpenSupplierModal(record)}
        >
          View Invoices ({record.invoice_count || 0})
        </Button>
      ),
    },
  ];

  // INNER MODAL COLUMNS (13 Fields + Status & Actions)
  const innerTableColumns = [
    {
      title: <span className="text-amber-900 font-bold">Supplier Name</span>,
      dataIndex: "supplier_name",
      render: (text) => {
        const firstName =
          String(text || "")
            .trim()
            .split(" ")[0] || "-";
        return (
          <Tooltip title={text}>
            <span className="text-amber-900 font-medium">{firstName}</span>
          </Tooltip>
        );
      },
    },
    {
      title: <span className="text-amber-900 font-bold">Place</span>,
      dataIndex: "place",
      width: 140,
      render: (text) => (
        <span className="whitespace-nowrap font-medium text-gray-700">
          {text || "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">LR No</span>,
      dataIndex: "lr_no",
    },
    {
      title: <span className="text-amber-900 font-bold">LR Date</span>,
      dataIndex: "lr_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-900 font-bold">Transport Name</span>,
      dataIndex: "transport_name",
      render: (text) => (text ? String(text).trim().split(/\s+/)[0] : "-"),
    },
    {
      title: <span className="text-amber-900 font-bold">Vehicle No</span>,
      dataIndex: "vehicle_no",
      render: (text) => <Tag color="warning">{text}</Tag>,
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
      title: <span className="text-amber-900 font-bold">E-waybill Date</span>,
      dataIndex: "ewaybill_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice No</span>,
      dataIndex: "invoice_no",
      render: (text) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice Date</span>,
      dataIndex: "invoice_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-900 font-bold">Invoice Amount</span>,
      dataIndex: "invoice_amount",
      render: (val) =>
        `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    {
      title: <span className="text-amber-900 font-bold">Transit Days</span>,
      dataIndex: "transit_days",
      render: (val) =>
        val !== null && val !== undefined ? (
          <span className="font-bold text-blue-700">{val} Days</span>
        ) : (
          <Tag color="default">-</Tag>
        ),
    },
    {
      title: (
        <span className="text-amber-900 font-bold">Stock Received On</span>
      ),
      dataIndex: "stock_received_on",
      render: (val) =>
        val ? (
          <span className="font-medium text-green-800">{fmtDate(val)}</span>
        ) : (
          <Tag color="error">Pending</Tag>
        ),
    },
    {
      title: <span className="text-amber-900 font-bold">Status</span>,
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Received" ? "success" : "warning"}>
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: <span className="text-amber-900 font-bold">Actions</span>,
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none! text-white!"
            onClick={() => handleOpenReceive(record)}
          >
            {record.status === "Received" ? "Edit" : "Receive"}
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            className="text-blue-500 hover:text-blue-700 border-blue-300!"
            onClick={() => handleOpenView(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* FILTER & ACTIONS BAR */}
      <Row
        justify="space-between"
        style={{ marginBottom: 16 }}
        gutter={[12, 12]}
      >
        <Col>
          <Space wrap>
            <Input
              placeholder="Search supplier name or ID..."
              value={searchText}
              prefix={<SearchOutlined className="text-amber-600!" />}
              style={{ width: 280 }}
              className="border-amber-300! focus:border-amber-500!"
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={fetchSuppliersList}
            >
              Refresh
            </Button>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={handleExport}
            >
              Export
            </Button>
          </Space>
        </Col>
      </Row>

      {/* YELLOW BANNER & MAIN SUPPLIER TABLE */}
      <div className="border border-amber-300 rounded-lg shadow-md bg-white overflow-hidden">
        {/* Yellow Header Banner */}
        {/* <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-amber-950 font-black text-center py-2.5 text-xl tracking-wider shadow-inner uppercase border-b border-amber-400">
          STOCK IN TRANSIT
        </div> */}

        <div className="p-4">
          <Table
            columns={supplierColumns}
            dataSource={filteredSuppliers}
            loading={loadingSuppliers}
            rowKey={(r) => r.vendor_id || r.supplier_name}
            pagination={{ pageSize: 10 }}
            className="border-amber-100"
            onRow={(record) => ({
              onDoubleClick: () => handleOpenSupplierModal(record),
              className:
                "cursor-pointer hover:bg-amber-50/50 transition-colors",
            })}
          />
        </div>
      </div>

      {/* INNER MODAL: 13-FIELD STOCK IN TRANSIT TABLE FOR SELECTED SUPPLIER */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <ShopOutlined className="text-amber-600 text-xl" />
              <span className="text-amber-800 text-2xl font-bold">
                Stock In Transit:{" "}
                {selectedSupplier?.supplier_name ||
                  selectedSupplier?.vendor_name}
              </span>
            </div>
            <Space>
              <Tag color="orange" className="text-sm px-3 py-1 font-semibold">
                {selectedSupplier?.invoice_count || 0} Invoices
              </Tag>
              <Tag color="blue" className="text-sm px-3 py-1 font-semibold">
                {selectedSupplier?.total_items || 0} Total Items
              </Tag>
            </Space>
          </div>
        }
        open={supplierModalOpen}
        onCancel={() => setSupplierModalOpen(false)}
        footer={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => fetchSupplierTransitItems(selectedSupplier)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Refresh Items
          </Button>,
          <Button
            key="close"
            onClick={() => setSupplierModalOpen(false)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Close
          </Button>,
        ]}
        width="95vw"
        style={{ top: 20, maxWidth: 1650 }}
        styles={{ body: { padding: "16px 20px" } }}
        destroyOnClose
      >
        <div className="mb-4 text-sm text-gray-600 bg-amber-50/60 p-2.5 rounded border border-amber-200/70 flex items-center justify-between">
          <span>
            Showing all transit invoices & vehicle details for{" "}
            <strong className="text-amber-900 text-base">
              {selectedSupplier?.supplier_name || selectedSupplier?.vendor_name}
            </strong>
          </span>
          <span className="text-xs text-amber-800 font-medium">
            💡 Double-click any row or click <strong>Receive</strong> to record
            receipt, transit days & claims
          </span>
        </div>
        <Table
          columns={innerTableColumns}
          dataSource={supplierItems}
          loading={loadingItems}
          rowKey="key"
          pagination={{ pageSize: 10 }}
          size="middle"
          className="border border-amber-200 rounded-lg shadow-sm"
          scroll={{ x: 1550 }}
          onRow={(record) => ({
            onDoubleClick: () => handleOpenReceive(record),
            className: "cursor-pointer hover:bg-amber-50/40",
          })}
        />
      </Modal>

      {/* RECEIVE / EDIT TRANSIT MODAL */}
      <Modal
        title={
          <span className="text-amber-800 text-2xl font-bold">
            {editingRecord?.status === "Received"
              ? "Edit Stock In Transit Receipt"
              : "Record Stock In Transit Receipt"}
          </span>
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
            className="bg-amber-500! hover:bg-amber-600! border-none! font-semibold"
          >
            {editingRecord?.status === "Received"
              ? "Update Receipt"
              : "Mark as Received"}
          </Button>,
        ]}
        width={1300}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {/* Header Invoice Overview Card */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <h6 className="text-amber-700 font-bold mb-3 text-sm">
              Transit & Invoice Details
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
              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">Place</span>
                  }
                  name="place"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-semibold">LR No</span>
                  }
                  name="lr_no"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={3}>
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
              <Col span={5}>
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
              <Col span={4}>
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
              <Col span={4}>
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
                      message: "Receiving location is required",
                    },
                  ]}
                >
                  <Select placeholder="Select Receiving Location">
                    {RECEIVED_AT_OPTIONS.map((opt) => (
                      <Option key={opt} value={opt}>
                        {opt}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
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
                    className="w-full bg-blue-50! font-bold text-blue-800"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
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
                    formatter={(value) =>
                      `₹${Number(value || 0).toLocaleString("en-IN")}`
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Items & Claim Recording Card */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div className="flex items-center justify-between mb-3">
              <h6 className="text-amber-700 font-bold text-sm mb-0">
                Items & Claim Details
              </h6>
              <Space align="center">
                <span className="text-xs font-semibold text-amber-800">
                  Quick Batch Claim:
                </span>
                <Select
                  size="small"
                  placeholder="Set all items claim"
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

            <Row
              gutter={8}
              className="pb-2 mb-2 text-amber-900 font-bold text-xs border-b border-amber-200"
            >
              <Col span={7}>Item Name</Col>
              <Col span={3}>Invoiced Qty</Col>
              <Col span={2}>Unit</Col>
              <Col span={3}>Unit Rate (₹)</Col>
              <Col span={4}>Claim Reason</Col>
              <Col span={2}>Claim Qty</Col>
              <Col span={3}>Claim Amount (₹)</Col>
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
                      <Col span={7}>
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

                      <Col span={3}>
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

                      <Col span={2}>
                        <Form.Item
                          name={[field.name, "unit"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input disabled className="bg-gray-50! text-center" />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
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

                      <Col span={4}>
                        <Form.Item
                          name={[field.name, "claim_reason"]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            className="w-full"
                            onChange={(val) =>
                              handleItemClaimChange(
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
                              handleItemClaimChange(
                                field.name,
                                "claim_qty",
                                val,
                              )
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
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
                    </Row>
                  );
                })
              }
            </Form.List>
          </Card>

          {/* General Narration Card */}
          <Card
            size="small"
            style={{ border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <Form.Item
              label={
                <span className="text-amber-800 font-semibold">
                  General Receipt Narration / Remarks
                </span>
              }
              name="narration"
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={2}
                placeholder="Optional overall remarks regarding receipt or transport condition..."
              />
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal
        title={
          <span className="text-amber-800 text-2xl font-bold">
            Stock In Transit Details
          </span>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button
            key="receive"
            type="primary"
            icon={<CheckCircleOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              const rec = viewRecord;
              setViewModalOpen(false);
              if (rec) handleOpenReceive(rec);
            }}
          >
            {viewRecord?.status === "Received"
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
        width={1050}
        destroyOnClose
      >
        {viewRecord && (
          <div>
            <Row gutter={[16, 12]}>
              <Col span={8}>
                <Text type="secondary">Supplier Name: </Text>
                <div className="font-bold text-amber-900 text-base">
                  {viewRecord.supplier_name}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Place: </Text>
                <div className="font-semibold">{viewRecord.place || "-"}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">LR No: </Text>
                <div className="font-semibold">{viewRecord.lr_no || "-"}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">LR Date: </Text>
                <div className="font-semibold">
                  {fmtDate(viewRecord.lr_date)}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Vehicle No: </Text>
                <div>
                  <Tag color="warning">{viewRecord.vehicle_no || "-"}</Tag>
                </div>
              </Col>

              <Col span={8}>
                <Text type="secondary">Transport Name: </Text>
                <div className="font-semibold">
                  {viewRecord.transport_name || "-"}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Invoice No: </Text>
                <div className="font-bold text-gray-800">
                  {viewRecord.invoice_no || "-"}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Invoice Date: </Text>
                <div className="font-semibold">
                  {fmtDate(viewRecord.invoice_date)}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">E-waybill No: </Text>
                <div className="font-semibold">
                  {viewRecord.ewaybill_no || "-"}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">E-waybill Date: </Text>
                <div className="font-semibold">
                  {fmtDate(viewRecord.ewaybill_date)}
                </div>
              </Col>

              <Col span={4}>
                <Text type="secondary">Transit Days: </Text>
                <div className="font-bold text-blue-700">
                  {viewRecord.transit_days !== null &&
                  viewRecord.transit_days !== undefined
                    ? `${viewRecord.transit_days} Days`
                    : "-"}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Stock Received On: </Text>
                <div className="font-bold text-green-800">
                  {fmtDate(viewRecord.stock_received_on)}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">To Be Received At: </Text>
                <div className="font-semibold">
                  {viewRecord.to_be_received_at || "Direct"}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Status: </Text>
                <div>
                  <Tag
                    color={
                      viewRecord.status === "Received" ? "success" : "warning"
                    }
                  >
                    {viewRecord.status || "Pending"}
                  </Tag>
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Invoice Amount: </Text>
                <div className="font-bold text-amber-800">
                  ₹
                  {Number(viewRecord.invoice_amount || 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            <h5 className="text-amber-800 font-bold mb-3">
              Item Receipt & Claims
            </h5>
            <Table
              dataSource={viewRecord.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              className="border border-amber-100"
              columns={[
                { title: "Item Name", dataIndex: "item_name" },
                {
                  title: "Invoiced Qty",
                  dataIndex: "invoiced_qty",
                  render: (val, r) => `${val} ${r.unit || ""}`,
                },
                {
                  title: "Rate",
                  dataIndex: "rate",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
                {
                  title: "Claim Reason",
                  dataIndex: "claim_reason",
                  render: (val) => (
                    <Tag color={val && val !== "None" ? "error" : "default"}>
                      {val || "None"}
                    </Tag>
                  ),
                },
                {
                  title: "Claim Qty",
                  dataIndex: "claim_qty",
                  render: (val, r) =>
                    `${Number(val || 0).toFixed(2)} ${r.unit || ""}`,
                },
                {
                  title: "Claim Amount",
                  dataIndex: "claim_amount",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
              ]}
            />

            {viewRecord.narration && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">General Remarks: </Text>
                <div className="font-medium text-gray-700 bg-gray-50 p-2 rounded border">
                  {viewRecord.narration}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

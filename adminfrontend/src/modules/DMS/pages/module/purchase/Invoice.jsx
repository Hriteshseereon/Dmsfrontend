import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  message,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Upload,
  Typography,
  Tag,
  Divider,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getInvoiceSuppliers,
  getAvailableVehicles,
  getSoudaRates,
  getFreightLocations,
  getPurchaseInvoices,
  createPurchaseInvoice,
  updatePurchaseInvoice,
} from "../../../../../api/purchase";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import AppDatePicker from "../../../../../components/AppDatePicker";
import useSessionStore from "../../../../../store/sessionStore";

dayjs.extend(customParseFormat);

const { Option } = Select;
const { Text } = Typography;

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

export default function PurchaseInvoice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal and Form controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Lists for dropdown selections
  const [suppliers, setSuppliers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [soudaRatesMap, setSoudaRatesMap] = useState({}); // keyed by item_name
  const [fileList, setFileList] = useState([]);

  // Form field focus and navigation refs
  const vehicleSelectRef = useRef(null);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const ewaybillNoRef = useRef(null);
  const ewaybillDateRef = useRef(null);
  const invoiceNoRef = useRef(null);
  const invoiceDateRef = useRef(null);
  const paymentDueDateRef = useRef(null);
  const rateSelectRefs = useRef([]);

  const selectedFY = useSelectedFinancialYear();

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await getInvoiceSuppliers();
      setSuppliers(res?.data || res || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchInvoices = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await getPurchaseInvoices(filters);
      const list = Array.isArray(res) ? res : res?.data || [];
      setData(list);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      message.error("Failed to load purchase invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = async (supplierId) => {
    // Reset dependant fields with default dispatch_from: "Haldia"
    form.setFieldsValue({
      vehicle_no: undefined,
      lr_no: "",
      lr_date: null,
      transport_name: "",
      place: "",
      gross_weight: undefined,
      dispatch_from: "Haldia",
      ship_to: "",
      items: [],
      total_qty: 0,
      total_taxable_amount: 0,
      total_igst_amount: 0,
      total_amount: 0,
      round_off_amount: 0,
      grand_total: 0,
    });
    setSoudaRatesMap({});
    setAvailableVehicles([]);

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    if (!selectedSupplier) return;

    // Set auto-filled supplier name and supplier's city as place
    const supplierCity =
      selectedSupplier.city ||
      selectedSupplier.place ||
      selectedSupplier.location ||
      "";

    form.setFieldsValue({
      supplier_name: selectedSupplier.name,
      place: supplierCity,
    });

    try {
      message.loading({ content: "Loading available vehicles...", key: "load_vehicles" });
      const res = await getAvailableVehicles();
      const list = res?.data || res || [];

      // Filter vehicles client-side by place to match supplier's place/city
      const filtered = list.filter(
        (v) =>
          String(v.place || "").trim().toLowerCase() ===
          String(supplierCity || "").trim().toLowerCase()
      );

      setAvailableVehicles(filtered.length > 0 ? filtered : list);
      message.destroy("load_vehicles");

      // Automatically move focus to Vehicle No and open dropdown
      setTimeout(() => {
        vehicleSelectRef.current?.focus();
        setVehicleDropdownOpen(true);
      }, 150);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      message.error({ content: "Failed to load vehicles", key: "load_vehicles" });
    }
  };

  const handleVehicleChange = async (vehicleNo) => {
    setVehicleDropdownOpen(false);
    const matchedVehicle = availableVehicles.find((v) => v.vehicle_no === vehicleNo);
    if (!matchedVehicle) return;

    form.setFieldsValue({
      lr_no: matchedVehicle.lr_no || "",
      lr_date: matchedVehicle.lr_date ? parseApiDate(matchedVehicle.lr_date) : null,
      transport_name: matchedVehicle.transport_name || "",
      place: matchedVehicle.place || form.getFieldValue("place") || "",
      gross_weight:
        matchedVehicle.gross_weight_loaded ||
        matchedVehicle.gross_weight_loading_plan ||
        0,
    });

    // Populate initial items list
    const populatedItems = (matchedVehicle.items || []).map((item) => ({
      sale_contract: item.sale_contract_id,
      sale_contract_item: item.sale_contract_item_id,
      product: item.product_id,
      item_name: item.item_name,
      qty: item.qty,
      unit: item.unit,
      net_wt: item.net_wt,
      gst_percent: item.gst_percent,
      rate: undefined,
      taxable_amount: 0,
      igst_amount: 0,
      total_amount: 0,
    }));

    form.setFieldsValue({ items: populatedItems });

    // Fetch Souda rates for each item
    const supplierId = form.getFieldValue("vendor");
    if (supplierId) {
      await fetchSoudaRatesForItems(supplierId, populatedItems);
    }

    // Fetch freight locations, defaulting dispatch_from to "Haldia"
    try {
      const freightRes = await getFreightLocations(matchedVehicle.place);
      if (freightRes?.data) {
        form.setFieldsValue({
          dispatch_from: freightRes.data.dispatch_from || "Haldia",
          ship_to: freightRes.data.ship_to || "",
        });
      } else {
        form.setFieldsValue({
          dispatch_from: "Haldia",
        });
      }
    } catch (error) {
      console.error("Error loading freight locations:", error);
      form.setFieldsValue({
        dispatch_from: "Haldia",
      });
    }

    recalculateGrandTotals(populatedItems);

    // Auto-focus cursor directly to E-waybill No
    setTimeout(() => {
      ewaybillNoRef.current?.focus();
    }, 150);
  };

  const fetchSoudaRatesForItems = async (vendorId, itemsList) => {
    const ratesByItem = {};
    message.loading({ content: "Fetching contract rates...", key: "load_rates" });
    await Promise.all(
      itemsList.map(async (item) => {
        if (!item.item_name || ratesByItem[item.item_name]) return;
        try {
          const res = await getSoudaRates(vendorId, item.item_name);
          ratesByItem[item.item_name] = res?.data || res || [];
        } catch (error) {
          console.error(`Failed to fetch rates for ${item.item_name}`, error);
          ratesByItem[item.item_name] = [];
        }
      })
    );
    setSoudaRatesMap(ratesByItem);
    message.destroy("load_rates");
  };

  const handleRateChange = (index, rate, rateOption) => {
    const items = form.getFieldValue("items") || [];
    if (!items[index] || !rateOption) return;

    const currentItem = items[index];
    const qty = Number(currentItem.qty || 0);
    const gstPercent = Number(currentItem.gst_percent || 0);
    const rateVal = Number(rateOption.rate ?? rate ?? 0);
    const contractBalance = Number(
      rateOption.balance_qty !== undefined && rateOption.balance_qty !== null
        ? rateOption.balance_qty
        : rateOption.souda_qty ?? 0
    );

    // If contract balance is less than required item quantity: split item
    if (contractBalance > 0 && contractBalance < qty) {
      const allocatedQty = contractBalance;
      const remainingQty = Number((qty - allocatedQty).toFixed(3));
      const originalNetWt = Number(currentItem.net_wt || 0);
      const allocatedNetWt =
        qty > 0 ? Number(((originalNetWt * allocatedQty) / qty).toFixed(3)) : 0;
      const remainingNetWt = Number((originalNetWt - allocatedNetWt).toFixed(3));

      const currentTaxable = allocatedQty * rateVal;
      const currentIgst = (currentTaxable * gstPercent) / 100;
      const currentTotal = currentTaxable + currentIgst;

      const updatedCurrentItem = {
        ...currentItem,
        qty: allocatedQty,
        net_wt: allocatedNetWt,
        rate: rateVal,
        purchase_contract: rateOption.purchase_contract_id,
        purchase_contract_item: rateOption.purchase_contract_item_id,
        taxable_amount: Number(currentTaxable.toFixed(2)),
        igst_amount: Number(currentIgst.toFixed(2)),
        total_amount: Number(currentTotal.toFixed(2)),
      };

      const newSplitItem = {
        sale_contract: currentItem.sale_contract,
        sale_contract_item: currentItem.sale_contract_item,
        product: currentItem.product,
        item_name: currentItem.item_name,
        qty: remainingQty,
        unit: currentItem.unit,
        net_wt: remainingNetWt,
        gst_percent: currentItem.gst_percent,
        rate: undefined,
        purchase_contract: undefined,
        purchase_contract_item: undefined,
        taxable_amount: 0,
        igst_amount: 0,
        total_amount: 0,
        is_split: true,
      };

      const updatedItems = [...items];
      updatedItems[index] = updatedCurrentItem;
      updatedItems.splice(index + 1, 0, newSplitItem);

      form.setFieldsValue({ items: updatedItems });
      recalculateGrandTotals(updatedItems);

      message.info(
        `Quantity split: ${allocatedQty} ${currentItem.unit || ""} allocated to Souda #${
          rateOption.souda_no || ""
        }. Remaining ${remainingQty} ${currentItem.unit || ""} created below.`
      );

      // Auto-focus new row's rate dropdown for selecting next contract
      setTimeout(() => {
        rateSelectRefs.current[index + 1]?.focus();
      }, 150);
      return;
    }

    // Standard case: contract balance >= item qty
    const taxableAmount = qty * rateVal;
    const igstAmount = (taxableAmount * gstPercent) / 100;
    const totalAmount = taxableAmount + igstAmount;

    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      rate: rateVal,
      purchase_contract: rateOption.purchase_contract_id,
      purchase_contract_item: rateOption.purchase_contract_item_id,
      taxable_amount: Number(taxableAmount.toFixed(2)),
      igst_amount: Number(igstAmount.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
    };

    form.setFieldsValue({ items: updatedItems });
    recalculateGrandTotals(updatedItems);

    // If next item row exists and has no rate, move focus to it
    if (index + 1 < updatedItems.length && !updatedItems[index + 1].rate) {
      setTimeout(() => {
        rateSelectRefs.current[index + 1]?.focus();
      }, 150);
    }
  };

  const handleRemoveItem = (index) => {
    const items = form.getFieldValue("items") || [];
    if (items.length <= 1) return;
    const updatedItems = items.filter((_, idx) => idx !== index);
    form.setFieldsValue({ items: updatedItems });
    recalculateGrandTotals(updatedItems);
  };

  const recalculateGrandTotals = (itemsOverride) => {
    const items = itemsOverride || form.getFieldValue("items") || [];
    const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const totalTaxable = items.reduce(
      (sum, item) => sum + Number(item.taxable_amount || 0),
      0
    );
    const totalIGST = items.reduce(
      (sum, item) => sum + Number(item.igst_amount || 0),
      0
    );
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    );

    const roundOff = Number(form.getFieldValue("round_off_amount") || 0);
    const grandTotal = totalAmount + roundOff;

    form.setFieldsValue({
      total_qty: Number(totalQty.toFixed(3)),
      total_taxable_amount: Number(totalTaxable.toFixed(2)),
      total_igst_amount: Number(totalIGST.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
      grand_total: Number(grandTotal.toFixed(2)),
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      dispatch_from: "Haldia",
      round_off_amount: 0,
    });
    setFileList([]);
    setSoudaRatesMap({});
    setAvailableVehicles([]);
    setVehicleDropdownOpen(false);
    setModalOpen(true);
  };

  const handleEdit = async (record) => {
    setEditingId(record.id);
    form.resetFields();

    const formattedItems = (record.items || []).map((item) => {
      const qty = Number(item.qty || 0);
      const rate = Number(item.rate || 0);
      const gstPercent = Number(item.gst_percent || 0);
      const taxableAmount = Number(item.taxable_amount || qty * rate || 0);
      const igstAmount = Number(
        item.igst_amount ||
          item.total_gst_amount ||
          (taxableAmount * gstPercent) / 100 ||
          0
      );
      const totalAmount = Number(
        item.total_amount || taxableAmount + igstAmount || 0
      );

      return {
        sale_contract: item.sale_contract,
        sale_contract_item: item.sale_contract_item,
        purchase_contract: item.purchase_contract,
        purchase_contract_item: item.purchase_contract_item,
        product: item.product,
        item_name: item.item_name,
        qty: qty,
        unit: item.unit,
        net_wt: Number(item.net_wt || 0),
        gst_percent: gstPercent,
        rate: rate,
        taxable_amount: Number(taxableAmount.toFixed(2)),
        igst_amount: Number(igstAmount.toFixed(2)),
        total_amount: Number(totalAmount.toFixed(2)),
      };
    });

    // Ensure available vehicles includes the current vehicle
    if (record.vehicle_no) {
      setAvailableVehicles((prev) => {
        const exists = prev.some((v) => v.vehicle_no === record.vehicle_no);
        if (exists) return prev;
        return [
          ...prev,
          {
            vehicle_no: record.vehicle_no,
            place: record.place,
            lr_no: record.lr_no,
            lr_date: record.lr_date,
            transport_name: record.transport_name,
            gross_weight_loaded: record.total_gross_weight,
            items: formattedItems,
          },
        ];
      });
    }

    form.setFieldsValue({
      vendor: record.vendor,
      supplier_name: record.supplier_name || record.vendor_name || "",
      place: record.place || "",
      lr_no: record.lr_no || "",
      lr_date: parseApiDate(record.lr_date),
      transport_name: record.transport_name || "",
      vehicle_no: record.vehicle_no,
      ewaybill_no: record.ewaybill_no || "",
      ewaybill_date: parseApiDate(record.ewaybill_date),
      invoice_no: record.invoice_no || "",
      invoice_date: parseApiDate(record.invoice_date),
      payment_due_date: parseApiDate(record.payment_due_date),
      dispatch_from: record.dispatch_from || "Haldia",
      ship_to: record.ship_to || "",
      gross_weight: Number(record.total_gross_weight || 0),
      round_off_amount: Number(record.round_off_amount || 0),
      items: formattedItems,
      total_qty: Number(Number(record.total_qty || 0).toFixed(3)),
      total_taxable_amount: Number(
        Number(record.total_taxable_amount || 0).toFixed(2)
      ),
      total_igst_amount: Number(
        Number(record.igst_amount || record.total_gst_amount || 0).toFixed(2)
      ),
      total_amount: Number(Number(record.total_amount || 0).toFixed(2)),
      grand_total: Number(Number(record.grand_total || 0).toFixed(2)),
    });

    setFileList([]);
    setVehicleDropdownOpen(false);

    // Fetch Souda rates for items in this record
    if (record.vendor) {
      fetchSoudaRatesForItems(record.vendor, formattedItems);
    }

    setModalOpen(true);
  };

  const handlePrint = (record) => {
    if (!record.invoice_copy_url && !record.file) {
      message.warning("No document available for this invoice");
      return;
    }
    const fileUrl = record.invoice_copy_url || record.file;
    window.open(fileUrl, "_blank");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formattedPayload = {
        vendor: values.vendor,
        supplier_name: values.supplier_name,
        place: values.place,
        lr_no: values.lr_no,
        lr_date: values.lr_date ? dayjs(values.lr_date).format("YYYY-MM-DD") : null,
        transport_name: values.transport_name,
        vehicle_no: values.vehicle_no,
        ewaybill_no: values.ewaybill_no || null,
        ewaybill_date: values.ewaybill_date
          ? dayjs(values.ewaybill_date).format("YYYY-MM-DD")
          : null,
        invoice_no: values.invoice_no,
        invoice_date: values.invoice_date
          ? dayjs(values.invoice_date).format("YYYY-MM-DD")
          : null,
        payment_due_date: values.payment_due_date
          ? dayjs(values.payment_due_date).format("YYYY-MM-DD")
          : null,
        dispatch_from: values.dispatch_from,
        ship_to: values.ship_to,
        round_off_amount: String(values.round_off_amount || 0),
        items: (values.items || []).map((item) => ({
          sale_contract: item.sale_contract,
          sale_contract_item: item.sale_contract_item,
          purchase_contract: item.purchase_contract,
          purchase_contract_item: item.purchase_contract_item,
          product: item.product,
          item_name: item.item_name,
          qty: item.qty,
          unit: item.unit,
          net_wt: item.net_wt,
          gst_percent: item.gst_percent,
          rate: item.rate,
        })),
      };

      if (fileList[0]) {
        formattedPayload.invoice_copy = fileList[0];
      }

      if (editingId) {
        await updatePurchaseInvoice(editingId, formattedPayload);
        message.success("Purchase Invoice updated successfully!");
      } else {
        await createPurchaseInvoice(formattedPayload);
        message.success("Purchase Invoice created successfully!");
      }

      setModalOpen(false);
      setEditingId(null);
      fetchInvoices();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          (editingId
            ? "Failed to update Purchase Invoice"
            : "Failed to create Purchase Invoice")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchInvoices({ search: value });
  };

  const handleReset = () => {
    setSearchText("");
    fetchInvoices();
  };

  const handleExport = () => {
    const rows = data.map((item) => ({
      "Supplier Name": item.supplier_name,
      Place: item.place,
      "LR No": item.lr_no,
      "LR Date": fmtDate(item.lr_date),
      "Transport Name": item.transport_name,
      "Vehicle No": item.vehicle_no,
      "E-waybill No": item.ewaybill_no || "Pending",
      "E-waybill Date": item.ewaybill_date ? fmtDate(item.ewaybill_date) : "Pending",
      "Invoice No": item.invoice_no,
      "Invoice Date": fmtDate(item.invoice_date),
      "Total Qty": item.total_qty,
      "Total Amount": item.total_amount,
      "Net Weight": item.total_net_weight,
      "Payment Due Date": fmtDate(item.payment_due_date),
      Status: item.invoice_upload_status,
    }));
    exportToExcel(rows, "Purchase_Invoices", "Invoices");
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Supplier Name</span>,
      dataIndex: "supplier_name",
      render: (text) => <span className="text-amber-900 font-medium">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Place</span>,
      dataIndex: "place",
    },
    {
      title: <span className="text-amber-700 font-semibold">LR No</span>,
      dataIndex: "lr_no",
    },
    {
      title: <span className="text-amber-700 font-semibold">LR Date</span>,
      dataIndex: "lr_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-700 font-semibold">Transport Name</span>,
      dataIndex: "transport_name",
    },
    {
      title: <span className="text-amber-700 font-semibold">Vehicle No</span>,
      dataIndex: "vehicle_no",
      render: (text) => <Tag color="warning">{text}</Tag>,
    },
    {
      title: <span className="text-amber-700 font-semibold">E-waybill No</span>,
      dataIndex: "ewaybill_no",
      render: (text) =>
        text ? (
          <span className="font-medium text-gray-800">{text}</span>
        ) : (
          <Tag color="error">Pending</Tag>
        ),
    },
    {
      title: <span className="text-amber-700 font-semibold">E-waybill Date</span>,
      dataIndex: "ewaybill_date",
      render: (val) =>
        val ? (
          <span>{fmtDate(val)}</span>
        ) : (
          <Tag color="error">Pending</Tag>
        ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoice_no",
    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice Date</span>,
      dataIndex: "invoice_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty",
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "total_amount",
      render: (val) => `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Net Wt</span>,
      dataIndex: "total_net_weight",
    },
    {
      title: <span className="text-amber-700 font-semibold">Payment Due Date</span>,
      dataIndex: "payment_due_date",
      render: (val) => fmtDate(val),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "invoice_upload_status",
      render: (status) => (
        <Tag color={status === "Uploaded" ? "success" : "default"}>
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Invoice">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              className="bg-amber-500! hover:bg-amber-600! border-none! text-white!"
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="View details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              className="text-blue-500 hover:text-blue-700 border-blue-300!"
              onClick={() => {
                setViewRecord(record);
                setViewModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Print/Download Invoice Copy">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              className="text-amber-600 hover:text-amber-800 border-amber-300!"
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },

  ];

  return (
    <div>
      {/* FILTER HEADER CARD */}
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="Search invoice no..."
            value={searchText}
            prefix={<SearchOutlined className="text-amber-600!" />}
            style={{ width: 250, marginRight: 10 }}
            className="border-amber-300! focus:border-amber-500!"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Col>
        <Col>
          <Button
            icon={<DownloadOutlined />}
            style={{ marginRight: 10 }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={openAddModal}
          >
            Add New
          </Button>
        </Col>
      </Row>

      {/* TABLE VIEW */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Purchase Invoices</h2>
        <p className="text-amber-600 mb-3">Manage and verify your purchase invoice logs</p>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="border-amber-100"
          scroll={{ x: 1300 }}
        />
      </div>

      {/* CREATE / EDIT PURCHASE ENTRY MODAL */}
      <Modal
        title={
          <span className="text-amber-800 text-2xl font-semibold">
            {editingId ? "Edit Purchase Entry Form" : "Purchase Entry Form"}
          </span>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalOpen(false);
              setEditingId(null);
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
          >
            {editingId ? "Update Entry" : "Save Entry"}
          </Button>,
        ]}
        width={1400}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ dispatch_from: "Haldia" }}>
          {/* Header Info Block */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <h6 className="text-amber-600 font-bold mb-3">Header Details</h6>
            <Row gutter={[12, 12]}>
              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700 font-semibold">Supplier Name</span>}
                  name="vendor"
                  rules={[{ required: true, message: "Supplier is required" }]}
                >
                  <Select
                    placeholder="Select Supplier"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleSupplierChange}
                  >
                    {suppliers.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="supplier_name" hidden>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item label={<span className="text-amber-700 font-semibold">Place</span>} name="place">
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item label={<span className="text-amber-700 font-semibold">LR No</span>} name="lr_no">
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item label={<span className="text-amber-700 font-semibold">LR Date</span>} name="lr_date">
                  <AppDatePicker disabled className="bg-gray-50! w-full" />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700 font-semibold">Transport Name</span>}
                  name="transport_name"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700 font-semibold">Vehicle No</span>}
                  name="vehicle_no"
                  rules={[{ required: true, message: "Vehicle No is required" }]}
                >
                  <Select
                    ref={vehicleSelectRef}
                    placeholder="Select Pending Vehicle"
                    showSearch
                    open={vehicleDropdownOpen}
                    onDropdownVisibleChange={(open) => setVehicleDropdownOpen(open)}
                    optionFilterProp="children"
                    onChange={handleVehicleChange}
                    disabled={!form.getFieldValue("vendor")}
                  >
                    {availableVehicles.map((v) => (
                      <Option key={v.vehicle_no} value={v.vehicle_no}>
                        {v.vehicle_no}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item label={<span className="text-amber-700 font-semibold">E-waybill No</span>} name="ewaybill_no">
                  <Input
                    ref={ewaybillNoRef}
                    placeholder="Enter E-waybill No"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        ewaybillDateRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label={<span className="text-amber-700 font-semibold">E-waybill Date</span>} name="ewaybill_date">
                  <AppDatePicker
                    ref={ewaybillDateRef}
                    className="w-full"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onTabComplete={() => {
                      setTimeout(() => invoiceNoRef.current?.focus(), 50);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700 font-semibold">Invoice No</span>}
                  name="invoice_no"
                  rules={[{ required: true, message: "Invoice No is required" }]}
                >
                  <Input
                    ref={invoiceNoRef}
                    placeholder="Enter Invoice No"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        invoiceDateRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700 font-semibold">Invoice Date</span>}
                  name="invoice_date"
                  rules={[{ required: true, message: "Invoice Date is required" }]}
                >
                  <AppDatePicker
                    ref={invoiceDateRef}
                    className="w-full"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onTabComplete={() => {
                      setTimeout(() => paymentDueDateRef.current?.focus(), 50);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700 font-semibold">Payment Due Date</span>}
                  name="payment_due_date"
                >
                  <AppDatePicker
                    ref={paymentDueDateRef}
                    className="w-full"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onTabComplete={() => {
                      setTimeout(() => rateSelectRefs.current[0]?.focus(), 50);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Items Card */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <h6 className="text-amber-600 font-bold mb-3">Items Information</h6>

            <Row gutter={8} className="pb-2 mb-2 text-amber-800 font-bold text-xs">
              <Col span={4}>Item Name</Col>
              <Col span={2}>Qty</Col>
              <Col span={2}>Unit</Col>
              <Col span={2}>Net Wt (Ton)</Col>
              <Col span={1}>GST %</Col>
              <Col span={4}>Rate Selection (Available Soudas)</Col>
              <Col span={2}>Taxable Amt</Col>
              <Col span={1}>SGST</Col>
              <Col span={1}>CGST</Col>
              <Col span={2}>IGST</Col>
              <Col span={2}>Total Amount</Col>
              <Col span={1}></Col>
            </Row>

            <Form.List name="items">
              {(fields) =>
                fields.map((field) => {
                  const itemName = form.getFieldValue(["items", field.name, "item_name"]);
                  const availableRates = soudaRatesMap[itemName] || soudaRatesMap[field.name] || [];

                  return (
                    <Row key={field.key} gutter={8} align="middle" className="mb-2">
                      <Col span={4}>
                        <Form.Item name={[field.name, "item_name"]} style={{ marginBottom: 0 }}>
                          <Input disabled className="bg-gray-50!" />
                        </Form.Item>
                        <Form.Item name={[field.name, "sale_contract"]} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item name={[field.name, "sale_contract_item"]} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item name={[field.name, "product"]} hidden>
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item name={[field.name, "qty"]} style={{ marginBottom: 0 }}>
                          <InputNumber disabled className="w-full bg-gray-50!" />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item name={[field.name, "unit"]} style={{ marginBottom: 0 }}>
                          <Input disabled className="bg-gray-50!" />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item name={[field.name, "net_wt"]} style={{ marginBottom: 0 }}>
                          <InputNumber disabled className="w-full bg-gray-50!" />
                        </Form.Item>
                      </Col>

                      <Col span={1}>
                        <Form.Item name={[field.name, "gst_percent"]} style={{ marginBottom: 0 }}>
                          <InputNumber disabled className="w-full bg-gray-50!" />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          name={[field.name, "rate"]}
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: "Select rate" }]}
                        >
                          <Select
                            ref={(el) => (rateSelectRefs.current[field.name] = el)}
                            placeholder="Select Rate"
                            className="w-full"
                            optionLabelProp="label"
                            popupMatchSelectWidth={false}
                            dropdownStyle={{ minWidth: 700, borderRadius: 8, padding: 4 }}
                            onChange={(val, option) =>
                              handleRateChange(field.name, option.data?.rate, option.data)
                            }
                            dropdownRender={(menu) => (
                              <div>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr 1fr 0.8fr 1fr",
                                    gap: "8px",
                                    padding: "8px 12px",
                                    background: "#FEF3C7",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                    borderBottom: "1px solid #FDE68A",
                                    color: "#78350F",
                                  }}
                                >
                                  <span>Souda No</span>
                                  <span>Date</span>
                                  <span>Souda Qty</span>
                                  <span>Used</span>
                                  <span>Balance</span>
                                  <span>Unit</span>
                                  <span>Rate</span>
                                </div>
                                {menu}
                              </div>
                            )}
                          >
                            {availableRates.map((r) => (
                              <Option
                                key={r.purchase_contract_item_id || `${r.souda_no}_${r.rate}`}
                                value={r.rate}
                                label={`₹${r.rate}`}
                                data={r}
                              >
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr 1fr 0.8fr 1fr",
                                    gap: "8px",
                                    fontSize: "12px",
                                    padding: "4px 0",
                                    alignItems: "center",
                                    color: "#374151",
                                  }}
                                >
                                  <span className="font-semibold text-amber-900">
                                    {r.souda_no}
                                  </span>
                                  <span>{fmtDate(r.souda_date)}</span>
                                  <span>{r.souda_qty}</span>
                                  <span>{r.used_qty ?? 0}</span>
                                  <span className="text-amber-700 font-semibold">
                                    {r.balance_qty}
                                  </span>
                                  <span>{r.unit || "-"}</span>
                                  <span className="font-bold text-green-700">
                                    ₹{r.rate}
                                  </span>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item name={[field.name, "purchase_contract"]} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item name={[field.name, "purchase_contract_item"]} hidden>
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item name={[field.name, "taxable_amount"]} style={{ marginBottom: 0 }}>
                          <InputNumber disabled className="w-full bg-gray-50!" precision={2} />
                        </Form.Item>
                      </Col>

                      <Col span={1}>
                        <Input disabled className="w-full bg-gray-50! border-dashed text-center" placeholder="-" />
                      </Col>

                      <Col span={1}>
                        <Input disabled className="w-full bg-gray-50! border-dashed text-center" placeholder="-" />
                      </Col>

                      <Col span={2}>
                        <Form.Item name={[field.name, "igst_amount"]} style={{ marginBottom: 0 }}>
                          <InputNumber disabled className="w-full bg-gray-50!" precision={2} />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item name={[field.name, "total_amount"]} style={{ marginBottom: 0 }}>
                          <InputNumber disabled className="w-full bg-gray-50!" precision={2} />
                        </Form.Item>
                      </Col>

                      <Col span={1} className="text-center">
                        {fields.length > 1 && (
                          <Tooltip title="Remove split item">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => handleRemoveItem(field.name)}
                            />
                          </Tooltip>
                        )}
                      </Col>
                    </Row>
                  );
                })
              }
            </Form.List>

            {/* Total Row */}
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={8} align="middle">
              <Col span={4}>
                <span className="font-bold text-amber-800">Total:</span>
              </Col>
              <Col span={2}>
                <Form.Item name="total_qty" style={{ marginBottom: 0 }}>
                  <InputNumber disabled className="w-full bg-gray-100! font-semibold" />
                </Form.Item>
              </Col>
              <Col span={2}></Col>
              <Col span={2}></Col>
              <Col span={1}></Col>
              <Col span={4}></Col>
              <Col span={2}>
                <Form.Item name="total_taxable_amount" style={{ marginBottom: 0 }}>
                  <InputNumber disabled className="w-full bg-gray-100! font-semibold" precision={2} />
                </Form.Item>
              </Col>
              <Col span={1}></Col>
              <Col span={1}></Col>
              <Col span={2}>
                <Form.Item name="total_igst_amount" style={{ marginBottom: 0 }}>
                  <InputNumber disabled className="w-full bg-gray-100! font-semibold" precision={2} />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item name="total_amount" style={{ marginBottom: 0 }}>
                  <InputNumber disabled className="w-full bg-gray-100! font-semibold" precision={2} />
                </Form.Item>
              </Col>
              <Col span={1}></Col>
            </Row>
          </Card>

          {/* Bottom summaries */}
          <Card
            size="small"
            style={{ border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col span={4}>
                <Form.Item label={<span className="text-amber-700">Total Gr. Wt (Ton)</span>} name="gross_weight">
                  <InputNumber disabled className="w-full bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label={<span className="text-amber-700">Despatch From</span>} name="dispatch_from">
                  <Input placeholder="Despatch plant location" />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label={<span className="text-amber-700">Ship To</span>} name="ship_to">
                  <Input placeholder="Destination location" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={<span className="text-amber-700">Upload Invoice Copy</span>}>
                  <Upload
                    beforeUpload={(file) => {
                      setFileList([file]);
                      return false;
                    }}
                    onRemove={() => setFileList([])}
                    fileList={fileList}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />} className="w-full border-amber-300!">
                      Choose File
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label={<span className="text-amber-700">Round Off</span>} name="round_off_amount">
                  <InputNumber
                    className="w-full"
                    onChange={() => recalculateGrandTotals()}
                    precision={2}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label={<span className="text-amber-700 font-bold">Grand Total</span>} name="grand_total">
                  <InputNumber disabled className="w-full bg-amber-50! font-bold text-amber-800" precision={2} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal
        title={<span className="text-amber-800 text-2xl font-bold">View Purchase Invoice Details</span>}
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              const rec = viewRecord;
              setViewModal(false);
              if (rec) handleEdit(rec);
            }}
          >
            Edit Invoice
          </Button>,
          <Button
            key="close"
            onClick={() => setViewModal(false)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Close
          </Button>,
        ]}
        width={1000}
        destroyOnClose
      >

        {viewRecord && (
          <div>
            <Row gutter={[16, 12]}>
              <Col span={8}>
                <Text type="secondary">Supplier Name: </Text>
                <div className="font-bold text-amber-900 text-base">{viewRecord.supplier_name}</div>
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
                <div className="font-semibold">{fmtDate(viewRecord.lr_date)}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Vehicle No: </Text>
                <div>
                  <Tag color="warning">{viewRecord.vehicle_no}</Tag>
                </div>
              </Col>

              <Col span={8}>
                <Text type="secondary">Transport Name: </Text>
                <div className="font-semibold">{viewRecord.transport_name || "-"}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Invoice No: </Text>
                <div className="font-bold text-gray-800">{viewRecord.invoice_no || "-"}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Invoice Date: </Text>
                <div className="font-semibold">{fmtDate(viewRecord.invoice_date)}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">E-waybill No: </Text>
                <div className="font-semibold">
                  {viewRecord.ewaybill_no || <Tag color="error">Pending</Tag>}
                </div>
              </Col>
              <Col span={4}>
                <Text type="secondary">E-waybill Date: </Text>
                <div className="font-semibold">
                  {viewRecord.ewaybill_date ? (
                    fmtDate(viewRecord.ewaybill_date)
                  ) : (
                    <Tag color="error">Pending</Tag>
                  )}
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            <h5 className="text-amber-800 font-bold mb-3">Invoice Items</h5>
            <Table
              dataSource={viewRecord.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              className="border border-amber-100"
              columns={[
                { title: "Item Name", dataIndex: "item_name" },
                { title: "Qty", dataIndex: "qty" },
                { title: "Unit", dataIndex: "unit" },
                { title: "Net Wt (Ton)", dataIndex: "net_wt" },
                { title: "GST %", dataIndex: "gst_percent", render: (val) => `${val}%` },
                {
                  title: "Rate",
                  dataIndex: "rate",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
                {
                  title: "Taxable Amount",
                  dataIndex: "taxable_amount",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
                {
                  title: "IGST Amount",
                  dataIndex: "igst_amount",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
                {
                  title: "Total Amount",
                  dataIndex: "total_amount",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
              ]}
            />

            <Divider style={{ margin: "16px 0" }} />

            <Row gutter={16}>
              <Col span={6}>
                <Text type="secondary">Despatch From: </Text>
                <div className="font-medium">{viewRecord.dispatch_from || "-"}</div>
              </Col>
              <Col span={6}>
                <Text type="secondary">Ship To: </Text>
                <div className="font-medium">{viewRecord.ship_to || "-"}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Total Qty: </Text>
                <div className="font-bold">{viewRecord.total_qty}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Round Off: </Text>
                <div className="font-bold">₹{Number(viewRecord.round_off_amount || 0).toFixed(2)}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">Grand Total: </Text>
                <div className="font-bold text-lg text-amber-800">
                  ₹{Number(viewRecord.grand_total || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </Col>
            </Row>

            {viewRecord.invoice_copy_url && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Uploaded Invoice File: </Text>
                <div>
                  <a
                    href={viewRecord.invoice_copy_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View Document
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
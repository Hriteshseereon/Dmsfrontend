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
  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Lists for dropdown selections
  const [suppliers, setSuppliers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [soudaRatesMap, setSoudaRatesMap] = useState({}); // keyed by items index
  const [fileList, setFileList] = useState([]);

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
    // Reset dependant fields
    form.setFieldsValue({
      vehicle_no: undefined,
      lr_no: "",
      lr_date: null,
      transport_name: "",
      place: "",
      gross_weight: undefined,
      dispatch_from: "",
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

    // Set auto-filled supplier info
    form.setFieldsValue({
      supplier_name: selectedSupplier.name,
    });

    try {
      message.loading({ content: "Loading available vehicles...", key: "load_vehicles" });
      const res = await getAvailableVehicles();
      const list = res?.data || res || [];

      // Filter vehicles client-side by place to match supplier's place
      const filtered = list.filter(
        (v) =>
          String(v.place || "").toLowerCase() ===
          String(selectedSupplier.place || "").toLowerCase()
      );

      setAvailableVehicles(filtered.length > 0 ? filtered : list);
      message.destroy("load_vehicles");
    } catch (error) {
      console.error("Error loading vehicles:", error);
      message.error({ content: "Failed to load vehicles", key: "load_vehicles" });
    }
  };

  const handleVehicleChange = async (vehicleNo) => {
    const matchedVehicle = availableVehicles.find((v) => v.vehicle_no === vehicleNo);
    if (!matchedVehicle) return;

    form.setFieldsValue({
      lr_no: matchedVehicle.lr_no || "",
      lr_date: matchedVehicle.lr_date ? parseApiDate(matchedVehicle.lr_date) : null,
      transport_name: matchedVehicle.transport_name || "",
      place: matchedVehicle.place || "",
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

    // Fetch freight locations
    try {
      const freightRes = await getFreightLocations(matchedVehicle.place);
      if (freightRes?.data) {
        form.setFieldsValue({
          dispatch_from: freightRes.data.dispatch_from || "",
          ship_to: freightRes.data.ship_to || "",
        });
      }
    } catch (error) {
      console.error("Error loading freight locations:", error);
    }

    recalculateGrandTotals(populatedItems);
  };

  const fetchSoudaRatesForItems = async (vendorId, itemsList) => {
    const rates = {};
    message.loading({ content: "Fetching contract rates...", key: "load_rates" });
    await Promise.all(
      itemsList.map(async (item, idx) => {
        try {
          const res = await getSoudaRates(vendorId, item.item_name);
          rates[idx] = res?.data || res || [];
        } catch (error) {
          console.error(`Failed to fetch rates for ${item.item_name}`, error);
          rates[idx] = [];
        }
      })
    );
    setSoudaRatesMap(rates);
    message.destroy("load_rates");
  };

  const handleRateChange = (index, rate, rateOption) => {
    const items = form.getFieldValue("items") || [];
    if (!items[index]) return;

    const qty = Number(items[index].qty || 0);
    const gstPercent = Number(items[index].gst_percent || 0);

    const taxableAmount = qty * rate;
    const igstAmount = (taxableAmount * gstPercent) / 100;
    const totalAmount = taxableAmount + igstAmount;

    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      rate,
      purchase_contract: rateOption.purchase_contract_id,
      purchase_contract_item: rateOption.purchase_contract_item_id,
      taxable_amount: Number(taxableAmount.toFixed(2)),
      igst_amount: Number(igstAmount.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
    };

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
      total_qty: totalQty,
      total_taxable_amount: Number(totalTaxable.toFixed(2)),
      total_igst_amount: Number(totalIGST.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
      grand_total: Number(grandTotal.toFixed(2)),
    });
  };

  const openAddModal = () => {
    form.resetFields();
    setFileList([]);
    setSoudaRatesMap({});
    setAvailableVehicles([]);
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
        ewaybill_no: values.ewaybill_no,
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
        invoice_copy: fileList[0] || null,
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

      await createPurchaseInvoice(formattedPayload);
      message.success("Purchase Invoice created successfully!");
      setModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create Purchase Invoice"
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
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View details">
            <EyeOutlined
              className="text-blue-500 cursor-pointer"
              onClick={() => {
                setViewRecord(record);
                setViewModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Print/Download Invoice Copy">
            <PrinterOutlined
              className="text-amber-600 cursor-pointer"
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
        />
      </div>

      {/* CREATE PURCHASE ENTRY MODAL */}
      <Modal
        title={
          <span className="text-amber-800 text-2xl font-semibold">
            Purchase Entry Form
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setModalOpen(false)}
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
            Save Entry
          </Button>,
        ]}
        width={1400}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
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
                  label={<span className="text-amber-700">Supplier Name</span>}
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
                <Form.Item label={<span className="text-amber-700">Place</span>} name="place">
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label={<span className="text-amber-700">LR No</span>} name="lr_no">
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label={<span className="text-amber-700">LR Date</span>} name="lr_date">
                  <AppDatePicker disabled className="bg-gray-50! w-full" />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700">Transport Name</span>}
                  name="transport_name"
                >
                  <Input disabled className="bg-gray-50!" />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700">Vehicle No</span>}
                  name="vehicle_no"
                  rules={[{ required: true, message: "Vehicle No is required" }]}
                >
                  <Select
                    placeholder="Select Pending Vehicle"
                    showSearch
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
                <Form.Item label={<span className="text-amber-700">E-waybill No</span>} name="ewaybill_no">
                  <Input placeholder="Enter E-waybill No" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={<span className="text-amber-700">E-waybill Date</span>} name="ewaybill_date">
                  <AppDatePicker
                    className="w-full"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700">Invoice No</span>}
                  name="invoice_no"
                  rules={[{ required: true, message: "Invoice No is required" }]}
                >
                  <Input placeholder="Enter Invoice No" />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700">Invoice Date</span>}
                  name="invoice_date"
                  rules={[{ required: true, message: "Invoice Date is required" }]}
                >
                  <AppDatePicker
                    className="w-full"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  label={<span className="text-amber-700">Payment Due Date</span>}
                  name="payment_due_date"
                >
                  <AppDatePicker
                    className="w-full"
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
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
              <Col span={5}>Item Name</Col>
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
            </Row>

            <Form.List name="items">
              {(fields) =>
                fields.map((field) => (
                  <Row key={field.key} gutter={8} align="middle" className="mb-2">
                    <Col span={5}>
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
                          placeholder="Select Rate"
                          className="w-full"
                          onChange={(val, option) => handleRateChange(field.name, val, option.data)}
                          dropdownRender={(menu) => (
                            <div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr 1fr",
                                  gap: "6px",
                                  padding: "6px 10px",
                                  background: "#FEF3C7",
                                  fontWeight: "bold",
                                  fontSize: "11px",
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
                          {(soudaRatesMap[field.name] || []).map((r) => (
                            <Option
                              key={r.purchase_contract_item_id}
                              value={r.rate}
                              data={r}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr 1fr",
                                  gap: "6px",
                                  fontSize: "11px",
                                  color: "#4B5563",
                                }}
                              >
                                <span className="font-semibold text-gray-800">
                                  {r.souda_no}
                                </span>
                                <span>{r.souda_date}</span>
                                <span>{r.souda_qty}</span>
                                <span>{r.used_qty}</span>
                                <span className="text-amber-700 font-medium">
                                  {r.balance_qty}
                                </span>
                                <span>{r.unit}</span>
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
                  </Row>
                ))
              }
            </Form.List>

            {/* Total Row */}
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={8} align="middle">
              <Col span={5}>
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
        footer={null}
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
                <div className="font-semibold">{viewRecord.ewaybill_no || "-"}</div>
              </Col>
              <Col span={4}>
                <Text type="secondary">E-waybill Date: </Text>
                <div className="font-semibold">{fmtDate(viewRecord.ewaybill_date)}</div>
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
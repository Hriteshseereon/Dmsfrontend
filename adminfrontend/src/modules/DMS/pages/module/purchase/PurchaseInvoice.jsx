import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getPurchaseInvoice } from "../../../../../api/purchase";
const { Option } = Select;

// ------------------------------
// Demo: role switch for admin
// Set to `true` to allow editing of admin-only fields
// In a real app, wire this up to auth/permissions
const isAdmin = true; // <-- change to false to simulate non-admin
// ------------------------------

// 🔹 JSON Data
// - indentData contains full details per indent (multiple items)
// - top-level records still exist to show existing invoices
const purchaseInvoiceJSON = {
  records: [
    {
      key: 1,
      indentNo: "IND-PO-001",
      itemName: "Palm Oil",
      itemCode: "It1",
      qty: 1000,
      freeQty: 0,
      totalQty: 1000,
      rate: 60,
      uom: "Ltr",
      customerName: "Kalinga Retail",
      totalAmount: 67580.0,
      discountPercent: 5,
      discountAmount: 3000.0,
      sgstPercent: 5.0,
      cgstPercent: 5.0,
      igstPercent: 0.0,
      sgst: 3000.0,
      cgst: 3000.0,
      igst: 0,
      totalGST: 6000.0,
      tcsAmt: 500,
      grossWt: 1000.0,
      totalGrossWt: 1000.0,
      grossAmount: 60000.0,
      status: "Pending",
      purchaseType: "Local",
      receiveDate: "2024-03-21",
      companyName: "Kalinga Oil Mills",
      billType: "Tax Invoice",
      waybillNo: "WB-001",
      billMode: "Credit",
      depot: "Bhubaneswar Depot",
      plantName: "Plant A",
      plantCode: "PL1",
      deliveryDate: "2024-03-21",
      depoName: "Bhubaneswar Depo",
      assigned: false,
      transporterName: null,
    },
  ],
  options: {
    uomOptions: ["Ltr", "Kg", "Ton"],
    statusOptions: ["Approved", "Pending", "Rejected"],
    purchaseTypeOptions: ["Local", "Import"],
    companyOptions: ["Kalinga Oil Mills", "Odisha Edibles"],
    billTypeOptions: ["Tax Invoice", "Regular Invoice"],
    billModeOptions: ["Credit", "Cash"],
    indentOptions: ["IND-PO-001", "IND-PO-002", "IND-PO-003"],
    plantOptions: [
      { name: "Kalinga Oils Pvt. Ltd.", code: "PA" },
      { name: "Odisha Edibles", code: "Sunrise Foods" },
    ],
    itemOptions: [
      { name: "Palm Oil", code: "It1" },
      { name: "Sunflower Oil", code: "It2" },
      { name: "Coconut Oil", code: "It3" },
    ],
    depoOptions: ["Bhubaneswar Depo", "Cuttack Depo"],
    // transporter options for assignment
    transporterOptions: ["Alpha Transport", "BlueLine Logistics", "Delta Carriers"],
  },

  // NEW: indentData - each indent maps to a full payload (with multiple items)
  indentData: {
    "IND-PO-001": {
      indentNo: "IND-PO-001",
      plantName: "Kalinga Oils Pvt. Ltd.",
      plantCode: "PA",
      companyName: "Kalinga Oil Mills",
      depoName: "Bhubaneswar Depo",
      invoiceDate: "2024-03-20",
      receiveDate: "2024-03-21",
      deliveryDate: "2024-03-21",
      purchaseType: "Local",
      billType: "Tax Invoice",
      billMode: "Credit",
      waybillNo: "WB-001",
      status: "Pending",
      items: [
        {
          itemName: "Palm Oil",
          itemCode: "It1",
          qty: 600,
          freeQty: 0,
          uom: "Ltr",
          rate: 60,
          discountPercent: 5,
          grossWt: 600,
        },
        {
          itemName: "Sunflower Oil",
          itemCode: "It2",
          qty: 400,
          freeQty: 0,
          uom: "Ltr",
          rate: 55,
          discountPercent: 3,
          grossWt: 400,
        },
      ],
    },

    "IND-PO-002": {
      indentNo: "IND-PO-002",
      plantName: "Odisha Edibles",
      plantCode: "Sunrise Foods",
      companyName: "Odisha Edibles",
      depoName: "Cuttack Depo",
      invoiceDate: "2024-04-10",
      receiveDate: "2024-04-11",
      deliveryDate: "2024-04-11",
      purchaseType: "Import",
      billType: "Regular Invoice",
      billMode: "Cash",
      waybillNo: "WB-010",
      status: "Approved",
      items: [
        {
          itemName: "Coconut Oil",
          itemCode: "It3",
          qty: 200,
          freeQty: 10,
          uom: "Kg",
          rate: 120,
          discountPercent: 2,
          grossWt: 210,
        },
      ],
    },

    "IND-PO-003": {
      indentNo: "IND-PO-003",
      plantName: "Kalinga Oils Pvt. Ltd.",
      plantCode: "PA",
      companyName: "Kalinga Oil Mills",
      depoName: "Bhubaneswar Depo",
      invoiceDate: null,
      receiveDate: null,
      deliveryDate: null,
      purchaseType: "Local",
      billType: "Tax Invoice",
      billMode: "Credit",
      waybillNo: "",
      status: "Pending",
      items: [
        {
          itemName: "Palm Oil",
          itemCode: "It1",
          qty: 100,
          freeQty: 0,
          uom: "Ltr",
          rate: 62,
          discountPercent: 0,
          grossWt: 100,
        },
      ],
    },
  },
};

export default function PurchaseInvoice() {
  const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
 const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [recordToAssign, setRecordToAssign] = useState(null);
  const [selectedTransporter, setSelectedTransporter] = useState(null);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  // Search handler
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setData(purchaseInvoiceJSON.records);
    } else {
      const filtered = purchaseInvoiceJSON.records.filter((item) =>
        Object.values(item).some((field) =>
          String(field).toLowerCase().includes(value.toLowerCase())
        )
      );
      setData(filtered);
    }
  };

  useEffect(() => {
  fetchPurchaseInvoices();
}, []);

const fetchPurchaseInvoices = async () => {
  try {
    setLoading(true);
    const res = await getPurchaseInvoice();

    // map backend response to table format if needed
    const formatted = res.map((item, index) => ({
      key: index + 1,
      ...item,
    }));

    setData(formatted);
  } catch (err) {
    message.error("Failed to load purchase invoices");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Indent No</span>,
      dataIndex: "indentNo",
      width: 140,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Item(s)</span>,
    //   dataIndex: "itemName",
    //   width: 240,
    //   render: (text, record) => {
    //     const items = record.items || (record.itemName ? [{ itemName: record.itemName }] : []);
    //     return (
    //       <div className="text-amber-800">
    //         <div className="font-semibold">{items[0]?.itemName}</div>
    //         {items.length > 1 && (
    //           <div className="text-xs text-gray-500">+{items.length - 1} more</div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty",
      width: 100,
      render: (text, record) => (
        <span className="text-amber-800">
          {record.total_qty} {record.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "total_amount",
      width: 140,
      render: (text) => <span className="text-amber-800 ">{text}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Status</span>,
    //   dataIndex: "status",
    //   width: 110,
    //   render: (status) => {
    //     const base = "px-3 py-1 rounded-full text-sm font-semibold";
    //     if (status === "Approved")
    //       return (
    //         <span className={`${base} bg-green-100 text-green-700`}>{status}</span>
    //       );
    //     if (status === "Pending")
    //       return (
    //         <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>
    //       );
    //     return (
    //       <span className={`${base} bg-red-200 text-red-700`}>{status}</span>
    //     );
    //   },
    // },
    {
      title: <span className="text-amber-700 font-semibold">Transporter</span>,
      dataIndex: "transport",
      width: 160,
      render: (transporter, record) => (
        <span className="text-amber-800">{transporter || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Assign</span>,
      width: 140,
      render: (record) => (
        <div className="flex gap-2">
          {record.assigned ? (
            <Button disabled className="bg-green-200! border-none! text-green-800! ">Assigned</Button>
          ) : isAdmin ? (
            <Button
              type="primary"
              onClick={() => openAssignModal(record)}
              className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Assign
            </Button>
          ) : (
            <Button disabled>Assign</Button>
          )}
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined className="cursor-pointer! text-blue-500!" onClick={() => openView(record)} />
          <EditOutlined className="cursor-pointer! text-red-500!" onClick={() => openEdit(record)} />
        </div>
      ),
    },
  ];

  // Open view modal
  const openView = (record) => {
    setSelectedRecord(record);

    const itemFromRoot = (record.items && record.items[0]) || {
      itemName: record.itemName,
      itemCode: record.itemCode,
      qty: record.qty,
      freeQty: record.freeQty,
      totalQty: record.totalQty,
      uom: record.uom,
      rate: record.rate,
      discountPercent: record.discountPercent,
      discountAmount: record.discountAmount,
      grossWt: record.grossWt,
      totalGrossWt: record.totalGrossWt,
      grossAmount: record.grossAmount,
    };

    viewForm.setFieldsValue({
      ...record,
      invoiceDate: record.invoiceDate ? dayjs(record.invoiceDate) : null,
      receiveDate: record.receiveDate ? dayjs(record.receiveDate) : null,
      deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
      items: record.items && record.items.length ? record.items : [itemFromRoot],
    });

    setIsViewModalOpen(true);
  };

  // Open edit modal
  const openEdit = (record) => {
    setSelectedRecord(record);

    const itemFromRoot = (record.items && record.items[0]) || {
      itemName: record.itemName,
      itemCode: record.itemCode,
      qty: record.qty,
      freeQty: record.freeQty,
      totalQty: record.totalQty,
      uom: record.uom,
      rate: record.rate,
      discountPercent: record.discountPercent,
      discountAmount: record.discountAmount,
      grossWt: record.grossWt,
      totalGrossWt: record.totalGrossWt,
      grossAmount: record.grossAmount,
    };

    editForm.setFieldsValue({
      ...record,
      invoiceDate: record.invoiceDate ? dayjs(record.invoiceDate) : null,
      receiveDate: record.receiveDate ? dayjs(record.receiveDate) : null,
      deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
      items: record.items && record.items.length ? record.items : [itemFromRoot],
    });

    setIsEditModalOpen(true);
  };

  // Open assign modal
  const openAssignModal = (record) => {
    setRecordToAssign(record);
    setSelectedTransporter(null);
    assignForm.resetFields();
    setIsAssignModalOpen(true);
  };

  // Assign submit handler
  const handleAssignSubmit = (vals) => {
    const transporter = vals.transporterName || selectedTransporter;
    if (!transporter) {
      message.error("Please select a transporter");
      return;
    }

    setData((prev) =>
      prev.map((r) =>
        r.key === recordToAssign.key
          ? { ...r, assigned: true, transporterName: transporter }
          : r
      )
    );

    message.success(`Transporter '${transporter}' assigned.`);
    setIsAssignModalOpen(false);
  };

  // 🔹 Recalculate items and invoice-level totals
  const recalcAll = (formInstance) => {
    if (!formInstance) return;
    const values = formInstance.getFieldsValue(true);
    const items = values.items || [];

    let totalInvoiceQty = 0;
    let taxableAmount = 0;

    const updatedItems = items.map((item) => {
      const qty = Number(item?.qty || 0);
      const freeQty = Number(item?.freeQty || 0);
      const rate = Number(item?.rate || 0);
      const discountPercent = Number(item?.discountPercent || 0);
      const grossWt = Number(item?.grossWt || 0);

      const totalQty = qty + freeQty;
      const grossAmount = qty * rate;
      const discountAmount = (grossAmount * discountPercent) / 100;
      const itemTaxable = grossAmount - discountAmount;
      const totalGrossWt = grossWt;

      totalInvoiceQty += totalQty;
      taxableAmount += itemTaxable;

      return {
        ...item,
        totalQty,
        grossAmount,
        discountAmount,
        totalGrossWt,
      };
    });

    const sgstPercent = Number(values.sgstPercent || 0);
    const cgstPercent = Number(values.cgstPercent || 0);
    const igstPercent = Number(values.igstPercent || 0);
    const tcsAmt = Number(values.tcsAmt || 0);

    const sgst = (taxableAmount * sgstPercent) / 100;
    const cgst = (taxableAmount * cgstPercent) / 100;
    const igst = (taxableAmount * igstPercent) / 100;
    const totalGST = sgst + cgst + igst;
    const totalAmount = taxableAmount + totalGST + tcsAmt;

    formInstance.setFieldsValue({
      items: updatedItems,
      totalQty: totalInvoiceQty,
      sgst,
      cgst,
      igst,
      totalGST,
      tcsAmt,
      totalAmount,
    });
  };

  const handleFormSubmit = (values) => {
    const items = values.items || [];
    const firstItem = items[0] || {};

    const payload = {
      ...values,
      invoiceDate: values.invoiceDate
        ? dayjs(values.invoiceDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      receiveDate: values.receiveDate
        ? dayjs(values.receiveDate).format("YYYY-MM-DD")
        : null,
      deliveryDate: values.deliveryDate
        ? dayjs(values.deliveryDate).format("YYYY-MM-DD")
        : null,
        deliveryAddress: values.deliveryAddress || "",
      items,
      // top-level mappings (for table / backward compatibility)
      itemName: firstItem.itemName,
      itemCode: firstItem.itemCode,
      qty: firstItem.qty,
      freeQty: firstItem.freeQty,
      uom: firstItem.uom,
      rate: firstItem.rate,
      discountPercent: firstItem.discountPercent,
      discountAmount: firstItem.discountAmount,
      grossWt: firstItem.grossWt,
      totalGrossWt: firstItem.totalGrossWt,
      grossAmount: firstItem.grossAmount,
      totalQty: values.totalQty,
      sgstPercent: values.sgstPercent,
      cgstPercent: values.cgstPercent,
      igstPercent: values.igstPercent,
      sgst: values.sgst,
      cgst: values.cgst,
      igst: values.igst,
      totalGST: values.totalGST,
      tcsAmt: values.tcsAmt,
      totalAmount: values.totalAmount,
      assigned: false,
      transporterName: null,
    };

    if (isEditModalOpen) {
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key ? { ...payload, key: item.key } : item
        )
      );
      message.success(`Invoice ${payload.indentNo} updated successfully!`);
      editForm.resetFields();
      setIsEditModalOpen(false);
    } else if (isAddModalOpen) {
      setData((prev) => [...prev, { ...payload, key: prev.length + 1 }]);
      message.success(`Invoice ${payload.indentNo} added successfully!`);
      addForm.resetFields();
      setIsAddModalOpen(false);
    }
  };

  // Render form fields - show only after indent selected (per request)
  const renderFormFields = (formInstance, disabled = false) => {
    const indentChosen = formInstance.getFieldValue("indentNo");

    return (
      <>
        <h6 className=" text-amber-500 ">Basic Information</h6>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Indent No"
              name="indentNo"
              rules={[{ required: true, message: "Please select Indent No" }]}
            >
              <Select
                placeholder="Select Indent No"
                onChange={(val) => onIndentChange(val, formInstance)}
                disabled={disabled}
              >
                {purchaseInvoiceJSON.options.indentOptions.map((val) => (
                  <Select.Option key={val} value={val}>
                    {val}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* admin-only editable fields (visible immediately but editable only for admin) */}
          <Col span={6}>
            <Form.Item label="Delivery Date" name="deliveryDate">
              <DatePicker
                className="w-full"
                disabled={!isAdmin || disabled}
                format="YYYY-MM-DD"
                onChange={() => recalcAll(formInstance)}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Purchase Type" name="purchaseType">
              <Select disabled={!isAdmin || disabled} placeholder="Select Type">
                {purchaseInvoiceJSON.options.purchaseTypeOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Bill Type" name="billType">
              <Select disabled={!isAdmin || disabled} placeholder="Select Bill Type">
                {purchaseInvoiceJSON.options.billTypeOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="Bill Mode" name="billMode">
              <Select disabled={!isAdmin || disabled} placeholder="Select Bill Mode">
                {purchaseInvoiceJSON.options.billModeOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Waybill No" name="waybillNo">
              <Input disabled={!isAdmin || disabled} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Status" name="status">
              <Select disabled={!isAdmin || disabled} placeholder="Select Status">
                {purchaseInvoiceJSON.options.statusOptions.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Company Name" name="companyName">
              <Select disabled placeholder="Auto filled">
                {purchaseInvoiceJSON.options.companyOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Show rest of fields only after indent selected */}
        {indentChosen && (
          <>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Plant Name" name="plantName">
                  <Select disabled placeholder="Auto filled">
                    {purchaseInvoiceJSON.options.plantOptions.map((opt) => (
                      <Option key={opt.name} value={opt.name}>
                        {opt.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Plant Code" name="plantCode">
                  <Input disabled placeholder="Auto filled" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Depo Name" name="depoName">
                  <Select disabled placeholder="Auto filled">
                    {purchaseInvoiceJSON.options.depoOptions.map((val) => (
                      <Option key={val} value={val}>
                        {val}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Invoice Date" name="invoiceDate">
                  <DatePicker className="w-full" disabled format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={8}>
              <Form.Item
                label="Delivery Address"
                name="deliveryAddress"
                rules={[{ required: true, message: "Please enter delivery address" }]}
              >
                <Input disabled={!isAdmin || disabled} placeholder="Delivery address" />
              </Form.Item>
            </Col>

              
            </Row>

            <h6 className=" text-amber-500 ">Item & Pricing Details</h6>

            {/* MULTI ITEM SECTION (auto-populated from indent) */}
            <Form.List name="items" initialValue={[{}]}>
              {(fields) => (
                <>
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      className="border border-amber-200 rounded-lg p-3 mb-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-amber-700">Item #{index + 1}</span>
                      </div>

                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item
                            {...field}
                            label="Item Name"
                            name={[field.name, "itemName"]}
                            rules={[{ required: true }]}
                          >
                            <Input disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Item Code" name={[field.name, "itemCode"]}>
                            <Input disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Qty" name={[field.name, "qty"]}>
                            <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Free Qty" name={[field.name, "freeQty"]}>
                            <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item {...field} label="UOM" name={[field.name, "uom"]}>
                            <Input disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Rate" name={[field.name, "rate"]}>
                            <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Dis%" name={[field.name, "discountPercent"]}>
                            <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Gross Wt" name={[field.name, "grossWt"]}>
                            <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item {...field} label="Total Qty" name={[field.name, "totalQty"]}>
                            <InputNumber className="w-full bg-gray-50" disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Dis Amt" name={[field.name, "discountAmount"]}>
                            <InputNumber className="w-full bg-gray-50" disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Total Gross Wt" name={[field.name, "totalGrossWt"]}>
                            <InputNumber className="w-full bg-gray-50" disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Gross Amount (₹)" name={[field.name, "grossAmount"]}>
                            <InputNumber className="w-full bg-gray-50" disabled />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </>
              )}
            </Form.List>

            {/* COMMON TAX & TOTAL SECTION */}
            <h6 className=" text-amber-500 ">Tax, Charges & Others</h6>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Total Qty (All Items)" name="totalQty">
                  <InputNumber className="w-full bg-gray-50" disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="SGST %" name="sgstPercent">
                  <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="CGST %" name="cgstPercent">
                  <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="IGST %" name="igstPercent">
                  <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="SGST (₹)" name="sgst">
                  <InputNumber className="w-full bg-gray-50" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="CGST (₹)" name="cgst">
                  <InputNumber className="w-full bg-gray-50" disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="IGST (₹)" name="igst">
                  <InputNumber className="w-full bg-gray-50" disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Total GST (₹)" name="totalGST">
                  <InputNumber className="w-full bg-gray-50" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="TCS Amt (₹)" name="tcsAmt">
                  <InputNumber className="w-full" disabled onChange={() => recalcAll(formInstance)} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Total Amount (₹)" name="totalAmount" rules={[{ required: true }]}> 
                  <InputNumber className="w-full bg-gray-50" disabled />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  };

  // onIndentChange: populate form from indentData
  const onIndentChange = (indentNo, formInstance) => {
    const indent = purchaseInvoiceJSON.indentData[indentNo];
    if (!indent) return;

    // deep-clone
    const indentClone = JSON.parse(JSON.stringify(indent));

    // set default items mapping (compute derived fields after set)
    formInstance.setFieldsValue({
      ...indentClone,
      invoiceDate: indentClone.invoiceDate ? dayjs(indentClone.invoiceDate) : null,
      receiveDate: indentClone.receiveDate ? dayjs(indentClone.receiveDate) : null,
      deliveryDate: indentClone.deliveryDate ? dayjs(indentClone.deliveryDate) : null,
      deliveryAddress: indentClone.deliveryAddress || "",
      items: indentClone.items.map((it) => ({
        ...it,
        totalQty: (Number(it.qty || 0) + Number(it.freeQty || 0)),
        discountAmount: (Number(it.qty || 0) * Number(it.rate || 0) * (Number(it.discountPercent || 0) / 100)),
        grossAmount: Number(it.qty || 0) * Number(it.rate || 0),
        totalGrossWt: Number(it.grossWt || 0),
      })),
    });

    // schedule recalc
    setTimeout(() => recalcAll(formInstance), 50);
  };

  // Hooks to wire formInstance for render callbacks inside Form.List (workaround)
  let formInstance = null;
  useEffect(() => {
    // nothing
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={() => handleSearch("")}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              addForm.resetFields();
              addForm.setFieldsValue({ invoiceDate: dayjs(), items: [] });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Purchase Invoice Records</h2>
        <p className="text-amber-600 mb-3">Manage your purchase invoice data</p>
       <Table
  columns={columns}
  dataSource={data}
  loading={loading}
  pagination={false}
  scroll={{ y: 240 }}
/>
  </div>

      {/* ➤ Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add New Purchase Invoice</span>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(vals) => handleFormSubmit(vals)}
          onFinishFailed={(err) => console.log("Add form validation failed:", err)}
        >
          {/* capture form instance for handlers */}
          <Form.Item noStyle shouldUpdate>
            {() => {
              formInstance = addForm;
              return renderFormFields(addForm, false);
            }}
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">Add</Button>
          </div>
        </Form>
      </Modal>

      {/* ➤ Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Purchase Invoice</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(vals) => handleFormSubmit(vals)}
          onFinishFailed={(err) => console.log("Edit form validation failed:", err)}
        >
          <Form.Item noStyle shouldUpdate>
            {() => {
              formInstance = editForm;
              return renderFormFields(editForm, false);
            }}
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">Update</Button>
          </div>
        </Form>
      </Modal>

      {/* ➤ View Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">View Purchase Invoice</span>}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form layout="vertical" form={viewForm}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              formInstance = viewForm;
              return renderFormFields(viewForm, true);
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* ➤ Assign Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Assign Transporter</span>}
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={assignForm}
          onFinish={(vals) => handleAssignSubmit(vals)}
        >
          <Form.Item
            label="Select Transporter"
            name="transporterName"
            rules={[{ required: true, message: "Please select transporter" }]}
          >
            <Select
              placeholder="Select transporter"
              onChange={(val) => setSelectedTransporter(val)}
            >
              {purchaseInvoiceJSON.options.transporterOptions.map((t) => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAssignModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">Submit</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
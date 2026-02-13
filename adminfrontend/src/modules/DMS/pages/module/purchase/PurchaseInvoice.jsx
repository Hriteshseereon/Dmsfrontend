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

import { exportToExcel } from "../../../../../utils/exportToExcel";
import { getPurchaseInvoice,getPurchaseOrder,addPurchaseInvoice,getPurchaseInvoiceById,updatePurchaseInvoice,getPurchaseOrderById } from "../../../../../api/purchase";
const { Option } = Select;
const isAdmin = true; // <-- change to false to simulate non-admin
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
  const[orderList,setOrderList]=useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  // Search handler
 const handleSearch = (value) => {
  setSearchText(value);

  if (!value) {
   fetchPurchaseInvoices(); // reset to original data
    return;
  }

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
  );

  setData(filtered);
};

  useEffect(() => {
  fetchPurchaseInvoices();
  fetchPurchaseOrders();
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
const fetchPurchaseOrders = async () => {
  try {
    const res = await getPurchaseOrder();
    setOrderList(res); // store full order objects
  } catch (err) {
    message.error("Failed to load purchase orders");
    console.error(err);
  }
};

const openAddModal = async () => {
  addForm.resetFields();
  setIsAddModalOpen(true);
  await fetchPurchaseOrders();
};
const handleOrderSelect = async (orderId) => {
  try {
    const order = await getPurchaseOrderById(orderId);
    
  setSelectedOrder(order); 
addForm.setFieldsValue({
  purchase_order: order.id,

  vendorName: order.vendor_name,
  plantName: order.plant_name,
  deliveryAddress: order.delivery_address,

  deliveryDate: order.expected_receiving_date
    ? dayjs(order.expected_receiving_date)
    : null,

  sgstPercent: Number(order.sgst),
  cgstPercent: Number(order.cgst),
  igstPercent: Number(order.igst),

  sgst: Number(order.total_gst_amount) ? Number(order.sgst) : 0,
  cgst: Number(order.total_gst_amount) ? Number(order.cgst) : 0,
  igst: Number(order.total_gst_amount) ? Number(order.igst) : 0,

  totalGST: Number(order.total_gst_amount),
  tcsAmt: Number(order.tcs_amount),

  totalQty: Number(order.total_qty_all_items),
  totalAmount: Number(order.grand_total),

  items: order.items.map((item) => ({
    product_id: item.product,
    itemName: item.item_name,
    itemCode: item.hsn_code,  // your API gives hsn_code not item_code
    qty: Number(item.qty),
    freeQty: Number(item.free_qty),
    uom: item.uom_details?.unit_name,
    rate: Number(item.rate),
    discountPercent: Number(item.discount_percent),
    discountAmount: Number(item.discount_amount),
    grossWt: Number(item.gross_weight),
    totalGrossWt: Number(item.total_gross_weight),
    grossAmount: Number(item.gross_amount),
    totalQty: Number(item.total_qty),
  })),
});


   
    console.log(order)
// calculate totals
  } catch (err) {
    message.error("Failed to fetch order details");
    console.error(err);
  }
};


  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoice_number",
      width: 140,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
   
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
  const openView = async (record) => {
  try {
    setLoading(true);

    // 🔥 Call API by ID
    const invoice = await getPurchaseInvoiceById(record.id);

    setSelectedRecord(invoice);

    viewForm.setFieldsValue({
      purchase_order: invoice.order,

      invoiceDate: invoice.invoice_date
        ? dayjs(invoice.invoice_date)
        : null,

      deliveryDate: invoice.delivery_date
        ? dayjs(invoice.delivery_date)
        : null,

      deliveryAddress: invoice.delivery_address,
      vendorName: invoice.vendor_name,
      plantName: invoice.plant_name,

      purchaseType: invoice.purchase_type,
      billType: invoice.bill_type,
      billMode: invoice.bill_mode,
      waybillNo: invoice.waybill_no,
      status: invoice.status,

      sgstPercent: invoice.sgst_percent,
      cgstPercent: invoice.cgst_percent,
      igstPercent: invoice.igst_percent,

      sgst: invoice.sgst_amount,
      cgst: invoice.cgst_amount,
      igst: invoice.igst_amount,

      totalGST: invoice.total_gst_amount,
      tcsAmt: invoice.tcs_amount,
      totalQty: invoice.total_qty,
      totalAmount: invoice.total_amount,

      items: invoice.items.map((item) => ({
        product_id: item.product,
        itemName: item.item_name,
        itemCode: item.hsn_code,
        qty: item.qty,
        freeQty: item.free_qty,
        uom: item.uom_details?.unit_name,
        rate: item.rate,
        discountPercent: item.dis_percent,
        discountAmount: item.dis_amount,
        grossWt: item.gross_wt,
        totalGrossWt: item.total_gross_wt,
        grossAmount: item.gross_amount,
      })),
    });

    setIsViewModalOpen(true);

  } catch (err) {
    message.error("Failed to fetch invoice details");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const handleExport = async () => {
  try {
    const res = await getPurchaseInvoice();
    const list = res?.data || res;

    const exportRows = [];

    for (const invoice of list) {
      // get full details (important)
      const detail = await getPurchaseInvoiceById(invoice.id);

      detail.items?.forEach((item) => {
        exportRows.push({
          "Invoice No": detail.invoice_number,

          "Purchase Type": detail.purchase_type,
          "Bill Type": detail.bill_type,
          "Bill Mode": detail.bill_mode,
          "Waybill No": detail.waybill_no,
          "Status": detail.status,

          "Delivery Date": detail.delivery_date,
          "Invoice Date": detail.invoice_date,

          "Vendor Name": detail.vendor_name,
          "Plant Name": detail.plant_name,
          "Delivery Address": detail.delivery_address,

          "Item Name": item.item_name,
          "Item Code": item.hsn_code,
          "Qty": item.qty,
          "Free Qty": item.free_qty,
          "Total Qty": Number(item.qty || 0) + Number(item.free_qty || 0),
          "UOM": item.uom_details?.unit_name,
          "Rate": item.rate,
          "Dis %": item.dis_percent,
          "Dis Amt": item.dis_amount,
          "Gross Wt": item.gross_wt,
          "Gross Amount (₹)": item.gross_amount,

          "Total Qty (All Items)": detail.total_qty,

          "SGST %": detail.sgst_percent,
          "CGST %": detail.cgst_percent,
          "IGST %": detail.igst_percent,

          "SGST (₹)": detail.sgst_amount,
          "CGST (₹)": detail.cgst_amount,
          "IGST (₹)": detail.igst_amount,

          "Total GST (₹)": detail.total_gst_amount,
          "TCS Amt (₹)": detail.tcs_amount,
          "Total Amount (₹)": detail.total_amount,
        });
      });
    }

    exportToExcel(exportRows, "Purchase_Invoice_Details", "InvoiceData");

  } catch (error) {
    console.error("Export failed:", error);
    message.error("Export failed");
  }
};

  // Open edit modal
  const openEdit = async (record) => {
  try {
    setLoading(true);

    // 🔥 Call API by ID
    const invoice = await getPurchaseInvoiceById(record.id);

    setSelectedRecord(invoice);

    // Map backend response to form structure
    editForm.setFieldsValue({
      purchase_order: invoice.order,

      purchaseType: invoice.purchase_type,
      billType: invoice.bill_type,
      billMode: invoice.bill_mode,
      waybillNo: invoice.waybill_no,
      status: invoice.status,

      invoiceDate: invoice.invoice_date
        ? dayjs(invoice.invoice_date)
        : null,

      deliveryDate: invoice.delivery_date
        ? dayjs(invoice.delivery_date)
        : null,

      deliveryAddress: invoice.delivery_address,
      vendorName: invoice.vendor_name,
      plantName: invoice.plant_name,

      sgstPercent: invoice.sgst_percent,
      cgstPercent: invoice.cgst_percent,
      igstPercent: invoice.igst_percent,

      sgst: invoice.sgst_amount,
      cgst: invoice.cgst_amount,
      igst: invoice.igst_amount,

      totalGST: invoice.total_gst_amount,
      tcsAmt: invoice.tcs_amount,
totalQty: invoice.total_qty,


      totalAmount: invoice.total_amount,

      items: invoice.items.map((item) => ({
        product_id: item.product,
        itemName: item.item_name,
  // adjust if needed
        itemCode: item.hsn_code,
        qty: item.qty,
        freeQty: item.free_qty,
        uom: item.uom_details?.unit_name,

        rate: item.rate,
        discountPercent: item.dis_percent,
        discountAmount: item.dis_amount,
        grossWt: item.gross_wt,
        totalGrossWt: item.total_gross_wt,
        grossAmount: item.gross_amount,
      })),
    });

    setIsEditModalOpen(true);

  } catch (err) {
    message.error("Failed to fetch invoice details");
    console.error(err);
  } finally {
    setLoading(false);
  }
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

 
const handleFormSubmit = async (values) => {
  try {
    const items = values.items || [];
const payload = {
  order: values.purchase_order,

  vendor: isAddModalOpen
    ? selectedOrder?.vendor
    : selectedRecord?.vendor,

  invoice_date: values.invoiceDate
    ? dayjs(values.invoiceDate).format("YYYY-MM-DD")
    : null,


  delivery_date: values.deliveryDate
    ? dayjs(values.deliveryDate).format("YYYY-MM-DD")
    : null,

  delivery_address: values.deliveryAddress || "",
  order_number: selectedOrder?.order_number || "", // optional, for reference
  purchase_type: values.purchaseType || "",
  bill_type: values.billType || "",
  bill_mode: values.billMode || "",
  waybill_no: values.waybillNo || "",
  status: values.status || "",
  sgst_percent: values.sgstPercent || 0,
  cgst_percent: values.cgstPercent || 0,
  igst_percent: values.igstPercent || 0,

  sgst_amount: values.sgst || 0,        // ✅ not sgst
  cgst_amount: values.cgst || 0,        // ✅ not cgst
  igst_amount: values.igst || 0,        // ✅ not igst

  total_gst_amount: values.totalGST || 0,  // ✅ not total_gst
  tcs_amount: values.tcsAmt || 0,

  total_qty: values.totalQty || 0,
  total_amount: values.totalAmount || 0,

  items: (values.items || []).map((item) => ({
  product: item.product_id,   // 👈 VERY IMPORTANT
  qty: item.qty,
  free_qty: item.freeQty,
  uom: item.uom,
  rate: item.rate,
  dis_percent: item.discountPercent || 0,
  dis_amount: item.discountAmount || 0,
  gross_wt: item.grossWt || 0,
  total_gross_wt: item.totalGrossWt || 0,
  gross_amount: item.grossAmount || 0,
}))

};


    // 🔹 ADD INVOICE
    if (isAddModalOpen) {
      await addPurchaseInvoice(payload);
      message.success("Invoice added successfully!");
      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchPurchaseInvoices();
    }

    // 🔹 EDIT INVOICE
    if (isEditModalOpen && selectedRecord?.id) {
      await updatePurchaseInvoice(selectedRecord.id, payload);
      message.success("Invoice updated successfully!");
      setIsEditModalOpen(false);
      editForm.resetFields();
      fetchPurchaseInvoices();
    }

  } catch (error) {
    console.error(error);
    message.error("Something went wrong while saving invoice");
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
  label="Order No"
  name="purchase_order"
  rules={[{ required: true, message: "Please select Order No" }]}
>
  <Select
    placeholder="Select Order No"
    onChange={(val) => handleOrderSelect(val)}
  >
    {orderList.map((order) => (
      <Select.Option key={order.id} value={order.id}>
        {order.order_number}

      </Select.Option>
    ))}
  </Select>
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
        </Row>

        <Row gutter={24}>
         

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
            <Form.Item label="Delivery Date" name="deliveryDate">
              <DatePicker
  className="w-full"
  disabled
  format="YYYY-MM-DD"
/>

            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Vendor Name" name="vendorName">
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
                <Input disabled placeholder="Delivery address" />
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
                            <InputNumber className="w-full!" disabled/>
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Free Qty" name={[field.name, "freeQty"]}>
                            <InputNumber className="w-full!" disabled  />
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
                            <InputNumber className="w-full!" disabled />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Dis%" name={[field.name, "discountPercent"]}>
                            <InputNumber className="w-full!" disabled  />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item {...field} label="Gross Wt" name={[field.name, "grossWt"]}>
                            <InputNumber className="w-full!" disabled />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={24}>
                        

                        <Col span={6}>
                          <Form.Item {...field} label="Dis Amt" name={[field.name, "discountAmount"]}>
                            <InputNumber className="w-full! " disabled />
                          </Form.Item>
                        </Col>


                        <Col span={6}>
                          <Form.Item {...field} label="Gross Amount (₹)" name={[field.name, "grossAmount"]}>
                            <InputNumber className="w-full!" disabled />
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
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="SGST %" name="sgstPercent">
                  <InputNumber className="w-full!" disabled  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="CGST %" name="cgstPercent">
                  <InputNumber className="w-full!" disabled  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="IGST %" name="igstPercent">
                  <InputNumber className="w-full!" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="SGST (₹)" name="sgst">
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="CGST (₹)" name="cgst">
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="IGST (₹)" name="igst">
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Total GST (₹)" name="totalGST">
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="TCS Amt (₹)" name="tcsAmt">
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Total Amount (₹)" name="totalAmount" rules={[{ required: true }]}> 
                  <InputNumber className="w-full! " disabled />
                </Form.Item>
              </Col>
            </Row>
          </>
    
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
            onClick={handleExport}
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
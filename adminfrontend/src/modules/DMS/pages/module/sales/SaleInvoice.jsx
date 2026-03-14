import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Modal,
  Spin,
  message,
  Input,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
    PrinterOutlined,
    EditOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getEligibleOrders, getSalesOrderById ,getItemByOrderId,getInvoiceDropdownData,createInvoice,getInvoiceById,getInvoices,updateInvoice,downloadInvoicePDF,fetchInvoicePDF} from "../../../../../api/sales";

export default function SaleInvoice() {
  const [form] = Form.useForm();
  const [itemOptions, setItemOptions] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [orderOptions, setOrderOptions] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [itemsWithDelivery, setItemsWithDelivery] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingInvoiceId, setEditingInvoiceId] = useState(null);
const [editItems, setEditItems] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [editOrderId, setEditOrderId] = useState(null);
const [editItemOptions, setEditItemOptions] = useState([]);
const [editSelectedItems, setEditSelectedItems] = useState([]);
  useEffect(() => {
    fetchOrderOptions();
    fetchInvoices();
  }, []);

  /* ---------------- FETCH ORDERS ---------------- */

  const fetchOrderOptions = async () => {
    setLoadingOrders(true);
    try {
      const res = await getEligibleOrders();
     const options = (res || []).map((o) => ({
  value: o.sales_order_id,          // ✅ id sent to backend
  label: `${o.sales_order_number} - ${o.customer_name}`,  // ✅ visible in dropdown
}));
      setOrderOptions(options);
    } catch (err) {
      console.error("Failed to fetch sales orders:", err);
      message.error("Failed to load sales orders");
    } finally {
      setLoadingOrders(false);
    }
  };


const handlePrint = async (record) => {
  try {
    message.loading({
      content: `Preparing Invoice ${record.invoiceNumber} for print...`,
      key: "print",
    });

    // Fetch the PDF from your backend
    const pdfBlob = await fetchInvoicePDF(record.id); // must return Blob

    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    // Open in new tab
    const printWindow = window.open(blobUrl, "_blank");
    if (!printWindow) throw new Error("Popup blocked. Please allow popups.");

    message.success({
      content: `Invoice ${record.invoiceNumber} ready!`,
      key: "print",
      duration: 2,
    });

    // Optional: you can auto-call print after PDF loads
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (error) {
    console.error(error);
    message.error({
      content: "Failed to open invoice for printing",
      key: "print",
      duration: 2,
    });
  }
};

const fetchInvoices = async () => {
  try {
    const res = await getInvoices();

    const rows = (res || []).map((inv) => ({
      id: inv.id,
       sales_order_id: inv.sales_order_id,
      invoiceNumber: inv.sale_invoice_number,
      orderNumber: inv.order_number,
      customerName: inv.customer_name,
      invoiceDate: inv.invoice_date,

      // ✅ take directly from items
      deliveredAmount: inv.items?.[0]?.delivered_amount || 0,
      creditedQuantityAmount: inv.items?.[0]?.credited_amount || 0,
    }));

    setSavedInvoices(rows);

  } catch (error) {
    console.error(error);
    message.error("Failed to load invoices");
  }
};

const handleDownload = async (record) => {
  try {
    message.loading({ content: `Downloading Invoice ${record.invoiceNumber}...`, key: 'download' });
    await downloadInvoicePDF(record.id);
    message.success({ content: `Invoice ${record.invoiceNumber} downloaded!`, key: 'download', duration: 2 });
  } catch (error) {
    console.error(error);
    message.error({ content: `Failed to download invoice`, key: 'download', duration: 2 });
  }
};

  /* ---------------- ORDER SELECT ---------------- */

 const onOrderSelect = async (orderId) => {
  setSelectedOrderId(orderId);
  setItemOptions([]);
  setSelectedItem(null);

  if (!orderId) return;

  try {
    // ✅ fetch order details
    const order = await getSalesOrderById(orderId);
   setOrderDetails({
  ...order,
  delivery_date: order.delivery_date
});

    // ✅ fetch order items
    const items = await getItemByOrderId(orderId);

    const options = (items || []).map((item) => ({
      value: item.product_id,
      label: item.product_name,
    }));

    setItemOptions(options);
  } catch (err) {
    console.error(err);
    message.error("Failed to fetch order details");
  }
};

const onItemSelect = async (product_ids) => {
  try {
    setLoadingOrder(true);

   const res = await getInvoiceDropdownData(selectedOrderId, product_ids);

// ✅ SET DELIVERY DATE HERE
setOrderDetails(prev => ({
  ...prev,
  delivery_date: res.delivery_date
}));

const items = res?.items || res;

   const rows = items.map((item, index) => {
  const rate = Number(item.rate || 0);
  const deliveredQty = Number(item.suggested_delivered_qty || 0);
  const requiredQty = Number(item.required_qty || 0);
  const creditedQty = Math.max(0, requiredQty - deliveredQty);

  return {
    key: item.sales_order_item_id || index,
    itemId: item.sales_order_item_id,
    productId: item.product_id,
    productName: item.product_name,
    uom: item.uom_name || "-",
    rate,
    requiredQty,
    deliveredQty,
    creditedQty,
    deliveredAmount: deliveredQty * rate,   // ✅ added
    creditedAmount: creditedQty * rate      // ✅ added
  };
});

    setItemsWithDelivery(rows);

    // delivered qty autofill
    form.setFieldsValue({
      items: rows.map((r) => ({
        deliveredQty: r.deliveredQty,
      })),
    });

    // ✅ set today invoice date
    setInvoiceDate(dayjs());

  } catch (err) {
    console.error(err);
    message.error("Failed to load items");
  } finally {
    setLoadingOrder(false);
  }
};
  /* ---------------- DELIVERED CHANGE ---------------- */

// ---------- Step 1: reusable calculation ----------
const updateItemAmounts = (items, value, index) => {
  const numVal = Number(value) || 0;
  const next = [...items];
  const required = Number(next[index].requiredQty) || 0;
  const rate = Number(next[index].rate) || 0;
  const creditedQty = Math.max(0, required - numVal);

  next[index] = {
    ...next[index],
    deliveredQty: numVal,
    creditedQty,
    deliveredAmount: numVal * rate,
    creditedAmount: creditedQty * rate,
  };

  return next;
};


const onDeliveredQtyChange = (value, index) => {
  setItemsWithDelivery(prev => updateItemAmounts(prev, value, index));
};


  /* ---------------- TOTALS ---------------- */

const getTotals = (items) => {
  let totalAmount = 0;
  let creditedQuantityAmount = 0;

  items.forEach(row => {
    totalAmount += Number(row.deliveredAmount) || 0;
    creditedQuantityAmount += Number(row.creditedAmount) || 0;
  });

  return { totalAmount, creditedQuantityAmount };
};


 const { totalAmount, creditedQuantityAmount } = 
  orderDetails && itemsWithDelivery.length
    ? getTotals(itemsWithDelivery)
    : { totalAmount: 0, creditedQuantityAmount: 0 };

  /* ---------------- SAVE INVOICE ---------------- */
const handleSubmit = async (values) => {
  try {
    const order = await getSalesOrderById(selectedOrderId);

   const payload = {
  sales_order_id: selectedOrderId,
  customer_id: order.customer_id,
  invoice_date: invoiceDate
    ? invoiceDate.format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD"),

 items: itemsWithDelivery.map((row) => ({
  sales_order_item_id: row.itemId,
  product_id: row.productId,
  product_name: row.productName,
  uom_name: row.uom || null,
  required_qty: row.requiredQty,

  delivered_qty: row.deliveredQty,
  delivered_amount: row.deliveredAmount || 0,   // ✅ send

  credited_qty: row.creditedQty,
  credited_amount: row.creditedAmount || 0,     // ✅ send

  rate: row.rate
}))
};

    await createInvoice(payload);

    message.success("Invoice created successfully");
    fetchInvoices(); 
    closeModal();

  } catch (err) {
    console.error(err);
    message.error("Failed to create invoice");
  }
};
const onEditItemSelect = async (product_ids) => {
  try {
    const res = await getInvoiceDropdownData(editOrderId, product_ids);

    const items = res?.items || res;

    const rows = items.map((item, index) => {
      const rate = Number(item.rate || 0);
      const deliveredQty = Number(item.suggested_delivered_qty || 0);
      const requiredQty = Number(item.required_qty || 0);
      const creditedQty = Math.max(0, requiredQty - deliveredQty);

      return {
        key: item.sales_order_item_id || index,
        itemId: item.sales_order_item_id,
        productId: item.product_id,
        productName: item.product_name,
        uom: item.uom_name,
        rate,
        requiredQty,
        deliveredQty,
        creditedQty,
        deliveredAmount: deliveredQty * rate,
        creditedAmount: creditedQty * rate
      };
    });

    setEditItems(rows);
    setEditSelectedItems(product_ids);

  } catch (err) {
    console.error(err);
    message.error("Failed to load items");
  }
};
  /* ---------------- MODAL HELPERS ---------------- */
const handleEdit = async (record) => {
  try {
    const res = await getInvoiceById(record.id);

    setEditingInvoiceId(record.id);

    setEditOrderId(res.sales_order_id);

   

    // ✅ SET ORDER DETAILS (this is missing)
    setOrderDetails({
      order_number: res.order_number,
      order_date: res.order_date,
      delivery_date: res.delivery_date,
      invoice_date: res.invoice_date,
      customer: {
        name: res.customer_name
      }
    });

    // fetch items of order for dropdown
    const items = await getItemByOrderId(res.sales_order_id);

    const options = items.map((item) => ({
      value: item.product_id,
      label: item.product_name,
    }));

    setEditItemOptions(options);

    const selectedProducts = res.items.map((i) => i.product_id);
    setEditSelectedItems(selectedProducts);

    const rows = res.items.map((item, index) => {
      const rate = Number(item.rate || 0);
      const deliveredQty = Number(item.delivered_qty || 0);
      const requiredQty = Number(item.required_qty || 0);
      const creditedQty = Math.max(0, requiredQty - deliveredQty);

      return {
        key: index,
        itemId: item.sales_order_item_id,
        productId: item.product_id,
        productName: item.product_name,
        uom: item.uom_name,
        hsnCode: item.hsn_code,
        rate,
        requiredQty,
        deliveredQty,
        creditedQty,
        deliveredAmount: deliveredQty * rate,
        creditedAmount: creditedQty * rate
      };
    });

    setEditItems(rows);

    setIsEditModalOpen(true);

  } catch (error) {
    console.error(error);
    message.error("Failed to load invoice");
  }
};
const onEditDeliveredQtyChange = (value, index) => {
  setEditItems(prev => updateItemAmounts(prev, value, index));
};

const handleUpdateInvoice = async () => {
  try {

    const res = await getInvoiceById(editingInvoiceId);

    const payload = {
      sales_order_db_id: res.sales_order_db_id,
      sales_order_number: res.sales_order_number,
      order_date: res.order_date,
      invoice_date: invoiceDate.format("YYYY-MM-DD"),
      delivery_date: res.delivery_date,

      customer_id: res.customer_id,
      customer_name: res.customer_name,

      items: editItems.map((row) => ({
        sales_order_item_id: row.itemId,
        product_id: row.productId,
        product_name: row.productName,
        uom_name: row.uom,
        hsn_code: row.hsnCode,

        rate: row.rate,
        required_qty: row.requiredQty,

        delivered_qty: row.deliveredQty,
        delivered_amount: row.deliveredAmount,

        credited_qty: row.creditedQty,
        credited_amount: row.creditedAmount
      }))
    };

    await updateInvoice(editingInvoiceId, payload);

    message.success("Invoice updated successfully");

    fetchInvoices();

    setIsEditModalOpen(false);

  } catch (error) {
    console.error(error);
    message.error("Update failed");
  }
};
  const openModal = () => {
    setSelectedOrderId(undefined);
    setOrderDetails(null);
    setItemsWithDelivery([]);
    form.resetFields();
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setSelectedOrderId(undefined);
    setOrderDetails(null);
    setItemsWithDelivery([]);
    form.resetFields();
  };

  /* ---------------- ITEMS TABLE COLUMNS ---------------- */

  const itemColumns = [
    {
      title: <span className="text-amber-700 font-semibold">Item</span>,
      dataIndex: "productName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">UOM</span>,
      dataIndex: "uom",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Rate</span>,
      dataIndex: "rate",
      render: (n) => (
        <span className="text-amber-800 font-medium">
          {Number(n) != null && !Number.isNaN(Number(n))
            ? Number(n).toFixed(2)
            : "0.00"}
        </span>
      ),
    },
   {
  title: <span className="text-amber-700 font-semibold">Required Qty</span>,
  dataIndex: "requiredQty",
  render: (n) => (
    <span className="text-amber-800 font-medium">{Number(n) ?? 0}</span>
  ),
},
{
  title: <span className="text-amber-700 font-semibold">Delivered Qty</span>,
  key: "deliveredQty",
  render: (_, record, index) => (
    <Form.Item
      name={["items", index, "deliveredQty"]}
      rules={[
        { required: true, message: "Enter delivered quantity" },
        {
          validator: (_, value) => {
            if (value > record.requiredQty) {
              return Promise.reject(
                "Delivered quantity can't be greater than required quantity"
              );
            }
            return Promise.resolve();
          },
        },
      ]}
      style={{ marginBottom: 0 }}
    >
      <InputNumber
        min={0}
        className="w-full"
        placeholder="0"
        onChange={(v) => onDeliveredQtyChange(v, index)}
      />
    </Form.Item>
  ),
},
    {
      title: <span className="text-amber-700 font-semibold">Credited Qty</span>,
      dataIndex: "creditedQty",
      render: (_, row) => {
        const credited = Number(row.creditedQty ?? 0);
        if (credited <= 0) return <span className="text-amber-600">-</span>;
        return <span className="text-red-600 font-medium">{credited}</span>;
      },
    },
  ];

  /* ---------------- INVOICE LIST COLUMNS ---------------- */

  const invoiceColumns = [
   {
  title: <span className="text-amber-700 font-semibold">Invoice </span>,
  dataIndex: "invoiceNumber",
  render: (t) => <span className="text-amber-800">{t}</span>,
},
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "orderNumber",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customerName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Date</span>,
      dataIndex: "invoiceDate",
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("DD-MM-YYYY") : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Deliverd Amount</span>,
      dataIndex: "deliveredAmount",
      render: (n) => (
        <span className="text-amber-800 font-medium">
          {n}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Credited Amount
        </span>
      ),
      dataIndex: "creditedQuantityAmount",
      render: (n) => (
        <span className="text-amber-800 font-medium"
          >{n}
        </span>
      ),
    },
  {
  title: <span className="text-amber-700 font-semibold">Action</span>,
  key: "action",
  render: (_, record) => (
    <div className="flex gap-2">

      <EditOutlined
        size="small"
        onClick={() => handleEdit(record)}
        className=" text-blue-500!"
      >
        Edit
      </EditOutlined>

      <DownloadOutlined
       
        size="small"
        onClick={() => handleDownload(record)}
        className=" text-amber-500!"
      />

      <PrinterOutlined
        
        size="small"
        onClick={() => handlePrint(record)}
        className="text-green-500!"
      />
    </div>
  ),
}
  ];

  /* ---------------- UI ---------------- */

  return (
    <div>
      {/* HEADER */}
     <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
           // value={searchText}
           onChange={(e) => handleSearch(e.target.value)}   />
         <Button
  icon={<FilterOutlined />}
  onClick={() => {
    setSearchText("");
   // fetchSalesOrders(); // ✅ reload original data
  }}
  className="border-amber-400! text-amber-700! hover:bg-amber-100!"
>
  Reset
</Button>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
           // onClick={handleExport}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={openModal}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* INVOICES TABLE CARD */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
       

      <Table
  columns={invoiceColumns}
  dataSource={savedInvoices}
  rowKey="id"
  scroll={{ x: 700 }}
  pagination={savedInvoices.length > 10 ? { pageSize: 10 } : false}
/>
      </div>

      {/* ADD INVOICE MODAL */}
      <Modal
        title={
          <span className="text-amber-700 font-semibold text-base">
            Create Sales Invoice
          </span>
        }
        open={isAddModalOpen}
        footer={null}
        width={960}
        onCancel={closeModal}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Order Select */}
          <Row gutter={16}>
            <Col md={8}>
              <Form.Item
                label={
                  <span className="text-amber-700 font-medium">
                    Sales Order
                  </span>
                }
                name="orderId"
                rules={[
                  { required: true, message: "Please select a sales order" },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  placeholder="Select Sales Order"
                  loading={loadingOrders}
                  optionFilterProp="label"
                  options={orderOptions}
                  onChange={onOrderSelect}
                  filterOption={(input, opt) =>
                    (opt?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col md={8}><Form.Item
  label={<span className="text-amber-700 font-medium">Item</span>}
  name="itemId"
  rules={[{ required: true, message: "Select item" }]}
>
 <Select
  mode="multiple"
  placeholder="Select Items"
  options={itemOptions}
  onChange={onItemSelect}
/>
</Form.Item></Col>
          </Row>

          {/* Loading */}
         {loadingOrder && (
  <div className="flex justify-center py-8">
    <Spin size="large" />
  </div>
)}

          {/* Order details + items */}
         {!loadingOrder && itemsWithDelivery.length > 0 && (
            <>
              {/* Order Details Card */}
              <Card
                size="small"
                className="mb-4 border-amber-200 bg-amber-50/50"
                title={
                  <span className="text-amber-800 font-semibold">
                    Order Details
                  </span>
                }
              >
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12} md={4}>
                    <span className="text-amber-600 text-sm">Order No</span>
                    <p className="text-amber-800 font-medium mb-0">
                     {orderDetails?.order_number || "-"}
                    </p>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <span className="text-amber-600 text-sm">Order Date</span>
                    <p className="text-amber-800 font-medium mb-0">
                     {orderDetails?.order_date
  ? dayjs(orderDetails.order_date).format("DD-MM-YYYY")
  : "-"}
                    </p>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <span className="text-amber-600 text-sm">
                      Delivery Date
                    </span>
                  <p className="text-amber-800 font-medium mb-0">
  {orderDetails?.delivery_date
    ? dayjs(orderDetails.delivery_date).format("DD-MM-YYYY")
    : "-"}
</p>
                  </Col>
<Col xs={24} sm={12} md={4}>
  <span className="text-amber-600 text-sm">Invoice Date</span>
  <p className="text-amber-800 font-medium mb-0">
    {invoiceDate ? invoiceDate.format("DD-MM-YYYY") : "-"}
  </p>
</Col>
                  <Col xs={24} sm={12} md={6}>
                    <span className="text-amber-600 text-sm">Customer</span>
                    <p className="text-amber-800 font-medium mb-0">
                     {orderDetails?.customer?.name || "-"}
                    </p>
                  </Col>
                           
                
                </Row>
              </Card>

              {/* Items Table */}
              <div className="mb-4">
                <h3 className="text-amber-700 font-semibold mb-2">
                  Items – Required vs Delivered
                </h3>
                <Table
                  columns={itemColumns}
                  dataSource={itemsWithDelivery}
                  pagination={false}
                  scroll={{ x: 700 }}
                  rowKey="key"
                />
              </div>

              {/* Totals Card */}
              <Card
                size="small"
                className="mb-4 border-amber-200 bg-amber-50/30"
              >
                <Row gutter={24}>
                  <Col xs={24} sm={12} md={8}>
                    <span className="text-amber-600 block text-sm">
                      Delivered Amount
                    </span>
                    <span className="text-amber-800 text-xl font-semibold">
                      {totalAmount.toFixed(2)}
                    </span>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <span className="text-amber-600 block text-sm">
                      Credited Amount
                    </span>
                    <span
                      className={
                        creditedQuantityAmount > 0
                          ? "text-red-600 text-xl font-semibold"
                          : "text-amber-800 text-xl font-semibold"
                      }
                    >
                      {creditedQuantityAmount.toFixed(2)}
                    </span>
                  </Col>
                </Row>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  onClick={closeModal}
                  className="border-amber-400! text-amber-700! hover:bg-amber-100!"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                   className="bg-amber-500! hover:bg-amber-600! border-none!"
                >
                  Save Invoice
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal>
    <Modal
  title={
    <span className="text-amber-700 font-semibold text-base">
      Edit Sales Invoice
    </span>
  }
  open={isEditModalOpen}
  width={960}
  onCancel={() => setIsEditModalOpen(false)}
  footer={null}
  destroyOnClose
>
  <Form layout="vertical">
    <Row gutter={16}>
  <Col md={8}>
    <Form.Item label="Sales Order">
      <Select
        value={editOrderId}
        options={orderOptions}
        disabled
      />
    </Form.Item>
  </Col>

  <Col md={8}>
    <Form.Item label="Item">
      <Select
        mode="multiple"
        value={editSelectedItems}
        options={editItemOptions}
        onChange={onEditItemSelect}
      />
    </Form.Item>
  </Col>
</Row>
    {/* Order Details Card */}
    <Card
      size="small"
      className="mb-4 border-amber-200 bg-amber-50/50"
      title={<span className="text-amber-800 font-semibold">Order Details</span>}
    >
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={12} md={4}>
          <span className="text-amber-600 text-sm">Order No</span>
          <p className="text-amber-800 font-medium mb-0">
            {orderDetails?.order_number || "-"}
          </p>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <span className="text-amber-600 text-sm">Order Date</span>
          <p className="text-amber-800 font-medium mb-0">
            {orderDetails?.order_date
              ? dayjs(orderDetails.order_date).format("DD-MM-YYYY")
              : "-"}
          </p>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <span className="text-amber-600 text-sm">Delivery Date</span>
          <p className="text-amber-800 font-medium mb-0">
            {orderDetails?.delivery_date
              ? dayjs(orderDetails.delivery_date).format("DD-MM-YYYY")
              : "-"}
          </p>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <span className="text-amber-600 text-sm">Invoice Date</span>
          <DatePicker
            value={invoiceDate}
            onChange={(d) => setInvoiceDate(d)}
            className="w-full"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <span className="text-amber-600 text-sm">Customer</span>
          <p className="text-amber-800 font-medium mb-0">
            {orderDetails?.customer?.name || "-"}
          </p>
        </Col>
      </Row>
    </Card>

    {/* Items Table */}
    <div className="mb-4">
      <h3 className="text-amber-700 font-semibold mb-2">
        Items – Required vs Delivered
      </h3>
      <Table
        columns={[
          { title: "Item", dataIndex: "productName" },
          { title: "UOM", dataIndex: "uom" },
          { title: "HSN Code", dataIndex: "hsnCode" },
          { title: "Rate", dataIndex: "rate" },
          { title: "Required Qty", dataIndex: "requiredQty" },
          {
            title: "Delivered Qty",
            render: (_, record, index) => (
              <InputNumber
                min={0}
                value={record.deliveredQty}
                onChange={(v) => onEditDeliveredQtyChange(v, index)}
              />
            ),
          },
          { title: "Credited Qty", dataIndex: "creditedQty" },
          { title: "Delivered Amount", dataIndex: "deliveredAmount" },
          { title: "Credited Amount", dataIndex: "creditedAmount" },
        ]}
        dataSource={editItems}
        pagination={false}
        rowKey="key"
      />
    </div>

    {/* Totals Card */}
    <Card size="small" className="mb-4 border-amber-200 bg-amber-50/30">
      <Row gutter={24}>
        <Col xs={24} sm={12} md={8}>
          <span className="text-amber-600 block text-sm">Delivered Amount</span>
          <span className="text-amber-800 text-xl font-semibold">
            {editItems.reduce((sum, r) => sum + r.deliveredAmount, 0).toFixed(2)}
          </span>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <span className="text-amber-600 block text-sm">Credited Amount</span>
          <span
            className={
              editItems.reduce((sum, r) => sum + r.creditedAmount, 0) > 0
                ? "text-red-600 text-xl font-semibold"
                : "text-amber-800 text-xl font-semibold"
            }
          >
            {editItems.reduce((sum, r) => sum + r.creditedAmount, 0).toFixed(2)}
          </span>
        </Col>
      </Row>
    </Card>

    {/* Actions */}
    <div className="flex justify-end gap-2">
      <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
      <Button
        type="primary"
        onClick={handleUpdateInvoice}
        className="bg-amber-500! hover:bg-amber-600!"
      >
        Update Invoice
      </Button>
    </div>
  </Form>
</Modal>

    </div>
  );
}

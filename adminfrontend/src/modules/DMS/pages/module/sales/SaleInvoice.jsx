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
    PrinterOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getSalesOrders, getSalesOrderById ,getItemByOrderId,getInvoiceDropdownData,createInvoice,getInvoiceById,getInvoices,updateInvoice} from "../../../../../api/sales";

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

  const [selectedOrderId, setSelectedOrderId] = useState(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchOrderOptions();
  }, []);

  /* ---------------- FETCH ORDERS ---------------- */

  const fetchOrderOptions = async () => {
    setLoadingOrders(true);
    try {
      const res = await getSalesOrders();
      const options = (res || []).map((o) => ({
        value: o.sales_order_id,
        label: `${o.order_number || o.sales_order_id}${
          o.customer?.name ? ` - ${o.customer.name}` : ""
        }`,
      }));
      setOrderOptions(options);
    } catch (err) {
      console.error("Failed to fetch sales orders:", err);
      message.error("Failed to load sales orders");
    } finally {
      setLoadingOrders(false);
    }
  };
const handleDownload = (record) => {
  message.success(`Downloading Invoice ${record.id}`);
  console.log("Download invoice:", record);
};

const handlePrint = (record) => {
  message.success(`Printing Invoice ${record.id}`);
  console.log("Print invoice:", record);
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
    setOrderDetails(order);

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

const onDeliveredQtyChange = (value, index) => {
  const numVal = Number(value) || 0;

  setItemsWithDelivery((prev) => {
    const next = [...prev];

    if (next[index]) {
      const required = Number(next[index].requiredQty) || 0;
      const rate = Number(next[index].rate) || 0;

      const creditedQty = Math.max(0, required - numVal);

      next[index] = {
        ...next[index],
        deliveredQty: numVal,
        creditedQty,
        deliveredAmount: numVal * rate,   // ✅ stored
        creditedAmount: creditedQty * rate // ✅ stored
      };
    }

    return next;
  });
};

  /* ---------------- TOTALS ---------------- */

 const getTotals = () => {
  let totalAmount = 0;
  let creditedQuantityAmount = 0;

  itemsWithDelivery.forEach((row) => {
    const delivered = parseFloat(row.deliveredQty) || 0;
    const rate = parseFloat(row.rate) || 0;
    const credited = parseFloat(row.creditedQty) || 0;

    totalAmount += delivered * rate;
    creditedQuantityAmount += credited * rate;
  });

  return { totalAmount, creditedQuantityAmount };
};

  const { totalAmount, creditedQuantityAmount } =
    orderDetails && itemsWithDelivery.length
      ? getTotals()
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
    closeModal();

  } catch (err) {
    console.error(err);
    message.error("Failed to create invoice");
  }
};

  /* ---------------- MODAL HELPERS ---------------- */

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
      title: <span className="text-amber-700 font-semibold">Invoice #</span>,
      dataIndex: "id",
      render: (id) => <span className="text-amber-800">{id}</span>,
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
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount",
      render: (n) => (
        <span className="text-amber-800 font-medium">
          {Number(n) != null ? Number(n).toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Credited Qty Amount
        </span>
      ),
      dataIndex: "creditedQuantityAmount",
      render: (n) => (
        <span
          className={
            Number(n) > 0 ? "text-red-600 font-semibold" : "text-amber-600"
          }
        >
          {Number(n) != null ? Number(n).toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
  title: <span className="text-amber-700 font-semibold">Action</span>,
  key: "action",
  render: (_, record) => (
    <div className="flex gap-2">
      <Button
        icon={<DownloadOutlined />}
        size="small"
        onClick={() => handleDownload(record)}
        className="bg-amber-500! text-white!" 
      >
       
      </Button>

      <Button
        icon={<PrinterOutlined />}
        size="small"
        onClick={() => handlePrint(record)}
        className="bg-green-600! text-white!"
      >
       
      </Button>
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
                     {orderDetails?.expected_receiving_date
  ? dayjs(orderDetails.expected_receiving_date).format("DD-MM-YYYY")
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
    </div>
  );
}

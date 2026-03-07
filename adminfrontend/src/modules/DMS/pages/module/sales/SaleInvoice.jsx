// SaleInvoice.jsx – Final merged component
// Design: amber theme from design file | Functionality: modal-based from first + full detail from second
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
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getSalesOrders, getSalesOrderById } from "../../../../../api/sales";

export default function SaleInvoice() {
  const [form] = Form.useForm();

  const [savedInvoices, setSavedInvoices] = useState([]);
  const [orderOptions, setOrderOptions] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [itemsWithDelivery, setItemsWithDelivery] = useState([]);

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

  /* ---------------- ORDER SELECT ---------------- */

  const onOrderSelect = async (orderId) => {
    setSelectedOrderId(orderId);
    setOrderDetails(null);
    setItemsWithDelivery([]);

    if (!orderId) return;

    setLoadingOrder(true);
    try {
      const order = await getSalesOrderById(orderId);
      setOrderDetails(order);

      const items = (order.items || []).map((item, index) => ({
        key: item.id ?? index,
        itemId: item.id,
        productName: item.product_name || item.product_name_master || "-",
        uom: item.uom?.unit_name || "-",
        rate: Number(item.rate ?? 0),
        requiredQty: Number(item.ordered_qty ?? item.net_qty ?? 0),
        deliveredQty: undefined,
        creditedQty: 0,
      }));

      setItemsWithDelivery(items);
      form.setFieldsValue({
        orderId,
        items: items.map((i) => ({ deliveredQty: i.deliveredQty })),
      });
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      message.error("Failed to load order details");
      setSelectedOrderId(undefined);
    } finally {
      setLoadingOrder(false);
    }
  };

  /* ---------------- DELIVERED CHANGE ---------------- */

  const onDeliveredQtyChange = (value, index) => {
    const numVal = value ?? 0;
    setItemsWithDelivery((prev) => {
      const next = [...prev];
      if (next[index]) {
        const required = next[index].requiredQty ?? 0;
        next[index] = {
          ...next[index],
          deliveredQty: numVal,
          creditedQty: Math.max(0, required - numVal),
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
      const delivered = Number(row.deliveredQty ?? 0);
      const rate = Number(row.rate ?? 0);
      const credited = Number(row.creditedQty ?? 0);
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

  const handleSubmit = (values) => {
    const items = (values.items || []).map((item, i) => {
      const row = itemsWithDelivery[i] || {};
      const delivered = item?.deliveredQty ?? 0;
      const required = row.requiredQty ?? 0;
      const creditedQty = Math.max(0, required - delivered);
      return {
        ...row,
        deliveredQty: delivered,
        creditedQty,
        lineAmount: delivered * (row.rate ?? 0),
        creditedAmount: creditedQty * (row.rate ?? 0),
      };
    });

    const { totalAmount, creditedQuantityAmount } = getTotals();

    const newInvoice = {
      id: Date.now(),
      orderId: selectedOrderId,
      orderNumber: orderDetails?.order_number || "-",
      customerName: orderDetails?.customer?.name || "-",
      invoiceDate: dayjs().format("YYYY-MM-DD"),
      items,
      totalAmount,
      creditedQuantityAmount,
    };

    setSavedInvoices((prev) => [newInvoice, ...prev]);
    message.success("Invoice saved");

    closeModal();
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
      title: (
        <span className="text-amber-700 font-semibold">Delivered Qty</span>
      ),
      key: "deliveredQty",
      render: (_, __, index) => (
        <Form.Item
          name={["items", index, "deliveredQty"]}
          rules={[{ required: true, message: "Required" }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={0}
            className="w-full border-amber-300 focus:border-amber-500"
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
  ];

  /* ---------------- UI ---------------- */

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-amber-700 mb-0">
            Sales Invoices
          </h2>
          <p className="text-amber-600 mb-0">Manage your sales invoices</p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchOrderOptions}
          loading={loadingOrders}
          className="border-amber-400 text-amber-700 hover:bg-amber-100"
        >
          Refresh Orders
        </Button>
      </div>

      {/* INVOICES TABLE CARD */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-amber-700 font-semibold mb-0">Saved Invoices</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500 hover:bg-amber-600 border-none"
            onClick={openModal}
          >
            Add Invoice
          </Button>
        </div>

        <Table
          columns={invoiceColumns}
          dataSource={savedInvoices}
          rowKey="id"
          scroll={{ x: 700 }}
          pagination={savedInvoices.length > 10 ? { pageSize: 10 } : false}
          locale={{
            emptyText: "No invoices yet. Click 'Add Invoice' to create one.",
          }}
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
            <Col xs={24} md={14}>
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
          </Row>

          {/* Loading */}
          {loadingOrder && (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          )}

          {/* Order details + items */}
          {!loadingOrder && orderDetails && (
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
                  <Col xs={24} sm={12} md={6}>
                    <span className="text-amber-600 text-sm">Order No</span>
                    <p className="text-amber-800 font-medium mb-0">
                      {orderDetails.order_number || "-"}
                    </p>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <span className="text-amber-600 text-sm">Order Date</span>
                    <p className="text-amber-800 font-medium mb-0">
                      {orderDetails.order_date
                        ? dayjs(orderDetails.order_date).format("DD-MM-YYYY")
                        : "-"}
                    </p>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <span className="text-amber-600 text-sm">
                      Delivery Date
                    </span>
                    <p className="text-amber-800 font-medium mb-0">
                      {orderDetails.expected_receiving_date
                        ? dayjs(orderDetails.expected_receiving_date).format(
                            "DD-MM-YYYY",
                          )
                        : "-"}
                    </p>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <span className="text-amber-600 text-sm">Customer</span>
                    <p className="text-amber-800 font-medium mb-0">
                      {orderDetails.customer?.name || "-"}
                    </p>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <span className="text-amber-600 text-sm">Status</span>
                    <p className="mb-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                          orderDetails.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : orderDetails.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {orderDetails.status || "-"}
                      </span>
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
                      Total Amount
                    </span>
                    <span className="text-amber-800 text-xl font-semibold">
                      {totalAmount.toFixed(2)}
                    </span>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <span className="text-amber-600 block text-sm">
                      Credited Quantity Amount
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
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FileTextOutlined />}
                  className="bg-amber-500 hover:bg-amber-600 border-none"
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

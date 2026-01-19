// DeliveryStatus.jsx
import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const deliveryStatusJSON = {
  records: [
    {
      key: 1,
      invoiceNo: "INV-PO-001",
      itemName: "Laptop",
      itemCode: "IT1",
      quantity: 10,
      totalAmount: 50000,
      companyName: "ABC Traders",
      plantName: "Tech World Pvt Ltd",
      plantCode: "PC1",
      dispatchDate: "2025-10-10",
      deliveredDate: "2025-10-19",
      transporter: "ABC Logistics",
      deliveryDate: "2025-10-13",
      vehicleNo: "OD-05-AB-1234",
      driverName: "Rajesh Kumar",
      phoneNo: "9876543210",
      route: "Bhubaneswar to Cuttack",
      status: "In-Transit",
      uom: "Ltr",
    },
    {
      key: 2,
      invoiceNo: "INV-PO-002",
      itemName: "Desktop",
      itemCode: "IT2",
      quantity: 5,
      totalAmount: 25000,
      companyName: "XYZ Ltd",
      plantName: "Compute Store",
      plantCode: "PC2",
      dispatchDate: "2025-10-12",
      deliveredDate: "2025-10-20",
      transporter: "XYZ Logistics",
      deliveryDate: "2025-10-15",
      vehicleNo: "OD-06-XY-4567",
      driverName: "Suresh Patel",
      phoneNo: "9876543211",
      route: "Cuttack to Puri",
      status: "Delivered",
      uom: "Kg",
    },
  ],
  uomOptions: ["Ltr", "Kg", "Ton"],
  statusOptions: ["In-Transit", "Delivered", "Loading"],
  routeOptions: [
    "Bhubaneswar to Cuttack",
    "Cuttack to Puri",
    "Puri to Bhubaneswar",
    "Bhubaneswar to Rourkela",
  ],
};

export default function DeliveryStatus() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editform] = Form.useForm();
  const [addForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [data, setData] = useState(deliveryStatusJSON.records);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setData(deliveryStatusJSON.records);
      return;
    }
    const filtered = deliveryStatusJSON.records.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value.toLowerCase())
    );
    setData(filtered);
  };

  // 🧾 Handle selecting order
  const handleOrderSelect = (invoiceNo, formInstance) => {
    const selectedOrder = deliveryStatusJSON.records.find(
      (rec) => rec.invoiceNo === invoiceNo
    );
    if (selectedOrder) {
      formInstance.setFieldsValue({
        itemName: selectedOrder.itemName,
        itemCode: selectedOrder.itemCode,
        quantity: selectedOrder.quantity,
        uom: selectedOrder.uom,
        totalAmount: selectedOrder.totalAmount,
        companyName: selectedOrder.companyName,
        plantName: selectedOrder.plantName,
        plantCode: selectedOrder.plantCode,

        deliveryDate: dayjs(selectedOrder.deliveryDate),
      });
    }
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoiceNo",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Company</span>,
      dataIndex: "companyName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Item</span>,
      dataIndex: "itemName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Qty</span>,
      render: (_, r) => (
        <span className="text-amber-800">
          {r.quantity} {r.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      render: (status) => {
        const base = "px-2 py-1 rounded-full text-sm font-medium";
        const color =
          status === "Delivered"
            ? "bg-green-100 text-green-700"
            : status === "In-Transit"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700";
        return <span className={`${base} ${color}`}>{status}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer text-blue-500"
            onClick={() => {
              viewForm.resetFields();
              setSelectedRecord(record);
              viewForm.setFieldsValue({
                ...record,
                dispatchDate: dayjs(record.dispatchDate),
                deliveryDate: dayjs(record.deliveryDate),
                deliveredDate: dayjs(record.deliveredDate),
              });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer text-red-500"
            onClick={() => {
              editform.resetFields();
              setSelectedRecord(record);
              editform.setFieldsValue({
                ...record,
                dispatchDate: dayjs(record.dispatchDate),
                deliveryDate: dayjs(record.deliveryDate),
                deliveredDate: dayjs(record.deliveredDate),
              });
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleAdd = (values) => {
    const newRecord = {
      ...values,
      key: data.length + 1,
      dispatchDate: values.dispatchDate.format("YYYY-MM-DD"),
      deliveryDate: values.deliveryDate.format("YYYY-MM-DD"),
      deliveredDate: values.deliveredDate.format("YYYY-MM-DD"),
    };
    setData([...data, newRecord]);
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleFormSubmit = (values) => {
    const updated = {
      ...values,
      dispatchDate: values.dispatchDate.format("YYYY-MM-DD"),
      deliveryDate: values.deliveryDate.format("YYYY-MM-DD"),
      deliveredDate: values.deliveredDate.format("YYYY-MM-DD"),
    };
    setData((prev) =>
      prev.map((i) =>
        i.key === selectedRecord.key ? { ...updated, key: i.key } : i
      )
    );
    setIsEditModalOpen(false);
    editform.resetFields();
  };

  const renderFormFields = (disabled = false, formInstance) => (
    <Row gutter={16}>
      <Col span={24}>
        <h6 className="text-amber-500 ">Order Details</h6>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Invoice No"
          name="invoiceNo"
          rules={[{ required: !disabled, message: "Select invoice No" }]}
        >
          <Select
            disabled={disabled}
            onChange={(v) => handleOrderSelect(v, formInstance)}
          >
            {deliveryStatusJSON.records.map((r) => (
              <Select.Option key={r.invoiceNo} value={r.invoiceNo}>
                {r.invoiceNo}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Item Name" name="itemName">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col className={6}>
        <Form.Item label="Item Code" name="itemCode">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label="Quantity" name="quantity">
          <InputNumber className="w-full" disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="UOM" name="uom">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Total Amount" name="totalAmount">
          <InputNumber className="w-full" disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Company" name="companyName">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Plant Name" name="plantName">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col className={6}>
        <Form.Item label="Plant Code" name="plantCode">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Delivery Date" name="deliveryDate">
          <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
        </Form.Item>
      </Col>

      <Col span={24}>
        <h6 className="text-amber-500 ">Transport Details</h6>
      </Col>

      <Col span={6}>
        <Form.Item label="Dispatch Date" name="dispatchDate">
          <DatePicker
            className="w-full"
            format="DD-MM-YYYY"
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Delivered Date" name="deliveredDate">
          <DatePicker
            className="w-full"
            format="DD-MM-YYYY"
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Vehicle No" name="vehicleNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Driver Name" name="driverName">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Phone No" name="phoneNo">
          <InputNumber className="w-full" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Route" name="route">
          <Select disabled={disabled}>
            {deliveryStatusJSON.routeOptions.map((r) => (
              <Select.Option key={r} value={r}>
                {r}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Transporter" name="transporter">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Status" name="status">
          <Select disabled={disabled}>
            {deliveryStatusJSON.statusOptions.map((s) => (
              <Select.Option key={s} value={s}>
                {s}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {" "}
          <Input
            prefix={<SearchOutlined className="text-amber-600" />}
            placeholder="Search..."
            className="w-64 border-amber-300 focus:border-amber-500"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />{" "}
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
            onClick={() => handleSearch("")}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Export
          </Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            className="bg-amber-500 hover:bg-amber-600 border-none"
            onClick={() => {
              addForm.resetFields();
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Delivery Status
        </h2>
        <p className="text-amber-600 mb-3">
          Manage your Purchase Delivery Status records
        </p>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 300 }}
        />
      </div>
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add Purchase Delivery Status
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form layout="vertical" form={addForm} onFinish={handleAdd}>
          {renderFormFields(false, addForm)}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 hover:bg-amber-600 border-none"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            Edit Purchase Delivery Status
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editform.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form layout="vertical" form={editform} onFinish={handleFormSubmit}>
          {renderFormFields(false, editform)}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 hover:bg-amber-600 border-none"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Purchase Delivery Status
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true, viewForm)}
        </Form>
      </Modal>
    </div>
  );
}

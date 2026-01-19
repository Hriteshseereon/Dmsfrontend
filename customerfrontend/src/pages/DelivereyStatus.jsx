// DeliveryStatus.jsx
import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, Row, Col } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// 🔹 Sample Data
const deliveryDataJSON = {
  initialData: [
    {
      key: 1,
      orderNo: "SC-001",
      companyName: "ABC Oils Ltd",
      itemName: "Sunflower Oil",
      transporter: "Blue Transport",
      vehicleNo: "OD-02-1234",
      driverName: "Ramesh Kumar",
      contactNo: "9876543210",
      dispatchDate: "2025-10-10",
      deliveryDate: "2025-10-12",
      deliveredDate: "2025-10-12",
      status: "Delivered",
      route: "Cuttack → Bhubaneswar",
      totalQty: 2100,
      uom: "Ltrs",
      totalAmount: 420000,
    },
    {
      key: 2,
      orderNo: "SC-002",
      companyName: "XYZ Oils Ltd",
      itemName: "Mustard Oil",
      transporter: "Red Transport",
      vehicleNo: "OD-02-1234",
      driverName: "Ramesh Kumar",
      contactNo: "9876543210",
      dispatchDate: "2025-10-10",
      deliveryDate: "2025-10-12",
      deliveredDate: "2025-10-12",
      status: "In Transit",
      route: "Cuttack → Bhubaneswar",
      totalQty: 2100,
      uom: "Ltrs",
      totalAmount: 420000,
    },

  ],
};

export default function DeliveryStatus() {
  const [data] = useState(deliveryDataJSON.initialData);
  const [searchText, setSearchText] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewForm] = Form.useForm();

  const filteredData = data.filter(
    (item) =>
      item.orderNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.companyName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.route?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: <span className="text-amber-700 font-semibold">Order No</span>, dataIndex: "orderNo", width: 100, render: (text) => <span className="text-amber-800">{text}</span> },
    { title: <span className="text-amber-700 font-semibold">Company Name </span>, dataIndex: "companyName", width: 100, render: (text) => <span className="text-amber-800">{text}</span> },
    {
      title: <span className="text-amber-700 font-semibold">Transporter</span>,
      dataIndex: "transporter",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    { title: <span className="text-amber-700 font-semibold">Item</span>, dataIndex: "itemName", width: 100, render: (text) => <span className="text-amber-800">{text || "—"}</span> },

    {
      title: (
        <span className="text-amber-700 font-semibold">Quantity</span>
      ),
      width: 100,
      render: (_, record) => (
        <span className="text-amber-800">
          {record.totalQty} {record.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount",
      width: 100,
      render: (t) => <span className="text-amber-800">₹{t}</span>,
    }, {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        switch (status) {
          case "Delivered": return <span className={`${base} bg-green-100 text-green-700`}>{status}</span>;
          case "In Transit": return <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>;
          case "Pending": return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
          case "Delayed": return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
          default: return <span className={`${base} bg-amber-100 text-amber-700`}>{status}</span>;
        }
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 80,
      render: (record) => (
        <EyeOutlined
          className="cursor-pointer! text-blue-500!"
          onClick={() => {
            setSelectedRecord(record);
            viewForm.setFieldsValue({
              ...record,
              dispatchDate: record.dispatchDate ? dayjs(record.dispatchDate) : null,
              deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
              deliveredDate: record.deliveredDate ? dayjs(record.deliveredDate) : null,
            });
            setIsViewModalOpen(true);
          }}
        />
      ),
    },
  ];
  const renderViewFields = () => (
    <div>
      {/* 🔹 Order Details Section */}
      <h6 className=" text-amber-500 ">Order Details</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Order No">
            <Input value={selectedRecord?.orderNo} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Item Name">
            <Input value={selectedRecord?.itemName} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Quantity">
            <Input value={selectedRecord?.totalQty} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="UOM">
            <Input value={selectedRecord?.uom} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Total Amount">
            <Input
              value={`₹${selectedRecord?.totalAmount?.toLocaleString()}`}
              disabled
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Company">
            <Input value={selectedRecord?.companyName} disabled />
          </Form.Item>
        </Col>
      
        <Col span={6}>
          <Form.Item label="Delivery Date">
            <Input value={selectedRecord?.deliveryDate} disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* 🔹 Transport Details Section */}
      <h6 className=" text-amber-500 ">Transport Details</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Dispatch Date">
            <Input value={selectedRecord?.dispatchDate} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Delivered Date">
            <Input value={selectedRecord?.deliveredDate || "—"} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Vehicle No">
            <Input value={selectedRecord?.vehicleNo} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Driver Name">
            <Input value={selectedRecord?.driverName} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Phone No">
            <Input value={selectedRecord?.contactNo} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Route">
            <Input value={selectedRecord?.route || "—"} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Transporter">
            <Input value={selectedRecord?.transporter} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Status">
            <Input value={selectedRecord?.status} disabled />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );


  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Delivery Status</h1>
          <p className="text-amber-600">Track your sales delivery progress</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setSearchText("")}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
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
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={10}
          scroll={{ y: 350 }}
        />
      </div>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700  text-2xl font-semibold">View Delivery Details</span>}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={900}
      >
        <Form layout="vertical" form={viewForm}>
          {renderViewFields()}
        </Form>
      </Modal>
    </div>
  );
}

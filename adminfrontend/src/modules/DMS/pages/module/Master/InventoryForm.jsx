import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Option } = Select;

/* ---------------- MOCK DATA ---------------- */
const inventoryJSON = [
  {
    key: 1,
    vendorName: "Global Suppliers Co.",
    vendorId: "VND001",
    productId: "PRD001",
    productName: "Mustard Oil",
    productGroupName: "Edible Oil",
    productType: "Finished Goods",
    hsnCode: "1514",
    mrp: 120,
    caseQuantity: 12,
    totalStock: 500,
    minStockBalance: 50,
  },
];

export default function InventoryForm() {
  const [data, setData] = useState(inventoryJSON);
  const [searchText, setSearchText] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  /* ---------------- TABLE COLUMNS ---------------- */
const columns = [
  {
    title: <span className="text-amber-700 font-semibold">Vendor Name</span>,
    dataIndex: "vendorName",
    render: (text) => (
      <span className="text-amber-800">{text}</span>
    ),
  },
  {
    title: <span className="text-amber-700 font-semibold">Product Name</span>,
    dataIndex: "productName",
    render: (text) => (
      <span className="text-amber-800">{text}</span>
    ),
  },
  {
    title: <span className="text-amber-700 font-semibold">Product ID</span>,
    dataIndex: "productId",
    render: (text) => (
      <span className="text-amber-800">{text}</span>
    ),
  },
  {
    title: <span className="text-amber-700 font-semibold">Product Type</span>,
    dataIndex: "productType",
    render: (text) => (
      <span className="text-amber-800">{text}</span>
    ),
  },
  {
    title: <span className="text-amber-700 font-semibold">Total Stock</span>,
    dataIndex: "totalStock",
    render: (text) => (
      <span className="text-amber-800">{text}</span>
    ),
  },
  {
    title: <span className="text-amber-700 font-semibold">Min Stock</span>,
    dataIndex: "minStockBalance",
    render: (text) => (
      <span className="text-amber-800">{text}</span>
    ),
  },
  {
    title: <span className="text-amber-700 font-semibold">Actions</span>,
    width: 120,
    render: (_, record) => (
      <div className="flex gap-3">
        <EyeOutlined
          className="cursor-pointer! text-red-500! hover:text-red-600!"
          onClick={() => {
            setSelectedRow(record);
            viewForm.setFieldsValue(record);
            setViewOpen(true);
          }}
        />
        <EditOutlined
          className="cursor-pointer! text-blue-500! hover:text-blue-600!"
          onClick={() => {
            setSelectedRow(record);
            editForm.setFieldsValue(record);
            setEditOpen(true);
          }}
        />
      </div>
    ),
  },
];

  /* ---------------- HANDLERS ---------------- */
  const handleAdd = (values) => {
    setData([...data, { ...values, key: Date.now() }]);
    setAddOpen(false);
    addForm.resetFields();
  };

  const handleEdit = (values) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === selectedRow.key ? { ...item, ...values } : item
      )
    );
    setEditOpen(false);
  };

  const filteredData = data.filter((item) =>
    item.vendorName.toLowerCase().includes(searchText.toLowerCase())
  );

  /* ---------------- COMMON FORM ---------------- */
  const InventoryFields = ({ disabled = false }) => (
    <Row gutter={16}>
      {[
        ["Vendor Name", "vendorName", <Input disabled={disabled} />],
        ["Vendor ID", "vendorId", <Input disabled={disabled} />],
        ["Product ID", "productId", <Input disabled={disabled} />],
        ["Product Name", "productName", <Input disabled={disabled} />],
        ["Product Group Name", "productGroupName", <Input disabled={disabled} />],
        [
          "Product Type",
          "productType",
          <Select disabled={disabled} placeholder="Select">
            <Option value="Raw Material">Raw Material</Option>
            <Option value="Finished Goods">Finished Goods</Option>
            <Option value="Packing Material">Packing Material</Option>
            <Option value="Consumable">Consumable</Option>
          </Select>,
        ],
        ["HSN Code", "hsnCode", <Input disabled={disabled} />],
        ["MRP", "mrp", <InputNumber disabled={disabled} className="w-full" />],
        ["Case Quantity", "caseQuantity", <InputNumber disabled={disabled} className="w-full" />],
        ["Total Stock Available", "totalStock", <InputNumber disabled={disabled} className="w-full" />],
        ["Minimum Stock Balance", "minStockBalance", <InputNumber disabled={disabled} className="w-full" />],
      ].map(([label, name, component]) => (
        <Col span={6} key={name}>
          <Form.Item
            label={label}
            name={name}
            rules={[{ required: !disabled && ["vendorName", "productId", "productName"].includes(name) }]}
          >
            {component}
          </Form.Item>
        </Col>
      ))}
    </Row>
  );

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-500!" />}
            placeholder="Search..."
            className="w-64! border-amber-400!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<FilterOutlined  className="text-amber-800!" />} className="border-amber-400!">
            <span className="text-amber-800!">Reset</span>
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add New
        </Button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-4 bg-white shadow-md">
        <Table columns={columns} dataSource={filteredData} rowKey="key" />
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">Add Inventory</span>}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Inventory Details</h6>
            <InventoryFields />
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button>Cancel</Button>
            <Button htmlType="submit" className="bg-amber-500! border-none! text-white">
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------------- VIEW MODAL ---------------- */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">View Inventory</span>}
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          <Card bordered className="border-amber-300 bg-amber-50">
            <h6 className="text-amber-600 mb-3">Inventory Details</h6>
            <InventoryFields disabled />
          </Card>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">Edit Inventory</span>}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Inventory Details</h6>
            <InventoryFields />
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button>Cancel</Button>
            <Button htmlType="submit" className="bg-amber-500! border-none! text-white">
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

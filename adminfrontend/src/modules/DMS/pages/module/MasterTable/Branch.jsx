import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";

// JSON data
const branchDataJSON = [
  {
    key: 1,
    branchCode: "BBS001",
    branchName: "Bhubaneswar Branch",
    location: "Bhubaneswar, Odisha",
    contactPerson: "Priya Sharma",
    organisation: "Odisha Premium Oils Pvt Ltd",
    status: "Active",
  },
  {
    key: 2,
    branchCode: "CTC001",
    branchName: "Cuttack Branch",
    location: "Cuttack, Odisha",
    contactPerson: "Suresh Patel",
    organisation: "Odisha Premium Oils Pvt Ltd",
    status: "Active",
  },
];

export default function Branch() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [data, setData] = useState(branchDataJSON);

  const filteredData = data.filter(
    (item) =>
      item.branchCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.branchName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase()) ||
      item.contactPerson.toLowerCase().includes(searchText.toLowerCase()) ||
      item.organisation.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Branch Code</span>,
      dataIndex: "branchCode",
      width: 120,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Branch Name</span>,
      dataIndex: "branchName",
      width: 200,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Location</span>,
      dataIndex: "location",
      width: 200,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Contact Person</span>,
      dataIndex: "contactPerson",
      width: 150,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Organisation</span>,
      dataIndex: "organisation",
      width: 200,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        return status === "Active" ? (
          <span className={`${base} bg-green-100 text-green-700`}>{status}</span>
        ) : (
          <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer text-blue-500"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue(record);
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer text-red-500"
            onClick={() => {
              setSelectedRecord(record);
              form.setFieldsValue(record);
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleFormSubmit = (values) => {
    if (isEditModalOpen) {
      setData((prev) =>
        prev.map((item) => (item.key === selectedRecord.key ? { ...values, key: item.key } : item))
      );
    } else {
      setData((prev) => [...prev, { ...values, key: prev.length + 1 }]);
    }
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const renderFormFields = (disabled = false) => (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Branch Code</span>}
          name="branchCode"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Branch Code"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Branch Name</span>}
          name="branchName"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Branch Name"
            disabled={disabled}
            
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Location</span>}
          name="location"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Location"
            disabled={disabled}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Contact Person</span>}
          name="contactPerson"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Contact Person"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Organisation</span>}
          name="organisation"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select Organisation"
            disabled={disabled}
          >
            <Select.Option value="Odisha Premium Oils Pvt Ltd">Odisha Premium Oils Pvt Ltd</Select.Option>
            <Select.Option value="Eastern Agro Foods">Eastern Agro Foods</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Status</span>}
          name="status"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select Status"
            disabled={disabled}
           
           
          >
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <div>
      {/* Filter / Export / Add */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            className="w-64 text-amber-700 placeholder-amber-400"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
            onClick={() => setSearchText("")}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500 border-amber-500 hover:bg-amber-600"
            onClick={() => {
              form.resetFields();
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-0 text-amber-700">Branch Master Records</h2>
        <p className="text-amber-600 mb-3">Manage your branch master data</p>
        <Table columns={columns} dataSource={filteredData} pagination={false} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={<span className="text-amber-700">{isEditModalOpen ? "Edit Branch" : "Add New Branch"}</span>}
        open={isAddModalOpen || isEditModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        footer={null}
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
          {renderFormFields(false)}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 border-amber-500 hover:bg-amber-600"
            >
              {isEditModalOpen ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700">View Branch</span>}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true)}
        </Form>
      </Modal>
    </div>
  );
}

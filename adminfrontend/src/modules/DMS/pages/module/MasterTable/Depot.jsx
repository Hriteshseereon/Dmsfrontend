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

// JSON data for Company Master
const companyDataJSON = [
  {
    key: 1,
    shortName: "RSI",
    compName: "RUCHI SOYA INDUSTRIES LIMITED",
    address: "201, MAHAKOSH HOUSE, 7/5, SOUTH ...",
    phoneNo: "4065012251",
    email: "info@ruchi.com",
    transactionType: "Sales",
    location: "Bhubaneswar",
    state: "Odisha",
    igstApplicable: "Yes",
    faxNo: "",
    tranStatus: "IGST Applicable",
  },
  {
    key: 2,
    shortName: "BAB",
    compName: "BALAJI ACTION BUILDWELL",
    address: "PLOT NO: C-34, C-34/ SIDCUL INDU...",
    phoneNo: "8392928613",
    email: "contact@balaji.com",
    transactionType: "Purchase",
    location: "Cuttack",
    state: "Odisha",
    igstApplicable: "No",
    faxNo: "",
    tranStatus: "Non-IGST",
  },
];

export default function DeptoMaster() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [data, setData] = useState(companyDataJSON); // Use JSON data

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Short Name</span>,
      dataIndex: "shortName",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Company Name</span>,
      dataIndex: "compName",
      width: 150,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Address</span>,
      dataIndex: "address",
      width: 150,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Phone No</span>,
      dataIndex: "phoneNo",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">E-Mail</span>,
      dataIndex: "email",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Transaction Type</span>,
      dataIndex: "transactionType",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Location</span>,
      dataIndex: "location",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">State</span>,
      dataIndex: "state",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">IGST Applicable</span>,
      dataIndex: "igstApplicable",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
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
        prev.map((item) =>
          item.key === selectedRecord.key ? { ...values, key: item.key } : item
        )
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
          label={<span className="text-amber-700 font-semibold">C. Short Name</span>}
          name="shortName"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Short Name"
            disabled={disabled}

          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Comp Name</span>}
          name="compName"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Company Name"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Address</span>}
          name="address"
          rules={[{ required: true }]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Enter Address"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Phone No</span>}
          name="phoneNo"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter Phone No"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Fax No</span>}
          name="faxNo"
        >
          <Input
            placeholder="Enter Fax No"
            disabled={disabled}
            
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">E-Mail</span>}
          name="email"
        >
          <Input
            placeholder="Enter Email"
            disabled={disabled}
            
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Transaction Type</span>}
          name="transactionType"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select Transaction Type"
            disabled={disabled}
          >
            <Select.Option value="Sales">Sales</Select.Option>
            <Select.Option value="Purchase">Purchase</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Tran. Status</span>}
          name="tranStatus"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select Status"
            disabled={disabled}
          >
            <Select.Option value="IGST Applicable">IGST Applicable</Select.Option>
            <Select.Option value="Non-IGST">Non-IGST</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">Location</span>}
          name="location"
        >
          <Input
            placeholder="Enter Location"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">State</span>}
          name="state"
        >
          <Input
            placeholder="Enter State"
            disabled={disabled}
           
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<span className="text-amber-700 font-semibold">IGST Applicable</span>}
          name="igstApplicable"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select IGST Applicable"
            disabled={disabled}
          >
            <Select.Option value="Yes">Yes</Select.Option>
            <Select.Option value="No">No</Select.Option>
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
        <h2 className="text-lg font-semibold mb-0 text-amber-700">Company Master Records</h2>
        <p className="text-amber-600 mb-3">Manage your company master data</p>
        <Table columns={columns} dataSource={filteredData} pagination={false} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={<span className="text-amber-700 font-semibold">{isEditModalOpen ? "Edit Company" : "Add New Company"}</span>}
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
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
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
        title={<span className="text-amber-700 font-semibold">View Company</span>}
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

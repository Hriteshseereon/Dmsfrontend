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

export default function SeriesMaster() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [data, setData] = useState([
    {
      key: 1,
      sid: "S001",
      series: "Series A",
      status: "Enable",
      depot: "Depot 1",
    },
    {
      key: 2,
      sid: "S002",
      series: "Series B",
      status: "Disable",
      depot: "Depot 2",
    },
  ]);

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    { title: "SId", dataIndex: "sid", width: 250 },
    { title: "Series", dataIndex: "series", width: 250 },
    { title: "Status", dataIndex: "status", width: 250 },
    { title: "Depot", dataIndex: "depot", width: 250 },
    {
      title: "Actions",
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
        <Form.Item label="SId" name="sid" rules={[{ required: true }]}>
          <Input placeholder="Enter SId" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Series" name="series" rules={[{ required: true }]}>
          <Input placeholder="Enter Series" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select placeholder="Select Status" disabled={disabled}>
            <Select.Option value="Enable">Enable</Select.Option>
            <Select.Option value="Disable">Disable</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Depot" name="depot" rules={[{ required: true }]}>
          <Select placeholder="Select Depot" disabled={disabled}>
            <Select.Option value="Depot 1">Depot 1</Select.Option>
            <Select.Option value="Depot 2">Depot 2</Select.Option>
            <Select.Option value="Depot 3">Depot 3</Select.Option>
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
            className="w-64"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<FilterOutlined />} onClick={() => setSearchText("")}>
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
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
        <h2 className="text-lg font-semibold mb-0">Series Master Records</h2>
        <p className="text-gray-500 mb-3">Manage your series master data</p>
        <Table columns={columns} dataSource={filteredData} pagination={false} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={isEditModalOpen ? "Edit Series" : "Add New Series"}
        open={isAddModalOpen || isEditModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        footer={null}
        width={600}
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
            <Button type="primary" htmlType="submit">
              {isEditModalOpen ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Series"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true)}
        </Form>
      </Modal>
    </div>
  );
}

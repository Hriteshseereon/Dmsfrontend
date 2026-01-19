import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const assetCategoryJSON = {
  records: [
    {
      key: 1,
      categoryId: "AC-001",
      categoryName: "Computer Equipment",
      description: "Desktop computers, laptops, servers, and related hardware",
      usefulLife: 5,
      defaultDepreciationMethod: "Straight Line",
      defaultDepreciationRate: 20,
    },
    {
      key: 2,
      categoryId: "AC-002",
      categoryName: "Furniture & Fixtures",
      description: "Office furniture, chairs, desks, cabinets",
      usefulLife: 10,
      defaultDepreciationMethod: "Written Down Value",
      defaultDepreciationRate: 10,
    },
    {
      key: 3,
      categoryId: "AC-003",
      categoryName: "Vehicles",
      description: "Company cars, trucks, delivery vehicles",
      usefulLife: 8,
      defaultDepreciationMethod: "Straight Line",
      defaultDepreciationRate: 12.5,
    },
  ],
  depreciationMethods: [
    "Straight Line",
    "Written Down Value",
    "Double Declining Balance",
    "Sum of Years Digits",
  ],
};

export default function AssetCategory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState(assetCategoryJSON.records);
  const [searchText, setSearchText] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setData(assetCategoryJSON.records);
      return;
    }
    const filtered = data.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value.toLowerCase())
    );
    setData(filtered);
  };

  const handleFormSubmit = (values, type) => {
    if (type === "edit" && selectedRecord) {
      setData((prev) =>
        prev.map((i) =>
          i.key === selectedRecord.key ? { ...values, key: i.key } : i
        )
      );
      setIsEditModalOpen(false);
      editForm.resetFields();
    } else {
      setData((prev) => [...prev, { ...values, key: prev.length + 1 }]);
      setIsAddModalOpen(false);
      addForm.resetFields();
    }
  };

  const columns = [
    // {
    //   title: <span className="text-amber-700 font-semibold">Category ID</span>,
    //   dataIndex: "categoryId",
    //   width: 120,
    //   render: (t) => <span className="text-amber-800">{t}</span>,
    // },
    {
      title: (
        <span className="text-amber-700 font-semibold">Category Name</span>
      ),
      dataIndex: "categoryName",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Description</span>,
      dataIndex: "description",
      width: 200,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Useful Life (Years)
        </span>
      ),
      dataIndex: "usefulLife",
      width: 120,
      render: (t) => <span className="text-amber-800">{t} years</span>,
    },
    // {
    //   title: (
    //     <span className="text-amber-700 font-semibold">
    //       Default Depreciation Method
    //     </span>
    //   ),
    //   dataIndex: "defaultDepreciationMethod",
    //   width: 180,
    //   render: (t) => <span className="text-amber-800">{t}</span>,
    // },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Default Depreciation Rate (%)
        </span>
      ),
      dataIndex: "defaultDepreciationRate",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}%</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue(record);
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              editForm.setFieldsValue(record);
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const renderFormFields = (formInstance, disabled = false) => (
    <>
      <h6 className="text-amber-500 mb-3">Category Information</h6>
      <Row gutter={16}>
        {/* <Col span={8}>
          <Form.Item
            label="Category ID"
            name="categoryId"
            rules={[{ required: true, message: "Please enter Category ID" }]}
          >
            <Input placeholder="Enter Category ID" disabled={disabled} />
          </Form.Item>
        </Col> */}
        <Col span={8}>
          <Form.Item
            label="Category Name"
            name="categoryName"
            rules={[{ required: true, message: "Please enter Category Name" }]}
          >
            <Input placeholder="Enter Category Name" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Useful Life (Years)"
            name="usefulLife"
            rules={[{ required: true, message: "Please enter Useful Life" }]}
          >
            <InputNumber
              className="w-full"
              placeholder="Enter years"
              min={1}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter Description" }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter category description"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500 mb-3">Depreciation Details</h6>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Default Depreciation Method"
            name="defaultDepreciationMethod"
            rules={[
              { required: true, message: "Please select Depreciation Method" },
            ]}
          >
            <Select
              placeholder="Select Depreciation Method"
              disabled={disabled}
            >
              {assetCategoryJSON.depreciationMethods.map((method) => (
                <Option key={method} value={method}>
                  {method}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Default Depreciation Rate (%)"
            name="defaultDepreciationRate"
            rules={[
              { required: true, message: "Please enter Depreciation Rate" },
            ]}
          >
            <InputNumber
              className="w-full"
              placeholder="Enter rate"
              min={0}
              max={100}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
           prefix={<SearchOutlined className="text-amber-600!" />}
                       placeholder="Search assets..."
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
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Asset Category Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your asset category data</p>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 180 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add New Asset Category
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
         cancelText="Cancel"
        cancelButtonProps={{ className :"border-amber-400! text-amber-700! hover:bg-amber-100!"
        }}
       
        onOk={() => addForm.submit()}
        okText="Add"
        okButtonProps={{ className: "bg-amber-500! border-none!" }}
        width={900}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(values) => handleFormSubmit(values, "add")}
        >
          {renderFormFields(addForm, false)}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit Asset Category
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        cancelText="Cancel"
        cancelButtonProps={{ className :"border-amber-400! text-amber-700! hover:bg-amber-100!"
        }}
        onOk={() => editForm.submit()}
        okText="Update"
        okButtonProps={{ className: "bg-amber-500! border-none!" }}
        width={900}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(values) => handleFormSubmit(values, "edit")}
        >
          {renderFormFields(editForm, false)}
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
         title="View Category Details"
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}

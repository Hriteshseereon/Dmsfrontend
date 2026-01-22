import React, { useState, useEffect } from "react";
import { getAssetCategories, addAssetCategory } from "../../api/assets";
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
  message,
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

const depreciationMethods = [
  "StraightLine",
  "WrittenDownValue",
  "DoubleDecliningBalance",
  "SumOfYearsDigits",
];

export default function AssetCategory() {
   const DEFAULT_ORGANISATION_ID = "3d3a2f09-566d-4063-bfbd-f146dc4fcfb7";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  // Fetch asset categories on component mount
  useEffect(() => {
    fetchAssetCategories();
  }, []);

  const fetchAssetCategories = async () => {
    setLoading(true);
    try {
      const response = await getAssetCategories();
      console.log("Fetched asset categories:", response);
      
      // Transform API data to match table format
      const transformedData = response.map((item, index) => ({
        key: item.id || index,
        id: item.id,
        categoryName: item.category_name,
        description: item.description,
        usefulLife: item.useful_life,
        defaultDepreciationMethod: item.default_depreciation_method,
        defaultDepreciationRate: item.default_depreciation_rate,
      }));
      
      setData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching asset categories:", error);
      message.error("Failed to fetch asset categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleAddCategory = async (values) => {
    setLoading(true);
    try {
      // Transform form values to match API format
      const apiData = {
        organisation: DEFAULT_ORGANISATION_ID,
        category_name: values.categoryName,
        description: values.description,
        useful_life: values.usefulLife,
        default_depreciation_method: values.defaultDepreciationMethod,
        default_depreciation_rate: values.defaultDepreciationRate,
      };

      const response = await addAssetCategory(apiData);
      console.log("Added category:", response);
      
      message.success("Asset category added successfully");
      setIsAddModalOpen(false);
      addForm.resetFields();
      
      // Refresh the data
      fetchAssetCategories();
    } catch (error) {
      console.error("Error adding asset category:", error);
      message.error("Failed to add asset category");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (values, type) => {
    if (type === "add") {
      handleAddCategory(values);
    } else if (type === "edit" && selectedRecord) {
      // Edit functionality - you'll need to add updateAssetCategory API call
      setData((prev) =>
        prev.map((i) =>
          i.key === selectedRecord.key ? { ...values, key: i.key } : i
        )
      );
      setFilteredData((prev) =>
        prev.map((i) =>
          i.key === selectedRecord.key ? { ...values, key: i.key } : i
        )
      );
      setIsEditModalOpen(false);
      editForm.resetFields();
      message.success("Asset category updated successfully");
    }
  };

  const columns = [
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
        <Col span={12}>
          <Form.Item
            label="Category Name"
            name="categoryName"
            rules={[{ required: true, message: "Please enter Category Name" }]}
          >
            <Input placeholder="Enter Category Name" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={12}>
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
              {depreciationMethods.map((method) => (
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
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: 180 }}
          loading={loading}
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
        cancelButtonProps={{
          className: "border-amber-400! text-amber-700! hover:bg-amber-100!",
        }}
        onOk={() => addForm.submit()}
        okText="Add"
        okButtonProps={{ className: "bg-amber-500! border-none!", loading }}
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
        cancelButtonProps={{
          className: "border-amber-400! text-amber-700! hover:bg-amber-100!",
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
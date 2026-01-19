// AssetManager.jsx
import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const assetCategories = [
  "Computer Equipment",
  "Furniture & Fixtures",
  "Vehicles",
  "IT Equipment",
  "Machinery",
  "Electronics",
];

const assetTypes = ["Movable", "Fixed"];

const depreciationMethods = [
  "Straight Line",
  "Written Down Value",
  "Double Declining Balance",
  "Sum of Years Digits",
];

const statusOptions = ["Active", "Inactive", "Lost", "Damaged", "Under Repair"];

const initialAssets = [
  {
    key: 1,
    assetName: "Dell Latitude 5430",
    assetId: "ASSET-001",
    assetCategory: "Computer Equipment",
    assetType: "Movable",
    serialNumber: "SN123456",
    modelNumber: "L5430",
    brand: "Dell",
    purchaseDate: "2024-08-01",
    purchaseVendor: "Tech Supplies",
    purchaseInvoice: "INV-1001",
    costPrice: 75000,
    currentValue: 50000,
    depreciationMethod: "Straight Line",
    depreciationRate: 10,
    assetLocation: "Head Office - IT",
    assignedTo: "Ravi Kumar",
    status: "Active",
    warrantyExpiryDate: "2026-08-01",
    insurancePolicy: "POL-2024-001",
    insuranceExpiryDate: "2026-08-01",
    barcodeNumber: "BC-1001",
    additionalInfo: "Office laptop",
    documents: [],
  },
];

export default function AssetManager() {
  const [data, setData] = useState(initialAssets);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [fileList, setFileList] = useState([]);

  const uploadProps = {
    fileList,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const filteredData = data.filter((row) =>
    ["assetName", "assetId", "assetCategory", "assignedTo", "status"].some(
      (field) =>
        (row[field] || "")
          .toString()
          .toLowerCase()
          .includes(searchText.trim().toLowerCase())
    )
  );

  const handleAdd = (values) => {
    const payload = {
      ...values,
      key: data.length ? Math.max(...data.map((d) => d.key)) + 1 : 1,
      purchaseDate: values.purchaseDate
        ? dayjs(values.purchaseDate).format("YYYY-MM-DD")
        : undefined,
      warrantyExpiryDate: values.warrantyExpiryDate
        ? dayjs(values.warrantyExpiryDate).format("YYYY-MM-DD")
        : undefined,
      insuranceExpiryDate: values.insuranceExpiryDate
        ? dayjs(values.insuranceExpiryDate).format("YYYY-MM-DD")
        : undefined,
      documents: fileList,
    };
    setData((prev) => [payload, ...prev]);
    setIsAddModalOpen(false);
    addForm.resetFields();
    setFileList([]);
    message.success("Asset added successfully!");
  };

  const handleEdit = (values) => {
    const payload = {
      ...selectedRecord,
      ...values,
      purchaseDate: values.purchaseDate
        ? dayjs(values.purchaseDate).format("YYYY-MM-DD")
        : undefined,
      warrantyExpiryDate: values.warrantyExpiryDate
        ? dayjs(values.warrantyExpiryDate).format("YYYY-MM-DD")
        : undefined,
      insuranceExpiryDate: values.insuranceExpiryDate
        ? dayjs(values.insuranceExpiryDate).format("YYYY-MM-DD")
        : undefined,
      documents: fileList,
    };
    setData((prev) => prev.map((d) => (d.key === payload.key ? payload : d)));
    setIsEditModalOpen(false);
    editForm.resetFields();
    setFileList([]);
    message.success("Asset updated successfully!");
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "assetName",
      width: 220,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Asset ID</span>,
      dataIndex: "assetId",
      width: 140,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Category</span>
      ),
      dataIndex: "assetCategory",
      width: 160,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Assigned To</span>,
      dataIndex: "assignedTo",
      width: 160,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Active")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>Active</span>
          );
        if (status === "Inactive")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              Inactive
            </span>
          );
        return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
      },
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
              viewForm.setFieldsValue({
                ...record,
                purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : undefined,
                warrantyExpiryDate: record.warrantyExpiryDate ? dayjs(record.warrantyExpiryDate) : undefined,
                insuranceExpiryDate: record.insuranceExpiryDate ? dayjs(record.insuranceExpiryDate) : undefined,
              });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500! "
            onClick={() => {
              setSelectedRecord(record);
              editForm.setFieldsValue({
                ...record,
                purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : undefined,
                warrantyExpiryDate: record.warrantyExpiryDate ? dayjs(record.warrantyExpiryDate) : undefined,
                insuranceExpiryDate: record.insuranceExpiryDate ? dayjs(record.insuranceExpiryDate) : undefined,
              });
              setFileList(record.documents || []);
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  // The form fields used for Add/Edit/View are same — extracted to renderFormFields
  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Asset Name</span>}
            name="assetName"
            rules={[{ required: true, message: "Please enter Asset Name" }]}
          >
            <Input placeholder="Enter Asset Name" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Asset ID</span>}
            name="assetId"
            rules={[{ required: true, message: "Please enter Asset ID" }]}
          >
            <Input placeholder="Enter Asset ID" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Asset Category</span>}
            name="assetCategory"
            rules={[{ required: true, message: "Please select Asset Category" }]}
          >
            <Select placeholder="Select Category" disabled={disabled}>
              {assetCategories.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Asset Type</span>}
            name="assetType"
            rules={[{ required: true, message: "Please select Asset Type" }]}
          >
            <Select placeholder="Movable / Fixed" disabled={disabled}>
              {assetTypes.map((t) => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Serial Number</span>} name="serialNumber">
            <Input placeholder="Enter Serial Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Model Number</span>} name="modelNumber">
            <Input placeholder="Enter Model Number" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Brand</span>} name="brand">
            <Input placeholder="Enter Brand" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Purchase Date</span>} name="purchaseDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Purchase Vendor</span>} name="purchaseVendor">
            <Input placeholder="Enter Vendor Name" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Purchase Invoice</span>} name="purchaseInvoice">
            <Input placeholder="Enter Invoice Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Cost Price</span>} name="costPrice" rules={[{ required: true, message: "Please enter Cost Price" }]}>
            <InputNumber className="w-full" min={0} prefix="₹" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Current Value</span>} name="currentValue">
            <InputNumber className="w-full" min={0} prefix="₹" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500 mt-4">Depreciating Costs</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Depreciation Method</span>} name="depreciationMethod">
            <Select placeholder="Select Method" disabled={disabled}>
              {depreciationMethods.map((m) => <Option key={m} value={m}>{m}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Depreciation Rate (%)</span>} name="depreciationRate">
            <InputNumber className="w-full" min={0} max={100} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Depreciation Percent (%)</span>} name="depreciationRate">
            <InputNumber className="w-full" min={0} max={100} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Depreciation Value</span>} name="depreciationRate">
            <InputNumber className="w-full" min={0} max={100} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500 mt-4">Additional Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Asset Location</span>} name="assetLocation">
            <Input placeholder="Branch/Floor/Dept" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Assigned To</span>} name="assignedTo">
            <Input placeholder="Employee/Department" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Status</span>} name="status" rules={[{ required: true }]}>
            <Select placeholder="Active/Inactive" disabled={disabled}>
              {statusOptions.map((s) => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Warranty Expiry Date</span>} name="warrantyExpiryDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Insurance Policy</span>} name="insurancePolicy">
            <Input placeholder="Enter Policy Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Insurance Expiry Date</span>} name="insuranceExpiryDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700 font-medium">Barcode Number</span>} name="barcodeNumber">
            <Input placeholder="Enter Barcode Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item label={<span className="text-amber-700 font-medium">Additional Info</span>} name="additionalInfo">
            <TextArea rows={3} placeholder="Enter additional information" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500 mt-4">Upload Document</h6>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label={<span className="text-amber-700 font-medium">Choose File</span>} name="documents" extra={<span className="text-amber-600 text-sm">Certificates, Invoices etc</span>}>
            <Upload {...uploadProps} maxCount={5} disabled={disabled}>
              <Button icon={<UploadOutlined />} className="border-amber-400 text-amber-700 hover:bg-amber-100">Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Top controls (search / reset / export / add) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search assets..."
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
          <Button icon={<DownloadOutlined />} className="border-amber-400! text-amber-700! hover:bg-amber-100!"
       >Export</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              addForm.resetFields();
              setFileList([]);
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Assets</h2>
        <p className="text-amber-600 mb-3">Manage your fixed & movable assets</p>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 6 }} />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add Asset</span>}
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={920}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAdd}
          onValuesChange={() => {}}
        >
          {renderFormFields(addForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button className="border-amber-400! text-amber-700! hover:bg-amber-100!"
        onClick={() => { setIsAddModalOpen(false); addForm.resetFields(); setFileList([]); }}>Cancel</Button>
            <Button type="primary" htmlType="submit"  className="bg-amber-500! hover:bg-amber-600! border-none!"
           >Add</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Asset</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={920}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
        >
          {renderFormFields(editForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={() => { setIsEditModalOpen(false); editForm.resetFields(); setFileList([]); }}>Cancel</Button>
            <Button type="primary" htmlType="submit"  className="bg-amber-500! hover:bg-amber-600! border-none!"
           >Save Changes</Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Asset"
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form form={viewForm} layout="vertical">{renderFormFields(viewForm, true)}</Form>
      </Modal>
    </div>
  );
}

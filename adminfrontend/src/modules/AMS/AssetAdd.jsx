// AssetManager.jsx
import React, { useEffect, useState } from "react";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
import { useAuth } from "../../context/AuthContext";
import {
  addAsset,
  getAssetCategories,
  getAssets,
  updateAsset,
  getAssetById,
} from "../../api/assets";

import useSessionStore from "../../store/sessionStore";
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

const depreciationMethods = ["StraightLine"];

const statusOptions = ["Active", "Inactive", "Lost", "Damaged", "Under Repair"];

export default function AssetManager() {
  const currentOrgId = useSessionStore((state) => state.currentOrgId);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [categories, setCategories] = useState([]);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [fileList, setFileList] = useState([]);

  // const map details
  const mapAssetToForm = (item) => ({
    id: item.id,

    assetName: item.asset_name,
    assetId: item.asset_code,

    assetCategoryId: item.category,

    assetType: item.asset_type,
    serialNumber: item.serial_number,
    modelNumber: item.model_number,
    brand: item.brand,

    purchaseDate: item.purchase_date ? dayjs(item.purchase_date) : undefined,

    purchaseVendor: item.purchase_vendor,
    purchaseDetails: item.purchase_details,
    purchaseGst: item.purchase_gst,
    purchaseAddress: item.purchase_address,

    serviceContractPerson: item.service_contract_person,
    serviceAddress: item.service_address,
    other: item.other,

    // ✅ DOCUMENTS
    warrantyDoc: item.warranty_doc
      ? [
          {
            uid: "-2",
            name: item.warranty_doc.split("/").pop(),
            status: "done",
            url: item.warranty_doc,
          },
        ]
      : [],

    amcDoc: item.amc_doc
      ? [
          {
            uid: "-3",
            name: item.amc_doc.split("/").pop(),
            status: "done",
            url: item.amc_doc,
          },
        ]
      : [],
    purchaseInvoice: item.purchase_invoice,
    purchaseDoc: item.purchase_doc
      ? [
          {
            uid: "-1",
            name: item.purchase_doc.split("/").pop(),
            status: "done",
            url: item.purchase_doc,
          },
        ]
      : [],
    assignedTo: item.assigned_to_employee,

    costPrice: Number(item.cost_price),
    currentValue: Number(item.current_value),

    depreciationMethod: item.depreciation_method,
    depreciationRate: Number(item.depreciation_rate),

    depreciationPercent: item.depreciation_percent,
    depreciationValue: item.depreciation_value,

    assetLocation: item.location_description,
    status: item.status,

    warrantyExpiryDate: item.warranty_expiry_date
      ? dayjs(item.warranty_expiry_date)
      : undefined,

    insurancePolicy: item.insurance_policy,

    insuranceExpiryDate: item.insurance_expiry_date
      ? dayjs(item.insurance_expiry_date)
      : undefined,

    barcodeNumber: item.barcode_number,
    additionalInfo: item.additional_info,
  });
  const fetchCategories = async () => {
    try {
      const res = await getAssetCategories();
      setCategories(res);
    } catch {
      message.error("Failed to load asset categories");
    }
  };
  // handle view function for view modal
  const handleView = async (record) => {
    try {
      setLoading(true);

      const asset = await getAssetById(record.id);

      const mapped = mapAssetToForm(asset);

      setSelectedRecord(mapped);
      viewForm.setFieldsValue(mapped);

      setIsViewModalOpen(true);
    } catch (err) {
      message.error("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };
  // handle edit function for edit modal
  const handleEditClick = async (record) => {
    try {
      setLoading(true);

      const asset = await getAssetById(record.id);

      const mapped = mapAssetToForm(asset);

      setSelectedRecord(mapped);
      editForm.setFieldsValue(mapped);

      setIsEditModalOpen(true);
    } catch (err) {
      message.error("Failed to load asset for editing");
    } finally {
      setLoading(false);
    }
  };
  // function to export table data to excel
  const handleExportExcel = () => {
    try {
      if (!filteredData.length) {
        message.warning("No data to export");
        return;
      }

      // Convert table data → Excel friendly format
      const exportData = filteredData.map((item) => ({
        "Asset Name": item.assetName,
        "Asset ID": item.assetId,
        Category: item.assetCategory,
        "Asset Type": item.assetType,
        Brand: item.brand,
        "Model Number": item.modelNumber,
        "Serial Number": item.serialNumber,

        "Purchase Date": item.purchaseDate
          ? dayjs(item.purchaseDate).format("DD-MM-YYYY")
          : "",

        "Purchase Vendor": item.purchaseVendor,
        "Cost Price (₹)": item.costPrice,
        "Current Value (₹)": item.currentValue,

        "Depreciation Method": item.depreciationMethod,
        "Depreciation Rate": item.depreciationRate,

        Location: item.assetLocation,
        "Assigned To": item.assignedTo,
        Status: item.status,

        "Warranty Expiry": item.warrantyExpiryDate
          ? dayjs(item.warrantyExpiryDate).format("DD-MM-YYYY")
          : "",

        "Insurance Policy": item.insurancePolicy,

        "Insurance Expiry": item.insuranceExpiryDate
          ? dayjs(item.insuranceExpiryDate).format("DD-MM-YYYY")
          : "",

        "Barcode Number": item.barcodeNumber,
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto column widths (nice formatting)
      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 22 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 },
        { wch: 14 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
      ];

      // Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

      // Generate file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Dynamic filename
      const fileName = `Assets_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;

      saveAs(blob, fileName);

      message.success("Assets exported successfully");
    } catch (error) {
      console.error(error);
      message.error("Export failed");
    }
  };
  useEffect(() => {
    if (!currentOrgId) return;
    fetchAssets();
    fetchCategories();
  }, [currentOrgId]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await getAssets(currentOrgId);

      const mapped = response.map((item) => ({
        key: item.id,
        id: item.id,

        assetName: item.asset_name,
        assetId: item.asset_code,

        // since category is null OR uuid/int based on serializer
        assetCategory: item.category?.category_name || "",
        assetCategoryId: item.category?.id || null,

        assetType: item.asset_type,
        serialNumber: item.serial_number,
        modelNumber: item.model_number,
        brand: item.brand,

        purchaseDate: item.purchase_date,
        purchaseVendor: item.purchase_vendor,
        purchaseInvoice: item.purchase_invoice,
        assignedTo: item.assigned_to_employee,
        costPrice: item.cost_price,
        currentValue: item.current_value,

        depreciationMethod: item.depreciation_method,
        depreciationRate: item.depreciation_rate,

        assetLocation: item.location_description,
        status: item.status,

        warrantyExpiryDate: item.warranty_expiry_date,
        insurancePolicy: item.insurance_policy,
        insuranceExpiryDate: item.insurance_expiry_date,
        barcodeNumber: item.barcode_number,
      }));

      setData(mapped);
    } catch (err) {
      message.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

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
          .includes(searchText.trim().toLowerCase()),
    ),
  );

  const handleAdd = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("asset_name", values.assetName);
      formData.append("asset_code", values.assetId);
      formData.append("category", values.assetCategoryId || "");
      formData.append("asset_type", values.assetType);

      formData.append("serial_number", values.serialNumber || "");
      formData.append("model_number", values.modelNumber || "");
      formData.append("brand", values.brand || "");
      formData.append("purchase_details", values.purchaseDetails || "");
      formData.append("purchase_gst", values.purchaseGst || "");
      formData.append("purchase_address", values.purchaseAddress || "");

      formData.append(
        "service_contract_person",
        values.serviceContractPerson || "",
      );
      formData.append("service_address", values.serviceAddress || "");
      formData.append("other", values.other || "");
      formData.append(
        "purchase_date",
        values.purchaseDate?.format("YYYY-MM-DD"),
      );

      formData.append("purchase_vendor", values.purchaseVendor || "");

      // ✅ invoice number (string)
      formData.append("purchase_invoice", values.purchaseInvoice || "");

      // ✅ FILE upload
      if (values.purchaseDoc?.length) {
        formData.append("purchase_doc", values.purchaseDoc[0].originFileObj);
      }
      // ✅ FILES
      if (values.warrantyDoc?.length) {
        formData.append("warranty_doc", values.warrantyDoc[0].originFileObj);
      }

      if (values.amcDoc?.length) {
        formData.append("amc_doc", values.amcDoc[0].originFileObj);
      }
      formData.append("assigned_to_employee", values.assignedTo || "");
      formData.append("cost_price", values.costPrice?.toString());
      formData.append(
        "current_value",
        values.currentValue?.toString() || values.costPrice?.toString(),
      );

      formData.append(
        "depreciation_method",
        values.depreciationMethod || "StraightLine",
      );
      formData.append(
        "depreciation_rate",
        values.depreciationRate?.toString() || "0",
      );

      if (values.warrantyExpiryDate) {
        formData.append(
          "warranty_expiry_date",
          values.warrantyExpiryDate.format("YYYY-MM-DD"),
        );
      }

      formData.append("insurance_policy", values.insurancePolicy || "");

      if (values.insuranceExpiryDate) {
        formData.append(
          "insurance_expiry_date",
          values.insuranceExpiryDate.format("YYYY-MM-DD"),
        );
      }

      formData.append("barcode_number", values.barcodeNumber || "");
      formData.append("location_description", values.assetLocation || "");
      formData.append("additional_info", values.additionalInfo || "");
      formData.append("status", values.status || "Active");

      await addAsset(formData);

      message.success("Asset created successfully");
      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchAssets();
    } catch (err) {
      console.log(err?.response?.data);
      message.error("Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("asset_name", values.assetName);
      formData.append("asset_code", values.assetId);
      formData.append("category", values.assetCategoryId);
      formData.append("asset_type", values.assetType);

      formData.append("serial_number", values.serialNumber || "");
      formData.append("model_number", values.modelNumber || "");
      formData.append("brand", values.brand || "");

      formData.append(
        "purchase_date",
        values.purchaseDate?.format("YYYY-MM-DD"),
      );

      formData.append("purchase_vendor", values.purchaseVendor || "");

      // ✅ string
      formData.append("purchase_invoice", values.purchaseInvoice || "");

      // ✅ optional file update
      if (values.purchaseDoc?.length) {
        const fileObj = values.purchaseDoc[0];

        // ✅ only send if NEW file uploaded
        if (fileObj.originFileObj instanceof File) {
          formData.append("purchase_doc", fileObj.originFileObj);
        }
      }
      // warranty
      if (values.warrantyDoc?.length) {
        const f = values.warrantyDoc[0];
        if (f.originFileObj instanceof File) {
          formData.append("warranty_doc", f.originFileObj);
        }
      }

      // amc
      if (values.amcDoc?.length) {
        const f = values.amcDoc[0];
        if (f.originFileObj instanceof File) {
          formData.append("amc_doc", f.originFileObj);
        }
      }

      // other fields
      formData.append("purchase_details", values.purchaseDetails || "");
      formData.append("purchase_gst", values.purchaseGst || "");
      formData.append("purchase_address", values.purchaseAddress || "");

      formData.append(
        "service_contract_person",
        values.serviceContractPerson || "",
      );
      formData.append("service_address", values.serviceAddress || "");
      formData.append("other", values.other || "");
      formData.append("assigned_to_employee", values.assignedTo || "");
      formData.append("cost_price", values.costPrice);
      formData.append("current_value", values.currentValue);
      formData.append("depreciation_method", values.depreciationMethod);
      formData.append("depreciation_rate", values.depreciationRate);

      formData.append("location_description", values.assetLocation || "");
      formData.append("status", values.status);

      await updateAsset(selectedRecord.id, formData);

      message.success("Asset updated successfully");
      setIsEditModalOpen(false);
      fetchAssets();
    } catch (err) {
      message.error("Failed to update asset");
    } finally {
      setLoading(false);
    }
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
      title: <span className="text-amber-700 font-semibold">Asset Type</span>,
      dataIndex: "assetType",
      width: 140,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Model Number</span>,
      dataIndex: "modelNumber",
      width: 160,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Assigned To</span>,
    //   dataIndex: "assignedTo",
    //   width: 160,
    //   render: (text) => <span className="text-amber-800">{text}</span>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Active")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              Active
            </span>
          );
        if (status === "Inactive")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              Inactive
            </span>
          );
        return (
          <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => handleView(record)}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500! "
            onClick={() => handleEditClick(record)}
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
            label={
              <span className="text-amber-700 font-medium">Asset Name</span>
            }
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
            label={
              <span className="text-amber-700 font-medium">Asset Category</span>
            }
            name="assetCategoryId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Category" disabled={disabled}>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Asset Type</span>
            }
            name="assetType"
            rules={[{ required: true, message: "Please select Asset Type" }]}
          >
            <Select placeholder="Movable / Fixed" disabled={disabled}>
              {assetTypes.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Serial Number</span>
            }
            name="serialNumber"
          >
            <Input placeholder="Enter Serial Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Model Number</span>
            }
            name="modelNumber"
          >
            <Input placeholder="Enter Model Number" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Brand</span>}
            name="brand"
          >
            <Input placeholder="Enter Brand" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Purchase Date</span>
            }
            name="purchaseDate"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Purchase Vendor
              </span>
            }
            name="purchaseVendor"
          >
            <Input placeholder="Enter Vendor Name" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Purchase Details
              </span>
            }
            name="purchaseDetails"
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Purchase GST</span>
            }
            name="purchaseGst"
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Purchase Address
              </span>
            }
            name="purchaseAddress"
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Purchase Invoice
              </span>
            }
            name="purchaseInvoice"
          >
            <Input placeholder="Enter Invoice Number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Warranty Document
              </span>
            }
            name="warrantyDoc"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              {!disabled && <Button icon={<UploadOutlined />}>Upload</Button>}
            </Upload>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">AMC Document</span>
            }
            name="amcDoc"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              {!disabled && <Button icon={<UploadOutlined />}>Upload</Button>}
            </Upload>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Invoice Document
              </span>
            }
            name="purchaseDoc"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              onPreview={(file) => {
                const url = file.url || URL.createObjectURL(file.originFileObj);
                window.open(url, "_blank");
              }}
            >
              {!disabled && (
                <Button icon={<UploadOutlined />}>Upload File</Button>
              )}
            </Upload>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Cost Price</span>
            }
            name="costPrice"
            rules={[
              { required: true, message: "Please enter Cost Price" },
              {
                type: "number",
                transform: (value) => Number(value),
                message: "Cost Price must be a valid number",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              prefix="₹"
              precision={2}
              disabled={disabled}
              parser={(value) => value?.replace(/[^\d.]/g, "")}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d*\.?\d*$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Current Value</span>
            }
            name="currentValue"
          >
            <InputNumber
              className="w-full"
              min={0}
              prefix="₹"
              precision={2}
              disabled={disabled}
              parser={(value) => value?.replace(/[^\d.]/g, "")}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d*\.?\d*$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <h6 className="text-amber-500 mt-4">Service Details</h6>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Contract Person
              </span>
            }
            name="serviceContractPerson"
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Service Address
              </span>
            }
            name="serviceAddress"
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Other</span>}
            name="other"
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
      <h6 className="text-amber-500 mt-4">Depreciating Costs</h6>
      <Row gutter={16}>
        <Col span={5}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Depreciation Method
              </span>
            }
            name="depreciationMethod"
          >
            <Select placeholder="Select Method" disabled={disabled}>
              {depreciationMethods.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Depreciation Rate
              </span>
            }
            name="depreciationRate"
          >
            <InputNumber
              className="w-full"
              min={0}
              prefix="₹"
              precision={2}
              disabled={disabled}
              parser={(value) => value?.replace(/[^\d.]/g, "")}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d*\.?\d*$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Depreciation Percent (%)
              </span>
            }
            name="depreciationPercent"
          >
            <InputNumber
              className="w-full"
              min={0}
              precision={2}
              disabled={disabled}
              parser={(value) => value?.replace(/[^\d.]/g, "")}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d*\.?\d*$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Depreciation Value
              </span>
            }
            name="depreciationValue"
          >
            <InputNumber
              className="w-full"
              min={0}
              prefix="₹"
              precision={2}
              disabled={disabled}
              parser={(value) => value?.replace(/[^\d.]/g, "")}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d*\.?\d*$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      {/* helo */}
      <h6 className="text-amber-500 mt-4">Additional Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Asset Location</span>
            }
            name="assetLocation"
          >
            <Input placeholder="Branch/Floor/Dept" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Assigned To</span>
            }
            name="assignedTo"
          >
            <Input placeholder="Employee/Department" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700 font-medium">Status</span>}
            name="status"
            rules={[{ required: true }]}
          >
            <Select placeholder="Active/Inactive" disabled={disabled}>
              {statusOptions.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Warranty Expiry Date
              </span>
            }
            name="warrantyExpiryDate"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Insurance Policy
              </span>
            }
            name="insurancePolicy"
          >
            <Input placeholder="Enter Policy Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Insurance Expiry Date
              </span>
            }
            name="insuranceExpiryDate"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Barcode Number</span>
            }
            name="barcodeNumber"
          >
            <Input placeholder="Enter Barcode Number" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">
                Additional Info
              </span>
            }
            name="additionalInfo"
          >
            <TextArea
              rows={3}
              placeholder="Enter additional information"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* <h6 className="text-amber-500 mt-4">Upload Document</h6>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={
              <span className="text-amber-700 font-medium">Choose File</span>
            }
            name="documents"
            extra={
              <span className="text-amber-600 text-sm">
                Certificates, Invoices etc
              </span>
            }
          >
            <Upload {...uploadProps} maxCount={5} disabled={disabled}>
              <Button
                icon={<UploadOutlined />}
                className="border-amber-400 text-amber-700 hover:bg-amber-100"
              >
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row> */}
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
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={handleExportExcel}
          >
            Export
          </Button>
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
        <p className="text-amber-600 mb-3">
          Manage your fixed & movable assets
        </p>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add Asset
          </span>
        }
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
            <Button
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit Asset
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={920}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          {renderFormFields(editForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Save Changes
            </Button>
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
        <Form form={viewForm} layout="vertical">
          {renderFormFields(viewForm, true)}
        </Form>

        {/* ✅ FILE PREVIEW */}
        {/* {selectedRecord?.purchaseDoc?.length > 0 && (
          <div className="mt-4">
            <h6 className="text-amber-500 font-semibold mb-2">
              Invoice Preview
            </h6>

            {(() => {
              const file = selectedRecord.purchaseDoc[0];
              const url = file.url;

              // IMAGE PREVIEW
              if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                return (
                  <img
                    src={url}
                    alt="invoice"
                    className="w-72 border rounded shadow"
                  />
                );
              }

              // PDF PREVIEW
              if (url.match(/\.pdf$/i)) {
                return (
                  <iframe
                    src={url}
                    title="PDF Preview"
                    width="100%"
                    height="400px"
                    className="border rounded"
                  />
                );
              }

              // OTHER FILE
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              );
            })()}
          </div>
        )} */}
        {/* WARRANTY */}
        {/* {selectedRecord?.warrantyDoc?.length > 0 && (
          <div className="mt-4">
            <h6 className="text-amber-500">Warranty Document</h6>
            <a href={selectedRecord.warrantyDoc[0].url} target="_blank">
              View Warranty
            </a>
          </div>
        )} */}

        {/* AMC */}
        {/* {selectedRecord?.amcDoc?.length > 0 && (
          <div className="mt-4">
            <h6 className="text-amber-500">AMC Document</h6>
            <a href={selectedRecord.amcDoc[0].url} target="_blank">
              View AMC
            </a>
          </div>
        )} */}
      </Modal>
    </div>
  );
}

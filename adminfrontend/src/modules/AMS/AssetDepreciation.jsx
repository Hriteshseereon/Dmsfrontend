// AssetDepreciation.jsx
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
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import {
  addAssetDepreciation,
  getAssetDepreciations,
  getAssets,
  updateAssetDepreciation,
} from "../../api/assets";
import useSessionStore from "../../store/sessionStore";

const { Option } = Select;
const { TextArea } = Input;

export default function AssetDepreciation() {
  const currentOrgId = useSessionStore((state) => state.currentOrgId);

  const [assets, setAssets] = useState([]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [addFileList, setAddFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);

  const depreciationMethods = ["StraightLine", "ReducingBalance", "Other"];

  const statusOptions = ["Active", "Disposed", "Under Repair", "Sold"];

  const filteredData = data.filter((row) =>
    ["assetId", "fiscalYear", "status", "remarks"].some((f) =>
      (row[f] || "")
        .toString()
        .toLowerCase()
        .includes(searchText.trim().toLowerCase()),
    ),
  );

  const fetchAssets = async () => {
    const res = await getAssets(currentOrgId);
    setAssets(res);
  };

  const fetchDepreciations = async () => {
    setLoading(true);
    try {
      const res = await getAssetDepreciations(currentOrgId);

      const mapped = res.map((item) => ({
        key: item.id,
        id: item.id,

        assetId: item.asset?.asset_code,
        assetPk: item.asset?.id,

        purchaseValue: item.purchase_value,
        depreciationRate: item.depreciation_rate,
        depreciationMethod: item.depreciation_method,

        depreciationStartDate: item.depreciation_start_date,
        depreciationEndDate: item.depreciation_end_date,

        currentValue: item.current_value,
        fiscalYear: item.fiscal_year,
        status: item.status,
        remarks: item.remarks,
        files: item.documents || [],
      }));

      setData(mapped);
    } catch {
      message.error("Failed to load depreciation records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentOrgId) return;
    fetchDepreciations();
    fetchAssets();
  }, [currentOrgId]);

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">SL No</span>,
      width: 80,
      render: (_, __, index) => (
        <span className="text-amber-800">{index + 1}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Asset ID</span>,
      dataIndex: "assetId",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Purchase Value (₹)</span>
      ),
      dataIndex: "purchaseValue",
      width: 160,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Depn Rate (%)</span>
      ),
      dataIndex: "depreciationRate",
      width: 120,
      render: (r) => <span className="text-amber-800">{r ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Method</span>,
      dataIndex: "depreciationMethod",
      width: 160,
      render: (m) => <span className="text-amber-800">{m}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Start Date</span>,
      dataIndex: "depreciationStartDate",
      width: 130,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">End Date</span>,
      dataIndex: "depreciationEndDate",
      width: 130,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },

    {
      title: (
        <span className="text-amber-700 font-semibold">Current Value (₹)</span>
      ),
      dataIndex: "currentValue",
      width: 150,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Fiscal Year</span>,
      dataIndex: "fiscalYear",
      width: 120,
      render: (f) => <span className="text-amber-800">{f}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (s) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (s === "Active")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              Active
            </span>
          );
        if (s === "Disposed")
          return (
            <span className={`${base} bg-red-100 text-red-700`}>Disposed</span>
          );
        return (
          <span className={`${base} bg-amber-100 text-amber-800`}>{s}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue({
                ...record,
                assetId: record.assetPk,
                depreciationStartDate: record.depreciationStartDate
                  ? dayjs(record.depreciationStartDate)
                  : undefined,
              });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              editForm.setFieldsValue({
                ...record,
                assetId: record.assetPk,
                depreciationStartDate: record.depreciationStartDate
                  ? dayjs(record.depreciationStartDate)
                  : undefined,
              });
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const exportCSV = () => {
    if (!data.length) {
      message.info("No data to export");
      return;
    }
    const headers = [
      "Asset ID",
      "Purchase Value",
      "Depreciation Rate",
      "Depreciation Method",
      "Depreciation Start Date",
      "Current Value",
      "Fiscal Year",
      "Status",
      "Remarks",
    ];
    const rows = data.map((r) => [
      r.assetId,
      r.purchaseValue,
      r.depreciationRate,
      r.depreciationMethod,
      r.depreciationStartDate,
      r.depreciationEndDate,
      r.currentValue,
      r.fiscalYear,
      r.status,
      (r.remarks || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((e) =>
        e.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset_depreciation_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addUploadProps = {
    fileList: addFileList,
    beforeUpload: (file) => {
      setAddFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) =>
      setAddFileList((prev) => prev.filter((f) => f.uid !== file.uid)),
  };

  const editUploadProps = {
    fileList: editFileList,
    beforeUpload: (file) => {
      setEditFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) =>
      setEditFileList((prev) => prev.filter((f) => f.uid !== file.uid)),
  };

  const handleAdd = async (values) => {
    try {
      setLoading(true);

      const payload = {
        organisation: currentOrgId, // ✅ must send
        asset: values.assetId, // ✅ asset UUID
        purchase_value: values.purchaseValue,
        depreciation_rate: values.depreciationRate,
        depreciation_method: values.depreciationMethod,
        depreciation_start_date:
          values.depreciationStartDate.format("YYYY-MM-DD"),
        fiscal_year: values.fiscalYear,
        current_value: values.currentValue,
        status: values.status || "Calculated",
        remarks: values.remarks || null,
      };

      await addAssetDepreciation(payload);

      message.success("Depreciation record added");
      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchDepreciations();
    } catch (err) {
      console.log(err?.response?.data);
      message.error("Failed to add depreciation record");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        asset: values.assetId,
        purchase_value: values.purchaseValue,
        depreciation_rate: values.depreciationRate,
        depreciation_method: values.depreciationMethod,
        depreciation_start_date:
          values.depreciationStartDate.format("YYYY-MM-DD"),
        fiscal_year: values.fiscalYear,
        current_value: values.currentValue,
        status: values.status,
        remarks: values.remarks || null,
      };

      await updateAssetDepreciation(selectedRecord.id, payload);

      message.success("Depreciation updated");
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedRecord(null);
      fetchDepreciations();
    } catch (err) {
      console.log(err?.response?.data);
      message.error("Failed to update depreciation");
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = (form, disabled = false, mode = "add") => (
    <>
      <h6 className="text-amber-500">Depreciation Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Asset</span>}
            name="assetId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select asset">
              {assets.map((a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.asset_name} ({a.asset_code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Value (₹)</span>}
            name="purchaseValue"
            rules={[{ required: true, message: "Please enter Purchase Value" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700">Depreciation Rate (%)</span>
            }
            name="depreciationRate"
            rules={[
              { required: true, message: "Please enter Depreciation Rate" },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              max={100}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Depreciation Method</span>}
            name="depreciationMethod"
            rules={[{ required: true, message: "Please select Method" }]}
            initialValue={depreciationMethods[0]}
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

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700">Depreciation Start Date</span>
            }
            name="depreciationStartDate"
            rules={[{ required: true, message: "Please select start date" }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700">Depreciation End Date</span>
            }
            name="depreciationEndDate"
            rules={[{ required: true, message: "Please select end date" }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Current Value (₹)</span>}
            name="currentValue"
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Fiscal Year</span>}
            name="fiscalYear"
            rules={[{ required: true, message: "Please enter Fiscal Year" }]}
          >
            <Input placeholder="e.g. 2024-25" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Status</span>}
            name="status"
            rules={[{ required: true }]}
            initialValue={statusOptions[0]}
          >
            <Select placeholder="Select Status" disabled={disabled}>
              {statusOptions.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Remarks</span>}
            name="remarks"
          >
            <TextArea
              rows={1}
              placeholder="Optional remarks"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500 mt-4">File Upload</h6>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={
              <span className="text-amber-700">
                Choose File (Invoice, Report etc)
              </span>
            }
            name="files"
            extra={
              <span className="text-amber-600 text-sm">
                PDF, JPG, PNG etc (client-only)
              </span>
            }
          >
            {mode === "add" ? (
              <Upload {...addUploadProps} maxCount={5} multiple>
                <Button
                  icon={<UploadOutlined />}
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  Click to Upload
                </Button>
              </Upload>
            ) : (
              <Upload {...editUploadProps} maxCount={5} multiple>
                <Button
                  icon={<UploadOutlined />}
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  Click to Upload
                </Button>
              </Upload>
            )}
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Top controls */}
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
            onClick={exportCSV}
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
              setAddFileList([]);
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Asset Depreciation
        </h2>
        <p className="text-amber-600 mb-3">
          Manage depreciation schedules & current values
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
            Add Depreciation Record
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
          setAddFileList([]);
        }}
        footer={null}
        width={920}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          {renderFormFields(addForm, false, "add")}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
                setAddFileList([]);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              htmlType="submit"
              loading={loading}
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
            Edit Depreciation Record
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setEditFileList([]);
          setSelectedRecord(null);
        }}
        footer={null}
        width={920}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          {renderFormFields(editForm, false, "edit")}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setEditFileList([]);
                setSelectedRecord(null);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              htmlType="submit"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Depreciation Record"
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={920}
      >
        <Form form={viewForm} layout="vertical">
          {renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}

// AssetDisposal.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Upload,
  Row,
  Col,
  message,
  DatePicker,
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
  addAssetDisposal,
  getAssetDisposals,
  getAssets,
  updateAssetDisposal,
  getAssetDisposalById,
} from "../../api/assets";
import useSessionStore from "../../store/sessionStore";
const { Option } = Select;
const { TextArea } = Input;

export default function AssetDisposal() {
  const currentOrgId = useSessionStore((state) => state.currentOrgId);

  const [data, setData] = useState([]);

  const [assets, setAssets] = useState([]);
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

  const disposalTypeOptions = ["Scrap", "Sold", "Donation", "Write-off"];
  const statusOptions = ["Pending", "Approved", "Rejected"]; // if needed later

  const filteredData = data.filter((row) =>
    ["assetId", "disposalId", "disposalType", "buyerName", "remarks"].some(
      (f) =>
        (row[f] || "")
          .toString()
          .toLowerCase()
          .includes(searchText.trim().toLowerCase()),
    ),
  );

  const fetchAssets = async () => {
    try {
      const res = await getAssets(currentOrgId);
      setAssets(res);
    } catch {
      message.error("Failed to load assets");
    }
  };
  // create a data mapper to map backend data to form fields

  const mapDisposalToForm = (item) => ({
    id: item.id,
    disposalId: item.disposal_id,

    assetId: item.asset, // backend gives pk directly
    asset_name: item.asset_name,

    disposalType: item.disposal_type,
    buyerName: item.buyer_name,
    saleValue: item.sale_value,

    disposalDate: item.disposal_date ? dayjs(item.disposal_date) : undefined,

    approvalDocument: item.approval_document_path,
    remarks: item.remarks,
  });

  // handle vieew function for view modal
  const handleView = async (record) => {
    try {
      setLoading(true);

      const res = await getAssetDisposalById(record.id);

      const mapped = mapDisposalToForm(res);

      setSelectedRecord(mapped);
      viewForm.setFieldsValue(mapped);

      setIsViewModalOpen(true);
    } catch (error) {
      message.error("Failed to load disposal details");
    } finally {
      setLoading(false);
    }
  };
  // handle edit click to load data into edit form
  const handleEditClick = async (record) => {
    try {
      setLoading(true);

      const res = await getAssetDisposalById(record.id);

      const mapped = mapDisposalToForm(res);

      setSelectedRecord(mapped);
      editForm.setFieldsValue(mapped);

      setEditFileList([]);
      setIsEditModalOpen(true);
    } catch (error) {
      message.error("Failed to load disposal for editing");
    } finally {
      setLoading(false);
    }
  };
  const fetchDisposals = async () => {
    setLoading(true);
    try {
      const res = await getAssetDisposals();

      const mapped = res.map((item) => ({
        key: item.id,
        id: item.id,

        disposalId: item.disposal_id,

        assetId: item.asset?.asset_code,
        asset_name: item.asset_name,
        assetPk: item.asset?.id,

        disposalType: item.disposal_type,
        buyerName: item.buyer_name,
        saleValue: item.sale_value,
        disposalDate: item.disposal_date,

        approvalDocument: item.approval_document_path,
        remarks: item.remarks,
      }));

      setData(mapped);
    } catch (error) {
      message.error("Failed to load disposal records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentOrgId) return;
    fetchDisposals();
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
    // {
    //   title: <span className="text-amber-700 font-semibold">Disposal ID</span>,
    //   dataIndex: "disposalId",
    //   width: 140,
    //   render: (t) => <span className="text-amber-800">{t}</span>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "asset_name",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Disposal Type</span>
      ),
      dataIndex: "disposalType",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Buyer Name</span>,
      dataIndex: "buyerName",
      width: 180,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Sale Value (₹)</span>
      ),
      dataIndex: "saleValue",
      width: 130,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Disposal Date</span>
      ),
      dataIndex: "disposalDate",
      width: 130,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Approval Doc</span>,
    //   dataIndex: "approvalDocument",
    //   width: 160,
    //   render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Remarks</span>,
      dataIndex: "remarks",
      width: 200,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
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
            className="cursor-pointer! text-red-500!"
            onClick={() => handleEditClick(record)}
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
      "Disposal ID",
      "Asset ID",
      "Disposal Type",
      "Buyer Name",
      "Sale Value",
      "Disposal Date",
      "Approval Document",
      "Remarks",
    ];
    const rows = data.map((r) => [
      r.disposalId,
      r.assetId,
      r.disposalType,
      r.buyerName,
      r.saleValue,
      r.disposalDate,
      r.approvalDocument,
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
    a.download = `asset_disposal_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addUploadProps = {
    fileList: addFileList,
    beforeUpload: (file) => {
      setAddFileList((prev) => [...prev, file]);
      return false; // prevent auto upload
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
        organisation: currentOrgId, // ✅ IMPORTANT
        asset: values.assetId,
        disposal_type: values.disposalType,
        buyer_name: values.buyerName || null,
        sale_value: values.saleValue || 0,
        disposal_date: values.disposalDate
          ? values.disposalDate.format("YYYY-MM-DD")
          : null,
        remarks: values.remarks || "",
      };

      await addAssetDisposal(payload);

      message.success("Disposal record added");
      setIsAddModalOpen(false);
      addForm.resetFields();
      setAddFileList([]);

      fetchDisposals();
    } catch (error) {
      message.error("Failed to add disposal record");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        organisation: currentOrgId, // ✅ keep it safe
        asset: values.assetId,
        disposal_type: values.disposalType,
        buyer_name: values.buyerName || null,
        sale_value: values.saleValue || 0,
        disposal_date: values.disposalDate
          ? values.disposalDate.format("YYYY-MM-DD")
          : null,
        remarks: values.remarks || "",
      };

      await updateAssetDisposal(selectedRecord.id, payload);

      message.success("Disposal record updated");
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedRecord(null);
      setEditFileList([]);

      fetchDisposals();
    } catch (error) {
      message.error("Failed to update disposal record");
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = (form, disabled = false, mode = "add") => (
    <>
      <h6 className="text-amber-500">Disposal Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Asset Name</span>}
            name="assetId"
            rules={[{ required: true, message: "Please enter Asset ID" }]}
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
            label={<span className="text-amber-700">Disposal Type</span>}
            name="disposalType"
            rules={[{ required: true, message: "Please select Disposal Type" }]}
          >
            <Select placeholder="Select Type" disabled={disabled}>
              {disposalTypeOptions.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Buyer Name</span>}
            name="buyerName"
          >
            <Input placeholder="Buyer / Recipient" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Sale Value (₹)</span>}
            name="saleValue"
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Disposal Date</span>}
            name="disposalDate"
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={
              <span className="text-amber-700">Disposal Approval Document</span>
            }
            name="approvalDocument"
          >
            <Input placeholder="Approval doc reference" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={12}>
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

      {/* <h6 className="text-amber-500 mt-4">File Upload</h6>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={
              <span className="text-amber-700">
                Choose File (Approval Document / Receipt)
              </span>
            }
            name="files"
            extra={
              <span className="text-amber-600 text-sm">
                PDF, JPG, PNG, or other documents
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
      </Row> */}
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
          Asset Disposal
        </h2>
        <p className="text-amber-600 mb-3">
          Manage asset disposals, sales, donations, and write-offs
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
            Add Disposal Record
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
            Edit Disposal Record
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
        title="View Disposal Record"
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

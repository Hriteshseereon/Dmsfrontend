// AssetMaintenance.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  addAssetMaintenance,
  getAssetMaintenances,
  getAssets,
  getAssetMaintenanceById,
  updateAssetMaintenance,
} from "../../api/assets";
import useSessionStore from "../../store/sessionStore";
import { globalSearch } from "../../utils/globalSearch";
const { Option } = Select;
const { TextArea } = Input;

export default function AssetMaintenance() {
  // const { currentOrgId } = useAuth();
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

  // separate file lists for add/edit modals
  const [addFileList, setAddFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);

  const serviceTypeOptions = ["Preventive", "Corrective", "Calibration"];
  const statusOptions = ["Scheduled", "In Progress", "Completed", "Cancelled"];

  const filteredData = useMemo(() => {
    return globalSearch(data, searchText);
  }, [data, searchText]);

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const res = await getAssetMaintenances(currentOrgId);

      const mapped = res.map((item) => ({
        key: item.id,
        id: item.id,

        maintenanceId: item.maintenance_id,
        assetId: item.asset?.asset_code,
        assetPk: item.asset?.id,
        asset_name: item.asset_name,
        serviceType: item.service_type,
        serviceProvider: item.service_provider,

        serviceDate: item.service_date,
        next_service_due_date: item.next_service_due_date,

        cost: item.cost,
        status: item.status,
        remarks: item.remarks,
        files: item.documents || [],
      }));

      setData(mapped);
    } catch {
      message.error("Failed to load maintenance records");
    } finally {
      setLoading(false);
    }
  };

  // handle view function to view button click
  const handleView = async (id) => {
    try {
      setLoading(true);

      const res = await getAssetMaintenanceById(id);

      console.log("VIEW API:", res);

      viewForm.setFieldsValue({
        assetId: res.asset,
        serviceType: res.service_type,
        serviceProvider: res.service_provider,
        serviceDate: res.service_date ? dayjs(res.service_date) : null,
        nextServiceDue: res.next_service_due_date
          ? dayjs(res.next_service_due_date)
          : null,
        cost: res.cost,
        status: res.status,
        remarks: res.remarks,
      });

      setSelectedRecord(res);
      setIsViewModalOpen(true);
    } catch (err) {
      console.log(err);
      message.error("Failed to load maintenance details");
    } finally {
      setLoading(false);
    }
  };

  // handle edit funtion
  const handleEditOpen = async (id) => {
    try {
      setLoading(true);

      const res = await getAssetMaintenanceById(id);

      console.log("EDIT API:", res);

      editForm.setFieldsValue({
        assetId: res.asset,
        serviceType: res.service_type,
        serviceProvider: res.service_provider,
        serviceDate: res.service_date ? dayjs(res.service_date) : null,
        nextServiceDue: res.next_service_due_date
          ? dayjs(res.next_service_due_date)
          : null,
        cost: res.cost,
        status: res.status,
        remarks: res.remarks,
      });

      setSelectedRecord(res); // IMPORTANT → used in update
      setIsEditModalOpen(true);
    } catch (err) {
      console.log(err);
      message.error("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };
  const fetchAssets = async () => {
    const res = await getAssets(currentOrgId);
    setAssets(res);
  };

  useEffect(() => {
    if (!currentOrgId) return;
    fetchMaintenances();
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
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "asset_name",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Service Type</span>,
      dataIndex: "serviceType",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Service Provider</span>
      ),
      dataIndex: "serviceProvider",
      width: 180,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Service Date</span>,
      dataIndex: "serviceDate",
      width: 130,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : ""}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Next Due</span>,
      dataIndex: "next_service_due_date",
      width: 130,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Cost (₹)</span>,
      dataIndex: "cost",
      width: 110,
      render: (c) => <span className="text-amber-800">{c ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (s) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (s === "Completed")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              Completed
            </span>
          );
        if (s === "In Progress")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              In Progress
            </span>
          );
        if (s === "Cancelled")
          return (
            <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>
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
            onClick={() => handleView(record.id)}
          />

          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleEditOpen(record.id)}
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
      "Maintenance ID",
      "Asset ID",
      "Service Type",
      "Service Provider",
      "Service Date",
      "Next Service Due",
      "Cost",
      "Status",
      "Remarks",
    ];
    const rows = data.map((r) => [
      r.maintenanceId,
      r.assetId,
      r.serviceType,
      r.serviceProvider,
      r.serviceDate,
      r.nextServiceDue,
      r.cost,
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
    a.download = `asset_maintenance_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addUploadProps = {
    fileList: addFileList,
    beforeUpload: (file) => {
      // keep file in list but prevent auto upload
      setAddFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setAddFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const editUploadProps = {
    fileList: editFileList,
    beforeUpload: (file) => {
      setEditFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setEditFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const handleAdd = async (values) => {
    try {
      setLoading(true);

      await addAssetMaintenance({
        organisation: currentOrgId,
        asset: values.assetId,

        service_type: values.serviceType,
        service_provider: values.serviceProvider,

        service_date: values.serviceDate.format("YYYY-MM-DD"),
        next_service_due_date: values.nextServiceDue
          ? values.nextServiceDue.format("YYYY-MM-DD")
          : null,

        cost: values.cost ? values.cost.toString() : "0.00",
        status: values.status,

        remarks: values.remarks || null,
      });

      message.success("Maintenance record added");
      setIsAddModalOpen(false);
      addForm.resetFields();
      setAddFileList([]);
      fetchMaintenances();
    } catch (err) {
      console.log(err?.response?.data);
      message.error("Failed to add maintenance record");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      setLoading(true);

      await updateAssetMaintenance(selectedRecord.id, {
        organisation: currentOrgId,
        asset: values.assetId,

        service_type: values.serviceType,
        service_provider: values.serviceProvider,

        service_date: values.serviceDate.format("YYYY-MM-DD"),
        next_service_due_date: values.nextServiceDue
          ? values.nextServiceDue.format("YYYY-MM-DD")
          : null,

        cost: values.cost ? values.cost.toString() : "0.00",
        status: values.status,

        remarks: values.remarks || null,
      });

      message.success("Maintenance updated");
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedRecord(null);
      setEditFileList([]);
      fetchMaintenances();
    } catch (err) {
      console.log(err?.response?.data);
      message.error("Failed to update maintenance");
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = (form, disabled = false, mode = "add") => (
    <>
      <h6 className="text-amber-500">Maintenance Details</h6>
      <Row gutter={16}>
        {/* <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Maintenance ID</span>}
            name="maintenanceId"
            rules={[{ required: true, message: "Please enter Maintenance ID" }]}
          >
            <Input placeholder="e.g. MAINT-001" disabled={disabled} />
          </Form.Item>
        </Col> */}

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
            label={<span className="text-amber-700">Service Type</span>}
            name="serviceType"
            rules={[{ required: true, message: "Please select Service Type" }]}
          >
            <Select placeholder="Select Service Type" disabled={disabled}>
              {serviceTypeOptions.map((s) => (
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
              <span className="text-amber-700">Service Provider Name</span>
            }
            name="serviceProvider"
            rules={[
              { required: true, message: "Please enter Service Provider" },
            ]}
          >
            <Input placeholder="Service Provider" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Service Date</span>}
            name="serviceDate"
            rules={[{ required: true, message: "Please select Service Date" }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700">Next Service Due Date</span>
            }
            name="nextServiceDue"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Cost (₹)</span>}
            name="cost"
            rules={[
              {
                validator: (_, value) => {
                  if (value === undefined || value === null)
                    return Promise.resolve();
                  if (Number.isNaN(value)) {
                    return Promise.reject("Only numbers are allowed");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              disabled={disabled}
              controls={false}
              parser={(value) => value.replace(/[^\d.]/g, "")}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Status</span>}
            name="status"
            rules={[{ required: true, message: "Please select Status" }]}
            initialValue="Scheduled"
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
            <TextArea rows={1} placeholder="Any notes" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      {/* <h6 className="text-amber-500 mt-4">File Upload</h6>
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
          Asset Maintenance
        </h2>
        <p className="text-amber-600 mb-3">
          Manage maintenance, calibration & service records
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
            Add Maintenance Record
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
            Edit Maintenance Record
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedRecord(null);
          setEditFileList([]);
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
                setSelectedRecord(null);
                setEditFileList([]);
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
        title="View Maintenance Record"
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

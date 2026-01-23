// AssetAllocation.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
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
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import { addAssetAllocation, getAssetAllocations, getAssets, updateAssetAllocation } from "../../api/assets";

export default function AssetAllocation() {

  const { currentOrgId } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [assets, setAssets] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const conditionOptions = ["New", "Good", "Fair", "Damaged"];

  const filteredData = data.filter((row) =>
    ["allocationId", "assetId", "assignedTo", "remarks"].some((f) =>
      (row[f] || "").toString().toLowerCase().includes(searchText.trim().toLowerCase())
    )
  );

  const fetchAssets = async () => {
    try {
      const res = await getAssets(currentOrgId);
      setAssets(res);
    } catch {
      message.error("Failed to load assets");
    }
  };

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const response = await getAssetAllocations(currentOrgId);

      const transformed = response.map((item) => ({
        key: item.id,
        id: item.id,
        allocationId: item.allocation_id,
        assetId: item.asset?.asset_code,
        assetPk: item.asset?.id,
        assetName: item.asset?.asset_name,
        assignedTo: item.assigned_to,
        allocationDate: item.allocation_date,
        returnDate: item.return_date,
        conditionAtIssue: item.condition_at_issue,
        conditionAtReturn: item.condition_at_return,
        remarks: item.remarks,
      }));

      setData(transformed);
    } catch (err) {
      message.error("Failed to load allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentOrgId) return;
    fetchAllocations();
    fetchAssets();
  }, [currentOrgId]);

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Allocation ID</span>,
      dataIndex: "allocationId",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Asset ID</span>,
      dataIndex: "assetId",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Assigned To</span>,
      dataIndex: "assignedTo",
      width: 160,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Allocation Date</span>,
      dataIndex: "allocationDate",
      width: 130,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Return Date</span>,
      dataIndex: "returnDate",
      width: 130,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Condition (Issue)</span>,
      dataIndex: "conditionAtIssue",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Condition (Return)</span>,
      dataIndex: "conditionAtReturn",
      width: 140,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Remarks</span>,
      dataIndex: "remarks",
      width: 200,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      dataIndex: "actions",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue({
                ...record,
                allocationDate: record.allocationDate ? dayjs(record.allocationDate) : undefined,
                returnDate: record.returnDate ? dayjs(record.returnDate) : undefined,
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
                allocationDate: record.allocationDate ? dayjs(record.allocationDate) : undefined,
                returnDate: record.returnDate ? dayjs(record.returnDate) : undefined,
              });
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleAdd = async (values) => {
    try {
      setLoading(true);

      await addAssetAllocation(currentOrgId, {
        asset: values.assetId,
        assigned_to: values.assignedTo,
        allocation_date: values.allocationDate.format("YYYY-MM-DD"),
        return_date: values.returnDate
          ? values.returnDate.format("YYYY-MM-DD")
          : null,
        condition_at_issue: values.conditionAtIssue,
        condition_at_return: values.conditionAtReturn || null,
        remarks: values.remarks || "",
      });

      message.success("Asset allocated successfully");
      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchAllocations();
    } catch (err) {
      message.error("Failed to allocate asset");
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = async (values) => {
    try {
      setLoading(true);

      await updateAssetAllocation(selectedRecord.id, {
        asset: values.assetId,
        assigned_to: values.assignedTo,
        allocation_date: values.allocationDate.format("YYYY-MM-DD"),
        return_date: values.returnDate
          ? values.returnDate.format("YYYY-MM-DD")
          : null,
        condition_at_issue: values.conditionAtIssue,
        condition_at_return: values.conditionAtReturn || null,
        remarks: values.remarks || "",
      });


      message.success("Allocation updated");
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedRecord(null);
      fetchAllocations();
    } catch {
      message.error("Failed to update allocation");
    } finally {
      setLoading(false);
    }
  };


  const exportCSV = () => {
    // simple CSV export (client-side)
    if (!data.length) {
      message.info("No data to export");
      return;
    }
    const headers = [
      "Asset Name",
      "Asset ID",
      "Assigned To",
      "Allocation Date",
      "Return Date",
      "Condition At Issue",
      "Condition At Return",
      "Remarks",
    ];
    const rows = data.map((r) => [
      r.assetName,
      r.assetId,
      r.assignedTo,
      r.allocationDate,
      r.returnDate,
      r.conditionAtIssue,
      r.conditionAtReturn,
      (r.remarks || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent =
      [headers, ...rows].map((e) => e.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset_allocations_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Allocation Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          {/* <Form.Item
            label={<span className="text-amber-700">Assset Name</span>}
            name="allocationId"
            rules={[{ required: true, message: "Please enter Allocation ID" }]}
          >
            <Input placeholder="e.g. ALLOC-001" disabled={disabled} />
          </Form.Item> */}
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Asset</span>}
            name="assetId"
            rules={[{ required: true, message: "Please select asset" }]}
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
            label={<span className="text-amber-700">Assigned To</span>}
            name="assignedTo"
            rules={[{ required: true, message: "Please enter assignee" }]}
          >
            <Input placeholder="Employee / Dept" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Allocation Date</span>}
            name="allocationDate"
            rules={[{ required: true, message: "Please select Allocation Date" }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Return Date</span>} name="returnDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Condition at Issue</span>}
            name="conditionAtIssue"
            rules={[{ required: true, message: "Please select condition" }]}
          >
            <select className="w-full p-2 border rounded" disabled={disabled} defaultValue="">
              <option value="" disabled>
                Select condition
              </option>
              {conditionOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Condition at Return</span>} name="conditionAtReturn">
            <select className="w-full p-2 border rounded" disabled={disabled} defaultValue="">
              <option value="" disabled>
                Select condition
              </option>
              {conditionOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Form.Item>
        </Col>

        <Col span={16}>
          <Form.Item label={<span className="text-amber-700">Remarks</span>} name="remarks">
            <Input.TextArea rows={2} placeholder="Any notes" disabled={disabled} />
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
          <Button icon={<DownloadOutlined />} onClick={exportCSV} className="border-amber-400! text-amber-700! hover:bg-amber-100!">
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
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Asset Allocations</h2>
        <p className="text-amber-600 mb-3">Manage asset issuance & returns</p>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 6 }}
          loading={loading}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add Asset Allocation</span>}
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAdd}
          onValuesChange={() => { }}
        >
          {renderFormFields(addForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Asset Allocation</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedRecord(null);
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
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setSelectedRecord(null);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Asset Allocation"
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

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
  Select,
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
import {
  addAssetAllocation,
  getAssetAllocations,
  getAllAssets,
} from "../../api/assets";
import useSessionStore from "../../store/sessionStore";

const { Option } = Select;

export default function AssetAllocation() {
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

  const conditionOptions = ["New", "Good", "Fair", "Damaged"];

  // ✅ fetch allocations
  const fetchassetallocations = async () => {
    try {
      setLoading(true);
      const allocations = await getAssetAllocations();

      setData(
        allocations
          .filter((a) => a.organisation === currentOrgId) // ✅ filter by org
          .map((alloc) => ({
            key: alloc.id,
            id: alloc.id,

            allocationId: alloc.allocation_id,
            asset: alloc.asset, // backend field (uuid)
            assignedTo: alloc.assigned_to,

            allocationDate: alloc.allocation_date,
            returnDate: alloc.return_date,

            conditionAtIssue: alloc.condition_at_issue,
            conditionAtReturn: alloc.condition_at_return,
            remarks: alloc.remarks,
          })),
      );
    } catch (error) {
      message.error("Failed to fetch asset allocations.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ fetch assets for dropdown
  const fetchAssets = async () => {
    try {
      const res = await getAllAssets();

      const filtered = res.filter((a) => a.organisation === currentOrgId);

      setAssets(
        filtered.map((a) => ({
          id: a.id, // asset uuid used in allocation payload
          name: a.asset_name,
          code: a.asset_code,
        })),
      );
    } catch (err) {
      message.error("Failed to load assets list");
    }
  };

  useEffect(() => {
    if (!currentOrgId) return;
    fetchassetallocations();
    fetchAssets();
  }, [currentOrgId]);

  const filteredData = data.filter((row) =>
    ["allocationId", "asset", "assignedTo", "remarks"].some((f) =>
      (row[f] || "")
        .toString()
        .toLowerCase()
        .includes(searchText.trim().toLowerCase()),
    ),
  );

  // ✅ API add allocation
  const handleAdd = async (values) => {
    try {
      setLoading(true);

      const payload = {
        organisation: currentOrgId,
        asset: values.asset, // uuid from dropdown
        assigned_to: values.assignedTo || null,

        allocation_date: values.allocationDate
          ? dayjs(values.allocationDate).format("YYYY-MM-DD")
          : null,

        return_date: values.returnDate
          ? dayjs(values.returnDate).format("YYYY-MM-DD")
          : null,

        condition_at_issue: values.conditionAtIssue,
        condition_at_return: values.conditionAtReturn || null,

        remarks: values.remarks || null,
      };

      const newAllocation = await addAssetAllocation(payload);

      setData((prev) => [
        {
          key: newAllocation.id,
          id: newAllocation.id,

          allocationId: newAllocation.allocation_id,
          asset: newAllocation.asset,
          assignedTo: newAllocation.assigned_to,

          allocationDate: newAllocation.allocation_date,
          returnDate: newAllocation.return_date,

          conditionAtIssue: newAllocation.condition_at_issue,
          conditionAtReturn: newAllocation.condition_at_return,
          remarks: newAllocation.remarks,
        },
        ...prev,
      ]);

      setIsAddModalOpen(false);
      addForm.resetFields();
      message.success("Asset allocation added.");
    } catch (error) {
      console.log(error?.response?.data);
      message.error("Failed to add asset allocation.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">SL No</span>,
      width: 80,
      render: (_, __, index) => (
        <span className="text-amber-800">{index + 1}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Asset</span>,
      dataIndex: "asset",
      width: 220,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Assigned To</span>,
      dataIndex: "assignedTo",
      width: 160,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Allocation Date</span>
      ),
      dataIndex: "allocationDate",
      width: 140,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : ""}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Return Date</span>,
      dataIndex: "returnDate",
      width: 140,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Condition (Issue)</span>
      ),
      dataIndex: "conditionAtIssue",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Condition (Return)</span>
      ),
      dataIndex: "conditionAtReturn",
      width: 150,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Remarks</span>,
      dataIndex: "remarks",
      width: 220,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
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
                allocationDate: record.allocationDate
                  ? dayjs(record.allocationDate)
                  : undefined,
                returnDate: record.returnDate
                  ? dayjs(record.returnDate)
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
                allocationDate: record.allocationDate
                  ? dayjs(record.allocationDate)
                  : undefined,
                returnDate: record.returnDate
                  ? dayjs(record.returnDate)
                  : undefined,
              });
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  // ✅ form fields with dropdown
  const renderFormFields = (disabled = false) => (
    <>
      <h6 className="text-amber-500">Allocation Details</h6>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Asset Name</span>}
            name="asset"
            rules={[{ required: true, message: "Please select an Asset" }]}
          >
            <Select
              placeholder="Select Asset"
              disabled={disabled}
              showSearch
              optionFilterProp="children"
            >
              {assets.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.name} ({a.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Assigned To</span>}
            name="assignedTo"
          >
            <Input placeholder="Employee ID (optional)" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Allocation Date</span>}
            name="allocationDate"
            rules={[
              { required: true, message: "Please select Allocation Date" },
            ]}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Return Date</span>}
            name="returnDate"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Condition at Issue</span>}
            name="conditionAtIssue"
            rules={[{ required: true, message: "Please select condition" }]}
          >
            <Select placeholder="Select condition" disabled={disabled}>
              {conditionOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Condition at Return</span>}
            name="conditionAtReturn"
          >
            <Select
              placeholder="Select condition"
              disabled={disabled}
              allowClear
            >
              {conditionOptions.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={<span className="text-amber-700">Remarks</span>}
            name="remarks"
          >
            <Input.TextArea
              rows={2}
              placeholder="Any notes"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search allocations..."
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
            onClick={() => message.info("Export not changed")}
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
              addForm.setFieldsValue({ allocationDate: dayjs() });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Asset Allocations
        </h2>
        <p className="text-amber-600 mb-3">Manage asset issuance & returns</p>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </div>

      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add Asset Allocation
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          {renderFormFields(false)}

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
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

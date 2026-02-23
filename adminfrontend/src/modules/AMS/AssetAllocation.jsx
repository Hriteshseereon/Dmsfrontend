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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import {
  addAssetAllocation,
  getAssetAllocations,
  getAllAssets,
  getAssetAllocationById,
  updateAssetAllocation,
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

  // write the function to dowload the table data as excel file
  const handleExportExcel = () => {
    try {
      if (!filteredData.length) {
        message.warning("No allocation data to export");
        return;
      }

      // helper → convert asset uuid to readable name
      const getAssetLabel = (assetId) => {
        const asset = assets.find((a) => a.id === assetId);
        return asset ? `${asset.name} (${asset.code})` : assetId;
      };

      const exportData = filteredData.map((item, index) => ({
        "SL No": index + 1,
        Asset: getAssetLabel(item.asset),
        "Assigned To": item.assignedTo || "-",

        "Allocation Date": item.allocationDate
          ? dayjs(item.allocationDate).format("DD-MM-YYYY")
          : "",

        "Return Date": item.returnDate
          ? dayjs(item.returnDate).format("DD-MM-YYYY")
          : "-",

        "Condition At Issue": item.conditionAtIssue,
        "Condition At Return": item.conditionAtReturn || "-",
        Remarks: item.remarks || "-",
      }));

      // worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // professional column width
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 20 },
        { wch: 35 },
      ];

      // workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Allocations");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Asset_Allocations_${dayjs().format(
        "YYYY-MM-DD_HH-mm",
      )}.xlsx`;

      saveAs(blob, fileName);

      message.success("Allocation data exported successfully");
    } catch (error) {
      console.error(error);
      message.error("Export failed");
    }
  };
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
  // handle  view option
  const handleView = async (record) => {
    try {
      setLoading(true);

      const data = await getAssetAllocationById(record.id);

      setSelectedRecord(data);
      setIsViewModalOpen(true);
      viewForm.setFieldsValue({
        asset: data.asset,
        assignedTo: data.assigned_to,
        allocationDate: data.allocation_date
          ? dayjs(data.allocation_date)
          : undefined,
        returnDate: data.return_date ? dayjs(data.return_date) : undefined,
        conditionAtIssue: data.condition_at_issue,
        conditionAtReturn: data.condition_at_return,
        remarks: data.remarks,
      });

      setIsViewModalOpen(true);
    } catch (err) {
      message.error("Failed to load allocation details");
    } finally {
      setLoading(false);
    }
  };
  // handle edit function
  const handleEdit = async (record) => {
    try {
      setLoading(true);

      const data = await getAssetAllocationById(record.id);

      setSelectedRecord({ ...data, id: record.id });

      editForm.setFieldsValue({
        asset: data.asset,
        assignedTo: data.assigned_to,
        allocationDate: data.allocation_date
          ? dayjs(data.allocation_date)
          : undefined,
        returnDate: data.return_date ? dayjs(data.return_date) : undefined,
        conditionAtIssue: data.condition_at_issue,
        conditionAtReturn: data.condition_at_return,
        remarks: data.remarks,
      });

      setIsEditModalOpen(true);
    } catch (err) {
      message.error("Failed to load allocation for edit");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdate = async (values) => {
    try {
      setLoading(true);

      const payload = {
        asset: values.asset,
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

      await updateAssetAllocation(selectedRecord.id, payload);

      message.success("Allocation updated successfully");

      setIsEditModalOpen(false);
      fetchassetallocations(); // refresh table
    } catch (err) {
      message.error("Failed to update allocation");
    } finally {
      setLoading(false);
    }
  };
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
            onClick={() => handleView(record)}
          />

          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleEdit(record)}
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
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Asset Allocation
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={920}
      >
        <Form form={viewForm} layout="vertical">
          {renderFormFields(true)}
        </Form>
      </Modal>
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit Asset Allocation
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={920}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate} // 👈 important
        >
          {renderFormFields(false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => setIsEditModalOpen(false)}
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
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

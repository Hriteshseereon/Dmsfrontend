import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import {
  getTdsMasters,
  getCurrentTdsMaster,
  addTdsMaster,
  updateTdsMaster,
  deleteTdsMaster,
} from "../../../../../../api/tdsmaster";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

dayjs.extend(customParseFormat);

// The API returns dates as DD-MM-YYYY (YYYY-MM-DD is accepted too). Parse strictly - a plain
// dayjs("01-04-2026") would read it as 4 January.
const formatDate = (value) => {
  if (!value) return "-";
  const d = dayjs(value, ["DD-MM-YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d.format("DD-MM-YYYY") : String(value);
};

// The list endpoint may return a bare array, { data: [...] } or a paginated { results: [...] }
const toList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  const firstVal = firstKey ? data[firstKey] : null;
  if (firstVal) {
    const text = Array.isArray(firstVal) ? firstVal[0] : firstVal;
    return `${firstKey}: ${typeof text === "string" ? text : JSON.stringify(text)}`;
  }
  return fallback;
};

export default function TdsMaster() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [financialYears, setFinancialYears] = useState({
    current: null,
    next: null,
  });

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, currentRes] = await Promise.allSettled([
        getTdsMasters(),
        getCurrentTdsMaster(),
      ]);

      if (listRes.status === "rejected") {
        console.error(listRes.reason);
        message.error("Failed to fetch TDS configuration");
      }
      const list = listRes.status === "fulfilled" ? toList(listRes.value) : [];
      setRows(list);

      // `current` is used only for the two FY labels
      const current = currentRes.status === "fulfilled" ? currentRes.value : null;
      setFinancialYears({
        current:
          current?.current_financial_year ||
          list[0]?.current_financial_year ||
          null,
        next:
          current?.next_financial_year || list[0]?.next_financial_year || null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openAdd = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRow(record);
    form.resetFields();
    form.setFieldsValue({
      threshold_amount: Number(record.threshold_amount),
      tds_percentage: Number(record.tds_percentage),
      is_active: record.is_active !== false,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRow(null);
    form.resetFields();
  };

  // Same rule the server applies when creating: if the current FY already has an active policy, a new
  // one is scheduled for the next FY, and each FY can hold only one policy.
  const hasPolicyFor = (fy) =>
    Boolean(fy) &&
    rows.some(
      (r) => r.effective_financial_year === fy && r.is_active !== false,
    );
  const currentFyConfigured = hasPolicyFor(financialYears.current);
  const nextFyConfigured = hasPolicyFor(financialYears.next);
  const bothFysConfigured = currentFyConfigured && nextFyConfigured;

  const handleSubmit = async (values) => {
    const payload = {
      threshold_amount: Number(values.threshold_amount).toFixed(2),
      tds_percentage: Number(values.tds_percentage).toFixed(2),
      is_active: Boolean(values.is_active),
    };

    setSubmitting(true);
    try {
      if (editingRow) {
        // Send the FY and start date back unchanged: on a partial update the server would otherwise
        // recompute them from today's date and could move this policy to a different financial year.
        await updateTdsMaster(editingRow.id, {
          ...payload,
          effective_financial_year: editingRow.effective_financial_year,
          implementation_from_date: editingRow.implementation_from_date,
        });
        message.success("TDS configuration updated successfully");
      } else {
        // Dates / FY are intentionally omitted: the backend picks the current FY, or the
        // next FY when the current FY already has a policy.
        await addTdsMaster(payload);
        message.success("TDS configuration saved successfully");
      }
      closeModal();
      fetchAll();
    } catch (err) {
      console.error(err);
      message.error(
        getErrorMessage(
          err,
          editingRow
            ? "Failed to update TDS configuration"
            : "Failed to save TDS configuration",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTdsMaster(id);
      message.success("TDS configuration deleted successfully");
      fetchAll();
    } catch (err) {
      console.error(err);
      message.error(getErrorMessage(err, "Failed to delete TDS configuration"));
    }
  };

  // Active = current FY, Scheduled = future FY, Past = earlier FY. FY labels look like "2026-2027",
  // so a plain string compare orders them correctly.
  const getStatus = (record) => {
    if (record.is_active === false) return { label: "Inactive", color: "default" };
    const fy = record.effective_financial_year;
    const current = financialYears.current;
    if (fy && current) {
      if (fy === current) return { label: "Active", color: "green" };
      if (fy > current) return { label: "Scheduled", color: "blue" };
      return { label: "Past FY", color: "orange" };
    }
    return { label: "Active", color: "green" };
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Financial Year</span>,
      dataIndex: "effective_financial_year",
      render: (t) => <span className="text-amber-800 font-medium">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Threshold Amount</span>,
      dataIndex: "threshold_amount",
      align: "right",
      render: (t) => <span className="text-amber-800">{formatINR(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">TDS Rate</span>,
      dataIndex: "tds_percentage",
      align: "center",
      render: (t) => (
        <span className="text-amber-800 font-medium">
          {Number(t || 0).toFixed(2)}%
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Effective From</span>,
      dataIndex: "implementation_from_date",
      align: "center",
      render: (t) => <span className="text-amber-800">{formatDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      align: "center",
      render: (_, record) => {
        const { label, color } = getStatus(record);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 110,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <EditOutlined
            className="cursor-pointer !text-blue-500 hover:text-blue-600"
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this TDS configuration?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="cursor-pointer !text-gray-500 hover:text-gray-700" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ---------------- FY INFO + ACTIONS ---------------- */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="gold" className="text-xs m-0 py-0.5 px-2">
            Current Financial Year: <b>{financialYears.current || "-"}</b>
          </Tag>
          <Tag color="orange" className="text-xs m-0 py-0.5 px-2">
            Next Financial Year: <b>{financialYears.next || "-"}</b>
          </Tag>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAll}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Refresh
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add New
        </Button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-3 bg-white shadow-md">
        <Table
          columns={columns}
          dataSource={rows}
          loading={loading}
          pagination={{ pageSize: 15, hideOnSinglePage: true }}
          rowKey="id"
          size="small"
          locale={{ emptyText: "No TDS configuration added yet" }}
          className="[&_.ant-table-cell]:!px-2 [&_.ant-table-cell]:!py-1 [&_.ant-table-thead_th]:!py-1.5"
        />
      </div>

      {/* ---------------- ADD / EDIT MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            {editingRow ? "Edit TDS Configuration" : "Add TDS Configuration"}
          </span>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">TDS Details</h6>

            {editingRow ? (
              <Alert
                type="info"
                showIcon
                className="!mb-3"
                message={`Financial Year ${editingRow.effective_financial_year || "-"} · effective from ${formatDate(editingRow.implementation_from_date)}`}
              />
            ) : (
              <Alert
                type={bothFysConfigured ? "warning" : "info"}
                showIcon
                className="!mb-3"
                message={
                  bothFysConfigured
                    ? `Policies already exist for both FY ${financialYears.current} and FY ${financialYears.next}. Edit one of them instead of adding a new one.`
                    : currentFyConfigured
                      ? `A policy already exists for FY ${financialYears.current || "-"}. This new policy will be scheduled for the next financial year${financialYears.next ? ` (${financialYears.next})` : ""}, starting 01-04.`
                      : `This policy will apply to the current financial year${financialYears.current ? ` (${financialYears.current})` : ""}.`
                }
              />
            )}

            <Form.Item
              name="threshold_amount"
              label="Threshold Amount (₹)"
              rules={[{ required: true, message: "Please enter threshold amount" }]}
              className="!mb-3"
              extra={
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.threshold_amount !== cur.threshold_amount
                  }
                >
                  {({ getFieldValue }) => {
                    const v = getFieldValue("threshold_amount");
                    return v || v === 0 ? (
                      <span className="text-amber-700 font-medium">
                        {formatINR(v)}
                      </span>
                    ) : null;
                  }}
                </Form.Item>
              }
            >
              <InputNumber
                className="w-full"
                min={0}
                precision={2}
                placeholder="e.g. 5000000"
              />
            </Form.Item>

            <Form.Item
              name="tds_percentage"
              label="TDS Percentage (%)"
              rules={[{ required: true, message: "Please enter TDS percentage" }]}
              className="!mb-3"
            >
              <InputNumber
                className="w-full"
                min={0}
                max={100}
                precision={2}
                placeholder="e.g. 1"
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Active"
              valuePropName="checked"
              className="!mb-0"
            >
              <Switch />
            </Form.Item>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={closeModal}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={!editingRow && bothFysConfigured}
              className="bg-amber-500! border-none! text-white"
            >
              {editingRow ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

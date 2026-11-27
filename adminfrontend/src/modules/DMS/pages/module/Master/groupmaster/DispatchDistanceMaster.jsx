import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AutoComplete,
  Button,
  Card,
  Form,
  Input,
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
  SearchOutlined,
} from "@ant-design/icons";

import {
  getDispatchDistances,
  addDispatchDistanceRows,
  updateDispatchDistance,
  deleteDispatchDistance,
  getDefaultDispatchFrom,
} from "../../../../../../api/dispatchdistance";
import { getApiErrorMessage } from "../../../../../../utils/apiError";

const toList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

const emptyRow = (dispatchFrom = "") => ({
  dispatch_from: dispatchFrom,
  dispatch_to: "",
  distance_km: undefined,
});

/**
 * Dispatch Distance Master: routes (dispatch from -> dispatch to) with the distance in km.
 * Purchase invoice entry reads these to fill the Dispatch From / Dispatch To dropdowns and the distance.
 *
 * Adding works row by row: row 1 asks for all three values, every next row starts with the previous
 * row's "Dispatch From", so usually only "Dispatch To" and the distance need typing.
 */
export default function DispatchDistanceMaster() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addOpen, setAddOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Last seen "Dispatch From" values of the add form, to know which later rows were following the edited one
  const prevFromsRef = useRef([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setRows(toList(await getDispatchDistances()));
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to load dispatch distances"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Existing "Dispatch From" values, offered as suggestions (a new place can still be typed)
  const fromOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.dispatch_from).filter(Boolean))]
        .sort()
        .map((v) => ({ value: v })),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.dispatch_from || "").toLowerCase().includes(q) ||
        String(r.dispatch_to || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  /* ---------------- add (many rows) ---------------- */
  const openAdd = async () => {
    let defaultFrom = "";
    try {
      defaultFrom = (await getDefaultDispatchFrom()) || "";
    } catch {
      /* the first row can simply be typed */
    }
    addForm.setFieldsValue({ routes: [emptyRow(defaultFrom)] });
    prevFromsRef.current = [defaultFrom];
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    addForm.resetFields();
  };

  // Editing a row's "Dispatch From" carries it to the rows below that still held the old value
  const handleAddValuesChange = (_, all) => {
    const routes = all.routes || [];
    const prev = prevFromsRef.current;
    const changedAt = routes.findIndex((r, i) => (r?.dispatch_from || "") !== (prev[i] || ""));
    if (changedAt >= 0 && routes.length > changedAt + 1) {
      const oldValue = prev[changedAt] || "";
      const newValue = routes[changedAt]?.dispatch_from || "";
      const next = routes.map((r, i) =>
        i > changedAt && (r?.dispatch_from || "") === oldValue
          ? { ...r, dispatch_from: newValue }
          : r,
      );
      addForm.setFieldsValue({ routes: next });
      prevFromsRef.current = next.map((r) => r?.dispatch_from || "");
      return;
    }
    prevFromsRef.current = routes.map((r) => r?.dispatch_from || "");
  };

  const handleAddSubmit = async (values) => {
    const routes = (values.routes || []).map((r) => ({
      dispatch_from: String(r.dispatch_from || "").trim(),
      dispatch_to: String(r.dispatch_to || "").trim(),
      distance_km: r.distance_km,
    }));
    setSubmitting(true);
    try {
      await addDispatchDistanceRows(routes);
      message.success(`${routes.length} route${routes.length > 1 ? "s" : ""} added`);
      closeAdd();
      fetchAll();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to save routes"));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- edit (one row) ---------------- */
  const openEdit = (record) => {
    setEditingRow(record);
    editForm.setFieldsValue({
      dispatch_from: record.dispatch_from,
      dispatch_to: record.dispatch_to,
      distance_km: Number(record.distance_km),
      is_active: record.is_active !== false,
    });
  };

  const closeEdit = () => {
    setEditingRow(null);
    editForm.resetFields();
  };

  const handleEditSubmit = async (values) => {
    setSubmitting(true);
    try {
      await updateDispatchDistance(editingRow.id, {
        dispatch_from: String(values.dispatch_from || "").trim(),
        dispatch_to: String(values.dispatch_to || "").trim(),
        distance_km: values.distance_km,
        is_active: values.is_active,
      });
      message.success("Route updated");
      closeEdit();
      fetchAll();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to update route"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDispatchDistance(id);
      message.success("Route deleted");
      fetchAll();
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to delete route"));
    }
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Sr No</span>,
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: <span className="text-amber-700 font-semibold">Dispatch From</span>,
      dataIndex: "dispatch_from",
      sorter: (a, b) => String(a.dispatch_from).localeCompare(String(b.dispatch_from)),
      render: (t) => <span className="font-semibold text-amber-900">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Dispatch To</span>,
      dataIndex: "dispatch_to",
      sorter: (a, b) => String(a.dispatch_to).localeCompare(String(b.dispatch_to)),
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Distance (KM)</span>,
      dataIndex: "distance_km",
      align: "right",
      sorter: (a, b) => Number(a.distance_km) - Number(b.distance_km),
      render: (t) => (
        <span className="font-semibold text-amber-900">
          {Number(t || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "is_active",
      align: "center",
      width: 100,
      render: (v) => <Tag color={v === false ? "default" : "success"}>{v === false ? "Inactive" : "Active"}</Tag>,
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
            title="Are you sure to delete this route?"
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
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search dispatch from / to"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border-amber-300!"
          />
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

      <div className="border border-amber-300 rounded-lg p-3 bg-white shadow-md">
        <Table
          columns={columns}
          dataSource={filteredRows}
          loading={loading}
          pagination={{ pageSize: 15, hideOnSinglePage: true }}
          rowKey="id"
          size="small"
          locale={{ emptyText: "No dispatch distance added yet" }}
          className="[&_.ant-table-cell]:!px-2 [&_.ant-table-cell]:!py-1 [&_.ant-table-thead_th]:!py-1.5"
        />
      </div>

      {/* ---------------- ADD MODAL (multi row) ---------------- */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">Add Dispatch Distance</span>}
        open={addOpen}
        onCancel={closeAdd}
        footer={null}
        width={760}
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddSubmit}
          onValuesChange={handleAddValuesChange}
          className="mt-4"
        >
          <Card bordered className="border-amber-300">
            <div
              className="grid gap-2 mb-1 text-xs font-bold text-amber-800"
              style={{ gridTemplateColumns: "1fr 1fr 150px 32px" }}
            >
              <div>Dispatch From</div>
              <div>Dispatch To</div>
              <div>Distance (KM)</div>
              <div />
            </div>

            <Form.List name="routes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="grid gap-2 items-start"
                      style={{ gridTemplateColumns: "1fr 1fr 150px 32px" }}
                    >
                      <Form.Item
                        name={[field.name, "dispatch_from"]}
                        rules={[{ required: true, whitespace: true, message: "Required" }]}
                        className="!mb-2"
                      >
                        <AutoComplete
                          options={fromOptions}
                          placeholder="e.g. Haldia"
                          filterOption={(input, option) =>
                            String(option?.value || "").toLowerCase().includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "dispatch_to"]}
                        rules={[{ required: true, whitespace: true, message: "Required" }]}
                        className="!mb-2"
                      >
                        <Input placeholder="e.g. Kolkata" />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "distance_km"]}
                        rules={[{ required: true, message: "Required" }]}
                        className="!mb-2"
                      >
                        <InputNumber className="w-full" min={0} precision={2} placeholder="e.g. 120" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={fields.length <= 1}
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const routes = addForm.getFieldValue("routes") || [];
                      // Same "Dispatch From" as the row above; only the destination and distance are new
                      add(emptyRow(routes[routes.length - 1]?.dispatch_from || ""));
                    }}
                    className="border-amber-400! text-amber-700! font-semibold"
                  >
                    Add Row
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={closeAdd}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-amber-500! border-none! text-white"
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL (single row) ---------------- */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">Edit Dispatch Distance</span>}
        open={Boolean(editingRow)}
        onCancel={closeEdit}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} className="mt-4">
          <Card bordered className="border-amber-300">
            <Form.Item
              name="dispatch_from"
              label="Dispatch From"
              rules={[{ required: true, whitespace: true, message: "Please enter dispatch from" }]}
              className="!mb-3"
            >
              <AutoComplete
                options={fromOptions}
                filterOption={(input, option) =>
                  String(option?.value || "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              name="dispatch_to"
              label="Dispatch To"
              rules={[{ required: true, whitespace: true, message: "Please enter dispatch to" }]}
              className="!mb-3"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="distance_km"
              label="Distance (KM)"
              rules={[{ required: true, message: "Please enter distance" }]}
              className="!mb-3"
            >
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
            <Form.Item name="is_active" label="Active" valuePropName="checked" className="!mb-0">
              <Switch />
            </Form.Item>
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={closeEdit}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-amber-500! border-none! text-white"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

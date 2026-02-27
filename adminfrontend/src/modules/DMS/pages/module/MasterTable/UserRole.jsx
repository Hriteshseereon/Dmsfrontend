import React, { useState, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Checkbox,
  Divider,
  Tag,
  Switch,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import moment from "moment";

// ─────────────────────────────────────────────────────────────────
//  APP_MODULES  (copied from appModules.js — replace with import)
// ─────────────────────────────────────────────────────────────────
// const APP_MODULES = [
//   {
//     id: "dashboard",
//     label: "Dashboard",
//     basePath: "/dashboard",
//     actions: ["view"],
//   },
//   {
//     id: "organization",
//     label: "Organization",
//     basePath: "/organizations",
//     actions: ["view", "create", "edit", "delete"],
//   },
//   {
//     id: "dms",
//     label: "DMS",
//     basePath: "/dms",
//     children: [
//       {
//         id: "purchase",
//         label: "Purchase",
//         basePath: "/dms/purchase",
//         children: [
//           { id: "dashboard", label: "Dashboard", actions: ["view"] },
//           { id: "souda", label: "Souda", actions: ["view", "create", "edit"] },
//           {
//             id: "indent",
//             label: "Indent",
//             actions: ["view", "create", "edit"],
//           },
//           {
//             id: "invoice",
//             label: "Invoice",
//             actions: ["view", "create", "edit"],
//           },
//           { id: "loading", label: "Loading Advice", actions: ["view", "edit"] },
//           { id: "status", label: "Delivery Status", actions: ["view"] },
//           { id: "return", label: "Return", actions: ["view", "create"] },
//         ],
//       },
//       {
//         id: "sales",
//         label: "Sales",
//         basePath: "/dms/sales",
//         children: [
//           { id: "dashboard", label: "Dashboard", actions: ["view"] },
//           { id: "souda", label: "Souda", actions: ["view", "create", "edit"] },
//           {
//             id: "orders",
//             label: "Orders",
//             actions: ["view", "create", "edit"],
//           },
//           { id: "status", label: "Delivery Status", actions: ["view"] },
//           { id: "return", label: "Return", actions: ["view", "create"] },
//           { id: "dispute", label: "Dispute", actions: ["view", "edit"] },
//         ],
//       },
//       {
//         id: "master",
//         label: "Master",
//         basePath: "/dms/master",
//         children: [
//           {
//             id: "product",
//             label: "Product",
//             actions: ["view", "create", "edit", "delete"],
//           },
//           {
//             id: "business_partner",
//             label: "Business Partner",
//             actions: ["view", "create", "edit"],
//           },
//           { id: "inventory", label: "Inventory", actions: ["view", "edit"] },
//           {
//             id: "hsn_sac",
//             label: "HSN/SAC",
//             actions: ["view", "create", "edit"],
//           },
//           {
//             id: "unit_conversion",
//             label: "Unit Conversion",
//             actions: ["view", "edit"],
//           },
//           { id: "price", label: "Price Manager", actions: ["view", "edit"] },
//           { id: "itemsprice", label: "Item Price", actions: ["view", "edit"] },
//         ],
//       },
//       {
//         id: "reports",
//         label: "Reports",
//         basePath: "/dms/reports",
//         actions: ["view", "export"],
//       },
//       {
//         id: "settings",
//         label: "Profile Settings",
//         basePath: "/dms/settings",
//         actions: ["view", "edit"],
//       },
//     ],
//   },
//   {
//     id: "wms",
//     label: "Wealth Management",
//     basePath: "/wms",
//     children: [
//       { id: "dashboard", actions: ["view"] },
//       { id: "stock", actions: ["view", "create", "edit"] },
//       { id: "etf", actions: ["view", "create", "edit"] },
//       { id: "mutualfunds", actions: ["view", "create", "edit"] },
//       { id: "bank", actions: ["view", "create", "edit"] },
//       { id: "nps", actions: ["view", "create", "edit"] },
//       { id: "ulip", actions: ["view", "create", "edit"] },
//       { id: "privateequity", actions: ["view", "create", "edit"] },
//       { id: "deposits", actions: ["view", "create", "edit"] },
//       { id: "ppf", actions: ["view", "edit"] },
//       { id: "epf", actions: ["view", "edit"] },
//       { id: "fd", actions: ["view", "create"] },
//       { id: "postoffice", actions: ["view", "create"] },
//       { id: "gold", actions: ["view", "create", "edit"] },
//       { id: "silver", actions: ["view", "create", "edit"] },
//       { id: "platinum", actions: ["view", "create", "edit"] },
//       { id: "property", actions: ["view", "create", "edit"] },
//       { id: "art", actions: ["view", "create", "edit"] },
//     ],
//   },
//   {
//     id: "ams",
//     label: "Asset Management",
//     basePath: "/ams",
//     children: [
//       { id: "dashboard", actions: ["view"] },
//       { id: "assetcategory", actions: ["view", "create", "edit", "delete"] },
//       { id: "assetadd", actions: ["view", "create", "edit"] },
//       { id: "assetallocation", actions: ["view", "edit"] },
//       { id: "assetmaintenance", actions: ["view", "edit"] },
//       { id: "assetdepreciation", actions: ["view"] },
//       { id: "assetdisposal", actions: ["view", "create"] },
//     ],
//   },
// ];
import { APP_MODULES } from "../../../../../access-control/modules";
// ─────────────────────────────────────────────────────────────────
//  PERMISSION UTILS
//  Permission key: "moduleId.subId.action"  (or "moduleId.action" for flat)
//  e.g.  "dms.purchase.souda.view"  |  "dashboard.view"
// ─────────────────────────────────────────────────────────────────

// Capitalize and space-separate camelCase/underscore ids for display
const fmtId = (id) =>
  id
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

const buildPermissionTree = () => {
  const nodes = [];

  const walk = (mod, parents = []) => {
    if (mod.actions) {
      const keyParts = [...parents.map((p) => p.id), mod.id];

      // groupKey: what section header this row belongs to
      // depth-0 leaf  → own label
      // depth-1 leaf  → root parent label
      // depth-2+ leaf → depth-1 ancestor label (e.g. Purchase, Sales, Master)
      let groupKey;
      if (parents.length === 0) {
        groupKey = mod.label || fmtId(mod.id);
      } else if (parents.length === 1) {
        groupKey = parents[0].label || fmtId(parents[0].id);
      } else {
        groupKey = parents[1].label || fmtId(parents[1].id);
      }

      // rowLabel: path shown inside the group row (skip root + group-level parents)
      let rowParts;
      if (parents.length <= 1) {
        rowParts = [mod.label || fmtId(mod.id)];
      } else {
        rowParts = [
          ...parents.slice(2).map((p) => p.label || fmtId(p.id)),
          mod.label || fmtId(mod.id),
        ];
      }

      nodes.push({
        permKey: keyParts.join("."),
        groupKey,
        rowLabel: rowParts.join(" > "),
        actions: mod.actions,
      });
    }
    if (mod.children) {
      mod.children.forEach((child) => walk(child, [...parents, mod]));
    }
  };

  APP_MODULES.forEach((mod) => walk(mod, []));
  return nodes;
};

const PERMISSION_NODES = buildPermissionTree();

const groupBySection = () => {
  const groups = {};
  PERMISSION_NODES.forEach((node) => {
    if (!groups[node.groupKey]) groups[node.groupKey] = [];
    groups[node.groupKey].push(node);
  });
  return groups;
};

const GROUPED_PERMISSIONS = groupBySection();

const ACTION_COLOR = {
  view: "blue",
  create: "green",
  edit: "orange",
  delete: "red",
  export: "purple",
};

// ─────────────────────────────────────────────────────────────────
//  INITIAL DATA  (permissions stored as Set-serialized array)
// ─────────────────────────────────────────────────────────────────
const initialUserData = [
  {
    key: 1,
    userName: "ADMIN",
    password: "******",
    phone: "9876543210",
    address: "Pune",
    email: "admin@example.com",
    userType: "Administrator",
    fullName: "KOUSHAL",
    designation: "ADMIN",
    privilegeUser: "Administrator",
    privilegeType: "Permanent",
    startDate: null,
    endDate: null,
    // permissions: array of "permKey.action" strings
    permissions: [
      "dashboard.view",
      "organization.view",
      "organization.create",
      "dms.purchase.souda.view",
      "dms.purchase.souda.create",
      "ams.dashboard.view",
    ],
  },
];

const USER_TYPES = [
  "Administrator",
  "User",
  "Accounts",
  "HR",
  "Operations",
  "Transport",
];
// converts flat permissions → nested payload
const buildPermissionPayload = (permissions = []) => {
  const result = {};

  permissions.forEach((perm) => {
    const parts = perm.split(".");
    const action = parts.pop(); // last = action

    let current = result;

    parts.forEach((part, index) => {
      const isLastNode = index === parts.length - 1;

      if (isLastNode) {
        if (!current[part]) current[part] = [];

        if (!current[part].includes(action)) {
          current[part].push(action);
        }
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  return result;
};
// ─────────────────────────────────────────────────────────────────
//  PERMISSION SELECTOR COMPONENT
// ─────────────────────────────────────────────────────────────────
const PermissionSelector = ({ value = [], onChange, disabled = false }) => {
  const selected = new Set(value);

  const toggle = (permKey, action) => {
    if (disabled) return;
    const key = `${permKey}.${action}`;
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange?.(Array.from(next));
  };

  const toggleAll = (permKey, actions) => {
    if (disabled) return;
    const keys = actions.map((a) => `${permKey}.${a}`);
    const allOn = keys.every((k) => selected.has(k));
    const next = new Set(selected);
    keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    onChange?.(Array.from(next));
  };

  const toggleGroup = (groupName) => {
    if (disabled) return;
    const nodes = GROUPED_PERMISSIONS[groupName] || [];
    const allKeys = nodes.flatMap((n) =>
      n.actions.map((a) => `${n.permKey}.${a}`),
    );
    const allOn = allKeys.every((k) => selected.has(k));
    const next = new Set(selected);
    allKeys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    onChange?.(Array.from(next));
  };

  return (
    <div className="permission-matrix">
      {Object.entries(GROUPED_PERMISSIONS).map(([groupName, nodes]) => {
        const allGroupKeys = nodes.flatMap((n) =>
          n.actions.map((a) => `${n.permKey}.${a}`),
        );
        const allOn = allGroupKeys.every((k) => selected.has(k));
        const someOn = allGroupKeys.some((k) => selected.has(k));

        return (
          <div key={groupName} className="perm-group">
            <div className="perm-group-header">
              {!disabled && (
                <Checkbox
                  checked={allOn}
                  indeterminate={!allOn && someOn}
                  onChange={() => toggleGroup(groupName)}
                  className="group-toggle"
                />
              )}
              <span className="group-label">{groupName}</span>
            </div>

            <div className="perm-rows">
              {nodes.map((node) => {
                const rowAllOn = node.actions.every((a) =>
                  selected.has(`${node.permKey}.${a}`),
                );
                const rowSomeOn = node.actions.some((a) =>
                  selected.has(`${node.permKey}.${a}`),
                );
                return (
                  <div key={node.permKey} className="perm-row">
                    <div className="perm-row-label">
                      {!disabled && (
                        <Checkbox
                          checked={rowAllOn}
                          indeterminate={!rowAllOn && rowSomeOn}
                          onChange={() => toggleAll(node.permKey, node.actions)}
                        />
                      )}
                      <span className="sub-label">{node.rowLabel}</span>
                    </div>
                    <div className="perm-row-actions">
                      {node.actions.map((action) => {
                        const key = `${node.permKey}.${action}`;
                        const isOn = selected.has(key);
                        return (
                          <Tooltip key={action} title={`${action}`}>
                            <Tag
                              color={
                                isOn
                                  ? ACTION_COLOR[action] || "default"
                                  : "default"
                              }
                              className={`action-tag ${isOn ? "active" : "inactive"} ${disabled ? "" : "clickable"}`}
                              onClick={() => toggle(node.permKey, action)}
                            >
                              {action}
                            </Tag>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function UserRoleMaster() {
  const [data, setData] = useState(initialUserData);
  const [searchText, setSearchText] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [privilegeType, setPrivilegeType] = useState("Permanent");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const resetAll = () => {
    addForm.resetFields();
    editForm.resetFields();
    viewForm.resetFields();
    setPrivilegeType("Permanent");
    setSelectedRecord(null);
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      typeof val === "string"
        ? val.toLowerCase().includes(searchText.toLowerCase())
        : Array.isArray(val)
          ? val.join(" ").toLowerCase().includes(searchText.toLowerCase())
          : false,
    ),
  );

  const handleSubmit = (values, isEdit = false) => {
    const formatted = {
      ...values,
      privilegeType,
      startDate:
        privilegeType === "Temporary" && values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
      endDate:
        privilegeType === "Temporary" && values.endDate
          ? values.endDate.format("YYYY-MM-DD")
          : null,

      permissions: buildPermissionPayload(values.permissions || []),
      password:
        isEdit && !values.password ? selectedRecord.password : values.password,
    };

    if (isEdit) {
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key
            ? { ...formatted, key: item.key }
            : item,
        ),
      );
      setIsEditOpen(false);
    } else {
      setData((prev) => [
        ...prev,
        { ...formatted, key: prev.length ? prev[prev.length - 1].key + 1 : 1 },
      ]);
      setIsAddOpen(false);
    }
    resetAll();
  };

  const openEdit = (record) => {
    setSelectedRecord(record);
    setPrivilegeType(record.privilegeType);
    editForm.setFieldsValue({
      ...record,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
    });
    setIsEditOpen(true);
  };

  const openView = (record) => {
    setSelectedRecord(record);
    setPrivilegeType(record.privilegeType);
    viewForm.setFieldsValue({
      ...record,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
    });
    setIsViewOpen(true);
  };

  // ── Shared form body ──────────────────────────────────────────
  const renderFormBody = (form, disabled = false) => (
    <>
      <Row gutter={24}>
        <Col span={6}>
          <Form.Item
            label="User Name"
            name="userName"
            rules={[{ required: !disabled, message: "Enter User Name" }]}
          >
            <Input placeholder="Enter User Name" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Full Name" name="fullName">
            <Input placeholder="Enter Full Name" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: !disabled, message: "Enter Phone" },
              { pattern: /^[0-9]{10}$/, message: "Enter valid 10-digit phone" },
            ]}
          >
            <Input
              placeholder="Enter Phone"
              disabled={disabled}
              maxLength={10}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: !disabled, message: "Enter Email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter Email" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: !disabled, message: "Enter Address" }]}
          >
            <Input placeholder="Enter Address" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Designation" name="designation">
            <Input placeholder="Enter Designation" disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: !disabled && isAddOpen, message: "Enter Password" },
            ]}
          >
            <Input.Password
              placeholder={
                isEditOpen ? "Leave blank to keep password" : "Enter Password"
              }
              disabled={disabled}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="User Type"
            name="userType"
            rules={[{ required: !disabled, message: "Select User Type" }]}
          >
            <Select placeholder="Select User Type" disabled={disabled}>
              {USER_TYPES.map((u) => (
                <Select.Option key={u} value={u}>
                  {u}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item
            label="Privilege User"
            name="privilegeUser"
            rules={[{ required: !disabled, message: "Select Privilege User" }]}
          >
            <Select placeholder="Select Privilege User" disabled={disabled}>
              {USER_TYPES.map((u) => (
                <Select.Option key={u} value={u}>
                  {u}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Privilege Type"
            name="privilegeType"
            rules={[{ required: !disabled, message: "Select Privilege Type" }]}
          >
            <Select
              placeholder="Select Privilege Type"
              disabled={disabled}
              onChange={(v) => {
                setPrivilegeType(v);
                if (v === "Permanent")
                  form.setFieldsValue({ startDate: null, endDate: null });
              }}
            >
              <Select.Option value="Permanent">Permanent</Select.Option>
              <Select.Option value="Temporary">Temporary</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[
              {
                required: privilegeType === "Temporary" && !disabled,
                message: "Select Start Date",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabled={disabled || privilegeType !== "Temporary"}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="End Date"
            name="endDate"
            rules={[
              {
                required: privilegeType === "Temporary" && !disabled,
                message: "Select End Date",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabled={disabled || privilegeType !== "Temporary"}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left" className="perm-divider">
        <LockOutlined style={{ marginRight: 6 }} />
        Module & Action Permissions
      </Divider>

      <Form.Item name="permissions" valuePropName="value" trigger="onChange">
        <PermissionSelector disabled={disabled} />
      </Form.Item>
    </>
  );

  // ── Columns ───────────────────────────────────────────────────
  const columns = [
    {
      title: <span className="col-head">User Name</span>,
      dataIndex: "userName",
      width: 130,
      render: (text, record) => (
        <span className="cell-primary">
          {text}
          <Tag
            className="ml-1"
            color={record.privilegeType === "Permanent" ? "green" : "orange"}
            style={{ fontSize: 10 }}
          >
            {record.privilegeType === "Permanent" ? "P" : "T"}
          </Tag>
        </span>
      ),
    },
    {
      title: <span className="col-head">Full Name</span>,
      dataIndex: "fullName",
      width: 120,
      render: (t) => <span className="cell-text">{t || "—"}</span>,
    },
    {
      title: <span className="col-head">User Type</span>,
      dataIndex: "userType",
      width: 120,
      render: (t) => <span className="cell-text">{t}</span>,
    },
    {
      title: <span className="col-head">Privilege User</span>,
      dataIndex: "privilegeUser",
      width: 120,
      render: (t) => <span className="cell-text">{t}</span>,
    },
    {
      title: <span className="col-head">Validity</span>,
      dataIndex: "startDate",
      width: 150,
      render: (_, record) =>
        record.privilegeType === "Temporary" ? (
          <span className="cell-text">
            {record.startDate} → {record.endDate}
          </span>
        ) : (
          <Tag color="green">Permanent</Tag>
        ),
    },
    {
      title: <span className="col-head">Permissions</span>,
      dataIndex: "permissions",
      render: (perms = []) => (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 260 }}
        >
          {perms.slice(0, 4).map((p) => {
            const parts = p.split(".");
            const action = parts[parts.length - 1];
            return (
              <Tag
                key={p}
                color={ACTION_COLOR[action] || "default"}
                style={{ fontSize: 10, margin: 0 }}
              >
                {parts.slice(-2).join(".")}
              </Tag>
            );
          })}
          {perms.length > 4 && (
            <Tag style={{ fontSize: 10 }}>+{perms.length - 4} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: <span className="col-head">Actions</span>,
      width: 80,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="action-icon view"
            onClick={() => openView(record)}
          />
          <EditOutlined
            className="action-icon edit"
            onClick={() => openEdit(record)}
          />
        </div>
      ),
    },
  ];

  // ── Modal helper ──────────────────────────────────────────────
  const modalFooter = (isEdit = false) => (
    <div className="flex justify-end gap-2 mt-6">
      <Button
        onClick={() => {
          isEdit ? setIsEditOpen(false) : setIsAddOpen(false);
          resetAll();
        }}
        className="btn-outline"
      >
        Cancel
      </Button>
      <Button type="primary" htmlType="submit" className="btn-primary">
        {isEdit ? "Update" : "Add"}
      </Button>
    </div>
  );

  return (
    <>
      <style>{`
        /* ─── Modal body scroll ──────────────── */
        .ant-modal-body { max-height: 88vh; overflow-y: auto; padding-right: 10px; }
        .ant-modal-body::-webkit-scrollbar { width: 5px; }
        .ant-modal-body::-webkit-scrollbar-thumb { background: #fcd34d; border-radius: 4px; }

        /* ─── Layout ─────────────────────────── */
        .urm-wrap { font-family: 'DM Sans', sans-serif; }
        .col-head { color: #b45309; font-weight: 600; }
        .cell-primary { color: #92400e; font-weight: 600; }
        .cell-text { color: #78350f; }
        .action-icon { cursor: pointer; font-size: 15px; transition: transform .15s; }
        .action-icon.view { color: #3b82f6; }
        .action-icon.edit { color: #ef4444; }
        .action-icon:hover { transform: scale(1.25); }

        /* ─── Buttons ────────────────────────── */
        .btn-outline { border-color: #fcd34d !important; color: #b45309 !important; }
        .btn-outline:hover { background: #fef3c7 !important; }
        .btn-primary { background: #d97706 !important; border-color: #d97706 !important; }
        .btn-primary:hover { background: #b45309 !important; border-color: #b45309 !important; }

        /* ─── Divider ────────────────────────── */
        .perm-divider { color: #b45309 !important; font-weight: 600; margin-top: 8px !important; }

        /* ─── Permission Matrix ──────────────── */
        /* ─── Permission Matrix ──────────────── */
        .permission-matrix {
          display: flex; flex-direction: column; gap: 14px;
          // max-height: 600px; overflow-y: auto;
          padding: 4px 4px 4px 2px;
        }
        .permission-matrix::-webkit-scrollbar { width: 5px; }
        .permission-matrix::-webkit-scrollbar-thumb { background: #fcd34d; border-radius: 4px; }

        .perm-group { border: 1px solid #fde68a; border-radius: 10px; overflow: hidden; }
        .perm-group-header {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          padding: 9px 14px; font-weight: 700; font-size: 13px; color: #92400e;
          text-transform: uppercase; letter-spacing: .5px;
           position: sticky;
  top: 0;
  z-index: 2;
        }
        .group-label { flex: 1; }
        .perm-rows { display: flex; flex-direction: column; }
        .perm-row {
          display: flex;
          align-items: center;
          padding: 7px 14px;
          gap: 10px;
          border-top: 1px solid #fef3c7;
          transition: background .15s;
          min-height: 38px;
        }
        .perm-row:hover { background: #fffbeb; }
        .perm-row-label {
          display: flex; align-items: center; gap: 8px;
          flex: 1; min-width: 0;
        }
        .sub-label {
          font-size: 12.5px; color: #78350f; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          flex: 1; min-width: 0;
        }
        .perm-row-actions {
          display: flex; gap: 5px; align-items: center;
          flex-shrink: 0; margin-left: auto;
        }

        .action-tag {
          border-radius: 4px !important; cursor: default; user-select: none;
          font-size: 11.5px !important; font-weight: 600; padding: 1px 10px !important;
          margin: 0 !important; line-height: 20px !important;
          min-width: 52px; text-align: center;
          transition: opacity .15s, transform .12s;
        }
        .action-tag.inactive { opacity: .22; filter: grayscale(.4); }
        .action-tag.clickable { cursor: pointer; }
        .action-tag.clickable:hover { opacity: .8; transform: scale(1.08); }
        .action-tag.active { opacity: 1; box-shadow: 0 1px 4px rgba(0,0,0,.15); }
      `}</style>

      <div className="urm-wrap">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search..."
              style={{ width: 240 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button icon={<FilterOutlined />} onClick={() => setSearchText("")}>
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="btn-primary"
              onClick={() => {
                resetAll();
                setIsAddOpen(true);
              }}
            >
              Add User
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-0 text-amber-700">
            User Role Records
          </h2>
          <p className="text-amber-600 mb-3">
            Manage users & their module permissions
          </p>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            scroll={{ y: 220 }}
            rowKey="key"
          />
        </div>

        {/* ADD Modal */}
        <Modal
          title={
            <span style={{ color: "#b45309", fontWeight: 700 }}>
              Add New User
            </span>
          }
          open={isAddOpen}
          onCancel={() => {
            setIsAddOpen(false);
            resetAll();
          }}
          footer={null}
          width={1100}
          maskClosable={false}
          destroyOnClose
        >
          <Form
            layout="vertical"
            form={addForm}
            onFinish={(v) => handleSubmit(v, false)}
            initialValues={{ privilegeType: "Permanent", permissions: [] }}
          >
            {renderFormBody(addForm, false)}
            {modalFooter(false)}
          </Form>
        </Modal>

        {/* EDIT Modal */}
        <Modal
          title={
            <span style={{ color: "#b45309", fontWeight: 700 }}>
              Edit User: {selectedRecord?.userName}
            </span>
          }
          open={isEditOpen}
          onCancel={() => {
            setIsEditOpen(false);
            resetAll();
          }}
          footer={null}
          width={1100}
          maskClosable={false}
          destroyOnClose
        >
          <Form
            layout="vertical"
            form={editForm}
            onFinish={(v) => handleSubmit(v, true)}
          >
            {renderFormBody(editForm, false)}
            {modalFooter(true)}
          </Form>
        </Modal>

        {/* VIEW Modal */}
        <Modal
          title={
            <span style={{ color: "#b45309", fontWeight: 700 }}>
              View User: {selectedRecord?.userName}
            </span>
          }
          open={isViewOpen}
          onCancel={() => {
            setIsViewOpen(false);
            resetAll();
          }}
          footer={null}
          width={1100}
          destroyOnClose
        >
          <Form layout="vertical" form={viewForm}>
            {renderFormBody(viewForm, true)}
          </Form>
        </Modal>
      </div>
    </>
  );
}

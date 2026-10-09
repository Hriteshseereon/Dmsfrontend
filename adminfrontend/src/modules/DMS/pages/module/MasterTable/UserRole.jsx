import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Checkbox,
  Divider,
  Tag,
  Space,
  Card,
  Tooltip,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  BookOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  GoldOutlined,
  WalletOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AppDatePicker from "../../../../../components/AppDatePicker";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  SYSTEM_MODULES_CONFIG,
  ROLE_PRESETS,
  buildEmptyPermissions,
  buildFullPermissions,
  countPermissions,
} from "../../../../../utils/permissions";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../../../api/userService";
import { useAuth } from "../../../../../context/AuthContext";

const { Option } = Select;

// Fallback initial users for offline/dev demo
const INITIAL_FALLBACK_USERS = [
  {
    id: "1",
    key: "1",
    userName: "ADMIN",
    email: "admin@dms.com",
    phone: "9876543210",
    address: "AUM Agro Headquarters, Indore",
    privilegeType: "Permanent",
    rolePreset: "admin",
    startDate: null,
    endDate: null,
    isActive: true,
    permissions: buildFullPermissions(),
    createdAt: "2026-01-01",
  },
  {
    id: "2",
    key: "2",
    userName: "Rohan Verma",
    email: "rohan.sales@aumagro.com",
    phone: "9823012345",
    address: "Regional Branch, Pune",
    privilegeType: "Permanent",
    rolePreset: "sales_manager",
    startDate: null,
    endDate: null,
    isActive: true,
    permissions: ROLE_PRESETS.find((r) => r.id === "sales_manager").getPermissions(),
    createdAt: "2026-02-15",
  },
  {
    id: "3",
    key: "3",
    userName: "Priya Sharma",
    email: "priya.purchase@aumagro.com",
    phone: "9811223344",
    address: "Haldia Plant Office, WB",
    privilegeType: "Temporary",
    rolePreset: "purchase_manager",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    isActive: true,
    permissions: ROLE_PRESETS.find((r) => r.id === "purchase_manager").getPermissions(),
    createdAt: "2026-10-01",
  },
];

const LOCAL_STORAGE_KEY = "dms_user_roles_master_v3";

export default function UserRole() {
  const { currentOrgId, user: currentUser } = useAuth();

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading users from localStorage", e);
    }
    return INITIAL_FALLBACK_USERS;
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [filterPrivilege, setFilterPrivilege] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");

  // Form Instances
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Active form permission matrix state
  const [activePermissions, setActivePermissions] = useState(buildEmptyPermissions());
  const [activePrivilegeType, setActivePrivilegeType] = useState("Permanent");
  const [activeRolePreset, setActiveRolePreset] = useState("admin");
  const [searchModuleQuery, setSearchModuleQuery] = useState("");
  const [selectedMatrixTab, setSelectedMatrixTab] = useState("all");

  /**
   * Fetch users from backend API
   */
  const fetchUsersList = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (currentOrgId) params.organisation = currentOrgId;
      if (searchText.trim()) params.search = searchText.trim();
      if (filterPrivilege !== "ALL") params.privilege = filterPrivilege;
      if (filterRole !== "ALL") params.role = filterRole;

      const res = await getUsers(params);
      const userResults = res?.results || (Array.isArray(res) ? res : res?.data) || [];

      if (userResults.length > 0) {
        const formatted = userResults.map((u, idx) => ({
          key: u.id || u.key || `user-${idx}`,
          id: u.id || u.key,
          userName: u.userName || u.username || "User",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
          privilegeType: u.privilegeType || u.privilege_type || "Permanent",
          rolePreset: u.rolePreset || u.role_preset || "custom",
          startDate: u.startDate || u.start_date || null,
          endDate: u.endDate || u.end_date || null,
          isActive: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true),
          permissions: u.permissions || (u.rolePreset === "admin" ? buildFullPermissions() : buildEmptyPermissions()),
          createdAt: u.createdAt || u.created_at || dayjs().format("YYYY-MM-DD"),
        }));
        setData(formatted);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn("Backend users list unavailable, using cached state:", err.message);
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, searchText, filterPrivilege, filterRole]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving users to localStorage", e);
    }
  }, [data]);

  const stats = useMemo(() => {
    const totalUsers = data.length;
    const permanentCount = data.filter((u) => u.privilegeType === "Permanent").length;
    const temporaryCount = data.filter((u) => u.privilegeType === "Temporary").length;
    return { totalUsers, permanentCount, temporaryCount };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone?.includes(searchText) ||
        item.address?.toLowerCase().includes(searchText.toLowerCase());

      const matchesPrivilege =
        filterPrivilege === "ALL" || item.privilegeType === filterPrivilege;

      const matchesRole =
        filterRole === "ALL" || item.rolePreset === filterRole;

      return matchesSearch && matchesPrivilege && matchesRole;
    });
  }, [data, searchText, filterPrivilege, filterRole]);

  const handlePermissionChange = (submoduleKey, action, checked) => {
    setActivePermissions((prev) => ({
      ...prev,
      [submoduleKey]: {
        ...(prev[submoduleKey] || { view: false, add: false, edit: false, delete: false }),
        [action]: checked,
      },
    }));
    setActiveRolePreset("custom");
  };

  const handleSubmoduleToggleAll = (submoduleKey, checked) => {
    setActivePermissions((prev) => ({
      ...prev,
      [submoduleKey]: {
        view: checked,
        add: checked,
        edit: checked,
        delete: checked,
      },
    }));
    setActiveRolePreset("custom");
  };

  const handleModuleToggleAll = (moduleKey, checked) => {
    const modConfig = SYSTEM_MODULES_CONFIG.find((m) => m.key === moduleKey);
    if (!modConfig) return;

    setActivePermissions((prev) => {
      const next = { ...prev };
      modConfig.submodules.forEach((sub) => {
        next[sub.key] = {
          view: checked,
          add: checked,
          edit: checked,
          delete: checked,
        };
      });
      return next;
    });
    setActiveRolePreset("custom");
  };

  const handleModuleActionToggle = (moduleKey, action, checked) => {
    const modConfig = SYSTEM_MODULES_CONFIG.find((m) => m.key === moduleKey);
    if (!modConfig) return;

    setActivePermissions((prev) => {
      const next = { ...prev };
      modConfig.submodules.forEach((sub) => {
        next[sub.key] = {
          ...(next[sub.key] || {}),
          [action]: checked,
        };
      });
      return next;
    });
    setActiveRolePreset("custom");
  };

  const handleGrantAll = () => {
    setActivePermissions(buildFullPermissions());
    setActiveRolePreset("admin");
    message.success("Granted Full Access across all 47 submodules!");
  };

  const handleGrantViewOnly = () => {
    const p = buildEmptyPermissions();
    SYSTEM_MODULES_CONFIG.forEach((m) => {
      m.submodules.forEach((s) => {
        p[s.key] = { view: true, add: false, edit: false, delete: false };
      });
    });
    setActivePermissions(p);
    setActiveRolePreset("auditor");
    message.info("Applied View-Only permissions across all modules");
  };

  const handleClearAllPermissions = () => {
    setActivePermissions(buildEmptyPermissions());
    setActiveRolePreset("custom");
    message.info("Cleared all permissions");
  };

  const handleRolePresetSelect = (presetId) => {
    setActiveRolePreset(presetId);
    const preset = ROLE_PRESETS.find((r) => r.id === presetId);
    if (preset) {
      setActivePermissions(preset.getPermissions());
      message.success(`Applied "${preset.name}" preset`);
    }
  };

  const openAddModal = () => {
    addForm.resetFields();
    setActivePermissions(buildFullPermissions());
    setActivePrivilegeType("Permanent");
    setActiveRolePreset("admin");
    setSearchModuleQuery("");
    setSelectedMatrixTab("all");
    setIsAddModalOpen(true);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    editForm.setFieldsValue({
      userName: record.userName,
      email: record.email,
      phone: record.phone,
      address: record.address,
      privilegeType: record.privilegeType,
      rolePreset: record.rolePreset || "custom",
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      password: "",
    });
    setActivePermissions(record.permissions || buildEmptyPermissions());
    setActivePrivilegeType(record.privilegeType || "Permanent");
    setActiveRolePreset(record.rolePreset || "custom");
    setSearchModuleQuery("");
    setSelectedMatrixTab("all");
    setIsEditModalOpen(true);
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    setActivePermissions(record.permissions || buildEmptyPermissions());
    setSelectedMatrixTab("all");
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = async (form, isEdit = false) => {
    try {
      const values = await form.validateFields();

      const { total } = countPermissions(activePermissions);
      if (total === 0) {
        message.warning("Please grant at least one module permission to this user.");
        return;
      }

      const formattedStartDate =
        activePrivilegeType === "Temporary" && values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null;
      const formattedEndDate =
        activePrivilegeType === "Temporary" && values.endDate
          ? values.endDate.format("YYYY-MM-DD")
          : null;

      if (activePrivilegeType === "Temporary") {
        if (!formattedStartDate || !formattedEndDate) {
          message.error("Both Start Date and End Date are required when privilegeType is 'Temporary'.");
          return;
        }
        if (dayjs(formattedStartDate).isAfter(dayjs(formattedEndDate))) {
          message.error("End Date must be greater than or equal to Start Date.");
          return;
        }
      }

      setSubmitting(true);

      const payload = {
        organisation: currentOrgId || currentUser?.organisation_id,
        userName: values.userName.trim(),
        username: values.userName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone ? values.phone.trim() : "",
        address: values.address ? values.address.trim() : "",
        privilegeType: activePrivilegeType,
        rolePreset: activeRolePreset,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        isActive: true,
        permissions: activePermissions,
      };

      if (values.password) {
        payload.password = values.password;
      }

      if (isEdit) {
        try {
          if (selectedRecord.id && typeof selectedRecord.id === "string" && selectedRecord.id.length > 5) {
            await updateUser(selectedRecord.id, payload);
          }
        } catch (apiErr) {
          console.warn("Backend update error, updating local state:", apiErr.message);
        }

        setData((prev) =>
          prev.map((item) => {
            if (item.key === selectedRecord.key || item.id === selectedRecord.id) {
              return {
                ...item,
                ...payload,
                key: item.key,
                id: item.id,
              };
            }
            return item;
          })
        );
        message.success(`User "${values.userName}" updated successfully!`);
        setIsEditModalOpen(false);
      } else {
        let createdUserId = null;
        try {
          const res = await createUser(payload, currentOrgId);
          createdUserId = res?.data?.id || res?.id;
        } catch (apiErr) {
          const errMsg =
            apiErr.response?.data?.email?.[0] ||
            apiErr.response?.data?.privilegeType?.[0] ||
            apiErr.response?.data?.endDate?.[0] ||
            apiErr.response?.data?.detail ||
            apiErr.message;
          message.error(errMsg);
          setSubmitting(false);
          return;
        }

        const newUser = {
          key: createdUserId || `user-${Date.now()}`,
          id: createdUserId || `user-${Date.now()}`,
          ...payload,
          createdAt: dayjs().format("YYYY-MM-DD"),
        };

        setData((prev) => [newUser, ...prev]);
        message.success(`User "${values.userName}" created successfully with permissions!`);
        setIsAddModalOpen(false);
      }

      fetchUsersList();
    } catch (err) {
      console.error("Form validation failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (record) => {
    try {
      if (record.id && typeof record.id === "string" && record.id.length > 5) {
        await deleteUser(record.id);
      }
      setData((prev) => prev.filter((item) => item.key !== record.key && item.id !== record.id));
      message.success(`User "${record.userName}" deleted successfully!`);
      fetchUsersList();
    } catch (err) {
      message.error(err.response?.data?.detail || "Could not delete user.");
    }
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      message.info("No records to export");
      return;
    }

    const rows = filteredData.map((u, idx) => {
      const perms = countPermissions(u.permissions);
      return {
        "SL NO": idx + 1,
        "USER NAME": u.userName,
        EMAIL: u.email,
        PHONE: u.phone,
        ADDRESS: u.address,
        "PRIVILEGE TYPE": u.privilegeType,
        "ROLE PRESET": u.rolePreset || "Custom",
        "VALID FROM": u.startDate || "-",
        "VALID TO": u.endDate || "-",
        "TOTAL PERMISSIONS": perms.total,
        "VIEW ACCESS": perms.view,
        "ADD ACCESS": perms.add,
        "EDIT ACCESS": perms.edit,
        "DELETE ACCESS": perms.delete,
        "CREATED DATE": u.createdAt || "-",
      };
    });

    exportToExcel(rows, `User_Role_Master_${dayjs().format("DD_MM_YYYY")}`, "Users");
  };

  // --- RENDER MASSIVE & CRYSTAL-CLEAR PERMISSIONS MATRIX ---
  const renderPermissionsMatrix = (disabled = false) => {
    const modulesToDisplay = SYSTEM_MODULES_CONFIG.filter((m) => {
      if (selectedMatrixTab !== "all" && m.key !== selectedMatrixTab) return false;
      return true;
    })
      .map((mod) => {
        if (!searchModuleQuery) return mod;
        const q = searchModuleQuery.toLowerCase();
        const matchedSub = mod.submodules.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            mod.name.toLowerCase().includes(q) ||
            s.key.toLowerCase().includes(q)
        );
        if (matchedSub.length > 0) {
          return { ...mod, submodules: matchedSub };
        }
        return null;
      })
      .filter(Boolean);

    const tabItems = [
      { key: "all", label: "🌐 All Modules Overview" },
      ...SYSTEM_MODULES_CONFIG.map((m) => ({
        key: m.key,
        label: `${m.name}`,
      })),
    ];

    return (
      <div className="space-y-4">
        {/* Module Sub-Tabs & Filter Bar */}
        <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 p-4 rounded-xl border border-amber-300 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <Input
              prefix={<SearchOutlined className="text-amber-500 text-lg mr-1" />}
              placeholder="Search screen or submodule name (e.g. Invoices, Souda, Ledgers, Reports)..."
              value={searchModuleQuery}
              onChange={(e) => setSearchModuleQuery(e.target.value)}
              allowClear
              className="w-full max-w-lg h-11 text-sm border-amber-300! font-medium shadow-xs"
            />
          </div>

          {!disabled && (
            <div className="flex items-center gap-3">
              <Button
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={handleGrantAll}
                className="bg-emerald-600! hover:bg-emerald-700! text-white! border-none! font-extrabold text-sm shadow-xs px-4 h-11"
              >
                Grant Full Access (All)
              </Button>
              <Button
                size="large"
                icon={<EyeOutlined />}
                onClick={handleGrantViewOnly}
                className="border-amber-400! text-amber-900! hover:bg-amber-100! font-extrabold text-sm h-11 px-4"
              >
                View Only All
              </Button>
              <Button
                size="large"
                icon={<CloseSquareOutlined />}
                onClick={handleClearAllPermissions}
                danger
                className="font-extrabold text-sm h-11 px-4"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Module Selection Pills */}
        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs flex flex-wrap gap-2 items-center">
          {tabItems.map((tab) => {
            const isActive = selectedMatrixTab === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => setSelectedMatrixTab(tab.key)}
                className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-400"
                    : "bg-gray-100/80 text-gray-700 hover:bg-amber-100/70 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modules List Container */}
        <div className="space-y-5 max-h-[580px] overflow-y-auto pr-2">
          {modulesToDisplay.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <p className="text-base text-gray-600 font-bold mb-2">
                No matching screens found for "{searchModuleQuery}".
              </p>
              <Button
                type="primary"
                onClick={() => setSearchModuleQuery("")}
                className="bg-amber-500!"
              >
                Clear Search Filter
              </Button>
            </div>
          ) : (
            modulesToDisplay.map((mod) => {
              const totalPossible = mod.submodules.length * 4;
              let checkedCount = 0;
              let allView = true,
                allAdd = true,
                allEdit = true,
                allDel = true;

              mod.submodules.forEach((s) => {
                const sp = activePermissions[s.key] || {};
                if (sp.view) checkedCount++;
                else allView = false;
                if (sp.add) checkedCount++;
                else allAdd = false;
                if (sp.edit) checkedCount++;
                else allEdit = false;
                if (sp.delete) checkedCount++;
                else allDel = false;
              });

              const isModuleFullyChecked = checkedCount === totalPossible && totalPossible > 0;
              const isModuleIndeterminate = checkedCount > 0 && checkedCount < totalPossible;

              return (
                <div
                  key={mod.key}
                  className="border-2 border-amber-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-amber-400 transition-all"
                >
                  {/* Module Header Row */}
                  <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-white px-5 py-3.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-xs">
                        <AppstoreOutlined />
                      </div>
                      {!disabled ? (
                        <Checkbox
                          checked={isModuleFullyChecked}
                          indeterminate={isModuleIndeterminate}
                          onChange={(e) => handleModuleToggleAll(mod.key, e.target.checked)}
                          className="text-base"
                        >
                          <span className="font-black text-gray-900 text-base">
                            {mod.name}
                          </span>
                        </Checkbox>
                      ) : (
                        <span className="font-black text-gray-900 text-base flex items-center gap-2">
                          {mod.name}
                        </span>
                      )}
                      <Tag
                        color="orange"
                        className="font-black text-xs px-3 py-1 rounded-lg border-amber-400 bg-amber-50 text-amber-900"
                      >
                        {checkedCount} / {totalPossible} Active Permissions
                      </Tag>
                    </div>

                    {!disabled && (
                      <div className="flex items-center gap-4 text-xs bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-xs">
                        <span className="text-gray-500 font-black uppercase tracking-wider text-xs">
                          Module Quick Toggle:
                        </span>
                        <Checkbox
                          checked={allView}
                          onChange={(e) => handleModuleActionToggle(mod.key, "view", e.target.checked)}
                        >
                          <span className="font-bold text-gray-800">All View</span>
                        </Checkbox>
                        <Checkbox
                          checked={allAdd}
                          onChange={(e) => handleModuleActionToggle(mod.key, "add", e.target.checked)}
                        >
                          <span className="font-bold text-gray-800">All Add</span>
                        </Checkbox>
                        <Checkbox
                          checked={allEdit}
                          onChange={(e) => handleModuleActionToggle(mod.key, "edit", e.target.checked)}
                        >
                          <span className="font-bold text-gray-800">All Edit</span>
                        </Checkbox>
                        <Checkbox
                          checked={allDel}
                          onChange={(e) => handleModuleActionToggle(mod.key, "delete", e.target.checked)}
                        >
                          <span className="font-bold text-gray-800">All Del</span>
                        </Checkbox>
                      </div>
                    )}
                  </div>

                  {/* Submodules Matrix Table */}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-black uppercase text-gray-600 tracking-wider">
                        <th className="py-3 px-5 w-1/3">Submodule / Screen</th>
                        <th className="py-3 px-3 text-center w-28">View (Read)</th>
                        <th className="py-3 px-3 text-center w-28">Add (Create)</th>
                        <th className="py-3 px-3 text-center w-28">Edit (Modify)</th>
                        <th className="py-3 px-3 text-center w-28">Delete (Remove)</th>
                        <th className="py-3 px-3 text-center w-28">Full Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mod.submodules.map((sub, idx) => {
                        const sPerm = activePermissions[sub.key] || {
                          view: false,
                          add: false,
                          edit: false,
                          delete: false,
                        };
                        const subCheckedCount =
                          (sPerm.view ? 1 : 0) +
                          (sPerm.add ? 1 : 0) +
                          (sPerm.edit ? 1 : 0) +
                          (sPerm.delete ? 1 : 0);
                        const isSubFull = subCheckedCount === 4;
                        const isSubIndet = subCheckedCount > 0 && subCheckedCount < 4;

                        return (
                          <tr
                            key={sub.key}
                            className={`hover:bg-amber-50/40 transition-colors ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            }`}
                          >
                            <td className="py-3.5 px-5">
                              <div className="font-extrabold text-gray-900 text-sm">
                                {sub.name}
                              </div>
                              <div className="text-xs text-gray-500 font-mono mt-0.5">
                                Key: <span className="font-bold text-amber-700">{sub.key}</span> • {sub.path}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <Checkbox
                                disabled={disabled}
                                checked={sPerm.view}
                                className="scale-125"
                                onChange={(e) =>
                                  handlePermissionChange(sub.key, "view", e.target.checked)
                                }
                              />
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <Checkbox
                                disabled={disabled}
                                checked={sPerm.add}
                                className="scale-125"
                                onChange={(e) =>
                                  handlePermissionChange(sub.key, "add", e.target.checked)
                                }
                              />
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <Checkbox
                                disabled={disabled}
                                checked={sPerm.edit}
                                className="scale-125"
                                onChange={(e) =>
                                  handlePermissionChange(sub.key, "edit", e.target.checked)
                                }
                              />
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <Checkbox
                                disabled={disabled}
                                checked={sPerm.delete}
                                className="scale-125"
                                onChange={(e) =>
                                  handlePermissionChange(sub.key, "delete", e.target.checked)
                                }
                              />
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <Checkbox
                                disabled={disabled}
                                checked={isSubFull}
                                indeterminate={isSubIndet}
                                className="scale-125"
                                onChange={(e) =>
                                  handleSubmoduleToggleAll(sub.key, e.target.checked)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // --- Main Table Columns ---
  const columns = [
    {
      title: <span className="text-gray-900 font-extrabold">#</span>,
      key: "sl",
      width: 55,
      align: "center",
      render: (_, __, idx) => <span className="font-bold text-gray-500">{idx + 1}</span>,
    },
    {
      title: <span className="text-gray-900 font-extrabold">User Profile</span>,
      dataIndex: "userName",
      key: "userName",
      width: 230,
      render: (name, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-extrabold text-gray-900 text-sm">{name}</div>
            <div className="text-xs text-gray-500 font-semibold mt-0.5">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-900 font-extrabold">Phone & Location</span>,
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
            <PhoneOutlined className="text-amber-600" />
            <span>{record.phone || "-"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <HomeOutlined className="text-amber-600" />
            <span className="truncate max-w-[170px]">{record.address || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-gray-900 font-extrabold">Privilege & Validity</span>,
      key: "privilege",
      width: 220,
      render: (_, record) => {
        const isPerm = record.privilegeType === "Permanent";
        return (
          <div className="space-y-1.5">
            {isPerm ? (
              <Tag
                color="green"
                className="font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border-green-300"
              >
                <CheckCircleOutlined /> Permanent Access
              </Tag>
            ) : (
              <Tag
                color="gold"
                className="font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border-amber-300"
              >
                <ClockCircleOutlined /> Temporary Access
              </Tag>
            )}
            {!isPerm && record.startDate && record.endDate && (
              <div className="text-[11px] text-gray-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {dayjs(record.startDate).format("DD/MM/YYYY")} -{" "}
                {dayjs(record.endDate).format("DD/MM/YYYY")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: <span className="text-gray-900 font-extrabold">Role & Permissions</span>,
      key: "permissions",
      width: 250,
      render: (_, record) => {
        const pCount = countPermissions(record.permissions);
        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Tag color="blue" className="font-extrabold px-2.5 py-0.5 rounded-md text-xs">
                {pCount.total} Actions Active
              </Tag>
              <span className="text-[11px] font-bold text-gray-500 uppercase">
                {record.rolePreset ? record.rolePreset.replace("_", " ") : "CUSTOM"}
              </span>
            </div>
            <div className="text-gray-600 text-[11px] font-semibold mt-0.5">
              👁️ View: {pCount.view} | ➕ Add: {pCount.add} | ✏️ Edit: {pCount.edit} | 🗑️ Del: {pCount.delete}
            </div>
          </div>
        );
      },
    },
    {
      title: <span className="text-gray-900 font-extrabold">Actions</span>,
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View User & Permissions">
            <Button
              type="primary"
              size="middle"
              className="bg-blue-500! hover:bg-blue-600! border-none! shadow-xs"
              icon={<EyeOutlined />}
              onClick={() => openViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User & Permissions">
            <Button
              type="primary"
              size="middle"
              className="bg-amber-500! hover:bg-amber-600! border-none! shadow-xs"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Popconfirm
              title="Delete User"
              description={`Are you sure you want to delete user "${record.userName}"?`}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteUser(record)}
            >
              <Button
                danger
                size="middle"
                className="shadow-xs"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* STATS OVERVIEW CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4.5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-amber-100">
                Total System Users
              </div>
              <div className="text-3xl font-black mt-1">{stats.totalUsers} Users</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              <UserOutlined />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4.5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
                Permanent Access
              </div>
              <div className="text-3xl font-black mt-1">{stats.permanentCount} Users</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              <CheckCircleOutlined />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4.5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-100">
                Temporary Access
              </div>
              <div className="text-3xl font-black mt-1">{stats.temporaryCount} Users</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              <ClockCircleOutlined />
            </div>
          </div>
        </Col>
      </Row>

      {/* TOP CONTROLS & FILTER BAR */}
      <Card
        size="small"
        className="border-gray-200 shadow-sm bg-white rounded-2xl"
        styles={{ body: { padding: "16px 24px" } }}
      >
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={14}>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                prefix={<SearchOutlined className="text-amber-500 text-base" />}
                placeholder="Search user name, email, phone or address..."
                className="w-80 h-11 text-sm border-gray-300!"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                value={filterPrivilege}
                onChange={(v) => setFilterPrivilege(v)}
                className="w-44 h-11 text-sm font-semibold"
              >
                <Option value="ALL">All Privileges</Option>
                <Option value="Permanent">Permanent</Option>
                <Option value="Temporary">Temporary</Option>
              </Select>
              <Select
                value={filterRole}
                onChange={(v) => setFilterRole(v)}
                className="w-48 h-11 text-sm font-semibold"
              >
                <Option value="ALL">All Role Presets</Option>
                {ROLE_PRESETS.map((rp) => (
                  <Option key={rp.id} value={rp.id}>
                    {rp.name}
                  </Option>
                ))}
              </Select>
              {(searchText || filterPrivilege !== "ALL" || filterRole !== "ALL") && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchText("");
                    setFilterPrivilege("ALL");
                    setFilterRole("ALL");
                  }}
                  className="h-11 text-gray-700! font-bold"
                >
                  Reset
                </Button>
              )}
            </div>
          </Col>

          <Col xs={24} md={10} className="text-right">
            <Space size="middle">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                className="h-11 border-gray-300! text-gray-700! hover:bg-gray-50! font-bold text-sm px-4"
              >
                Export Excel
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                className="h-11 bg-amber-600! hover:bg-amber-700! font-extrabold text-sm px-6 shadow-sm border-none!"
              >
                Create New User
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* USERS DATA TABLE */}
      <Card
        className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white"
        styles={{ body: { padding: "0px" } }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) => (
              <span className="font-bold text-gray-600 text-xs">
                Showing {range[0]}-{range[1]} of {total} System Users
              </span>
            ),
          }}
          className="[&_.ant-table-thead_th]:bg-gray-50/90! [&_.ant-table-thead_th]:text-gray-900! [&_.ant-table-thead_th]:font-black! [&_.ant-table-thead_th]:text-xs! [&_.ant-table-thead_th]:uppercase!"
        />
      </Card>

      {/* ========================================================================= */}
      {/* CREATE NEW USER MODAL - FULL GRANULAR 47 SUBMODULE PERMISSIONS MATRIX     */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-amber-950 font-black text-xl border-b border-amber-200 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs">
              <PlusOutlined />
            </div>
            <span>Create New User & Assign Permissions</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        width="95vw"
        style={{ maxWidth: "1350px", top: 15 }}
        styles={{ body: { maxHeight: "calc(88vh)", overflowY: "auto", padding: "16px 20px" } }}
        footer={[
          <Button key="back" size="large" className="h-12 px-6 font-bold text-sm" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={submitting}
            className="bg-amber-600! hover:bg-amber-700! border-none! h-12 px-8 font-black text-base shadow-sm"
            onClick={() => handleFormSubmit(addForm, false)}
          >
            Create User & Save Permissions
          </Button>,
        ]}
      >
        <Form form={addForm} layout="vertical" className="space-y-6 mt-2">
          {/* User Information Form */}
          <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200">
            <div className="text-sm font-black text-amber-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserOutlined className="text-amber-600 text-base" />
              1. User Credentials & Validity Configuration
            </div>

            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Full Name <span className="text-red-500">*</span></span>}
                  name="userName"
                  rules={[{ required: true, message: "Enter user full name" }]}
                >
                  <Input placeholder="e.g. Ramesh Kumar" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Email Address <span className="text-red-500">*</span></span>}
                  name="email"
                  rules={[
                    { required: true, message: "Enter email address" },
                    { type: "email", message: "Enter valid email" },
                  ]}
                >
                  <Input placeholder="e.g. ramesh@aumagro.com" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Password <span className="text-red-500">*</span></span>}
                  name="password"
                  rules={[{ required: true, message: "Enter initial password" }]}
                >
                  <Input.Password placeholder="Enter Secure Password" className="h-11 text-sm" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Phone Number</span>}
                  name="phone"
                >
                  <Input placeholder="e.g. 9876543210" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Assigned Location / Branch</span>}
                  name="address"
                >
                  <Input placeholder="e.g. Indore Headquarters" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Privilege Validity Type</span>}
                  name="privilegeType"
                  initialValue="Permanent"
                >
                  <Select
                    value={activePrivilegeType}
                    onChange={(v) => setActivePrivilegeType(v)}
                    className="h-11 text-sm font-bold"
                  >
                    <Option value="Permanent">Permanent (No Expiry)</Option>
                    <Option value="Temporary">Temporary (Bounded Period)</Option>
                  </Select>
                </Form.Item>
              </Col>

              {activePrivilegeType === "Temporary" && (
                <>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-gray-900 text-sm">Start Date <span className="text-red-500">*</span></span>}
                      name="startDate"
                      rules={[{ required: true, message: "Select start date" }]}
                    >
                      <AppDatePicker placeholder="Select Start Date" className="h-11 text-sm font-bold" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-gray-900 text-sm">End Date <span className="text-red-500">*</span></span>}
                      name="endDate"
                      rules={[{ required: true, message: "Select end date" }]}
                    >
                      <AppDatePicker placeholder="Select End Date" className="h-11 text-sm font-bold" />
                    </Form.Item>
                  </Col>
                </>
              )}

              <Col xs={24} sm={12} md={activePrivilegeType === "Temporary" ? 12 : 6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Role Template Preset</span>}
                  name="rolePreset"
                  initialValue="admin"
                >
                  <Select
                    value={activeRolePreset}
                    onChange={handleRolePresetSelect}
                    className="h-11 text-sm font-black"
                    placeholder="Choose Template"
                  >
                    {ROLE_PRESETS.map((rp) => (
                      <Option key={rp.id} value={rp.id}>
                        {rp.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <SafetyCertificateOutlined className="text-amber-600 text-base" />
              2. Module & Sub-Module Granular CRUD Permissions Matrix (All 47 Keys)
            </div>
            {renderPermissionsMatrix(false)}
          </div>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* EDIT USER & PERMISSIONS MODAL                                             */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-amber-950 font-black text-xl border-b border-amber-200 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs">
              <EditOutlined />
            </div>
            <span>Edit User & Modify Permissions: {selectedRecord?.userName}</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        width="95vw"
        style={{ maxWidth: "1350px", top: 15 }}
        styles={{ body: { maxHeight: "calc(88vh)", overflowY: "auto", padding: "16px 20px" } }}
        footer={[
          <Button key="back" size="large" className="h-12 px-6 font-bold text-sm" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={submitting}
            className="bg-amber-600! hover:bg-amber-700! border-none! h-12 px-8 font-black text-base shadow-sm"
            onClick={() => handleFormSubmit(editForm, true)}
          >
            Update User & Save Changes
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" className="space-y-6 mt-2">
          {/* User Information Form */}
          <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200">
            <div className="text-sm font-black text-amber-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserOutlined className="text-amber-600 text-base" />
              1. User Credentials & Validity Configuration
            </div>

            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Full Name <span className="text-red-500">*</span></span>}
                  name="userName"
                  rules={[{ required: true, message: "Enter user full name" }]}
                >
                  <Input placeholder="e.g. Ramesh Kumar" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Email Address <span className="text-red-500">*</span></span>}
                  name="email"
                  rules={[
                    { required: true, message: "Enter email address" },
                    { type: "email", message: "Enter valid email" },
                  ]}
                >
                  <Input placeholder="e.g. ramesh@aumagro.com" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Reset Password (Leave blank to keep current)</span>}
                  name="password"
                >
                  <Input.Password placeholder="••••••••" className="h-11 text-sm" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Phone Number</span>}
                  name="phone"
                >
                  <Input placeholder="e.g. 9876543210" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Assigned Location / Branch</span>}
                  name="address"
                >
                  <Input placeholder="e.g. Indore Headquarters" className="h-11 text-sm font-semibold" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Privilege Validity Type</span>}
                  name="privilegeType"
                >
                  <Select
                    value={activePrivilegeType}
                    onChange={(v) => setActivePrivilegeType(v)}
                    className="h-11 text-sm font-bold"
                  >
                    <Option value="Permanent">Permanent (No Expiry)</Option>
                    <Option value="Temporary">Temporary (Bounded Period)</Option>
                  </Select>
                </Form.Item>
              </Col>

              {activePrivilegeType === "Temporary" && (
                <>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-gray-900 text-sm">Start Date <span className="text-red-500">*</span></span>}
                      name="startDate"
                      rules={[{ required: true, message: "Select start date" }]}
                    >
                      <AppDatePicker placeholder="Select Start Date" className="h-11 text-sm font-bold" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-gray-900 text-sm">End Date <span className="text-red-500">*</span></span>}
                      name="endDate"
                      rules={[{ required: true, message: "Select end date" }]}
                    >
                      <AppDatePicker placeholder="Select End Date" className="h-11 text-sm font-bold" />
                    </Form.Item>
                  </Col>
                </>
              )}

              <Col xs={24} sm={12} md={activePrivilegeType === "Temporary" ? 12 : 6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Role Template Preset</span>}
                  name="rolePreset"
                >
                  <Select
                    value={activeRolePreset}
                    onChange={handleRolePresetSelect}
                    className="h-11 text-sm font-black"
                    placeholder="Choose Template"
                  >
                    {ROLE_PRESETS.map((rp) => (
                      <Option key={rp.id} value={rp.id}>
                        {rp.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <SafetyCertificateOutlined className="text-amber-600 text-base" />
              2. Module & Sub-Module Granular CRUD Permissions Matrix
            </div>
            {renderPermissionsMatrix(false)}
          </div>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* VIEW USER & PERMISSIONS MODAL                                             */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-amber-950 font-black text-xl border-b border-amber-200 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg shadow-xs">
              <EyeOutlined />
            </div>
            <span>User Profile & Active Permissions: {selectedRecord?.userName}</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        width="95vw"
        style={{ maxWidth: "1350px", top: 15 }}
        styles={{ body: { maxHeight: "calc(88vh)", overflowY: "auto", padding: "16px 20px" } }}
        footer={[
          <Button
            key="close"
            type="primary"
            size="large"
            className="h-12 px-8 font-black text-base bg-blue-600!"
            onClick={() => setIsViewModalOpen(false)}
          >
            Close Profile
          </Button>,
        ]}
      >
        {selectedRecord && (
          <div className="space-y-6 mt-2">
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
                  {selectedRecord.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-0.5">
                    {selectedRecord.userName}
                  </h3>
                  <div className="text-sm text-gray-600 font-semibold flex items-center gap-3">
                    <span>✉️ {selectedRecord.email}</span>
                    <span>📞 {selectedRecord.phone || "No phone"}</span>
                    <span>📍 {selectedRecord.address || "Headquarters"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag color="blue" className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider">
                  Role: {selectedRecord.rolePreset ? selectedRecord.rolePreset.replace("_", " ") : "Custom"}
                </Tag>
                {selectedRecord.privilegeType === "Permanent" ? (
                  <Tag color="green" className="px-3.5 py-1.5 rounded-lg text-xs font-black">
                    Permanent Access
                  </Tag>
                ) : (
                  <Tag color="gold" className="px-3.5 py-1.5 rounded-lg text-xs font-black">
                    Valid: {selectedRecord.startDate} to {selectedRecord.endDate}
                  </Tag>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <SafetyCertificateOutlined className="text-blue-600 text-base" />
                Active CRUD Permissions Configuration
              </div>
              {renderPermissionsMatrix(true)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
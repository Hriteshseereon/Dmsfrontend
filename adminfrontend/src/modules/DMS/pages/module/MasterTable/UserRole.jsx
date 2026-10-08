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

const { Option } = Select;

// --- Comprehensive Module & Submodule Permissions Hierarchy ---
export const SYSTEM_MODULES_CONFIG = [
  {
    key: "purchase",
    name: "Purchase Module",
    category: "DMS",
    icon: ShoppingCartOutlined,
    color: "#D97706",
    badgeBg: "#FEF3C7",
    submodules: [
      { key: "purchase_dashboard", name: "Purchase Dashboard", path: "/dms/purchase" },
      { key: "purchase_contract", name: "Purchase Contract (Souda)", path: "/dms/purchase/souda" },
      { key: "purchase_indent", name: "Purchase Order (Indent)", path: "/dms/purchase/indent" },
      { key: "vehicle_placement", name: "Vehicle Placement", path: "/dms/purchase/assign" },
      { key: "transport_freight", name: "Transport Freight Details", path: "/dms/purchase/loading" },
      { key: "purchase_invoice", name: "Purchase Invoice Entry", path: "/dms/purchase/invoice" },
      { key: "purchase_intransit", name: "Purchase In-Transit (Return)", path: "/dms/purchase/return" },
      { key: "stock_status", name: "Stock Status & Summary Report", path: "/dms/purchase/stock" },
    ],
  },
  {
    key: "sales",
    name: "Sales Module",
    category: "DMS",
    icon: TagsOutlined,
    color: "#2563EB",
    badgeBg: "#DBEAFE",
    submodules: [
      { key: "sales_dashboard", name: "Sales Dashboard", path: "/dms/sales" },
      { key: "sales_contract", name: "Sale Contracts (Souda)", path: "/dms/sales/souda" },
      { key: "sales_orders", name: "Sale Orders", path: "/dms/sales/orders" },
      { key: "sales_invoice", name: "Sale Invoice (Credit / Cash)", path: "/dms/sales/saleinvoice" },
      { key: "sales_loading", name: "Transport / Loading Details", path: "/dms/sales/loadingdetails" },
      { key: "delivery_status", name: "Delivery Status", path: "/dms/sales/deliverystatus" },
      { key: "sales_dispute", name: "Sales Dispute", path: "/dms/sales/dispute" },
      { key: "customer_wallet", name: "Customer Wallet", path: "/dms/sales/wallet" },
    ],
  },
  {
    key: "accounts",
    name: "Accounting & Finance",
    category: "DMS",
    icon: BookOutlined,
    color: "#059669",
    badgeBg: "#D1FAE5",
    submodules: [
      { key: "cash_bank_book", name: "Cash / Bank Book", path: "/dms/accounts/cash-bank" },
      { key: "day_book", name: "Day Book", path: "/dms/accounts/day-book" },
      { key: "sales_register", name: "Sales Register", path: "/dms/accounts/sales-register" },
      { key: "purchase_register", name: "Purchase Register", path: "/dms/accounts/purchase-register" },
      { key: "customer_ledger", name: "Customer Ledger", path: "/dms/accounts/customer-ledger" },
      { key: "broker_commission", name: "Broker Commission", path: "/dms/accounts/broker-commission" },
      { key: "balance_sheet", name: "Balance Sheet & P&L", path: "/dms/accounts/balance-sheet" },
      { key: "receipts_payments", name: "Receipts & Payments", path: "/dms/accounts/receipts-payments" },
      { key: "gst_summary", name: "GST Summary", path: "/dms/accounts/gst-summary" },
      { key: "receivables_ageing", name: "Receivables Ageing", path: "/dms/accounts/receivables-ageing" },
      { key: "stock_movement", name: "Stock Movement / Summary", path: "/dms/accounts/stock-summary" },
    ],
  },
  {
    key: "master",
    name: "Master Data Management",
    category: "DMS",
    icon: DatabaseOutlined,
    color: "#7C3AED",
    badgeBg: "#EDE9FE",
    submodules: [
      { key: "product_master", name: "Product Master", path: "/dms/master/product" },
      { key: "product_group_master", name: "Product Group Master", path: "/dms/master/product-group" },
      { key: "customer_master", name: "Customer Master", path: "/dms/master/customer" },
      { key: "vendor_master", name: "Vendor / Supplier Master", path: "/dms/master/vendor" },
      { key: "transport_master", name: "Transport & Vehicle Master", path: "/dms/master/transport" },
      { key: "broker_master", name: "Broker Master", path: "/dms/master/broker" },
      { key: "inventory_master", name: "Master Inventory", path: "/dms/master/inventory" },
      { key: "business_master", name: "Business Partner Master", path: "/dms/master/business" },
      { key: "organisation_master", name: "Organisation & Branch Master", path: "/dms/mastertables" },
      { key: "user_role_master", name: "User & Role Master", path: "/dms/mastertables/user-role" },
    ],
  },
  {
    key: "reports",
    name: "Reports & Analytics",
    category: "DMS",
    icon: BarChartOutlined,
    color: "#DB2777",
    badgeBg: "#FCE7F3",
    submodules: [
      { key: "reports_overview", name: "Reports Overview", path: "/dms/reports" },
      { key: "sales_reports", name: "Sales Reports", path: "/dms/reports/sales" },
      { key: "purchase_reports", name: "Purchase Reports", path: "/dms/reports/purchase" },
      { key: "inventory_reports", name: "Inventory Reports", path: "/dms/reports/inventory" },
    ],
  },
  {
    key: "ams",
    name: "Asset Management (AMS)",
    category: "AMS",
    icon: GoldOutlined,
    color: "#EA580C",
    badgeBg: "#FFEDD5",
    submodules: [
      { key: "asset_dashboard", name: "Asset Dashboard", path: "/ams/dashboard" },
      { key: "asset_master", name: "Asset Master", path: "/ams/master" },
      { key: "asset_register", name: "Asset Register", path: "/ams/register" },
    ],
  },
  {
    key: "wms",
    name: "Wealth Management (WMS)",
    category: "WMS",
    icon: WalletOutlined,
    color: "#0891B2",
    badgeBg: "#CFFAFE",
    submodules: [
      { key: "wealth_dashboard", name: "Wealth Dashboard", path: "/wms/dashboard" },
      { key: "wealth_master", name: "Wealth Master", path: "/wms/master" },
      { key: "wealth_portfolio", name: "Wealth Portfolio", path: "/wms/portfolio" },
    ],
  },
];

// Helper to generate empty/full permissions
const buildEmptyPermissions = () => {
  const perms = {};
  SYSTEM_MODULES_CONFIG.forEach((mod) => {
    mod.submodules.forEach((sub) => {
      perms[sub.key] = { view: false, add: false, edit: false, delete: false };
    });
  });
  return perms;
};

const buildFullPermissions = () => {
  const perms = {};
  SYSTEM_MODULES_CONFIG.forEach((mod) => {
    mod.submodules.forEach((sub) => {
      perms[sub.key] = { view: true, add: true, edit: true, delete: true };
    });
  });
  return perms;
};

// Preset Role Templates
const ROLE_PRESETS = [
  {
    id: "admin",
    name: "Administrator (Full Access)",
    description: "Complete access across all DMS, AMS, and WMS modules",
    getPermissions: () => buildFullPermissions(),
  },
  {
    id: "purchase_manager",
    name: "Purchase Manager",
    description: "Complete Purchase module + Vendor/Stock masters + Purchase Reports",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "purchase")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: true, edit: true, delete: true };
      });
      ["product_master", "vendor_master", "transport_master", "broker_master", "inventory_master"].forEach((k) => {
        p[k] = { view: true, add: true, edit: true, delete: false };
      });
      p["purchase_reports"] = { view: true, add: false, edit: false, delete: false };
      return p;
    },
  },
  {
    id: "sales_manager",
    name: "Sales Manager",
    description: "Complete Sales module + Customer masters + Customer Ledger",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "sales")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: true, edit: true, delete: true };
      });
      ["product_master", "customer_master", "transport_master", "broker_master"].forEach((k) => {
        p[k] = { view: true, add: true, edit: true, delete: false };
      });
      ["customer_ledger", "sales_register"].forEach((k) => {
        p[k] = { view: true, add: false, edit: false, delete: false };
      });
      p["sales_reports"] = { view: true, add: false, edit: false, delete: false };
      return p;
    },
  },
  {
    id: "accountant",
    name: "Accountant / Finance Officer",
    description: "Accounts & Finance + Invoices + Ledgers & Registers",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "accounts")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: true, edit: true, delete: true };
      });
      p["purchase_invoice"] = { view: true, add: false, edit: true, delete: false };
      p["sales_invoice"] = { view: true, add: false, edit: true, delete: false };
      p["customer_wallet"] = { view: true, add: true, edit: true, delete: false };
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "master")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: false, edit: false, delete: false };
      });
      return p;
    },
  },
  {
    id: "auditor",
    name: "Auditor / Read-Only",
    description: "View-only access across all modules without create/edit",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      SYSTEM_MODULES_CONFIG.forEach((mod) => {
        mod.submodules.forEach((sub) => {
          p[sub.key] = { view: true, add: false, edit: false, delete: false };
        });
      });
      return p;
    },
  },
  {
    id: "custom",
    name: "Custom Configuration",
    description: "Custom permissions manually specified",
    getPermissions: () => buildEmptyPermissions(),
  },
];

const INITIAL_USERS = [
  {
    key: 1,
    userName: "ADMIN",
    email: "admin@dms.com",
    password: "••••••••",
    phone: "9876543210",
    address: "AUM Agro Headquarters, Indore",
    privilegeType: "Permanent",
    rolePreset: "admin",
    startDate: null,
    endDate: null,
    permissions: buildFullPermissions(),
    createdAt: "2026-01-01",
  },
  {
    key: 2,
    userName: "Rohan Verma",
    email: "rohan.sales@aumagro.com",
    password: "••••••••",
    phone: "9823012345",
    address: "Regional Branch, Pune",
    privilegeType: "Permanent",
    rolePreset: "sales_manager",
    startDate: null,
    endDate: null,
    permissions: ROLE_PRESETS.find((r) => r.id === "sales_manager").getPermissions(),
    createdAt: "2026-02-15",
  },
  {
    key: 3,
    userName: "Priya Sharma",
    email: "priya.purchase@aumagro.com",
    password: "••••••••",
    phone: "9811223344",
    address: "Haldia Plant Office, WB",
    privilegeType: "Temporary",
    rolePreset: "purchase_manager",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    permissions: ROLE_PRESETS.find((r) => r.id === "purchase_manager").getPermissions(),
    createdAt: "2026-10-01",
  },
];

const LOCAL_STORAGE_KEY = "dms_user_roles_master_v3";

export default function UserRole() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading users from localStorage", e);
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving users to localStorage", e);
    }
  }, [data]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [filterPrivilege, setFilterPrivilege] = useState("ALL");

  // Form Instances
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Active form permission matrix state
  const [activePermissions, setActivePermissions] = useState(buildEmptyPermissions());
  const [activePrivilegeType, setActivePrivilegeType] = useState("Permanent");
  const [activeRolePreset, setActiveRolePreset] = useState("admin");
  const [searchModuleQuery, setSearchModuleQuery] = useState("");
  const [selectedMatrixTab, setSelectedMatrixTab] = useState("all");

  const countPermissions = useCallback((perms) => {
    if (!perms) return { total: 0, view: 0, add: 0, edit: 0, delete: 0 };
    let total = 0, view = 0, add = 0, edit = 0, del = 0;
    Object.values(perms).forEach((p) => {
      if (p.view) { view++; total++; }
      if (p.add) { add++; total++; }
      if (p.edit) { edit++; total++; }
      if (p.delete) { del++; total++; }
    });
    return { total, view, add, edit, delete: del };
  }, []);

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

      return matchesSearch && matchesPrivilege;
    });
  }, [data, searchText, filterPrivilege]);

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
    message.success("Granted Full Access across all modules!");
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
      message.success(`Applied "${preset.name}" template`);
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

      if (activePrivilegeType === "Temporary" && (!formattedStartDate || !formattedEndDate)) {
        message.error("Please provide both Start Date and End Date for Temporary Access");
        return;
      }

      if (isEdit) {
        setData((prev) =>
          prev.map((item) => {
            if (item.key === selectedRecord.key) {
              return {
                ...item,
                userName: values.userName.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password ? "••••••••" : item.password,
                phone: values.phone ? values.phone.trim() : "",
                address: values.address ? values.address.trim() : "",
                privilegeType: activePrivilegeType,
                rolePreset: activeRolePreset,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                permissions: activePermissions,
              };
            }
            return item;
          })
        );
        message.success(`User "${values.userName}" updated successfully!`);
        setIsEditModalOpen(false);
      } else {
        if (data.some((u) => u.email.toLowerCase() === values.email.trim().toLowerCase())) {
          message.error("A user with this Email address already exists!");
          return;
        }

        const newUser = {
          key: Date.now(),
          userName: values.userName.trim(),
          email: values.email.trim().toLowerCase(),
          password: "••••••••",
          phone: values.phone ? values.phone.trim() : "",
          address: values.address ? values.address.trim() : "",
          privilegeType: activePrivilegeType,
          rolePreset: activeRolePreset,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          permissions: activePermissions,
          createdAt: dayjs().format("YYYY-MM-DD"),
        };

        setData((prev) => [newUser, ...prev]);
        message.success(`User "${values.userName}" created successfully with permissions!`);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Form validation failed", err);
    }
  };

  const handleDeleteUser = (key) => {
    setData((prev) => prev.filter((item) => item.key !== key));
    message.success("User deleted successfully!");
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
    }).map((mod) => {
      if (!searchModuleQuery) return mod;
      const q = searchModuleQuery.toLowerCase();
      const matchedSub = mod.submodules.filter((s) =>
        s.name.toLowerCase().includes(q) || mod.name.toLowerCase().includes(q)
      );
      if (matchedSub.length > 0) {
        return { ...mod, submodules: matchedSub };
      }
      return null;
    }).filter(Boolean);

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

        {/* Module Selection Pills (Big & Clear) */}
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
              <p className="text-base text-gray-600 font-bold mb-2">No matching screens found for "{searchModuleQuery}".</p>
              <Button type="primary" onClick={() => setSearchModuleQuery("")} className="bg-amber-500!">
                Clear Search Filter
              </Button>
            </div>
          ) : (
            modulesToDisplay.map((mod) => {
              const IconComp = mod.icon || AppstoreOutlined;
              const totalPossible = mod.submodules.length * 4;
              let checkedCount = 0;
              let allView = true, allAdd = true, allEdit = true, allDel = true;

              mod.submodules.forEach((s) => {
                const sp = activePermissions[s.key] || {};
                if (sp.view) checkedCount++; else allView = false;
                if (sp.add) checkedCount++; else allAdd = false;
                if (sp.edit) checkedCount++; else allEdit = false;
                if (sp.delete) checkedCount++; else allDel = false;
              });

              const isModuleFullyChecked = checkedCount === totalPossible && totalPossible > 0;
              const isModuleIndeterminate = checkedCount > 0 && checkedCount < totalPossible;

              return (
                <div
                  key={mod.key}
                  className="border-2 border-amber-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-amber-400 transition-all"
                >
                  {/* Module Header Row (Big & Prominent) */}
                  <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-white px-5 py-3.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-xs">
                        <IconComp />
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
                      <Tag color="orange" className="font-black text-xs px-3 py-1 rounded-lg border-amber-400 bg-amber-50 text-amber-900">
                        {checkedCount} / {totalPossible} Active Permissions
                      </Tag>
                    </div>

                    {!disabled && (
                      <div className="flex items-center gap-4 text-xs bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-xs">
                        <span className="text-gray-500 font-black uppercase tracking-wider text-xs">Module Toggle:</span>
                        <Checkbox
                          checked={allView}
                          onChange={(e) => handleModuleActionToggle(mod.key, "view", e.target.checked)}
                        >
                          <span className="text-xs font-black text-blue-700">All View</span>
                        </Checkbox>
                        <Checkbox
                          checked={allAdd}
                          onChange={(e) => handleModuleActionToggle(mod.key, "add", e.target.checked)}
                        >
                          <span className="text-xs font-black text-emerald-700">All Add</span>
                        </Checkbox>
                        <Checkbox
                          checked={allEdit}
                          onChange={(e) => handleModuleActionToggle(mod.key, "edit", e.target.checked)}
                        >
                          <span className="text-xs font-black text-amber-700">All Edit</span>
                        </Checkbox>
                        <Checkbox
                          checked={allDel}
                          onChange={(e) => handleModuleActionToggle(mod.key, "delete", e.target.checked)}
                        >
                          <span className="text-xs font-black text-rose-700">All Delete</span>
                        </Checkbox>
                      </div>
                    )}
                  </div>

                  {/* Submodules Table with Big Comfortable Rows */}
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 border-b border-gray-200 font-black text-[13px]">
                        <th className="py-3 px-5 text-left w-2/5">Sub-Module / Screen Name</th>
                        <th className="py-3 px-3 text-center w-1/8 text-blue-700">View (👁️)</th>
                        <th className="py-3 px-3 text-center w-1/8 text-emerald-700">Add (➕)</th>
                        <th className="py-3 px-3 text-center w-1/8 text-amber-700">Edit (✏️)</th>
                        <th className="py-3 px-3 text-center w-1/8 text-rose-700">Delete (🗑️)</th>
                        <th className="py-3 px-3 text-center w-1/8 text-purple-700">Full Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mod.submodules.map((sub, sIdx) => {
                        const sPerm = activePermissions[sub.key] || {
                          view: false,
                          add: false,
                          edit: false,
                          delete: false,
                        };
                        const isSubFull = sPerm.view && sPerm.add && sPerm.edit && sPerm.delete;
                        const isSubIndet =
                          (sPerm.view || sPerm.add || sPerm.edit || sPerm.delete) && !isSubFull;

                        return (
                          <tr
                            key={sub.key}
                            className={`hover:bg-amber-50/50 transition-colors ${
                              sIdx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                            }`}
                          >
                            <td className="py-3.5 px-5">
                              <div className="font-extrabold text-gray-900 text-sm">{sub.name}</div>
                              <div className="text-xs text-gray-500 font-mono mt-0.5">{sub.path}</div>
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
              <Tag color="green" className="font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border-green-300">
                <CheckCircleOutlined /> Permanent Access
              </Tag>
            ) : (
              <Tag color="gold" className="font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border-amber-300">
                <ClockCircleOutlined /> Temporary Access
              </Tag>
            )}
            {!isPerm && record.startDate && record.endDate && (
              <div className="text-[11px] text-gray-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {dayjs(record.startDate).format("DD/MM/YYYY")} - {dayjs(record.endDate).format("DD/MM/YYYY")}
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
              onConfirm={() => handleDeleteUser(record.key)}
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
              <div className="text-xs uppercase font-extrabold tracking-wider text-amber-100">Total System Users</div>
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
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">Permanent Access</div>
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
              <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-100">Temporary Access</div>
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
                className="w-48 h-11 text-sm font-semibold"
              >
                <Option value="ALL">All Privileges</Option>
                <Option value="Permanent">Permanent Only</Option>
                <Option value="Temporary">Temporary Only</Option>
              </Select>
              {(searchText || filterPrivilege !== "ALL") && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchText("");
                    setFilterPrivilege("ALL");
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
                className="h-11 bg-amber-500! hover:bg-amber-600! border-none! font-black text-sm shadow-sm px-6"
              >
                + Create New User
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* MAIN USERS DIRECTORY TABLE */}
      <Card
        size="small"
        className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="bg-amber-50/80 px-6 py-4 border-b border-amber-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-black text-amber-950 m-0 flex items-center gap-2">
              <SafetyCertificateOutlined className="text-amber-600 text-xl" />
              User & Role Management Directory
            </h2>
            <p className="text-xs text-amber-800 m-0 mt-0.5 font-medium">
              Consolidated screen for user credentials, permanent/temporary privilege validity, and granular CRUD permissions.
            </p>
          </div>
          <Tag color="orange" className="font-black text-xs px-3.5 py-1 rounded-lg border-amber-400">
            {filteredData.length} Users Listed
          </Tag>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          pagination={{ pageSize: 8, showSizeChanger: true }}
          className="custom-scroll-table"
        />
      </Card>

      {/* ========================================================================= */}
      {/* ADD USER MODAL - EXTRA WIDE & MASSIVE CLEAR VIEW (95vw / 1380px)          */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-amber-950 font-black text-xl border-b border-amber-200 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs">
              <PlusOutlined />
            </div>
            <span>Create New User & Configure Granular Permissions</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        width="95vw"
        style={{ maxWidth: "1380px", top: 15 }}
        styles={{ body: { maxHeight: "calc(88vh)", overflowY: "auto", padding: "16px 20px" } }}
        footer={[
          <Button key="cancel" size="large" className="h-12 px-6 font-bold" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            className="h-12 bg-amber-500! hover:bg-amber-600! border-none! font-black text-base shadow-sm px-8"
            onClick={() => handleFormSubmit(addForm, false)}
          >
            Save User & Grant Permissions
          </Button>,
        ]}
        maskClosable={false}
      >
        <Form layout="vertical" form={addForm} className="mt-2 space-y-6">
          {/* SECTION 1: USER DETAILS */}
          <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-5 rounded-2xl border-2 border-amber-200 shadow-xs">
            <div className="text-sm font-black text-amber-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserOutlined className="text-amber-600 text-base" />
              1. User Credentials & Contact Information
            </div>
            <Row gutter={[20, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">User Name / Full Name <span className="text-red-500">*</span></span>}
                  name="userName"
                  rules={[{ required: true, message: "Enter User Name" }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400 text-base mr-1" />}
                    placeholder="e.g. Ramesh Kumar"
                    className="h-11 text-sm font-bold border-gray-300!"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Email Address (Login ID) <span className="text-red-500">*</span></span>}
                  name="email"
                  rules={[
                    { required: true, message: "Enter Email" },
                    { type: "email", message: "Enter valid Email" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400 text-base mr-1" />}
                    placeholder="ramesh@aumagro.com"
                    className="h-11 text-sm font-bold border-gray-300!"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Password <span className="text-red-500">*</span></span>}
                  name="password"
                  rules={[{ required: true, message: "Set login password" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400 text-base mr-1" />}
                    placeholder="Create login password"
                    className="h-11 text-sm font-bold border-gray-300!"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Phone Number</span>}
                  name="phone"
                  rules={[
                    { pattern: /^[0-9]{10}$/, message: "Must be 10-digit number" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400 text-base mr-1" />}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="h-11 text-sm font-bold border-gray-300!"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Address / Location</span>}
                  name="address"
                >
                  <Input
                    prefix={<HomeOutlined className="text-gray-400 text-base mr-1" />}
                    placeholder="City / Plant location"
                    className="h-11 text-sm font-bold border-gray-300!"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Privilege Access Type <span className="text-red-500">*</span></span>}
                  name="privilegeType"
                  initialValue="Permanent"
                  rules={[{ required: true }]}
                >
                  <Select
                    value={activePrivilegeType}
                    className="h-11 text-sm font-black"
                    onChange={(v) => {
                      setActivePrivilegeType(v);
                      if (v === "Permanent") {
                        addForm.setFieldsValue({ startDate: null, endDate: null });
                      }
                    }}
                  >
                    <Option value="Permanent">🟢 Permanent Access (No Expiry)</Option>
                    <Option value="Temporary">⏳ Temporary Access (With Dates)</Option>
                  </Select>
                </Form.Item>
              </Col>

              {activePrivilegeType === "Temporary" && (
                <>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-amber-950 text-sm">Valid From (Start Date) <span className="text-red-500">*</span></span>}
                      name="startDate"
                      rules={[{ required: true, message: "Select start date" }]}
                    >
                      <AppDatePicker placeholder="Select Start Date" className="h-11 text-sm font-bold" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-amber-950 text-sm">Valid To (End Date) <span className="text-red-500">*</span></span>}
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
                  label={<span className="font-extrabold text-gray-900 text-sm">Quick Role Template Preset</span>}
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

          {/* SECTION 2: PERMISSIONS MATRIX */}
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
      {/* EDIT USER MODAL - EXTRA WIDE & MASSIVE CLEAR VIEW (95vw / 1380px)         */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-amber-950 font-black text-xl border-b border-amber-200 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs">
              <EditOutlined />
            </div>
            <span>Edit User & Permissions: {selectedRecord?.userName}</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        width="95vw"
        style={{ maxWidth: "1380px", top: 15 }}
        styles={{ body: { maxHeight: "calc(88vh)", overflowY: "auto", padding: "16px 20px" } }}
        footer={[
          <Button key="cancel" size="large" className="h-12 px-6 font-bold" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            className="h-12 bg-amber-500! hover:bg-amber-600! border-none! font-black text-base shadow-sm px-8"
            onClick={() => handleFormSubmit(editForm, true)}
          >
            Update User & Save Changes
          </Button>,
        ]}
        maskClosable={false}
      >
        <Form layout="vertical" form={editForm} className="mt-2 space-y-6">
          <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-5 rounded-2xl border-2 border-amber-200 shadow-xs">
            <div className="text-sm font-black text-amber-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserOutlined className="text-amber-600 text-base" />
              1. User Credentials & Contact Information
            </div>
            <Row gutter={[20, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">User Name / Full Name <span className="text-red-500">*</span></span>}
                  name="userName"
                  rules={[{ required: true, message: "Enter User Name" }]}
                >
                  <Input prefix={<UserOutlined className="text-gray-400 text-base mr-1" />} className="h-11 text-sm font-bold border-gray-300!" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Email Address (Login ID) <span className="text-red-500">*</span></span>}
                  name="email"
                  rules={[
                    { required: true, message: "Enter Email" },
                    { type: "email", message: "Enter valid Email" },
                  ]}
                >
                  <Input prefix={<MailOutlined className="text-gray-400 text-base mr-1" />} className="h-11 text-sm font-bold border-gray-300!" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Password</span>}
                  name="password"
                  extra={<span className="text-xs text-gray-500 font-medium">Leave blank to keep existing password</span>}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400 text-base mr-1" />}
                    placeholder="New password (optional)"
                    className="h-11 text-sm font-bold border-gray-300!"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Phone Number</span>}
                  name="phone"
                  rules={[
                    { pattern: /^[0-9]{10}$/, message: "Must be 10-digit number" },
                  ]}
                >
                  <Input prefix={<PhoneOutlined className="text-gray-400 text-base mr-1" />} maxLength={10} className="h-11 text-sm font-bold border-gray-300!" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Address / Location</span>}
                  name="address"
                >
                  <Input prefix={<HomeOutlined className="text-gray-400 text-base mr-1" />} className="h-11 text-sm font-bold border-gray-300!" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={<span className="font-extrabold text-gray-900 text-sm">Privilege Access Type <span className="text-red-500">*</span></span>}
                  name="privilegeType"
                  rules={[{ required: true }]}
                >
                  <Select
                    value={activePrivilegeType}
                    className="h-11 text-sm font-black"
                    onChange={(v) => {
                      setActivePrivilegeType(v);
                      if (v === "Permanent") {
                        editForm.setFieldsValue({ startDate: null, endDate: null });
                      }
                    }}
                  >
                    <Option value="Permanent">🟢 Permanent Access (No Expiry)</Option>
                    <Option value="Temporary">⏳ Temporary Access (With Dates)</Option>
                  </Select>
                </Form.Item>
              </Col>

              {activePrivilegeType === "Temporary" && (
                <>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-amber-950 text-sm">Valid From (Start Date) <span className="text-red-500">*</span></span>}
                      name="startDate"
                      rules={[{ required: true, message: "Select start date" }]}
                    >
                      <AppDatePicker placeholder="Select Start Date" className="h-11 text-sm font-bold" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={<span className="font-extrabold text-amber-950 text-sm">Valid To (End Date) <span className="text-red-500">*</span></span>}
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
      {/* VIEW USER & PERMISSIONS MODAL - MASSIVE & CLEAR VIEW                     */}
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
          <Button key="close" type="primary" size="large" className="h-12 px-8 font-black text-base bg-blue-600!" onClick={() => setIsViewModalOpen(false)}>
            Close Profile
          </Button>,
        ]}
      >
        {selectedRecord && (
          <div className="space-y-6 mt-2">
            {/* User Overview Summary Card */}
            <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-6 rounded-2xl border-2 border-amber-200 shadow-xs">
              <Row gutter={[24, 18]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-xs text-gray-500 font-black uppercase tracking-wider">User Name</div>
                  <div className="text-lg font-black text-gray-900 flex items-center gap-2 mt-1">
                    <UserOutlined className="text-amber-600" />
                    {selectedRecord.userName}
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-xs text-gray-500 font-black uppercase tracking-wider">Email Address</div>
                  <div className="text-base font-extrabold text-gray-900 flex items-center gap-2 mt-1">
                    <MailOutlined className="text-amber-600" />
                    {selectedRecord.email}
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-xs text-gray-500 font-black uppercase tracking-wider">Phone Number</div>
                  <div className="text-base font-extrabold text-gray-900 flex items-center gap-2 mt-1">
                    <PhoneOutlined className="text-amber-600" />
                    {selectedRecord.phone || "-"}
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-xs text-gray-500 font-black uppercase tracking-wider">Address / Location</div>
                  <div className="text-base font-extrabold text-gray-900 flex items-center gap-2 mt-1">
                    <HomeOutlined className="text-amber-600" />
                    {selectedRecord.address || "-"}
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-xs text-gray-500 font-black uppercase tracking-wider">Privilege Access Type</div>
                  <div className="mt-2">
                    {selectedRecord.privilegeType === "Permanent" ? (
                      <Tag color="green" className="font-black px-3.5 py-1.5 rounded-lg text-xs">
                        🟢 Permanent Access
                      </Tag>
                    ) : (
                      <Tag color="gold" className="font-black px-3.5 py-1.5 rounded-lg text-xs">
                        ⏳ Temporary Access ({selectedRecord.startDate} to {selectedRecord.endDate})
                      </Tag>
                    )}
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-xs text-gray-500 font-black uppercase tracking-wider">Assigned Total Actions</div>
                  <div className="text-base font-black text-blue-700 mt-2">
                    {countPermissions(selectedRecord.permissions).total} Total Active Permissions
                  </div>
                </Col>
              </Row>
            </div>

            {/* Readonly Matrix */}
            <div>
              <div className="text-sm font-black text-amber-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <SafetyCertificateOutlined className="text-amber-600 text-base" />
                Active Module Permissions Matrix
              </div>
              {renderPermissionsMatrix(true)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
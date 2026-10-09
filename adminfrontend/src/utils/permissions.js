/**
 * Permissions & Role Access Control Utility
 * Based on Backend Granular Permissions Integration Guide (47 Submodules across 7 Modules)
 */

// --- Complete 47 Submodules Hierarchy ---
export const SYSTEM_MODULES_CONFIG = [
  {
    key: "purchase",
    name: "Purchase Module",
    category: "DMS",
    color: "#D97706",
    badgeBg: "#FEF3C7",
    submodules: [
      { key: "purchase_dashboard", name: "Purchase Dashboard", path: "/dms/purchase" },
      { key: "purchase_contract", name: "Purchase Contract (Souda)", path: "/dms/purchase/souda" },
      { key: "purchase_indent", name: "Purchase Indent / PO", path: "/dms/purchase/indent" },
      { key: "vehicle_placement", name: "Vehicle Placement", path: "/dms/purchase/assign" },
      { key: "transport_freight", name: "Transport Freight Details", path: "/dms/purchase/loading" },
      { key: "purchase_invoice", name: "Purchase Invoice Entry", path: "/dms/purchase/invoice" },
      { key: "purchase_intransit", name: "Purchase In-Transit / Return", path: "/dms/purchase/return" },
      { key: "stock_status", name: "Stock Status & Summary Report", path: "/dms/purchase/stock" },
    ],
  },
  {
    key: "sales",
    name: "Sales Module",
    category: "DMS",
    color: "#2563EB",
    badgeBg: "#DBEAFE",
    submodules: [
      { key: "sales_contract", name: "Sale Contracts (Souda)", path: "/dms/sales/souda" },
      { key: "sales_invoice", name: "Sale Invoice (Credit / Cash)", path: "/dms/sales/saleinvoice" },
    ],
  },
  {
    key: "accounts",
    name: "Accounts Module",
    category: "DMS",
    color: "#059669",
    badgeBg: "#D1FAE5",
    submodules: [
      { key: "cash_bank_book", name: "Cash / Bank Book", path: "/dms/accounts/cash-bank-book" },
      { key: "day_book", name: "Day Book", path: "/dms/accounts/day-book" },
      { key: "sales_register", name: "Sales Register", path: "/dms/accounts/sales-register" },
      { key: "purchase_register", name: "Purchase Register", path: "/dms/accounts/purchase-register" },
      { key: "customer_ledger", name: "Customer Ledger", path: "/dms/accounts/customer-ledger" },
      { key: "broker_commission", name: "Broker Commission", path: "/dms/accounts/broker-commission" },
      { key: "balance_sheet", name: "Balance Sheet & P&L", path: "/dms/accounts/balance-sheet" },
      { key: "receipts_payments", name: "Receipts & Payments", path: "/dms/accounts/receipts-payments" },
      { key: "gst_summary", name: "GST Summary", path: "/dms/accounts/gst-summary" },
      { key: "receivables_ageing", name: "Receivables Ageing", path: "/dms/accounts/receivables" },
      { key: "stock_movement", name: "Stock Movement / Summary", path: "/dms/accounts/stock-summary" },
    ],
  },
  {
    key: "master",
    name: "Master Data Management",
    category: "DMS",
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
      { key: "organisation_master", name: "Organisation & Branch Master", path: "/dms/master/organisation" },
      { key: "user_role_master", name: "User & Role Master", path: "/dms/master/user-role" },
    ],
  },
  {
    key: "reports",
    name: "Reports & Analytics",
    category: "DMS",
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
    color: "#0891B2",
    badgeBg: "#CFFAFE",
    submodules: [
      { key: "wealth_dashboard", name: "Wealth Dashboard", path: "/wms/dashboard" },
      { key: "wealth_master", name: "Wealth Master", path: "/wms/master" },
      { key: "wealth_portfolio", name: "Wealth Portfolio", path: "/wms/portfolio" },
    ],
  },
];

// Flat list of all 47 submodule keys
export const ALL_SUBMODULE_KEYS = SYSTEM_MODULES_CONFIG.flatMap((m) =>
  m.submodules.map((s) => s.key)
);

// Helper to generate empty permissions for all 47 keys
export const buildEmptyPermissions = () => {
  const perms = {};
  SYSTEM_MODULES_CONFIG.forEach((mod) => {
    mod.submodules.forEach((sub) => {
      perms[sub.key] = { view: false, add: false, edit: false, delete: false };
    });
  });
  return perms;
};

// Helper to generate full permissions for all 47 keys
export const buildFullPermissions = () => {
  const perms = {};
  SYSTEM_MODULES_CONFIG.forEach((mod) => {
    mod.submodules.forEach((sub) => {
      perms[sub.key] = { view: true, add: true, edit: true, delete: true };
    });
  });
  return perms;
};

// Role Presets Configuration (Section 6 of guide)
export const ROLE_PRESETS = [
  {
    id: "admin",
    name: "Administrator (Full Access)",
    description: "Sets view, add, edit, delete = true across all 47 submodules.",
    getPermissions: () => buildFullPermissions(),
  },
  {
    id: "purchase_manager",
    name: "Purchase Manager",
    description: "All 8 purchase submodules + vendor/inventory/transport/product masters + purchase reports.",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      // All 8 purchase submodules
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "purchase")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: true, edit: true, delete: true };
      });
      // Vendor & Inventory masters
      ["product_master", "vendor_master", "transport_master", "broker_master", "inventory_master"].forEach((k) => {
        p[k] = { view: true, add: true, edit: true, delete: false };
      });
      // Purchase reports
      p["purchase_reports"] = { view: true, add: false, edit: false, delete: false };
      p["reports_overview"] = { view: true, add: false, edit: false, delete: false };
      return p;
    },
  },
  {
    id: "sales_manager",
    name: "Sales Manager",
    description: "All 8 sales submodules + customer masters + customer ledger + sales reports.",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      // All 8 sales submodules
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "sales")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: true, edit: true, delete: true };
      });
      // Customer masters
      ["product_master", "customer_master", "transport_master", "broker_master"].forEach((k) => {
        p[k] = { view: true, add: true, edit: true, delete: false };
      });
      // Customer Ledger & Sales Register
      ["customer_ledger", "sales_register"].forEach((k) => {
        p[k] = { view: true, add: false, edit: false, delete: false };
      });
      // Sales reports
      p["sales_reports"] = { view: true, add: false, edit: false, delete: false };
      p["reports_overview"] = { view: true, add: false, edit: false, delete: false };
      return p;
    },
  },
  {
    id: "accountant",
    name: "Accountant / Finance Officer",
    description: "All 11 accounts submodules + sales/purchase registers + ledgers + invoice access.",
    getPermissions: () => {
      const p = buildEmptyPermissions();
      // All 11 accounts submodules
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "accounts")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: true, edit: true, delete: true };
      });
      // Invoices & wallet
      p["purchase_invoice"] = { view: true, add: false, edit: true, delete: false };
      p["sales_invoice"] = { view: true, add: false, edit: true, delete: false };
      p["customer_wallet"] = { view: true, add: true, edit: true, delete: false };
      // Master view-only
      SYSTEM_MODULES_CONFIG.find((m) => m.key === "master")?.submodules.forEach((s) => {
        p[s.key] = { view: true, add: false, edit: false, delete: false };
      });
      p["reports_overview"] = { view: true, add: false, edit: false, delete: false };
      return p;
    },
  },
  {
    id: "auditor",
    name: "Auditor / Read-Only",
    description: "Sets view = true and add, edit, delete = false across all 47 submodules.",
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
    name: "Custom Role",
    description: "No automated defaults; user checks individual boxes.",
    getPermissions: () => buildEmptyPermissions(),
  },
];

/**
 * Checks if the user has permission for a submodule action
 * @param {Object} permissions - The permissions object from /users/me/permissions/ or user state
 * @param {string} submoduleKey - e.g. 'sales_contract', 'purchase_invoice'
 * @param {'view'|'add'|'edit'|'delete'} action - The CRUD action (default: 'view')
 * @param {boolean} isAdmin - Whether the user is admin/superuser
 * @returns {boolean}
 */
export function hasPermission(permissions, submoduleKey, action = "view", isAdmin = false) {
  if (isAdmin) return true;
  if (!permissions) return false;

  const submodule = permissions[submoduleKey];
  if (!submodule) return false;
  return Boolean(submodule[action]);
}

/**
 * Checks if the user has at least view access to any submodule in a given module
 * @param {Object} permissions - The permissions object
 * @param {string} moduleKey - e.g. 'purchase', 'sales', 'accounts', 'master', 'reports', 'ams', 'wms'
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {boolean}
 */
export function hasModuleAccess(permissions, moduleKey, isAdmin = false) {
  if (isAdmin) return true;
  if (!permissions) return false;

  const modConfig = SYSTEM_MODULES_CONFIG.find(
    (m) => m.key.toLowerCase() === (moduleKey || "").toLowerCase()
  );
  if (!modConfig) return false;

  return modConfig.submodules.some((sub) => hasPermission(permissions, sub.key, "view", isAdmin));
}

/**
 * Counts total granted permissions across actions
 * @param {Object} permissions
 * @returns {{ total: number, view: number, add: number, edit: number, delete: number }}
 */
export function countPermissions(permissions) {
  if (!permissions) return { total: 0, view: 0, add: 0, edit: 0, delete: 0 };
  let total = 0,
    view = 0,
    add = 0,
    edit = 0,
    del = 0;

  Object.values(permissions).forEach((p) => {
    if (p && typeof p === "object") {
      if (p.view) {
        view++;
        total++;
      }
      if (p.add) {
        add++;
        total++;
      }
      if (p.edit) {
        edit++;
        total++;
      }
      if (p.delete) {
        del++;
        total++;
      }
    }
  });

  return { total, view, add, edit, delete: del };
}

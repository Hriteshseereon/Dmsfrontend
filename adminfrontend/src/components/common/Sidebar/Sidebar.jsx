// Sidebar.js
import { Menu, Tooltip } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./sidebar.css";
import { useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  WalletOutlined,
  GoldOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LeftOutlined,
  RightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
const SIDEBAR_EXPANDED = 240; // 18rem
const SIDEBAR_COLLAPSED = 66;
// ===== Helper: pick preferred module =====
const pickPreferredModule = (orgModules = []) => {
  // Normalize into lowercase strings
  const norms = (Array.isArray(orgModules) ? orgModules : [])
    .map((m) => {
      if (!m) return null;
      if (typeof m === "string") return m.toLowerCase();
      if (typeof m === "object") {
        const candidate = m.key || m.module || m.name || m.id;
        return candidate ? String(candidate).toLowerCase() : null;
      }
      return null;
    })
    .filter(Boolean);

  // Priority order: DMS -> AMS -> WMS
  if (norms.includes("dms")) return "dms";
  if (norms.includes("ams")) return "ams";
  if (norms.includes("wms")) return "wms";

  return null;
};

// ===== Header =====
const SidebarHeader = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgModules } = useAuth();

  // determine preferred module once
  const preferredModule = useMemo(
    () => pickPreferredModule(orgModules),
    [orgModules],
  );

  // map preferred module to routes for dashboard & organisation
  const dashboardRoute =
    preferredModule === "dms"
      ? "/dms"
      : preferredModule === "ams"
        ? "/ams/dashboard"
        : preferredModule === "wms"
          ? "/wms/dashboard"
          : "/dashboard"; // fallback

  const organisationRoute =
    preferredModule === "dms"
      ? "/dms/organisation"
      : preferredModule === "ams"
        ? "/dms/organisation"
        : preferredModule === "wms"
          ? "/dms/organisation"
          : "/organisation";

  const linkClasses = (path) =>
    `font-semibold no-underline flex items-center px-1 py-1 rounded-md ${
      location.pathname.startsWith(path)
        ? "bg-amber-100 text-amber-800"
        : "text-amber-800 hover:bg-amber-100"
    }`;

  return (
    <div className="sidebar-header">
      <div className="flex flex-col items-start p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 w-full">
          <Tooltip title="Back to Organisations" placement="right">
            <button
              onClick={() => navigate("/organizations")}
              className="p-2 rounded-md hover:bg-amber-100 text-amber-800"
            >
              <ArrowLeftOutlined />
            </button>
          </Tooltip>

          <div className="sidebar-logo-wrapper">
            <img
              src="https://res.cloudinary.com/dfm1xhhwx/image/upload/v1763008447/Aumlogo_gvleis.jpg"
              alt="Logo"
              className={`sidebar-logo ${collapsed ? "collapsed" : ""}`}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 sidebar-header-tab">
          <NavLink
            to={dashboardRoute}
            end
            className={({ isActive }) =>
              `font-semibold no-underline flex items-center px-3 py-1 rounded-md ${
                isActive
                  ? "bg-amber-100 text-amber-800"
                  : "text-amber-800 hover:bg-amber-100"
              }`
            }
          >
            <DashboardOutlined className="mr-2" />
            Dashboard
          </NavLink>

          <NavLink
            to={organisationRoute}
            className={({ isActive }) =>
              `font-semibold no-underline flex items-center px-1 py-1 rounded-md ${
                isActive
                  ? "bg-amber-100 text-amber-800"
                  : "text-amber-800 hover:bg-amber-100"
              }`
            }
          >
            <ApartmentOutlined className="mr-2" />
            Organisation
          </NavLink>
        </div>
      </div>
    </div>
  );
};

// ===== Menu Items =====
const baseMenuItems = [
  {
    key: "purchase",
    label: "Purchase Module",
    path: "/dms/purchase",
    icon: <ShoppingCartOutlined />,
    module: "dms",
    required: "purchase",
  },
  {
    key: "sales",
    label: "Sales Module",
    path: "/dms/sales",
    icon: <TagsOutlined />,
    module: "dms",
    required: "sales",
  },
  {
    key: "reports",
    label: "Reports & Analytics",
    path: "/dms/reports",
    icon: <FileTextOutlined />,
    module: "dms",
    required: "reports",
  },
  {
    key: "master",
    label: "Master Data",
    path: "/dms/mastermodule",
    icon: <DatabaseOutlined />,
    module: "dms",
    required: "master",
  },
  {
    isSection: true,
    label: "Asset Module",
    module: "ams",
    required: "asset",
  },
  {
    key: "asset-product",
    label: "Asset Master",
    path: "/ams/dashboard",
    icon: <GoldOutlined />,
    module: "ams",
    required: "asset",
  },
  {
    isSection: true,
    label: "Wealth Module",
    module: "wms",
    required: "wealth",
  },
  {
    key: "wealth-product",
    label: "Wealth Master",
    path: "/wms/dashboard",
    icon: <WalletOutlined />,
    module: "wms",
    required: "wealth",
  },
];

const SidebarMenu = ({ collapsed }) => {
  const location = useLocation();
  const { user, orgModules } = useAuth();

  const getActiveKey = (pathname) => {
    if (pathname.startsWith("/dms/purchase")) return "purchase";
    if (pathname.startsWith("/dms/sales")) return "sales";
    if (pathname.startsWith("/dms/reports")) return "reports";
    if (pathname.startsWith("/dms/master/product")) return "master-product";
    if (pathname.startsWith("/dms/master/business-partner"))
      return "master-business-partner";
    if (pathname.startsWith("/dms/master/reason")) return "master-reason";
    if (pathname.startsWith("/ams")) return "asset-product";
    if (pathname.startsWith("/wms")) return "wealth-product";
    return "";
  };

  const activeKey = getActiveKey(location.pathname);

  const menuItems = baseMenuItems.filter((item) => {
    // check if module is in orgModules
    if (item.module) {
      // safe-check: normalize orgModules to uppercase if it's an array of strings/objects
      const modulesNormalized = Array.isArray(orgModules)
        ? orgModules.map((m) =>
            typeof m === "string"
              ? m.toUpperCase()
              : (m.key || m.module || m.name || "").toUpperCase(),
          )
        : [];

      if (
        modulesNormalized.length > 0 &&
        !modulesNormalized.includes(item.module.toUpperCase())
      ) {
        return false;
      }
    }

    // if admin then allow all submodules
    if (user?.role === "admin") {
      return true;
    }

    // check if user has permission to this module
    if (item.required) {
      const modulePermission = Array.isArray(user?.permissions)
        ? user.permissions.find(
            (p) => (p.module || "").toLowerCase() === item.module,
          )
        : user?.permissions?.[item.module?.toUpperCase?.()] || null;

      if (!modulePermission) {
        return false;
      }

      // support both object submodules or map of flags
      const subs =
        modulePermission?.submodules || modulePermission?.submodule || {};
      if (Array.isArray(subs)) {
        return subs.includes(item.required);
      }
      if (typeof subs === "object") {
        return !!subs[item.required];
      }

      return false;
    }

    return true;
  });

  return (
    <Menu
      mode="inline"
      selectedKeys={[activeKey]}
      style={{ background: "white", border: "none" }}
      className="
        [&_.ant-menu-item]:text-amber-800
        [&_.ant-menu-item]:font-semibold
        [&_.ant-menu-item:hover]:!bg-amber-100
        [&_.ant-menu-item-active]:!bg-amber-100
        [&_.ant-menu-item-selected]:!bg-amber-100
        [&_.ant-menu-item-selected]:!text-amber-800
        [&_.ant-menu-item .anticon]:!text-amber-800
      "
    >
      {menuItems.map((item) =>
        item.isSection ? (
          !collapsed && (
            <div
              key={item.label}
              className="px-4 py-2 text-amber-800 font-semibold text-sm"
            >
              {item.label}
            </div>
          )
        ) : (
          <Menu.Item key={item.key} icon={item.icon}>
            <NavLink to={item.path} className="sidebar-menu-link">
              <span
                className={`sidebar-menu-label ${collapsed ? "hidden" : ""}`}
              >
                {item.label}
              </span>
            </NavLink>
          </Menu.Item>
        ),
      )}
    </Menu>
  );
};

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <aside
      className="sidebar fixed left-0 top-0 h-screen bg-white shadow-md transition-all duration-300 relative"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        overflow: "hidden",
      }}
    >
      {/* Sidebar content */}
      <SidebarHeader collapsed={collapsed} />

      <div className="flex-1 mt-2 overflow-y-auto">
        <SidebarMenu collapsed={collapsed} />
      </div>

      {/* Toggle Button (CENTERED) */}
      <button onClick={onToggle} className="sidebar-toggle-center">
        {collapsed ? <RightOutlined /> : <LeftOutlined />}
      </button>
    </aside>
  );
};

export default Sidebar;

// Sidebar.js
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  RiseOutlined

} from "@ant-design/icons";
import { FaFileInvoice } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import useSessionStore from "../store/sessionStore";

const { Sider } = Layout;


export default function Sidebar() {

  const location = useLocation();

  const transporterId = useSessionStore(
    (s) => s.currentTransporterId
  );

  const profilePath = transporterId
    ? `/profile-settings/${transporterId}`
    : "/dashboard";

  const menuItems = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/status", label: "Order Assign", icon: <BarChartOutlined /> },
    { key: "/loading-advice", label: "Loading Advice", icon: <FaFileInvoice /> },
    { key: profilePath, label: "Profile Settings", icon: <SettingOutlined /> },
  ];

  const selectedKey = location.pathname.startsWith("/profile-settings")
    ? profilePath
    : location.pathname;

  return (
    <Sider
      width={252}
      className="bg-white! py-1!  "
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}

      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon} className="text-amber-500!" >
            <NavLink to={item.key} className="no-underline! text-amber-800! w-full!">
              {item.label}
            </NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>




  );
}

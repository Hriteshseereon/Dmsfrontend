// Sidebar.js
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  RiseOutlined,
  WalletOutlined,

  
} from "@ant-design/icons";
import { NavLink, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function Sidebar() {
  const location = useLocation();
     
  const menuItems = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/contract", label: "Contract", icon: <FileTextOutlined /> },
    { key: "/order", label: "Order", icon: <ShoppingCartOutlined /> },
    { key: "/rise-dispute", label: "Rise Dispute", icon: <RiseOutlined /> },
   { key: "/deliverey-status", label: "Delivery Status", icon: <FileTextOutlined /> },
     { key: "/wallet", label: "Wallet", icon: <WalletOutlined /> },
   { key: "/reports", label: "Reports", icon: <BarChartOutlined /> },
     ];

  return (
    <Sider
      width={252}
      className="bg-white! py-1!  "
    >
       <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
       
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

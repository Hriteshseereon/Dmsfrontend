import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/common/Sidebar/Sidebar";
import Navbar from "../components/common/Navbar/Navbar";

const SIDEBAR_EXPANDED = 288; // 18rem
const SIDEBAR_COLLAPSED = 56; // fully hidden

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 66 : 240;

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div
        className="flex-1 transition-all duration-300 main-content"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar sidebarWidth={sidebarWidth}/>
        <div className="pt-15 pr-6 outlet-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

 import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrganizationList from "./OrganizationList";
import CustomerApproval from "./CustomerApproval";
import TransportApproval from "./TransportApproval";
 
const { TabPane } = Tabs;
 
const OrgTabs = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState("1");
  const { logout } = useAuth();
 
  const handleLogout = () => {
    logout();
  };
  // Sync tab with route
  useEffect(() => {
    if (location.pathname.endsWith("/customer")) setActiveKey("2");
    else if (location.pathname.endsWith("/transport")) setActiveKey("3");
    else setActiveKey("1"); // default to Organizations
  }, [location.pathname]);
 
  const onTabChange = (key) => {
    setActiveKey(key);
    if (key === "1") navigate("/organizations");
    else if (key === "2") navigate("/organizations/customer");
    else if (key === "3") navigate("/organizations/transport");
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <nav className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="font-bold text-3xl text-amber-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-amber-500 mt-1">
              Welcome back, {user.email}
            </p>
          </div>
 
         <button
  onClick={handleLogout}
  className="border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-semibold px-2 py-1 rounded-lg shadow-sm transition duration-200 flex items-center gap-2"
>
  <LogoutOutlined className="text-amber-500" />
  Logout
</button>
        </div>
      </nav>
 
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <Tabs activeKey={activeKey} onChange={onTabChange} tabBarGutter={40}>
          <TabPane
            tab={
              <span className="text-3xl font-bold text-amber-700">
                Organizations
              </span>
            }
            key="1"
          >
            <OrganizationList />
          </TabPane>
 
          <TabPane
            tab={
              <span className="text-3xl font-bold text-amber-700">
                Customer
              </span>
            }
            key="2"
          >
            <CustomerApproval />
          </TabPane>
 
          <TabPane
            tab={
              <span className="text-3xl font-bold text-amber-700">
                Transport
              </span>
            }
            key="3"
          >
            <TransportApproval />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
 
export default OrgTabs;
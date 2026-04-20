// Navbar.js
import { LogoutOutlined, UserOutlined, DownOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const formatDisplayName = (value) => {
    if (!value || typeof value !== "string") return "";

    return value
      .split(/[._\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const customerName =
    currentUser?.customer_name ||
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.customer?.name ||
    formatDisplayName(currentUser?.email?.split("@")[0]) ||
    "Customer";

  const goToProfile = () => {
    navigate("/profile-settings");
  };

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <div
          onClick={goToProfile}
          className="flex items-center space-x-2 text-amber-700 text-sm font-medium hover:underline cursor-pointer"
        >
          <UserOutlined />
          <span>Profile</span>
        </div>
      </Menu.Item>

      <Menu.Item key="2">
        <div
          onClick={logout}
          className="flex items-center space-x-2 text-red-500 text-sm font-medium hover:underline cursor-pointer"
        >
          <LogoutOutlined />
          <span>Log Out</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="fixed top-0 w-full h-20 z-20 p-2 bg-white  border-b border-amber-200">
      <div className="flex justify-between items-center px-6 py-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 text-white rounded-full p-3">
            <UserOutlined className="text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold text-amber-500">Customer Portal</h2></div>


        {/* Right: Customer + User */}
        <div className="flex items-center ">
          <div className="rounded-full border border-amber-200 bg-amber-100 px-4 py-1 text-sm font-medium text-amber-600">
            {customerName}
          </div>
          {/* Profile dropdown */}
          <Dropdown overlay={menu} placement="bottomRight" className="text-amber-600!">
            <div className="flex items-center space-x-2 cursor-pointer pl-2!">
              <Avatar size="medium" icon={<UserOutlined />} className="bg-amber-100!  text-amber-600! " />
                <DownOutlined className="text-amber-600 text-sm pl-2" />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

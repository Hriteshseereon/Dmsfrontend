// Navbar.js
import { BellOutlined, LogoutOutlined, UserOutlined, DownOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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


        {/* Right: Notifications + User */}
        <div className="flex items-center ">
          {/* Notification */}
          <Badge count={3} className="mr-2!">
            <BellOutlined className="text-xl! text-amber-600! cursor-pointer!" />
          </Badge>

          {/* Profile dropdown */}
          <Dropdown overlay={menu} placement="bottomRight" className="text-amber-600!">
            <div className="flex items-center space-x-2 cursor-pointer pl-2!">
              <Avatar size="small" icon={<UserOutlined />} className="bg-amber-100!  text-amber-600! " />
              <span className="text-sm text-amber-600 pl-3 ">{currentUser?.name}</span>
              <DownOutlined className="text-amber-600 text-sm pl-2" />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

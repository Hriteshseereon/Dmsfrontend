// Navbar.js
import { BellOutlined,LogoutOutlined, UserOutlined, DownOutlined, TruckOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Navbar = () => {
  const { currentUser ,logout} = useAuth();
const navigate = useNavigate();

const goToProfile = () => {
  navigate("/profile-settings");
};

  const menu = (
    <Menu>
<Menu.Item key="1">
  <div
    onClick={goToProfile}
    className="flex items-center space-x-2 text-green-500 text-sm font-medium hover:underline cursor-pointer"
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
        <div className="flex items-center gap-3">
         <div className="bg-amber-500 text-white rounded-full p-3">
            <TruckOutlined className="text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold text-amber-500">Transporter Portal</h2></div>


        {/* Right: Notifications + User */}
        <div className="flex items-center space-x-6">
          {/* Notification */}
          <Badge count={3}>
            <BellOutlined className="text-xl! text-amber-800! cursor-pointer!" />
          </Badge>

          {/* Profile dropdown */}
          <Dropdown overlay={menu} placement="bottomRight">
            <div className="flex items-center space-x-2 cursor-pointer pl-4!">
              <Avatar size="small" icon={<UserOutlined />} className="bg-amber-100!  text-amber-800! " />
              <span className="text-sm text-amber-800 pl-4 ">{currentUser?.name}</span>
              <DownOutlined className="text-amber-800 text-sm pl-2" />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

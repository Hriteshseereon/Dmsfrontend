// Navbar.js
import {
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import useSessionStore from "../store/sessionStrore";
const Navbar = () => {
  const navigate = useNavigate();

  const registeredName = useSessionStore((state) => state.registeredName);
  const clearSession = useSessionStore((state) => state.clearSession);
  const displayName = registeredName || "Transporter";

  const goToProfile = () => {
    navigate("/profile-settings");
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
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
          onClick={handleLogout}
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
          <h2 className="text-2xl font-semibold text-amber-500">
            Transporter Portal
          </h2>
        </div>

        {/* Right: Transporter + User */}
        <div className="flex items-center space-x-2">
          <div className="rounded-full border border-amber-200 bg-amber-100 px-4 py-1 text-sm font-medium text-amber-600">
            {displayName}
          </div>

          {/* Profile dropdown */}
          <Dropdown overlay={menu} placement="bottomRight">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar
                size="medium"
                icon={<UserOutlined />}
                className="bg-amber-100! text-amber-600!"
              />
                <DownOutlined className="text-amber-600! text-sm!" />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

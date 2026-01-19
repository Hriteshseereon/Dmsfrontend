import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ sidebarWidth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const goToProfile = () => {
    navigate("/dms/settings");
  };
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={goToProfile}>Profile</Menu.Item>
      <Menu.Item key="2" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      className="h-15 bg-white shadow-sm flex items-center justify-between fixed top-0 right-0  z-20 transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      <div className="flex flex-col">
        <h2 className="font-semibold text-lg text-amber-800 leading-tight">
          Admin Dashboard
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        <Dropdown overlay={menu} placement="bottomRight">
          <div className="flex items-center cursor-pointer space-x-1">
            <Avatar
              size="small"
              icon={<UserOutlined />}
              className="bg-amber-200! text-amber-700!"
            />
            <span className="font-medium text-amber-800 pl-1">
              {user?.email?.split("@")[0] || "User"}
            </span>
            <DownOutlined className="text-amber-800! text-sm!" />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;

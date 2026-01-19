import { useAuth } from "../../context/AuthContext";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleMenuClick = ({ key }) => {
    if (key === "2") {
      logout();
    }
    // Add profile navigation logic for key "1" if needed
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Profile</Menu.Item>
      <Menu.Item key="2">Logout</Menu.Item>
    </Menu>
  );

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <nav className="bg-white flex justify-between items-center px-6 py-3 shadow-md">
      <div className="flex flex-col">
        <h1 className="font-bold text-lg text-amber-800">Admin Dashboard</h1>
        <p className="text-amber-800 text-sm -mt-1">
          Welcome back, {displayName} 👋
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <Dropdown overlay={menu} placement="bottomRight">
          <div className="flex items-center cursor-pointer space-x-1">
            <Avatar
              size="small"
              icon={<UserOutlined />}
              className="bg-amber-900 text-amber-100"
            />
            <span className="font-medium text-amber-800 pl-1">
              {user?.email}
            </span>
            <DownOutlined className="text-amber-800 text-sm" />
          </div>
        </Dropdown>
      </div>
    </nav>
  );
}

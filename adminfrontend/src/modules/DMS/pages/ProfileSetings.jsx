import React, { useState } from "react";
import { Card, Input, Button, Switch } from "antd";
import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LogoutOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ===== JSON DATA =====
const profileData = {
  user: {
    fullName: "Rajesh Kumar",
    email: "rajesh@aumagro.com",
    phone: "+91-9876543210",
    role: "Admin",
    organization: "Aum Agro Associates",
  },
  accountStatus: {
    status: "Active",
    lastLogin: "Today, 9:30 AM",
    memberSince: "Jan 2024",
    rolePermissions: "Full Access",
  },
  notifications: {
    channels: [
      { label: "WhatsApp", enabled: true },
      { label: "Email", enabled: true },
      { label: "Push Notifications", enabled: true },
    ],
    alerts: [
      { label: "Contract Alerts", enabled: true },
      { label: "Invoice Reminders", enabled: true },
      { label: "Transit Updates", enabled: true },
      { label: "Return Notifications", enabled: false },
    ],
  },
};

export default function ProfileSetings() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData.user);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="p-4">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-amber-900">Profile & Settings</h1>
      <p className="text-amber-700 mb-6">
        Manage your account settings and preferences
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card className="rounded-2xl shadow-sm border-amber-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-amber-800">
                Profile Information
              </h2>
              {isEditing ? (
                <div className="space-x-2">
                  <Button
                    className=" text-amber-700! border-amber-300! "
                    size="small"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    className="bg-amber-500! border-amber-500! hover:bg-amber-600!"
                    onClick={() => setIsEditing(false)}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  className="bg-amber-500! border-amber-500! hover:bg-amber-600! text-white!"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            <div className="flex items-center gap-12 bg-amber-100 p-3 rounded-lg mb-2 w-full">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl">
                <UserOutlined />
              </div>
              <div className="leading-tight">
                <h3 className="font-semibold text-xl text-amber-900">
                  {formData.fullName}
                </h3>
                <p className="text-amber-700 m-0">{formData.role}</p>
                <p className="text-amber-600 m-0">{formData.organization}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-amber-700">Full Name</label>
                <Input
                  value={formData.fullName}
                  disabled={!isEditing}
                  onChange={(e) => handleChange(e, "fullName")}
                />
              </div>
              <div>
                <label className="text-sm text-amber-700">Email Address</label>
                <Input
                  value={formData.email}
                  disabled={!isEditing}
                  onChange={(e) => handleChange(e, "email")}
                />
              </div>
              <div>
                <label className="text-sm text-amber-700">Phone Number</label>
                <Input
                  value={formData.phone}
                  disabled={!isEditing}
                  onChange={(e) => handleChange(e, "phone")}
                />
              </div>
              <div>
                <label className="text-sm text-amber-700">Role</label>
                <Input
                  value={formData.role}
                  disabled={!isEditing}
                  onChange={(e) => handleChange(e, "role")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-amber-700">Organization</label>
                <Input
                  value={formData.organization}
                  disabled={!isEditing}
                  onChange={(e) => handleChange(e, "organization")}
                />
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="rounded-2xl shadow-sm border-amber-200">
            <h2 className="text-lg font-semibold mb-4 text-amber-800">
              Change Password
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input.Password placeholder="Enter current password" />
              </div>
              <Input.Password
                placeholder="Enter new password"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#D97706" />
                  ) : (
                    <EyeInvisibleOutlined />
                  )
                }
              />
              <Input.Password placeholder="Confirm new password" />
            </div>
            <Button
              type="primary"
              className="mt-4! bg-amber-500! border-amber-500! hover:bg-amber-500!"
              icon={<LockOutlined />}
            >
              Update Password
            </Button>
          </Card>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-amber-200">
            <h2 className="text-lg font-semibold mb-4 text-amber-800">
              Account Status
            </h2>
            <div className="space-y-3 text-sm text-amber-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Account Status:</span>
                <span className="bg-amber-900 text-white px-2 py-0.5 rounded text-xs">
                  {profileData.accountStatus.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Last Login:</span>
                <span>{profileData.accountStatus.lastLogin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Member Since:</span>
                <span>{profileData.accountStatus.memberSince}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Role Permissions:</span>
                <span className="bg-amber-200 px-2 py-0.5 rounded text-xs">
                  {profileData.accountStatus.rolePermissions}
                </span>
              </div>
            </div>
          </Card>

          {/* <Card className="rounded-2xl shadow-sm border-amber-200">
            <h2 className="text-lg font-semibold mb-4 text-amber-800">
              Notification Preferences
            </h2>
            <div className="space-y-4 text-amber-700">
              {profileData.notifications.channels.map((ch, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span>{ch.label}</span>
                  <Switch
                    defaultChecked={ch.enabled}
                    className="bg-amber-600"
                  />
                </div>
              ))}

              <h2 className="text-lg font-semibold mt-4 mb-2 text-amber-800">
                Alert Types
              </h2>
              {profileData.notifications.alerts.map((alert, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span>{alert.label}</span>
                  <Switch
                    defaultChecked={alert.enabled}
                    className="bg-amber-600"
                  />
                </div>
              ))}
            </div>
          </Card> */}

          {/* Danger Zone */}
          <Button danger block icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

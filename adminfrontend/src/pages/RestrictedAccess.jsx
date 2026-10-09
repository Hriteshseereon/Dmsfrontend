import React from "react";
import { Result, Button } from "antd";
import { LockOutlined, ClockCircleOutlined, ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RestrictedAccess({
  submoduleKey,
  moduleKey,
  action = "view",
  isExpired = false,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (isExpired) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-rose-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
            <ClockCircleOutlined />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Access Privilege Expired
          </h2>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Your temporary access validity period has ended or this user account is currently inactive.
          </p>
          {user?.startDate && user?.endDate && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 font-medium mb-6">
              Assigned Validity Period: <span className="font-bold">{user.startDate}</span> to{" "}
              <span className="font-bold">{user.endDate}</span>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              type="primary"
              danger
              size="large"
              onClick={logout}
              className="font-bold rounded-xl h-11 px-6"
            >
              Re-login to Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-amber-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
          <LockOutlined />
        </div>
        <h2 className="text-xl font-bold text-amber-900 mb-2">
          Restricted Screen Access
        </h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          You do not have permission to access {submoduleKey ? `"${submoduleKey}"` : moduleKey ? `the "${moduleKey}" module` : "this section"}.
          Please contact your administrator to request access.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="border-amber-300 text-amber-800 font-semibold rounded-xl h-10 px-5"
          >
            Go Back
          </Button>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate(user?.is_admin ? "/organizations" : "/dashboard")}
            className="bg-amber-600 hover:bg-amber-700 font-bold rounded-xl h-10 px-5 border-none"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

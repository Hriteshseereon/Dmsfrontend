// CustomerDashboard.jsx
import React from "react";
import { Card,  } from "antd";
import {
 
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { FaBoxOpen, FaClock, FaTruck, FaUserCheck } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ================= CUSTOMER DASHBOARD DATA ================= */
const dashboardData = {
  orderStatus: [
    { name: "Delivered", value: 68 },
    { name: "In Transit", value: 22 },
    { name: "Pending", value: 10 },
  ],

  monthlyOrders: [
    { month: "Jan", Orders: 40 },
    { month: "Feb", Orders: 52 },
    { month: "Mar", Orders: 48 },
    { month: "Apr", Orders: 60 },
    { month: "May", Orders: 55 },
    { month: "Jun", Orders: 62 },
  ],

  serviceRequests: [
    { name: "Product Issue", cases: 6 },
    { name: "Late Delivery", cases: 4 },
    { name: "Billing Query", cases: 3 },
    { name: "Other", cases: 2 },
  ],

  customerStats: [
    { label: "Total Orders", value: 128 },
    { label: "Active Deliveries", value: 6 },
    { label: "Open Tickets", value: 3 },
  ],

  engagement: [
    { label: "Repeat Orders", value: "72%" },
    { label: "Satisfaction", value: "4.6/5" },
    { label: "On-Time Delivery", value: "91%" },
  ],

  alerts: [
    { label: "Delayed Orders", value: 2 },
    { label: "Pending Payments", value: 1 },
    { label: "Support Replies", value: 3 },
  ],
};

const CustomerDashboard = () => {
  const amberButton =
    "bg-amber-500! hover:bg-amber-400! active:bg-amber-600! focus:bg-amber-600! text-white!";

  return (
    <div>
      {/* Header */}

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-4 gap-6">
        <div className="border-amber-400 border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Order Completion
            </h3>
            <FaBoxOpen className="text-amber-600!" />
          </div>
          <p className="text-xl font-bold text-amber-800">68%</p>
          <p className="text-sm text-amber-600">
            <ArrowUpOutlined /> +4%
          </p>
        </div>

        <div className="border-amber-400 border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Avg Delivery Time
            </h3>
            <FaTruck className="text-amber-600!" />
          </div>
          <p className="text-xl font-bold text-amber-800">2.1 days</p>
          <p className="text-sm text-amber-600">
            <ArrowDownOutlined  /> -0.4 days
          </p>
        </div>

        <div className="border-amber-400 border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Pending Orders
            </h3>
            <FaClock className="text-amber-600!" />
          </div>
          <p className="text-xl font-bold text-amber-800">10</p>
          <p className="text-sm text-amber-600">
            <ArrowUpOutlined  /> +2
          </p>
        </div>

        <div className="border-amber-400 border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Rise Dispute
            </h3>
            <WarningOutlined className="text-amber-600!" />
          </div>
          <p className="text-xl font-bold text-amber-800">15</p>
          <p className="text-sm text-amber-600">
            <ArrowDownOutlined /> -3
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Status Pie */}
        <Card
          title={
            <div className="font-semibold text-amber-700">
              Order Status
              <div className="text-xs text-amber-500">
                Delivered vs In Transit vs Pending
              </div>
            </div>
          }
          className="rounded-xl"
        >
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dashboardData.orderStatus}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={110}
                  label
                >
                  <Cell fill="#fcd34d" />
                  <Cell fill="#d97706" />
                  <Cell fill="#92400e" />
                </Pie>
                <Legend className="pt-2!" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Orders */}
        <Card
          title={
            <div className="font-semibold text-amber-700">
              Monthly Orders
              <div className="text-xs text-amber-500">
                Order trend over time
              </div>
            </div>
          }
          className="rounded-xl"
        >
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={dashboardData.monthlyOrders}>
                <XAxis dataKey="month" stroke="#c05621" />
                <YAxis stroke="#c05621" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Orders"
                  stroke="#f59e0b"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Service Requests */}
        <Card
          title={
            <div className="font-semibold text-amber-700">
              Service Requests
              <div className="text-xs text-amber-500">
                Support issues raised by customers
              </div>
            </div>
          }
          className="rounded-xl"
        >
          <div className="space-y-3">
            {dashboardData.serviceRequests.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between bg-amber-50 rounded-lg p-3 shadow-sm"
              >
                <div className="text-amber-700 font-medium">{r.name}</div>
                <div className="text-amber-700 font-semibold">
                  {r.cases} cases
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Engagement */}
        <Card
          title={
            <div className="font-semibold text-amber-700">
              Customer Engagement
              <div className="text-xs text-amber-500">
                Loyalty & satisfaction
              </div>
            </div>
          }
          className="rounded-xl"
        >
          <ul className="space-y-3">
            {dashboardData.engagement.map((e) => (
              <li key={e.label} className="flex justify-between">
                <span className="text-amber-700">{e.label}</span>
                <span className="border border-amber-400 px-3 py-1 rounded-xl text-amber-700">
                  {e.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

     
    </div>
  );
};

export default CustomerDashboard;

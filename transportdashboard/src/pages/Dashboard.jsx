// Dashboard.jsx
import React from "react";
import { Card, Table, Tag } from "antd";
import {
  DollarOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Cell
} from "recharts";

// ---------------- Data ----------------
const summary = [
  { label: "Total Value", value: 150, icon: <DollarOutlined className="text-amber-600!" /> },
  { label: "Pending Assignments", value: 124, icon: <ClockCircleOutlined className="text-yellow-600!" /> },
  { label: "In Transit", value: 121, icon: <TruckOutlined className="text-blue-600!" /> },
  { label: "Delivered", value: 123, icon: <CalendarOutlined className="text-green-600!" /> },
];


const shipmentStatusData = [
  { name: "Pending", value: 0.5 },
  { name: "In Transit", value: 1 },
  { name: "Delivered", value: 2 },
  { name: "Out For Delivery", value: 0.7 },
  { name: "Assigned", value: 3 },
];

const monthlyValueData = [
  { month: "Jan", value: 12000 },
  { month: "Feb", value: 15000 },
  { month: "Mar", value: 18000 },
  { month: "Apr", value: 22000 },
  { month: "May", value: 25000 },
  { month: "Jun", value: 21000 },
];

const transporterPerformance = [
  { name: "Gati Logistics", value: 40 },
  { name: "SpeedEx", value: 30 },
  { name: "BlueTrack", value: 20 },
  { name: "RoadRunner", value: 10 },
];

const COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e"];

const recentShipments = [
  { id: "PO12345", vendor: "ABC Industries", status: "Delivered", date: "17 Nov 2025" },
  { id: "PO98765", vendor: "Global Traders", status: "In Transit", date: "18 Nov 2025" },
  { id: "PO45678", vendor: "Sunrise Corp", status: "Pending", date: "19 Nov 2025" },
];

// ---------------- Reusable Components ----------------

const SummaryCard = ({ label, value, icon }) => (
  <Card className="rounded-xl shadow-sm border border-amber-200 w-60">
    <div className="flex flex-col gap-2">
      <p className="text-amber-500 text-base font-medium">{label}</p>

      <div className="flex items-center gap-30">
        {React.cloneElement(icon, { className: "text-amber-700 text-xl" })}
        <p className="text-lg font-semibold text-amber-700 truncate">
          {label === "Total Value" ? `₹${(+value).toLocaleString()}` : value}
        </p>
      </div>
    </div>
  </Card>
);


const columns = [
  { title: <span className="text-amber-600 font-semibold">Order No</span>, dataIndex: "id", render: t => <span className="text-amber-600 font-semibold">{t}</span> },
  { title: <span className="text-amber-600 font-semibold">Vender</span>, dataIndex: "vendor", render: t => <span className="text-amber-600 font-semibold">{t}</span> },
  {
    title: <span className="text-amber-600 font-semibold">Status</span>,
    dataIndex: "status",
    render: (s) => (
      <Tag color={s === "Delivered" ? "green" : s === "In Transit" ? "orange" : "red"}>
        {s}
      </Tag>
    ),
  },
  { title: <span className="text-amber-600 font-semibold">Date</span>, dataIndex: "date",render: t => <span className="text-amber-600 font-semibold">{t}</span> },
];

// ---------------- Main Component ----------------

export default function Dashboard() {
  return (
    <div className="p-0">
      <h2 className="text-3xl font-bold mb-5 text-amber-700">Dashboard</h2>
      <p className=" text-amber-500">Manage Your Transportation & Deliveries</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {summary.map((s, i) => (
          <SummaryCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="rounded-xl! border! border-amber-200! shadow-sm!">
          <h3 className="text-xl font-semibold text-amber-600 mb-3">Shipment Status Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={shipmentStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#d97706"  barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-xl! border! border-amber-200! shadow-sm!">
          <h3 className="text-xl font-semibold text-amber-600 mb-3">Monthly Transport Value</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyValueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#b45309" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <Card className="rounded-xl! border! border-amber-200! shadow-sm!">
          <h3 className="text-xl font-semibold text-amber-600 mb-4">Recent Shipments</h3>
          <Table columns={columns} dataSource={recentShipments} pagination={false} rowKey="id" />
        </Card>

        <Card className="rounded-xl! border border-amber-200! shadow-sm!">
          <h3 className="text-xl font-semibold text-amber-600 mb-4">Top Transporters Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Tooltip />
              <Pie data={transporterPerformance} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {transporterPerformance.map((e, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

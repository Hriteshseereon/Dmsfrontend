// Dashboard.jsx


import React, { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import {
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Cell, Legend
} from "recharts";
import { getDashboardData } from "../api/dashboard";
// ---------------- Data ----------------



const COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e"];



// ---------------- Reusable Components ----------------

const SummaryCard = ({ label, value, icon }) => (
 <Card className="rounded-xl! shadow-sm! border-1! border-amber-300! w-full">    
 <div className="flex flex-col gap-2">
      <p className="text-amber-500 text-base font-medium">{label}</p>

<div className="flex items-center justify-between">
     {React.cloneElement(icon, { className: "text-amber-700! text-xl!" })}
        <p className="text-lg! font-semibold! text-amber-700! truncate!">
          {label === "Total Value" ? `₹${(+value).toLocaleString()}` : value}
        </p>
      </div>
    </div>
  </Card>
);




// ---------------- Main Component ----------------

export default function Dashboard() {

  
   const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardData();
      console.log("API DATA:", res);
      setDashboardData(res);
    } catch (err) {
      console.error(err);
    }
  };
const summary = dashboardData
  ? [
      {
        label: "Total Assignments",
        value: dashboardData.quick_actions.total_assignments,
        icon: <DollarOutlined />,
      },
      {
        label: "Pending Assignments",
        value: dashboardData.quick_actions.pending_assignments,
        icon: <ClockCircleOutlined />,
      },
      {
        label: "Approved",
        value: dashboardData.quick_actions.approved_assignments,
        icon: <CheckCircleOutlined />,
      },
    ]
  : [];


const shipmentStatusData = dashboardData
  ? dashboardData.pie_chart.map(item => ({
      name: item.status,
      value: item.count,
    }))
  : [];

const monthlyValueData = dashboardData
  ? dashboardData.line_chart.map(item => ({
      month: item.month,
      delivered: item.delivered,
      assigned: item.assigned,
    }))
  : [];

  return (
    <div className="p-0">
      <h2 className="text-3xl font-bold mb-5 text-amber-700">Dashboard</h2>
      <p className=" text-amber-500">Manage Your Transportation & Deliveries</p>
    <div className="grid grid-cols-12 gap-4 mb-6"> {summary.map((s, i) => (
    <div key={i} className="col-span-4">
      <SummaryCard {...s} />
    </div>
  ))}
</div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="rounded-xl! shadow-sm! border! border-amber-200! w-full">
          <h3 className="text-xl font-semibold text-amber-600 mb-3">Shipment Status Overview</h3>
         <ResponsiveContainer width="100%" height={260}>
  <PieChart>
    <Tooltip />
    <Legend verticalAlign="bottom" align="center" />
    <Pie
      data={shipmentStatusData}
      cx="50%"
      cy="50%"
      outerRadius={100}
      dataKey="value"
      label
    >
      {shipmentStatusData.map((entry, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
 
  </PieChart>

</ResponsiveContainer>
        </Card>

        <Card className="rounded-xl! border! border-amber-200! shadow-sm!">
          <h3 className="text-xl font-semibold text-amber-600 mb-3">Monthly Assigned vs Delivered</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyValueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" />
              <Line type="monotone" dataKey="assigned" name="Assigned" stroke="#d97706" strokeWidth={3} dot />
              <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#16a34a" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      
    </div>
  );
}

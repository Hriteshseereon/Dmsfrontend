
// Dashboard.jsx
import React from "react";
import { Card } from "antd";
import {
  RiseOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DeliveredProcedureOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";

// ================== JSON DATA ==================
const dashboardData = {

  quickActions: [
    {
      title: "Contract",
      description: "Manage contracts",
      count: 42,
      icon: <FileTextOutlined />,
      color: "amber",
      route: "/contract",
      bg: "bg-amber-100",
    },
    {
      title: "Order",
      description: "Process orders",
      count: 35,
      icon: <ShoppingCartOutlined />,
      color: "amber",
      route: "/order",
      bg: "bg-amber-100",
    },
    {
      title: "Rise Dispute",
      description: "Handle returns",
      count: 4,
           icon: <RiseOutlined />,
      color: "amber",
      route: "/rise-dispute",
      bg: "bg-amber-100",
    },

    {
      title: "Delivery Status",
      description: "Track deliveries",
      count: 28,
   
      icon: <DeliveredProcedureOutlined />,
      color: "amber",
      route: "/deliverey-status",
      bg: "bg-amber-100",
    },

    {
      title: "Pending Orders",
      description: "Track pending orders",
      count: 28,
      icon: <ClockCircleOutlined />,
      color: "amber",
      route: "/pending-transaction",
      bg: "bg-amber-100",
    },
    {
      title: "Approved Orders",
      description: "Track Approved deliveries",
      count: 28,
      icon: <TruckOutlined />,
      color: "amber",
      route: "/approved-deliveries",
      bg: "bg-amber-100",
    },
   

  ],
  revenueTrend: [
    { month: "Apr", revenue: 12 },
    { month: "May", revenue: 14 },
    { month: "Jun", revenue: 16 },
    { month: "Jul", revenue: 18 },
    { month: "Aug", revenue: 18.5 },
    { month: "Sep", revenue: 19.5 },
  ],
  salesDistribution: [
    { name: "Sunflower Oil", value: 33 },
    { name: "Mustard Oil", value: 24 },
    { name: "Soybean Oil", value: 21 },
    { name: "Groundnut Oil", value: 9 },
    { name: "Coconut Oil", value: 13 },
  ],
  locationPerformance: [
    { city: "Bhubaneswar", revenue: 670000 },
    { city: "Cuttack", revenue: 550000 },
    { city: "Puri", revenue: 320000 },
    { city: "Berhampur", revenue: 234000 },
    { city: "Rourkela", revenue: 180000 },
  ],
  activities: [
    { text: "Contract with Mahesh Traders created", time: "5 minutes ago" },
    { text: "Sunflower Oil order delivered to Puri", time: "25 minutes ago" },
    { text: "Return processed for Raj Enterprises", time: "1 hour ago" },
    { text: "Monthly Odisha report generated", time: "3 hours ago" },
    { text: "New contract with Shree Distributors", time: "5 hours ago" },
  ],
};

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#78350f"];

// ================== COMPONENT ==================
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-0 space-y-4 text-amber-800">

    <div>
  <h2 className="text-xl font-bold text-amber-700">Quick Actions</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {dashboardData.quickActions.map((action, index) => (
      <Card
        key={index}
        className="shadow-sm! rounded-xl! cursor-pointer! hover:shadow-md! bg-amber-50! h-37! border! border-amber-400!"
        onClick={() => navigate(action.route)}
      >
        {/* Row: text left, icon right */}
        <div className="flex items-start justify-between">
          {/* LEFT: title + description + count */}
          <div className="flex-1 pr-2">
            <h3 className="text-lg font-bold mt-1 text-amber-800">
              {action.title}
            </h3>
            <p className="text-amber-600 text-xs">{action.description}</p>
            <div className="flex justify-between items-center w-full mt-2">
              <span className="text-lg font-bold text-amber-700">
                {action.count}
              </span>
              
            </div>
          </div>

          {/* RIGHT: icon */}
          <div className="ml-2 flex items-start">
            {React.cloneElement(action.icon, {
              className: `text-2xl! text-${action.color}-600!`,
            })}
          </div>
        </div>
      </Card>
    ))}
  </div>
</div>


      {/* CHARTS */}
      <div className="grid grid-cols-1 pt-4 md:grid-cols-2 gap-6">
        {/* Product Distribution */}
        <Card className="rounded-xl!">
          <h3 className="font-semibold mb-2 text-amber-700">
            Product Distribution
          </h3>
          <p className="text-sm text-amber-600 mb-4">
            Ruchi Soya edible oils performance
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.salesDistribution}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {dashboardData.salesDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />

            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className=" rounded-xl! ">
          <h3 className="font-semibold text-amber-700">Recent Activity</h3>
          <p className="text-sm text-amber-600 mb-3">
            Latest system updates
          </p>
          <div className="space-y-3">
            {dashboardData.activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 hover:bg-amber-100 rounded-lg transition"
              >
                <span className="w-2 h-2 mt-2 rounded-full bg-amber-600 shrink-0"></span>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {activity.text}
                  </p>
                  <p className="text-xs m-0 text-amber-600">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>



      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="rounded-xl! ">
          <h3 className="font-semibold mb-2 text-amber-700">Revenue Trend</h3>
          <p className="text-sm text-amber-600 mb-4">
            Monthly revenue and order trends
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData.revenueTrend}>
              <XAxis dataKey="month" stroke="#b45309" />
              <YAxis stroke="#b45309" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#b45309"
                fill="#f59e0b"
              />

            </LineChart>
          </ResponsiveContainer>
        </Card>
        {/* Location Performance */}

        <Card className=" rounded-xl! ">
          <h3 className="font-semibold mb-2 text-amber-700">
            Location Performance
          </h3>
          <p className="text-sm text-amber-600 mb-4">
            Orders and revenue by Odisha cities
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.locationPerformance}>
              <XAxis dataKey="city" stroke="#b45309" />
              <YAxis stroke="#b45309" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#f59e0b" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>



      </div>
    </div>
  );
}


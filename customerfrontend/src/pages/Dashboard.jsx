
import React, { useEffect, useState } from "react";
import { Card } from "antd";
import {
  RiseOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
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
import { getDashboardData } from "../api/dashboard";

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#78350f"];

const QUICK_ACTION_CONFIG = [
  {
    key: "total_contracts",
    title: "Contract",
    description: "Manage contracts",
    icon: <FileTextOutlined />,
    color: "amber",
    route: "/contract",
  },
  {
    key: "total_orders",
    title: "Order",
    description: "Process orders",
    icon: <ShoppingCartOutlined />,
    color: "amber",
    route: "/order",
  },
  {
    key: "total_disputes",
    title: "Rise Dispute",
    description: "Handle disputes",
    icon: <RiseOutlined />,
    color: "amber",
    route: "/rise-dispute",
  },
];

const INITIAL_DASHBOARD_STATE = {
  quick_actions: {},
  pie_chart: [],
  line_chart: [],
  bar_chart: [],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(INITIAL_DASHBOARD_STATE);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        setDashboardData({
          quick_actions: response?.quick_actions ?? {},
          pie_chart: response?.pie_chart ?? [],
          line_chart: response?.line_chart ?? [],
          bar_chart: response?.bar_chart ?? [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = QUICK_ACTION_CONFIG.map((action) => ({
    ...action,
    count: dashboardData.quick_actions?.[action.key] ?? 0,
  }));

  const pieChartData = dashboardData.pie_chart.map((item) => ({
    name: item.product_name,
    value: item.count,
  }));

  const lineChartData = dashboardData.line_chart.map((item) => ({
    month: item.month,
    count: item.count,
  }));

  const barChartData = dashboardData.bar_chart.map((item) => ({
    month: item.month,
    count: item.count,
  }));

  return (
    <div className="p-0 space-y-4 text-amber-800">
      <div>
        <h2 className="text-xl font-bold text-amber-700">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="shadow-sm! rounded-xl! cursor-pointer! hover:shadow-md! bg-amber-50! h-37! border! border-amber-400!"
              onClick={() => navigate(action.route)}
            >
              <div className="flex items-start justify-between">
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

      <div className="grid grid-cols-1 pt-4 md:grid-cols-2 gap-6">
        <Card className="rounded-xl!">
          <h3 className="font-semibold mb-2 text-amber-700">
            Products Across Contracts
          </h3>
          <p className="text-sm text-amber-600 mb-4">
            Products shown based on contract activity across the year
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieChartData.map((entry, index) => (
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

        <Card className="rounded-xl!">
          <h3 className="font-semibold mb-2 text-amber-700">
            Contract Trends by Month
          </h3>
          <p className="text-sm text-amber-600 mb-4">
            Contract count by month
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="month" stroke="#b45309" />
              <YAxis stroke="#b45309" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#b45309" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="rounded-xl!">
          <h3 className="font-semibold mb-2 text-amber-700">
            Orders by Month
          </h3>
          <p className="text-sm text-amber-600 mb-4">
            Order count by month 
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData} barCategoryGap="12%">
              <XAxis dataKey="month" stroke="#b45309" />
              <YAxis stroke="#b45309" />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" barSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}


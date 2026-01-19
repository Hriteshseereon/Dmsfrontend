// Dashboard.jsx
import { Card } from "antd";
import {
  ShoppingCartOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  BarChartOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { FaCheckCircle } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { GrDeliver } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
// ================== JSON DATA ==================
const tailwindColors = {
  red: { bg: "bg-red-50", text: "text-red-600", subtitle: "text-red-500" },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    subtitle: "text-yellow-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    subtitle: "text-green-500",
  },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  gray: { bg: "bg-gray-100", text: "text-gray-600" },
};

const dashboardData = {
  overviewCards: [
    {
      title: "Total Purchase Soudas",
      value: 45,
      subtitle: "Active contracts",
      icon: <ShoppingCartOutlined className="text-amber-800! text-base!" />,
      path: "/dms/purchase/souda",
    },
    {
      title: "Active Purchase Indents",
      value: 12,
      subtitle: "Awaiting processing",
      icon: <OrderedListOutlined className="text-amber-800! text-base!" />,
      path: "/dms/purchase/indent",
    },
    {
      title: "Pending Invoices",
      value: 8,
      subtitle: "Purchase + Sales",
      icon: <FileTextOutlined className="text-amber-800! text-base!" />,
      path: "/dms/purchase/invoice",
    },
    {
      title: "Total Invoice Value",
      value: "₹24.5L",
      subtitle: "This month",
      icon: <BarChartOutlined className="text-amber-800! text-base!" />,
    },
  ],

  contractData: [
    { name: "Mustard Oil", reserved: 4800, consumed: 3000 },
    { name: "Sunflower Oil", reserved: 4200, consumed: 2900 },
    { name: "Coconut Oil", reserved: 3500, consumed: 2500 },
    { name: "Groundnut Oil", reserved: 5000, consumed: 3700 },
  ],

  monthlyData: [
    { month: "Jan", purchase: 180000, sales: 160000 },
    { month: "Feb", purchase: 200000, sales: 170000 },
    { month: "Mar", purchase: 150000, sales: 190000 },
    { month: "Apr", purchase: 170000, sales: 120000 },
    { month: "May", purchase: 280000, sales: 150000 },
    { month: "Jun", purchase: 300000, sales: 270000 },
  ],

  pendingIndents: [
    {
      id: "PI#2024001",
      item: "Mustard Oil - 500 Ltrs",
      days: "2 days",
      urgent: true,
    },
    {
      id: "PI#2024002",
      item: "Sunflower Oil - 300 Ltrs",
      days: "5 days",
      urgent: false,
    },
    {
      id: "PI#2024003",
      item: "Coconut Oil - 200 Ltrs",
      days: "8 days",
      urgent: true,
    },
  ],

  transitOverview: [
    {
      vehicle: "OD-05-AB-1234",
      route: "Bhubaneswar to Cuttack",
      status: "In Transit",
      type: "Purchase",
      color: "blue",
    },
    {
      vehicle: "OD-06-AB-5678",
      route: "Rourkela to Berhampur",
      status: "Delivered",
      type: "Sales",
      color: "green",
    },
    {
      vehicle: "OD-07-AB-9018",
      route: "Puri to Sambalpur",
      status: "Loading",
      type: "Purchase",
      color: "gray",
    },
  ],

  returnsSummary: [
    {
      title: "Quality Issues",
      value: 3,
      subtitle: "This week",
      color: "red",
      icon: <FiXCircle className="text-red-600 text-xl" />,
    },
    {
      title: "Wrong Delivery",
      value: 1,
      subtitle: "This week",
      color: "yellow",
      icon: <WarningOutlined className="text-yellow-600 text-xl" />,
    },
    {
      title: "Resolved",
      value: 12,
      subtitle: "This month",
      color: "green",
      icon: <FaCheckCircle className="text-green-600 text-xl" />,
    },
  ],
};

// ================== COMPONENT ==================
const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="p-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-amber-800 font-bold m-0">Dashboard</h2>
        <p className="text-amber-800 text-md">
          Overview of your edible oil business operations
        </p>
      </div>

      {/* Overview Cards */}
      <div className="mt-4 grid grid-cols-4 gap-6">
        {dashboardData.overviewCards.map((card, i) => (
          <div
            key={i}
            role={card.path ? "button" : undefined}
            tabIndex={card.path ? 0 : undefined}
            onClick={() => card.path && navigate(card.path)}
            onKeyDown={(e) => {
              if (card.path && (e.key === "Enter" || e.key === " ")) {
                navigate(card.path);
              }
            }}
            className="border-1 border-amber-300 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
            style={{ outline: "none" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base text-amber-800 font-semibold">
                {card.title}
              </h3>
              {card.icon}
            </div>
            <p className="text-xl font-bold text-amber-800">{card.value}</p>
            <p className="text-amber-800 text-sm">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Contract Utilization */}
        <Card
          title={
            <div>
              <div className="text-xl text-amber-800 font-semibold">
                Contract Utilization
              </div>
              <div className="text-xs text-amber-700">
                Reserved vs Consumed Quantity
              </div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.contractData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" />
              <XAxis dataKey="name" stroke="#92400e" />
              <YAxis stroke="#92400e" />
              <Tooltip />
              <Legend wrapperStyle={{ color: "#92400e" }} />
              <Bar
                dataKey="reserved"
                fill="#fcd34d"
                name="Reserved"
                barSize={30}
              />
              <Bar
                dataKey="consumed"
                fill="#d97706"
                name="Consumed"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Trends */}
        <Card
          title={
            <div>
              <div className="text-xl text-amber-800 font-semibold">
                Monthly Trends
              </div>
              <div className="text-xs text-amber-700">Purchase vs Sales</div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dashboardData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" />
              <XAxis dataKey="month" stroke="#92400e" />
              <YAxis stroke="#92400e" />
              <Tooltip />
              <Legend wrapperStyle={{ color: "#92400e" }} />
              <Area
                type="monotone"
                dataKey="purchase"
                stroke="#fcd34d"
                fill="#fcd34d"
                name="Purchase"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#d97706"
                fill="#d97706"
                name="Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Pending Indents & Transit */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Pending Indents */}
        <Card
          className="p-1"
          title={
            <div>
              <div className="text-xl text-amber-800 font-semibold">
                Pending Indents & Aging
              </div>
              <div className="text-xs text-amber-800">
                Purchase indents requiring attention
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            {dashboardData.pendingIndents.map((indent, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-semibold text-amber-800">
                  {indent.id}
                  <br />
                  <span className="text-amber-800">{indent.item}</span>
                </span>
                <span
                  className={`${
                    indent.urgent
                      ? "bg-red-200 text-red-600"
                      : "bg-gray-200 text-gray-700"
                  } text-sm px-3 py-1 rounded-md`}
                >
                  {indent.days}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Transit Overview */}
        <Card
          className="p-1"
          title={
            <div>
              <div className="text-xl text-amber-800 font-semibold">
                Transit Overview
              </div>
              <div className="text-xs text-amber-800">
                Current vehicle status
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            {dashboardData.transitOverview.map((t, i) => {
              const color = tailwindColors[t.color];
              return (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-start gap-2">
                    <GrDeliver className="w-5 h-5 text-amber-800 mt-1" />
                    <span className="font-semibold text-amber-800">
                      {t.vehicle}
                      <br />
                      <span className="text-amber-800">{t.route}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`${color.bg} ${color.text} text-sm px-3 py-1 rounded-md block`}
                    >
                      {t.status}
                    </span>
                    <span className="text-xs text-amber-800">{t.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Returns Summary */}
      <Card
        title={
          <div>
            <div className="text-lg text-amber-800 font-semibold">
              Returns Summary
            </div>
            <div className="text-xs text-amber-800">
              Recent return activities
            </div>
          </div>
        }
        className="mt-6 "
      >
        <div className="grid grid-cols-3 gap-3">
          {dashboardData.returnsSummary.map((r, i) => {
            const color = tailwindColors[r.color];
            return (
              <div
                key={i}
                className={`${color.bg} p-3 rounded-lg flex flex-col items-start`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {r.icon}
                  <h3 className={`${color.text} font-semibold text-xl`}>
                    {r.title}
                  </h3>
                </div>
                <p className={`text-lg font-bold ${color.text}`}>{r.value}</p>
                <p className={`text-xs font-semibold ${color.subtitle}`}>
                  {r.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

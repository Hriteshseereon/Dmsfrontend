// PurchaseDashboard.jsx
import React from "react";
import { Card, Row, Col, Tag, Space } from "antd";
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// JSON Data
const dashboardJSON = {
  topCards: [
    { title: "Asset Category", value: 5, icon: "FileTextOutlined" },
    { title: "Total Asset", value: 95, icon: "DollarOutlined" },
    { title: "Asset On Maintenance", value: 10, icon: "ShoppingCartOutlined" },
    { title: "Asset Depriciation", value: 7, icon: "ReloadOutlined" },
  ],
  contractsData: [
    { name: "Jan", value: 12 },
    { name: "Feb", value: 20 },
    { name: "Mar", value: 25 },
    { name: "Apr", value: 22 },
    { name: "May", value: 40 },
    { name: "Jun", value: 30 },
    { name: "Jul", value: 24 },
  ],
  ordersData: [
    { name: "Jan", orders: 20 },
    { name: "Feb", orders: 30 },
    { name: "Mar", orders: 32 },
    { name: "Apr", orders: 35 },
    { name: "May", orders: 45 },
    { name: "Jun", orders: 38 },
    { name: "Jul", orders: 42 },
  ],
  returnData: [
    { name: "Damaged", value: 3 },
    { name: "Expired", value: 2 },
    { name: "Wrong Item", value: 1 },
    { name: "Other Reasons", value: 4 },
  ],
  quickActions: [
    { title: "Purchase Order 567", subtitle: "Due Today", tag: "Pending" },
    {
      title: "Shipment #789",
      subtitle: "Expected: 03-Oct-2025",
      tag: "Nearby",
    },
    {
      title: "Invoice #234",
      subtitle: "Due in 2 days",
      tag: "Payment Pending",
    },
    {
      title: "Delivery #321",
      subtitle: "Location: Nearby Warehouse",
      tag: "Nearby",
    },
  ],
};

// Mapping icon string to actual components
const iconMap = {
  FileTextOutlined: <FileTextOutlined className="text-amber-700 text-2xl" />,
  DollarOutlined: <DollarOutlined className="text-amber-700 text-2xl" />,
  ShoppingCartOutlined: (
    <ShoppingCartOutlined className="text-amber-700 text-2xl" />
  ),
  ReloadOutlined: <ReloadOutlined className="text-amber-700 text-2xl" />,
};

// Amber palette
const COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d"];

export default function AssetDashboard() {
  const navigate = useNavigate();
  const cardRoutes = {
    "Asset Category": "/ams/assetcategory",
    "Total Asset": "/ams/assetadd",
    "Asset On Maintenance": "/ams/assetmaintenance",
    "Asset Depriciation": "/ams/assetdepreciation",
  };
  return (
    <div className="p-2">
      {/* Top Cards */}
      <Row gutter={16} className="mb-2 flex flex-wrap">
        {dashboardJSON.topCards.map((card, index) => (
          <Col key={index} flex="1" className="mb-4">
            <Card
              hoverable
              onClick={() => navigate(cardRoutes[card.title])}
              className="p-1! h-full! border-1! border-amber-500! bg-amber-50! cursor-pointer!"
            >
              <div className="flex items-center text-amber-800 mb-3 gap-3">
                {iconMap[card.icon]}
                <p className="text-amber-800 text-md m-0">{card.title}</p>
              </div>
              <h2 className="text-3xl text-amber-700 font-bold m-0">
                {card.value}
              </h2>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">Asset Allocation</span>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardJSON.contractsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" />
                <XAxis dataKey="name" stroke="#92400e" />
                <YAxis stroke="#92400e" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#d97706"
                  fill="#fcd34d"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">Asset Disposal</span>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dashboardJSON.ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" />
                <XAxis dataKey="name" stroke="#92400e" />
                <YAxis stroke="#92400e" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#d97706"
                  fill="#fcd34d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* PieChart + Quick Actions */}
      {/* <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">
                Purchase Returns Breakdown
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dashboardJSON.returnData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {dashboardJSON.returnData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer> */}

      {/* Legend */}
      {/* <div className="flex space-x-12 mt-2 flex-nowrap overflow-auto">
              {dashboardJSON.returnData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-amber-800 text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">Quick Action</span>
            }
          >
            <Space direction="vertical" className="w-full">
              {dashboardJSON.quickActions.map((action, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-2 px-3 ${
                    index !== dashboardJSON.quickActions.length - 1
                      ? "border-b border-amber-200"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-amber-700 text-sm m-0">
                      {action.title}
                    </p>
                    <p className="text-xs text-red-500 m-0">
                      {action.subtitle}
                    </p>
                  </div>
                  <Tag color="red">{action.tag}</Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
}

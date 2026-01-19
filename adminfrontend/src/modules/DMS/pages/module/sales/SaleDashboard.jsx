// SaleDashboard.jsx
import React from "react";
import { Card, Row, Col, Tag, Space } from "antd";
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  DollarOutlined,
} from "@ant-design/icons";
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

import { useNavigate } from "react-router-dom";
// 🔹 JSON Data
const saleDashboardJSON = {
  topCards: [
    {
      title: "Total Sale Contracts",
      value: 150,
      icon: <FileTextOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/sales/souda",
    },
    {
      title: "Total Sale Invoice",
      value: 95,
      icon: <DollarOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/sales/orders",
    },
    {
      title: "Pending Orders",
      value: 20,
      icon: <ShoppingCartOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/sales/orders",
    },
    {
      title: "Sale Returns",
      value: 7,
      icon: <ReloadOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/sales/dispute",
    },
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
  COLORS: ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d"],
  quickActions: [
    {
      title: "Sale Order #567",
      subtitle: "Due Today",
      tag: "Pending",
      tagColor: "red",
    },
    {
      title: "Shipment #789",
      subtitle: "Expected: 03-Oct-2025",
      tag: "Nearby",
      tagColor: "red",
    },
    {
      title: "Invoice #234",
      subtitle: "Due in 2 days",
      tag: "Payment Pending",
      tagColor: "red",
    },
    {
      title: "Delivery #321",
      subtitle: "Location: Nearby Warehouse",
      tag: "Nearby",
      tagColor: "red",
    },
  ],
};

export default function SaleDashboard() {
  const navigate = useNavigate();
  const {
    topCards,
    contractsData,
    ordersData,
    returnData,
    COLORS,
    quickActions,
  } = saleDashboardJSON;

  return (
    <div className="p-2">
      {/* Top Cards */}
      <Row gutter={16} className="mb-2 flex flex-wrap">
        {topCards.map((card, index) => (
          <Col key={index} flex="1" className="mb-4">
            <Card className="p-1! h-full! border-1! border-amber-500! bg-amber-50! hover:shadow-lg! cursor-pointer!" onClick={() => navigate(card.path)}>
              <div className="flex items-center text-amber-800 mb-3 gap-3">
                {card.icon}
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
              <span className="text-amber-700 font-bold">
                Sale Contracts Evolution
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={contractsData}>
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
              <span className="text-amber-700 font-bold">
                Sale Invoices Evolution
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={ordersData}>
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
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">
                Sale Returns Breakdown
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={returnData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {returnData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex space-x-12 mt-2 flex-nowrap overflow-auto">
              {returnData.map((entry, index) => (
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
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center py-2 px-3 ${
                    idx !== quickActions.length - 1
                      ? "border-b border-amber-200"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm m-0">{action.title}</p>
                    <p className="text-xs text-red-500 m-0">
                      {action.subtitle}
                    </p>
                  </div>
                  <Tag color={action.tagColor}>{action.tag}</Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

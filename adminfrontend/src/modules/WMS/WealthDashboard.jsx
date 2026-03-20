// WealthDashboard.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, message } from "antd";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardData } from "../../api/wealth";

// Icon mapping based on API titles
const iconMap = {
  Stock: <FileTextOutlined className="text-amber-700 text-2xl" />,
  "Mutual Funds": <DollarOutlined className="text-amber-700 text-2xl" />,
  Property: <ShoppingCartOutlined className="text-amber-700 text-2xl" />,
  Bank: <ReloadOutlined className="text-amber-700 text-2xl" />,
};

export default function WealthDashboard() {
  const [data, setData] = useState(null);

  // Fetch API
  const fetchDashboard = async () => {
    try {
      const res = await dashboardData();
      setData(res);
    } catch (err) {
      console.error(err);
      message.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Top cards from API
  const topCards =
    data?.cards?.map((card) => ({
      title: card.title,
      value: card.value,
      icon: iconMap[card.title],
    })) || [];

  // Stock chart
  const stockData =
    data?.charts?.stock?.map((item) => ({
      name: item.month,
      value: item.total,
    })) || [];

  // ETF chart
  const etfData =
    data?.charts?.etf?.map((item) => ({
      name: item.month,
      orders: item.total,
    })) || [];

  return (
    <div className="p-2">
      {/* Top Cards */}
      <Row gutter={16} className="mb-2 flex flex-wrap">
        {topCards.map((card, index) => (
          <Col key={index} flex="1" className="mb-4">
            <Card className="p-1! h-full! border-1! border-amber-500! bg-amber-50!">
              <div className="flex items-center text-amber-800 mb-3 gap-3">
                {card.icon}
                <p className="text-md m-0">{card.title}</p>
              </div>
              <h2 className="text-3xl text-amber-700 font-bold m-0">
                {card.value}
              </h2>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={16} className="mb-6">
        {/* Stock */}
        <Col span={12}>
          <Card title={<span className="text-amber-700 font-bold">Stock</span>}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stockData}>
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

        {/* ETF */}
        <Col span={12}>
          <Card title={<span className="text-amber-700 font-bold">ETF</span>}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={etfData}>
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
    </div>
  );
}

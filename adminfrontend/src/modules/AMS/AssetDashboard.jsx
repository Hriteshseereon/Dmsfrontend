// PurchaseDashboard.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, message } from "antd";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashoboardScreenlog } from "../../api/assets";

// Icon mapping
const iconMap = {
  "Asset Category": <FileTextOutlined className="text-amber-700 text-2xl" />,
  "Total Asset": <DollarOutlined className="text-amber-700 text-2xl" />,
  "Asset On Maintenance": (
    <ShoppingCartOutlined className="text-amber-700 text-2xl" />
  ),
  "Asset Depreciation": <ReloadOutlined className="text-amber-700 text-2xl" />,
};

export default function AssetDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  // Routes mapping
  const cardRoutes = {
    "Asset Category": "/ams/assetcategory",
    "Total Asset": "/ams/assetadd",
    "Asset On Maintenance": "/ams/assetmaintenance",
    "Asset Depreciation": "/ams/assetdepreciation",
  };

  // Fetch API
  const handleDashboardDetails = async () => {
    try {
      const res = await dashoboardScreenlog();
      setDashboardData(res);
    } catch (err) {
      console.error(err);
      message.error("Failed to load the dashboard screen data");
    }
  };

  useEffect(() => {
    handleDashboardDetails();
  }, []);

  // Top Cards Data
  const topCards =
    dashboardData?.cards?.map((card) => ({
      title: card.title,
      value: card.value,
      icon: iconMap[card.title],
    })) || [];

  // Allocation Chart Data
  const allocationData =
    dashboardData?.charts?.asset_allocation?.map((item) => ({
      name: item.month,
      value: item.total,
    })) || [];

  // Disposal Chart Data
  const disposalData =
    dashboardData?.charts?.asset_disposal?.map((item) => ({
      name: item.month,
      orders: item.total,
    })) || [];

  return (
    <div className="p-2">
      {/* Top Cards */}
      <Row gutter={16} className="mb-2 flex flex-wrap">
        {topCards.map((card, index) => (
          <Col key={index} flex="1" className="mb-4">
            <Card
              hoverable
              onClick={() => navigate(cardRoutes[card.title])}
              className="p-1! h-full! border-1! border-amber-500! bg-amber-50! cursor-pointer!"
            >
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
        {/* Allocation */}
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">Asset Allocation</span>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={allocationData}>
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

        {/* Disposal */}
        <Col span={12}>
          <Card
            title={
              <span className="text-amber-700 font-bold">Asset Disposal</span>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={disposalData}>
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

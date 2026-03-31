import React, { useEffect, useState } from "react";
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
import { getDashboardData } from "../../../../../api/purchase";

// Amber palette
const COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d"];

export default function PurchaseDashboard() {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setApiData(data);
      } catch (err) {
        console.error("Dashboard API error", err);
      }
    };

    fetchData();
  }, []);

  if (!apiData) return <div>Loading...</div>;

  const statusColors = {
  Pending: "gold",
  "Pending Approval": "orange",
  Dispatched: "blue",
  Rejected: "red",
  Approved: "green",
  "Partially Delivered": "cyan",
  "Out for Delivery": "geekblue",
  "In-Transit": "purple",
  Delivered: "success",
};
  // ===== TOP CARDS =====
  const topCards = [
    {
      title: "Total Contracts",
      value: apiData?.cards?.total_contracts ?? 0,
      icon: <FileTextOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/purchase/souda",
    },
       {
      title: "Total Orders",
      value: apiData?.cards?.total_orders ?? 0,
      icon: <ShoppingCartOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/purchase/indent",
    },
    {
      title: "Total Invoice",
      value: apiData?.cards?.total_invoices ?? 0,
      icon: <DollarOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/purchase/invoice",
    },
 
    {
      title: "Total Returns",
      value: apiData?.cards?.total_returns ?? 0,
      icon: <ReloadOutlined className="text-amber-700 text-2xl" />,
      path: "/dms/purchase/return",
    },
  ];

  // ===== CHART DATA =====
  const contractsData =
    apiData?.graphs?.contracts?.map((item) => ({
      name: item.month,
      value: item.count,
    })) || [];

  const ordersData =
    apiData?.graphs?.orders?.map((item) => ({
      name: item.month,
      orders: item.count,
    })) || [];

  // ===== PIE DATA =====
  const returnData = Object.entries(apiData?.pie_chart || {}).map(
    ([key, value]) => ({
      name: key,
      value: value,
    })
  );

  // ===== QUICK ACTIONS =====
  const quickActions =
    apiData?.quick_actions?.loading_advice?.map((item) => ({
      title: item.status,
      subtitle: `${item.count} items`,
      tag: item.status,
    })) || [];

  return (
    <div className="p-2">
      {/* Top Cards */}
      <Row gutter={16} className="mb-2 flex flex-wrap">
        {topCards.map((card, index) => (
          <Col key={index} flex="1" className="mb-4">
            <Card
              className="p-1! h-full! border-1! border-amber-500! bg-amber-50! hover:shadow-md! cursor-pointer!"
              onClick={() => card.path && navigate(card.path)}
            >
              <div className="flex items-center text-amber-800 mb-3 gap-3">
                {card.icon}
                <p className="text-amber-800 text-md m-0">
                  {card.title}
                </p>
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
                Purchase Contracts Evolution
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
                Purchase Orders Evolution
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
        <Col span={12} className="flex">
          <Card className="h-full flex flex-col"
            title={
              <span className="text-amber-700 font-bold">
                Purchase Returns Breakdown
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
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-amber-800 text-sm">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
<Col span={12} className="flex">
  <Card
    className="h-full flex flex-col"
    title={
      <span className="text-amber-700 font-bold">
     Order Status Overview
      </span>
    }
  >
    <div className="flex-1 overflow-y-auto max-h-[260px]">
      <Space direction="vertical" className="w-full">
        {quickActions.map((action, index) => (
          <div
            key={index}
            className={`flex justify-between items-center py-2 px-3 ${
              index !== quickActions.length - 1
                ? "border-b border-amber-200"
                : ""
            }`}
          >
            <div >
                          <p className="font-medium text-amber-700 text-sm m-0">
              {action.subtitle}
                            </p>
            </div>
             <p className="font-medium text-amber-700 text-sm m-0">
               <Tag color={statusColors[action.tag] || "default"}>
  {action.tag}
</Tag>
              </p>
          
          </div>
        ))}
      </Space>
    </div>
  </Card>
</Col>
      </Row>
    </div>
  );
}
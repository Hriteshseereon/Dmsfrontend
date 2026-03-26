import React, { useEffect, useState } from "react";
import { Card, Button } from "antd";
import {
  DownloadOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { getDashboardData } from "../../../../../../api/reports";
import { FaBoxOpen, FaClock, FaTruck } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ReportsOverview = () => {
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

  const amberButton =
    "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 focus:bg-amber-600 text-white";

  if (!apiData) return <div>Loading...</div>;

  // ===== SAFE DATA MAPPING =====
  const transitData =
    apiData?.graphs?.monthly_purchase_vs_sales_contract_percent?.map(
      (item) => ({
        month: item.month,
        Purchase: item.purchase_percent,
        Sales: item.sales_percent,
      })
    ) || [];

  const pendingAging =
    apiData?.graphs?.monthly_purchase_vs_sales_order_percent?.map(
      (item) => ({
        name: item.month,
        Purchase: item.purchase_percent,
        Sales: item.sales_percent,
      })
    ) || [];

  const soudaFulfillment = [
    {
      name: "Completed",
      value:
        apiData?.graphs?.sales_order_status_percent?.delivered_percent ?? 0,
    },
    {
      name: "Pending",
      value:
        apiData?.graphs?.sales_order_status_percent?.pending_percent ?? 0,
    },
  ];

  const returnsAnalysis =
    apiData?.text_data?.top_5_return_reasons?.map((item) => ({
      name: item.reason,
      cases: item.count,
      amount: 0,
    })) || [];

  const cards = apiData?.cards || {};

  return (
    <div className="p-2 ">
      {/* Top KPI cards */}
      <div className="mb-6 grid grid-cols-4 gap-6">
        <div className="border-amber-400 border-1 rounded-lg p-3 shadow-sm ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Purchase Contract Growth
            </h3>
            <FaBoxOpen className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">
            {cards.purchase_contract_growth_percent ?? 0}%
          </p>
          <p className="text-sm text-amber-600">
            <ArrowUpOutlined /> Growth
          </p>
        </div>

        <div className="border-amber-400 border-1 rounded-lg p-3 shadow-sm ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Purchase Order Growth
            </h3>
            <FaTruck className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">
            {cards.purchase_order_growth_percent ?? 0}%
          </p>
          <p className="text-sm text-amber-600">
            <ArrowDownOutlined /> Trend
          </p>
        </div>

        <div className=" border-amber-400 border-1 rounded-lg p-3 shadow-sm ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Sales Contract Growth
            </h3>
            <FaClock className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">
            {cards.sales_contract_growth_percent ?? 0}%
          </p>
          <p className="text-sm text-amber-600">
            <ArrowUpOutlined /> Growth
          </p>
        </div>

        <div className=" border-amber-400 border-1 rounded-lg p-3 shadow-sm  ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Sales Order Growth
            </h3>
            <WarningOutlined className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">
            {cards.sales_order_growth_percent ?? 0}%
          </p>
          <p className="text-sm text-amber-600">
            <ArrowDownOutlined /> Trend
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          {/* Pending Aging Chart */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Purchase vs Sales
                <div className="text-xs text-amber-500">
                  Month-wise comparison
                </div>
              </div>
            }
            extra={
              <Button
                className={amberButton}
                shape="circle"
                icon={<DownloadOutlined />}
              />
            }
            className="rounded-xl"
          >
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={pendingAging}>
                  <XAxis dataKey="name" stroke="#c05621" />
                  <YAxis stroke="#c05621" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Purchase" fill="#fcd34d" barSize={30} />
                  <Bar dataKey="Sales" fill="#d97706" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Returns Analysis */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Returns Analysis
                <div className="text-xs text-amber-500">
                  Reason-wise Return Trends
                </div>
              </div>
            }
            extra={
              <Button
                className={amberButton}
                shape="circle"
                icon={<DownloadOutlined />}
              />
            }
            className="rounded-xl"
          >
            <div className="space-y-3">
              {returnsAnalysis.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between bg-amber-50 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <div>
                      <div className="font-medium text-amber-700">{r.name}</div>
                      <div className="text-xs text-amber-500">
                        {r.cases} cases
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-amber-700 font-semibold">
                    ₹{r.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pie */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Order Status Overview
                 <div className="text-xs text-amber-500">
                  Month-wise comparison
                </div>
              </div>
            }
            className="rounded-xl"
          >
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={soudaFulfillment} dataKey="value" label>
                    <Cell fill="#fcd34d" />
                    <Cell fill="#d97706" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-4">
              <span className="text-amber-700">
                Completed ({soudaFulfillment[0].value}%)
              </span>
              <span className="text-amber-700">
                Pending ({soudaFulfillment[1].value}%)
              </span>
            </div>
          </Card>

          {/* Transit */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Purchase vs Sales (Contracts %)
              </div>
            }
            className="rounded-xl"
          >
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={transitData}>
                  <XAxis dataKey="month" stroke="#c05621" />
                  <YAxis stroke="#c05621" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Purchase" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="Sales" stroke="#d97706" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsOverview;
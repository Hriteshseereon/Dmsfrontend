// Dashboard.jsx
import React from "react";
import { Card, Button } from "antd";
import {
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
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

// ===== JSON Data (all in one place) =====
const dashboardData = {
  contractUtilization: [
    { name: "Mustard Oil", Utilized: 85, Pending: 15 },
    { name: "Sunflower Oil", Utilized: 93, Pending: 7 },
    { name: "Coconut Oil", Utilized: 75, Pending: 25 },
    { name: "Groundnut Oil", Utilized: 88, Pending: 12 },
  ],
  pendingAging: [
    { name: "0-7 days", Purchase: 5, Sales: 3 },
    { name: "8-15 days", Purchase: 3, Sales: 2 },
    { name: "16-30 days", Purchase: 7, Sales: 4 },
    { name: "30+ days", Purchase: 2, Sales: 1 },
  ],
  transitData: [
    { month: "Jan", Purchase: 45, Sales: 38 },
    { month: "Feb", Purchase: 55, Sales: 50 },
    { month: "Mar", Purchase: 48, Sales: 46 },
    { month: "Apr", Purchase: 62, Sales: 55 },
    { month: "May", Purchase: 54, Sales: 49 },
    { month: "Jun", Purchase: 70, Sales: 60 },
  ],
  depotUtilization: [
    { name: "Depot A", Direct: 65, Depot: 35 },
    { name: "Depot B", Direct: 45, Depot: 55 },
    { name: "Depot C", Direct: 30, Depot: 70 },
    { name: "Depot D", Direct: 40, Depot: 60 },
  ],
  returnsAnalysis: [
    { name: "Quality Issues", cases: 12, amount: 45000 },
    { name: "Wrong Delivery", cases: 8, amount: 28000 },
    { name: "Packaging Problem", cases: 5, amount: 15000 },
    { name: "Customer Complaint", cases: 3, amount: 8000 },
  ],
  performance: [
    { label: "Total Contracts", value: 45 },
    { label: "Active Transits", value: 12 },
    { label: "Pending Returns", value: 9 },
  ],
  growthMetrics: [
    { label: "Monthly Growth", value: "+12.5%" },
    { label: "New Customers", value: 8 },
    { label: "Efficiency Gain", value: "+5.8%" },
  ],
  alerts: [
    { label: "Overdue Items", value: 3 },
    { label: "Expiring Contracts", value: 2 },
    { label: "Quality Alerts", value: 1 },
  ],
  soudaFulfillment: [
    { name: "Completed", value: 75 },
    { name: "Pending", value: 25 },
  ],
};

const ReportsOverview = () => {
  const amberButton =
    "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 focus:bg-amber-600 text-white";

  return (
    <div className="p-2 ">
     

      {/* Top KPI cards */}
      <div className="mb-6 grid grid-cols-4 gap-6">
        <div className="border-amber-400 border-1 rounded-lg p-3 shadow-sm ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Contract Utilization
            </h3>
            <FaBoxOpen className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">85.2%</p>
          <p className="text-sm text-amber-600">
            <ArrowUpOutlined /> +2.5%
          </p>
        </div>

        <div className="border-amber-400 border-1 rounded-lg p-3 shadow-sm ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Avg Transit Time
            </h3>
            <FaTruck className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">2.4 days</p>
          <p className="text-sm text-amber-600">
            <ArrowDownOutlined /> -0.3 days
          </p>
        </div>

        <div className=" border-amber-400 border-1 rounded-lg p-3 shadow-sm ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Pending Aging
            </h3>
            <FaClock className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">17 items</p>
          <p className="text-sm text-amber-600">
            <ArrowUpOutlined /> +3 items
          </p>
        </div>

        <div className=" border-amber-400 border-1 rounded-lg p-3 shadow-sm  ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-700">
              Return Rate
            </h3>
            <WarningOutlined className="text-amber-600 text-base" />
          </div>
          <p className="text-xl font-bold text-amber-800">2.1%</p>
          <p className="text-sm text-amber-600">
            <ArrowDownOutlined /> -0.5%
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          {/* Contract Utilization Chart */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Contract Utilization
                <div className="text-xs text-amber-500">
                  Utilized vs Pending by Product
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
                <BarChart data={dashboardData.contractUtilization}>
                  <XAxis dataKey="name" stroke="#c05621" />
                  <YAxis stroke="#c05621" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Utilized" fill="#fcd34d" barSize={30} />
                  <Bar dataKey="Pending" fill="#d97706" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pending Aging Chart */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Pending Indents & Invoices Aging
                <div className="text-xs text-amber-500">
                  Age-wise Distribution
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
                <BarChart data={dashboardData.pendingAging}>
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
              {dashboardData.returnsAnalysis.map((r) => (
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

        {/* Right Column Charts */}
        <div className="space-y-6">
          {/* Souda Fulfillment Pie */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Souda Fulfillment
                <div className="text-xs text-amber-500">
                  Completed vs Pending Contracts
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
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dashboardData.soudaFulfillment}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    label
                  >
                    <Cell fill="#fcd34d" />
                    <Cell fill="#d97706" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #f59e0b",
                      color: "#b45309",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex justify-center items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 inline-block rounded-full" />
                <span className="text-amber-700 text-sm">Completed (75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-700 inline-block rounded-full" />
                <span className="text-amber-700 text-sm">Pending (25%)</span>
              </div>
            </div>
          </Card>

          {/* Transit Dashboard */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Transit Dashboard
                <div className="text-xs text-amber-500">
                  Monthly Transit Volume
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
                <LineChart data={dashboardData.transitData}>
                  <XAxis dataKey="month" stroke="#c05621" />
                  <YAxis stroke="#c05621" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Purchase"
                    stroke="#f59e0b"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Sales"
                    stroke="#d97706"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Depot Utilization */}
          <Card
            title={
              <div className="font-semibold text-amber-700">
                Depot Utilization
                <div className="text-xs text-amber-500">
                  Direct vs Depot Routed Deliveries
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
                <BarChart data={dashboardData.depotUtilization}>
                  <XAxis dataKey="name" stroke="#c05621" />
                  <YAxis stroke="#c05621" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Direct" fill="#fcd34d" barSize={30} />
                  <Bar dataKey="Depot" fill="#d97706" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Summary */}
        <Card
          className="rounded-xl bg-amber-50 border border-amber-400"
          title={
            <div className="font-semibold text-amber-700">
              Performance Summary
            </div>
          }
        >
          <ul className="space-y-3">
            {dashboardData.performance.map((p) => (
              <li key={p.label} className="flex items-center justify-between">
                <div className="text-sm text-amber-700">{p.label}</div>
                <div className="border border-amber-400 px-3 py-1 rounded-xl text-amber-700">
                  {p.value}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Growth Metrics */}
        <Card
          className="rounded-xl bg-amber-50 border border-amber-400"
          title={
            <div className="font-semibold text-amber-700">Growth Metrics</div>
          }
        >
          <ul className="space-y-3">
            {dashboardData.growthMetrics.map((g) => (
              <li key={g.label} className="flex items-center justify-between">
                <div className="text-sm text-amber-700">{g.label}</div>
                <div className="border border-amber-400 px-3 py-1 rounded-xl text-amber-700">
                  {g.value}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Alerts */}
        <Card
          className="rounded-xl bg-amber-50 border border-amber-400"
          title={
            <div className="font-semibold text-amber-700">Alerts & Actions</div>
          }
        >
          <ul className="space-y-3">
            {dashboardData.alerts.map((a) => (
              <li key={a.label} className="flex items-center justify-between">
                <div className="text-sm text-amber-700">{a.label}</div>
                <div className="border border-amber-400 px-3 py-1 rounded-xl text-amber-700">
                  {a.value}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ReportsOverview;

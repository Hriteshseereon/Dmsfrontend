import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag,Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK SALE CONTRACT JSON ---------------- */
const saleContractJSON = [
  {
    key: 1,
    slno: 1,
    customerName: "Reliance Retail",
    companyName: "Kalinga Oils Pvt Ltd",
    contractDate: "2024-09-05",
    startDate: "2024-09-10",
    endDate: "2025-03-31",
    totalAmount:600,
    status: "Approved",

   },
  {
    key: 2,
    slno: 2,
    customerName: "Big Bazaar",
    companyName: "Odisha Edibles",
    contractDate: "2024-09-22",
    startDate: "2024-10-01",
    endDate: "2025-02-28",
   totalAmount:300,
    status: "Pending",
  },
  {
    key: 3,
    slno: 3,
    customerName: "Metro Cash & Carry",
    companyName: "Kalinga Oils Pvt Ltd",
    contractDate: "2024-10-08",
    startDate: "2024-10-15",
    endDate: "2025-06-30",
    totalAmount:700,
    status: "Approved",
  },
  {
    key: 4,
    slno: 4,
    customerName: "DMart",
    companyName: "Odisha Edibles",
    contractDate: "2024-11-12",
    startDate: "2024-11-15",
    endDate: "2025-05-31",
    totalAmount:250,
    status: "Completed",
  },
];

/* ---------------- COMPONENT ---------------- */
const SaleContract = () => {
 const [dateRange, setDateRange] = useState(null);
   /* ---------------- MONTH FILTER LOGIC ---------------- */
 const filteredData = useMemo(() => {
   if (!dateRange) return  saleContractJSON;
 
   const [start, end] = dateRange;

   return saleContractJSON.filter((rec) => {
     const contractDate = dayjs(rec.contractDate);
     return contractDate.isBetween(start, end, "day", "[]");
   });
 }, [dateRange]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Sl No</span>,
   
      dataIndex: "slno",
      width: 70,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Customer Name</span>,
      dataIndex: "customerName",
      width: 200,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
   
    {
       title: <span className="text-amber-700 font-semibold">Contract Date</span>,
      dataIndex: "contractDate",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
        title: <span className="text-amber-700 font-semibold"> Contract Start Date</span>,
      dataIndex: "startDate",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
        title: <span className="text-amber-700 font-semibold">Contract End Date</span>,
      dataIndex: "endDate",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount", 
      width: 120,
      render: (t) => <span className="text-amber-800">₹ {t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",  
      width: 100,
      render: (status) => {
        let color = "gray";
        if (status === "Approved") color = "green";
        else if (status === "Pending") color = "orange";
        else if (status === "Completed") color = "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
   
  ];

  return (
    <div>
      {/* ---------------- FILTER BAR ---------------- */}
        <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
    
      {/* Header Row */}
      <Row justify="space-between" align="middle" className="mb-3">
    
        {/* Left: Title */}
        <Col>
          <h2 className="text-lg font-semibold text-amber-700">
            Sale Contracts
          </h2>
          <p className="text-amber-600 text-sm">
            Month-wise sale contract details
          </p>
        </Col>
    
        {/* Right: Filters */}
        <Col>
          <Row gutter={8} align="middle">
            <Col>
              <RangePicker
  onChange={setDateRange}
  className="border-amber-400! text-amber-700!"
  style={{ width: 260 }}
  placeholder={["From", "To"]}
/>
            </Col>
    
            <Col>
              <Button
                icon={<FilterOutlined />}
                className="border-amber-400! text-amber-700!"
                onClick={() => setDateRange(null)}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Col>
    
      </Row>
    
      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 700 }}
      />
    </div>
    </div>
  );
};

export default SaleContract;

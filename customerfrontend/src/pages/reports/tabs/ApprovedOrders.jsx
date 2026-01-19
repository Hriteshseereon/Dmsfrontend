import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row,Button, Col, Card, Tag } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

/* ---------------- MOCK APPROVED ORDERS JSON ---------------- */
const ApprovedOrdersJSON = [
  {
    key: 1,
    slno: 1,
    orderNo: "ORD-2024-101",
    plantName: "Customer A",
    orderDate: "2024-08-10",
    approvedDate: "2024-09-05",
    totalAmount: 25000,
    approvalStatus: "APPROVED",
  },
  {
    key: 2,
    slno: 2,
    orderNo: "ORD-2024-118",
    plantName: "Customer B",
    orderDate: "2024-09-01",
    approvedDate: "2024-09-18",
    totalAmount: 12000,
    approvalStatus: "PENDING",
  },
  {
    key: 3,
    slno: 3,
    orderNo: "ORD-2024-125",
    plantName: "Customer C",
    orderDate: "2024-09-03",
    approvedDate: "2024-10-02",
    totalAmount: 18000,
    approvalStatus: "APPROVED",
  },
];

/* ---------------- COMPONENT ---------------- */
const ApprovedOrders = () => {
  const [dateRange, setDateRange] = useState(null);
     /* ---------------- MONTH FILTER LOGIC ---------------- */
  const filteredData = useMemo(() => {
   return ApprovedOrdersJSON.filter((rec) => {
     const isApproved = rec.approvalStatus === "APPROVED";

     if (!dateRange) return isApproved;

     const [start, end] = dateRange;
     const approvedDate = dayjs(rec.approvedDate);

     return isApproved && approvedDate.isBetween(start, end, "day", "[]");
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
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "orderNo",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      width: 150,
      render: (d) => <span className="text-amber-800">{d}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Order Date</span>,
      dataIndex: "orderDate",
      width: 120,
      render: (d) => (
        <span className="text-amber-800">
          {dayjs(d).format("DD-MM-YYYY")}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Approved Date</span>,
      dataIndex: "approvedDate",
      width: 130,
      render: (d) => (
        <span className="text-amber-800">
          {dayjs(d).format("DD-MM-YYYY")}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount",
      width: 120,
      render: (t) => <span className="text-amber-800">₹ {t}</span>,
    },
   {
         title: <span className="text-amber-700 font-semibold">Status</span>,
         dataIndex: "approvalStatus",
         width: 120,
          render: (t) =>  <Tag color="green">{t}</Tag>,
       },
  ];

  return (
     <div>
       {/* ---------------- FILTER BAR ---------------- */}
          <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
      
        {/* Header Row */}
        <Row justify="space-between" align="middle" className="mb-1">
      
          {/* Left: Title */}
          <Col>
            <h2 className="text-lg font-semibold text-amber-700">
                Approved Orders Report
            </h2>
            <p className="text-amber-600 text-sm">
               Detailed overview of all approved orders
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

export default ApprovedOrders;

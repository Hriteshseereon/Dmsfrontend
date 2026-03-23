import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Button } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK SALE RETURN JSON ---------------- */
const saleReturnJSON = [
  {
    key: 1,
    slno: 1,
    odno:5,
    customerName: "Reliance Retail",
    plantName: "Kalinga Oils Pvt Ltd",
    returnAmount:50,
    returnReason: "Damaged Goods",
    returnDate: "2024-09-12",
    status: "Approved",
  },
  {
    key: 2,
    slno: 2,
     odno:5,
    customerName: "Big Bazaar",
    plantName: "Odisha Edibles",
    returnAmount: 25,
    returnReason: "Damaged Goods",
    returnDate: "2024-09-26",
    status: "Pending",
  },
  {
    key: 3,
    slno: 3,
     odno:5,
    customerName: "Metro Cash & Carry",
    plantName: "Kalinga Oils Pvt Ltd",
    returnAmount: 50,
    returnReason: "Damaged Goods",
    returnDate: "2024-10-08",
    status: "Approved",
  },
  {
    key: 4,
    slno: 4,
     odno:5,
    customerName: "DMart",
    plantName: "Odisha Edibles",
    returnAmount: 20,
    returnReason: "Damaged Goods",
    returnDate: "2024-11-15",
    status: "Rejected",
  },
];

/* ---------------- COMPONENT ---------------- */
const SaleReturn = () => {
   const [dateRange, setDateRange] = useState(null);
       /* ---------------- MONTH FILTER LOGIC ---------------- */
     const filteredData = useMemo(() => {
       if (!dateRange) return  saleReturnJSON;
     
       const [start, end] = dateRange;
   
       return saleReturnJSON.filter((rec) => {
         const returnDate = dayjs(rec.returnDate);
         return returnDate.isBetween(start, end, "day", "[]");
       });
     }, [dateRange]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Dispute No</span>,
   
      dataIndex: "slno",
      width: 70,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
        title: <span className="text-amber-700 font-semibold">Order No</span>,
   
      dataIndex: "odno",
      width: 70,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Customer Name</span>,
   
      dataIndex: "customerName",
      width: 220,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
             title: <span className="text-amber-700 font-semibold">Plant Name</span>,
   
      dataIndex: "plantName",
      width: 220,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
      {
   title: <span className="text-amber-700 font-semibold"> Return Date
</span>,
   
      dataIndex: "returnDate",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
   {
      title: <span className="text-amber-700 font-semibold">Return Amount</span>,
      dataIndex: "returnAmount",  
      width: 130,
      render: (t) => <span className="text-amber-800">{t}</span>, 
   },
   {
    title: <span className="text-amber-700 font-semibold">Return Reason</span>,
      dataIndex: "returnReason",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,

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
            Sale Returns
          </h2>
          <p className="text-amber-600 text-sm">
            Month-wise sale return records
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

export default SaleReturn;

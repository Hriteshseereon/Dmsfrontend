import React, { useMemo, useState } from "react";
import { Table, DatePicker,Button, Row, Col, Card, Tag } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK SALE LoadingAdvice JSON ---------------- */
const loadingAdviceJSON = [
  {
    key: 1,
    slno: 1,
   LoadingAdviceNo: "PINV-2024-001",
    plantName: "Plant A",
    customerName: "Customer X",
    transporterName: "Transporter 1",
    loadingAdviceDate: "2024-09-06",
    totalAmount: 15000,

  },
  {
    key: 2,
    slno: 2,
    LoadingAdviceNo: "PINV-2024-014",
    plantName: "Plant B",
    customerName: "Customer Y",
    transporterName: "Transporter 2",
    loadingAdviceDate: "2024-09-19",
    totalAmount: 8000,
  },
  {
    key: 3,
    slno: 3,
    LoadingAdviceNo: "PINV-2024-022",
    plantName: "Plant C",
    customerName: "Customer Z",
    transporterName: "Transporter 3",
    loadingAdviceDate: "2024-10-03",
    totalAmount: 12000,
    
  },
  {
    key: 4,
    slno: 4,
    LoadingAdviceNo: "PINV-2024-031",
    plantName: "Plant D",
    customerName: "Customer W",
    transporterName: "Transporter 4",
    loadingAdviceDate: "2024-11-12",
    totalAmount: 10000,

  },
];

/* ---------------- COMPONENT ---------------- */
const LoadingAdvice = () => {
const [dateRange, setDateRange] = useState(null);
  /* ---------------- MONTH FILTER LOGIC ---------------- */
const filteredData = useMemo(() => {
  if (!dateRange) return  loadingAdviceJSON;

  const [start, end] = dateRange;

  return loadingAdviceJSON.filter((rec) => {
    const loadingAdviceDate = dayjs(rec.loadingAdviceDate);
    return loadingAdviceDate.isBetween(start, end, "day", "[]");
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
       title: <span className="text-amber-700 font-semibold">Loading Advice No</span>,
    
      dataIndex: "LoadingAdviceNo",
      width: 160,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {       title: <span className="text-amber-700 font-semibold">Loading Advice Date</span>,
      dataIndex: "loadingAdviceDate",
      width: 140,
       render: (d) => <span className="text-amber-800">{d}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d}</span>,
 
    },
    {
       title: <span className="text-amber-700 font-semibold">Customer Name</span>,
      dataIndex: "customerName",
      width: 120,
       render: (d) => <span className="text-amber-800">{d}</span>,
    },
    {       title: <span className="text-amber-700 font-semibold">Transporter Name</span>,
      dataIndex: "transporterName",
      width: 150,
       render: (d) => <span className="text-amber-800">{d}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount",
      width: 120,
      
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
            Loading Advice
         </h2>
         <p className="text-amber-600 text-sm">
           Month-wise loading advice records
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
                onClick={() => setDateRange(null)}     >
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

export default LoadingAdvice;

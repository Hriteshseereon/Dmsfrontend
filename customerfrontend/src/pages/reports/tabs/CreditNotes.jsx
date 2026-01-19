import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import { Button } from "antd";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK CREDIT NOTES JSON ---------------- */
const creditNotesJSON = [
  {
    key: 1,
    slno: 1,
    plantName: "Reliance Retail",
    item: "Mustard Oil",
    creditNoteNo: "CN-2024-001",
    creditDate: "2024-09-11",
    amount: 10000,
    status: "Approved",
  },
  {
    key: 2,
    slno: 2,
    plantName: "Big Bazaar",
    item: "Soybean Oil",
    creditNoteNo: "CN-2024-009",
    creditDate: "2024-09-27",
    amount: 7800,
    status: "Pending",
  },
  {
    key: 3,
    slno: 3,
    plantName: "Metro Cash & Carry",
    item: "Palm Oil",
    creditNoteNo: "CN-2024-016",
    creditDate: "2024-10-09",
    amount: 16500,
    status: "Approved",
  },
  {
    key: 4,
    slno: 4,
    plantName: "DMart",
    item: "Groundnut Oil",
    creditNoteNo: "CN-2024-022",
    creditDate: "2024-11-16",
    amount: 5200,
    status: "Rejected",
  },
];

/* ---------------- COMPONENT ---------------- */
const CreditNotes = () => {
 const [dateRange, setDateRange] = useState(null);

  /* ---------------- MONTH FILTER LOGIC ---------------- */
const filteredData = useMemo(() => {
  if (!dateRange) return creditNotesJSON;

  const [start, end] = dateRange;

  return creditNotesJSON.filter((rec) => {
    const creditDate = dayjs(rec.creditDate);
    return creditDate.isBetween(start, end, "day", "[]");
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
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      width: 220,
         render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Items</span>,
   
      dataIndex: "item",
      width: 180,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
              title: <span className="text-amber-700 font-semibold">Credit Note No</span>,
   

      dataIndex: "creditNoteNo",
      width: 160,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
              title: <span className="text-amber-700 font-semibold">Credit Date</span>,
      dataIndex: "creditDate",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
              title: <span className="text-amber-700 font-semibold">Amount (₹)</span>,
      dataIndex: "amount",
      align: "right",
      width: 120,
      
          render: (t) => <span className="text-amber-800">₹{t.toLocaleString()}</span>,

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
              Credit Notes Report
           </h2>
           <p className="text-amber-600 text-sm">
              Detailed overview of all credit notes
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

export default CreditNotes;

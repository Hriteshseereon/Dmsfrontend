import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag,Button } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK PURCHASE INVOICE JSON ---------------- */
const purchaseInvoiceJSON = [
  {
    key: 1,
    slno: 1,
    invoiceNo: "PINV-2024-001",
    invoiceDate: "2024-09-06",
    totalAmount: 15000,
    plantName: "Plant A",
   
  },
  {
    key: 2,
    slno: 2,
    invoiceNo: "PINV-2024-014",
    invoiceDate: "2024-09-19",
    plantName: "Plant B",
    totalAmount: 8000,
  },
  {
    key: 3,
    slno: 3,
    invoiceNo: "PINV-2024-022",
    invoiceDate: "2024-10-03",
    totalAmount: 12000,
    plantName: "Plant C",
    
  },
  {
    key: 4,
    slno: 4,
    invoiceNo: "PINV-2024-031",
    invoiceDate: "2024-11-12",
    totalAmount: 10000,
    plantName: "Plant D",
   
  },
];

/* ---------------- COMPONENT ---------------- */
const PurchaseInvoice = () => {
 const [dateRange, setDateRange] = useState(null);
   /* ---------------- MONTH FILTER LOGIC ---------------- */
 const filteredData = useMemo(() => {
   if (!dateRange) return  purchaseInvoiceJSON;
 
   const [start, end] = dateRange;

   return purchaseInvoiceJSON.filter((rec) => {
     const invoiceDate = dayjs(rec.invoiceDate);
     return invoiceDate.isBetween(start, end, "day", "[]");
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
       title: <span className="text-amber-700 font-semibold">Invoice No</span>,
    
      dataIndex: "invoiceNo",
      width: 160,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Invoice Date</span>,
      dataIndex: "invoiceDate",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
        title: <span className="text-amber-700 font-semibold">Plant Name</span>,
        dataIndex: "plantName",
        width: 180,
        render: (t) => <span className="text-amber-800">{t}</span>,
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
             Purchase Invoice
           </h2>
           <p className="text-amber-600 text-sm">
             Month-wise purchase invoice records
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

export default PurchaseInvoice;

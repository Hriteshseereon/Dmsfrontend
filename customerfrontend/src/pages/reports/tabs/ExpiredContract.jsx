import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag ,Button} from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK SALE LoadingAdvice JSON ---------------- */
const SaleExpiredContractJSON = [
  {
    key: 1,
    slno: 1,
    ContractNo: "SCON-2024-001",
    plantName: "Customer A",
    startDate: "2024-06-01",
    endDate: "2024-09-06", // expiry date
    totalAmount: 15000,
     approvalStatus: "EXPIRED",
  },
  {
    key: 2,
    slno: 2,
    ContractNo: "PCON-2024-014",
    plantName: "Customer B",
    startDate: "2024-07-10",
    endDate: "2024-09-19",
    totalAmount: 8000,
      approvalStatus: "Not EXPIRED",
  },
];


/* ---------------- COMPONENT ---------------- */
const SaleExpiredContract = () => {
  const [dateRange, setDateRange] = useState(null);
     /* ---------------- MONTH FILTER LOGIC ---------------- */
  const filteredData = useMemo(() => {
   return SaleExpiredContractJSON.filter((rec) => {
     const isExpired = rec.approvalStatus === "EXPIRED";

     if (!dateRange) return isExpired;

     const [start, end] = dateRange;
     const orderDate = dayjs(rec.endDate);

     return isExpired && orderDate.isBetween(start, end, "day", "[]");
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
       title: <span className="text-amber-700 font-semibold">Contract No</span>,
    
      dataIndex: "ContractNo",
      width: 160,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    
    {
       title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d}</span>,
 
    },
   
    {
       title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount",
      width: 120,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Expired Date</span>,      
      dataIndex: "endDate",
      width: 120, 
        render: (d) => <span className="text-amber-800">{ dayjs(d).format("DD-MM-YYYY")}</span>, 
    },
    {
          title: <span className="text-amber-700 font-semibold">Status</span>,
          dataIndex: "approvalStatus",
          width: 120,
           render: (t) =>  <Tag color="red">{t}</Tag>,
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
               Expired Contract Report
           </h2>
           <p className="text-amber-600 text-sm">
              Detailed overview of all expired contracts
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

export default SaleExpiredContract;

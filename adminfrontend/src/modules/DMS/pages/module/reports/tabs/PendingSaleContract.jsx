import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag ,Button} from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK PENDING SALE CONTRACT JSON ---------------- */
const PendingSaleContractJSON = [
  {
    key: 1,
    slno: 1,
    contractNo: "ORD-2024-101",
    plantName: "Customer A",
    contractDate: "2024-08-10",
    totalAmount: 25000,
    approvalStatus: "PENDING",
  },
  {
    key: 2,
    slno: 2,
    contractNo: "ORD-2024-118",
    plantName: "Customer B",
    contractDate: "2024-09-01",
    totalAmount: 12000,
    approvalStatus: "PENDING",
  },
  {
    key: 3,
    slno: 3,
    contractNo: "ORD-2024-125",
    plantName: "Customer C",
    contractDate: "2024-09-03",
    totalAmount: 18000,
    approvalStatus: "APPROVED",
  },
];

/* ---------------- COMPONENT ---------------- */
const PendingSaleContract = () => {
  const [dateRange, setDateRange] = useState(null);
    /* ---------------- MONTH FILTER LOGIC ---------------- */
 const filteredData = useMemo(() => {
  return PendingSaleContractJSON.filter((rec) => {
    const isPending = rec.approvalStatus === "PENDING";

    if (!dateRange) return isPending;

    const [start, end] = dateRange;
    const contractDate = dayjs(rec.contractDate);

    return isPending && contractDate.isBetween(start, end, "day", "[]");
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
      dataIndex: "contractNo",
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
      title: <span className="text-amber-700 font-semibold">Contract Date</span>,
      dataIndex: "contractDate",
      width: 120,
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
       render: (t) =>  <Tag color="orange">{t}</Tag>,
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
             Pending Sale Contracts
           </h2>
           <p className="text-amber-600 text-sm">
             Month-wise pending sale contracts
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

export default PendingSaleContract;

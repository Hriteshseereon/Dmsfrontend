import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card ,Button} from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

/* ---------------- MOCK PURCHASE RETURN JSON ---------------- */
const purchaseReturnJSON = [
  {
    key: 1,
    slno: 1,
    orderNo: "PR-2024-101",
    returnDate: "2024-09-08",
    plantName: "Jay Traders",
    returnAmount: 50,
    returnReason: "Damaged Goods",
  },
  {
    key: 2,
    slno: 2,
    orderNo: "PR-2024-118",
    returnDate: "2024-09-22",
    plantName: "Global Suppliers",
    returnAmount: 30,
    returnReason: "Defective Items",
  },
  {
    key: 3,
    slno: 3,
    orderNo: "PR-2024-125",
    returnDate: "2024-10-10",
    plantName: "Kalinga Oils Pvt Ltd",
    returnAmount: 70,
    returnReason: "Quality Issues",
  },
  {
    key: 4,
    slno: 4,
    orderNo: "PR-2024-130",
    returnDate: "2024-11-03",
    plantName: "Odisha Edibles",
    returnAmount: 25,
    returnReason: "Other",
  },
];

/* ---------------- COMPONENT ---------------- */
const PurchaseReturn = () => {
  const [dateRange, setDateRange] = useState(null);
    /* ---------------- MONTH FILTER LOGIC ---------------- */
  const filteredData = useMemo(() => {
    if (!dateRange) return  purchaseReturnJSON;
  
    const [start, end] = dateRange;
 
    return purchaseReturnJSON.filter((rec) => {
      const returnDate = dayjs(rec.returnDate);
      return returnDate.isBetween(start, end, "day", "[]");
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
       title: <span className="text-amber-700 font-semibold">Return Date</span>,
      dataIndex: "returnDate",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
              title: <span className="text-amber-700 font-semibold">Plant Name</span>,
   
      dataIndex: "plantName",
      width: 200,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Return Amount</span>,
   
      dataIndex: "returnAmount",
      width: 180,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Return Reason</span>,
   
      dataIndex: "returnReason",
      width: 180,
      
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
        Purchase Returns
      </h2>
      <p className="text-amber-600 text-sm">
        Month-wise purchase return records
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

export default PurchaseReturn;

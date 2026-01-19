import React, { useMemo, useState } from "react";
import { Table, Select, DatePicker, Row, Col, Tag, Button } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
const { RangePicker } = DatePicker;
dayjs.extend(isBetween);
const { Option } = Select;
/* ---------------- MOCK JSON DATA ---------------- */
const allRecordsJSON = [
  {
    key: 1,
    recordType: "Contract",
    documentNo: "PC-2024-001",
    documentDate: "2024-09-10",
    partyName: "Jay Traders",
    plantName: "Kalinga Oils Pvt. Ltd.",
    amount: 1250000,
    status: "Approved",
  },
  {
    key: 2,
    recordType: "Order",
    documentNo: "PI-2024-015",
    documentDate: "2024-10-05",
    partyName: "Global Suppliers",
    plantName: "Odisha Edibles",
    amount: 520000,
    status: "Pending",
  },
  {
    key: 3,
    recordType: "Contract",
    documentNo: "SC-2024-003",
    documentDate: "2024-08-20",
    partyName: "Reliance Retail",
    plantName: "Kalinga Oils Pvt. Ltd.",
    amount: 2300000,
    status: "Approved",
  },
 
  {
    key: 4,
    recordType: "Return",
    documentNo: "PR-2024-004",
    documentDate: "2024-07-18",
    partyName: "Local Traders",
    plantName: "Kalinga Oils Pvt. Ltd.",
    amount: 150000,
    status: "Approved",
  },
  {
    key: 6,
    recordType: "Return",
    documentNo: "SR-2024-006",
    documentDate: "2024-10-01",
    partyName: "Metro Cash & Carry",
    plantName: "Odisha Edibles",
    amount: 95000,
    status: "Pending",
  },
];

/* ---------------- RECORD TYPE OPTIONS ---------------- */
const recordTypeOptions = [
  "All",
  " Contract",
  " Indent",
  " Invoice",
  " Return",
];

export default function AllRecords() {
  const [recordType, setRecordType] = useState("All");  
  const [dateRange, setDateRange] = useState(null);

  /* ---------------- FILTER LOGIC ---------------- */
   const filteredData = useMemo(() => {
  return allRecordsJSON.filter((rec) => {
    const recDate = dayjs(rec.documentDate);

    if (recordType !== "All" && rec.recordType !== recordType)
      return false;

    if (dateRange) {
      const [start, end] = dateRange;
      if (!recDate.isBetween(start, end, "day", "[]")) return false;
    }

    return true;
  });
}, [recordType, dateRange]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
        title: <span className="text-amber-700 font-semibold">Record Type</span>,
      dataIndex: "recordType",
      width: 80,
          render: (t) => <span className="text-amber-800">{t}</span>,

    },
    
    {
        title: <span className="text-amber-700 font-semibold">Document Date</span>,
      dataIndex: "documentDate",
      width: 40,  
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
       
    },
  
    {
        title: <span className="text-amber-700 font-semibold">Plant</span>,
      dataIndex: "plantName",
      width: 100,
          render: (t) => <span className="text-amber-800">{t}</span>,

    },
    // {
    //   title: "Amount (₹)",
    //   dataIndex: "amount",
    //   align: "right",
    //   width: 140,
    //   render: (amt) => `₹${amt.toLocaleString()}`,
    // },
    {
        title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 10,
      render: (t) =>  {
        let color = 'blue';
        if (t === "Approved") {
          color = 'green';
        } else if (t === "Pending") {
          color = 'orange';
        } else if (t === "Completed") {
          color = 'blue';
        }
        return <Tag color={color}>{t}</Tag>;
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
        All Records
      </h2>
      <p className="text-amber-600 text-sm">
        Centralized view of all transactions
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
            onClick={() => {
  setRecordType("All");
  setDateRange(null);
}}
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
    scroll={{ x: 100 }}
  />
</div>

    </div>
      );
}


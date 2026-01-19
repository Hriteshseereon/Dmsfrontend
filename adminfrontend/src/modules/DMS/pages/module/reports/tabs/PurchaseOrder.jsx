import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag ,Button} from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

/* ---------------- MOCK PURCHASE ORDER JSON ---------------- */
const purchaseOrderJSON = [
  {
    key: 1,
    slno: 1,
    orderNo: "PO-2024-101",
    plantName: "Kalinga Oils Pvt Ltd",
    orderDate: "2024-09-05",
    startDate: "2024-09-10",
    endDate: "2025-03-31",
    totalAmount:600,
    status: "Approved",

  },
  {
    key: 2,
    slno: 2,
    orderNo: "PO-2024-118",
    plantName: "Odisha Edibles",
    orderDate: "2024-09-22",
    startDate: "2024-10-01",
    endDate: "2025-02-28",
    totalAmount:300,
    status: "Pending",
  },
  {
    key: 3,
    slno: 3,
    orderNo: "PO-2024-125",
    plantName: "Kalinga Oils Pvt Ltd",
    orderDate: "2024-10-08",
    startDate: "2024-10-15",
    endDate: "2025-06-30",
    totalAmount:700,
    status: "Approved",
  },
  {
    key: 4,
    slno: 4,
    orderNo: "PO-2024-130",
    plantName: "Odisha Edibles",
    orderDate: "2024-11-12",
    startDate: "2024-11-15",
    endDate: "2025-05-31",
    totalAmount:250,
    status: "Completed",
  },
];

/* ---------------- COMPONENT ---------------- */
const PurchaseOrder = () => {
  const [dateRange, setDateRange] = useState(null);
    /* ---------------- MONTH FILTER LOGIC ---------------- */
  const filteredData = useMemo(() => {
    if (!dateRange) return  purchaseOrderJSON;
  
    const [start, end] = dateRange;
 
    return purchaseOrderJSON.filter((rec) => {
      const orderDate = dayjs(rec.orderDate);
      return orderDate.isBetween(start, end, "day", "[]");
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
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
             title: <span className="text-amber-700 font-semibold">Plant Name</span>,
   
      dataIndex: "plantName",
      width: 200,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Order Date</span>,
      dataIndex: "orderDate",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
        title: <span className="text-amber-700 font-semibold">Order Start Date</span>,
      dataIndex: "startDate",
      width: 130,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    }
   ,
   {

        title: <span className="text-amber-700 font-semibold">Order End Date</span>,
      dataIndex: "endDate",
      width: 130,   
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount",
      width: 120,
      render: (amount) => <span className="text-amber-800">{amount}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",  
      width: 120,
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
    }
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
        Purchase Order
      </h2>
      <p className="text-amber-600 text-sm">
        Month-wise purchase order details
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
    scroll={{ x: 100 }}
  />
</div>


    </div>
  );
};

export default PurchaseOrder;

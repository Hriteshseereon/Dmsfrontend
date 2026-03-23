import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card ,Button} from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { getCommonReport } from "../../../../../../api/reports";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;



/* ---------------- COMPONENT ---------------- */
const PurchaseReturn = () => {
   const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState(null); 
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const res = await getCommonReport({ type: "purchase_return" }); // ✅ IMPORTANT
  
      const formatted = res.data.map((item, index) => ({
        key: index,
        orderNo: item.order_number || "-", // handle null
        plantName: item.vendor_name,
        return_number:item.return_number,
        return_date: item.return_date ,
        return_amount: item.return_amount,
        return_reason:item.return_reason,
        status: item.status,
      }));
  
      setData(formatted);
    } catch (err) {
      console.error(err);
    }
  };/* ---------------- MONTH FILTER LOGIC ---------------- */
const filteredData = useMemo(() => {
  if (!dateRange) return data;

  const [start, end] = dateRange;

  return data.filter((rec) => {
    if (!rec.return_date) return false;

    const returnDate = dayjs(rec.return_date);
    return returnDate.isBetween(start, end, "day", "[]");
  });
}, [dateRange, data]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Return No</span>,
   
      dataIndex: "return_number",
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
      dataIndex: "return_date",
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
   
      dataIndex: "return_amount",
      width: 180,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Return Reason</span>,
   
      dataIndex: "return_reason",
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

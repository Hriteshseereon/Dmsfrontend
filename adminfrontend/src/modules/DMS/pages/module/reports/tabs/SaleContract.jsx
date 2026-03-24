import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Tag,Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useEffect } from "react";
import { getCommonReport } from "../../../../../../api/reports"
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;



/* ---------------- COMPONENT ---------------- */
const SaleContract = () => {
 const [data, setData] = useState([]);
 const [dateRange, setDateRange] = useState(null);
useEffect(() => {
  fetchData();
}, []);

 const fetchData = async () => {
    try {
     const res = await getCommonReport({ type: "sales_contract" });
      const formatted = res.data
      
        .map((item, index) => ({
          key: index,
          contract_number: item.contract_number,
          customer_name: item.customer_name,
          contract_date: item.contract_date ,
          expired_date: item.expired_date ,
          startDate: item.start_date,
          endDate: item.end_date,
          totalAmount: item.total_amount,
          status: item.status,
        }));

      setData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- DATE RANGE FILTER LOGIC ---------------- */
const filteredData = useMemo(() => {
 if (!dateRange) return data;

  const [start, end] = dateRange;

return data.filter((rec) => {
  const contractDate = dayjs(rec.contract_date);
  return contractDate.isBetween(start, end, "day", "[]");
});
}, [dateRange, data]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
   
      dataIndex: "contract_number",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Customer Name</span>,
      dataIndex: "customer_name",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
   
    {
       title: <span className="text-amber-700 font-semibold">Contract Date</span>,
      dataIndex: "contract_date",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
        title: <span className="text-amber-700 font-semibold"> Contract Start Date</span>,
      dataIndex: "startDate",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
        title: <span className="text-amber-700 font-semibold">Contract End Date</span>,
      dataIndex: "endDate",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "totalAmount", 
      width: 120,
      render: (t) => <span className="text-amber-800">₹ {t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",  
      width: 100,
      render: (status) => {
        let color = "gray";
        if (status === "Approved") color = "green";
        else if (status === "Pending") color = "orange";
        else if (status === "Completed") color = "blue";
        return <Tag color={color}>{status}</Tag>;
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
            Sale Contracts
          </h2>
          <p className="text-amber-600 text-sm">
            Month-wise sale contract details
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

export default SaleContract;

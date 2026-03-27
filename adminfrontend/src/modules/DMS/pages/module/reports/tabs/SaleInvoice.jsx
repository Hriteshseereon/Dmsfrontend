import React, { useMemo, useState } from "react";
import { Table, DatePicker, Row, Col, Card, Button } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
import { useEffect } from "react";
import { getCommonReport } from "../../../../../../api/reports";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;



/* ---------------- COMPONENT ---------------- */
const SaleInvoice = () => {
  const [data, setData] = useState([]);
     const [dateRange, setDateRange] = useState(null); 
     
     useEffect(() => {
       fetchData();
     }, []);
     
     const fetchData = async () => {
       try {
         const res = await getCommonReport({ type: "sales_invoice" }); // ✅ IMPORTANT
     
         const formatted = res.data.map((item, index) => ({
           key: index,
           invoice_number: item.invoice_number || "-", // handle null
           customer_name:item.customer_name,
           invoice_date: item.invoice_date ,
           total_amount:item.total_amount,
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
       if (!rec.invoice_date) return false;
   
       const invoiceDate = dayjs(rec.invoice_date);
       return invoiceDate.isBetween(start, end, "day", "[]");
     });
   }, [dateRange, data]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    
    {
       title: <span className="text-amber-700 font-semibold">Invoice No</span>,
    
      dataIndex: "invoice_number",
      width: 160,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Invoice Date</span>,
      dataIndex: "invoice_date",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
 
    },
    {
        title: <span className="text-amber-700 font-semibold">Customer Name</span>, 
      dataIndex: "customer_name",
      width: 200, 
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
       title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "total_amount",
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
              Sale Invoice
            </h2>
            <p className="text-amber-600 text-sm">
              Month-wise sale invoice details
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

export default SaleInvoice;

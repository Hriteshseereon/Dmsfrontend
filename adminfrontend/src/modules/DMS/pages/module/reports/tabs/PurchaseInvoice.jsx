import React, { useMemo, useState ,useEffect} from "react";
import { Table, DatePicker, Row, Col, Card, Tag,Button } from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import isBetween from "dayjs/plugin/isBetween";
import { getCommonReport } from "../../../../../../api/reports";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;



/* ---------------- COMPONENT ---------------- */
const PurchaseInvoice = () => {
 const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState(null); 
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const res = await getCommonReport({ type: "purchase_invoice" }); // ✅ IMPORTANT
  
      const formatted = res.data.map((item, index) => ({
        key: index,
        invoice_number: item.invoice_number || "-", // handle null
        plant_name: item.plant_name,
        return_number:item.return_number,
        invoice_date: item.invoice_date ,
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
        title: <span className="text-amber-700 font-semibold">Plant Name</span>,
        dataIndex: "plant_name",
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

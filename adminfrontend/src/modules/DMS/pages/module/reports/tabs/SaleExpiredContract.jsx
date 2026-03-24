import React, { useMemo, useState,useEffect } from "react";
import { Table, DatePicker, Row, Col, Card, Tag ,Button} from "antd";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;
import { getCommonReport } from "../../../../../../api/reports"
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);



/* ---------------- COMPONENT ---------------- */
const SaleExpiredContract = () => {
  const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState(null); 
    
    useEffect(() => {
      fetchData();
    }, []);
    
    const fetchData = async () => {
    try {
      const res = await getCommonReport({ type: "sales_contract" });
  
      const today = dayjs();
  
      const formatted = res.data
        .map((item, index) => ({
          key: index,
          contract_number: item.contract_number,
          plantName: item.vendor_name,
          expired_date: item.expired_date,
          customer_name:item.customer_name,
          total_amount: item.total_amount,
          status: "expired",
        }))
        .filter((rec) => {
          const endDate = dayjs(rec.endDate);
          return (
            endDate.isBefore(today, "day") ||
            rec.status?.toLowerCase() === "expired"
          );
        });
  
      setData(formatted);
    } catch (err) {
      console.error(err);
    }
  };
      
      /* ---------------- MONTH FILTER LOGIC ---------------- */
  const filteredData = useMemo(() => {
   if (!dateRange) return data;
  
    const [start, end] = dateRange;
  
  return data.filter((rec) => {
    const endDate = dayjs(rec.expired_date);
    return endDate.isBetween(start, end, "day", "[]");
  });
  }, [dateRange, data]);



  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    
    {
       title: <span className="text-amber-700 font-semibold">Contract No</span>,
    
      dataIndex: "contract_number",
      width: 160,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    
    {
       title: <span className="text-amber-700 font-semibold">Customer Name</span>,
      dataIndex: "customer_name",
      width: 120, 
       render: (d) => <span className="text-amber-800">{d}</span>,
 
    },
   
    {
       title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "total_amount",
      width: 120,
      
          render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Expired Date</span>,      
      dataIndex: "expired_date",
      width: 120, 
        render: (d) => <span className="text-amber-800">{ dayjs(d).format("DD-MM-YYYY")}</span>, 
    },
    {
          title: <span className="text-amber-700 font-semibold">Status</span>,
          dataIndex: "status",
          width: 120,
           render: (t) =>  <Tag color="red">{t}</Tag>,
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
              Purchase Expired Contracts
          </h2>
          <p className="text-amber-600 text-sm">
            Month-wise purchase expired contracts
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

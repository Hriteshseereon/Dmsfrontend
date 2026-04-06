import React, { useMemo, useState } from "react";
import { Table, Select, DatePicker, Row, Col, Tag, Button } from "antd";
const { RangePicker } = DatePicker;
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { FilterOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { getCommonReport } from "../../../../../../api/reports"

dayjs.extend(isBetween);
const { Option } = Select;


export default function AllRecords() {
 
const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState(null); 
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
  try {
    const res = await getCommonReport({ type: "all_records" });

    const formatted = res.data.map((item, index) => ({
      key: index,
      recordType: item.record_type,
      documentDate: item.document_date,
      partyName: item.party_name,
      plantName: item.plant_name || "-",
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
    if (!rec.documentDate) return false;

    const loadingDate = dayjs(rec.documentDate);
    return loadingDate.isBetween(start, end, "day", "[]");
  });
}, [dateRange, data]);


  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
        title: <span className="text-amber-700 font-semibold">Record Type</span>,
      dataIndex: "recordType",
      width: 80,
          render: (t) => <span className="text-amber-800">{t}</span>,

    },
    // {
    //   title: "Document No",
    //   dataIndex: "documentNo",
    //   width: 160,
    // },
    {
        title: <span className="text-amber-700 font-semibold">Document Date</span>,
      dataIndex: "documentDate",
      width: 40,  
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
       
    },
    {
        title: <span className="text-amber-700 font-semibold">Party Name</span>,
      dataIndex: "partyName",
      width: 100,
          render: (t) => <span className="text-amber-800">{t}</span>,

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
      width: 100,
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
        Centralized view of all purchase & sales transactions
      </p>
    </Col>

    {/* Right: Filters */}
    <Col>
      {/* <Row gutter={8} align="middle">

        <Col>
          <Select
            value={recordType}
            onChange={setRecordType}
            className="border-amber-400! text-amber-700!"
            style={{ width: 180 }}
          >
            {recordTypeOptions.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Col>  
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

      </Row> */}
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

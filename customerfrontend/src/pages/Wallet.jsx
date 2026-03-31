// WalletPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Tag } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import {  getCustomerLedger } from "../api/wallet";


const WalletPage = () => {
const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
 
  useEffect(() => {
  fetchLedger();
}, []);
 
const filteredData = (data || []).filter((row) =>
  row.created_at?.toLowerCase().includes(search.toLowerCase())
);

const fetchLedger = async () => {
  try {
    const res = await getCustomerLedger();

    console.log("API Response:", res);

    setData(Array.isArray(res) ? res : []);
  } catch (err) {
    console.error(err);
    setData([]);
  }
};

 
const ledgerColumns = [
    {
         title: <span className="text-amber-700!">Credit Balance</span>,
    dataIndex: "credit_balance",
     width:100,
    render: (val) => <span className="text-amber-700!">{val}</span>,
       
  },
  {
 title: <span className="text-amber-700!">Debit Balance</span>,
    dataIndex: "debit_balance",
      width:100,
    render: (val) => <span className="text-amber-700!">{val}</span>,
  },
   {
    title: <span className="text-amber-700!">Transaction Amount</span>,
    dataIndex: "amount",
      width:100,
      render: (val) => <span className="text-amber-700!">{val}</span>,
  },
  {
    title: <span className="text-amber-700!">Date</span>,
    dataIndex: "created_at", 
      width:100,
      render: (val) => <span className="text-amber-700!">{new Date(val).toLocaleString()}</span>,
  },
  {
     title: <span className="text-amber-700!">Type</span>,
    dataIndex: "type",
      width:100,
   render: (val) => <span className="text-amber-700!">{val}</span>,
  },
 
  {
     title: <span className="text-amber-700!">Remarks</span>,
    dataIndex: "remarks",
    width:180,
      render: (val) => <span className="text-amber-700!">{val}</span>,
  },
];
  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Wallet</h1>
          <p className="text-amber-600">Manage your Wallet easily</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
           <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search Note No..."
            className="w-64! border-amber-300!"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

         

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
             
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>

         
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4">
       <Table
  dataSource={filteredData}
  columns={ledgerColumns}
  rowKey="id"   // ✅ VERY IMPORTANT
  pagination={10}
  scroll={{ y: 350 }}
/>
      </div>
    
    </div>
  );
};

export default WalletPage;

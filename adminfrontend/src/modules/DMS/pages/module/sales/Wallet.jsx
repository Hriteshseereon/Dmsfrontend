// WalletPage.jsx
import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const amber = {
  light: "#fef3c7",
  main: "#f59e0b",
  dark: "#b45309",
};

const walletData = [
  {
    id: 1,
    noteNo: "CN-1001",
    amount: 4500,
    customerName: "Customer A",
    disputNo: "DIS-2290",
    date: "2025-01-15",
    status: "Paid",
  },
  {
    id: 2,
    noteNo: "CN-1002",
    amount: 3000,
    customerName: "Customer B",
   disputNo: "DIS-2291",
    date: "2025-01-20",
    status: "Partially Paid",
  },
  {
    id: 3,  
    noteNo: "CN-1003",
    amount: 1500,
    customerName: "Customer C",
    disputNo: "DIS-2292",
    date: "2025-01-25",
    status: "Unpaid",
  },
];

const WalletPage = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRef, setFilterRef] = useState("");

  const filterData = walletData.filter((row) => {
    return (
      row.noteNo.toLowerCase().includes(search.toLowerCase()) &&
      (filterType ? row.status === filterType : true) &&
      (filterRef ? row.disputNo === filterRef : true)
    );
  });

  const columns = [
   
   
    {
      title: <span className="text-amber-700! font-semibold!">Dispute No</span>,
      dataIndex: "disputNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Customer Name</span>,
      dataIndex: "customerName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Amount</span>,
      dataIndex: "amount",
      render: (text) => <span className="text-amber-800"> {text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Date</span>,
      dataIndex: "date",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Status</span>,
      dataIndex: "status",
      width: 150,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Unpaid")
          return (
            <span className={`${base} bg-red-100 text-red-700`}>
              Unpaid
            </span>
          );
        if (status === "Partially Paid")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              Partially Paid
            </span>
          );
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Paid
          </span>
        );
      },
    },
  ];

  return (
    <div>

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

          {/* CREDIT / DEBIT FILTER AS BUTTONS */}
          <div className="flex gap-2">
        
 <Button
              type={filterType === "Paid" ? "primary" : "default"}
              className={
                filterType === "Paid"
                  ? "bg-amber-500! text-white! border-none!"
                  : "border-amber-400! text-amber-700! hover:bg-amber-100!"
              }
              onClick={() => setFilterType("Paid")}
            >
              Paid
            </Button>
            <Button
              type={filterType === "Partially Paid" ? "primary" : "default"}
              className={
                filterType === "Partially Paid"
                  ? "bg-amber-500! text-white! border-none!"
                  : "border-amber-400! text-amber-700! hover:bg-amber-100!"
              }
              onClick={() => setFilterType("Partially Paid")}
            >
              Partially Paid
            </Button>

           
            <Button 
              type={filterType === "Unpaid" ? "primary" : "default"}
              className={
                filterType === "Unpaid"
                  ? "bg-amber-500! text-white! border-none!"
                  : "border-amber-400! text-amber-700! hover:bg-amber-100!"
              }
              onClick={() => setFilterType("Unpaid")}
            >
              Unpaid
            </Button>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              setFilterType("");
              setFilterRef("");
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
          dataSource={filterData}
          columns={columns}
          pagination={10}
          scroll={{ y: 350 }}
        />
      </div>
    </div>
  );
};

export default WalletPage;

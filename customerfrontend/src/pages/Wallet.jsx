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
    type: "Debit",
    noteNo: "CN-1001",
    item: "Item A",
    amount: 4500,
    qty: 10,
    uom: "PCS",
    refType: "Order",
    refId: "ORD-9852",
    date: "2025-01-15",
    status: " Not Applied",
  },
  {
    id: 2,
    type: "Credit",
    noteNo: "CN-1002",
    item: "Item B",
    amount: 3000,
    qty: 5,
    uom: "BOX",
    refType: "Dispute",
    refId: "DIS-2291",
    date: "2025-01-20",
    status: "Applied",
  },
];

const WalletPage = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRef, setFilterRef] = useState("");

  const filterData = walletData.filter((row) => {
    return (
      row.noteNo.toLowerCase().includes(search.toLowerCase()) &&
      (filterType ? row.type === filterType : true) &&
      (filterRef ? row.refType === filterRef : true)
    );
  });

  const columns = [
    {
      title: <span className="text-amber-700! font-semibold!">Note No</span>,
      dataIndex: "noteNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Reference</span>,
      dataIndex: "refType",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Type</span>,
      dataIndex: "type",
      render: (type) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (type === "Credit")
          return <span className={`${base} text-green-600`}>Credit</span>;
        return <span className={`${base} text-blue-700`}>Debit</span>;
      },
    },
    {
      title: <span className="text-amber-700! font-semibold!">Order/Dispute No</span>,
      dataIndex: "refId",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Item</span>,
      dataIndex: "item",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Qty</span>,
      dataIndex: "qty",
      render: (_, text) => (
        <span className="text-amber-800">
          {text.qty}
          {text.uom}
        </span>
      ),
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
        if (status === "Applied")
          return (
            <span className={`${base} bg-red-100 text-red-700`}>
              Applied
            </span>
          );
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Not Applied
          </span>
        );
      },
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

          {/* CREDIT / DEBIT FILTER AS BUTTONS */}
          <div className="flex gap-2">
            <Button
              type={filterType === "" ? "primary" : "default"}
              className={
                filterType === ""
                  ? "bg-amber-500! text-white! border-none!"
                  : "border-amber-400! text-amber-700! hover:bg-amber-100!"
              }
              onClick={() => setFilterType("")}
            >
              All
            </Button>

            <Button
              type={filterType === "Credit" ? "primary" : "default"}
              className={
                filterType === "Credit"
                  ? "bg-amber-500! text-white! border-none!"
                  : "border-amber-400! text-amber-700! hover:bg-amber-100!"
              }
              onClick={() => setFilterType("Credit")}
            >
              Credit
            </Button>

            <Button
              type={filterType === "Debit" ? "primary" : "default"}
              className={
                filterType === "Debit"
                  ? "bg-amber-500! text-white! border-none!"
                  : "border-amber-400! text-amber-700! hover:bg-amber-100!"
              }
              onClick={() => setFilterType("Debit")}
            >
              Debit
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

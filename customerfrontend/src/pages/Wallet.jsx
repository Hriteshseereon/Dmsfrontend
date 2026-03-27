// WalletPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Tag } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { getWalletData, getCustomerLedger } from "../api/wallet";


const WalletPage = () => {
const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

 const fetchWallet = async () => {
    try {
      const res = await getWalletData();
      // res is the single customer object: { customer_id, customer_name, credit_balance, debit_balance }
      // Wrap in array so Table always gets an array
      const list = Array.isArray(res) ? res : [res];
      const formatted = list.map((item, index) => ({
        key: index,
        customerId: item.customer_id,
        customerName: item.customer_name,
        creditBalance: Number(item.credit_balance),
        debitBalance: Number(item.debit_balance),
      }));
      setData(formatted);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };
 
 const filteredData = data.filter((row) =>
    row.customerName?.toLowerCase().includes(search.toLowerCase())
  );
 const fetchLedger = async (record) => {
    setSelectedCustomer(record);
    setLoadingLedger(true);
    try {
      const res = await getCustomerLedger(record.customerId);
      const formatted = res.map((item, index) => ({
        key: index,
        date: new Date(item.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: item.type,
        sourceType: item.source_type,
        amount: Number(item.amount),
        remarks: item.remarks,
        creditBalance: Number(item.credit_balance),
        debitBalance: Number(item.debit_balance),
      }));
      setLedgerData(formatted);
      setLedgerModalOpen(true);
    } catch (error) {
      console.error("Ledger error:", error);
    } finally {
      setLoadingLedger(false);
    }
  };
  const columns = [
   
    {
      title: <span className="text-amber-700! font-semibold!">Customer Name</span>,
      dataIndex: "customerName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    
    {
      title: <span className="text-amber-700! font-semibold!">Credit Balance</span>,
      dataIndex: "creditBalance",
      render: (text) => <span className="text-amber-800"> {text}</span>,
    },
    {
      title: <span className="text-amber-700! font-semibold!">Debit Balance</span>,
      dataIndex: "debitBalance",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
  {
  title: <span className="text-amber-700! font-semibold!">Action</span>,
    
  render: (_, record) => (
   
    

      <EyeOutlined
       className="text-blue-500!"
        onClick={() => fetchLedger(record)}
      />
  
  ),
}
  ];
const ledgerColumns = [
  {
    title: "Date",
    dataIndex: "date",
  },
  {
    title: "Type",
    dataIndex: "type",
    render: (type) => {
      if (type === "CREDIT")
        return <span className="text-green-600 font-semibold">{type}</span>;
      if (type === "DEBIT" || type === "DEBIT_USAGE")
        return <span className="text-red-600 font-semibold">{type}</span>;
      if (type === "PAYMENT")
        return <span className="text-blue-600 font-semibold">{type}</span>;
      return <span>{type}</span>;
    },
  },
 
  {
    title: "Amount",
    dataIndex: "amount",
  },

   {
      title: "Remarks",
      dataIndex: "remarks",
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
          dataSource={filteredData}
          columns={columns}
          pagination={10}
          scroll={{ y: 350 }}
        />
      </div>
      <Modal
title="Ledger"
  open={ledgerModalOpen}
  onCancel={() => setLedgerModalOpen(false)}
  footer={null}
  width={800}
>
  <Table
    dataSource={ledgerData}
    columns={ledgerColumns}
    pagination={false}
    scroll={{ y: 400 }}
  />
</Modal>
    </div>
  );
};

export default WalletPage;

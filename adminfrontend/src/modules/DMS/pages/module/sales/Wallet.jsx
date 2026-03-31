// WalletPage.jsx
import React, { useState,useEffect } from "react";
import { Table, Input, Select, Button, Modal, Form, message } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getWalletData,deductCreditNote ,getCustomerLedger} from "../../../../../api/sales";

const WalletPage = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRef, setFilterRef] = useState("");
const [data, setData] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [form] = Form.useForm();
const [ledgerData, setLedgerData] = useState([]);
const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
useEffect(() => {
  fetchWallet();
}, []);

const fetchWallet = async () => {
  try {
    const res = await getWalletData();

    console.log("API DATA:", res); // 👈 debug

    const formatted = res.map((item, index) => ({
      key: index,
      customerId: item.customer_id,
      customerName: item.customer_name,
      credit: Number(item.credit_balance),
      debit: Number(item.debit_balance),
    }));

    setData(formatted);
  } catch (error) {
    console.error("Error fetching wallet:", error);
  }
};

const filterData = data.filter((row) =>
  row.customerName?.toLowerCase().includes(search.toLowerCase())
);
const openModal = (record) => {
  setSelectedCustomer(record);
  setIsModalOpen(true);
};
const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    const payload = {
  customer_id: selectedCustomer.customerId,
  amount: values.amount,
  remarks: values.remarks,
};

   await deductCreditNote(payload);

    message.success("Credit added successfully");

    setIsModalOpen(false);
    form.resetFields();
    fetchWallet(); // refresh table
  } catch (error) {
    console.error(error);
    message.error("Failed to add credit");
  }
};

const fetchLedger = async (record) => {
  try {
    const res = await getCustomerLedger(record.customerId);

    const formatted = res.map((item, index) => ({
      key: index,
      date: new Date(item.created_at).toLocaleString(),
      type: item.type || item.source_type,
      amount: Number(item.amount),
      remarks: item.remarks,
      credit: Number(item.credit_balance),
      debit: Number(item.debit_balance),
    }));

    setLedgerData(formatted);
    setLedgerModalOpen(true);
  } catch (error) {
    console.error("Ledger error:", error);
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
      dataIndex: "credit",
      render: (text) => <span className="text-amber-800"> {text}</span>,
    },
     {
      title: <span className="text-amber-700! font-semibold!"> Deduct Credit Balance</span>,
        render: (_, record) => (
    <div className="flex gap-2">
      <Button
        type="primary"
        className="bg-amber-500!"
        onClick={() => openModal(record)}
      >
        Deduct 
      </Button>
    </div>
  ),
    },
    {
      title: <span className="text-amber-700! font-semibold!">Debit Balance</span>,
      dataIndex: "debit",
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
          dataSource={filterData}
  columns={columns}
  rowKey="customerId"
          pagination={10}
          scroll={{ y: 350 }}
        />
        <Modal
  title="Deduct Credit Amount"
  open={isModalOpen}
  onCancel={() => {
    setIsModalOpen(false);
    form.resetFields();
  }}
  onOk={handleSubmit}
  okText="Submit"
>
  <Form form={form} layout="vertical">
    <Form.Item
      label="Amount"
      name="amount"
      rules={[{ required: true, message: "Please enter amount" }]}
    >
      <Input type="number" placeholder="Enter amount" />
    </Form.Item>

    <Form.Item
      label="Remarks"
      name="remarks"
      rules={[{ required: true, message: "Please enter remarks" }]}
    >
      <Input placeholder="Enter remarks" />
    </Form.Item>
  </Form>
</Modal>

<Modal
  title={`Ledger - ${selectedCustomer?.customerName || ""}`}
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
    </div>
  );
};

export default WalletPage;

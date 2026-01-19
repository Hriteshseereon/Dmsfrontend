// ===================== Transactions.js =====================
import React, { useState, useEffect } from "react";
import { Card, Input, Table, Modal, Row, Col, Form } from "antd";
import { Button } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Search } = Input;

// ===================== JSON DATA =====================
const transactionsData = {
  kpiCards: [
    { key: "totalTransactions", title: "Total Transactions", value: "126", icon: <CreditCardOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "transactions" },
    { key: "successfulPayments", title: "Successful Payments", value: "142", icon: <CheckCircleOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "successfulPayments" },
    { key: "pendingTransactions", title: "Pending Transactions", value: "8", icon: <ClockCircleOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "pendingTransactions" },
    { key: "inTransit", title: "In Transit Deliveries", value: "14", icon: <CarOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "inTransit" },
    { key: "saleContracts", title: "Sale Contracts", value: "50", icon: <FileTextOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "saleContracts" },
    { key: "saleOrders", title: "Sale Orders", value: "72", icon: <ShoppingCartOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "saleOrders" },
    { key: "saleReturns", title: "Sale Returns", value: "8", icon: <UndoOutlined className="text-2xl! text-amber-500! p-2! rounded-md!" />, tableType: "saleReturns" },
  ],

  transactions: [
    { key: "1", orderId: "TX-001", item: "Sunflower Oil", customer: "Krishna Traders", company: "Krishna Pvt Ltd", type: "Payment", quantityUOM: "10 pcs", amount: "₹1,48,000", method: "UPI", status: "Completed", approvedDate: "2024-01-20" },
    ],

  successfulPayments: [
    { key: "1", orderId: "SP-001", item: "Palm Oil", customer: "Sai Traders", company: "Sai Pvt Ltd", type: "Payment", quantityUOM: "12 pcs", amount: "₹1,10,000", method: "Credit Card", status: "Completed", approvedDate: "2024-03-05" },
  ],

  pendingTransactions: [
    { key: "1", orderId: "PT-001", item: "Mustard Oil", customer: "Om Wholesale", company: "Om Pvt Ltd", type: "Payment", quantityUOM: "6 pcs", amount: "₹90,000", method: "RTGS", status: "Pending", approvedDate: "2024-03-22" },
  ],

  inTransit: [
    { key: "1", orderId: "IT-001", item: "Groundnut Oil", customer: "Deepa Stores", company: "Deepa Ltd", type: "Delivery", quantityUOM: "20 pcs", amount: "₹1,70,000", method: "-", status: "In Transit", approvedDate: "2024-04-15" },
  ],

  saleContracts: [
    { key: "1", orderId: "SC-001", item: "Coconut Oil", customer: "Krishna Trading Co.", company: "Krishna Pvt Ltd", type: "Contract", quantityUOM: "15 pcs", amount: "₹2,50,000", method: "-", status: "Active", approvedDate: "2024-01-10" },
  ],

  saleOrders: [
    { key: "1", orderId: "SO-001", item: "Sunflower Oil", customer: "Ganesh Wholesale", company: "Ganesh Traders", type: "Order", quantityUOM: "8 pcs", amount: "₹1,48,000", method: "NEFT", status: "Delivered", approvedDate: "2024-01-15" },
  ],

  saleReturns: [
    { key: "1", orderId: "SR-001", item: "Mustard Oil", customer: "Krishna Trading Co.", company: "Krishna Pvt Ltd", type: "Return", quantityUOM: "2 pcs", amount: "₹15,000", method: "-", status: "Processed", approvedDate: "2024-01-18" },
  ],
};

export default function Transactions() {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [modalForm] = Form.useForm();

  const openModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    modalForm.resetFields();
  };

  useEffect(() => {
    if (selectedRecord) {
      modalForm.setFieldsValue(selectedRecord);
    }
  }, [selectedRecord, modalForm]);

  const handleCardClick = (card) => {
    setActiveCard(card);
    setSearchText("");
  };

  const columns = [
    { title:  <span className="text-amber-700 font-semibold">Order Id</span>, dataIndex: "orderId", key: "orderId", render: text => <span className="text-amber-700">{text}</span> },
    { title: <span className="text-amber-700 font-semibold">Item</span>, dataIndex: "item", key: "item", render: text => <span className="text-amber-700">{text}</span> },
    { title:  <span className="text-amber-700 font-semibold">Amount</span>, dataIndex: "amount", key: "amount", render: text => <span className="text-amber-700">{text}</span> },
    { title:  <span className="text-amber-700 font-semibold">Customer</span>, dataIndex: "customer", key: "customer", render: text => <span className="text-amber-700">{text}</span> },
    { title:  <span className="text-amber-700 font-semibold">Company</span>, dataIndex: "company", key: "company", render: text => <span className="text-amber-700">{text}</span> },
    { title:  <span className="text-amber-700 font-semibold">Type</span>, dataIndex: "type", key: "type", render: text => <span className="text-amber-700">{text}</span> },
    { title:  <span className="text-amber-700 font-semibold">Quantity</span>, dataIndex: "quantityUOM", key: "quantityUOM", render: text => <span className="text-amber-700">{text}</span> },
    { title:  <span className="text-amber-700 font-semibold">Method</span>, dataIndex: "method", key: "method", render: text => <span className="text-amber-700">{text}</span> },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ["Completed", "Active", "Delivered", "Processed"].includes(status)
            ? "bg-green-100 text-green-600"
            : "bg-yellow-100 text-yellow-600"
        }`}>{status}</span>
      ),
    },
    { title: <span className="text-amber-700 font-semibold">Approved Date</span>, dataIndex: "approvedDate", key: "approvedDate", render: text => <span className="text-amber-700">{text}</span> },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      render: (_, record) => <EyeOutlined className="text-blue-500! cursor-pointer! text-lg!" onClick={() => openModal(record)} />,
    },
  ];

  const filteredData =
    activeCard && transactionsData[activeCard.tableType]
      ? transactionsData[activeCard.tableType].filter((item) =>
          Object.values(item).join(" ").toLowerCase().includes(searchText.toLowerCase())
        )
      : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-amber-700">Transactions</h1>
        <p className="text-amber-500">Monitor payments, sales, and returns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {transactionsData.kpiCards.map((card) => (
          <Card
            key={card.key}
            className={`rounded-lg! shadow-sm! hover:shadow-md! cursor-pointer! ${
              activeCard?.key === card.key ? "bg-amber-50! border! border-amber-400!" : ""
            }`}
            onClick={() => handleCardClick(card)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-amber-700 text-base font-semibold">{card.title}</p>
                <h2 className="text-xl font-bold text-amber-500">{card.value}</h2>
              </div>
              {card.icon}
            </div>
          </Card>
        ))}
      </div>

      {activeCard && (
        <>
          <div className="flex gap-3 mb-6 p-3 rounded-lg shadow-sm items-center bg-white">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 border border-amber-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-700"
            />

            <button className="flex! items-center! gap-1! border! border-amber-400! text-amber-700! px-4! py-2! rounded-md! hover:bg-amber-100!">
              <DownloadOutlined className="text-amber-600!" />
              Export
            </button>
          </div>

          {filteredData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              scroll={{ y: 250 }}
              rowKey="key"
            />
          ) : (
            <p className="text-gray-500 text-center py-10 bg-white rounded-lg shadow-sm">
              No data available for this section.
            </p>
          )}
        </>
      )}

      <Modal
       title={<span className="text-amber-700  text-2xl font-semibold">View Records</span>}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        <Form form={modalForm} layout="vertical" disabled>
          <Row gutter={16}>
            {selectedRecord &&
              Object.keys(selectedRecord).map((key) => {
                if (key === "key") return null;

                let label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

                return (
                  <Col span={12} key={key}>
                    <Form.Item label={label} name={key}>
                      <Input />
                    </Form.Item>
                  </Col>
                );
              })}
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

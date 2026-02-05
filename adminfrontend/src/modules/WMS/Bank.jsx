// Bank.jsx
import React, { useState,useEffect  } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { createWms, getWms, updateWms } from "../../api/wms"; 

const { Option } = Select;

export default function Bank() {
  const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const txnTypes = ["Deposit", "WITHDRAWAL", "OD"];

 const loadData = async () => {
  try {
    setLoading(true);
    const res = await getWms();

    const bankOnly = (res || []).filter(
      (r) => r.asset_category === "BANK"
    );

    setData(bankOnly);
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    message.error("Failed to load transactions");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData();
}, []);


  const filteredData = data.filter((row) =>
    ["transactionType", "bankName", "accountNo", "chequeRef", "narration"].some(
      (f) =>
        (row[f] || "")
          .toString()
          .toLowerCase()
          .includes(searchText.trim().toLowerCase())
    )
  );

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Txn Type</span>,
      dataIndex: "transaction_type",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Date</span>,
      dataIndex: "transaction_date",
      width: 120,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Bank Name</span>,
      dataIndex: "bank_name",
      width: 220,
      render: (b) => <span className="text-amber-800">{b}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Account No</span>,
      dataIndex: "bank_account_no",
      width: 160,
      render: (a) => <span className="text-amber-800">{a}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Amount (₹)</span>,
      dataIndex: "amount",
      width: 140,
      render: (amt) => <span className="text-amber-800">{amt ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Cheque Ref</span>,
      dataIndex: "cheque_ref",
      width: 140,
      render: (c) => <span className="text-amber-800">{c || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Narration</span>,
      dataIndex: "narration",
      width: 240,
      render: (n) => <span className="text-amber-800">{n || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue({
                ...record,
                date: record.date ? dayjs(record.date) : undefined,
              });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
           onClick={() => {
    setSelectedRecord(record);

    editForm.setFieldsValue({
      transactionType: record.transaction_type,
      date: record.transaction_date
        ? dayjs(record.transaction_date)
        : undefined,
      bankName: record.bank_name,
      accountNo: record.bank_account_no,
      amount: record.amount,
      chequeRef: record.cheque_ref,
      narration: record.narration,
    });

    setIsEditModalOpen(true);
  }}
          />
        </div>
      ),
    },
  ];

  const exportCSV = () => {
    if (!data.length) {
      message.info("No data to export");
      return;
    }
    const headers = ["Txn Type", "Date", "Bank Name", "Account No", "Amount", "Cheque Ref", "Narration"];
    const rows = data.map((r) => [
      r.transactionType,
      r.date,
      r.bankName,
      r.accountNo,
      r.amount,
      r.chequeRef,
      (r.narration || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bank_transactions_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Bank Transaction Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Transaction Type</span>}
            name="transactionType"
            rules={[{ required: true, message: "Select transaction type" }]}
            initialValue="Deposit"
          >
            <Select disabled={disabled}>
              {txnTypes.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Date</span>}
            name="date"
            rules={[{ required: true, message: "Select date" }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Bank Name</span>}
            name="bankName"
            rules={[{ required: true, message: "Enter bank name" }]}
          >
            <Input placeholder="Bank name" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={10}>
          <Form.Item
            label={<span className="text-amber-700">Bank Account No</span>}
            name="accountNo"
            rules={[{ required: true, message: "Enter account number" }]}
          >
            <Input placeholder="Account number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Amount (₹)</span>}
            name="amount"
            rules={[{ required: true, message: "Enter amount" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Cheque Ref</span>} name="chequeRef">
            <Input placeholder="Cheque / reference" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label={<span className="text-amber-700">Narration</span>} name="narration">
            <Input.TextArea rows={2} placeholder="Transaction narration" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Top controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search by bank, account, cheque ref or narration..."
            className="w-80! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setSearchText("")}
               className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              >
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button icon={<DownloadOutlined />} onClick={exportCSV} className="border-amber-400! text-amber-700! hover:bg-amber-100!">
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!" onClick={() => {
              addForm.resetFields();
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Bank Transactions Records </h2>
        <p className="text-amber-600 mb-3">Manage balances, deposits, and account transactions</p>
<Table
  rowKey="id"
  columns={columns}
  dataSource={filteredData}
  loading={loading}
  pagination={{ pageSize: 10 }}
  scroll={{ y: 300 }}
/>
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add Bank Transaction</span>}
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form
          form={addForm}
          layout="vertical"
onFinish={async (values) => {
  try {
    const payload = {
      asset_category: "BANK",
      transaction_type: values.transactionType?.toUpperCase(), // Deposit → DEPOSIT
      transaction_date: dayjs(values.date).format("YYYY-MM-DD"),
      asset_name: values.bankName,
      bank_name: values.bankName,
      bank_account_no: values.accountNo,
      amount: values.amount,
      cheque_ref: values.chequeRef,
      narration: values.narration,
      remarks: values.narration || "Bank transaction",
    };

    await createWms(payload);

    message.success("Transaction added.");
    setIsAddModalOpen(false);
    addForm.resetFields();
    loadData();
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    message.error("Failed to create transaction");
  }
}}

        >
          {renderFormFields(addForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
              }}
                  className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          
            >
              Cancel
            </Button>
            <Button type="primary"  className="bg-amber-500! hover:bg-amber-600! border-none!" htmlType="submit">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Bank Transaction</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={920}
      >
        <Form
          form={editForm}
          layout="vertical"
onFinish={async (values) => {
  try {
    const payload = {
      asset_category: "BANK",
      transaction_type: values.transactionType?.toUpperCase(),
      transaction_date: dayjs(values.date).format("YYYY-MM-DD"),
      asset_name: values.bankName,
      bank_name: values.bankName,
      bank_account_no: values.accountNo,
      amount: values.amount,
      cheque_ref: values.chequeRef,
      narration: values.narration,
      remarks: values.narration || "Bank transaction",
    };

    await updateWms(selectedRecord.id, payload);

    message.success("Transaction updated.");
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedRecord(null);
    loadData();
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    message.error("Failed to update transaction");
  }
}}


        >
          {renderFormFields(editForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setSelectedRecord(null);
              }}
                  className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          
            >
              Cancel
            </Button>
            <Button type="primary"  className="bg-amber-500! hover:bg-amber-600! border-none!" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">View Bank Transaction Details</span>}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={920}
      >
        <Form form={viewForm} layout="vertical">
          {renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}

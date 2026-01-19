// Gold.jsx
import React, { useState } from "react";
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

const { Option } = Select;
const SAMPLE_ASSETS = [
  "New Asset",
  "Gold Lot A",
  "Property - Gold Vault 1",
  "Custom Lot",
];

export default function Silver() {
  const [data, setData] = useState([
    {
      key: 1,
      transactionType: "Investment",
      lotDescription: "Gold Lot A",
      refNumber: "GL-1001",
      sellerName: "Gold Seller Co",
      sellerAddress: "12 Market St, City",
      brokerName: "Broker X",
      brokerAddress: "Broker Lane",
      interestRate: 2.5,
      interestType: "Cumulative",
      interestPayment: "Yearly",
      transactionDate: "2025-08-01",
      quantity: 10, // grams
      ratePerGram: 5600,
      amount: 56000, // quantity * ratePerGram
      narration: "Purchase of gold lot",
    },
  ]);

  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const txnTypes = ["Interest", "Interest (payout)", "Investment", "Withdrawal"];
  const interestTypes = ["Cumulative", "Payout"];
  const interestPayments = ["Monthly", "Quarterly", "Half Yearly", "Yearly"];

  const filteredData = data.filter((row) =>
    [
      "transactionType",
      "lotDescription",
      "refNumber",
      "sellerName",
      "brokerName",
      "narration",
    ].some((f) =>
      (row[f] || "").toString().toLowerCase().includes(searchText.trim().toLowerCase())
    )
  );

  const computeAmount = (values) => {
    const qty = Number(values.quantity || 0);
    const rate = Number(values.ratePerGram || 0);
    return { amount: qty * rate };
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Txn Type</span>,
      dataIndex: "transactionType",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Date</span>,
      dataIndex: "transactionDate",
      width: 110,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Lot / Property</span>,
      dataIndex: "lotDescription",
      width: 220,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Ref No</span>,
      dataIndex: "refNumber",
      width: 130,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Qty (g)</span>,
      dataIndex: "quantity",
      width: 90,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Rate / g (₹)</span>,
      dataIndex: "ratePerGram",
      width: 130,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Amount (₹)</span>,
      dataIndex: "amount",
      width: 150,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 110,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue({
                ...record,
                transactionDate: record.transactionDate ? dayjs(record.transactionDate) : undefined,
              });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              editForm.setFieldsValue({
                ...record,
                transactionDate: record.transactionDate ? dayjs(record.transactionDate) : undefined,
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
    const headers = [
      "Transaction Type",
      "Transaction Date",
      "Lot Description",
      "Ref Number",
      "Seller Name",
      "Seller Address",
      "Broker Name",
      "Broker Address",
      "Interest Rate",
      "Interest Type",
      "Interest Payment",
      "Quantity",
      "Rate Per Gram",
      "Amount",
      "Narration",
    ];
    const rows = data.map((r) => [
      r.transactionType,
      r.transactionDate,
      r.lotDescription,
      r.refNumber,
      r.sellerName,
      r.sellerAddress,
      r.brokerName,
      r.brokerAddress,
      r.interestRate,
      r.interestType,
      r.interestPayment,
      r.quantity,
      r.ratePerGram,
      r.amount,
      (r.narration || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `silver_records_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Silver Transaction</h6>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Transaction Type</span>}
            name="transactionType"
            rules={[{ required: true }]}
            initialValue={txnTypes?.[2] ?? "Investment"}
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
            label={<span className="text-amber-700">Transaction Date</span>}
            name="transactionDate"
            rules={[{ required: true, message: "Select date" }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Lot Description </span>}
            name="lotDescription"
            rules={[{ required: true, message: "Enter or select lot" }]}
          >
            <Select
              showSearch
              placeholder="Select or type"
              disabled={disabled}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {SAMPLE_ASSETS.map((a) => (
                <Option key={a} value={a}>
                  {a}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Ref Number</span>} name="refNumber">
            <Input placeholder="Reference number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Seller Name</span>} name="sellerName">
            <Input placeholder="Seller / Bank / Vendor" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Seller Address</span>} name="sellerAddress">
            <Input placeholder="Seller address" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Broker Name</span>} name="brokerName">
            <Input placeholder="Broker name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Broker Address</span>} name="brokerAddress">
            <Input placeholder="Broker address" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Interest Rate (%)</span>} name="interestRate">
            <InputNumber className="w-full" min={0} step={0.01} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Interest Type</span>} name="interestType" initialValue={interestTypes[0]}>
            <Select disabled={disabled}>
              {interestTypes.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Interest Payment</span>} name="interestPayment" initialValue={interestPayments[3]}>
            <Select disabled={disabled}>
              {interestPayments.map((p) => (
                <Option key={p} value={p}>
                  {p}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Quantity (g)</span>}
            name="quantity"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Rate Per Gram (₹)</span>}
            name="ratePerGram"
            rules={[{ required: true, message: "Enter rate per gram" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Amount (₹)</span>} name="amount">
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Narration</span>} name="narration">
            <Input placeholder="Optional notes" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // txnTypes variable used in form initialValue


  return (
    <div>
      {/* Top controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search by lot, ref, seller, broker or narration..."
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
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Silver Transactions</h2>
        <p className="text-amber-600 mb-3">Track buying, selling, and valuation of silver investments</p>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} scroll={{ y: 300 }}/>
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add Silver Transaction</span>}
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
          onFinish={(values) => {
            const calcs = computeAmount(values);
            const payload = {
              ...values,
              ...calcs,
              key: data.length ? Math.max(...data.map((d) => d.key)) + 1 : 1,
              transactionDate: values.transactionDate ? dayjs(values.transactionDate).format("YYYY-MM-DD") : undefined,
            };
            setData((prev) => [payload, ...prev]);
            setIsAddModalOpen(false);
            addForm.resetFields();
            message.success("Record added.");
          }}
          onValuesChange={(changed, allValues) => {
            const calcs = computeAmount(allValues);
            addForm.setFieldsValue(calcs);
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
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Silver Transaction</span>}
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
          onFinish={(values) => {
            const calcs = computeAmount(values);
            const payload = {
              ...selectedRecord,
              ...values,
              ...calcs,
              transactionDate: values.transactionDate ? dayjs(values.transactionDate).format("YYYY-MM-DD") : selectedRecord.transactionDate,
            };
            setData((prev) => prev.map((d) => (d.key === payload.key ? payload : d)));
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedRecord(null);
            message.success("Record updated.");
          }}
          onValuesChange={(changed, allValues) => {
            const calcs = computeAmount(allValues);
            editForm.setFieldsValue(calcs);
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
         title={<span className="text-amber-700 text-2xl font-semibold">View Silver Transaction</span>}
       
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

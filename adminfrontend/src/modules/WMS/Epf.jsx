// Epf.jsx
import React, { useState, useEffect } from "react";
import {
  addWealthEntry,
  getWealthEntries,
  getWealthEntryById,
  updateWealthEntry,
} from "../../api/wealth";
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
  "Fixed Deposit - Bank A",
  "Corporate Deposit X",
  "Government Bond Y",
];

export default function Epf() {
  const [data, setData] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const fetchData = async () => {
    try {
      const response = await getWealthEntries({ asset_category: "EPF" });
      const mappedData = response.map((item) => ({
        key: item.id,
        transactionType:
          item.transaction_type === "DEPOSIT"
            ? "Investment"
            : item.transaction_type.charAt(0).toUpperCase() +
              item.transaction_type.slice(1).toLowerCase(),
        assetName: item.asset_name,
        refNumber: item.ref_number,
        bankSellerName: item.bank_or_seller_name,
        bankSellerAddress: item.address,
        brokerName: item.broker_name,
        brokerAddress: item.broker_address,
        interestRate: item.interest_rate,
        interestType: item.interest_type,
        interestPayment: item.interest_payment,
        maturityDate: item.maturity_date,
        lockInPeriod: item.lock_in_period,
        transactionDate: item.transaction_date,
        amount: item.amount,
        narration: item.narration,
      }));
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching EPF entries:", error);
      message.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const txnTypes = [
    "Interest",
    "Interest (payout)",
    "Investment",
    "Withdrawal",
  ];
  const interestTypes = ["Cumulative", "Payout"];
  const interestPayments = ["Monthly", "Quarterly", "Half Yearly", "Yearly"];

  const formatValue = (value) => {
    if (!value) return "";

    // handle dayjs objects
    if (dayjs.isDayjs(value)) {
      return value.format("YYYY-MM-DD");
    }

    // handle date strings
    if (typeof value === "string" && dayjs(value).isValid()) {
      return dayjs(value).format("YYYY-MM-DD");
    }

    return value.toString();
  };

  const filteredData = data.filter((row) =>
    Object.entries(row).some(([key, value]) => {
      if (key === "key") return false; // skip internal key

      return formatValue(value)
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());
    }),
  );

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
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : ""}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "assetName",
      width: 240,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Ref No</span>,
      dataIndex: "refNumber",
      width: 130,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Interest Rate (%)</span>
      ),
      dataIndex: "interestRate",
      width: 150,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Payment</span>,
      dataIndex: "interestPayment",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Amount (₹)</span>,
      dataIndex: "amount",
      width: 140,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 110,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={async () => {
              setSelectedRecord(record);
              try {
                const data = await getWealthEntryById(record.key);
                const mappedData = {
                  transactionType:
                    data.transaction_type === "DEPOSIT"
                      ? "Investment"
                      : data.transaction_type.charAt(0).toUpperCase() +
                        data.transaction_type.slice(1).toLowerCase(),
                  assetName: data.asset_name,
                  refNumber: data.ref_number,
                  bankSellerName: data.bank_or_seller_name,
                  bankSellerAddress: data.address,
                  brokerName: data.broker_name,
                  brokerAddress: data.broker_address,
                  interestRate: data.interest_rate,
                  interestType: data.interest_type,
                  interestPayment: data.interest_payment,
                  maturityDate: data.maturity_date
                    ? dayjs(data.maturity_date)
                    : undefined,
                  lockInPeriod: data.lock_in_period,
                  transactionDate: data.transaction_date
                    ? dayjs(data.transaction_date)
                    : undefined,
                  amount: data.amount,
                  narration: data.narration,
                };
                viewForm.setFieldsValue(mappedData);
                setIsViewModalOpen(true);
              } catch (error) {
                console.error("Error fetching EPF details:", error);
                message.error("Failed to load details.");
              }
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={async () => {
              setSelectedRecord(record);
              try {
                const data = await getWealthEntryById(record.key);
                const mappedData = {
                  transactionType:
                    data.transaction_type === "DEPOSIT"
                      ? "Investment"
                      : data.transaction_type.charAt(0).toUpperCase() +
                        data.transaction_type.slice(1).toLowerCase(),
                  assetName: data.asset_name,
                  refNumber: data.ref_number,
                  bankSellerName: data.bank_or_seller_name,
                  bankSellerAddress: data.address,
                  brokerName: data.broker_name,
                  brokerAddress: data.broker_address,
                  interestRate: data.interest_rate,
                  interestType: data.interest_type,
                  interestPayment: data.interest_payment,
                  maturityDate: data.maturity_date
                    ? dayjs(data.maturity_date)
                    : undefined,
                  lockInPeriod: data.lock_in_period,
                  transactionDate: data.transaction_date
                    ? dayjs(data.transaction_date)
                    : undefined,
                  amount: data.amount,
                  narration: data.narration,
                };
                editForm.setFieldsValue(mappedData);
                setIsEditModalOpen(true);
              } catch (error) {
                console.error("Error loading for edit:", error);
                message.error("Failed to load details for editing.");
              }
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
      "Asset Name",
      "Ref Number",
      "Bank/Seller Name",
      "Bank/Seller Address",
      "Broker Name",
      "Broker Address",
      "Interest Rate",
      "Interest Type",
      "Interest Payment",
      "Maturity Date",
      "Lockin Period",
      "Amount",
      "Narration",
    ];
    const rows = data.map((r) => [
      r.transactionType,
      r.transactionDate,
      r.assetName,
      r.refNumber,
      r.bankSellerName,
      r.bankSellerAddress,
      r.brokerName,
      r.brokerAddress,
      r.interestRate,
      r.interestType,
      r.interestPayment,
      r.maturityDate,
      r.lockInPeriod,
      r.amount,
      (r.narration || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deposits_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Deposit / Interest Details</h6>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Transaction Type</span>}
            name="transactionType"
            rules={[{ required: true, message: "Select transaction type" }]}
            initialValue={txnTypes[2] || "Investment"}
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
            label={<span className="text-amber-700">Asset Name</span>}
            name="assetName"
            rules={[{ required: true, message: "Select or enter asset" }]}
          >
            <Select
              showSearch
              placeholder="Select or type asset"
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
          <Form.Item
            label={<span className="text-amber-700">Ref Number</span>}
            name="refNumber"
          >
            <Input placeholder="Reference number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Bank / Seller Name</span>}
            name="bankSellerName"
          >
            <Input placeholder="Bank or seller name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Address</span>}
            name="bankSellerAddress"
          >
            <Input placeholder="Address" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Broker Name</span>}
            name="brokerName"
          >
            <Input placeholder="Broker name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Broker Address</span>}
            name="brokerAddress"
          >
            <Input placeholder="Broker address" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Interest Rate (%)</span>}
            name="interestRate"
          >
            <InputNumber
              className="w-full"
              min={0}
              step={0.01}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Interest Type</span>}
            name="interestType"
            initialValue={interestTypes[0]}
          >
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
          <Form.Item
            label={<span className="text-amber-700">Interest Payment</span>}
            name="interestPayment"
            initialValue={interestPayments[3]}
          >
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
            label={<span className="text-amber-700">Maturity Date</span>}
            name="maturityDate"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Lockin Period</span>}
            name="lockInPeriod"
          >
            <Input placeholder="e.g. 6 months / 1 year" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Amount (₹)</span>}
            name="amount"
            rules={[{ required: true, message: "Enter amount" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Narration</span>}
            name="narration"
          >
            <Input placeholder="Optional notes" disabled={disabled} />
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
            placeholder="Search by asset, ref, bank, broker or narration..."
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
          <Button
            icon={<DownloadOutlined />}
            onClick={exportCSV}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
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
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          EPF Transactions
        </h2>
        <p className="text-amber-600 mb-3">
          Monitor employee provident fund contributions and growth
        </p>
        <Table
          columns={columns}
          scroll={{ y: 300 }}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add EPF Transaction
          </span>
        }
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
                asset_category: "EPF",
                transaction_type:
                  values.transactionType === "Investment"
                    ? "DEPOSIT"
                    : values.transactionType.toUpperCase(),
                transaction_date: values.transactionDate
                  ? dayjs(values.transactionDate).format("YYYY-MM-DD")
                  : null,
                asset_name: values.assetName,

                ref_number: values.refNumber,
                bank_or_seller_name: values.bankSellerName,
                address: values.bankSellerAddress,

                broker_name: values.brokerName,
                broker_address: values.brokerAddress,

                amount: Number(values.amount || 0).toFixed(2),
                interest_rate: values.interestRate,
                interest_type: values.interestType,
                interest_payment: values.interestPayment,

                maturity_date: values.maturityDate
                  ? dayjs(values.maturityDate).format("YYYY-MM-DD")
                  : null,
                lock_in_period: values.lockInPeriod,
                narration: values.narration,
              };

              await addWealthEntry(payload);

              setIsAddModalOpen(false);
              addForm.resetFields();
              message.success("Record added successfully.");
              fetchData();
            } catch (error) {
              console.error("Error adding wealth entry:", error);
              message.error("Failed to add record.");
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
            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              htmlType="submit"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit EPF Transaction
          </span>
        }
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
                asset_category: "EPF",
                transaction_type:
                  values.transactionType === "Investment"
                    ? "DEPOSIT"
                    : values.transactionType.toUpperCase(),
                transaction_date: values.transactionDate
                  ? dayjs(values.transactionDate).format("YYYY-MM-DD")
                  : null,
                asset_name: values.assetName,

                ref_number: values.refNumber,
                bank_or_seller_name: values.bankSellerName,
                address: values.bankSellerAddress,

                broker_name: values.brokerName,
                broker_address: values.brokerAddress,

                amount: Number(values.amount || 0).toFixed(2),
                interest_rate: values.interestRate,
                interest_type: values.interestType,
                interest_payment: values.interestPayment,

                maturity_date: values.maturityDate
                  ? dayjs(values.maturityDate).format("YYYY-MM-DD")
                  : null,
                lock_in_period: values.lockInPeriod,
                narration: values.narration,
              };

              await updateWealthEntry(selectedRecord.key, payload);

              setIsEditModalOpen(false);
              editForm.resetFields();
              setSelectedRecord(null);
              message.success("Record updated successfully.");
              fetchData();
            } catch (error) {
              console.error("Error updating wealth entry:", error);
              message.error("Failed to update record.");
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
            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              htmlType="submit"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View EPF Transaction Details
          </span>
        }
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

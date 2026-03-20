// Privatequity.jsx
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
  "PrivateCo Series A",
  "Growth Fund II",
  "Startup Equity Pool",
];

export default function Privatequity() {
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
      const response = await getWealthEntries({
        asset_category: "PRIVATE_EQUITY",
      });
      const mappedData = response.map((item) => ({
        key: item.id,
        transactionType:
          item.transaction_type === "INVESTMENT"
            ? "Subscription"
            : item.transaction_type.charAt(0).toUpperCase() +
              item.transaction_type.slice(1).toLowerCase(),
        assetName: item.asset_name,
        refNumber: item.ref_number,
        insuranceCompany: item.insurance_company_name,
        insuranceAddress: item.insurance_company_address,
        brokerName: item.broker_name,
        brokerAddress: item.broker_address,
        date: item.transaction_date,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        narration: item.narration,
      }));
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching Private Equity entries:", error);
      message.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const txnTypes = ["Subscription", "Redemption", "Transfer"];

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
      if (key === "key") return false;

      return formatValue(value)
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());
    }),
  );

  const computeAmounts = (values) => {
    const qty = Number(values.quantity || 0);
    const rate = Number(values.rate || 0);
    const amount = qty * rate;
    return { amount };
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
      dataIndex: "date",
      width: 120,
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : ""}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "assetName",
      width: 220,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Ref No</span>,
      dataIndex: "refNumber",
      width: 130,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Qty</span>,
    //   dataIndex: "quantity",
    //   width: 90,
    //   render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Rate (₹)</span>,
      dataIndex: "rate",
      width: 110,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Amount (₹)</span>,
    //   dataIndex: "amount",
    //   width: 140,
    //   render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    // },
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
                    data.transaction_type === "INVESTMENT"
                      ? "Subscription"
                      : data.transaction_type.charAt(0).toUpperCase() +
                        data.transaction_type.slice(1).toLowerCase(),
                  assetName: data.asset_name,
                  refNumber: data.ref_number,
                  insuranceCompany: data.insurance_company_name,
                  insuranceAddress: data.insurance_company_address,
                  brokerName: data.broker_name,
                  brokerAddress: data.broker_address,
                  date: data.transaction_date
                    ? dayjs(data.transaction_date)
                    : undefined,
                  quantity: data.quantity,
                  rate: data.rate,
                  amount: data.amount,
                  narration: data.narration,
                };
                viewForm.setFieldsValue(mappedData);
                setIsViewModalOpen(true);
              } catch (error) {
                console.error("Error fetching Private Equity details:", error);
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
                    data.transaction_type === "INVESTMENT"
                      ? "Subscription"
                      : data.transaction_type.charAt(0).toUpperCase() +
                        data.transaction_type.slice(1).toLowerCase(),
                  assetName: data.asset_name,
                  refNumber: data.ref_number,
                  insuranceCompany: data.insurance_company_name,
                  insuranceAddress: data.insurance_company_address,
                  brokerName: data.broker_name,
                  brokerAddress: data.broker_address,
                  date: data.transaction_date
                    ? dayjs(data.transaction_date)
                    : undefined,
                  quantity: data.quantity,
                  rate: data.rate,
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
      "Date",
      "Asset Name",
      "Ref Number",
      "Insurance Company",
      "Insurance Address",
      "Broker Name",
      "Broker Address",
      "Quantity",
      "Rate",
      "Amount",
      "Narration",
    ];
    const rows = data.map((r) => [
      r.transactionType,
      r.date,
      r.assetName,
      r.refNumber,
      r.insuranceCompany,
      r.insuranceAddress,
      r.brokerName,
      r.brokerAddress,
      r.quantity,
      r.rate,
      r.amount,
      (r.narration || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((e) =>
        e.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privatequity_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Private Equity / Asset Transaction</h6>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Transaction Type</span>}
            name="transactionType"
            rules={[{ required: true, message: "Select transaction type" }]}
            initialValue={txnTypes[0] || "Subscription"}
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
            label={<span className="text-amber-700">Asset Name</span>}
            name="assetName"
            rules={[{ required: true, message: "Select or type asset" }]}
          >
            <Select
              showSearch
              placeholder="Select or type asset"
              optionFilterProp="children"
              disabled={disabled}
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
            <Input
              placeholder="Reference / agreement no."
              disabled={disabled}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={
              <span className="text-amber-700">Insurance Company Name</span>
            }
            name="insuranceCompany"
          >
            <Input
              placeholder="Insurance company (if any)"
              disabled={disabled}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Insurance Address</span>}
            name="insuranceAddress"
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
            <Input placeholder="Broker / agent name" disabled={disabled} />
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

        {/* <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Quantity</span>}
            name="quantity"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col> */}
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Rate (₹)</span>}
            name="rate"
            rules={[{ required: true, message: "Enter rate" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Amount (₹)</span>}
            name="amount"
          >
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col> */}

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
            placeholder="Search by asset, ref, broker or narration..."
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
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            icon={<DownloadOutlined />}
            onClick={exportCSV}
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
          Private Equity Holdings
        </h2>
        <p className="text-amber-600 mb-3">
          Track unlisted investments and capital movements
        </p>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 300 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add Private Equity Transaction
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
              const calcs = computeAmounts(values);
              const payload = {
                asset_category: "PRIVATE_EQUITY",
                transaction_type:
                  values.transactionType === "Subscription"
                    ? "INVESTMENT"
                    : values.transactionType.toUpperCase(),
                transaction_date: values.date
                  ? dayjs(values.date).format("YYYY-MM-DD")
                  : null,
                asset_name: values.assetName,

                ref_number: values.refNumber,
                insurance_company_name: values.insuranceCompany,
                insurance_company_address: values.insuranceAddress,

                broker_name: values.brokerName,
                broker_address: values.brokerAddress,

                amount: Number(calcs.amount || 0).toFixed(2),
                rate: Number(values.rate || 0),
                quantity: Number(values.quantity || 0),
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
          onValuesChange={(changed, allValues) => {
            const calcs = computeAmounts(allValues);
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
            Edit Private Equity Transaction
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
              const calcs = computeAmounts(values);
              const payload = {
                asset_category: "PRIVATE_EQUITY",
                transaction_type:
                  values.transactionType === "Subscription"
                    ? "INVESTMENT"
                    : values.transactionType.toUpperCase(),
                transaction_date: values.date
                  ? dayjs(values.date).format("YYYY-MM-DD")
                  : null,
                asset_name: values.assetName,

                ref_number: values.refNumber,
                insurance_company_name: values.insuranceCompany,
                insurance_company_address: values.insuranceAddress,

                broker_name: values.brokerName,
                broker_address: values.brokerAddress,

                amount: Number(calcs.amount || 0).toFixed(2),
                rate: Number(values.rate || 0),
                quantity: Number(values.quantity || 0),
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
          onValuesChange={(changed, allValues) => {
            const calcs = computeAmounts(allValues);
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
            {" "}
            View Private Equity Transaction
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

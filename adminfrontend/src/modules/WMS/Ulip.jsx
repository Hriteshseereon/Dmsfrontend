// Nps.jsx
import React, { useState, useEffect } from "react";
import { addWealthEntry, getWealthEntries, getWealthEntryById, updateWealthEntry } from "../../api/wealth";
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
const PREMIUM_MODES = ["Monthly", "Yearly", "5yrs"];
const SAMPLE_ASSETS = ["Asset A", "Asset B", "Asset C", "New Plan"];

export default function Ulip() {
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
      const response = await getWealthEntries({ asset_category: "ULIP" });
      const mappedData = response.map((item) => ({
        key: item.id,
        transactionType: item.transaction_type === "PURCHASE" ? "New" : (item.transaction_type.charAt(0).toUpperCase() + item.transaction_type.slice(1).toLowerCase()),
        planScheme: item.asset_name,
        policyNumber: item.policy_number,
        insuranceCompany: item.insurance_company_name,
        insuranceAddress: item.insurance_company_address,
        brokerName: item.broker_name,
        brokerAddress: item.broker_address,
        firstPremium: item.first_premium,
        date: item.transaction_date,
        policyDetails: item.policy_details,
        premiumMode: item.premium_mode,
        nextPremiumDueDate: item.next_premium_due_date,
        nextPremiumAmount: item.next_premium_amount,
        term: item.term_years,
        maturityDate: item.maturity_date,
        premiumTerms: item.premium_terms,
        lockInPeriod: item.lock_in_period,
        insuredName: item.insured_name,
        nominee: item.nominee,
        sumAssured: item.sum_assured,
        narration: item.narration,
      }));
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching ULIP entries:", error);
      message.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((row) =>
    [
      "transactionType",
      "planScheme",
      "assetSelected",
      "policyNumber",
      "insuranceCompany",
      "insuredName",
      "nominee",
      "narration",
    ].some((f) =>
      (row[f] || "").toString().toLowerCase().includes(searchText.trim().toLowerCase())
    )
  );

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Txn Type</span>,
      dataIndex: "transactionType",
      width: 110,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plan / Scheme</span>,
      dataIndex: "planScheme",
      width: 180,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Policy No</span>,
      dataIndex: "policyNumber",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Insurer</span>,
      dataIndex: "insuranceCompany",
      width: 180,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">First Premium (₹)</span>,
      dataIndex: "firstPremium",
      width: 140,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Premium Mode</span>,
      dataIndex: "premiumMode",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Sum Assured (₹)</span>,
      dataIndex: "sumAssured",
      width: 150,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Maturity Date</span>,
      dataIndex: "maturityDate",
      width: 140,
      render: (d) => <span className="text-amber-800">{d || "-"}</span>,
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
                  transactionType: data.transaction_type === "PURCHASE" ? "New" : (data.transaction_type.charAt(0).toUpperCase() + data.transaction_type.slice(1).toLowerCase()),
                  planScheme: data.asset_name,
                  policyNumber: data.policy_number,
                  insuranceCompany: data.insurance_company_name,
                  insuranceAddress: data.insurance_company_address,
                  brokerName: data.broker_name,
                  brokerAddress: data.broker_address,
                  firstPremium: data.first_premium,
                  date: data.transaction_date ? dayjs(data.transaction_date) : undefined,
                  policyDetails: data.policy_details,
                  premiumMode: data.premium_mode,
                  nextPremiumDueDate: data.next_premium_due_date ? dayjs(data.next_premium_due_date) : undefined,
                  nextPremiumAmount: data.next_premium_amount,
                  term: data.term_years,
                  maturityDate: data.maturity_date ? dayjs(data.maturity_date) : undefined,
                  premiumTerms: data.premium_terms,
                  lockInPeriod: data.lock_in_period,
                  insuredName: data.insured_name,
                  nominee: data.nominee,
                  sumAssured: data.sum_assured,
                  narration: data.narration,
                };
                viewForm.setFieldsValue(mappedData);
                setIsViewModalOpen(true);
              } catch (error) {
                console.error("Error fetching ULIP details:", error);
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
                  transactionType: data.transaction_type === "PURCHASE" ? "New" : (data.transaction_type.charAt(0).toUpperCase() + data.transaction_type.slice(1).toLowerCase()),
                  planScheme: data.asset_name,
                  policyNumber: data.policy_number,
                  insuranceCompany: data.insurance_company_name,
                  insuranceAddress: data.insurance_company_address,
                  brokerName: data.broker_name,
                  brokerAddress: data.broker_address,
                  firstPremium: data.first_premium,
                  date: data.transaction_date ? dayjs(data.transaction_date) : undefined,
                  policyDetails: data.policy_details,
                  premiumMode: data.premium_mode,
                  nextPremiumDueDate: data.next_premium_due_date ? dayjs(data.next_premium_due_date) : undefined,
                  nextPremiumAmount: data.next_premium_amount,
                  term: data.term_years,
                  maturityDate: data.maturity_date ? dayjs(data.maturity_date) : undefined,
                  premiumTerms: data.premium_terms,
                  lockInPeriod: data.lock_in_period,
                  insuredName: data.insured_name,
                  nominee: data.nominee,
                  sumAssured: data.sum_assured,
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
      "Plan/Scheme",
      "Asset Selected",
      "Policy No",
      "Insurance Company",
      "First Premium",
      "Date",
      "Premium Mode",
      "Next Premium Due Date",
      "Next Premium Amount",
      "Term",
      "Maturity Date",
      "Lock-In Period",
      "Insured Name",
      "Nominee",
      "Sum Assured",
      "Narration",
    ];
    const rows = data.map((r) => [
      r.transactionType,
      r.planScheme,
      r.assetSelected,
      r.policyNumber,
      r.insuranceCompany,
      r.firstPremium,
      r.date,
      r.premiumMode,
      r.nextPremiumDueDate,
      r.nextPremiumAmount,
      r.term,
      r.maturityDate,
      r.lockInPeriod,
      r.insuredName,
      r.nominee,
      r.sumAssured,
      (r.narration || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nps_records_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Policy / Plan Details</h6>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Transaction Type</span>}
            name="transactionType"
            rules={[{ required: true }]}
            initialValue="Deposit"
          >
            <Select disabled={disabled}>
              <Option value="Deposit">Deposit</Option>
              <Option value="Withdrawal">Withdrawal</Option>
              <Option value="OD">OD</Option>
              <Option value="New">New</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item
            label={<span className="text-amber-700">Plan / Scheme / New Asset</span>}
            name="planScheme"
            rules={[{ required: true, message: "Enter Plan / Scheme" }]}
          >
            <Select
              showSearch
              placeholder="Select or type plan/scheme"
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

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Policy Number</span>} name="policyNumber">
            <Input placeholder="Policy / Policy No" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Insurance Company Name</span>} name="insuranceCompany">
            <Input placeholder="Insurance company" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Insurance Company Address</span>} name="insuranceAddress">
            <Input placeholder="Company address" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Broker Name</span>} name="brokerName">
            <Input placeholder="Broker name" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={<span className="text-amber-700">Broker Address</span>} name="brokerAddress">
            <Input placeholder="Broker address" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">First Premium (₹)</span>} name="firstPremium">
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Date</span>} name="date">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Policy Details</span>} name="policyDetails">
            <Input placeholder="Policy notes" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Premium Mode</span>} name="premiumMode" initialValue={PREMIUM_MODES[0]}>
            <Select disabled={disabled}>
              {PREMIUM_MODES.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Next Premium Due Date</span>} name="nextPremiumDueDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Next Premium Amount (₹)</span>} name="nextPremiumAmount">
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Term (yrs)</span>} name="term">
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Maturity Date</span>} name="maturityDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Premium Terms</span>} name="premiumTerms">
            <Input placeholder="e.g. Level premium" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Lock-In Period</span>} name="lockInPeriod">
            <Input placeholder="e.g. 5 years" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Insured Name</span>} name="insuredName">
            <Input placeholder="Insured person name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Nominee</span>} name="nominee">
            <Input placeholder="Nominee name" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Sum Assured (₹)</span>} name="sumAssured">
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={16}>
          <Form.Item label={<span className="text-amber-700">Narration</span>} name="narration">
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
            placeholder="Search by policy, insurer, insured or remarks..."
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
        <h2 className="text-lg font-semibold text-amber-700 mb-0">ULIP Investments</h2>
        <p className="text-amber-600 mb-3">Manage insurance-linked investments and fund values</p>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} scroll={{ y: 300 }} />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add ULIP Investment</span>}
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
                asset_category: "ULIP",
                transaction_type: values.transactionType === "New" ? "PURCHASE" : values.transactionType.toUpperCase(),
                asset_name: values.planScheme,
                remarks: "ULIP policy",
                policy_number: values.policyNumber,

                insurance_company_name: values.insuranceCompany,
                insurance_company_address: values.insuranceAddress,

                broker_name: values.brokerName,
                broker_address: values.brokerAddress,

                first_premium: Number(values.firstPremium || 0).toFixed(2),
                transaction_date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,

                policy_details: values.policyDetails,
                premium_mode: values.premiumMode,
                next_premium_due_date: values.nextPremiumDueDate ? dayjs(values.nextPremiumDueDate).format("YYYY-MM-DD") : null,
                next_premium_amount: Number(values.nextPremiumAmount || 0).toFixed(2),

                term_years: values.term,
                maturity_date: values.maturityDate ? dayjs(values.maturityDate).format("YYYY-MM-DD") : null,
                premium_terms: values.premiumTerms,

                lock_in_period: values.lockInPeriod,
                insured_name: values.insuredName,
                nominee: values.nominee,

                sum_assured: Number(values.sumAssured || 0).toFixed(2),
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
            <Button type="primary" className="bg-amber-500! hover:bg-amber-600! border-none!" htmlType="submit">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit ULIP Investment</span>}
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
                asset_category: "ULIP",
                transaction_type: values.transactionType === "New" ? "PURCHASE" : values.transactionType.toUpperCase(),
                asset_name: values.planScheme,
                remarks: "ULIP policy",
                policy_number: values.policyNumber,

                insurance_company_name: values.insuranceCompany,
                insurance_company_address: values.insuranceAddress,

                broker_name: values.brokerName,
                broker_address: values.brokerAddress,

                first_premium: Number(values.firstPremium || 0).toFixed(2),
                transaction_date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,

                policy_details: values.policyDetails,
                premium_mode: values.premiumMode,
                next_premium_due_date: values.nextPremiumDueDate ? dayjs(values.nextPremiumDueDate).format("YYYY-MM-DD") : null,
                next_premium_amount: Number(values.nextPremiumAmount || 0).toFixed(2),

                term_years: values.term,
                maturity_date: values.maturityDate ? dayjs(values.maturityDate).format("YYYY-MM-DD") : null,
                premium_terms: values.premiumTerms,

                lock_in_period: values.lockInPeriod,
                insured_name: values.insuredName,
                nominee: values.nominee,

                sum_assured: Number(values.sumAssured || 0).toFixed(2),
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
            <Button type="primary" className="bg-amber-500! hover:bg-amber-600! border-none!" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">View ULIP Investment Details</span>}
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

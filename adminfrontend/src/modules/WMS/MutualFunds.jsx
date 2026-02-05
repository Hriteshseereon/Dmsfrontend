// MutualFunds.jsx
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
import { createWms, getWms, updateWms } from "../../api/wms"; 
import { useEffect } from "react";


const { Option } = Select;
const MF_OPTIONS = [
  "HDFC Top 100",
  "ICICI Prudential Bluechip",
  "Axis Long Term Equity",
  "SBI Magnum Midcap",
  "Nippon India Small Cap",
  "Aditya Birla Sun Life Flexi Cap",
];

export default function MutualFunds() {
 const [data, setData] = useState([]);


  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();


  useEffect(() => {
  fetchMutualFunds();
}, []);

const fetchMutualFunds = async () => {
  try {
    const res = await getWms();

    const list = res.results ?? res;

    const mfOnly = list.filter(
      (item) => item.asset_category === "MUTUAL_FUND"
    );

    setData(
      mfOnly.map((item) => ({
        ...item,
        key: item.id,
      }))
    );
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    message.error("Failed to load mutual fund transactions");
  }
};


  const filteredData = data.filter((row) =>
    ["transactionType", "mfName", "folioNo", "agentName", "remarks"].some((f) =>
      (row[f] || "")
        .toString()
        .toLowerCase()
        .includes(searchText.trim().toLowerCase())
    )
  );

  const computeAmounts = (values) => {
    const qty = Number(values.quantity || 0);
    const nav = Number(values.nav || 0);
    const stampCharges = Number(values.stampCharges || 0);
    const netAmount = qty * nav;
    const grossAmount = netAmount + stampCharges;
    return { netAmount, grossAmount };
  };

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
      width: 110,
      render: (d) => <span className="text-amber-800">{d ? dayjs(d).format("YYYY-MM-DD") : ""}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">MF Name</span>,
      dataIndex: "asset_name",
      width: 220,
      render: (m) => <span className="text-amber-800">{m}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Folio No</span>,
      dataIndex: "folio_no",
      width: 140,
      render: (f) => <span className="text-amber-800">{f}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Type</span>,
      dataIndex: "mf_type",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Quantity</span>,
      dataIndex: "quantity",
      width: 120,
      render: (q) => <span className="text-amber-800">{q ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">NAV (₹)</span>,
      dataIndex: "nav",
      width: 120,
      render: (n) => <span className="text-amber-800">{n ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Net Amount (₹)</span>,
      dataIndex: "net_amount",
      width: 140,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Gross Amount (₹)</span>,
      dataIndex: "gross_amount",
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
                date: record.date ? dayjs(record.date) : undefined,
                lockInDate: record.lockInDate ? dayjs(record.lockInDate) : undefined,
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
    date: record.transaction_date ? dayjs(record.transaction_date) : null,
    mfName: record.asset_name,
    folioNo: record.folio_no,
    type: record.mf_type,
    lockInDate: record.lock_in_date
      ? dayjs(record.lock_in_date)
      : null,

    agentName: record.agent_name,
    agentAddress: record.agent_address,

    quantity: record.quantity,
    nav: record.nav,
    netAmount: record.net_amount,
    stampCharges: record.stamp_charges,
    grossAmount: record.gross_amount,
    remarks: record.remarks,
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
      "Date",
      "MF Name",
      "Folio No",
      "Type",
      "Lock In Date",
      "Agent Name",
      "Agent Address",
      "Quantity",
      "NAV",
      "Net Amount",
      "Stamp Charges",
      "Gross Amount",
      "Remarks",
    ];
    const rows = data.map((r) => [
      r.transactionType,
      r.date,
      r.mfName,
      r.folioNo,
      r.type,
      r.lockInDate || "",
      r.agentName,
      r.agentAddress,
      r.quantity,
      r.nav,
      r.netAmount,
      r.stampCharges,
      r.grossAmount,
      (r.remarks || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent =
      [headers, ...rows]
        .map((e) => e.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mutual_funds_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Transaction Details</h6>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Transaction Type</span>}
            name="transactionType"
            rules={[{ required: true, message: "Select transaction type" }]}
            initialValue="Purchase"
          >
            <Select disabled={disabled} placeholder="Purchase / Redemption">
              <Option value="Purchase">Purchase</Option>
              <Option value="Redemption">Redemption</Option>
              <Option value="Switch">SWITCH</Option>
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
            label={<span className="text-amber-700">MF Asset Name</span>}
            name="mfName"
            rules={[{ required: true, message: "Select MF" }]}
          >
            <Select
              showSearch
              placeholder="Search MF..."
              optionFilterProp="children"
              disabled={disabled}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {MF_OPTIONS.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Folio No</span>} name="folioNo">
            <Input placeholder="Folio number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label={<span className="text-amber-700">Type</span>}
            name="type"
            initialValue="Equity"
          >
            <Select disabled={disabled}>
              <Option value="Equity">Equity</Option>
              <Option value="Debt">Debt</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Lock In Period Date</span>} name="lockInDate">
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500">Agent Details</h6>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={<span className="text-amber-700">Agent Name</span>} name="agentName">
            <Input placeholder="Agent / Broker Name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label={<span className="text-amber-700">Agent Address</span>} name="agentAddress">
            <Input placeholder="Agent address" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <h6 className="text-amber-500">Transaction Amounts</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Quantity</span>}
            name="quantity"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">NAV (₹)</span>}
            name="nav"
            rules={[{ required: true, message: "Enter NAV" }]}
          >
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Net Amount (₹)</span>} name="netAmount">
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Stamp Charges (₹)</span>} name="stampCharges">
            <InputNumber className="w-full" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<span className="text-amber-700">Gross Amount (₹)</span>} name="grossAmount">
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={16}>
          <Form.Item label={<span className="text-amber-700">Remarks</span>} name="remarks">
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
            placeholder="Search by MF name, folio, agent or remarks..."
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
          <Button icon={<DownloadOutlined />} onClick={exportCSV}     className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"  onClick={() => {
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
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Mutual Fund Transactions</h2>
        <p className="text-amber-600 mb-3">Monitor investments &fund performance</p>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} scroll={{ y: 300 }} />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add Mutual Fund Transaction</span>}
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
  asset_category: "MUTUAL_FUND",

  transaction_type: values.transactionType?.toUpperCase(),

  transaction_date: values.date
    ? dayjs(values.date).format("YYYY-MM-DD")
    : null,

  asset_name: values.mfName,

  folio_no: values.folioNo,

  mf_type: values.type,

  quantity: values.quantity,

  nav: values.nav,

  net_amount: calcs.netAmount,

  gross_amount: calcs.grossAmount,

  stamp_charges: values.stampCharges,

  agent_name: values.agentName,

  agent_address: values.agentAddress,

  remarks: values.remarks,
};


    const created = await createWms(payload);

    setData((prev) => [
      { ...created, key: created.id },
      ...prev,
    ]);

    setIsAddModalOpen(false);
    addForm.resetFields();
    message.success("Transaction added.");
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    message.error("Failed to add transaction");
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
            <Button type="primary"  className="bg-amber-500! hover:bg-amber-600! border-none!" htmlType="submit">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Mutual Fund Transaction</span>}
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
  asset_category: "MUTUAL_FUND",

  transaction_type: values.transactionType?.toUpperCase(),

  transaction_date: values.date
    ? dayjs(values.date).format("YYYY-MM-DD")
    : null,

  asset_name: values.mfName,

  folio_no: values.folioNo,

  mf_type: values.type,

  quantity: values.quantity,

  nav: values.nav,

  net_amount: calcs.netAmount,

  stamp_charges: values.stampCharges,

  gross_amount: calcs.grossAmount,

  agent_name: values.agentName,

  agent_address: values.agentAddress,

  remarks: values.remarks,
};

    const updated = await updateWms(selectedRecord.id, payload);

    setData((prev) =>
      prev.map((row) =>
        row.id === updated.id
          ? { ...updated, key: updated.id }
          : row
      )
    );

    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedRecord(null);

    message.success("Transaction updated.");
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
         title={<span className="text-amber-700 text-2xl font-semibold">View Mutual Fund Details</span>}
     
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

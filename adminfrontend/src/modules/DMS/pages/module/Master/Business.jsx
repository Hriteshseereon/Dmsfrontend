// Business.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Card,
  DatePicker,
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

import CustomerForm from "./CustomerForm";
import VendorForm from "./VendorForm";
import TransportForm from "./TransportForm";
import BrokerForm from "./BrokerForm";
import InventoryForm from "./InventoryForm";

const { Option } = Select;

// helper to parse date strings into dayjs objects
const parseDateFields = (record) => {
  const dateFields = [
    "tinDate",
    "etDate",
    "cstDate",
    "brokerCommissionSetupDate", 
  ];

  const newRecord = { ...record };

  dateFields.forEach((field) => {
    if (newRecord[field]) {
      newRecord[field] = dayjs(newRecord[field], "DD:MM:YYYY").isValid()
        ? dayjs(newRecord[field], "DD:MM:YYYY")
        : null;
    }
  });

  return newRecord;
};


// sample seed data
const businessDataJSON = [
  {
    key: 1,
    partnerType: "Customer",
    name: "ABC Enterprises",
    branchName: "Mumbai",
    brokerName: "Ravi Traders",
    email: "abc@example.com",
    address: "123 Market Street, Mumbai",
    phoneNo: "9876543210",
    contactPerson: "Rajesh Kumar",
    status: "Active",
    licenseNo: "5567",
    country: "India",
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    pinCode: "400001",
    location: "Market Street",
    type: "Customer",
    mobileNo: "9876543210",
    creditFacility: "Credit Limit",
    securityForCreditFacility: "Bank Guarantee",
  },
  {
    key: 2,
    partnerType: "Vendor",
    shortName: "RSI",
    name: "RUCHI SOYA INDUSTRIES LIMITED",
    address:
      "201, MAHAKOSH HOUSE, 7/5, SOUTH TUKOGANJ, NATH MANDIR ROAD, INDORE-452001",
    phoneNo: "0731-4056012,2513281,82/83,4071109",
    faxNo: "4056019",
    tinNo: "4056019",
    tinDate: "10:01:2025",
    panNo: "4056019",
    gstIn: "4056019",
    etno: "4056019",
    etDate: "10:01:2025",
    cstNo: "4056019",
    cstDate: "10:01:2025",
    tradeNo: "4056019",
    websiteUrl: "http://localhost:3000/login",
    email: "manoj_padtar@gmail.com",
    transactionType: "Super Stockist",
    tranStatus: "Inside",
    igstApplicable: "No",
    state: "Madhya Pradesh",
    location: "Indore",
    status: "Active",
    district: "Indore",
    city: "Indore",
    pinCode: "452001",
    plants: [
      {
        plantName: "Indore Plant",
        address: "7/5, South Tukoganj, Indore",
        phoneNo: "1234567890",
        email: "indoreplant@ruchi.com",
        state: "Madhya Pradesh",
        faxNo: "1234",
        district: "Indore",
        city: "Indore",
        pin: "452001",
      },
    ],
  },
  // You can add sample Transport records here if you want.
].map((record) => parseDateFields(record));
const FORM_CARDS = [
  { type: "Customer", description: "Add customer details" },
  { type: "Vendor", description: "Add vendor information" },
  { type: "Transport", description: "Add transport partner" },
  { type: "Broker", description: "Add broker details" },
];

const FORM_COMPONENTS = {
  Customer: CustomerForm,
  Vendor: VendorForm,
  Transport: TransportForm,
  Broker: BrokerForm,
};

export default function Business() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeForm, setActiveForm] = useState("Customer");
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [data, setData] = useState(businessDataJSON);

  useEffect(() => {
    if (isEditModalOpen && selectedRecord) {
      const recordWithParsedDates = parseDateFields(selectedRecord);
      form.setFieldsValue(recordWithParsedDates);
    } else if (isViewModalOpen && selectedRecord) {
      const recordWithParsedDates = parseDateFields(selectedRecord);
      viewForm.setFieldsValue(recordWithParsedDates);
    } else if (isEditModalOpen && !selectedRecord) {
      form.resetFields();
    }
  }, [isEditModalOpen, isViewModalOpen, selectedRecord, activeForm, form, viewForm]);

  // ================= Table Columns =================
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Partner Type</span>,
      dataIndex: "partnerType",
      width: 120,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Name</span>,
      dataIndex: "name",
      width: 150,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      dataIndex: "email",
      width: 200,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Contact No</span>,
      dataIndex: "phoneNo",
      width: 150,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Active")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              {status}
            </span>
          );
        if (status === "Inactive")
          return (
            <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
          );
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            {status}
          </span>
        );
      },
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
              setActiveForm(record.partnerType);
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              setActiveForm(record.partnerType);
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  // ================= Handle Save =================
  const handleSave = (values) => {
    const formattedValues = { ...values };
    const dateFields = ["tinDate", "etDate", "cstDate", "brokerCommissionSetupDate"];
    dateFields.forEach((field) => {
      if (formattedValues[field] && dayjs.isDayjs(formattedValues[field])) {
        formattedValues[field] = formattedValues[field].format("DD:MM:YYYY");
      }
    });

    const displayName =
      values.name ||
      values.compName ||
      values.registeredName ||
      values.brokerName ||
      values.productName ||
      values.transportName ||
      "N/A";

    const finalValues = {
      ...formattedValues,
      partnerType: activeForm,
      name: displayName,
    };

    if (selectedRecord) {
      // Edit
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key ? { ...item, ...finalValues } : item
        )
      );
    } else {
      // Add
      setData((prev) => [...prev, { key: prev.length + 1, ...finalValues }]);
    }

    setIsEditModalOpen(false);
  };

  // ================= Filtered Data =================
  const filteredData = data.filter((item) => {
    if (item.partnerType !== activeForm) return false;
    const q = searchText.toLowerCase();
    const name = (item.name || item.compName || "").toLowerCase();
    const email = (item.email || "").toLowerCase();
    if (!q) return true;
    return name.includes(q) || email.includes(q);
  });

  const ActiveFormComponent = FORM_COMPONENTS[activeForm] || CustomerForm;

  // ================= Component Render =================
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search by Name or Email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64! border-amber-300!"
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setSearchText("")}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"  >
            Reset Search
          </Button>
          <Select
            value={activeForm}
            onChange={(value) => setActiveForm(value)}
            className="w-40 border-amber-300"
          >
            <Option value="Customer">Customer</Option>
            <Option value="Vendor">Vendor</Option>
            <Option value="Transport">Transport</Option>
            <Option value="Broker">Broker</Option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"   >
            Export
          </Button>
         <Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={() => {
    setSelectedRecord(null);
    setActiveForm(null);   // ⬅ no form selected
    setShowForm(false);    // ⬅ show cards first
    form.resetFields();
    setIsEditModalOpen(true);
  }}
  className="bg-amber-500! hover:bg-amber-600! border-none!"
>
  Add Partner
</Button>

        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Business Partner Master Records
        </h2>
        <p className="text-amber-600 mb-3">
          Showing {activeForm} records. Manage all Customer, Vendor & Transport
          data in one place.
        </p>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: 350 }}
          className="custom-scroll-table"
        />
      </div>

      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            {isViewModalOpen ? "View" : selectedRecord ? "Edit " : "Add Business Partner"}{" "}
            {activeForm}
          </span>
        }
        open={isEditModalOpen || isViewModalOpen}
        onCancel={() => {
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
        setSelectedRecord(null);
        setShowForm(false);
        setActiveForm("Customer");
        form.resetFields();
        viewForm.resetFields();
      }}

        footer={null}
        width={1200}
        
         bodyStyle={{
    height: "80vh",        // ⬅ increases modal body height
    overflowY: "auto",     // ⬅ enables scrolling
    paddingRight: 16,
  }}
      >
{/* CARD SELECTION – only for ADD */}
{!selectedRecord && !isViewModalOpen && !showForm && (
  <Row gutter={16} className="mb-6">
    {FORM_CARDS.map((card) => (
      <Col span={6} key={card.type}>
        <Card
  hoverable
  onClick={() => {
    setActiveForm(card.type);
    setShowForm(true);
    form.resetFields();
  }}
  className="
    group!
    cursor-pointer!
    text-center!
    rounded-xl!
    border!
    border-amber-200!
    bg-gradient-to-br from-amber-50 to-white!
    shadow-sm!
    transition-all!
    duration-300!
    hover:shadow-xl!
    hover:border-amber-400!
    hover:-translate-y-1!
  "
>
  <div className="flex flex-col items-center gap-2 py-6">
    {/* Icon circle */}
    <div
      className="
        flex items-center justify-center
        w-14 h-14
        rounded-full
        bg-amber-100
        text-amber-600
        text-2xl
        font-bold
        transition-all
        duration-300
        group-hover:bg-amber-500
        group-hover:text-white
      "
    >
      {card.type.charAt(0)}
    </div>

    {/* Title */}
    <h3 className="text-lg font-semibold text-amber-800">
      {card.type}
    </h3>

    {/* Description */}
    <p className="text-sm text-amber-600 text-center px-2">
      {card.description}
    </p>
  </div>
  
</Card>

      </Col>
    ))}
  </Row>
  
)}
 {/* tip card design */}
 {/* TIP CARD BELOW PARTNER SELECTION */}
{!selectedRecord && !isViewModalOpen && !showForm && (
  <div className="mt-8 flex justify-center">
    <div className="
      max-w-4xl
      w-full
      bg-amber-50
      border
      border-amber-200
      rounded-xl
      px-6
      py-4
      shadow-sm
    ">
      <h4 className="text-lg font-semibold text-amber-800 mb-1">
        💡 Tip
      </h4>
      <p className="text-base text-amber-700">
        Choose a partner type above to start adding your business partner details.
        You can manage customers, vendors, transporters, and brokers from one place.
      </p>
    </div>
  </div>
)}

{(showForm || selectedRecord || isViewModalOpen) && (
  <Form
    layout="vertical"
    form={isViewModalOpen ? viewForm : form}
    onFinish={handleSave}
    className="max-h-[70vh] overflow-y-auto pr-4 custom-scroll-form"
  >

    {/* BACK BUTTON */}
    {showForm && !selectedRecord && !isViewModalOpen && (
      <div className="mb-4">
        <Button
          type="link"
          onClick={() => {
            setShowForm(false);
            setActiveForm(null);
            form.resetFields();
          }}
          className="text-amber-600! text-2xl px-0!"
        >
          ← Back to Partner Type
        </Button>
      </div>
    )}

    <ActiveFormComponent disabled={isViewModalOpen} />

    {!isViewModalOpen && (
      <div className="flex justify-end gap-2 mt-4">
        <Button
          onClick={() => setIsEditModalOpen(false)}
          className="border-amber-400! text-amber-700!"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className="bg-amber-500!"
        >
          {selectedRecord ? "Update" : "Add"}
        </Button>
      </div>
    )}
  </Form>
)}


      </Modal>
    </div>
  );
}

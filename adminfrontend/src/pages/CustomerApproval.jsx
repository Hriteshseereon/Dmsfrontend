import React, { useState } from "react";
import { Table, Button, Select, Modal, Row, Col } from "antd";

const { Option } = Select;

/* ===== STATIC APPROVAL ORGANISATIONS ===== */
const approvalOrgList = [
  "Distributor",
  "Retailer",
  "Wholesaler",
  "Broker",
  "Vendor",
];

/* ===== COMPANY MASTER DATA ===== */
const companyDetails = {
  "Company 1": {
    name: "Company 1",
    phone: "1234567890",
    email: "company1@example.com",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    pin: "110001",
    tdc: "Yes",
    gstin: "GST123456",
    tin: "TIN123456",
    license: "LIC12345",
    fssai: "FSSAI123",
    billingType: "Monthly",
    aadhaar: "1234-5678-9012",
    pan: "ABCDE1234F",
    address: "123 Company Street, Delhi",
  },
  "Company 2": {
    name: "Company 2",
    phone: "0987654321",
    email: "company2@example.com",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    pin: "400001",
    tdc: "No",
    gstin: "GST654321",
    tin: "TIN654321",
    license: "LIC54321",
    fssai: "FSSAI456",
    billingType: "Quarterly",
    aadhaar: "9876-5432-1098",
    pan: "FGHIJ5678K",
    address: "456 Company Street, Mumbai",
  },
};

/* ===== CUSTOMER DATA ===== */
const sampleCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "********",
    phone: "+91 9876543210",
    address: "123 Broker Street",
    companies: ["Company 1", "Company 2"],
    approvalType: [], // ✅ MULTI
    approved: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "********",
    phone: "+91 9123456789",
    address: "456 Broker Lane",
    companies: ["Company 2"],
    approvalType: [], // ✅ MULTI
    approved: false,
  },
];

function CustomerApproval() {
  const [customers, setCustomers] = useState(sampleCustomers);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);

  /* ===== MULTI SELECT HANDLER ===== */
  const handleApprovalSelect = (id, values) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approvalType: values } : c
      )
    );
  };

  /* ===== VIEW CUSTOMER COMPANIES ===== */
  const handleViewDetails = (customer) => {
    const details = customer.companies.map(
      (c) => companyDetails[c]
    );
    setModalData(details);
    setModalVisible(true);
  };

const handleApprove = (id) => {
  setCustomers((prev) =>
    prev.map((c) => {
      if (c.id !== id) return c;

      // SECOND CLICK → RESET
      if (c.approved) {
        return {
          ...c,
          approved: false,
          approvalType: [], // ✅ auto remove organisation
        };
      }

      // FIRST CLICK → APPROVE
      return {
        ...c,
        approved: true,
      };
    })
  );
};



  /* ===== TABLE COLUMNS ===== */
  const columns = [
    {
      title: <span className="text-amber-600 font-bold">Name</span>,
      dataIndex: "name",
      render: (text) => (
        <span className="text-amber-700 font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-600 font-bold">Email</span>,
      dataIndex: "email",
        render: (text) => ( 
        <span className="text-amber-700 font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-600 font-bold">Password</span>,
      dataIndex: "password",
      render: (text) => ( 
        <span className="text-amber-700 font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-600 font-bold">Phone</span>,
      dataIndex: "phone",
      render: (text) => ( 
        <span className="text-amber-700 font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-600 font-bold">Address</span>,
      dataIndex: "address",
      render: (text) => ( 
        <span className="text-amber-700 font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-600 font-bold">View</span>,
      render: (_, record) => (
        <Button
          className="bg-amber-500! text-white! hover:bg-amber-600!"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
      ),
    },
{
  title: <span className="text-amber-600 font-bold">Link Organization</span>,
  render: (_, record) => (
    <Select
      mode="multiple"
      allowClear
      placeholder="Select organisation"
      className="w-40"
      value={record.approvalType}
      disabled={record.approved}    
      onChange={(values) =>
        handleApprovalSelect(record.id, values)
      }
    >
      {approvalOrgList.map((org) => (
        <Option key={org} value={org}>
          {org}
        </Option>
      ))}
    </Select>
  ),
}

,{
  title: <span className="text-amber-600 font-bold">Action</span>,
  render: (_, record) => (
    <Button
      disabled={!record.approved && record.approvalType.length === 0}
      onClick={() => handleApprove(record.id)}
      className={
        record.approved
          ? "bg-green-500! text-white! hover:bg-green-600!"
          : "bg-amber-500! text-white! hover:bg-amber-600!"
      }
    >
      {record.approved ? "Approved" : "Approve"}
    </Button>
  ),
}


  ];

  return (
    <div className="p-6">
     
      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        pagination={false}
      />

      {/* ===== MODAL ===== */}
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={1000}
        title={<span className="text-amber-600">Company Details</span>}
      >
        <div className="flex flex-col gap-6">
          {modalData.map((company, index) => (
            <div
              key={index}
              className="border border-amber-300 rounded-lg p-4 shadow"
            >
              <h3 className="text-xl font-bold text-amber-600 mb-3">
                {company.name}
              </h3>

             <Row gutter={[16, 16]}>
  {Object.entries(company).map(([key, value]) => (
    <Col span={6} key={key}>
      <div className="text-sm">
        <strong className="text-amber-600 block">
          {key}: <span className=" text-gray-700">{value}</span>
        </strong>
       
      </div>
    </Col>
  ))}
</Row>

            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default CustomerApproval;

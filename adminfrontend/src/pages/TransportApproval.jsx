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




/* ===== CUSTOMER DATA ===== */
const sampleCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "********",
    contact_person: "John Doe",
    phone: "+91 9876543210",
    tele_phone: "+91 9876543210",
    address_1: "123 Broker Street",
    address_2: "Suite 100",
    fax_no: "+91 9876543210",
    pan_no: "ABCDE1234F",
    gst_no: "GST123456",
    state: "Delhi",
    city: "New Delhi",
    district: "New Delhi",
    pin_code: "110001",
    approvalType: [], 
    approved: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "********",
    contact_person: "Jane Smith",
    phone: "+91 9876543210",
    tele_phone: "+91 9876543210",
    address_1: "456 Retailer Avenue",
    address_2: "Floor 2",
    fax_no: "+91 9876543210",
    pan_no: "FGHIJ5678K",
    gst_no: "GST654321",
    state: "Maharashtra",
    district: "Mumbai",
    pin_code: "400001",
    approvalType: [],
    approved: false,
  },
];

function TranspoertApproval() {
  const [customers, setCustomers] = useState(sampleCustomers);
 

  /* ===== MULTI SELECT HANDLER ===== */
  const handleApprovalSelect = (id, values) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approvalType: values } : c
      )
    );
  };


const handleApprove = (id) => {
  setCustomers((prev) =>
    prev.map((c) => {
      if (c.id !== id) return c;
      if (c.approved) {
        return {
          ...c,
          approved: false,
          approvalType: [], 
        };
      }
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
         title: <span className="text-amber-600 font-bold">Contact Person</span>,   
        dataIndex: "contact_person",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),
    }
    ,
    {
      title: <span className="text-amber-600 font-bold">Phone</span>,   
        dataIndex: "phone", 

        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),  
    },
    {
      title: <span className="text-amber-600 font-bold">Address</span>,   
        dataIndex: "address_1",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),  
    },
     {
      title: <span className="text-amber-600 font-bold">Address</span>,   
        dataIndex: "address_2",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),  
    },
      {
        title: <span className="text-amber-600 font-bold">Fax No</span>,
        dataIndex: "fax_no",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),
      },
      { 
        title: <span className="text-amber-600 font-bold">PAN No</span>,  
        dataIndex: "pan_no",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),
      },
      {
        title: <span className="text-amber-600 font-bold">GST No</span>,
        dataIndex: "gst_no",
        render: (text) => ( 
          <span className="text-amber-700 font-medium">{text}</span>
        ),
      },
      {
        title: <span className="text-amber-600 font-bold">State</span>,
        dataIndex: "state",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),  
      },
      {
        title: <span className="text-amber-600 font-bold">City</span>,
        dataIndex: "city",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),  
      },
      {
        title: <span className="text-amber-600 font-bold">District</span>,
        dataIndex: "district",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
        ),  
      },
      {
        title: <span className="text-amber-600 font-bold">Pin Code</span>,
        dataIndex: "pin_code",
        render: (text) => (
          <span className="text-amber-700 font-medium">{text}</span>
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
        scroll={{ x: 200 }}
      />

   
    </div>
  );
}

export default TranspoertApproval;

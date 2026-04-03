import React, { useState, useEffect } from "react";
import { Table, Button, Select, Modal, Row, Col, message, Checkbox } from "antd";
import { getAllAdminCustomers, getAdminCustomerDetails, assignAdminCustomerOrganisations } from "../api/customer";
import { getOrganizations } from "../api/organizations";

const { Option } = Select;



function CustomerApproval() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);

  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      const orgs = await fetchOrganizations();
      await fetchCustomers(orgs);
    };
    initialize();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const data = await getOrganizations();
      setOrganizations(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      message.error("Failed to fetch organizations");
      return [];
    }
  };

  const fetchCustomers = async (orgs = organizations) => {
    setLoading(true);
    try {
      const data = await getAllAdminCustomers();
      // Map API data to match existing UI structure
      const mappedData = data.map((item) => ({
        id: item.customer_id,
        name: item.customer_name,
        email: item.email_address || "N/A",
        password: "********", // Mock as in original
        phone: item.mobile_number || item.phone_number || "N/A",
        address: item.address || "N/A",
        companies: item.companies || item.company_details || [],
        approvalType: item.linked_org_ids || [], // Keep as IDs for state
        approved: item.login_active,
      }));
      setCustomers(mappedData);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      message.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  /* ===== MULTI SELECT HANDLER ===== */
  const handleApprovalSelect = (id, values) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approvalType: values } : c
      )
    );
  };

  /* ===== VIEW CUSTOMER COMPANIES ===== */
  // const handleViewDetails = async (customer) => {
  //   try {
  //     const details = await getAdminCustomerDetails(customer.id);

  //     const mappedCompanies = (details.companies || []).map(comp => ({
  //       "name": comp.company_name,
  //       "phone": comp.phone,
  //       "email": comp.email,
  //       "country": comp.country,
  //       "state": comp.state,
  //       "city": comp.city,
  //       "pin": comp.pin,
  //       "tdc": comp.tds_applicable ? "Yes" : "No",
  //       "gstin": comp.gstin,
  //       "tin": comp.tin,
  //       "license": comp.license_no,
  //       "fssai": comp.fssai_no,
  //       "billingType": comp.billing_type,
  //       "aadhaar": comp.aadhaar_no,
  //       "pan": comp.pan,
  //       "address": comp.address
  //     }));

  //     setModalData(mappedCompanies);
  //     setModalVisible(true);
  //   } catch (error) {
  //     console.error("Failed to fetch customer details:", error);
  //     message.error("Failed to fetch customer details");
  //   }
  // };

  const handleApprove = async (id) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    // Toggle logic: If already approved, we reset (locally for now, or you can add a reset API call)
    if (customer.approved) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, approved: false, approvalType: [] } : c
        )
      );
      return;
    }

    try {
      const payload = {
        organisation_ids: customer.approvalType,
        status: "Approved"
      };

      await assignAdminCustomerOrganisations(id, payload);
      message.success("Customer approved and organizations linked successfully");

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, approved: true } : c
        )
      );
    } catch (error) {
      console.error("Failed to approve customer:", error);
      message.error("Failed to approve customer");
    }
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
      title: <span className="text-amber-600 font-bold">Link Organization</span>,
      render: (_, record) => (
        <Select
          mode="multiple"
          allowClear
          placeholder="Select organisation"
          className="w-full min-w-[10ad0px]"
          value={record.approvalType}
          disabled={record.approved}
          onChange={(values) =>
            handleApprovalSelect(record.id, values)
          }
          maxTagCount="responsive"
          optionLabelProp="label"
        >
          {organizations.map((org) => {
            const orgName = org.registered_name || org.name;
            return (
              <Option key={org.id} value={org.id} label={orgName}>
                <div className="flex items-center gap-2">
                  <Checkbox checked={record.approvalType.includes(org.id)} />
                  <span>{orgName}</span>
                </div>
              </Option>
            );
          })}
        </Select>
      ),
    }

    , {
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
    <div className="p-4 sm:p-6 lg:p-8">

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
      />

      {/* ===== MODAL ===== */}
      {/* <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width="95%"
        style={{ maxWidth: "1200px" }}
        title={<span className="text-amber-600">Company Details</span>}
      >
        <div className="flex flex-col gap-6">
          {modalData.length > 0 ? (
            modalData.map((company, index) => (
              <div
                key={index}
                className="border border-amber-200 rounded-xl p-8 bg-white mb-6 last:mb-0 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-amber-600 mb-6">
                  {company.name}
                </h3>
                <Row gutter={[24, 20]}>
                  {Object.entries(company).map(([key, value]) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={key}>
                      <div className="flex gap-2 items-start text-[14px]">
                        <span className="text-amber-600 font-bold whitespace-nowrap">
                          {key}:
                        </span>
                        <span className="text-slate-900 font-bold leading-tight">
                          {value || "N/A"}
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <span className="text-lg text-gray-500 italic">
                No company added
              </span>
            </div>
          )}
        </div>
      </Modal> */}
    </div>
  );
}

export default CustomerApproval;

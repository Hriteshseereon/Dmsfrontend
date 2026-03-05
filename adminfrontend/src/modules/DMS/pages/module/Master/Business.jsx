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

import CustomerForm from "./CustomerForm";
import VendorForm from "./VendorForm";
import TransportForm from "./TransportForm";
import BrokerForm from "./BrokerForm";
import InventoryForm from "./InventoryForm";
import {
  getVendors,
  addvendor,
} from "../../../../../api/bussinesspatnr";
import { addAdminCustomer, getAdminCustomers, updateAdminCustomer, getAdminCustomerDetails } from "../../../../../api/customer";
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
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const fetchVendors = async () => {
    try {
      const res = await getVendors();
      console.log("Vendors fetched:", res);
      // if API returns { results: [] }
      const vendorList = res?.results || res || [];

      const mapped = vendorList.map((v, index) => ({
        key: v.id || index + 1,
        id: v.id,
        partnerType: "Vendor",
        name: v.name,
        email: v.email_address || "",
        phoneNo: v.contact_person_no || "",
        status: v?.is_active ? "Active" : "Inactive",
      }));

      setData(mapped);
    } catch (err) {
      console.log("Fetch Vendors Error:", err);
    }
  };
  const mapCustomerToForm = (c) => ({
    key: c.id || c.customer_id,
    partnerType: "Customer",
    name: c.customer_name,
    branchName: c.business_name,
    phoneNo: c.phone_number,
    mobileNo: c.mobile_number,
    email: c.email_address || "N/A",
    status: c.status || "Active",
    type: c.customer_type,
    contactPerson: c.contact_person,
    address: c.address || "",
    country: c.country || "",
    state: c.state || "",
    district: c.district || "",
    city: c.city || "",
    pinCode: c.pin_code || "",
    location: c.location || "",
    creditFacility: c.credit_facility,
    securityForCreditFacility: c.security_for_credit,
    advCheque: c.advance_cheque_no,
    amountLimit: c.amount_limit,
    noDaysLimit: c.days_limit,
    noInvoiceLimit: c.invoice_limit,
    soudaLimit: c.souda_limit_ton,
    gstNo: c.gst_number,
    tinNo: c.tin_number,
    panNo: c.pan_number,
    aadharNo: c.aadhaar_number,
    fssaiNo: c.fssai_number,
    licenseNo: c.license_number,
    tdsApplicable: c.tds_applicable ? "Yes" : "No",
    billingType: c.billing_type,
    customerCode: c.customer_code,
    id: c.customer_id || c.id,
  });

  // fetch customers function
  const fetchCustomers = async () => {
    try {
      const res = await getAdminCustomers();
      const list = Array.isArray(res) ? res : res?.results || [];
      const mappedCustomers = list.map((c) => mapCustomerToForm(c));
      setData(mappedCustomers);
    } catch (error) {
      console.error("Fetch Customers Error:", error);
    }
  };

  // const handleSubmit = async (values) => {
  //   try {
  //     if (activeForm !== "Customer") return;

  //     const payload = {
  //       customer_name: values.name,
  //       business_name: values.branchName,
  //       phone_number: values.phoneNo,
  //       mobile_number: values.mobileNo,
  //       email_address: values.email,
  //       customer_type: values.type,
  //       status: values.status,

  //       address: values.address,
  //       country: values.country,
  //       state: values.state,
  //       city: values.city,
  //       pin_code: values.pinCode,
  //       location: values.location,

  //       credit_facility: values.creditFacility,
  //       security_for_credit: values.securityForCreditFacility,
  //       advance_cheque_no: values.advCheque,
  //       amount_limit: Number(values.amountLimit),
  //       days_limit: Number(values.noDaysLimit),
  //       invoice_limit: Number(values.noInvoiceLimit),
  //       souda_limit_ton: Number(values.soudaLimit),

  //       gst_number: values.gstNo,
  //       tin_number: values.tinNo,
  //       pan_number: values.panNo,
  //       aadhaar_number: values.aadharNo,
  //       fssai_number: values.fssaiNo,
  //       license_number: values.licenseNo,

  //       tds_applicable: values.tdsApplicable === "Yes",
  //       billing_type: values.billingType?.toUpperCase(),
  //     };

  //     const res = await addcustomer(payload);

  //     setData((prev) => [
  //       ...prev,
  //       {
  //         key: res?.id || prev.length + 1,
  //         partnerType: "Customer",
  //         name: payload.customer_name,
  //         email: payload.email_address,
  //         phoneNo: payload.phone_number,
  //         status: payload.status,
  //       },
  //     ]);

  //     setIsEditModalOpen(false);
  //     setShowForm(false);
  //     form.resetFields();
  //   } catch (error) {
  //     console.error("Add Customer Error:", error);
  //   }
  // };
  const handleSubmit = async (values) => {
    try {
      /* ================= CUSTOMER ================= */
      if (activeForm === "Customer") {
        const payload = {
          customer_name: values.name,
          business_name: values.branchName,
          phone_number: values.phoneNo,
          mobile_number: values.mobileNo,
          email_address: values.email,
          customer_type: values.type,
          status: values.status,
          contact_person: values.contactPerson,

          address: values.address,
          country: values.country,
          state: values.state,
          district: values.district,
          city: values.city,
          pin_code: values.pinCode,
          location: values.location,

          credit_facility: values.creditFacility,
          security_for_credit: values.securityForCreditFacility,
          advance_cheque_no: values.advCheque,
          amount_limit: Number(values.amountLimit) || 0,
          days_limit: Number(values.noDaysLimit) || 0,
          invoice_limit: Number(values.noInvoiceLimit) || 0,
          souda_limit_ton: Number(values.soudaLimit) || 0,

          gst_number: values.gstNo,
          gst_document: values.gstDoc?.[0]?.originFileObj,
          tin_number: values.tinNo,
          pan_number: values.panNo,
          pan_document: values.panDoc?.[0]?.originFileObj,
          aadhaar_number: values.aadharNo,
          aadhaar_document: values.aadharDoc?.[0]?.originFileObj,
          fssai_number: values.fssaiNo,
          license_number: values.licenseNo,
          tds_applicable: values.tdsApplicable === "Yes",
          billing_type: values.billingType,
        };

        console.log("Submitting Customer Payload:", payload);

        if (selectedRecord) {
          await updateAdminCustomer(selectedRecord.id, payload);
          message.success("Customer updated successfully!");
        } else {
          await addAdminCustomer(payload);
          message.success("Customer added successfully!");
        }

        fetchCustomers(); // Refresh the list
      }

      /* ================= VENDOR ================= */
      if (activeForm === "Vendor") {
        const payload = {
          name: values?.name || "",
          short_name: values?.shortName || "",
          is_active: values?.status === "Active",

          contact_person_input: {
            name: values?.contactPerson || "",
            contact_person_no: values?.contactMobile || "",
            gender: values?.gender || "",
            contact_person_whats_no: values?.contactWhatsapp || "",
            contract_person_email: values?.contactEmail || "",
            adhara_no: values?.aadharNo || "",
            adhara_documents: [],
          },

          addresses: [
            {
              address_line1: values?.address1 || "",
              state: values?.state || "",
              district: values?.district || "",
              city: values?.city || "",
              location: values?.location || values?.city || "",
              pin: values?.pinCode || "",
            },
          ],

          plants: (values?.plants || []).map((p) => ({
            name: p?.plantName || "",
            address: p?.address || "",
            phone_number: p?.phoneNo || "",
            email_address: p?.email || "",
            state: p?.state || "",
            district: p?.district || "",
            city: p?.city || "",
            pin: p?.pin || "",
          })),

          tax: {
            pan: values?.panNo || "",
            gstin: values?.gstIn || "",
            tin_no: values?.tinNo || "",
            tin_date: values?.tinDate
              ? dayjs(values.tinDate).format("YYYY-MM-DD")
              : null,
            igst_applicable: values?.igstApplicable === "Yes",
          },
        };

        const res = await addvendor(payload);

        setVendors((prev) => [
          ...prev,
          {
            key: res?.id || prev.length + 1,
            partnerType: "Vendor",
            name: payload.name,
            email: values?.contactEmail || "",
            phoneNo: values?.contactMobile || "",
            status: payload.is_active ? "Active" : "Inactive",
          },
        ]);
      }

      /* ================= COMMON ================= */
      setIsEditModalOpen(false);
      setShowForm(false);
      form.resetFields();
    } catch (error) {
      console.error("Save Error:", error);
      message.error(error.response?.data?.detail || "Failed to save partner");
    }
  };

  useEffect(() => {
    if (activeForm === "Vendor") {
      fetchVendors();
      console.log("Fetching vendors data...");
    }
    if (activeForm === "Customer") {
      fetchCustomers();
    }
  }, [activeForm]);
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
  }, [
    isEditModalOpen,
    isViewModalOpen,
    selectedRecord,
    activeForm,
    form,
    viewForm,
  ]);

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
            onClick={async () => {
              setActiveForm(record.partnerType);
              if (record.partnerType === "Customer") {
                try {
                  const details = await getAdminCustomerDetails(record.id);
                  const mapped = mapCustomerToForm(details);
                  setSelectedRecord(mapped);
                } catch (err) {
                  message.error("Failed to fetch customer details");
                  setSelectedRecord(record);
                }
              } else {
                setSelectedRecord(record);
              }
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={async () => {
              setActiveForm(record.partnerType);
              if (record.partnerType === "Customer") {
                try {
                  const details = await getAdminCustomerDetails(record.id);
                  const mapped = mapCustomerToForm(details);
                  setSelectedRecord(mapped);
                } catch (err) {
                  message.error("Failed to fetch customer details");
                  setSelectedRecord(record);
                }
              } else {
                setSelectedRecord(record);
              }
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
    const dateFields = [
      "tinDate",
      "etDate",
      "cstDate",
      "brokerCommissionSetupDate",
    ];
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
          item.key === selectedRecord.key ? { ...item, ...finalValues } : item,
        ),
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
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
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
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRecord(null);
              setActiveForm("Customer"); // ⬅ no form selected
              setShowForm(false); // ⬅ show cards first
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
            {isViewModalOpen
              ? "View"
              : selectedRecord
                ? "Edit "
                : "Add Business Partner"}{" "}
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
          height: "80vh", // ⬅ increases modal body height
          overflowY: "auto", // ⬅ enables scrolling
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
            <div
              className="
      max-w-4xl
      w-full
      bg-amber-50
      border
      border-amber-200
      rounded-xl
      px-6
      py-4
      shadow-sm
    "
            >
              <h4 className="text-lg font-semibold text-amber-800 mb-1">
                💡 Tip
              </h4>
              <p className="text-base text-amber-700">
                Choose a partner type above to start adding your business
                partner details. You can manage customers, vendors,
                transporters, and brokers from one place.
              </p>
            </div>
          </div>
        )}

        {(showForm || selectedRecord || isViewModalOpen) && (
          <Form
            form={isViewModalOpen ? viewForm : form}
            layout="vertical"
            onFinish={handleSubmit}
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
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedRecord(null);
                    setShowForm(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-amber-500! hover:bg-amber-600!"
                >
                  Save
                </Button>
              </div>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
}

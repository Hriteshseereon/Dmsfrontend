import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Row,
  Col,
  Card,
  Select,
  Upload,
  message,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  getAdminCustomerDetails,
  addAdminCustomer,
  updateAdminCustomer,
  getAdminCustomers,
} from "../../../../../../../api/customer";

const { Option } = Select;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";

export default function CustomerTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form] = Form.useForm();

  /* ================= FETCH ================= */
  const fetchCustomers = async () => {
    try {
      const res = await getAdminCustomers();
      const list = Array.isArray(res) ? res : res?.results || [];
      setData(list);
    } catch {
      message.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (details) => ({
    customerCode: details.customer_code,
    name: details.customer_name,
    branchName: details.business_name,
    phoneNo: details.phone_number,
    mobileNo: details.mobile_number,
    email: details.email_address,
    type: details.customer_type,
    status: details.status,
    contactPerson: details.contact_person,
    address: details.address,
    country: details.country,
    state: details.state,
    district: details.district,
    city: details.city,
    pinCode: details.pin_code,
    location: details.location,
    creditFacility: details.credit_facility,
    securityForCreditFacility: details.security_for_credit_facility,
    advCheque: details.adv_cheque,
    amountLimit: details.amount_limit,
    noDaysLimit: details.no_days_limit,
    noInvoiceLimit: details.no_invoice_limit,
    soudaLimit: details.souda_limit,
    gstNo: details.gst_no,
    tinNo: details.tin_no,
    panNo: details.pan_no,
    aadharNo: details.aadhar_no,
    fssaiNo: details.fssai_no,
    licenseNo: details.license_no,
    tdsApplicable: details.tds_applicable,
    billingType: details.billing_type,
  });

  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
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
        security_for_credit_facility: values.securityForCreditFacility,
        adv_cheque: values.advCheque,
        amount_limit: values.amountLimit,
        no_days_limit: values.noDaysLimit,
        no_invoice_limit: values.noInvoiceLimit,
        souda_limit: values.soudaLimit,
        gst_no: values.gstNo,
        tin_no: values.tinNo,
        pan_no: values.panNo,
        aadhar_no: values.aadharNo,
        fssai_no: values.fssaiNo,
        license_no: values.licenseNo,
        tds_applicable: values.tdsApplicable,
        billing_type: values.billingType,
      };

      if (selected) {
        await updateAdminCustomer(selected.id, payload);
        message.success("Customer Updated");
      } else {
        await addAdminCustomer(payload);
        message.success("Customer Added");
      }

      setOpen(false);
      form.resetFields();
      fetchCustomers();
    } catch {
      message.error("Save failed");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "Code", dataIndex: "customer_code" },
    { title: "Name", dataIndex: "customer_name" },
    { title: "Email", dataIndex: "email_address" },
    { title: "Mobile", dataIndex: "mobile_number" },
    { title: "Type", dataIndex: "customer_type" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-blue-500 cursor-pointer text-base"
            onClick={async () => {
              try {
                const details = await getAdminCustomerDetails(record.id);
                form.setFieldsValue(mapDetailsToForm(details));
                setSelected(details);
                setViewMode(true);
                setOpen(true);
              } catch {
                message.error("Failed to load customer details");
              }
            }}
          />
          <EditOutlined
            className="text-amber-500 cursor-pointer text-base"
            onClick={async () => {
              try {
                const details = await getAdminCustomerDetails(record.id);
                form.setFieldsValue(mapDetailsToForm(details));
                setSelected(details);
                setViewMode(false);
                setOpen(true);
              } catch {
                message.error("Failed to load customer details");
              }
            }}
          />
        </div>
      ),
    },
  ];

  const filteredData = data.filter((c) =>
    c.customer_name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */
  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center mb-3">
        {/* Left: Search + Reset */}
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border-amber-300"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              fetchCustomers();
            }}
            className="border-amber-400 text-amber-600"
          >
            Reset
          </Button>
        </div>

        {/* Right: Add Customer */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500 border-none"
          onClick={() => {
            setSelected(null);
            setViewMode(false);
            form.resetFields();
            setOpen(true);
          }}
        >
          Add Customer
        </Button>
      </div>

      {/* ===== TABLE ===== */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="small"
        bordered
      />

      {/* ===== MODAL ===== */}
      <Modal
        open={open}
        footer={null}
        width={1200}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        title={
          <span className="text-amber-700 font-semibold text-base">
            {viewMode
              ? "View Customer"
              : selected
                ? "Edit Customer"
                : "Add Customer"}
          </span>
        }
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* ================= Customer Basic Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Customer Basic Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Customer Code" name="customerCode">
                  <Input
                    className={inputClass}
                    disabled
                    placeholder="Auto-generated"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Customer Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter customer name" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter customer name"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Business Name" name="branchName">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter business name"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNo"
                  rules={[
                    {
                      pattern: /^[0-9]\d{9,10}$/,
                      message: "Enter a valid phone number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter phone number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Mobile Number"
                  name="mobileNo"
                  rules={[
                    { required: true, message: "Please enter mobile number" },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter email address"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Customer Type"
                  name="type"
                  rules={[{ required: true, message: "Please select type" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select type"
                  >
                    <Option value="Customer">Customer</Option>
                    <Option value="Supplier">Supplier</Option>
                    <Option value="Both">Both</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select status"
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Contact & Address Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Contact & Address Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Contact Person" name="contactPerson">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter contact person"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Address" name="address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Country" name="country">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter country"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="State" name="state">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter state"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="District" name="district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="City" name="city">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter city"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Pin Code"
                  name="pinCode"
                  rules={[
                    { required: true, message: "Please enter pin code" },
                    {
                      pattern: /^\d{6}$/,
                      message: "PIN code must be 6 digits",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                    maxLength={6}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Location" name="location">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter location"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Credit Facility Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Credit Facility Details
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="Credit Facility" name="creditFacility">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select credit facility"
                  >
                    <Option value="Advance">Advance</Option>
                    <Option value="Cheque">Cheque</Option>
                    <Option value="Online">Online</Option>
                    <Option value="Credit Limit">Credit Limit</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Security for Credit"
                  name="securityForCreditFacility"
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select security"
                  >
                    <Option value="Bank Guarantee">Bank Guarantee</Option>
                    <Option value="Post Dated Cheque">Post Dated Cheque</Option>
                    <Option value="Fixed Deposit">Fixed Deposit</Option>
                    <Option value="Collateral">Collateral</Option>
                    <Option value="None">None</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Advance Cheque No" name="advCheque">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter cheque number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Amount Limit" name="amountLimit">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter amount limit"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Days Limit" name="noDaysLimit">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter days limit"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Invoice Limit" name="noInvoiceLimit">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter invoice limit"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Souda Limit (Ton)" name="soudaLimit">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter souda limit"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Legal & Tax Information ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Legal & Tax Information
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item
                  label="GST Number"
                  name="gstNo"
                  rules={[
                    {
                      pattern:
                        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: "Enter a valid GST number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter GST number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="GST Document"
                  name="gstDoc"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                  >
                    <Button
                      className="w-full text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Select GST Doc
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="TIN Number" name="tinNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter TIN number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="PAN Number"
                  name="panNo"
                  rules={[
                    {
                      pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: "Enter a valid PAN number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter PAN number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="PAN Document"
                  name="panDoc"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                  >
                    <Button
                      className="w-full text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Select PAN Doc
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Aadhar Number" name="aadharNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Aadhar number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Aadhar Document"
                  name="aadharDoc"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                  >
                    <Button
                      className="w-full text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Select Aadhar Doc
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="FSSAI Number" name="fssaiNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter FSSAI number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="License Number" name="licenseNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter license number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="TDS Applicable" name="tdsApplicable">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select TDS option"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Billing Type" name="billingType">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select billing type"
                  >
                    <Option value="Regular">Regular</Option>
                    <Option value="Provisional">Provisional</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ===== FOOTER ACTIONS ===== */}
          {!viewMode && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-amber-500 border-none"
              >
                {selected ? "Update" : "Save"}
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
}

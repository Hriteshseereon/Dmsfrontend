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
import { API_BASE_URL } from "@/utils/config";
import {
  getAdminCustomerDetails,
  addAdminCustomer,
  updateAdminCustomer,
  getAdminCustomers,
} from "../../../../../../../api/customer";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const { Option } = Select;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";
const { Password } = Input;
export default function CustomerTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [securityType, setSecurityType] = useState(null);
  const [form] = Form.useForm();
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };
  const fileFromUrl = (url) => {
    if (!url) return [];

    // if backend already returns full URL → use it
    const finalUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

    return [
      {
        uid: finalUrl,
        name: finalUrl.split("/").pop(),
        status: "done",
        url: finalUrl,
      },
    ];
  };

  /* ================= FETCH ================= */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getAdminCustomers();
      const list = Array.isArray(res) ? res : res?.results || [];
      setData(list);
    } catch {
      message.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // useeffect function to fetch the random password
  useEffect(() => {
    if (!selected && open) {
      form.setFieldsValue({
        password: generatePassword(),
      });
    }
  }, [open]);
  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (details) => ({
    name: details.customer_name,
    branchName: details.business_name,
    phoneNo: details.phone_number,
    mobileNo: details.mobile_number,
    email: details.email_address,
    type: details.customer_type,
    status: details.status,

    address: details.address,
    address1: details.address_line1,
    country: details.country,
    state: details.state,
    district: details.district,
    city: details.city,
    pinCode: details.pin_code,
    location: details.location,

    creditFacility: details.credit_facility,
    securityForCreditFacility: details.security_for_credit,

    advCheque: details.advance_cheque_no,

    amountLimit: details.amount_limit,
    noDaysLimit: details.days_limit,
    noInvoiceLimit: details.invoice_limit,
    soudaLimit: details.souda_limit_ton,

    gstNo: details.gst_number,
    tinNo: details.tin_number,
    panNo: details.pan_number,
    aadharNo: details.aadhaar_number,
    fssaiNo: details.fssai_number,
    licenseNo: details.license_number,

    tdsApplicable: details.tds_applicable ? "Yes" : "No",
    tdsRate: details.rate_of_tds,

    // ===== BG =====
    bgBankName: details.bg_bank_name,
    bgAmount: details.bg_amount,
    bgNumber: details.bg_number,

    bgDate: details.bg_date ? dayjs(details.bg_date) : null,
    bgValidFrom: details.bg_valid_from ? dayjs(details.bg_valid_from) : null,
    bgValidUpto: details.bg_valid_upto ? dayjs(details.bg_valid_upto) : null,

    // ===== PDC =====
    pdcBank: details.pdc_bank_name,
    pdcNumber: details.pdc_cheque_number,
    pdcAmount: details.pdc_amount,

    pdcIssueDate: details.pdc_issue_date ? dayjs(details.pdc_issue_date) : null,
    pdcDate: details.pdc_cheque_date ? dayjs(details.pdc_cheque_date) : null,
    pdcValid: details.pdc_valid_upto ? dayjs(details.pdc_valid_upto) : null,

    // ===== FD =====
    fdBank: details.fd_bank_name,
    fdCheque: details.fd_cheque_number,
    fdSecurity: details.fd_security_detail,
    fdInterest: details.fd_rate_of_interest,
    fdDate: details.fd_date ? dayjs(details.fd_date) : null,

    // ===== Collateral =====
    collateralDetails: details.collateral_details,
    collateralAddress: details.collateral_address,
    collateralValue: details.collateral_market_value,

    // ===== FILES =====
    gstDoc: fileFromUrl(details.gst_document),
    panDoc: fileFromUrl(details.pan_document),
    aadharDoc: fileFromUrl(details.aadhaar_document),
    bgDoc: fileFromUrl(details.bg_document),
  });

  const openCustomer = async (record, view = false) => {
    try {
      const id = record.customer_id || record.id;

      const details = await getAdminCustomerDetails(id);

      form.setFieldsValue(mapDetailsToForm(details));

      setSecurityType(details.security_for_credit);

      setSelected(details);
      setViewMode(view);
      setOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Failed to load customer details");
    }
  };
  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      // ===== BASIC =====
      formData.append("customer_name", values.name);
      formData.append("business_name", values.branchName);
      formData.append("phone_number", values.phoneNo);
      formData.append("mobile_number", values.mobileNo);
      formData.append("email_address", values.email);
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("customer_type", values.type);
      formData.append("status", values.status);

      // ===== ADDRESS =====
      formData.append("address", values.address);
      formData.append("address_line1", values.address1);
      formData.append("country", values.country);
      formData.append("state", values.state);
      formData.append("district", values.district);
      formData.append("city", values.city);
      formData.append("pin_code", values.pinCode);
      formData.append("location", values.location);

      // ===== LEGAL =====
      formData.append("gst_number", values.gstNo);
      formData.append("tin_number", values.tinNo);
      formData.append("pan_number", values.panNo);
      formData.append("aadhaar_number", values.aadharNo);
      formData.append("fssai_number", values.fssaiNo);
      formData.append("license_number", values.licenseNo);

      formData.append("tds_applicable", values.tdsApplicable === "Yes");
      formData.append("rate_of_tds", values.tdsRate || "1.50");

      // formData.append("billing_type", "REGULAR");

      // ===== CREDIT =====
      formData.append("credit_facility", values.creditFacility);
      formData.append("security_for_credit", values.securityForCreditFacility);

      formData.append("amount_limit", values.amountLimit || 0);
      formData.append("days_limit", values.noDaysLimit || 0);
      formData.append("invoice_limit", values.noInvoiceLimit || 0);
      formData.append("souda_limit_ton", values.soudaLimit || 0);

      formData.append("advance_cheque_no", values.advCheque || "");

      // ===== SECURITY TYPES =====

      if (values.securityForCreditFacility === "Bank Guarantee") {
        formData.append("bg_bank_name", values.bgBankName);
        formData.append(
          "bg_date",
          values.bgDate ? dayjs(values.bgDate).format("YYYY-MM-DD") : "",
        );

        formData.append("bg_amount", values.bgAmount);
        formData.append("bg_number", values.bgNumber);
        formData.append(
          "bg_valid_from",
          values.bgValidFrom
            ? dayjs(values.bgValidFrom).format("YYYY-MM-DD")
            : "",
        );
        formData.append(
          "bg_valid_upto",
          values.bgValidUpto
            ? dayjs(values.bgValidUpto).format("YYYY-MM-DD")
            : "",
        );

        if (values.bgDoc?.[0]?.originFileObj) {
          formData.append("bg_document", values.bgDoc[0].originFileObj);
        }
      }

      if (values.securityForCreditFacility === "Post Dated Cheque") {
        formData.append("pdc_bank_name", values.pdcBank);
        formData.append(
          "pdc_issue_date",
          values.pdcIssueDate
            ? dayjs(values.pdcIssueDate).format("YYYY-MM-DD")
            : "",
        );
        formData.append(
          "pdc_cheque_date",
          values.pdcDate ? dayjs(values.pdcDate).format("YYYY-MM-DD") : "",
        );
        formData.append("pdc_cheque_number", values.pdcNumber);
        formData.append("pdc_amount", values.pdcAmount);
        formData.append(
          "pdc_valid_upto",
          values.pdcValid ? dayjs(values.pdcValid).format("YYYY-MM-DD") : "",
        );
      }

      if (values.securityForCreditFacility === "Fixed Deposit") {
        formData.append("fd_bank_name", values.fdBank);
        formData.append(
          "fd_date",
          values.fdDate ? dayjs(values.fdDate).format("YYYY-MM-DD") : "",
        );
        formData.append("fd_cheque_number", values.fdCheque);
        formData.append("fd_security_detail", values.fdSecurity);
        formData.append("fd_rate_of_interest", values.fdInterest);
      }

      if (values.securityForCreditFacility === "Collateral") {
        formData.append("collateral_details", values.collateralDetails);
        formData.append("collateral_address", values.collateralAddress);
        formData.append("collateral_market_value", values.collateralValue);
      }

      // ===== DOCUMENTS =====

      if (values.gstDoc?.[0]?.originFileObj) {
        formData.append("gst_document", values.gstDoc[0].originFileObj);
      }

      if (values.panDoc?.[0]?.originFileObj) {
        formData.append("pan_document", values.panDoc[0].originFileObj);
      }

      if (values.aadharDoc?.[0]?.originFileObj) {
        formData.append("aadhaar_document", values.aadharDoc[0].originFileObj);
      }

      const id = selected?.customer_id;

      if (selected) {
        await updateAdminCustomer(id, formData);
        message.success("Customer Updated");
      } else {
        await addAdminCustomer(formData);
        message.success("Customer Added");
      }

      setOpen(false);
      setSelected(null);
      form.resetFields();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      message.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Code</span>,
      dataIndex: "customer_code",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Name</span>,
      dataIndex: "customer_name",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      dataIndex: "email_address",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile</span>,
      dataIndex: "mobile_number",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Type</span>,
      dataIndex: "customer_type",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-red-500! cursor-pointer! text-base! hover:text-red-600!"
            onClick={() => openCustomer(record, true)}
          />
          <EditOutlined
            className="text-blue-500! cursor-pointer! text-base! hover:text-blue-600!"
            onClick={() => openCustomer(record, false)}
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
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64! border-amber-400! focus:border-amber-600! text-amber-700! placeholder:text-amber-400!"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              fetchCustomers();
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>

        {/* Right: Add Customer */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
          onClick={() => {
            setSelected(null);
            setViewMode(false);
            setSecurityType(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Add Customer
        </Button>
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Customer Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your customer data</p>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record.customer_id || record.id}
          size="small"
          bordered
          pagination={false}
          rowClassName="hover:bg-amber-50"
          loading={loading}
        />
      </div>

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
          <span className="text-amber-700 font-semibold text-lg">
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
              {/* <Col span={6}>
                <Form.Item label="Customer Code" name="customerCode">
                  <Input
                    className={inputClass}
                    disabled
                    placeholder="Auto-generated"
                  />
                </Form.Item>
              </Col> */}

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
                <Form.Item
                  label="Business Name"
                  name="branchName"
                  rules={[
                    { required: true, message: "Please enter business name" },
                  ]}
                >
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
              <Col span={6}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={
                    selected
                      ? [] // not required when editing
                      : [{ required: true, message: "Please enter password" }]
                  }
                >
                  <Input.Password
                    className={inputClass}
                    disabled={viewMode || selected}
                    placeholder="Enter password"
                    type="password"
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
              Address Details
            </h3>
            <Row gutter={24}>
              {/* <Col span={6}>
                <Form.Item label="Contact Person" name="contactPerson">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter contact person"
                  />
                </Form.Item>
              </Col> */}
              <Col span={6}>
                <Form.Item label="Address1" name="address1">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Address2" name="address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address"
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
                <Form.Item label="District" name="district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
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
                <Form.Item label="Country" name="country">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter country"
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
                <Form.Item label="Credit Facility type" name="creditFacility">
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
              {/* ================= Security Fields ================= */}

              {securityType === "Bank Guarantee" && (
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Bank Name" name="bgBankName">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Date" name="bgDate">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Guarantee Amount" name="bgAmount">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Guarantee Number" name="bgNumber">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Valid From" name="bgValidFrom">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Valid Upto" name="bgValidUpto">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Upload Document"
                      name="bgDoc"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        listType="picture"
                        disabled={viewMode}
                      >
                        <Button>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {securityType === "Post Dated Cheque" && (
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Bank" name="pdcBank">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Cheque Issue Date" name="pdcIssueDate">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Cheque Dated" name="pdcDate">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Cheque Number" name="pdcNumber">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Amount" name="pdcAmount">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Valid Upto" name="pdcValid">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {securityType === "Fixed Deposit" && (
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item label="Bank" name="fdBank">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Date" name="fdDate">
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Cheque Number" name="fdCheque">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Security Detail" name="fdSecurity">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Rate of Interest" name="fdInterest">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {securityType === "Collateral" && (
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Collateral Details"
                      name="collateralDetails"
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item label="Address Details" name="collateralAddress">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item label="Market Value" name="collateralValue">
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Col span={6}>
                <Form.Item
                  label="Security for Credit"
                  name="securityForCreditFacility"
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select security"
                    onChange={(value) => setSecurityType(value)}
                  >
                    <Option value="Bank Guarantee">Bank Guarantee</Option>
                    <Option value="Post Dated Cheque">Post Dated Cheque</Option>
                    <Option value="Fixed Deposit">Fixed Deposit</Option>
                    <Option value="Collateral">Collateral</Option>
                    <Option value="None">None</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* <Col span={4}>
                <Form.Item label="Advance Cheque No" name="advCheque">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter cheque number"
                  />
                </Form.Item>
              </Col> */}

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
                  label="GST Number"
                  name="gstDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button
                      className="w-full text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Upload
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
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button
                      className="w-full text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Upload
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
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button
                      className="w-full text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Upload
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
                <Form.Item label="Trade License Number" name="licenseNo">
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
                    initialValue="Yes"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Rate of TDS"
                  name="tdsRate"
                  initialValue="0.10"
                >
                  <Input disabled />
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
                className="border-amber-500! text-amber-700! hover:bg-amber-100!"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-amber-600! hover:bg-amber-700! border-none! text-white!"
                loading={loading}
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

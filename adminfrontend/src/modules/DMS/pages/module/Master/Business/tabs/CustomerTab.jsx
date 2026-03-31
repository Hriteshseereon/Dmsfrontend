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
  UploadOutlined,
} from "@ant-design/icons";
import { API_BASE_URL } from "@/utils/config";
import {
  getAdminCustomerDetails,
  addAdminCustomer,
  updateAdminCustomer,
  getAdminCustomers,
  sendCustomerCredential,
} from "../../../../../../../api/customer";
import { DatePicker } from "antd";
import dayjs from "dayjs";

// import { locationData } from "../../../../../../../utils/locationData";
import {
  getCountryOptions,
  getStateOptions,
  getDistrictOptions,
  getCityOptions,
  getCountryIsoByName,
  getStateIsoByName,
} from "../../../../../../../utils/locationHelper";

// location helper function

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
  const [sendingId, setSendingId] = useState(null);
  // ── location cascade state ──────────────────────────────────────────────────
  const [selCountryIso, setSelCountryIso] = useState(null);
  const [selStateName, setSelStateName] = useState(null);
  const [selStateIso, setSelStateIso] = useState(null);
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
  // handler function to auto fill the 6 month
  const handleBgValidFromChange = (date) => {
    if (date) {
      const validUpto = dayjs(date).add(6, "month");
      form.setFieldsValue({
        bgValidUpto: validUpto,
      });
    }
  };
  const handlePdcIssueDateChange = (date) => {
    if (date) {
      const validUpto = dayjs(date).add(6, "month");
      form.setFieldsValue({
        pdcValid: validUpto,
      });
    }
  };

  /* ── location cascade handlers ───────────────────────────────────────────── */

  /**
   * Called when Country dropdown changes.
   * - isoCode  → saved to selCountryIso (needed to fetch states + cities)
   * - option.label (plain name e.g. "India") → stored in form field
   *   so FormData always receives plain names, not codes
   */
  const handleCountryChange = (isoCode, option) => {
    setSelCountryIso(isoCode);
    setSelStateName(null);
    setSelStateIso(null);
    form.setFieldsValue({
      country: option.label,
      state: undefined,
      district: undefined,
      city: undefined,
    });
  };

  /**
   * Called when State dropdown changes.
   * - option.label (plain name e.g. "Odisha") → needed for getDistrictOptions()
   * - isoCode (e.g. "OR") → needed for getCityOptions()
   */
  const handleStateChange = (isoCode, option) => {
    setSelStateName(option.label);
    setSelStateIso(isoCode);
    form.setFieldsValue({
      state: option.label,
      district: undefined,
      city: undefined,
    });
  };

  /**
   * Called when District dropdown changes.
   * District value is already a plain name — just clear city.
   */
  const handleDistrictChange = () => {
    form.setFieldsValue({ city: undefined });
  };

  /* ─────────────────────────────────────────────────────────────────────────── */
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
  // useeffect to get the country namw
  useEffect(() => {
    if (open && !selected) {
      const countryIso = getCountryIsoByName("India");
      setSelCountryIso(countryIso);

      form.setFieldsValue({
        country: "India",
      });
    }
  }, [open]);
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
    whatsappNo: details.whatsapp_number,
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
      const countryIso = getCountryIsoByName(details.country);
      const stateIso = getStateIsoByName(countryIso, details.state);

      setSelCountryIso(countryIso);
      setSelStateName(details.state || null);
      setSelStateIso(stateIso);
      setSelected(details);
      setViewMode(view);
      setOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Failed to load customer details");
    }
  };
  /* ── close / reset modal ─────────────────────────────────────────────────── */
  const closeModal = () => {
    setOpen(false);
    form.resetFields();
    setSelCountryIso(null);
    setSelStateName(null);
    setSelStateIso(null);
    setSelected(null);
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
      formData.append("whatsapp_number", values.whatsappNo);
      formData.append("email_address", values.email);
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("customer_type", values.type);
      formData.append("status", values.status);

      // ===== ADDRESS =====
      formData.append("address", values.address || "");
      formData.append("address_line1", values.address1 || "");
      formData.append("country", values.country || "");
      formData.append("state", values.state || "");
      formData.append("district", values.district || "");
      formData.append("city", values.city || "");
      formData.append("pin_code", values.pinCode);
      formData.append("location", values.location || "");

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
  // mail sending functionality

  const handleSendPassword = async (record) => {
    try {
      const partnerId = record.customer_id || record.id;

      setSendingId(partnerId);

      const payload = {
        partner_type: "customer",
        partner_id: partnerId,
      };

      await sendCustomerCredential(payload);

      message.success("Mail successfully sent");

      // update table row immediately
      setData((prev) =>
        prev.map((item) =>
          (item.customer_id || item.id) === partnerId
            ? { ...item, credentials_sent: true }
            : item,
        ),
      );
    } catch (error) {
      message.error("Failed to send mail");
    } finally {
      setSendingId(null);
    }
  };

  const getFilteredData = () => {
    if (!search) return data;

    const value = search.toLowerCase();

    return data.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(value),
    );
  };

  const handleReset = () => {
    setSearch("");
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
    {
      title: <span className="text-amber-700 font-semibold">Password</span>,
      render: (_, record) => {
        const partnerId = record.customer_id || record.id;

        return (
          <Button
            size="small"
            type="primary"
            disabled={record.credentials_sent}
            loading={sendingId === partnerId}
            className={
              record.credentials_sent
                ? "bg-green-500! border-none!"
                : "bg-amber-500! border-none! hover:bg-amber-600!"
            }
            onClick={() => handleSendPassword(record)}
          >
            {record.credentials_sent ? "Sent" : "Send"}
          </Button>
        );
      },
    },
  ];

  const filteredData = getFilteredData();

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
            onClick={handleReset}
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
              <Col span={4}>
                <Form.Item
                  label="WhatsApp Number"
                  name="whatsappNo"
                  rules={[
                    { required: true, message: "Please enter WhatsApp number" },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit WhatsApp number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter WhatsApp number"
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

          {/* ── Address Details ── */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Address Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Address Line 1" name="address1">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address line 1"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Address Line 2" name="address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address line 2"
                  />
                </Form.Item>
              </Col>

              {/*
                COUNTRY
                - options:  { value: "IN", label: "India" }  from getCountryOptions()
                - onChange: stores isoCode in selCountryIso, label (plain name) in form field
                - form field value: plain name ("India") → sent directly in FormData
              */}
              <Col span={4}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: "Please select country" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select country"
                    showSearch
                    optionFilterProp="label"
                    options={getCountryOptions()}
                    onChange={handleCountryChange}
                  />
                </Form.Item>
              </Col>

              {/*
                STATE
                - options: { value: "OR", label: "Odisha" } from getStateOptions(selCountryIso)
                - disabled until a country is selected
                - onChange: stores isoCode in selStateIso, plain name in selStateName + form field
              */}
              <Col span={4}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[{ required: true, message: "Please select state" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selCountryIso}
                    placeholder={
                      selCountryIso ? "Select state" : "Select country first"
                    }
                    showSearch
                    optionFilterProp="label"
                    value={selStateIso}
                    options={getStateOptions(selCountryIso)}
                    onChange={handleStateChange}
                  />
                </Form.Item>
              </Col>

              {/*
                DISTRICT
                - options: { value: "Khordha", label: "Khordha" } from getDistrictOptions(selStateName)
                - uses plain stateName (not isoCode) because ind-state-district is resolved by name
                - disabled until a state is selected
                - value stored in form is the plain district name
              */}
              <Col span={4}>
                <Form.Item
                  label="District"
                  name="district"
                  rules={[
                    { required: true, message: "Please select district" },
                  ]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateName}
                    placeholder={
                      selStateName ? "Select district" : "Select state first"
                    }
                    showSearch
                    optionFilterProp="label"
                    options={getDistrictOptions(selStateName)}
                    onChange={handleDistrictChange}
                  />
                </Form.Item>
              </Col>

              {/*
                CITY
                - options: { value: "Bhubaneswar", label: "Bhubaneswar" } from getCityOptions()
                - linked to STATE (not district) — this is a limitation of all free packages
                - disabled until a state is selected
              */}
              <Col span={4}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: "Please select city" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateIso}
                    placeholder={
                      selStateIso ? "Select city" : "Select state first"
                    }
                    showSearch
                    optionFilterProp="label"
                    options={getCityOptions(selCountryIso, selStateIso)}
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
                <Form.Item label="Google Location" name="location">
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
                <Form.Item
                  label="Credit Facility type"
                  name="creditFacility"
                  rules={[
                    { required: true, message: "Please select security type" },
                  ]}
                >
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

              <Col span={5}>
                <Form.Item
                  label="Security for Credit"
                  name="securityForCreditFacility"
                  rules={[
                    { required: true, message: "Please select security type" },
                  ]}
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
              {/* ================= Security Fields ================= */}

              {securityType === "Bank Guarantee" && (
                <>
                  <Col span={5}>
                    <Form.Item
                      label="Bank Name"
                      name="bgBankName"
                      rules={[{ required: true, message: "Enter Bank Name" }]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Date"
                      name="bgDate"
                      rules={[{ required: true, message: "Enter Date" }]}
                    >
                      <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Bank Guarantee Amount"
                      name="bgAmount"
                      rules={[
                        {
                          required: true,
                          message: "Enter Bank Guarantee amount",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Bank Guarantee Number"
                      name="bgNumber"
                      rules={[
                        {
                          required: true,
                          message: "Entere Bank Guarantee Number",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Valid From"
                      name="bgValidFrom"
                      rules={[{ required: true, message: "select Date" }]}
                    >
                      <DatePicker
                        className="w-full"
                        format="YYYY-MM-DD"
                        disabled={viewMode}
                        onChange={handleBgValidFromChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Valid Upto"
                      name="bgValidUpto"
                      rules={[{ required: true, message: "Select date" }]}
                    >
                      <DatePicker
                        className="w-full"
                        format="YYYY-MM-DD"
                        disabled={viewMode}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Upload Document"
                      name="bgDoc"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                      rules={[{ required: true, message: "Please upload doc" }]}
                    >
                      <div className="w-full">
                        <Upload
                          beforeUpload={() => false}
                          maxCount={1}
                          listType="picture"
                          disabled={viewMode}
                          style={{ width: "100%" }}
                        >
                          <Button icon={<UploadOutlined />} block>
                            Upload Document
                          </Button>
                        </Upload>
                      </div>
                    </Form.Item>
                  </Col>
                </>
              )}
              {securityType === "Post Dated Cheque" && (
                <>
                  <Col span={5}>
                    <Form.Item
                      label="Bank Name"
                      name="pdcBank"
                      rules={[
                        { required: true, message: "Please enter bank name" },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Cheque Issue Date"
                      name="pdcIssueDate"
                      rules={[
                        {
                          required: true,
                          message: "Please select cheque issue date",
                        },
                      ]}
                    >
                      <DatePicker
                        className="w-full"
                        format="YYYY-MM-DD"
                        disabled={viewMode}
                        onChange={handlePdcIssueDateChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Cheque Dated"
                      name="pdcDate"
                      rules={[
                        {
                          required: true,
                          message: "Please select cheque date",
                        },
                      ]}
                    >
                      <Input placeholder="YYYY-MM-DD" disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Cheque Number"
                      name="pdcNumber"
                      rules={[
                        {
                          required: true,
                          message: "Please enter cheque number",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Cheque Amount"
                      name="pdcAmount"
                      rules={[
                        {
                          required: true,
                          message: "Please enter cheque amount",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Valid Upto"
                      name="pdcValid"
                      rules={[
                        {
                          required: true,
                          message: "Please select valid upto date",
                        },
                      ]}
                    >
                      <DatePicker
                        className="w-full"
                        format="YYYY-MM-DD"
                        disabled={viewMode}
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
              {securityType === "Fixed Deposit" && (
                <>
                  <Col span={5}>
                    <Form.Item
                      label="Bank Name"
                      name="fdBank"
                      rules={[
                        { required: true, message: "Please enter bank name" },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Date"
                      name="fdDate"
                      rules={[
                        { required: true, message: "Please select date" },
                      ]}
                    >
                      <DatePicker
                        className="w-full"
                        format="YYYY-MM-DD"
                        disabled={viewMode}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Cheque/RTGS Number"
                      name="fdCheque"
                      rules={[
                        {
                          required: true,
                          message: "Please enter cheque number",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Security Detail/Narration"
                      name="fdSecurity"
                      rules={[
                        {
                          required: true,
                          message: "Please enter security detail",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Rate of Interest"
                      name="fdInterest"
                      rules={[
                        {
                          required: true,
                          message: "Please enter rate of interest",
                        },
                        {
                          pattern: /^(100|[0-9]{1,2})(\.\d{1,2})?$/,
                          message: "Enter a valid number between 0 and 100",
                        },
                      ]}
                    >
                      <Input
                        className={inputClass}
                        disabled={viewMode}
                        placeholder="Enter %"
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
              {securityType === "Collateral" && (
                <>
                  <Col span={5}>
                    <Form.Item
                      label="Collateral Details"
                      name="collateralDetails"
                      rules={[
                        {
                          required: true,
                          message: "Please enter collateral details",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Address Details"
                      name="collateralAddress"
                      rules={[
                        {
                          required: true,
                          message: "Please enter address details",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>

                  <Col span={5}>
                    <Form.Item
                      label="Market Value"
                      name="collateralValue"
                      rules={[
                        {
                          required: true,
                          message: "Please enter market value",
                        },
                      ]}
                    >
                      <Input className={inputClass} disabled={viewMode} />
                    </Form.Item>
                  </Col>
                </>
              )}
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
                <Form.Item
                  label="Amount Limit"
                  name="amountLimit"
                  rules={[
                    {
                      required: true,
                      message: "Please enter amount limit",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="100.00"
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label="Days Limit(No of Days)"
                  name="noDaysLimit"
                  rules={[
                    {
                      required: true,
                      message: "Enter Number of Days",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter days limit"
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label="Invoice Limit(No of Invoice)"
                  name="noInvoiceLimit"
                  rules={[
                    {
                      required: true,
                      message: "Enter Number of invoice limit",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter invoice limit"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Souda Limit (Ton)"
                  name="soudaLimit"
                  rules={[
                    {
                      required: true,
                      message: "Enter Souda Limit",
                    },
                  ]}
                >
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
                    { required: true, message: "Please enter GST number" },
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
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                  rules={[
                    { required: true, message: "Please upload GST document" },
                  ]}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                    listType="picture"
                    style={{ width: "100%" }}
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                      className="text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="TIN Number"
                  name="tinNo"
                  // rules={[
                  //   {  message: "Please enter TIN number" },
                  // ]}
                >
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
                    { required: true, message: "Please enter PAN number" },
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
                  rules={[
                    { required: true, message: "Please upload PAN document" },
                  ]}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    disabled={viewMode}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                      className=" text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Aadhar Number"
                  name="aadharNo"
                  rules={[
                    { required: true, message: "Please enter Aadhaar number" },
                    {
                      pattern: /^[0-9]{12}$/,
                      message: "Enter a valid 12-digit Aadhaar number",
                    },
                  ]}
                >
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
                  rules={[
                    {
                      required: true,
                      message: "Please upload Aadhaar document",
                    },
                  ]}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    disabled={viewMode}
                    listType="picture"
                    style={{ width: "100%" }}
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                      className="text-left bg-white border-amber-400"
                      disabled={viewMode}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="FSSAI Number"
                  name="fssaiNo"
                  rules={[
                    { required: true, message: "Please enter FSSAI number" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter FSSAI number"
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label="Trade License Number"
                  name="licenseNo"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please enter trade license number",
                  //   },
                  // ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter license number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="TDS Applicable"
                  name="tdsApplicable"
                  rules={[
                    { required: true, message: "Please select TDS option" },
                  ]}
                >
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
                <Form.Item
                  label="Rate of TDS"
                  name="tdsRate"
                  rules={[
                    { required: true, message: "Rate of TDS is required" },
                  ]}
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

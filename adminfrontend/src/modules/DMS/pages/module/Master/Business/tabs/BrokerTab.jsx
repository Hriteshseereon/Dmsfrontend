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
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { API_BASE_URL } from "@/utils/config";

// import { getBrokers, addBroker, updateBroker, getBrokerDetails } from "../../../../../../../api/broker";
import {
  getBrokerAll,
  getBrokerById,
  addBrokerPtnr,
  updateBrokerById,
  getAllVendor,
  getproductbyVendor,
  sendBrokerPassword,
} from "@/api/broker";

export const phoneValidator = (_, value) => {
  if (!value) return Promise.resolve(); // allow empty if not required

  const phone = value.toString().trim();

  // E.164 format:
  // optional +
  // first digit 1–9
  // total digits max 15
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  if (!phoneRegex.test(phone)) {
    return Promise.reject(new Error("Enter valid number "));
  }

  return Promise.resolve();
};
const { Option } = Select;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";

const vendorProductMap = {
  "Ruchi Soya": ["Soybean Oil", "Palm Oil", "Sunflower Oil"],
  "ABC Traders": ["Wheat", "Rice", "Maize"],
  "Tata Commodities": ["Tea", "Coffee"],
};

/* ================= HELPERS ================= */

/** Convert a URL string from API into Ant Design Upload fileList format */
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

const { Password } = Input;
/** Build FormData exactly like VendorTab:
 *  - one `data` key containing a JSON string of all non-file fields
 *  - separate keys for each file
 */
const buildFormData = (values) => {
  const fd = new FormData();

  fd.append("name", values.brokerName || "");
  fd.append("password", values.password || "");
  fd.append("username", values.email || values.phoneNo);
  fd.append("email", values.email);
  fd.append("phone_number", values.phoneNo || "");
  fd.append("alternate_phone", values.altPhoneNo || "");
  fd.append("whatsapp_number", values.whatsappNo || "");
  fd.append("fax_number", values.faxNo || "");
  fd.append("primary_email", values.email || "");
  fd.append("secondary_email", values.secondaryEmail || "");
  fd.append("bank_details", values.bankDetails || "");
  fd.append("gstin", values.gstin || "");
  fd.append("pan", values.panNo || "");
  fd.append("aadhar_number", values.aadharNo || "");

  fd.append("permanent_address_line1", values.permanent_address || "");
  fd.append("permanent_city", values.permanent_city || "");
  fd.append("permanent_district", values.permanent_district || "");
  fd.append("permanent_state", values.permanent_state || "");
  fd.append("permanent_pin", values.permanent_pin || "");

  fd.append("temporary_address_line1", values.current_address || "");
  fd.append("temporary_city", values.current_city || "");
  fd.append("temporary_district", values.current_district || "");
  fd.append("temporary_state", values.current_state || "");
  fd.append("temporary_pin", values.current_pin || "");

  fd.append("is_active", values.status === "Active");

  // ✅ commissions (stringified)
  fd.append(
    "commission_setups",
    JSON.stringify(
      (values.commissions || []).map((c) => ({
        vendor: c.vendor,
        product: c.product,
        commission_type: c.type,
        commission_method: c.method,
        commission_amount: c.amount,
        on_sale: true,
        on_purchase: false,
      })),
    ),
  );

  const appendFile = (key, list) => {
    if (list?.[0]?.originFileObj) {
      fd.append(key, list[0].originFileObj);
    }
  };

  appendFile("pan_document", values.panDoc);
  appendFile("aadhar_document", values.aadharDoc);
  appendFile("gstin_document", values.gstinDoc);
  appendFile("passport_document", values.passportPhoto);

  return fd;
};

export default function BrokerTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [form] = Form.useForm();

  const generatePassword = (length = 10) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  /* ================= FETCH ================= */
  const fetchBrokers = async () => {
    try {
      const res = await getBrokerAll();
      console.log("BROKER LIST:", res);
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch {
      message.error("Failed to fetch brokers");
    }
  };
  const fetchVendors = async () => {
    try {
      const res = await getAllVendor();
      setVendors(res);
    } catch {
      message.error("Failed to load vendors");
    }
  };
  useEffect(() => {
    fetchBrokers();
    fetchVendors();
  }, []);

  // password send button handler
  const handleSendPassword = async (record) => {
    try {
      await sendBrokerPassword(record.id);
      message.success(`Password sent to ${record.primary_email}`);
    } catch (err) {
      message.error("Failed to send password email");
    }
  };
  const handleVendorChange = async (vendorId) => {
    try {
      if (productsMap[vendorId]) return; // already loaded

      const res = await getproductbyVendor(vendorId);

      setProductsMap((prev) => ({
        ...prev,
        [vendorId]: res.products || [],
      }));
    } catch {
      message.error("Failed to load products");
    }
  };
  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    brokerName: d.name,
    phoneNo: d.phone_number,
    altPhoneNo: d.alternate_phone,
    whatsappNo: d.whatsapp_number,
    faxNo: d.fax_number,
    email: d.primary_email,
    secondaryEmail: d.secondary_email,
    status: d.is_active ? "Active" : "Inactive",

    permanent_address: d.permanent_address_line1,
    permanent_city: d.permanent_city,
    permanent_district: d.permanent_district,
    permanent_state: d.permanent_state,
    permanent_pin: d.permanent_pin,

    current_address: d.temporary_address_line1,
    current_city: d.temporary_city,
    current_district: d.temporary_district,
    current_state: d.temporary_state,
    current_pin: d.temporary_pin,

    panNo: d.pan,
    aadharNo: d.aadhar_number,
    bankDetails: d.bank_details,
    gstin: d.gstin,

    panDoc: fileFromUrl(d.pan_document),
    aadharDoc: fileFromUrl(d.aadhar_document),
    gstinDoc: fileFromUrl(d.gstin_document),
    passportPhoto: fileFromUrl(d.passport_document),

    commissions: (d.commissions || []).map((c) => ({
      vendor: c.vendor,
      product: c.product,
      type: c.commission_type,
      method: c.commission_method,
      amount: c.commission_amount,
    })),
  });

  const openBroker = async (record, view = false) => {
    try {
      const details = await getBrokerById(record.id);
      // preload products for existing commissions
      for (const c of details.commissions || []) {
        await handleVendorChange(c.vendor);
      }
      form.setFieldsValue(mapDetailsToForm(details));
      setSelected(details);
      setViewMode(view);
      setOpen(true);
    } catch {
      message.error("Failed to load broker details");
    }
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const formData = buildFormData(values);

      if (selected) {
        await updateBrokerById(selected.id, formData);
        message.success("Broker Updated");
      } else {
        await addBrokerPtnr(formData);
        message.success("Broker Added");
      }

      setOpen(false);
      form.resetFields();
      fetchBrokers();
    } catch (e) {
      console.error(e);
      message.error("Save failed");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Broker Name</span>,
      dataIndex: "name",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Phone</span>,
      dataIndex: "phone_number",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      dataIndex: "primary_email",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">WhatsApp</span>,
      dataIndex: "whatsapp_number",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      render: (_, record) => (
        <span className="text-amber-800">
          {record.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-red-500! cursor-pointer! text-base! hover:text-red-600!"
            onClick={() => openBroker(record, true)}
          />
          <EditOutlined
            className="text-blue-500! cursor-pointer! text-base! hover:text-blue-600!"
            onClick={() => openBroker(record, false)}
          />
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Password</span>,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          className="bg-amber-500! border-none! hover:bg-amber-600!"
          onClick={() => handleSendPassword(record)}
        >
          Send
        </Button>
      ),
    },
  ];

  const filteredData = data.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */
  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search broker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64! border-amber-400! focus:border-amber-600! text-amber-700! placeholder:text-amber-400!"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              fetchBrokers();
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
          onClick={() => {
            setSelected(null);
            setViewMode(false);
            form.resetFields();
            const autoPassword = generatePassword();
            form.setFieldsValue({
              password: autoPassword,
            });
            setOpen(true);
          }}
        >
          Add Broker
        </Button>
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Broker Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your broker data</p>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          rowClassName="hover:bg-amber-50"
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
            {viewMode ? "View Broker" : selected ? "Edit Broker" : "Add Broker"}
          </span>
        }
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "Active" }}
        >
          {/* ================= Broker Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Broker Details
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="Broker Bussiness Name" name="businessName">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter business name"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Broker Name"
                  name="brokerName"
                  rules={[
                    { required: true, message: "Broker name is required" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter broker name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNo"
                  rules={[{ required: true }, { validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter phone number"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Alternate Phone"
                  name="altPhoneNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter alternate phone"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="WhatsApp Number"
                  name="whatsappNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter WhatsApp number"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Fax Number" name="faxNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter fax number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Primary Email"
                  name="email"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter primary email"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Password" name="password">
                  <Password
                    className={inputClass}
                    disabled={viewMode || selected}
                    placeholder="Auto generated password"
                    visibilityToggle
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Secondary Email" name="secondaryEmail">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter secondary email"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Status" name="status">
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

          {/* ================= Address Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Address Details
            </h3>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Address1" name="permanent_address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter permanent address"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Address2" name="current_address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter current address"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="City"
                  name="permanent_city"
                  rules={[
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: "Only letters and spaces are allowed",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter city"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="District"
                  name="permanent_district"
                  rules={[
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: "Only letters and spaces are allowed",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="State"
                  name="permanent_state"
                  rules={[
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: "Only letters and spaces are allowed",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter state"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Pin Code"
                  name="permanent_pin"
                  rules={[
                    {
                      pattern: /^[0-9]{6}$/,
                      message: "Only numbers are allowed",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* <h4 className="text-amber-600 font-medium mt-4 mb-2">
              Current Address
            </h4>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="Address" name="current_address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter current address"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="City" name="current_city">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter city"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="District" name="current_district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="State" name="current_state">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter state"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Pin Code" name="current_pin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                  />
                </Form.Item>
              </Col>
            </Row> */}
          </Card>

          {/* ================= Documents & KYC ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Legal Deyails
            </h3>
            <Row gutter={24}>
              {/* PAN */}
              <Col span={4}>
                <Form.Item label="PAN Number" name="panNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter PAN number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="PAN Document"
                  name="panDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* Aadhar */}
              <Col span={4}>
                <Form.Item
                  label="Aadhar Number"
                  name="aadharNo"
                  rules={[
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
              <Col span={6}>
                <Form.Item
                  label="Aadhar Document"
                  name="aadharDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* Bank Details */}
              <Col span={6}>
                <Form.Item label="Bank AC number" name="bankDetails">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter bank account number"
                  />
                </Form.Item>
              </Col>

              {/* Passport Photo */}
              <Col span={6}>
                <Form.Item
                  label="Passport Photo"
                  name="passportPhoto"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* GSTIN */}
              <Col span={4}>
                <Form.Item label="GSTIN Number" name="gstin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter GSTIN number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="GSTIN Document"
                  name="gstinDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Commission Setup ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Commission Setup
            </h3>

            <Form.List name="commissions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      className="mb-3 border border-amber-100"
                      title={
                        <span className="text-amber-700">
                          Commission {index + 1}
                        </span>
                      }
                      extra={
                        !viewMode && (
                          <MinusCircleOutlined
                            className="text-red-500 cursor-pointer"
                            onClick={() => remove(name)}
                          />
                        )
                      }
                    >
                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            label="Supllier"
                            name={[name, "vendor"]}
                            rules={[
                              {
                                required: true,
                                message: "vendor name is required",
                              },
                            ]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select vendor"
                              onChange={(value) => handleVendorChange(value)}
                            >
                              {vendors.map((v) => (
                                <Option key={v.id} value={v.id}>
                                  {v.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            label="Product"
                            name={[name, "product"]}
                            rules={[
                              {
                                required: true,
                                message: "Product is required",
                              },
                            ]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select product"
                            >
                              {(
                                productsMap[
                                  form.getFieldValue([
                                    "commissions",
                                    name,
                                    "vendor",
                                  ])
                                ] || []
                              ).map((p) => (
                                <Option key={p.id} value={p.id}>
                                  {p.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            label="Commission Type"
                            name={[name, "type"]}
                            rules={[
                              {
                                required: true,
                                message: "comission type is required",
                              },
                            ]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select type"
                            >
                              <Option value="Percentage">Percentage</Option>
                              <Option value="FixedAmount">Fixed Amount</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            label="Method"
                            name={[name, "method"]}
                            rules={[
                              {
                                required: true,
                                message: "commision method is required",
                              },
                            ]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select method"
                            >
                              <Option value="PerUnit">Per Unit</Option>
                              <Option value="PerValue">Per Value</Option>
                              <Option value="PerTransaction">
                                Per Transaction
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            label="Amount"
                            name={[name, "amount"]}
                            rules={[
                              {
                                required: true,
                                message: "amount is required",
                              },
                            ]}
                          >
                            <Input
                              className={inputClass}
                              disabled={viewMode}
                              placeholder="Enter amount"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}

                  {!viewMode && (
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                      className="border-amber-400 text-amber-700"
                    >
                      Add Another Commission
                    </Button>
                  )}
                </>
              )}
            </Form.List>
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

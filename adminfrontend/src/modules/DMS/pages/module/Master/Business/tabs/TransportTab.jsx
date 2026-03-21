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
  message,
  Upload,
  Select,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  getAllTransport,
  createTransport,
  updateTransport,
  getTransportById,
  sendTransportCredential,
} from "@/api/transport.js";
// import { getTransporters, addTransporter, updateTransporter, getTransporterDetails } from "../../../../../../../api/transporter";
import { API_BASE_URL } from "@/utils/config";

const inputClass = "border-amber-400 h-8";
const passwordClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";
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
export default function TransportTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const { Option } = Select;
  const [form] = Form.useForm();
  const generatePassword = (length = 10) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  /* ================= FETCH ================= */
  const fetchTransporters = async () => {
    try {
      const res = await getAllTransport();
      const list = Array.isArray(res) ? res : res?.results || [];
      setData(list);
    } catch {
      message.error("Failed to fetch transporters");
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

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
  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    agencyName: d.registered_name,
    contactPersonName: d.contact_person_name,
    mobileNo: d.phone_number,
    altMobileNo: d.alternate_mobile_no,
    whatsappNo: d.whatsapp_number,
    email: d.email_id,
    secondaryEmail: d.secondary_email,
    panNo: d.pan,
    gstin: d.gstin,
    ownerAadharNo: d.owner_aadhar_number,
    address1: d.address_1,
    address2: d.address_2,
    city: d.city,
    state: d.state,
    district: d.district,
    pinCode: d.pin,
    status: d.is_active ? "true" : "false",
    // ✅ FILE PREVIEW DATA
    panDoc: fileFromUrl(d.pan_document),
    gstDoc: fileFromUrl(d.gstin_document),
    aadharDoc: fileFromUrl(d.aadhar_document),
  });
  const buildFormData = (values) => {
    const fd = new FormData();

    fd.append("registered_name", values.agencyName || "");
    fd.append("contact_person_name", values.contactPersonName || "");
    fd.append("email_id", values.email || "");
    fd.append("secondary_email", values.secondaryEmail || "");
    fd.append("password", values.password || "");
    fd.append("phone_number", values.mobileNo || "");
    fd.append("alternate_mobile_no", values.altMobileNo || "");
    fd.append("whatsapp_number", values.whatsappNo || "");
    fd.append("is_active", values.status === "true");
    fd.append("pan", values.panNo || "");

    fd.append("gstin", values.gstin || "");
    fd.append("owner_aadhar_number", values.ownerAadharNo || "");
    fd.append("address_1", values.address1 || "");
    fd.append("address_2", values.address2 || "");
    fd.append("city", values.city || "");
    fd.append("state", values.state || "");
    fd.append("district", values.district || "");
    fd.append("pin", values.pinCode || "");

    // FILES
    if (values.panDoc?.[0]?.originFileObj)
      fd.append("pan_document", values.panDoc[0].originFileObj);

    if (values.gstDoc?.[0]?.originFileObj)
      fd.append("gstin_document", values.gstDoc[0].originFileObj);

    if (values.aadharDoc?.[0]?.originFileObj)
      fd.append("aadhar_document", values.aadharDoc[0].originFileObj);

    return fd;
  };
  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const formData = buildFormData(values);

      if (selected) {
        await updateTransport(selected.id, formData);
        message.success("Transporter Updated");
      } else {
        await createTransport(formData);
        message.success("Transporter Added");
      }

      setOpen(false);
      form.resetFields();
      fetchTransporters();
    } catch (e) {
      message.error("Save failed");
    }
  };
  // mail sending function
  const handleSendPassword = async (record) => {
    try {
      const partnerId = record.id;

      setSendingId(partnerId);

      const payload = {
        partner_type: "transport",
        partner_id: partnerId,
      };

      await sendTransportCredential(payload);

      message.success("Mail successfully sent");

      setData((prev) =>
        prev.map((item) =>
          item.id === partnerId ? { ...item, credentials_sent: true } : item,
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

  return data.filter((item) => {
    return Object.values(item).some((val) => {
      if (!val) return false;

      // convert everything safely to string
      return JSON.stringify(val).toLowerCase().includes(value);
    });
  });
};

const handleReset = () => {
  setSearch("");
};
  /* ================= TABLE ================= */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Agency Name</span>,
      dataIndex: "registered_name",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile</span>,
      dataIndex: "phone_number",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      dataIndex: "email_id",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">City</span>,
      dataIndex: "city",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">State</span>,
      dataIndex: "state",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-red-500! cursor-pointer! text-base! hover:text-red-600!"
            onClick={async () => {
              const details = await getTransportById(record.id);

              form.setFieldsValue(mapDetailsToForm(details));
              setSelected(details);
              setViewMode(true);
              setOpen(true);
            }}
          />
          <EditOutlined
            className="text-blue-500! cursor-pointer! text-base! hover:text-blue-600!"
            onClick={async () => {
              const details = await getTransportById(record.id);

              form.setFieldsValue(mapDetailsToForm(details));
              setSelected(details);
              setViewMode(false);
              setOpen(true);
            }}
          />
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Password</span>,
      render: (_, record) => {
        const partnerId = record.id;

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
            {record.credentials_sent
              ? "Sent"
              : sendingId === partnerId
                ? "Sending..."
                : "Send"}
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
            placeholder="Search transporter..."
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

        {/* Right: Add Transport */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
          onClick={() => {
            const randomPassword = generatePassword();
            setSelected(null);
            setViewMode(false);
            form.resetFields();
            form.setFieldsValue({
              password: randomPassword,
              status: "true",
            });
            setOpen(true);
          }}
        >
          Add Transport
        </Button>
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Transport Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your transport data</p>
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
            {viewMode
              ? "View Transporter"
              : selected
                ? "Edit Transporter"
                : "Add Transporter"}
          </span>
        }
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* ================= Transporter / Agency Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Transporter / Agency Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Agency Name"
                  name="agencyName"
                  rules={[
                    { required: true, message: "Agency name is required" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter agency name"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Contact Person Name"
                  name="contactPersonName"
                  rules={[
                    {
                      required: true,
                      message: "Contact person name is required",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter contact person name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Mobile Number"
                  name="mobileNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter mobile number"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Alternate Mobile No"
                  name="altMobileNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter alternate mobile number"
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

              <Col span={6}>
                <Form.Item
                  label="Primary Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email id is required" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter primary email"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Secondary Email"
                  name="secondaryEmail"
                  rules={[
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter secondary email"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Password" name="password">
                  <Input.Password
                    className={passwordClass}
                    disabled={viewMode || selected}
                    placeholder="Enter password"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Status is required" }]}
                >
                  <Select className={selectClass} disabled={viewMode}>
                    <Option value="true">Active</Option>
                    <Option value="false">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {/* ================= Address & Location ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Address & Location
            </h3>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="Address Line 1"
                  name="address1"
                  rules={[{ required: true, message: "Address1 is required" }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address line 1"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Address Line 2" name="address2">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address line 2"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[
                    { required: true, message: "City name is required" },
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
                  label="State"
                  name="state"
                  rules={[
                    { required: true, message: "state name is required" },
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
                  label="District"
                  name="district"
                  rules={[
                    { required: true, message: "District name is required" },
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
                  label="Pin Code"
                  name="pinCode"
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
          </Card>
          {/* ================= Business & KYC Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Legal Details
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="PAN Number" name="panNo">
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
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                  >
                    <Button
                      disabled={viewMode}
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="GSTIN Number" name="gstin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter GSTIN number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="GST Document"
                  name="gstDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                  >
                    <Button
                      disabled={viewMode}
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Owner Aadhar Number"
                  name="ownerAadharNo"
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
                    placeholder="Enter owner Aadhar number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Adhar Document"
                  name="aadharDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                  >
                    <Button
                      disabled={viewMode}
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                    >
                      Upload
                    </Button>
                  </Upload>
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
                className="bg-amber-500! border-none!"
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

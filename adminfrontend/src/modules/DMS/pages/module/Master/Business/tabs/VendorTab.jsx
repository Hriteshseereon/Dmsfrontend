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
  DatePicker,
  InputNumber,
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
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  getVendors,
  addvendor,
  createVendor,
  updateVendor,
  getVendorDetailsByid,
} from "../../../../../../../api/bussinesspatnr";
import {
  getCountryOptions,
  getStateOptions,
  getDistrictOptions,
  getCityOptions,
  getCountryIsoByName,
  getStateIsoByName,
} from "../../../../../../../utils/locationHelper";

const { Option } = Select;
import { API_BASE_URL } from "@/utils/config";
const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";

// /* ================= PHONE VALIDATOR ================= */
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
export default function VendorTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selCountryIso, setSelCountryIso] = useState("IN");
  const [selStateName, setSelStateName] = useState(null);
  const [selStateIso, setSelStateIso] = useState(null);
  const [form] = Form.useForm();

  /* ================= FETCH ================= */
  const fetchVendors = async () => {
    try {
      const res = await getVendors();

      const list = Array.isArray(res) ? res : res?.results || [];

      setData(list);
    } catch {
      message.error("Failed to fetch vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
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
  // handler for rendering the city state and district
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

  const handleStateChange = (isoCode, option) => {
    setSelStateName(option.label);
    setSelStateIso(isoCode);
    form.setFieldsValue({
      state: option.label,
      district: undefined,
      city: undefined,
    });
  };

  const handleDistrictChange = () => {
    form.setFieldsValue({ city: undefined });
  };

  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    name: d.name || d.company_name,
    shortName: d.short_name,
    companyType: d.company_type,
    mobileNo1: d.mobile_no_1,
    mobileNo2: d.mobile_no_2,
    phoneNumber: d.phone_number,
    whatsappNo: d.whatsapp_number,
    email1: d.email_address || d.primary_email,
    email2: d.secondary_email,
    socialLink: d.social_link,
    websiteUrl: d.company_website,
    companyGroupName: d.company_group_name,
    contactPerson:
      d.contact_person_input?.name ||
      d.contact_person_input?.contact_person_name ||
      d.contact_person,
    gender: d.contact_person_details?.gender || d.gender,
    contactMobile:
      d.contact_person_input?.contact_person_no ||
      d.contact_person_input?.mobile_no ||
      d.contact_person_no ||
      d.mobile_no_1,
    contactWhatsapp:
      d.contact_person_input?.contact_person_whats_no ||
      d.contact_person_input?.whatsapp_no ||
      d.whatsapp_no ||
      d.whatsapp_number,
    contactEmail:
      d.contact_person_input?.contact_person_email ||
      d.contact_person_input?.email ||
      d.email_address ||
      d.primary_email,
    aadharNo:
      d.contact_person_input?.aadhaar_no ||
      d.contact_person_input?.aadhar_no ||
      d.contact_person_input?.aadharNo ||
      d.contact_person_input?.adhara_no ||
      d.aadhar_no ||
      d.aadhaar_no ||
      d.adhara_no,

    tinNo: d.business_details?.tin_no,
    tinDate: d.business_details?.tin_date
      ? dayjs(d.business_details.tin_date)
      : null,
    panNo: d.business_details?.pan || d.business_details?.pan_no,
    fssaiNo: d.business_details?.fssai_no,
    gstIn: d.business_details?.gstin || d.business_details?.gstin_no,
    igstApplicable: d.business_details?.igst_applicable ? "Yes" : "No",

    address1: d.addresses?.[0]?.address_line1 || d.addresses?.address_line_1,
    address2: d.addresses?.[0]?.address_line2 || d.addresses?.address_line_2,
    country: d.addresses?.[0]?.country || "India",
    state: d.addresses?.[0]?.state || d.addresses?.state,
    district: d.addresses?.[0]?.district || d.addresses?.district,
    city: d.addresses?.[0]?.city || d.addresses?.city,
    location: d.addresses?.[0]?.location || d.addresses?.location,
    pinCode: d.addresses?.[0]?.pin || d.addresses?.pin_code,
    transactionType:
      d.addresses?.[0]?.transaction_type || d.addresses?.transaction_type,

    status: (
      d.is_active !== undefined
        ? d.is_active
        : d.addresses?.[0]?.status === "Active" ||
          d.addresses?.status === "Active"
    )
      ? "Active"
      : "Inactive",

    // ✅ FILE PREVIEW
    panDoc: fileFromUrl(d.pan_document || d.business_details?.pan_document),
    gstDoc: fileFromUrl(d.gstin_document || d.business_details?.gstin_document),
    tinDoc: fileFromUrl(d.tin_document || d.business_details?.tin_document),
    aadharDoc: fileFromUrl(
      d.aadhaar_documents ||
        d.aadhar_document ||
        d.business_details?.aadhaar_documents,
    ),

    plants: (d.plants || []).map((p) => ({
      plantName: p.name || p.plant_name,
      address: p.address,
      phoneNo: p.phone_number || p.phone_no,
      email: p.email_address || p.email,
      country: p.country || "India",
      state: p.state,
      district: p.district,
      city: p.city,
      pin: p.pin,
      faxNo: p.fax_no,
    })),
  });

  const openVendor = async (record, view = false) => {
    try {
      const details = await getVendorDetailsByid(record.id);

      form.setFieldsValue(mapDetailsToForm(details));
      setSelected(details);
      setViewMode(view);
      setOpen(true);
    } catch {
      message.error("Failed to load vendor");
    }
  };
  // payload for create and update the vendor
  const buildFormData = (values) => {
    const fd = new FormData();

    const payload = {
      name: values.name,
      short_name: values.shortName,
      company_type: values.companyType,
      mobile_no_1: values.mobileNo1?.toString(),
      mobile_no_2: values.mobileNo2?.toString(),
      phone_number:
        values.phoneNumber?.toString() || values.mobileNo1?.toString(),
      whatsapp_number: values.whatsappNo?.toString(),
      email_address: values.email1,
      secondary_email: values.email2,
      social_link: values.socialLink,
      company_website: values.websiteUrl,
      is_active: values.status === "Active",
      company_group_name: values.companyGroupName,
      contact_person_input: {
        name: values.contactPerson || "",
        gender: values.gender,
        contact_person_no: values.contactMobile?.toString() || "",
        contact_person_whats_no: values.contactWhatsapp?.toString() || "",
        contact_person_email: values.contactEmail,
        aadhaar_no: values.aadharNo,
      },

      addresses: [
        {
          address_line1: values.address1,
          address_line2: values.address2,
          country: values.country,
          state: values.state,
          district: values.district,
          city: values.city,
          location: values.location,
          pin: values.pinCode?.toString(),
          transaction_type: values.transactionType,
        },
      ],

      plants: (values.plants || []).map((p) => ({
        name: p.plantName,
        address: p.address,
        fax_no: p.faxNo,
        country: p.country,
        state: p.state,
        city: p.city,
        district: p.district,
        pin: p.pin?.toString(),
        phone_number: p.phoneNo?.toString(),
        email_address: p.email,
      })),

      business_details: {
        pan: values.panNo,
        gstin: values.gstIn,
        tin_no: values.tinNo,
        tin_date: values.tinDate
          ? dayjs(values.tinDate).format("YYYY-MM-DD")
          : null,
        igst_applicable: values.igstApplicable === "Yes",
        fssai_no: values.fssaiNo,
      },
    };

    // ✅ JSON inside form-data
    fd.append("data", JSON.stringify(payload));

    const appendFile = (key, fileList) => {
      if (fileList?.[0]?.originFileObj) {
        fd.append(key, fileList[0].originFileObj);
      }
    };

    appendFile("pan_document", values.panDoc);
    appendFile("gstin_document", values.gstDoc);
    appendFile("tin_document", values.tinDoc);
    appendFile("aadhaar_documents", values.aadharDoc);

    return fd;
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const formData = buildFormData(values);

      if (selected) {
        await updateVendor(selected.id, formData);
        message.success("Vendor Updated");
      } else {
        await createVendor(formData);
        message.success("Vendor Created");
      }

      setOpen(false);
      form.resetFields();
      fetchVendors();
    } catch (e) {
      console.log(e);
      message.error("Save failed");
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
      title: <span className="text-amber-700 font-semibold">Company Name</span>,
      render: (_, record) => (
        <span className="text-amber-800">
          {record.name || record.company_name}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Short Name</span>,
      dataIndex: "short_name",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile</span>,
      dataIndex: "mobile_no_1",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      render: (_, record) => (
        <span className="text-amber-800">
          {record.email_address || record.primary_email}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      render: (_, record) => (
        <span className="text-amber-800">
          {record.is_active ||
          record.addresses?.[0]?.status === "Active" ||
          record.addresses?.status === "Active"
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-red-500! cursor-pointer! text-base! hover:text-red-600!"
            onClick={() => openVendor(record, true)}
          />
          <EditOutlined
            className="text-blue-500! cursor-pointer! text-base! hover:text-blue-600!"
            onClick={() => openVendor(record, false)}
          />
        </div>
      ),
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
            placeholder="Search vendor..."
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

        {/* Right: Add Vendor */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
          onClick={() => {
            setSelected(null);
            setViewMode(false);
            form.resetFields();
            setOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Supplier Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your supplier data</p>
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
              ? "View Supplier"
              : selected
                ? "Edit Supplier"
                : "Add Supplier"}
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
          initialValues={{
            status: "Active",
            igstApplicable: "No",
            companyType: "Supplier",
          }}
        >
          {/* ================= Vendor / Company Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Supplier Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Supplier Name"
                  name="name"
                  rules={[
                    { required: true, message: "Supplier name is required" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Company name"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Short Name"
                  name="shortName"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Add a company Short name"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Mobile No 1"
                  name="mobileNo1"
                  rules={[
                    { required: true, message: "Mobile number is required" },
                    { validator: phoneValidator },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="+917833242424"
                    maxLength={16} // + + 15 digits
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Mobile No 2"
                  name="mobileNo2"
                  rules={[
                    {
                      message: "Enter a valid 10-digit mobile number",
                    },
                    { validator: phoneValidator },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="7984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Primary Email"
                  name="email1"
                  rules={[
                    { required: true, message: "Primary email is required" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Secondary Email"
                  name="email2"
                  rules={[
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="WhatsApp No"
                  name="whatsappNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Social Link"
                  name="socialLink"
                  rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="https://www.facebook.com/"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Company Website"
                  name="websiteUrl"
                  rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="https://www.example.com"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Supplier Type"
                  name="companyType"
                  rules={[
                    { required: true, message: "Please select supplier type" },
                  ]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Type"
                  >
                    <Option value="Supplier">Supplier</Option>
                    <Option value="Both">Both</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Contact Person Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Contact Person Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Contact Person Name"
                  name="contactPerson"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Mr. John Doe"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Mobile No"
                  name="contactMobile"
                  rules={[{ required: true }, { validator: phoneValidator }]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="WhatsApp No"
                  name="contactWhatsapp"
                  rules={[{ validator: phoneValidator }]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Gender" name="gender">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Gender"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Email"
                  name="contactEmail"
                  rules={[
                    { required: true, message: "Email is required" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>

              {/* <Col span={6}>
                <Form.Item label="Aadhar No" name="aadharNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="123456789012"
                    maxLength={14}
                  />
                </Form.Item>
              </Col> */}

              {/* <Col span={6}>
                
                <Form.Item
                  name="aadharDoc"
                  label="Aadhar Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col> */}
            </Row>
          </Card>

          {/* ================= Tax & Registration ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Tax & Registration
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="GSTIN No" name="gstIn">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="GSTIN1234567890"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                {/* <Form.Item label="GSTIN Document" name="gstDoc"> */}
                <Form.Item
                  name="gstDoc"
                  label="GSTIN Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
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
                <Form.Item label="PAN No" name="panNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="PAN1234567890"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  name="panDoc"
                  label="PAN Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
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
                  label="TIN No"
                  name="tinNo"
                  rules={[
                    {
                      pattern: /^[A-Z0-9]{11,15}$/,
                      message: "Please enter a valid TIN number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="TIN1234567890"
                  />
                </Form.Item>
              </Col>

              {/* <Col span={4}>
                <Form.Item label="TIN Date" name="tinDate">
                  <DatePicker className="w-full h-10" disabled={viewMode} />
                </Form.Item>
              </Col> */}

              <Col span={4}>
                {/* <Form.Item label="TIN Document" name="tinDoc"> */}
                <Form.Item
                  name="tinDoc"
                  label="TIN Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                    onPreview={(file) => {
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      );
                    }}
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
                <Form.Item label="FSSAI No" name="fssaiNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter FSSAI Number"
                  />
                </Form.Item>
              </Col>
              {/* <Col span={4}>
                <Form.Item label="IGST Applicable" name="igstApplicable">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Form.Item>
              </Col> */}
            </Row>
          </Card>

          {/* ================= Address & Location ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Address & Location
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Address Line 1"
                  name="address1"
                  rules={[
                    { required: true, message: "Missing Address Line 1" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Address Line 1"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Address Line 2" name="address2">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Address Line 2"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: "Please select country" }]}
                  initialValue="India"
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    showSearch
                    optionFilterProp="label"
                    options={getCountryOptions()}
                    onChange={(isoCode, option) => {
                      setSelCountryIso(isoCode);
                      setSelStateName(null);
                      setSelStateIso(null);

                      form.setFieldsValue({
                        country: option.label,
                        state: undefined,
                        district: undefined,
                        city: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[{ required: true }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select state"
                    showSearch
                    optionFilterProp="label"
                    value={selStateIso}
                    options={getStateOptions("IN")}
                    onChange={handleStateChange}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="District"
                  name="district"
                  rules={[{ required: true }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateName}
                    placeholder="Select district"
                    showSearch
                    optionFilterProp="label"
                    options={getDistrictOptions(selStateName)}
                    onChange={handleDistrictChange}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateIso}
                    placeholder="Select city"
                    showSearch
                    optionFilterProp="label"
                    options={getCityOptions("IN", selStateIso)}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Google Location"
                  name="location"
                  // rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Location"
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
                      message: "Please enter a valid Pin Code",
                    },
                  ]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Pin Code"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Status" name="status">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Status"
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Type of Transaction" name="transactionType">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Transaction Type"
                  >
                    <Option value="Super Stockist">Super Stockist</Option>
                    <Option value="Distributer">Distributer</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Plant Details (Dynamic) ================= */}
          <h3 className="text-lg font-semibold text-amber-700 mt-4 mb-2">
            Company Group name
          </h3>
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="Company Group Name" name="companyGroupName">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Company Group Name"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <div className="max-h-60 overflow-y-auto pr-2 mb-4">
            <Form.List name="plants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      title={
                        <span className="text-amber-700">
                          Plant {index + 1}
                        </span>
                      }
                      extra={
                        !viewMode && (
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-500 hover:text-red-700"
                          />
                        )
                      }
                      style={{ marginBottom: 16, border: "1px solid #ffc877" }}
                    >
                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "plantName"]}
                            label="Plant Name"
                            rules={[
                              { required: true, message: "Missing Plant Name" },
                            ]}
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Plant Name"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "address"]}
                            label="Address"
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Plant Address"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "phoneNo"]}
                            label="Phone No"
                            rules={[
                              {
                                required: true,
                                message: "Mobile number is required",
                              },

                              { validator: phoneValidator },
                            ]}
                          >
                            <InputNumber
                              disabled={viewMode}
                              placeholder="Enter Phone Number"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "email"]}
                            label="Email"
                            rules={[
                              { required: true, message: "Email is required" },
                              {
                                type: "email",
                                message: "Please enter a valid email address",
                              },
                            ]}
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Email"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "country"]}
                            label="Country"
                            initialValue="India"
                            rules={[
                              { required: true, message: "Select Country" },
                            ]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              options={getCountryOptions()}
                              onChange={(isoCode, option) => {
                                const plants =
                                  form.getFieldValue("plants") || [];
                                plants[name] = {
                                  ...plants[name],
                                  country: option.label,
                                  state: undefined,
                                  district: undefined,
                                  city: undefined,
                                  stateIso: null,
                                };
                                form.setFieldsValue({ plants });
                              }}
                              disabled={viewMode}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "state"]}
                            label="State"
                            rules={[
                              { required: true, message: "Select State" },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select State"
                              optionFilterProp="label"
                              options={getStateOptions("IN")}
                              onChange={(isoCode, option) => {
                                const plants =
                                  form.getFieldValue("plants") || [];
                                plants[name] = {
                                  ...plants[name],
                                  state: option.label,
                                  district: undefined,
                                  city: undefined,
                                  stateIso: isoCode,
                                };
                                form.setFieldsValue({ plants });
                              }}
                              disabled={viewMode}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "district"]}
                            label="District"
                            rules={[
                              { required: true, message: "Select District" },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select District"
                              optionFilterProp="label"
                              disabled={
                                viewMode ||
                                !form.getFieldValue(["plants", name, "state"])
                              }
                              options={getDistrictOptions(
                                form.getFieldValue(["plants", name, "state"]),
                              )}
                              onChange={() => {
                                const plants =
                                  form.getFieldValue("plants") || [];
                                plants[name] = {
                                  ...plants[name],
                                  city: undefined,
                                };
                                form.setFieldsValue({ plants });
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "city"]}
                            label="City"
                            rules={[{ required: true, message: "Select City" }]}
                          >
                            <Select
                              showSearch
                              placeholder="Select City"
                              optionFilterProp="label"
                              disabled={
                                viewMode ||
                                !form.getFieldValue([
                                  "plants",
                                  name,
                                  "stateIso",
                                ])
                              }
                              options={getCityOptions(
                                "IN",
                                form.getFieldValue([
                                  "plants",
                                  name,
                                  "stateIso",
                                ]),
                              )}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "pin"]}
                            label="Pin"
                            rules={[
                              {
                                pattern: /^[0-9]{6}$/,
                                message: "Please enter a valid Pin Code",
                                required: true,
                              },
                            ]}
                          >
                            <InputNumber
                              disabled={viewMode}
                              placeholder="Enter Pin"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>

                        {/* <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "faxNo"]}
                            label="Fax No"
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Fax No"
                            />
                          </Form.Item>
                        </Col> */}
                      </Row>
                    </Card>
                  ))}

                  {!viewMode && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        className="border-amber-400 text-amber-700 hover:bg-amber-100"
                      >
                        Add Plant
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </div>

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

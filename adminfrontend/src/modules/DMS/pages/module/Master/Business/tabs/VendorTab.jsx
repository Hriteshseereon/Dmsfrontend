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
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  getVendors,
  addvendor,
  updateVendor,
} from "../../../../../../../api/bussinesspatnr";

const { Option } = Select;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-10 w-full";

export default function VendorTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form] = Form.useForm();

  /* ================= FETCH ================= */
  const fetchVendors = async () => {
    try {
      // const res = await getVendors();
      // const list = Array.isArray(res) ? res : res?.results || [];
      // setData(list);
      setData([]); // replace with API call
    } catch {
      message.error("Failed to fetch vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    name: d.name,
    shortName: d.short_name,
    mobileNo1: d.mobile_no1,
    mobileNo2: d.mobile_no2,
    email1: d.email1,
    email2: d.email2,
    whatsappNo: d.whatsapp_no,
    socialLink: d.social_link,
    websiteUrl: d.website_url,
    // Contact Person
    contactPerson: d.contact_person_input?.name,
    contactMobile: d.contact_person_input?.contact_person_no,
    contactWhatsapp: d.contact_person_input?.contact_person_whats_no,
    gender: d.contact_person_input?.gender,
    contactEmail: d.contact_person_input?.contract_person_email,
    aadharNo: d.contact_person_input?.adhara_no,
    // Tax
    tinNo: d.tax?.tin_no,
    tinDate: d.tax?.tin_date ? dayjs(d.tax.tin_date) : null,
    panNo: d.tax?.pan,
    gstIn: d.tax?.gstin,
    igstApplicable: d.tax?.igst_applicable ? "Yes" : "No",
    // Address
    address1: d.addresses?.[0]?.address_line1,
    address2: d.addresses?.[0]?.address_line2,
    location: d.addresses?.[0]?.location,
    state: d.addresses?.[0]?.state,
    district: d.addresses?.[0]?.district,
    city: d.addresses?.[0]?.city,
    pinCode: d.addresses?.[0]?.pin,
    status: d.is_active ? "Active" : "Inactive",
    transactionType: d.transaction_type,
    // Plants
    plants: (d.plants || []).map((p) => ({
      plantName: p.name,
      address: p.address,
      phoneNo: p.phone_number,
      email: p.email_address,
      state: p.state,
      district: p.district,
      city: p.city,
      pin: p.pin,
      faxNo: p.fax_no,
    })),
  });

  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name || "",
        short_name: values.shortName || "",
        is_active: values.status === "Active",
        mobile_no1: values.mobileNo1,
        mobile_no2: values.mobileNo2,
        email1: values.email1,
        email2: values.email2,
        whatsapp_no: values.whatsappNo,
        social_link: values.socialLink,
        website_url: values.websiteUrl,
        transaction_type: values.transactionType,

        contact_person_input: {
          name: values.contactPerson || "",
          contact_person_no: values.contactMobile || "",
          gender: values.gender || "",
          contact_person_whats_no: values.contactWhatsapp || "",
          contract_person_email: values.contactEmail || "",
          adhara_no: values.aadharNo || "",
          adhara_documents: [],
        },

        addresses: [
          {
            address_line1: values.address1 || "",
            address_line2: values.address2 || "",
            state: values.state || "",
            district: values.district || "",
            city: values.city || "",
            location: values.location || "",
            pin: values.pinCode || "",
          },
        ],

        plants: (values.plants || []).map((p) => ({
          name: p.plantName || "",
          address: p.address || "",
          phone_number: p.phoneNo || "",
          email_address: p.email || "",
          state: p.state || "",
          district: p.district || "",
          city: p.city || "",
          pin: p.pin || "",
          fax_no: p.faxNo || "",
        })),

        tax: {
          pan: values.panNo || "",
          gstin: values.gstIn || "",
          tin_no: values.tinNo || "",
          tin_date: values.tinDate
            ? dayjs(values.tinDate).format("YYYY-MM-DD")
            : null,
          igst_applicable: values.igstApplicable === "Yes",
        },
      };

      if (selected) {
        // await updateVendor(selected.id, payload);
        message.success("Vendor Updated");
      } else {
        // await addvendor(payload);
        message.success("Vendor Added");
      }

      setOpen(false);
      form.resetFields();
      fetchVendors();
    } catch {
      message.error("Save failed");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "Company Name", dataIndex: "name" },
    { title: "Short Name", dataIndex: "short_name" },
    { title: "Mobile", dataIndex: "mobile_no1" },
    { title: "Email", dataIndex: "email1" },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (val) => (val ? "Active" : "Inactive"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-blue-500 cursor-pointer text-base"
            onClick={async () => {
              try {
                // const details = await getVendorDetails(record.id);
                const details = record; // replace with API call
                form.setFieldsValue(mapDetailsToForm(details));
                setSelected(details);
                setViewMode(true);
                setOpen(true);
              } catch {
                message.error("Failed to load vendor details");
              }
            }}
          />
          <EditOutlined
            className="text-amber-500 cursor-pointer text-base"
            onClick={async () => {
              try {
                // const details = await getVendorDetails(record.id);
                const details = record; // replace with API call
                form.setFieldsValue(mapDetailsToForm(details));
                setSelected(details);
                setViewMode(false);
                setOpen(true);
              } catch {
                message.error("Failed to load vendor details");
              }
            }}
          />
        </div>
      ),
    },
  ];

  const filteredData = data.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border-amber-300"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              fetchVendors();
            }}
            className="border-amber-400 text-amber-600"
          >
            Reset
          </Button>
        </div>

        {/* Right: Add Vendor */}
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
          Add Vendor
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
            {viewMode ? "View Vendor" : selected ? "Edit Vendor" : "Add Vendor"}
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
          initialValues={{ status: "Active", igstApplicable: "No" }}
        >
          {/* ================= Vendor / Company Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Vendor / Company Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Company Name"
                  name="name"
                  rules={[
                    { required: true, message: "Company name is required" },
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
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Mobile No 2"
                  name="mobileNo2"
                  rules={[
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="7984568331"
                    style={{ width: "100%" }}
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
                  rules={[
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
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
                  rules={[
                    { required: true, message: "Mobile number is required" },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="WhatsApp No" name="contactWhatsapp">
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
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

              <Col span={6}>
                <Form.Item label="Aadhar No" name="aadharNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="123456789012"
                    maxLength={14}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Aadhar Document" name="aadharDoc">
                  <Input type="file" disabled={viewMode} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Tax & Registration ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Tax & Registration
            </h3>
            <Row gutter={24}>
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

              <Col span={4}>
                <Form.Item label="TIN Date" name="tinDate">
                  <DatePicker className="w-full h-10" disabled={viewMode} />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="TIN Document" name="tinDoc">
                  <Input type="file" disabled={viewMode} />
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
                <Form.Item label="PAN Document" name="panDoc">
                  <Input type="file" disabled={viewMode} />
                </Form.Item>
              </Col>

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
                <Form.Item label="GSTIN Document" name="gstDoc">
                  <Input type="file" disabled={viewMode} />
                </Form.Item>
              </Col>

              <Col span={4}>
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
              </Col>
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
                  label="Location"
                  name="location"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Location"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="State" name="state">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter State"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="District" name="district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter District"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="City" name="city">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter City"
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
                <Form.Item label="Transaction Type" name="transactionType">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Transaction Type"
                  >
                    <Option value="OWN">OWN</Option>
                    <Option value="RENT">RENT</Option>
                    <Option value="Super Stockist">Super Stockist</Option>
                    <Option value="Distributor">Distributor</Option>
                    <Option value="Retailer">Retailer</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Plant Details (Dynamic) ================= */}
          <h3 className="text-lg font-semibold text-amber-700 mt-4 mb-2">
            Plant Details
          </h3>

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
                              {
                                pattern: /^[6-9]\d{9}$/,
                                message: "Enter a valid 10-digit mobile number",
                              },
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
                            name={[name, "state"]}
                            label="State"
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter State"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "district"]}
                            label="District"
                            rules={[
                              { required: true, message: "Missing district" },
                            ]}
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter District"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "city"]}
                            label="City"
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter City"
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

                        <Col span={4}>
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
                        </Col>
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

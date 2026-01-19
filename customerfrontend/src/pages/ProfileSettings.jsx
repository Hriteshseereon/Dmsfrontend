import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Col,
  Row,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  ApartmentOutlined,
  UploadOutlined,
} from "@ant-design/icons";

/* ===================== INITIAL DATA ===================== */
const profileData = {
  personalInfo: {
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@ruchisoya.com",
    phone: "9876543210",
    address: "Bhubaneswar, Odisha, India",
    broker_associate: "N/A",
    avatarInitials: "RK",
  },
  company: {
    name: "Ruchi Soya Industries Ltd.",
    companyPhone: "9876543210",
    companyEmail: "rajesh.kumar@ruchisoya.com",
    country: "India",
    state: "Odisha",
    city: "Bhubaneswar",
    pin: "751010",
    address: "Plot No. 15, Industrial Estate",
    gst_in: "21AAACR1234Q1ZV",
    tin: "1234567890",
    license_no: "LIC1234567890",
    fassai_no: "FSSAI1234567890",
    pan_no: "AAACR1234Q",
    adhhar_no: "123456789012",
    tdc_applicable: "yes",
  },
};

/* ===================== COMPONENT ===================== */
export default function ProfileSettings() {
  const [formPersonal] = Form.useForm();
  const [formCompany] = Form.useForm();
  const [profile, setProfile] = useState(profileData);

  /* ===================== SUBMIT HANDLERS ===================== */
  const onPersonalSubmit = (values) => {
    setProfile((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...values },
    }));
    message.success("Personal information updated");
  };

  const onCompanySubmit = (values) => {
    setProfile((prev) => ({
      ...prev,
      company: { ...prev.company, ...values },
    }));
    message.success("Company information updated");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-700 mb-2">
        Profile Settings
      </h1>
      <p className="text-amber-600 mb-6">
        Manage your account settings and preferences
      </p>

      <Row gutter={24}>
        {/* ===================== PERSONAL INFO ===================== */}
        <Col span={10}>
          <div className="bg-white p-6 rounded-lg shadow border border-amber-300">
            <h2 className="font-semibold text-lg text-amber-700 mb-4 flex items-center gap-2">
              <UserOutlined /> Personal Information
            </h2>

            <Row gutter={20} align="middle" className="mb-6">
              <Col>
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-amber-200 text-xl font-semibold text-amber-800">
                  {profile.personalInfo.avatarInitials}
                </div>
              </Col>
              <Col>
                <Upload showUploadList={false}>
                  <Button className="border-amber-500 text-amber-700">
                    Change Photo
                  </Button>
                </Upload>
              </Col>
            </Row>

            <Form
              layout="vertical"
              form={formPersonal}
              initialValues={profile.personalInfo}
              onFinish={onPersonalSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: "First name required" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: "Last name required" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                      { required: true },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "10 digit phone number required",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                label="Broker Associate"
                name="broker_associate"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<UploadOutlined />}
                style={{ backgroundColor: "#d97706" }}
              >
                Save Personal Info
              </Button>
            </Form>
          </div>
        </Col>

        {/* ===================== COMPANY INFO ===================== */}
        <Col span={14}>
          <div className="bg-white p-6 rounded-lg shadow border border-amber-300">
            <h2 className="font-semibold text-lg text-amber-700 mb-4 flex items-center gap-2">
              <ApartmentOutlined /> Company Information
            </h2>

            <Form
              layout="vertical"
              form={formCompany}
              initialValues={profile.company}
              onFinish={onCompanySubmit}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="Company Name"
                    name="name"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Company Phone"
                    name="companyPhone"
                    rules={[
                      { required: true },
                      { pattern: /^[0-9]{10}$/, message: "Invalid phone" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Company Email"
                    name="companyEmail"
                    rules={[
                      { required: true },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="PIN Code"
                    name="pin"
                    rules={[
                      { required: true },
                      { pattern: /^[0-9]{6}$/, message: "Invalid PIN" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="Country" name="country" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="State" name="state" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="City" name="city" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="GST IN"
                    name="gst_in"
                    rules={[
                      {
                        pattern:
                          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: "Invalid GST",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="TIN" name="tin" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="License No" name="license_no" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="FSSAI No" name="fassai_no" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="PAN No"
                    name="pan_no"
                    rules={[
                      {
                        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: "Invalid PAN",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Aadhaar No"
                    name="adhhar_no"
                    rules={[
                      { pattern: /^[0-9]{12}$/, message: "Invalid Aadhaar" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

              <Col span={8}>
  <Form.Item
    label="TDS Applicable"
    name="tdc_applicable"
    rules={[{ required: true, message: "Please select Yes or No" }]}
  >
    <Select placeholder="Select">
      <Select.Option value="Yes">Yes</Select.Option>
      <Select.Option value="No">No</Select.Option>
    </Select>
  </Form.Item>
</Col>

                <Col span={8}>
  <Form.Item
    label="Company Address"
    name="address"
    rules={[
      { required: true, message: "Company address is required" },
    ]}
  >
    <Input.TextArea  />
  </Form.Item>
</Col>

              </Row>

              <Button
                type="primary"
                htmlType="submit"
                icon={<UploadOutlined />}
                style={{ backgroundColor: "#d97706" }}
              >
                Save Company Info
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

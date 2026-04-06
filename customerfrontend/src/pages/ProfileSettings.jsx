import React, { useEffect } from "react";
import { Form, Input, Button, Col, Row, message } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { getProfileData, updateProfileData } from "../api/dashboard";
import useSessionStore from "../store/sessionStore";

export default function ProfileSettings() {
  const [formPersonal] = Form.useForm();
  const user = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const mapProfileToForm = (response) => {
    const customer = response?.customer ?? {};
    const profile = response?.profile ?? {};
    const fullName = customer.customer_name?.trim() || "";
    const nameParts = fullName.split(/\s+/).filter(Boolean);

    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      email:
        customer.email_address || response?.user?.username || response?.user?.email || "",
      phone: customer.mobile_number || customer.phone_number || customer.whatsapp_number || "",
      address: customer.address || "",
      broker_associate: profile.broker_associated || "",
    };
  };

  const fetchProfile = async () => {
    try {
      const res = await getProfileData();
      setUser({
        ...user,
        customer_name: res?.customer?.customer_name || user?.customer_name,
        name: res?.customer?.customer_name || user?.name,
        email: res?.customer?.email_address || res?.user?.username || user?.email,
      });
      formPersonal.setFieldsValue(mapProfileToForm(res));
    } catch (err) {
      message.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onFinish = async (values) => {
    try {
      const payload = {
        customer_name: `${values.firstName} ${values.lastName}`.trim(),
        email_address: values.email,
        mobile_number: values.phone,
        phone_number: values.phone,
        whatsapp_number: values.phone,
        address: values.address,
        broker_associated: values.broker_associate || null,
      };

      const updatedResponse = await updateProfileData(payload);
      setUser({
        ...user,
        customer_name:
          updatedResponse?.customer?.customer_name || payload.customer_name,
        name: updatedResponse?.customer?.customer_name || payload.customer_name,
        email:
          updatedResponse?.customer?.email_address ||
          updatedResponse?.user?.username ||
          payload.email_address,
      });
      formPersonal.setFieldsValue(mapProfileToForm(updatedResponse));
      message.success("Profile updated successfully");
    } catch (err) {
      message.error("Update failed");
    }
  };

  const firstName = Form.useWatch("firstName", formPersonal);
  const lastName = Form.useWatch("lastName", formPersonal);
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

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
        <Col span={24}>
          <div className="bg-white p-4 rounded-lg shadow border border-amber-300">
            <h2 className="font-semibold text-base text-amber-700 mb-3 flex items-center gap-2">
              <UserOutlined /> Personal Information
            </h2>

            <Row gutter={16} align="middle" className="mb-4">
              <Col>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-200 text-lg font-semibold text-amber-800">
                  {initials || "U"}
                </div>
              </Col>
            </Row>

            <Form
              layout="vertical"
              form={formPersonal}
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: "First name required" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: "Last name required" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
            


                <Col span={6}>
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

                <Col span={6}>
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
              <Row gutter={16} align="bottom">
                <Col span={6}>
                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label="Broker Associate"
                    name="broker_associate"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label=" ">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<UploadOutlined />}
                      style={{ backgroundColor: "#d97706", width: "100%" }}
                    >
                      Save Personal Info
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>

        {/* ===================== COMPANY INFO ===================== */}
        {/* <Col span={14}>
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
        </Col> */}
      </Row>
    </div>
  );
}

import React, { useEffect } from "react";
import { Card, Form, Input, Avatar, Button, Row, Col, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getProfileData, updateProfileData } from "../api/dashboard";
import useSessionStore from "../store/sessionStrore";

export default function ProfileSettings() {
  const [form] = Form.useForm();
  const setRegisteredName = useSessionStore((state) => state.setRegisteredName);
  const phoneRule = {
    pattern: /^\d{7,15}$/,
    message: "Enter a valid number",
  };

  const mapProfileToForm = (profile = {}) => ({
    registeredName: profile.registered_name || "",
    email: profile.email_id || "",
    address1: profile.address_1 || "",
    address2: profile.address_2 || "",
    phone: profile.phone_number || "",
    telephone: profile.telephone_number || "",
    fax: profile.fax_no || "",
    contactPerson: profile.contact_person_name || "",
    pan: profile.pan || "",
    gstin: profile.gstin || "",
    state: profile.state || "",
    city: profile.city || "",
    district: profile.district || "",
    pin: profile.pin || "",
  });

  const getProfilePayload = (values) => ({
    registered_name: values.registeredName,
    email_id: values.email,
    address_1: values.address1,
    address_2: values.address2,
    phone_number: values.phone,
    telephone_number: values.telephone,
    fax_no: values.fax,
    contact_person_name: values.contactPerson,
    pan: values.pan,
    gstin: values.gstin,
    state: values.state,
    city: values.city,
    district: values.district,
    pin: values.pin,
  });

  const fetchProfile = async () => {
    try {
      const response = await getProfileData();
      setRegisteredName(response?.registered_name || null);
      form.setFieldsValue(mapProfileToForm(response));
    } catch (error) {
      message.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [form]);

  const onFinish = async (values) => {
    try {
      const response = await updateProfileData(getProfilePayload(values));
      const updatedProfile = response?.profile || response;
      setRegisteredName(updatedProfile?.registered_name || values.registeredName);
      form.setFieldsValue(mapProfileToForm(updatedProfile));
      message.success(response?.detail || "Profile updated successfully.");
    } catch (error) {
      message.error("Failed to update profile");
    }
  };

  const registeredName = Form.useWatch("registeredName", form);
  const email = Form.useWatch("email", form);
  const initials =
    registeredName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div>
      <Card className="rounded-xl! shadow-sm! border! border-amber-200!">
        <div className="flex items-center mb-6">
          <Avatar size={64} icon={<UserOutlined />} className="bg-amber-500!" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-amber-900">
              {registeredName || initials}
            </h3>
            <p className="text-amber-700">{email}</p>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Registered Name"
                name="registeredName"
                rules={[{ required: true, message: "Please enter registered name" }]}
              >
            <Input placeholder="ABC Transport Pvt Ltd" />
              </Form.Item>
            </Col>
<Col span={6}>
              <Form.Item
  label="Email ID"
  name="email"
  rules={[
    { required: true, message: "Email is required" },
    { 
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
      message: "Invalid email (example@email.com)" 
    }
  ]}
>
  <Input placeholder="example@email.com" />
</Form.Item>

            </Col>
            <Col span={6}>
              <Form.Item
                label="Address 1"
                name="address1"
                rules={[{ required: true, message: "Please enter address 1" }]}
              >
              <Input placeholder="Street / Area" />
               
              </Form.Item>
            </Col>

           
          </Row>

          <Row gutter={16}>
             <Col span={6}>
              <Form.Item
                label="Address 2"
                name="address2"
                rules={[{ required: false , message: "Please enter address 2"}]}
              >
              <Input placeholder=" Locality" />
                
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  phoneRule,
                ]}
              >
                <Input placeholder="9876543210" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Telephone Number"
                name="telephone"
                rules={[
                  { required: false },
                  phoneRule,
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
               <Form.Item
                label="Fax No"
                name="fax"
                rules={[
                  { required: true, message: "Please enter Fax No" },
                  phoneRule,
                ]}
              >
              <Input placeholder="033-87654321" />
            </Form.Item>
            </Col>

            
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Contact Person Name"
                name="contactPerson"
                rules={[{ required: true, message: "Please enter contact person name" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="PAN"
                name="pan"
                rules={[{ required: true, message: "Please enter PAN" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="GSTIN"
                name="gstin"
                rules={[{ required: true, message: "Please enter GSTIN" }]}
              >
                <Input  placeholder="22ABCDE1234F1Z5"/>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "Please enter state" }]}
              >
                <Input placeholder="Odisha"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input  placeholder="Bhubnewar"/>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="District"
                name="district"
                rules={[{ required: true, message: "Please enter district" }]}
              >
                <Input placeholder="Khorda"/>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="PIN"
                name="pin"
                rules={[
                  { required: true, message: "Please enter PIN" },
                  { pattern: /^\d{6}$/, message: "Enter valid 6-digit PIN" },
                ]}
              >
                <Input placeholder="700001"/>
              </Form.Item>
            </Col>
           
          </Row>


          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={fetchProfile}
              className="text-amber-800! border! border-amber-400! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! hover:bg-amber-600! text-white!"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}



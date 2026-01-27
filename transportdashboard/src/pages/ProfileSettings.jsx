import React, { useEffect, useState } from "react";
import { Card, Form, Input, Avatar, Button, Row, Col, message } from "antd";
import { UserOutlined, MailOutlined, TeamOutlined } from "@ant-design/icons";

import { useParams } from "react-router-dom";
import useSessionStore from "../store/sessionStore";
import {
  getTransporterById,
  updateTransporter,
} from "../api/transporterApi";


export default function ProfileSettings() {

  const [form] = Form.useForm();

  const { transporterId } = useParams();

  const currentOrgId = useSessionStore((s) => s.currentOrgId);
  const user = useSessionStore((s) => s.user);
  const orgId = currentOrgId || user?.organisation_id;

  const [loading, setLoading] = useState(false);

  // LOAD TRANSPORTER DATA
  useEffect(() => {
    if (!orgId || !transporterId) return;

    const loadTransporter = async () => {
      try {
        const data = await getTransporterById(transporterId, orgId);

        // Map backend → form fields
        form.setFieldsValue({
          registeredName: data.registered_name,
          email: data.email_id,
          phone: data.phone_number,
          telephone: data.telephone_number,
          fax: data.fax_no,
          contactPerson: data.contact_person_name,
          pan: data.pan,
          gstin: data.gstin,
          address1: data.address_1,
          address2: data.address_2,
          state: data.state,
          city: data.city,
          district: data.district,
          pin: data.pin,
        });
      } catch (err) {
        message.error("Failed to load transporter");
      }
    };

    loadTransporter();
  }, [orgId, transporterId, form]);

  // UPDATE TRANSPORTER
  const onFinish = async (values) => {
    try {
      if (!orgId || !transporterId) {
        message.error("Missing organisation or transporter");
        return;
      }

      setLoading(true);

      const payload = {
        registered_name: values.registeredName,
        email_id: values.email,
        password: values.password || undefined,
        phone_number: values.phone,
        telephone_number: values.telephone || "",
        fax_no: values.fax || "",
        contact_person_name: values.contactPerson,
        pan: values.pan,
        gstin: values.gstin,
        address_1: values.address1,
        address_2: values.address2,
        state: values.state,
        city: values.city,
        district: values.district,
        pin: values.pin,
      };

      // remove undefined
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      await updateTransporter(transporterId, orgId, payload);

      message.success("Profile updated successfully");
    } catch (err) {
      message.error(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="rounded-xl! shadow-sm! border! border-amber-200!">
        {/* User Info */}
        <div className="flex items-center mb-6">
          <Avatar size={64} icon={<UserOutlined />} className="bg-amber-500!" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-amber-900">{user.name}</h3>
            <p className="text-amber-700">{user.email}</p>
            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
              {user.role}
            </span>
          </div>
        </div>

        {/* Editable Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
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

              <Form.Item label="Password" name="password" rules={[{ required: true, min: 6, message: "Please enter a valid 6-digit password" }]}>
                <Input.Password placeholder="Enter password" />
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
                rules={[{ required: false, message: "Please enter address 2" }]}
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
                  { pattern: /^\d{10}$/, message: "Enter valid 10-digit phone number" },
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
                  { pattern: /^\d{10}$/, message: "Enter valid 10-digit telephone number" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Fax No" name="fax" rules={[{ required: true, message: "Please enter Fax No" }]}>
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
                <Input placeholder="22ABCDE1234F1Z5" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "Please enter state" }]}
              >
                <Input placeholder="Odisha" />
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
                <Input placeholder="Bhubnewar" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="District"
                name="district"
                rules={[{ required: true, message: "Please enter district" }]}
              >
                <Input placeholder="Khorda" />
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
                <Input placeholder="700001" />
              </Form.Item>
            </Col>

          </Row>


          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => form.resetFields()}
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

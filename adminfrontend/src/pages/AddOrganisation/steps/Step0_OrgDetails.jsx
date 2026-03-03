import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ORG_RULES } from "../constants.js";

const { Option } = Select;

export default function Step0_OrgDetails({
  form,
  handleOrgTypeChange,
  handlePhoneFormat,
  normFile,
  handlePreview,
  rule,
  orgType,
}) {
  return (
    <Row gutter={[16, 8]}>
      {/* Registered Name */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Registered Name"
          name="registeredName"
          rules={[{ required: true, message: "Please enter registered name" }]}
        >
          <Input placeholder="Enter registered name" />
        </Form.Item>
      </Col>

      {/* Organisation Logo */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Organisation Logo"
          name="organisationLogo"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            listType="picture"
            onPreview={handlePreview}
          >
            <Button icon={<UploadOutlined />}>Upload Logo</Button>
          </Upload>
        </Form.Item>
      </Col>

      {/* Address Line 1 */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Address Line 1"
          name={["organisationAddress", "address"]}
          rules={[{ required: true, message: "Enter address" }]}
        >
          <Input placeholder="Address line" />
        </Form.Item>
      </Col>

      {/* Address Line 2 */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Address Line 2"
          name={["organisationAddress", "address2"]}
        >
          <Input placeholder="Address line 2" />
        </Form.Item>
      </Col>

      {/* City */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="City"
          name={["organisationAddress", "city"]}
          rules={[{ required: true, message: "Enter city" }]}
        >
          <Input placeholder="City" />
        </Form.Item>
      </Col>

      {/* State */}
      <Col xs={24} sm={12} md={4}>
        <Form.Item
          label="State"
          name={["organisationAddress", "state"]}
          rules={[
            { required: true, message: "Enter state" },
            { pattern: /^[A-Za-z\s]+$/, message: "Only alphabets are allowed" },
          ]}
        >
          <Input
            placeholder="State"
            onChange={(e) => {
              const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              form.setFieldsValue({
                organisationAddress: {
                  ...form.getFieldValue("organisationAddress"),
                  state: value,
                },
              });
            }}
          />
        </Form.Item>
      </Col>

      {/* PIN Code */}
      <Col xs={24} sm={12} md={4}>
        <Form.Item
          label="PIN Code"
          name={["organisationAddress", "pin"]}
          rules={[
            { required: true, message: "Enter PIN" },
            { pattern: /^[0-9]{6}$/, message: "Only numbers are allowed" },
          ]}
        >
          <Input placeholder="PIN" maxLength={6} inputMode="numeric" />
        </Form.Item>
      </Col>

      {/* Phone Number */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: "Please enter phone number" },
            { pattern: /^\+?[0-9\s-]{8,20}$/, message: "Invalid phone format" },
          ]}
        >
          <Input
            placeholder="Enter phone number"
            maxLength={15}
            onChange={handlePhoneFormat("phone")}
          />
        </Form.Item>
      </Col>

      {/* Alternate Phone */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Alternate Phone Number"
          name="phone2"
          rules={[
            { pattern: /^\+?[0-9\s-]{8,20}$/, message: "Invalid phone format" },
          ]}
        >
          <Input
            placeholder="Enter phone number"
            maxLength={15}
            inputMode="numeric"
            onChange={handlePhoneFormat("phone2")}
          />
        </Form.Item>
      </Col>

      {/* Landline */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Landline Number"
          name="landlineNumber"
          rules={[
            {
              pattern: /^[0-9]{2,4}-[0-9]{6,8}$/,
              message: "Enter a valid landline (e.g. 044-12345678)",
            },
          ]}
        >
          <Input placeholder="e.g. 044-12345678" maxLength={15} />
        </Form.Item>
      </Col>

      {/* WhatsApp */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="WhatsApp Number"
          name="whatsappNumber"
          rules={[
            { pattern: /^\+?[0-9\s-]{8,20}$/, message: "Invalid phone format" },
          ]}
        >
          <Input
            placeholder="Enter WhatsApp number"
            maxLength={15}
            onChange={handlePhoneFormat("whatsappNumber")}
          />
        </Form.Item>
      </Col>

      {/* Email */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>
      </Col>

      {/* Secondary Email */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Secondary Email"
          name="secondaryEmail"
          rules={[{ type: "email", message: "Please enter valid email" }]}
        >
          <Input placeholder="Enter secondary email address" />
        </Form.Item>
      </Col>

      {/* Head Office Location */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="Head Office Location" name="businessLocation">
          <Input placeholder="Enter location" />
        </Form.Item>
      </Col>

      {/* Organisation Type */}
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Organisation Type"
          name="organisationType"
          rules={[
            { required: true, message: "Please select organisation type" },
          ]}
        >
          <Select
            placeholder="Select organisation type"
            onChange={handleOrgTypeChange}
          >
            <Option value="PRIVATE_LIMITED">Private Limited (Pvt Ltd)</Option>
            <Option value="LLP">LLP</Option>
            <Option value="OPC">OPC</Option>
            <Option value="Partnership">Partnership</Option>
            <Option value="PROPRIETORSHIP">Proprietor</Option>
          </Select>
        </Form.Item>
      </Col>

      {/* Partners Count (conditional) */}
      {rule?.askCount && (
        <Col md={6}>
          <Form.Item
            label={`Number of ${rule.roleLabel}s`}
            name="partnersCount"
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder={`Enter number of ${rule.roleLabel}s (optional)`}
            />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}

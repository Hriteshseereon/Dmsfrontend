// forms/TransportForm.jsx
import React from "react";
import { Row, Col, Form, Input, Card } from "antd";
const inputClass = "border-amber-400 h-8";
const passwordClass = "h-8";
export default function TransportForm({ disabled = false }) {
  return (
    <>
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
              rules={[{ required: true }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter agency name"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Mobile Number" name="mobileNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter mobile number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Alternate Mobile No" name="altMobileNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter alternate mobile number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="WhatsApp Number" name="whatsappNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter WhatsApp number"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Primary Email" name="email">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter primary email"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Secondary Email" name="secondaryEmail">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter secondary email"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Password" name="password">
              <Input.Password
                className={passwordClass}
                disabled={disabled}
                placeholder="Enter password"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= Business & KYC Details ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Business & KYC Details
        </h3>

        <Row gutter={24}>
          <Col span={4}>
            <Form.Item label="PAN Number" name="panNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter PAN number"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="PAN Document" name="panDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="GSTIN Number" name="gstin">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter GSTIN number"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="GSTIN Document" name="gstDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Owner Aadhar Number" name="ownerAadharNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter owner Aadhar number"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Aadhar Document" name="aadharDoc">
              <Input type="file" disabled={disabled} />
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
            <Form.Item label="Address Line 1" name="address1">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter address line 1"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Address Line 2" name="address2">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter address line 2"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="City" name="city">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter city"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="State" name="state">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter state"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="District" name="district">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter district"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Pin Code" name="pinCode">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter pin code"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  );
}

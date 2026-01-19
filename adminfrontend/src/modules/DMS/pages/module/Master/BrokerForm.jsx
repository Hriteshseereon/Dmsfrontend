// forms/BrokerForm.jsx
import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  Select,
  Card,
  Button,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";
const vendorProductMap = {
  "Ruchi Soya": ["Soybean Oil", "Palm Oil", "Sunflower Oil"],
  "ABC Traders": ["Wheat", "Rice", "Maize"],
  "Tata Commodities": ["Tea", "Coffee"],
};

export default function BrokerForm({ disabled = false }) {
  return (
    <>
      {/* ================= Broker Details ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Broker Details
        </h3>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Broker Name"
              name="brokerName"
              rules={[{ required: true }]}
            >
              <Input className={inputClass} disabled={disabled} placeholder="Enter broker name" />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Phone Number" name="phoneNo">
              <Input className={inputClass} disabled={disabled} placeholder="Enter phone number" />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Alternate Phone " name="altPhoneNo">
              <Input className={inputClass} disabled={disabled} placeholder="Enter alternate phone" />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="WhatsApp Number" name="whatsappNo">
              <Input className={inputClass} disabled={disabled} placeholder="Enter WhatsApp number" />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Fax Number" name="faxNo">
              <Input className={inputClass} disabled={disabled} placeholder="Enter fax number" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Primary Email" name="email">
              <Input className={inputClass} disabled={disabled} placeholder="Enter primary email" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Secondary Email" name="secondaryEmail">
              <Input className={inputClass} disabled={disabled} placeholder="Enter secondary email" />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Status" name="status">
              <Select className={selectClass} disabled={disabled} placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= Address Details ================= */}
      {/* ================= Address Details ================= */}
<Card className="mb-4 border border-amber-200 rounded-lg">
  <h3 className="text-lg font-semibold text-amber-700 mb-3">
    Address Details
  </h3>

  {/* -------- Permanent Address -------- */}
  <h4 className="text-amber-600 font-medium mb-2">
    Permanent Address
  </h4>

  <Row gutter={24}>
    <Col span={8}>
      <Form.Item label="Address" name="permanent_address">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter permanent address"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="City" name="permanent_city">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter city"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="District" name="permanent_district">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter district"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="State" name="permanent_state">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter state"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Pin Code" name="permanent_pin">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter pin code"
        />
      </Form.Item>
    </Col>
  </Row>

  {/* -------- Current Address -------- */}
  <h4 className="text-amber-600 font-medium mt-4 mb-2">
    Current Address
  </h4>

  <Row gutter={24}>
    <Col span={8}>
      <Form.Item label="Address" name="current_address">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter current address"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="City" name="current_city">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter city"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="District" name="current_district">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter district"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="State" name="current_state">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter state"
        />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Pin Code" name="current_pin">
        <Input
          className={inputClass}
          disabled={disabled}
          placeholder="Enter pin code"
        />
      </Form.Item>
    </Col>
  </Row>
</Card>


      {/* ================= Documents & KYC ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Documents & KYC
        </h3>

        <Row gutter={24}>
          <Col span={4}>
            <Form.Item label="PAN Number" name="panNo">
              <Input className={inputClass} disabled={disabled} placeholder="Enter PAN number" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="PAN Document" name="panDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Aadhar Number" name="aadharNo">
              <Input className={inputClass} disabled={disabled} placeholder="Enter Aadhar number" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Aadhar Document" name="aadharDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Bank Details" name="bankDetails">
              <Input className={inputClass} disabled={disabled} placeholder="Enter bank details" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Passport Photo" name="passportPhoto">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="GSTIN Number" name="gstin">
              <Input className={inputClass} disabled={disabled} placeholder="Enter GSTIN number" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="GSTIN Document" name="gstinDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= Commission Setup (MULTIPLE) ================= */}
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
                  title={`Commission ${index + 1}`}
                  extra={
                    !disabled && (
                      <MinusCircleOutlined
                        className="text-red-500 cursor-pointer"
                        onClick={() => remove(name)}
                      />
                    )
                  }
                >
                  <Row gutter={24}>
                    <Col span={6}>
                      <Form.Item {...restField} label="Vendor" name={[name, "vendor"]}>
                        <Select className={selectClass} disabled={disabled} placeholder="Select vendor">
                          {Object.keys(vendorProductMap).map((v) => (
                            <Option key={v} value={v}>{v}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item {...restField} label="Product" name={[name, "product"]}>
                        <Input className={inputClass} disabled={disabled} placeholder="Enter product" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item {...restField} label="Commission Type" name={[name, "type"]}>
                        <Select className={selectClass} disabled={disabled}>
                          <Option value="basic">Basic</Option>
                          <Option value="scheme">Scheme</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item {...restField} label="Method" name={[name, "method"]}>
                        <Select className={selectClass} disabled={disabled}>
                          <Option value="percentage">Percentage</Option>
                          <Option value="fixed">Fixed</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item {...restField} label="Amount" name={[name, "amount"]}>
                        <Input className={inputClass} disabled={disabled} placeholder="Enter amount" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              {!disabled && (
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
    </>
  );
}

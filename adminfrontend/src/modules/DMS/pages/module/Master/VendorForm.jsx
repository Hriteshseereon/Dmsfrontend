// forms/VendorForm.jsx
import React from "react";
import { Row, Col, Form, Input, Select, DatePicker, Button, Card } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-10 w-full";
export default function VendorForm({ disabled = false }) {
  return (
    <>
      {/* ===== Vendor Details Card (Company + Short name + Primary contact info) ===== */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
  <h3 className="text-lg font-semibold text-amber-700 mb-3">
    Vendor / Company Details
  </h3>

  <Row gutter={24}>
    <Col span={6}>
      <Form.Item label="Company Name" name="name" rules={[{ required: true }]}>
        <Input className={inputClass} disabled={disabled} placeholder="Enter Company name"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Short Name" name="shortName">
        <Input className={inputClass} disabled={disabled} placeholder="Add a company Short name"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Mobile No 1" name="mobileNo1">
        <Input className={inputClass} disabled={disabled} placeholder="9984568331"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Mobile No 2" name="mobileNo2">
        <Input className={inputClass} disabled={disabled} placeholder="7984568331"/>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Primary Email" name="email1">
        <Input className={inputClass} disabled={disabled} placeholder="example@gmail.com"/>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Secondary Email" name="email2">
        <Input className={inputClass} disabled={disabled} placeholder="example@gmail.com"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="WhatsApp No" name="whatsappNo">
        <Input className={inputClass} disabled={disabled} placeholder="9984568331"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Social Link" name="socialLink">
        <Input className={inputClass} disabled={disabled} placeholder="https://www.facebook.com/"/>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Company Website" name="websiteUrl">
        <Input className={inputClass} disabled={disabled} placeholder="https://www.example.com"/>
      </Form.Item>
    </Col>
  </Row>
</Card>

{/* contact person details */}
<Card className="mb-4 border border-amber-200 rounded-lg">
  <h3 className="text-lg font-semibold text-amber-700 mb-3">
    Contact Person Details
  </h3>

  <Row gutter={24}>
    <Col span={6}>
      <Form.Item label="Contact Person Name" name="contactPerson">
        <Input className={inputClass} disabled={disabled} placeholder="Mr. John Doe"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Mobile No" name="contactMobile">
        <Input className={inputClass} disabled={disabled} placeholder="9984568331"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="WhatsApp No" name="contactWhatsapp">
        <Input className={inputClass} disabled={disabled} placeholder="9984568331"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Gender" name="gender">
        <Select className={selectClass} disabled={disabled}>
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
          <Option value="Other">Other</Option>
        </Select>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Email" name="contactEmail">
        <Input className={inputClass} disabled={disabled} placeholder="example@gmail.com"/>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Aadhar No" name="aadharNo">
        <Input className={inputClass} disabled={disabled} placeholder="123456789012"/>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Aadhar Document" name="aadharDoc">
        <Input type="file" disabled={disabled} />
      </Form.Item>
    </Col>
  </Row>
</Card>


      {/* ===== Tax & Registration Card ===== */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
  <h3 className="text-lg font-semibold text-amber-700 mb-3">
    Tax & Registration
  </h3>

  <Row gutter={24}>
    <Col span={4}>
      <Form.Item label="TIN No" name="tinNo">
        <Input className={inputClass} disabled={disabled} placeholder="TIN1234567890"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="TIN Date" name="tinDate">
        <DatePicker className="w-full h-10" disabled={disabled} />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="TIN Document" name="tinDoc">
        <Input type="file" disabled={disabled} />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="PAN No" name="panNo">
        <Input className={inputClass} disabled={disabled} placeholder="PAN1234567890"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="PAN Document" name="panDoc">
        <Input type="file" disabled={disabled} />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="GSTIN No" name="gstIn">
        <Input className={inputClass} disabled={disabled} placeholder="GSTIN1234567890"/>
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="GSTIN Document" name="gstDoc">
        <Input type="file" disabled={disabled} />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="IGST Applicable" name="igstApplicable">
        <Select className={selectClass} disabled={disabled}>
          <Option value="Yes">Yes</Option>
          <Option value="No">No</Option>
        </Select>
      </Form.Item>
    </Col>
  </Row>
</Card>


      {/* ===== Address & Location Card ===== */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
  <h3 className="text-lg font-semibold text-amber-700 mb-3">
    Address & Location
  </h3>

  <Row gutter={24}>
    <Col span={6}>
      <Form.Item label="Address Line 1" name="address1">
        <Input className={inputClass} disabled={disabled} placeholder="Enter Address Line 1" />
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Address Line 2" name="address2">
        <Input className={inputClass} disabled={disabled} placeholder="Enter Address Line 2" />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="State" name="state">
        <Input className={inputClass} disabled={disabled} placeholder="Enter State" />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="District" name="district">
        <Input className={inputClass} disabled={disabled} placeholder="Enter District" />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="City" name="city">
        <Input className={inputClass} disabled={disabled} placeholder="Enter City" />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Pin Code" name="pinCode">
        <Input className={inputClass} disabled={disabled} placeholder="Enter Pin Code" />
      </Form.Item>
    </Col>

    <Col span={4}>
      <Form.Item label="Status" name="status">
        <Select className={selectClass} disabled={disabled}>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Transaction Type" name="transactionType">
        <Select className={selectClass} disabled={disabled}>
          <Option value="Super Stockist">Super Stockist</Option>
          <Option value="Distributor">Distributor</Option>
          <Option value="Retailer">Retailer</Option>
        </Select>
      </Form.Item>
    </Col>
  </Row>
</Card>


      {/* ===== Plant Details (Dynamic List) ===== */}
      <h3 className="text-lg font-semibold text-amber-700 mt-4 mb-2">
        Plant Details
      </h3>
      <div className="max-h-60 overflow-y-auto pr-4">
        <Form.List name="plants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                <Card
                  key={key}
                  title={<span className="text-amber-700">Plant {index + 1}</span>}
                  extra={
                    !disabled && (
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
                        fieldKey={[fieldKey, "plantName"]}
                        label="Plant Name"
                        rules={[{ required: true, message: "Missing Plant Name" }]}
                      >
                        <Input disabled={disabled} placeholder="Enter Plant Name" />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "address"]}
                        fieldKey={[fieldKey, "address"]}
                        label="Address"
                      >
                        <Input disabled={disabled} placeholder="Enter Plant Address" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "phoneNo"]}
                        fieldKey={[fieldKey, "phoneNo"]}
                        label="Phone No"
                      >
                        <Input disabled={disabled} placeholder="Enter Phone Number" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "email"]}
                        fieldKey={[fieldKey, "email"]}
                        label="Email"
                      >
                        <Input disabled={disabled} placeholder="Enter Email" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "state"]}
                        fieldKey={[fieldKey, "state"]}
                        label="State"
                      >
                        <Input disabled={disabled} placeholder="Enter State" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "district"]}
                        fieldKey={[fieldKey, "district"]}
                        label="District"
                      >
                        <Input disabled={disabled} placeholder="Enter District" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "city"]}
                        fieldKey={[fieldKey, "city"]}
                        label="City"
                      >
                        <Input disabled={disabled} placeholder="Enter City" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "pin"]}
                        fieldKey={[fieldKey, "pin"]}
                        label="Pin"
                      >
                        <Input disabled={disabled} placeholder="Enter Pin" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "faxNo"]}
                        fieldKey={[fieldKey, "faxNo"]}
                        label="Fax No"
                      >
                        <Input disabled={disabled} placeholder="Enter Fax No" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}

              {!disabled && (
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
    </>
  );
}

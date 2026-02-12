// forms/CustomerForm.jsx
import React from "react";
import { Row, Col, Form, Input, Select, Card } from "antd";

const { Option } = Select;
const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";

export default function CustomerForm({ disabled = false }) {
  return (
    <>
      {/* ================= Customer Basic Details ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Customer Basic Details
        </h3>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Customer Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter customer name"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Business Name" name="branchName">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter business name"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Phone Number" name="phoneNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter phone number"
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

          <Col span={6}>
            <Form.Item label="Email Address" name="email">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter email address"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Customer Type" name="type">
              <Select
                className={selectClass}
                disabled={disabled}
                placeholder="Select type"
              >
                <Option value="Customer">Customer</Option>
                <Option value="Supplier">Supplier</Option>
                <Option value="Both">Both</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Status" name="status">
              <Select
                className={selectClass}
                disabled={disabled}
                placeholder="Select status"
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= Contact & Address Details ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Contact & Address Details
        </h3>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="Contact Person" name="contactPerson">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter contact person"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Address" name="address">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter address"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Country" name="country">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter country"
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
            <Form.Item label="City" name="city">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter city"
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

          <Col span={4}>
            <Form.Item label="Location" name="location">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter location"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= Credit Facility Details ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Credit Facility Details
        </h3>

        <Row gutter={24}>
          <Col span={4}>
            <Form.Item label="Credit Facility" name="creditFacility">
              <Select
                className={selectClass}
                disabled={disabled}
                placeholder="Select credit facility"
              >
                <Option value="Advance">Advance</Option>
                <Option value="Cheque">Cheque</Option>
                <Option value="Online">Online</Option>
                <Option value="Credit Limit">Credit Limit</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Security for Credit"
              name="securityForCreditFacility"
            >
              <Select
                className={selectClass}
                disabled={disabled}
                placeholder="Select security"
              >
                <Option value="Bank Guarantee">Bank Guarantee</Option>
                <Option value="Post Dated Cheque">Post Dated Cheque</Option>
                <Option value="Fixed Deposit">Fixed Deposit</Option>
                <Option value="Collateral">Collateral</Option>
                <Option value="None">None</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Advance Cheque No" name="advCheque">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter cheque number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Amount Limit" name="amountLimit">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter amount limit"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Days Limit" name="noDaysLimit">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter days limit"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Invoice Limit" name="noInvoiceLimit">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter invoice limit"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Souda Limit (Ton)" name="soudaLimit">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter souda limit"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ================= Legal & Tax Information ================= */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Legal & Tax Information
        </h3>

        <Row gutter={24}>
          <Col span={4}>
            <Form.Item label="GST Number" name="gstNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter GST number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="GST Document" name="gstDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="TIN Number" name="tinNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter TIN number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="PAN Number" name="panNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter PAN number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="PAN Document" name="panDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Aadhar Number" name="aadharNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter Aadhar number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Aadhar Document" name="aadharDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="FSSAI Number" name="fssaiNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter FSSAI number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="License Number" name="licenseNo">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter license number"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="TDS Applicable" name="tdsApplicable">
              <Select
                className={selectClass}
                disabled={disabled}
                placeholder="Select TDS option"
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Billing Type" name="billingType">
              <Select
                className={selectClass}
                disabled={disabled}
                placeholder="Select billing type"
              >
                <Option value="Regular">Regular</Option>
                <Option value="Provisional">Provisional</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  );
}

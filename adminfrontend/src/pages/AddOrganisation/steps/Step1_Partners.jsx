import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  DatePicker,
  Upload,
  Button,
  Card,
  Divider,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { SHOW_COMPANY_DETAILS_FOR } from "../constants.js";

// ─────────────────────────────────────────────
// Address Block (reused inline for current & permanent)
// ─────────────────────────────────────────────
const AddressBlock = ({ name, prefix, label, form, restField }) => (
  <>
    <Col xs={24} sm={12} md={6}>
      <Form.Item
        {...restField}
        label="Address Line 1"
        name={[name, prefix, "address1"]}
      >
        <Input placeholder="Address line 1" />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Form.Item
        {...restField}
        label="Address Line 2"
        name={[name, prefix, "address2"]}
      >
        <Input placeholder="Address line 2" />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12} md={4}>
      <Form.Item
        {...restField}
        label="City"
        name={[name, prefix, "city"]}
        rules={[
          { pattern: /^[A-Za-z\s]+$/, message: "Only letters are allowed" },
        ]}
      >
        <Input placeholder="City" />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12} md={4}>
      <Form.Item
        {...restField}
        label="State"
        name={[name, prefix, "state"]}
        rules={[
          { pattern: /^[A-Za-z\s]+$/, message: "Only letters are allowed" },
        ]}
      >
        <Input placeholder="State" />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12} md={4}>
      <Form.Item
        {...restField}
        label="PIN"
        name={[name, prefix, "pin"]}
        rules={[{ pattern: /^[0-9]*$/, message: "Only numbers are allowed" }]}
      >
        <Input placeholder="PIN" maxLength={6} />
      </Form.Item>
    </Col>
  </>
);

// ─────────────────────────────────────────────
// Bank Details Section (inline per partner)
// ─────────────────────────────────────────────
const BankDetailsSection = ({ name, normFile }) => (
  <Form.List name={[name, "bankDetails"]} initialValue={[{}]}>
    {(fields, { add, remove }) => (
      <>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Divider
            orientation="left"
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#374151",
              margin: 0,
              flex: 1,
            }}
          >
            Bank Details
          </Divider>
          <Button
            type="dashed"
            onClick={() => add()}
            icon={<PlusOutlined />}
            style={{ marginLeft: 16, flexShrink: 0 }}
            className="!bg-amber-500 hover:!bg-amber-600 !border-none !text-white"
          >
            Add Bank
          </Button>
        </Row>

        {fields.map(({ key, name: bankIndex, ...restField }) => (
          <Card
            key={key}
            size="small"
            style={{ marginBottom: 12 }}
            extra={<MinusCircleOutlined onClick={() => remove(bankIndex)} />}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={4}>
                <Form.Item
                  {...restField}
                  label="Bank Name"
                  name={[bankIndex, "bankName"]}
                  rules={[
                    {
                      pattern: /^[A-Za-z\s]+$/,
                      message: "Only letters are allowed",
                    },
                  ]}
                >
                  <Input placeholder="Enter bank name" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item
                  {...restField}
                  label="Branch Name"
                  name={[bankIndex, "branchName"]}
                >
                  <Input placeholder="Enter branch name" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item
                  {...restField}
                  label="Account Type"
                  name={[bankIndex, "accountType"]}
                >
                  <Input placeholder="Enter account type" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item
                  {...restField}
                  label="Account Number"
                  name={[bankIndex, "accountNo"]}
                  rules={[
                    {
                      pattern: /^[0-9]*$/,
                      message: "Only numbers are allowed",
                    },
                  ]}
                >
                  <Input placeholder="Enter account number" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item
                  {...restField}
                  label="IFSC Code"
                  name={[bankIndex, "ifsc"]}
                >
                  <Input placeholder="SBIN0001234" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item
                  label="Cancel Cheque"
                  name={[bankIndex, "cancelCheque"]}
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload beforeUpload={() => false}>
                    <Button>Upload Cheque</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
      </>
    )}
  </Form.List>
);

// ─────────────────────────────────────────────
// Company Details Section (inline per partner)
// ─────────────────────────────────────────────
const CompanyDetailsSection = ({ name, rule, normFile }) => (
  <Form.List name={[name, "companies"]}>
    {(fields, { add, remove }) => (
      <>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Divider
            orientation="left"
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#374151",
              margin: 0,
              flex: 1,
            }}
          >
            {rule.roleLabel} Associate Company Details
          </Divider>
          <Button
            type="dashed"
            onClick={() => add()}
            style={{ marginLeft: 16, flexShrink: 0 }}
            className="!bg-amber-500 hover:!bg-amber-600 !border-none !text-white"
          >
            Add Company
          </Button>
        </Row>

        {fields.map(({ key, name: compIndex, ...restField }) => (
          <Card
            key={key}
            size="small"
            extra={<MinusCircleOutlined onClick={() => remove(compIndex)} />}
            style={{ marginBottom: 12 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  {...restField}
                  label="Company Name"
                  name={[compIndex, "companyName"]}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="Address Line 1"
                  name={[compIndex, "address", "address1"]}
                >
                  <Input placeholder="Address line 1" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="Address Line 2"
                  name={[compIndex, "address", "address2"]}
                >
                  <Input placeholder="Address line 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="City"
                  name={[compIndex, "address", "city"]}
                  rules={[
                    { required: true, message: "Please enter city" },
                    {
                      pattern: /^[A-Za-z\s]+$/,
                      message: "Only alphabets are allowed",
                    },
                  ]}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="State"
                  name={[compIndex, "address", "state"]}
                  rules={[
                    {
                      pattern: /^[A-Za-z\s]+$/,
                      message: "Only letters are allowed",
                    },
                  ]}
                >
                  <Input placeholder="Enter state" />
                </Form.Item>
              </Col>
              {rule.company_website && (
                <Col xs={24} sm={6}>
                  <Form.Item
                    {...restField}
                    label="Company Website"
                    name={[compIndex, "companyWebsite"]}
                  >
                    <Input placeholder="https://www.example.com" />
                  </Form.Item>
                </Col>
              )}
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="PIN Code"
                  name={[compIndex, "address", "pin"]}
                  rules={[
                    {
                      pattern: /^[0-9]{6}$/,
                      message: "Enter a valid 6-digit PIN code",
                    },
                  ]}
                >
                  <Input maxLength={6} placeholder="123456" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="CIN Number"
                  name={[compIndex, "registrationNo"]}
                >
                  <Input placeholder="Enter registration number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Form.Item
                  {...restField}
                  name={[compIndex, "cinDocument"]}
                  label="CIN Document"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload beforeUpload={() => false}>
                    <Button>Upload CIN</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  {...restField}
                  label="Company GST Number"
                  name={[compIndex, "gstNo"]}
                >
                  <Input placeholder="22AAAAA0000A1Z5" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Form.Item
                  {...restField}
                  name={[compIndex, "gstDocument"]}
                  label="GST Document"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload beforeUpload={() => false}>
                    <Button>Upload GST</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
      </>
    )}
  </Form.List>
);

// ─────────────────────────────────────────────
// Children Section (inline per partner)
// ─────────────────────────────────────────────
const ChildrenSection = ({ name }) => (
  <Form.Item noStyle shouldUpdate>
    {({ getFieldValue }) => {
      const sons = getFieldValue(["partners", name, "sonsCount"]) || 0;
      const daughters =
        getFieldValue(["partners", name, "daughtersCount"]) || 0;

      return (
        <>
          {sons > 0 && (
            <Card title="Son Details" size="small" style={{ marginBottom: 12 }}>
              {Array.from({ length: sons }).map((_, i) => (
                <Row key={i} gutter={[16, 0]}>
                  <Col xs={12}>
                    <Form.Item
                      name={[name, "children", "sons", i, "name"]}
                      label="Name"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      name={[name, "children", "sons", i, "age"]}
                      label="Age"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </Card>
          )}
          {daughters > 0 && (
            <Card
              title="Daughter Details"
              size="small"
              style={{ marginBottom: 12 }}
            >
              {Array.from({ length: daughters }).map((_, i) => (
                <Row key={i} gutter={[16, 0]}>
                  <Col xs={12}>
                    <Form.Item
                      name={[name, "children", "daughters", i, "name"]}
                      label="Name"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      name={[name, "children", "daughters", i, "age"]}
                      label="Age"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </Card>
          )}
        </>
      );
    }}
  </Form.Item>
);

// ─────────────────────────────────────────────
// Main Step1 Component
// ─────────────────────────────────────────────
export default function Step1_Partners({
  form,
  rule,
  orgType,
  handlePhoneFormat,
  normFile,
  handlePreview,
}) {
  if (!orgType) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "#999", fontSize: "16px" }}>
          Please select an organisation type in the previous step
        </p>
      </div>
    );
  }

  const sectionDivider = (label) => (
    <Divider
      orientation="left"
      style={{
        fontSize: "15px",
        fontWeight: "600",
        color: "#374151",
        marginTop: 0,
      }}
    >
      {label}
    </Divider>
  );

  return (
    <Form.List name="partners" initialValue={rule?.askCount ? [] : [{}]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Card
              key={key}
              size="small"
              style={{ marginBottom: 16, border: "1px solid #fef3c7" }}
              title={`${rule.roleLabel} ${name + 1}`}
            >
              {/* ── Personal Details ── */}
              {sectionDivider(`${rule.roleLabel} Personal Details`)}
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label={`${rule.roleLabel} Name`}
                    name={[name, "name"]}
                    rules={[{ required: true, message: "Please enter name" }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Email"
                    name={[name, "email"]}
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Invalid email",
                      },
                    ]}
                  >
                    <Input placeholder="Enter email" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Secondary Email"
                    name={[name, "email2"]}
                    rules={[{ type: "email", message: "Invalid email" }]}
                  >
                    <Input placeholder="Enter secondary email" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Mobile Number"
                    name={[name, "mobileNumber"]}
                    rules={[
                      { required: true, message: "Please enter mobile number" },
                      {
                        pattern: /^\+?[0-9\s-]{8,20}$/,
                        message: "Invalid phone format",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter mobile number"
                      maxLength={15}
                      inputMode="numeric"
                      onChange={handlePhoneFormat([
                        "partners",
                        name,
                        "mobileNumber",
                      ])}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Alternative Number"
                    name={[name, "contactNumber"]}
                    rules={[
                      {
                        pattern: /^\+?[0-9\s-]{8,20}$/,
                        message: "Invalid phone format",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter contact number"
                      maxLength={15}
                      inputMode="numeric"
                      onChange={handlePhoneFormat([
                        "partners",
                        name,
                        "contactNumber",
                      ])}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="WhatsApp Number"
                    name={[name, "whatsappNumber"]}
                    rules={[
                      {
                        pattern: /^\+?[0-9\s-]{8,20}$/,
                        message: "Invalid phone format",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter WhatsApp number"
                      maxLength={15}
                      inputMode="numeric"
                      onChange={handlePhoneFormat([
                        "partners",
                        name,
                        "whatsappNumber",
                      ])}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Gender"
                    name={[name, "gender"]}
                  >
                    <Radio.Group>
                      <Radio value="Male">Male</Radio>
                      <Radio value="Female">Female</Radio>
                      <Radio value="Other">Other</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Date of Birth"
                    name={[name, "dob"]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select DOB"
                      format="DD-MM-YYYY"
                    />
                  </Form.Item>
                </Col>
                {rule.showPercent && (
                  <Col xs={24} sm={12} md={3}>
                    <Form.Item
                      {...restField}
                      label="% of Interest"
                      name={[name, "percentage"]}
                      rules={[
                        {
                          pattern: /^[0-9]*$/,
                          message: "Only numbers are allowed",
                        },
                      ]}
                    >
                      <Input
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                        placeholder="Enter percentage"
                      />
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Father Name"
                    name={[name, "fatherName"]}
                    rules={[
                      {
                        pattern: /^[A-Za-z\s]+$/,
                        message: "Only letters are allowed",
                      },
                    ]}
                  >
                    <Input placeholder="Enter father name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Spouse Name"
                    name={[name, "spouseName"]}
                    rules={[
                      {
                        pattern: /^[A-Za-z\s]+$/,
                        message: "Only letters are allowed",
                      },
                    ]}
                  >
                    <Input placeholder="Enter spouse name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={3}>
                  <Form.Item label="No of Sons" name={[name, "sonsCount"]}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={3}>
                  <Form.Item
                    label="No of Daughters"
                    name={[name, "daughtersCount"]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                {/* Children Details */}
                <ChildrenSection name={name} />
              </Row>

              {/* ── Address ── */}
              {sectionDivider(`${rule.roleLabel} Address`)}
              <Row gutter={[16, 8]}>
                <Col xs={24}>
                  <Divider orientation="left" plain>
                    Current Address
                  </Divider>
                </Col>
                <AddressBlock
                  name={name}
                  prefix="currentAddress"
                  form={form}
                  restField={restField}
                />

                <Col xs={24}>
                  <Divider orientation="left" plain>
                    Permanent Address
                  </Divider>
                  <Form.Item
                    {...restField}
                    name={[name, "isPermanentAddressSame"]}
                    valuePropName="checked"
                  >
                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked) {
                          const currentAddress = form.getFieldValue([
                            "partners",
                            name,
                            "currentAddress",
                          ]);
                          form.setFieldsValue({
                            partners: {
                              [name]: {
                                permanentAddress: currentAddress || {},
                              },
                            },
                          });
                        } else {
                          form.setFieldsValue({
                            partners: { [name]: { permanentAddress: {} } },
                          });
                        }
                      }}
                    >
                      Same as Current Address
                    </Checkbox>
                  </Form.Item>
                </Col>
                <AddressBlock
                  name={name}
                  prefix="permanentAddress"
                  form={form}
                  restField={restField}
                />
              </Row>

              {/* ── Documents ── */}
              {sectionDivider(`${rule.roleLabel} Documents`)}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    {...restField}
                    label="Passport Size Photo"
                    name={[name, "photo"]}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      beforeUpload={() => false}
                      onPreview={handlePreview}
                      listType="picture"
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload Photo</Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    {...restField}
                    label="Aadhaar Number"
                    name={[name, "adharNo"]}
                    rules={[
                      {
                        pattern: /^[0-9]{12}$/,
                        message: "Enter a valid 12-digit Aadhaar number",
                      },
                    ]}
                  >
                    <Input placeholder="1234 5678 9012" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Form.Item
                    {...restField}
                    label="Aadhaar Document"
                    name={[name, "adharDocument"]}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload
                      beforeUpload={() => false}
                      onPreview={handlePreview}
                    >
                      <Button>Upload Aadhaar</Button>
                    </Upload>
                  </Form.Item>
                </Col>

                {rule.showPan && (
                  <>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label="PAN Number"
                        name={[name, "panNo"]}
                      >
                        <Input placeholder="ABCDE1234F" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label="PAN Document"
                        name={[name, "panDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          beforeUpload={() => false}
                          onPreview={handlePreview}
                        >
                          <Button>Upload PAN</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </>
                )}

                {rule.showGst && (
                  <>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label="GST Number"
                        name={[name, "gstNo"]}
                      >
                        <Input placeholder="22AAAAA0000A1Z5" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={3}>
                      <Form.Item
                        {...restField}
                        label="GST Document"
                        name={[name, "gstDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          beforeUpload={() => false}
                          onPreview={handlePreview}
                        >
                          <Button>Upload GST</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </>
                )}

                {rule.showDIN && (
                  <>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={rule.idLabel}
                        name={[name, "dinNumber"]}
                      >
                        <Input placeholder={`Enter ${rule.idLabel}`} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={`${rule.idLabel} Document`}
                        name={[name, "dinDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          beforeUpload={() => false}
                          onPreview={handlePreview}
                        >
                          <Button>Upload {rule.idLabel}</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>

              {/* ── Bank Details ── */}
              <BankDetailsSection name={name} normFile={normFile} />

              {/* ── Company Details (conditional) ── */}
              {SHOW_COMPANY_DETAILS_FOR.includes(orgType) && (
                <CompanyDetailsSection
                  name={name}
                  rule={rule}
                  normFile={normFile}
                />
              )}
            </Card>
          ))}

          {/* Add button shown only when count allows more */}
          {rule.askCount &&
            (() => {
              const requiredCount = form.getFieldValue("partnersCount") || 0;
              return fields.length < requiredCount ? (
                <Button
                  type="dashed"
                  onClick={() => add({})}
                  icon={<PlusOutlined />}
                  block
                >
                  Add {rule.roleLabel}
                </Button>
              ) : null;
            })()}
        </>
      )}
    </Form.List>
  );
}

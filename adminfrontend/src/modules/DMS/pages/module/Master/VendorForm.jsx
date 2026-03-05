// forms/VendorForm.jsx
import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
  InputNumber,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { addvendor } from "../../../../../api/bussinesspatnr";

const { Option } = Select;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-10 w-full";

export default function VendorForm({ disabled = false, form, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // ✅ Submit handler
  // const onFinish = async (values) => {
  //   try {
  //     setLoading(true);

  //     // ✅ Backend payload mapping (MATCHING YOUR POSTMAN JSON)
  //     const payload = {
  //       name: values?.name || "",
  //       short_name: values?.shortName || "",
  //       is_active: values?.status === "Active",

  //       contact_person_input: {
  //         name: values?.contactPerson || "",
  //         contact_person_no: values?.contactMobile || "",
  //         gender: values?.gender || "",
  //         contact_person_whats_no: values?.contactWhatsapp || "",
  //         contract_person_email: values?.contactEmail || "",
  //         adhara_no: values?.aadharNo || "",
  //         adhara_documents: [],
  //       },

  //       addresses: [
  //         {
  //           address_line1: values?.address1 || "",
  //           state: values?.state || "",
  //           district: values?.district || "",
  //           city: values?.city || "",
  //           location: values?.location || values?.city || "",
  //           pin: values?.pinCode || "",
  //         },
  //       ],

  //       plants: (values?.plants || []).map((p) => ({
  //         name: p?.plantName || "",
  //         address: p?.address || "",
  //         phone_number: p?.phoneNo || "",
  //         email_address: p?.email || "",
  //         state: p?.state || "",
  //         district: p?.district || "",
  //         city: p?.city || "",
  //         pin: p?.pin || "",
  //       })),

  //       tax: {
  //         pan: values?.panNo || "",
  //         gstin: values?.gstIn || "",
  //         tin_no: values?.tinNo || "",
  //         tin_date: values?.tinDate
  //           ? dayjs(values.tinDate).format("YYYY-MM-DD")
  //           : null,
  //         igst_applicable: values?.igstApplicable === "Yes",
  //       },
  //     };

  //     console.log("POST PAYLOAD =>", payload);

  //     // ✅ API call
  //     const res = await addvendor(payload);

  //     message.success("Vendor created successfully!");
  //     console.log("API Response =>", res);

  //     form.resetFields();

  //     // Call onSuccess callback to refresh the vendor list
  //     if (onSuccess) {
  //       onSuccess();
  //     }
  //   } catch (error) {
  //     console.error("POST ERROR =>", error);

  //     // show full backend validation errors
  //     console.log("Backend Response =>", error?.response?.data);

  //     const backendError =
  //       error?.response?.data?.message ||
  //       error?.response?.data?.detail ||
  //       "Failed to create vendor";

  //     message.error(backendError);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    // <Form
    //   form={form}
    //   layout="vertical"
    //   onFinish={onFinish}
    //   initialValues={{
    //     status: "Active",
    //     igstApplicable: "No",
    //   }}
    // >
    <>
      {/* ===== Vendor Details Card (Company + Short name + Primary contact info) ===== */}
      <Card className="mb-4 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          Vendor / Company Details
        </h3>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Company Name"
              name="name"
              rules={[{ required: true, message: "Company name is required" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter Company name"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Short Name"
              name="shortName"
              rules={[{ required: true }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Add a company Short name"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Mobile No 1"
              name="mobileNo1"
              rules={[
                { required: true, message: "Mobile number is required" },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <InputNumber
                className={inputClass}
                disabled={disabled}
                placeholder="9984568331"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Mobile No 2"
              name="mobileNo2"
              rules={[
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="7984568331"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Primary Email"
              name="email1"
              rules={[
                { required: true, message: "Primary email is required" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="example@gmail.com"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Secondary Email"
              name="email2"
              rules={[
                { message: "Secondary email is required" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="example@gmail.com"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="WhatsApp No"
              name="whatsappNo"
              rules={[
                { message: "Mobile number is required" },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <InputNumber
                className={inputClass}
                disabled={disabled}
                placeholder="9984568331"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Social Link"
              name="socialLink"
              rules={[{ type: "url", message: "Please enter a valid URL" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="https://www.facebook.com/"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Company Website"
              name="websiteUrl"
              rules={[{ type: "url", message: "Please enter a valid URL" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="https://www.example.com"
              />
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
            <Form.Item
              label="Contact Person Name"
              name="contactPerson"
              rules={[{ required: true }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Mr. John Doe"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Mobile No"
              name="contactMobile"
              rules={[
                { required: true, message: "Mobile number is required" },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <InputNumber
                className={inputClass}
                disabled={disabled}
                placeholder="9984568331"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="WhatsApp No" name="contactWhatsapp">
              <InputNumber
                className={inputClass}
                disabled={disabled}
                placeholder="9984568331"
                style={{ width: "100%" }}
              />
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
            <Form.Item
              label="Email"
              name="contactEmail"
              rules={[
                { required: true, message: "Email is required" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="example@gmail.com"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Aadhar No"
              name="aadharNo"
              rules={[
                {
                  message: "Please enter a valid 12-digit Aadhar number",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="123456789012"
                maxLength={14}
              />
            </Form.Item>
          </Col>

          {/* NOTE: File inputs not sent in JSON payload */}
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
            <Form.Item
              label="TIN No"
              name="tinNo"
              rules={[
                {
                  pattern: /^[A-Z0-9]{11,15}$/,
                  message: "Please enter a valid TIN number",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="TIN1234567890"
              />
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
            <Form.Item label="PAN No" name="panNo" rules={[]}>
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="PAN1234567890"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="PAN Document" name="panDoc">
              <Input type="file" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="GSTIN No"
              name="gstIn"
              rules={[
                {
                  message: "Please enter a valid GSTIN number",
                },
              ]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="GSTIN1234567890"
              />
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
            <Form.Item
              label="Address Line 1"
              name="address1"
              rules={[{ required: true, message: "Missing Address Line 1" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter Address Line 1"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Address Line 2" name="address2">
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter Address Line 2"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter Location"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true.valueOf, message: "Missing City" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter State"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="District"
              name="district"
              rules={[{ required: true.valueOf, message: "Missing City" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter District"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="City"
              name="city"
              rules={[{ required: true.valueOf, message: "Missing City" }]}
            >
              <Input
                className={inputClass}
                disabled={disabled}
                placeholder="Enter City"
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Pin Code"
              name="pinCode"
              rules={[
                {
                  pattern: /^[0-9]{6}$/,
                  message: "Please enter a valid Pin Code",
                },
              ]}
            >
              <InputNumber
                className={inputClass}
                disabled={disabled}
                placeholder="Enter Pin Code"
              />
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
                <Option value="OWN">OWN</Option>
                <Option value="RENT">RENT</Option>
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
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  title={
                    <span className="text-amber-700">Plant {index + 1}</span>
                  }
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
                        label="Plant Name"
                        rules={[
                          { required: true, message: "Missing Plant Name" },
                        ]}
                      >
                        <Input
                          disabled={disabled}
                          placeholder="Enter Plant Name"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "address"]}
                        label="Address"
                      >
                        <Input
                          disabled={disabled}
                          placeholder="Enter Plant Address"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "phoneNo"]}
                        label="Phone No"
                        rules={[
                          {
                            required: true,
                            message: "Mobile number is required",
                          },
                          {
                            pattern: /^[6-9]\d{9}$/,
                            message: "Enter a valid 10-digit mobile number",
                          },
                        ]}
                      >
                        <InputNumber
                          disabled={disabled}
                          placeholder="Enter Phone Number"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "email"]}
                        label="Email"
                        rules={[
                          {
                            required: true,
                            message: "Secondary email is required",
                          },
                          {
                            type: "email",
                            message: "Please enter a valid email address",
                          },
                        ]}
                      >
                        <Input disabled={disabled} placeholder="Enter Email" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "state"]}
                        label="State"
                      >
                        <Input disabled={disabled} placeholder="Enter State" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "district"]}
                        label="District"
                        rules={[
                          { required: true, message: "Missing district" },
                        ]}
                      >
                        <Input
                          disabled={disabled}
                          placeholder="Enter District"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "city"]}
                        label="City"
                        rules={[
                          { required: true.valueOf, message: "Missing City" },
                        ]}
                      >
                        <Input disabled={disabled} placeholder="Enter City" />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "pin"]}
                        label="Pin"
                        rules={[
                          {
                            pattern: /^[0-9]{6}$/,
                            message: "Please enter a valid Pin Code",
                            required: true,
                          },
                        ]}
                      >
                        <InputNumber
                          disabled={disabled}
                          placeholder="Enter Pin"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "faxNo"]}
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

      {/* ✅ Submit Button */}
      {/* {!disabled && (
        <div className="flex justify-end mt-4">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Vendor
          </Button>
        </div>
      )} */}
    </>
    // </Form>
  );
}
